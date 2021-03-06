var Graph = function (e, m, c, p, exp) {
// private attributes
  var model = m;
  var classes = c;
  var project = p;
  var experiment = exp;

  // joint objects
  var graph = new joint.dia.Graph;
  var paper = new joint.dia.Paper({
    el: e,
    width: 1024,
    height: 800,
    gridSize: 1,
    model: graph,
    snapLinks: true,
    linkPinning: false,
    embeddingMode: true,
    highlighting: {
      'default': {
        name: 'stroke',
        options: {
          padding: 6
        }
      },
      'embedding': {
        name: 'addClass',
        options: {
          className: 'highlighted-parent'
        }
      }
    },
    validateEmbedding: function (childView, parentView) {
      return parentView.model instanceof joint.shapes.devs.Coupled;
    },
    validateConnection: function (sourceView, sourceMagnet, targetView, targetMagnet) {
      return sourceMagnet != targetMagnet;
    }
  });
  var editor;
  var coupled;
  var atomicModels = {};
  var path = [];

  joint.shapes.devs.NewAtomic = joint.shapes.devs.Atomic.extend({
    defaults: joint.util.deepSupplement({
      markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/></g>',
      portMarkup: '<path class="port-body" d="M -5 -10 5 -10 5 10 -5 10 z" magnet="true"/>',
      type: 'devs.NewAtomic'
    }, joint.shapes.devs.Atomic.prototype.defaults)
  });
  joint.shapes.devs.NewCoupled = joint.shapes.devs.Coupled.extend({
    defaults: joint.util.deepSupplement({
      markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/></g>',
      portMarkup: '<path class="port-body" d="M -5 -10 5 -10 5 10 -5 10 z" magnet="true"/>',
      type: 'devs.NewCoupled'
    }, joint.shapes.devs.Coupled.prototype.defaults)
  });
  joint.shapes.devs.NewModelView = joint.shapes.devs.ModelView;

// private methods
  var build_conditions_modal = function () {
    var modal = $('<div/>', {
      class: 'modal fade',
      id: 'conditionsModal',
      'aria-hidden': 'true'
    });
    var modalDialog = $('<div/>', {class: 'modal-dialog modal-lg'});
    var modalContent = $('<div/>', {class: 'modal-content'});
    var modalBody = $('<div/>', {class: 'modal-body'});

    $('<div/>', {id: 'conditionEditor', style: 'width:600px; height:500px'}).appendTo(modalBody);

    var buttonDiv = $('<div/>', {class: 'btn-group'});

    build_ok_cancel_buttons(buttonDiv, 'javascript:this.document.graph.okConditions();');
    buttonDiv.appendTo(modalBody);

    modalBody.appendTo(modalContent);
    modalContent.appendTo(modalDialog);
    modalDialog.appendTo(modal);
    $('#main').prepend(modal);

    var container = document.getElementById('conditionEditor');
    var options = {
      mode: 'tree',
      search: false
    };
    editor = new JSONEditor(container, options);
  };

  var build_text_input = function (text, id, value) {
    var groupDiv = $('<div/>', {class: 'form-group'});
    var div = $('<div/>', {class: 'input-group'});

    $('<div />', {class: 'input-group-addon', text: text}).appendTo(div);
    $('<input />', {class: 'form-control', type: 'text', id: id, value: value}).appendTo(div);
    div.appendTo(groupDiv);
    return groupDiv;
  };

  var build_ok_cancel_buttons = function (buttonDiv, okHref) {
    $('<a/>', {
      class: 'btn btn-warning btn-md',
      href: '#',
      'data-dismiss': 'modal',
      html: 'Cancel'
    }).appendTo(buttonDiv);
    $('<a/>', {
      class: 'btn btn-primary btn-md',
      href: okHref,
      html: 'OK'
    }).appendTo(buttonDiv);
  };

  var build_project_modal = function () {
    var modal = $('<div/>', {
      class: 'modal fade',
      id: 'projectModal',
      'aria-hidden': 'true'
    });
    var modalDialog = $('<div/>', {class: 'modal-dialog modal-sm'});
    var modalContent = $('<div/>', {class: 'modal-content'});
    var modalHeader = $('<div/>', {class: 'modal-header'});
    var modalBody = $('<div/>', {class: 'modal-body'});

    $('<h4/>', {class: 'modal-title', text: 'Model'}).appendTo(modalHeader);

    var formDiv = $('<form/>', {class: 'form-inline'});

    build_text_input('Author', 'author', project.author).appendTo(formDiv);
    build_text_input('Date', 'date', project.date).appendTo(formDiv);
    build_text_input('Version', 'version', project.version).appendTo(formDiv);

    $('<br/><br/>').appendTo(formDiv);

    var buttonDiv = $('<div/>', {class: 'btn-group'});

    build_ok_cancel_buttons(buttonDiv, '#');
    buttonDiv.appendTo(formDiv);

    formDiv.appendTo(modalBody);
    modalHeader.appendTo(modalContent);
    modalBody.appendTo(modalContent);
    modalContent.appendTo(modalDialog);
    modalDialog.appendTo(modal);
    $('#main').prepend(modal);
  };

  var connect = function (source, sourcePort, target, targetPort) {
    var link = new joint.shapes.devs.Link({
      source: {id: source.id, port: sourcePort},
      target: {id: target.id, port: targetPort},
      router: {name: 'metro'},
      connector: {name: 'rounded'},
      attrs: {
        '.marker-target': {
          fill: '#333333',
          d: 'M 10 0 L 0 5 L 10 10 z'
        }
      }
    });

    link.addTo(graph).reparent();
  };

  var add_sub_model = function (parent, child, child_geometry, index) {
    var inPorts = child.in || [];
    var outPorts = child.out || [];
    var geometry = child_geometry || {
        position: {
          x: 20 + index * 100,
          y: 20
        },
        size: {
          width: 100,
          height: 30 + (inPorts.length > outPorts.length ? inPorts.length : outPorts.length) * 25
        }
      };

    if (child.dynamics || typeof child.dynamics === "string") {
      atomicModels[child.model] = new joint.shapes.devs.NewAtomic({
        position: geometry.position,
        size: geometry.size,
        inPorts: inPorts,
        outPorts: outPorts,
        attrs: {
          '.label': {text: child.model}
        }
      });
    } else {
      atomicModels[child.model] = new joint.shapes.devs.NewCoupled({
        position: geometry.position,
        size: geometry.size,
        inPorts: inPorts,
        outPorts: outPorts,
        attrs: {
          '.label': {text: child.model}
        }
      });
    }

    graph.addCell(atomicModels[child.model]);
    parent.embed(atomicModels[child.model]);
  };

  var build_graph = function (root) {
    var geometry = {
      position: {
        x: 50,
        y: 50
      },
      size: {
        width: 800,
        height: 700
      }
    };
    var i;

    coupled = new joint.shapes.devs.NewCoupled({
      position: geometry.position,
      size: geometry.size,
      inPorts: root.in || [],
      outPorts: root.out || [],
      attrs: {'.label': {text: root.model}}
    });
    graph.addCell(coupled);
    for (i = 0; i < root.submodels.length; i++) {
      var child = root.submodels[i];

      if (child.model) {
        add_sub_model(coupled, child, child.geometry, i);
      } else if (child.use) {
        add_sub_model(coupled, classes[child.use], child.geometry || classes[child.use].geometry, i);
      }
    }
    if (root.connections.internals) {
      for (i = 0; i < root.connections.internals.length; i++) {
        var originModel = atomicModels[root.connections.internals[i].from.model];
        var originPort = root.connections.internals[i].from.port;
        var destinationModel = atomicModels[root.connections.internals[i].to.model];
        var destinationPort = root.connections.internals[i].to.port;

        connect(originModel, originPort, destinationModel, destinationPort);
      }
    }
    if (root.connections.inputs) {
      for (i = 0; i < root.connections.inputs.length; i++) {
        var originPort = root.connections.inputs[i].from;
        var destinationModel = atomicModels[root.connections.inputs[i].to.model];
        var destinationPort = root.connections.inputs[i].to.port;

        connect(coupled, originPort, destinationModel, destinationPort);
      }
    }
    if (root.connections.outputs) {
      for (i = 0; i < root.connections.outputs.length; i++) {
        var originModel = atomicModels[root.connections.outputs[i].from.model];
        var originPort = root.connections.outputs[i].from.port;
        var destinationPort = root.connections.outputs[i].to;

        connect(originModel, originPort, coupled, destinationPort);
      }
    }
  };

  var search_model = function () {
    var root = model;
    var i = 0;

    while (root && i < path.length) {
      var j = 0;
      var found = false;

      while (!found && j < root.submodels.length) {
        if (root.submodels[j].model === path[i]) {
          found = true;
        } else if (root.submodels[j].use && classes[root.submodels[j].use].model === path[i]) {
          found = true;
        } else {
          ++j;
        }
      }
      if (found) {
        if (root.submodels[j].model) {
          root = root.submodels[j];
        } else {
          root = classes[root.submodels[j].use];
        }
        ++i;
      } else {
        root = null;
      }
    }
    return root;
  };

  var setModelGeometry = function (name, position, size) {
    var root = search_model();
    var i = 0;
    var found = false;

    while (!found && i < root.submodels.length) {
      if (root.submodels[i].model === name) {
        root.submodels[i].geometry = {position: position, size: size};
        found = true;
      } else if (root.submodels[i].use && classes[root.submodels[i].use].model === name) {
        root.submodels[i].geometry = {position: position, size: size};
        found = true;
      } else {
        ++i;
      }
    }
  };

  var setConnectionGeometry = function (source, target, vertices) {
    var root = search_model();
    var s = graph.getCell(source.id).attributes.attrs[".label"].text;
    var t = graph.getCell(target.id).attributes.attrs[".label"].text;
    var i = 0;
    var found = false;

    while (!found && i < root.connections.internals.length) {
      if (root.connections.internals[i].from.model === s && root.connections.internals[i].from.port === source.port &&
        root.connections.internals[i].to.model === t && root.connections.internals[i].to.port === target.port) {
        root.connections.internals[i].geometry = vertices;
        found = true;
      } else {
        ++i;
      }
    }
  };

  var init = function () {
    build_conditions_modal();
    if (model) {
      build_project_modal();
      build_graph(model);
    }
    paper.on('cell:pointerdblclick', onClick);
    graph.on('change:source change:target', onCreateLink);
    graph.on('change:position', function (element) {
      var name = element.attributes.attrs[".label"].text;

      setModelGeometry(name, atomicModels[name].prop('position'), atomicModels[name].prop('size'));
    });
    graph.on('change:vertices', function (element) {
      setConnectionGeometry(element.get('source'), element.get('target'), element.get('vertices'));
    });
  };

  var onCreateLink = function (link) {
    if (link.get('source').id && link.get('target').id) {
      var source = graph.get('cells').find(function (cell) {
        return cell.id === link.get('source').id;
      });
      var target = graph.get('cells').find(function (cell) {
        return cell.id === link.get('target').id;
      });

      var root = search_model();

      if (!root.connections.hasOwnProperty("internals")) {
        root.connections["internals"] = [];
      }
      root.connections.internals.push({
        from: {
          model: source.attributes.attrs[".label"].text,
          port: link.get('source').port
        },
        to: {
          model: target.attributes.attrs[".label"].text,
          port: link.get('target').port
        }
      });

      link.set('router', {name: 'metro'});
      link.set('connector', {name: 'rounded'});
      link.set('attrs', {
        '.marker-target': {
          fill: '#333333',
          d: 'M 10 0 L 0 5 L 10 10 z'
        }
      });
    }
  };

  var onClick = function (view, evt, x, y) {
    if (view.model.attributes.type === "devs.NewAtomic") {
      var atomic_model_name = view.model.attributes.attrs['.label'].text;
      var scope = angular.element($("#model-view")).scope();
      var found = false;
      var index = 0;
      var submodel = null;

      root = search_model();
      while (!found && index < root.submodels.length) {
        if (root.submodels[index].model == atomic_model_name) {
          submodel = root.submodels[index];
          found = true;
        }
        if (root.submodels[index].use == atomic_model_name) {
          // TODO: find class
        } else {
          ++index;
        }
      }
      if (submodel) {
        scope.$apply(function () {
          scope.atomic(submodel);
        });
      }
    } else if (view.model.attributes.type === "devs.NewCoupled") {
      var coupled_model_name = view.model.attributes.attrs['.label'].text;
      var root = null;

      path.push(coupled_model_name);
      root = search_model();
      if (root) {
        graph.clear();
        atomicModels = {};
        build_graph(root);
      }
    }
  };

  var build_name = function () {
    var name = 'new_';
    var index = 1;
    var root = search_model();
    var ok = false;

    while (!ok) {
      var i = 0;
      var found = false;

      while (!found && i < root.submodels.length) {
        if (root.submodels[i].model === name + index) {
          found = true;
        } else {
          ++i;
        }
      }
      if (found) {
        ++index;
      } else {
        ok = true;
      }
    }
    return name + index;
  };

// public methods
  this.model = function () {
    return model;
  };

  this.add_atomic = function () {
    var name = build_name();
    var root = search_model();
    var geometry = {
      position: {
        x: 50 + 20,
        y: 50 + 20
      },
      size: {
        width: 100,
        height: 55
      }
    };
    var atomic = new joint.shapes.devs.NewAtomic({
      position: geometry.position,
      size: geometry.size,
      inPorts: ['in'],
      outPorts: ['out'],
      attrs: {
        '.label': {text: name}
      }
    });

    graph.addCell(atomic);
    coupled.embed(atomic);
    atomicModels[name] = atomic;
    root.submodels.push({
      model: name,
      geometry: geometry,
      conditions: [],
      dynamics: "",
      observables: "",
      in: ['in'],
      out: ['out']
    });
  };

  this.add_coupled = function () {
    var name = build_name();
    var root = search_model();
    var geometry = {
      position: {
        x: 50 + 20,
        y: 50 + 20
      },
      size: {
        width: 100,
        height: 55
      }
    };
    var c = new joint.shapes.devs.NewCoupled({
      position: geometry.position,
      size: geometry.size,
      inPorts: ['in'],
      outPorts: ['out'],
      attrs: {
        '.label': {text: name}
      }
    });

    graph.addCell(c);
    coupled.embed(c);
    atomicModels[name] = c;
    root.submodels.push({
      model: name,
      geometry: geometry,
      in: ['in'],
      out: ['out']
    });
  };

  this.conditions = function () {
    editor.set(experiment.conditions);
    $('#conditionsModal').modal('show');
  };

  this.okConditions = function () {
    $('#conditionsModal').modal('hide');
    experiment.conditions = editor.get();
  };

  this.project = function () {
    $('#projectModal').modal('show');
  };

  this.up = function () {
    if (path.length > 0) {
      var root = null;

      path.pop();
      root = search_model();
      if (root) {
        graph.clear();
        atomicModels = {};
        build_graph(root);
      }
    }
  };

  this.refresh = function () {
    var root = search_model();

    if (root) {
      graph.clear();
      atomicModels = {};
      build_graph(root);
    }
  };

  init();
};