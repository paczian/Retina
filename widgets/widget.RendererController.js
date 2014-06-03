(function () {
    widget = Retina.Widget.extend({
	about: {
            title: "Renderer Controller",
            name: "RendererController",
	    version: 1,
            author: "Tobias Paczian",
            requires: []
        }
    });

    widget.setup = function () {
	return [];
    }

    widget.renderer = null;
    
    widget.display = function (params) {
	var widget = this;
	var index = widget.index;

	widget.params = widget.params || params;

	if (! Retina.RendererInstances.hasOwnProperty(widget.params.type)) {
	    Retina.add_renderer({"name": widget.params.type, "resource": "./renderers/",  "filename": "renderer."+widget.params.type+".js" }),
            Retina.load_renderer(widget.params.type).then(function () { Retina.WidgetInstances.RendererController[index].display() });
	    return;
	}

	if (! widget.d) {
	    widget.d = jQuery.extend(true, {}, Retina.RendererInstances[widget.params.type][0].settings);
	    widget.d.data = jQuery.extend(true, {}, Retina.RendererInstances[widget.params.type][0].exampleData());
	}
	var cDiv = widget.controlDiv = document.createElement('div');
	widget.displayDiv = document.createElement('div');
	widget.d.target = widget.displayDiv;
	widget.renderer = Retina.Renderer.create(widget.params.type, widget.d);
	widget.params.width = widget.params.width || 800;

	var html = "<table style='width: "+widget.params.width+"px;'>";
	
	for (var i in widget.renderer.about.options) {
	    if (widget.renderer.about.options.hasOwnProperty(i)) {
		var opt = widget.renderer.about.options[i];
		opt.name = i;
		opt.index = index;
		html += "<tr><td style='text-align: right; vertical-align: middle;'>"+opt.title+"</td><td style='padding-left: 10px; text-align: left;'>";
		try {
		    html += widget["inputRender"+opt.type](opt);
		} catch (error) {
		    console.log(opt.type);
		}
		html += "</td><td style='padding-left: 10px; text-align: left; vertical-align: middle;'>"+opt.description+"</td></tr>";
	    }
	}

	html += "</table>";
	cDiv.innerHTML = html;

	widget.params.target.innerHTML = "";
	widget.params.target.appendChild(widget.controlDiv);
	widget.params.target.appendChild(widget.displayDiv);

	widget.render(index);

	return widget;
    };

    widget.data = function (index, data) {
	var widget = Retina.WidgetInstances.RendererController[index];
	
	if (data) {
	    widget.d.data = data;
	    widget.renderer.settings.data = data;
	}

	return widget.d.data;
    };

    widget.render = function (index) {
	var widget = Retina.WidgetInstances.RendererController[index];

	widget.renderer.render();

	return widget;
    };

    // input render functions
    widget.inputRendercolor = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].renderer.settings."+opt.name+"=this.value;Retina.WidgetInstances.RendererController["+opt.index+"].renderer.render();'>";
    };

    widget.inputRenderfloat = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].renderer.settings."+opt.name+"=this.value;Retina.WidgetInstances.RendererController["+opt.index+"].renderer.render();'>";
    };

    widget.inputRendertext = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].renderer.settings."+opt.name+"=this.value;Retina.WidgetInstances.RendererController["+opt.index+"].renderer.render();'>";
    };
    
    widget.inputRenderfontsize = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].renderer.settings."+opt.name+"=this.value;Retina.WidgetInstances.RendererController["+opt.index+"].renderer.render();'>";
    };
    
    widget.inputRenderint = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].renderer.settings."+opt.name+"=this.value;Retina.WidgetInstances.RendererController["+opt.index+"].renderer.render();'>";
    };

    widget.inputRenderselect = function (opt) {
	var html = "<select style='margin-bottom: 0px;' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].renderer.settings."+opt.name+"=this.options[this.selectedIndex].value;Retina.WidgetInstances.RendererController["+opt.index+"].renderer.render();'>";

	for (var i=0; i<opt.options.length; i++) {
	    var selected = "";
	    var o = opt.options[i];
	    if (o.selected) {
		selected = " selected=selected";
	    }
	    html += "<option"+selected+" value='"+o.value+"'>"+(o.label || o.value)+"</option>";
	}

	html += "</select>";
	return html;
    };
})();
