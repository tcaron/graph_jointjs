var jointGraph = (function() {
    var jointGraphCollection = {};
    var jointGraphPrototype = function(id) {
        this.id = id; //id du graph OBLIGATOIRE
        this.width = 800; //800 par défaut (si pas spécifié dans la config)
        this.height = 800; //800 par defaut (si pas spécifié dans la config)
        this.modelOptions = []; //tableau d'options pour creer un model
        this.states = {}; // tableau des états
        this.alreadyInit = false;

        this.adjustVertices = function (graph, cell) {
            // If the cell is a view, find its model.
            cell = cell.model || cell;
            if (cell instanceof joint.dia.Element) {
                _.chain(graph.getConnectedLinks(cell)).groupBy(function(link) {
                    // the key of the group is the model id of the link's source or target, but not our cell id.
                    return _.omit([link.get('source').id, link.get('target').id], cell.id)[0];
                }).each(function(group, key) {
                    // If the member of the group has both source and target model adjust vertices.
                    if (key !== 'undefined') adjustVertices(graph, _.first(group));
                });
                return;
            }
            // The cell is a link. Let's find its source and target models.
            var srcId = cell.get('source').id || cell.previous('source').id;
            var trgId = cell.get('target').id || cell.previous('target').id;
            // If one of the ends is not a model, the link has no siblings.
            if (!srcId || !trgId) return;
            var siblings = _.filter(graph.getLinks(), function(sibling) {
                var _srcId = sibling.get('source').id;
                var _trgId = sibling.get('target').id;
                return (_srcId === srcId && _trgId === trgId) || (_srcId === trgId && _trgId === srcId);
            });
            switch (siblings.length) {
                case 0:
                    // The link was removed and had no siblings.
                    break;
                case 1:
                    // There is only one link between the source and target. No vertices needed.
                    cell.unset('vertices');
                    break;
                default:
                    // There is more than one siblings. We need to create vertices.
                    var srcCenter = graph.getCell(srcId).getBBox().center();
                    var trgCenter = graph.getCell(trgId).getBBox().center();
                    var midPoint = g.line(srcCenter, trgCenter).midpoint();
                    var theta = srcCenter.theta(trgCenter);
                    var gap = 60;
                    _.each(siblings, function(sibling, index) {
                        var offset = gap * Math.ceil(index / 2);
                        var sign = index % 2 ? 1 : -1;
                        var angle = g.toRad(theta + sign * 90);
                        var vertex = g.point.fromPolar(offset, angle, midPoint);
                        sibling.set('vertices', [{
                            x: vertex.x,
                            y: vertex.y
                        }]);
                    });
            }
        }

        this.LinkWithSameDestination = function(source, target, label, vertices) {
            var cell = new joint.shapes.fsa.Arrow({
                source: {id: source.id },
                target: { id: target.id },
                labels: [{
                    position: .5,
                    attrs: {
                        text: {
                            text: label || '',
                            'font-weight': 'bold'
                        }
                    }
                }],
                vertices: vertices || []
            });
            return cell;
        }

     	this.init = function(){
     		var self = this;
     		var graph = new joint.dia.Graph;
       		var paper = new joint.dia.Paper({
            el: $("#" + this.id),
            width: 800,
            height: 800,
            model: graph,
            gridSize: 1,
            snapLinks: true,
            linkPinning: false,
        	});
        	var uml = joint.shapes.uml;
            joint.shapes.devs.Model = joint.shapes.devs.Model.extend({
            defaults: joint.util.deepSupplement({
                markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
                portMarkup: '<g class="port"><path class="port-body" d="M -5 -10 5 -10 5 10 -5 10 z"/></g>',
                type: 'devs.Model'
            }, joint.shapes.devs.Model.prototype.defaults)
            });
            joint.shapes.devs.NewModelView = joint.shapes.devs.ModelView;

        for (var model in this.modelOptions){

          var name = new joint.shapes.devs.Model({
            position: {
                x: this.modelOptions[model].xposition,
                y: this.modelOptions[model].yposition,
            },
            size: {
                width: 450,
                height: 500
            }
        });
            graph.addCell(name);
          for(var state in  this.modelOptions[model].state){

              var state = new uml.state({

                  position: {
                      x: 150,
                      y: 200
                  },
                  size: {
                      width: 100,
                      height: 100
                  },
                  name: "WAIT",
                  events: ["+@infini"],

              });
              graph.embed(name);
              graph.addCell(state);
          }

          for (var subModel in this.modelOptions[model].subModel){
            console.log(this.modelOptions[model].subModel[subModel]);
              var sub = new joint.shapes.devs.Model({
                  position: {
                      x: this.modelOptions[model].subModel[subModel].xposition,
                      y: this.modelOptions[model].subModel[subModel].yposition,
                  },
                  size: {
                      width: 50,
                      height: 50
                  }
              });
              graph.addCell(sub);
              name.embed(sub);

              for(var substate in  this.modelOptions[model].subModel.state){

                  substate = new uml.state({

                      position: {
                          x: 150,
                          y: 200
                      },
                      size: {
                          width: 100,
                          height: 100
                      },
                      name: "WAIT",
                      events: ["+@infini"],

                  });
                  graph.addCell(substate);
                  sub.embed(substate)
              }
          }
        }
        
        var myAdjustVertices = _.partial(this.adjustVertices, graph);
        this.alreadyInit = true;
        }	
    

        this.setParam = function(param, valeur, necessary) {
        	if (typeof necessary === "undefined") necessary = false;
        	if (typeof valeur !== 'undefined') this[param] = valeur;
            //les paramètres obligatoires doivent être null par défaut
        	else if (necessary && this[param] === null) throw new Error("Le paramètre '" + param + "' est manquant.");
        }

        this.getParam = function(param, valeur, defaut, necessary) {
            if (typeof necessary === "undefined") necessary = false;
            if (typeof valeur !== 'undefined') return valeur;
            else if (necessary) throw new Error("Le paramètre de configuration '" + param + "' est manquant.");
            else return defaut;
        }
        return this;   
    };

     return function(id,params)
    {
        if (typeof id === 'undefined') throw new Error("Le paramètre 'id' est manquant.");
        if (!(id in jointGraphCollection)) jointGraphCollection[id] = new jointGraphPrototype(id,params);
        if (typeof params !== 'undefined')
        {
            jointGraphCollection[id].setParam('id',params['id'],true);
            jointGraphCollection[id].setParam('width',params['width']);
             jointGraphCollection[id].setParam('height',params['height']);
            jointGraphCollection[id].setParam('modelOptions',params['modelOptions']);
            jointGraphCollection[id].setParam('alreadyInit',params['alreadyInit']);
        }
        if (!jointGraphCollection[id].alreadyInit) jointGraphCollection[id].init();
        return jointGraphCollection[id];
    }


})();