(function () {
    var widget = Retina.Widget.extend({
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
	    Retina.load_renderer(widget.params.type, true);
	}

	if (! widget.params.settings.data) {
	    widget.params.target.innerHTML = "- no data -";
	    return widget;
	}
	
	widget.d = jQuery.extend(true, {}, widget.params.settings);

	var cDiv = widget.controlDiv = document.createElement('div');
	widget.displayDiv = document.createElement('div');
	widget.d.target = widget.displayDiv;
	widget.renderer = Retina.Renderer.create(widget.params.type, widget.d);
	widget.params.width = widget.params.width || 800;

	var html = '<div class="accordion" id="RendererController_accordion'+index+'" style="width: '+widget.params.width+'px; margin-bottom: 20px;">';

	for (var i=0; i<widget.params.controls.length; i++) {
	    var groupname = Retina.keys(widget.params.controls[i])[0];
	    var group = widget.params.controls[i][groupname];

	    html += '\
<div class="accordion-group">\
  <div class="accordion-heading">\
    <a class="accordion-toggle" data-toggle="collapse" data-parent="#RendererController_accordion'+index+'" href="#RendererController_collapse_'+index+'_'+i+'">'+groupname+'</a>\
  </div>\
  <div id="RendererController_collapse_'+index+'_'+i+'" class="accordion-body collapse">\
    <div class="accordion-inner">\
      <table>\
';
	    for (var h=0; h<group.length; h++) {
		var opt = group[h];
		opt.index = index;
		html += "<tr><td style='text-align: right; vertical-align: middle;'>"+opt.title+"</td><td style='padding-left: 10px; text-align: left;'>";
		try {
		    html += widget["inputRender"+opt.type](opt);
		} catch (error) {
		    //console.log(opt.type);
		}
		html += "</td><td style='padding-left: 10px; text-align: left; vertical-align: middle;'>"+opt.description+"</td></tr>";
	    }
	    html += '\
      </table>\
    </div>\
  </div>\
</div>';

	}

	html += "</div>";
	cDiv.innerHTML = widget.params.noControl ? "" : html;

	widget.params.target.innerHTML = "";
	widget.params.target.appendChild(widget.controlDiv);
	widget.params.target.appendChild(widget.displayDiv);

	widget.renderer.render();

	return widget;
    };

    widget.updateRendererAttribute = function(name, value) {
	var widget = this;

	if (typeof widget.renderer.updateAttribute == "function") {
	    widget.renderer.updateAttribute(name, value);
	} else {
	    widget.renderer.settings[name] = value;
	}

	widget.renderer.render();
    };
    
    // input render functions
    widget.inputRendercolor = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].updateRendererAttribute(\""+opt.name+"\",this.value);'>";
    };

    widget.inputRenderfloat = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].updateRendererAttribute(\""+opt.name+"\", parseFloat(this.value));'>";
    };

    widget.inputRendertext = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].updateRendererAttribute(\""+opt.name+"\", this.value)'>";
    };
    
    widget.inputRenderfontsize = function (opt) {
	return "<input type='text' style='margin-bottom: 0px;' value='"+(Retina.WidgetInstances.RendererController[opt.index].renderer.settings[opt.name] || "")+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].updateRendererAttribute(\""+opt.name+"\", this.value);'>";
    };
    
    widget.inputRenderint = function (opt) {
	var val = eval( "Retina.WidgetInstances.RendererController["+opt.index+"].renderer.settings."+opt.name );
	return "<input type='text' style='margin-bottom: 0px;' value='"+val+"' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].updateRendererAttribute(\""+opt.name+"\", parseInt(this.value));'>";
    };

    widget.inputRenderbool = function (opt) {
	var html = "<select style='margin-bottom: 0px;' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].updateRendererAttribute(\""+opt.name+"\", (this.selectedIndex==0 ? true : false));'>";

	html += "<option"+(opt.defaultTrue ? " selected=selected" : "")+">yes</option><option"+(opt.defaultTrue ? "" : " selected=selected")+">no</option>";

	html += "</select>";
	return html;
    };

    widget.inputRenderselect = function (opt) {
	var html = "<select style='margin-bottom: 0px;' onchange='Retina.WidgetInstances.RendererController["+opt.index+"].updateRendererAttribute(\""+opt.name+"\", this.options[this.selectedIndex].value);'>";

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
