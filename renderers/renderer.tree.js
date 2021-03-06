/*
  Tree Renderer

  Displays a searchable, collapsible tree view. The nodes displayed in this tree must be
  an acyclic, directed, rooted graph.

  Options

  target (HTML Container Element)
      Element to render the table in.

  width (INT)
      Width of the tree container in pixels. Default is 366.

  height (INT)
      Height of the tree containerin pixels. Default is 366.

  indent (INT)
      Number of pixels to indent per level. Default is 10.

  showCollapseAllButton (BOOLEAN)
      Turn the collapse all button on / off. Default is true.

  showExpandAllButton (BOOLEAN)
      Turn the expand all button on / off. Default is true.

  showSearchBar (BOOLEAN)
      Turn the search bar on / off. Default is true.

  showSynonymsInDescription (BOOLEAN)
      Turn the display of the synonym list in the hover over description on / off.
      Default is true.

  showTooltip (BOOLEAN)
      Turn the display of the tooltip on / off. Default is true.

  showGoButton (BOOLEAN)
      Turn the display of the "go" button on / off. Default is true.

  buttonText (STRING)
      Text of the go button. Default is "go".

  sortNodes (BOOLEAN)
      Sort child nodes alphabetically. Default is false.

  searchDescription (BOOLEAN)
      Include the descriptions in the search. Default is false.

  tooltipStyle (STRING)
      Can be either "popover" or "plain", depending on how intrusive the tooltip should be. Default is popover.

  callback (FUNCTION)
      Function called when a node is selected. Passes the node object as a parameter.

  data (OBJECT)
      Content data structure. The top level must have the following attributes:
    - showRoot (BOOLEAN)
      Display the root node?
    - rootNode (STRING)
      The hash key of the root node in the node structure
    - nodes (HASH)
      Hash of content nodes. Each node must have the following attributes:
      - id (STRING)
      This must be the same as the hashkey of this node
      - label (STRING)
      The string to be displayed at this node
      - description (STRING)
      The text displayed in the hover over of the node
      -childNodes (ARRAY)
      Array of node ids of child nodes of this node
      - expanded (BOOLEAN - optional)
      Sets the initial expansion of the node. Default is false. The root node cannot be collapsed if hidden.
      - synonyms (ARRAY - optional)
      List of strings of synonyms for this node. These will cause a hit in the search.

  Functions

  Note: All functions require the index of the renderer to be passed as the first parameter.

  selectedNode ()
      Returns the currently selected node object or null if no node is selected.

  goTo (nodeId)
      Selects the node defined by nodeId, collapses all nodes and then expands all parents of the selected node.
*/
(function () {
    var renderer = Retina.Renderer.extend({
	about: {
	    name: "tree",
	    title: "Tree",
            author: "Tobias Paczian",
            version: "1.0",
	    requires: [],
	    defaults: {
		'width' : 366,
		'height': 366,
		'indent': 10,
		'showCollapseAllButton': true,
		'showExpandAllButton': true,
		'showSearchBar': true,
		'showSynonymsInDescription': true,
		'callback': null,
		'showTooltip': true,
		'tooltipStyle': "popover",
		'buttonText': 'go',
		'showGoButton': true,
		'desc2label': {}
	    },
	    options: [
	      { general:
		[
		    { name: 'showCollapseAllButton', type: 'bool', description: "display the button to collapse the entire tree?",
		      title: "show collapse all button", defaultTrue: true },
		    { name: 'showExpandAllButton', type: 'bool', description: "display the button to expand the entire tree?",
		      title: "show expand all button", defaultTrue: true },
		    { name: 'showSearchBar', type: 'bool', description: "display a searchbar?",
		      title: "show search bar", defaultTrue: true },
		    { name: 'showTooltip', type: 'bool', description: "display a tooltip for the entries?",
		      title: "show tooltip", defaultTrue: true },
		    { name: 'tooltipStyle', type: 'select', description: "style of the tooltip",
		      title: "tooltip style", options: [ 
			  { value: "popover", label: "popover", selected: true },
			  { value: "title", label: "title" } ] }
		]
	      },
	      { layout:
		[
		    { name: 'width', type: 'int', description: "width of the tree in pixel", title: "width" },
		    { name: 'height', type: 'int', description: "height of the tree in pixel", title: "height" },
		    { name: 'indent', type: 'int', description: "number of pixels to indent each level", title: "indentation" },
		]
	      }
	  ]
	},

	// example data to show the functionality of the tree renderer
	exampleData: function () {
	    return { "name": "testTree",
		     "version": 1,
		     "showRoot": false,
		     "rootNode": "root",
		     "nodes": { "root": { "id": "root",
					  "label": "root",
					  "description": "cool node",
					  "childNodes": [ "1", "2" ] },
				"1": { "id": "1",
				       "label": "node 1",
				       "description": "first node",
				       "synonyms": [ "Hans", "Dieter" ],
				       "childNodes": [ "3", "4" ] },
				"2": { "id": "2",
				       "label": "node 2",
				       "description": "second node",
				       "childNodes": [ "5" ] },
				"3": { "id": "3",
				       "label": "node 3",
				       "description": "third node",
				       "childNodes": [ "6", "7", "8" ] },
				"4": { "id": "4",
				       "label": "node 4",
				       "description": "fourth node",
				       "childNodes": [ "9" ] },
				"5": { "id": "5",
				       "label": "node 5",
				       "description": "fifth node",
				       "childNodes": [] },
				"6": { "id": "6",
				       "label": "node 6",
				       "description": "sixths node",
				       "childNodes": [] },
				"7": { "id": "7",
				       "label": "node 7",
				       "description": "seventh node",
				       "childNodes": [] },
				"8": { "id": "8",
				       "label": "node 8",
				       "description": "eighth node",
				       "childNodes": [] },
				"9": { "id": "9",
				       "label": "node 9",
				       "description": "nineth node",
				       "childNodes": [] }
			      }
		   }
	},

	render: function () {
	    renderer = this;
	    var index = this.index;

	    jQuery(".popover").remove();

	    // tree node styles
	    renderer.settings.target.innerHTML = "<style>\
.tree-node {\
  cursor: pointer;\
  color: #0088CC;\
  background-color: #FFFFFF;\
  border-radius: 3px;\
}\
.tree-node:hover {\
  color: #005580;\
  background-color: #F5F5F5;\
}\
.tree-node-selected {\
  cursor: pointer;\
  background-color: #0088CC;\
  color: #FFFFFF;\
  border-radius: 3px;\
}\
</style>";

	    if (! renderer.hasOwnProperty('parsedNodes')) {
		renderer.parsedNodes = {};
		renderer.settings.data.nodes[renderer.settings.data.rootNode].id = renderer.settings.data.rootNode;
		renderer.setParentNode(renderer.settings.data.nodes[renderer.settings.data.rootNode], null);
	    }

	    // check if a collapse all button should be displayed
	    if (renderer.settings.showCollapseAllButton) {
		var cB = document.createElement('button');
		cB.setAttribute("type", "button");
		cB.className = "btn btn-small";
		cB.innerHTML = "<icon class='icon-resize-small'></icon>";
		cB.setAttribute('style', "margin-bottom: 5px; margin-right: 5px;");
		cB.index = index;
		cB.addEventListener('click', function () {
		    var index = this.index;
		    Retina.RendererInstances.tree[index].collapseAll();
		});
		renderer.settings.target.appendChild(cB);
	    }

	    // check if an expand all button should be displayed
	    if (renderer.settings.showExpandAllButton) {
		var cB = document.createElement('button');
		cB.setAttribute("type", "button");
		cB.className = "btn btn-small";
		cB.innerHTML = "<icon class='icon-fullscreen'></icon>";
		cB.setAttribute('style', "margin-bottom: 5px; margin-right: 5px;");
		cB.index = index;
		cB.addEventListener('click', function () {
		    var index = this.index;
		    Retina.RendererInstances.tree[index].expandAll();
		});
		renderer.settings.target.appendChild(cB);
	    }

	    // check if a search bar should be displayed
	    if (renderer.settings.showSearchBar) {

		// initialize the typeahead array
		var typeAheadData = [];

		// initialize the node label to node id lookup hash
		var label2id = {};

		// fill the typeahead array and the lookup hash
		for (var i in renderer.settings.data.nodes) {

		    // check if the child nodes should be sorted
		    if (renderer.settings.sortNodes) {
			if (renderer.settings.data.nodes[i].childNodes) {
			    var cn = [];
			    for (var h=0; h<renderer.settings.data.nodes[i].childNodes.length; h++) {
				var n = renderer.settings.data.nodes[renderer.settings.data.nodes[i].childNodes[h]];
				cn.push({ 'label': n.label, 'id': renderer.settings.data.nodes[i].childNodes[h] });
			    }
			    cn = cn.sort(Retina.propSort('label'));
			    renderer.settings.data.nodes[i].childNodes = [];
			    for (var h=0; h<cn.length; h++) {
				renderer.settings.data.nodes[i].childNodes.push(cn[h].id);
			    }
			}
		    }
		    
		    if (renderer.settings.data.nodes.hasOwnProperty(i)) {
			typeAheadData.push(renderer.settings.data.nodes[i].label);
			label2id[renderer.settings.data.nodes[i].label] = i;

			if (renderer.settings.searchDescription) {
			    typeAheadData.push(renderer.settings.data.nodes[i].description);
			    label2id[renderer.settings.data.nodes[i].description] = i;
			    renderer.settings.desc2label[renderer.settings.data.nodes[i].description] = renderer.settings.data.nodes[i].label;
			}
			
			if (renderer.settings.data.nodes[i].hasOwnProperty('synonyms')) {
			    for (var h=0; h<renderer.settings.data.nodes[i].synonyms.length; h++) {
				typeAheadData.push(renderer.settings.data.nodes[i].synonyms[h]);
				label2id[renderer.settings.data.nodes[i].synonyms[h]] = i;
			    }
			}
		    }
		}

		// store the lookup hash in the settings
		renderer.settings.data.label2id = label2id;

		// create the searchbar div (input and button)
		var sB = document.createElement('div');
		sB.setAttribute('style', "float: left; margin-right: 5px;");
		sB.className = "input-append";
		sB.innerHTML = "<input type='text' index='"+index+"' style='width: 144px; height: 16px; font-size: 11.9px;' id='tree_search_input_"+index+"' autocomplete='off'>";
		if (renderer.settings.showGoButton) {
		    sB.innerHTML += "<button type='button' class='btn btn-small' onclick='Retina.RendererInstances.tree["+index+"].goTo();'>"+renderer.settings.buttonText+"</button>";
		}
		renderer.settings.target.appendChild(sB);

		// add a keypress listener
		document.getElementById('tree_search_input_'+index).addEventListener('keypress', function (event) {
		    var index = this.getAttribute('index');
		    event = event || window.event;
		    if (event.keyCode == '13') {
			Retina.RendererInstances.tree[index].goTo();
		    }
		});

		// add the typeahead to the input box
		jQuery('#tree_search_input_'+index).typeahead({ source: typeAheadData, updater: renderer.typeaheadUpdate });
	    }

	    // set the border style of the outer div
	    renderer.settings.target.setAttribute('style', renderer.settings.target.getAttribute('style')+"border: 1px solid #333333;"+(renderer.settings.width ? " width: "+renderer.settings.width+"px;" : "")+" overflow: auto;"+(renderer.settings.height ?" height: "+renderer.settings.height+"px;" : "")+" padding: 5px; border-radius: 3px;");

	    // create a space for the actual nodes
	    renderer.settings.nodeSpace = document.createElement('div');
	    var nodeSpaceHeight = "";
	    if (renderer.settings.showSearchBar || renderer.settings.showCollapseAll || renderer.settings.showExpandAll) {
		nodeSpaceHeight = " overflow: auto;"+(renderer.settings.height ?" height: "+(renderer.settings.height - 36)+"px;" : "");
	    }
	    renderer.settings.nodeSpace.setAttribute('style', "clear: both;"+nodeSpaceHeight);
	    renderer.settings.target.appendChild(renderer.settings.nodeSpace);
	    
	    // call the node rendering function
	    renderer.redraw();

	    return renderer;
	},

	typeaheadUpdate: function (item) {
	    var input = this.$element[0];
	    var id = input.getAttribute('id');
	    id = id.substring(id.lastIndexOf('_') + 1);
	    var renderer = Retina.RendererInstances.tree[id];
	    if (renderer.settings.desc2label.hasOwnProperty(item)) {
		item = renderer.settings.desc2label[item];
	    }
	    renderer.goTo(id, renderer.settings.data.label2id[item]);
	    return item;
	},

	// draws the current state of the nodes
	redraw: function () {
	    var renderer = this;
	    
	    // check if we are displaying the root node
	    var currIndent = -1;
	    var hide = true;
	    if (renderer.settings.data.showRoot) {
		currIndent = 0;
		hide = false;
	    } else {
		// the root node must always be expanded if hidden, otherwise there is nothing to be drawn
		renderer.settings.data.nodes[renderer.settings.data.rootNode].expanded = true;
	    }

	    // empty the node space, we are redrawing all visible nodes every time
	    renderer.settings.nodeSpace.innerHTML = "";

	    // initiate the first call to the recursive renderNode function
	    renderer.renderNode( { "node": renderer.settings.data.nodes[renderer.settings.data.rootNode],
				   "indent": currIndent,
				   "hide": hide } );

	    return renderer;
	},
	
	renderNode: function (params) {
	    var renderer = this;
	    
	    // create the node div and check if it is the current selection
	    var nodeDiv = document.createElement('div');
	    if (renderer.settings.selectedNode && renderer.settings.selectedNode == params.node.id) {
		nodeDiv.className = "tree-node-selected";
	    } else {
		nodeDiv.className = "tree-node";
	    }
	    renderer.settings.nodeSpace.appendChild(nodeDiv);

	    // if the node does not have the expanded property, set it to the default (false)
	    if (! params.node.hasOwnProperty('expanded')) {
		params.node.expanded = false;
	    }

	    // if this is the root node and supposed to be hidden, skip the rendering
	    if (! params.hide) {

		// set the indentation to the current level
		nodeDiv.setAttribute('style', "padding-left: "+(renderer.settings.indent * params.indent)+"px;");

		// initialize the node html
		var html = "";

		// if the node has children, it needs the expand / collapse graphic
		if (params.node.childNodes.length) {
		    if (params.node.expanded) {
			html += "<span style='cursor: pointer; margin-right: 5px;' onclick='Retina.RendererInstances.tree["+renderer.index+"].settings.data.nodes[\""+params.node.id+"\"].expanded=false;Retina.RendererInstances.tree["+renderer.index+"].redraw();'>&dtrif;</span>";
		    } else {
			html += "<span style='cursor: pointer; margin-right: 5px;' onclick='Retina.RendererInstances.tree["+renderer.index+"].settings.data.nodes[\""+params.node.id+"\"].expanded=true;Retina.RendererInstances.tree["+renderer.index+"].redraw();'>&rtrif;</span>";
		    }
		} else {

		    // the node has no expand / collapse graphic, move it over so it alligns
		    html += '<div style="float: left; height: 16px; width: 13px;"></div>';
		}

		// check for tooltip
		var tooltip = "";

		// remove nasty quotes from the label
		var label = params.node.label;
		label = label.replace(/'/g, "&apos;");
		label = label.replace(/"/g, "&quot;");

		// if we want a tooltip, add it
		if (renderer.settings.showTooltip) {

		    // the base tooltip text is the description.
		    var description = params.node.description;
		    
		    // check if we want the synonyms to be part of the tooltip
		    if (renderer.settings.showSynonymsInDescription && params.node.hasOwnProperty('synonyms') && params.node.synonyms.length) {
			description += "\n\nSynonyms:\n" + params.node.synonyms.join("\n");
		    }

		    // remove nasty quotes from the description
		    description = description.replace(/'/g, "&apos;");
		    description = description.replace(/"/g, "&quot;");
		    
		    // check for tooltip style, either popover or plain
		    if (renderer.settings.tooltipStyle == 'popover') {
			description = description.replace(/\n/g, "<br>");
			tooltip = "data-title='<span style=\"color: #333333;\">"+label+"</span>' data-html='true' data-content='<span style=\"color: #333333;\">"+description+"</span>' data-container='body' onmouseover='jQuery(this).popover(\"show\");' onmouseout='jQuery(this).popover(\"destroy\");' ";
		    } else {
			tooltip = "title='"+description+"' ";
		    }
		}

		// create the node label
		html += "<span "+tooltip+"onclick='Retina.RendererInstances.tree["+renderer.index+"].selectNode(\""+params.node.id+"\");'>"+label+"</span>";
		
		// add the node html to the node
		nodeDiv.innerHTML = html;
	    }
	    
	    // check if we have child nodes and are expanded, in that case, render the child nodes
	    if (params.node.childNodes.length && params.node.expanded) {

		// increment the indentation level
		params.indent++;

		// iterate over the child nodes and draw them with a recursive call to renderNode
		for (var i=0; i<params.node.childNodes.length; i++) {
		    var node = renderer.settings.data.nodes[params.node.childNodes[i]];
		    node.id = params.node.childNodes[i];
		    renderer.renderNode( { "node": node,
					   "indent": params.indent });
		}
	    }
	},

	// collapse all nodes
	collapseAll: function () {
	    var renderer = this;

	    for (var i in renderer.settings.data.nodes) {
		if (renderer.settings.data.nodes.hasOwnProperty(i)) {
		    renderer.settings.data.nodes[i].expanded = false;
		}
	    }

	    renderer.redraw();
	},

	// expand all nodes
	expandAll: function () {
	    var renderer = this;

	    for (var i in renderer.settings.data.nodes) {
		if (renderer.settings.data.nodes.hasOwnProperty(i)) {
		    renderer.settings.data.nodes[i].expanded = true;
		}
	    }

	    renderer.redraw();
	},

	// go to a specific node, select it, collapse all nodes and expand the selected nodes parent nodes
	goTo: function (nodeId) {
	    var renderer = this;

	    // collapse all nodes
	    for (var i in renderer.settings.data.nodes) {
		if (renderer.settings.data.nodes.hasOwnProperty(i)) {
		    renderer.settings.data.nodes[i].expanded = false;
		}
	    }
	    
	    // find the goto node
	    var id = nodeId || renderer.settings.data.label2id[document.getElementById('tree_search_input_'+renderer.index).value];
	    var node = renderer.settings.data.nodes[id];

	    if (! node) {
		return;
	    }

	    node.expanded = false;
	    renderer.settings.selectedNode = id;

	    // expand all parent nodes
	    while (node.parentNode != null) {
		node = renderer.settings.data.nodes[node.parentNode];
		node.expanded = true;
	    }
	    
	    // rerender the tree
	    renderer.redraw();

	    // check if someone wants to know about the selection
	    if (typeof renderer.settings.callback == 'function') {
		var node = renderer.settings.data.nodes[id];
		renderer.settings.callback.call(null, node);
	    }
	},

	// if the node structure does not contain the parent references, create them here
	setParentNode: function (node, parent) {
	    var renderer = this;

	    if (node.description === null) {
		node.description = node.label;
	    }
	    if (renderer.parsedNodes.hasOwnProperty(node.id)) {
	    	//console.log('recursive call: '+node.id+' - '+node.label);
	    	return;
	    } else {
	    	renderer.parsedNodes[node.id] = true;
	    }
	    
	    node.parentNode = parent;
	    for (var i=0; i<node.childNodes.length; i++) {
		renderer.settings.data.nodes[node.childNodes[i]].id = node.childNodes[i];
		renderer.setParentNode(renderer.settings.data.nodes[node.childNodes[i]], node.id);
	    }

	    return;
	},

	// select a specified node
	selectNode: function (nodeId) {
	    var renderer = this;

	    // set the selected node to the passed nodeId
	    renderer.settings.selectedNode = nodeId;

	    // check if we have a searchbar and if so, put the selected term into it
	    var input = document.getElementById("tree_search_input_"+renderer.index);
	    if (input) {
		input.value = renderer.settings.data.nodes[nodeId].label;
		input.focus();
	    }

	    // check if someone wants to know about the selection
	    if (typeof renderer.settings.callback == 'function') {
		var node = renderer.settings.data.nodes[nodeId];
		renderer.settings.callback.call(null, node);
	    }

	    // redraw with the new settings
	    renderer.redraw();
	},

	// returns the currently selected node
	selectedNode: function () {
	    var renderer = this;

	    return renderer.settings.selectedNode ? renderer.settings.data.nodes[renderer.settings.selectedNode] : null;
	}

    });
}).call(this);
