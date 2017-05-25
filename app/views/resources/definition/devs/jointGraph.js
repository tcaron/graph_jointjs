var jointGraph = (function() {
    var jointGraphCollection = {};
    var jointGraphPrototype = function(id) {
        this.id = id; //id du graph OBLIGATOIRE
        this.width = 800; //800 par défaut (si pas spécifié dans la config)
        this.height = 800; //800 par defaut (si pas spécifié dans la config)
        this.modelOptions = []; //tableau d'options pour creer un model
        this.stateOptions = []; // tableau d'options pour creer un etat
        this.linkOptions = []; // tableau d'options pour creer une connection
        this.dashstroke = false; // lien en pointillé par défaut à false
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

        var atomicModels = {};

        this.initModel = function (model,graph,parent) {
        var parent = parent || undefined ;
        atomicModels[this.modelOptions[model]] =  new joint.shapes.devs.Model({
                position: {
                    x: this.modelOptions[model].x,
                    y: this.modelOptions[model].y
                },
                size: {
                    width: this.modelOptions[model].width,
                    height: this.modelOptions[model].height
                },
                inPorts: [this.modelOptions[model].in],
                outPorts: [this.modelOptions[model].out],
                attrs: {
                    '.label': {
                        text: this.modelOptions[model].name ,
                        'ref-x': .5,
                        'ref-y': .0
                    },
                    rect: {
                        fill: '#D5CECC'
                    }
                }
            });

         graph.addCell( atomicModels[this.modelOptions[model]]);
         if(parent  != undefined) {
             parent.embed(atomicModels[this.modelOptions[model]]);
         }
        }

        var atomicLink={} ;
        this.initConnection = function(graph, link, source, target, parent){
            var parent = parent || undefined;
            if ( source.id != target.id) {
                atomicLink[this.linkOptions[link]] = new joint.shapes.uml.Transition({
                    source: {id: source.id}, target: {id: target.id},
                });
                atomicLink[this.linkOptions[link]].label(0, {
                    position: 0.5,
                    attrs: {
                        text: {
                            text: this.linkOptions[link].label,
                            'font-size': 14,
                            'font-family': 'san-serif'
                        }
                    }
                });
                if (this.linkOptions[link].dashstroke){
                    atomicLink[this.linkOptions[link]].attr({
                        '.connection': {
                            stroke: '#4b4a67',
                            'stroke-width': 2,
                            'stroke-dasharray': '5 4'
                        },
                    });
                }
            }
            else {
                atomicLink[this.linkOptions[link]] = this.LinkWithSameDestination(source,source,this.linkOptions[link].label, [{
                    x: 350,
                    y: 120
                }, {
                    x: 200,
                    y: 250
                }]);
            }
                graph.addCell( atomicLink[this.linkOptions[link]]);
                if(parent  != undefined) {
                    parent.embed(atomicLink[this.linkOptions[link]]);
                }
        }

        var atomicState = {};

        this.initState = function(graph,state,parent) {
            var parent = parent || undefined ;
            atomicState[this.stateOptions[state]] = new joint.shapes.uml.State({
                position: {
                    x:this.stateOptions[state].x ,
                    y:this.stateOptions[state].y
                },
                size: {
                    width: this.stateOptions[state].width,
                    height: this.stateOptions[state].height
                },
                name: this.stateOptions[state].name ,
                events: this.stateOptions[state].events,
            });
            graph.addCell(atomicState[this.stateOptions[state]]);
            console.log( atomicState[this.stateOptions[state]]);
            if(parent  != undefined) {
                parent.embed(atomicState[this.stateOptions[state]]);
            }
        }

        this.getModelByName = function(name){
            var _model;
            for ( var model in this.modelOptions ){
                    if (atomicModels[this.modelOptions[model]].attributes.attrs['.label'].text == name) {
                        return atomicModels[this.modelOptions[model]];
                }
            }
        };

        this.getElementByName = function(name){
         var _element = undefined;
            for(var model in this.modelOptions){
                if (atomicModels[this.modelOptions[model]].attributes.attrs['.label'].text == name) {
                    _element = atomicModels[this.modelOptions[model]];
                }
            }
            for(var state in this.stateOptions){
                if (atomicState[this.stateOptions[state]].attributes.name == name) {
                    _element = atomicState[this.stateOptions[state]];
                }
            }

            return _element ;
        }
     	this.init = function(){
     		var self = this;
     		var graph = new joint.dia.Graph;
     		var atomicModel = [];
       		var paper = new joint.dia.Paper({
            el: $("#" + this.id),
                width: this.width,
                height: this.height,
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
            joint.shapes.devs.Model = joint.shapes.devs.Model.extend({
            defaults: joint.util.deepSupplement({
                markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><text class="label"/><g class="inPorts"/><g class="outPorts"/></g>',
                portMarkup: '<g class="port"><path class="port-body" d="M -5 -10 5 -10 5 10 -5 10 z"/></g>',
                type: 'devs.Model'
            }, joint.shapes.devs.Model.prototype.defaults)
            });
            joint.shapes.devs.NewModelView = joint.shapes.devs.ModelView;

            for(var model in this.modelOptions){
                if (this.modelOptions[model].parent != undefined) {
                    this.initModel(model, graph, this.getModelByName(this.modelOptions[model].parent));
                }
                else{ this.initModel(model, graph); }
            }
            for (var state in this.stateOptions){
                if (this.stateOptions[state].parent != undefined) {
                    this.initState(graph,state,this.getModelByName(this.stateOptions[state].parent));
                }
                else{ this.initState(graph,state); }
            }

            for (var link in this.linkOptions){
                if (this.linkOptions[link].parent != undefined) {
                    this.initConnection(graph,link,this.getElementByName(this.linkOptions[link].source),this.getElementByName(this.linkOptions[link].target),this.getModelByName(this.linkOptions[link].parent));
                }
                else{ this.initConnection(graph,link,this.getElementByName(this.linkOptions[link].source),this.getElementByName(this.linkOptions[link].target)); }
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
            jointGraphCollection[id].setParam('stateOptions',params['stateOptions']);
            jointGraphCollection[id].setParam('linkOptions',params['linkOptions']);
            jointGraphCollection[id].setParam('alreadyInit',params['alreadyInit']);
        }
        if (!jointGraphCollection[id].alreadyInit) jointGraphCollection[id].init();
        return jointGraphCollection[id];
    }

})();