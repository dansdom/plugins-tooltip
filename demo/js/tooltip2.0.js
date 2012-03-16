// note to self - I'm in the middle of fixing up the event handling namespace and the variables inside of it. 

/*
	jQuery Tooltip Plugin 1.4
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// Settings:
// toolID	- string;	 This is the custom ID for the tool tip. Used to create different styles for each tooltip on the page
// offsetY	- integer;	 This is the vertical offest of the tooltip from the mouse position
// offsetX	- integer;	 This is the horizontal offest of the tooltip from the mouse position
// domNode	- boolean;	 If true then it will look for a DOM node to inject into the tooltip
// ajax		- boolean;	 If true then it will look for an external resource and inject that content into the tooltip

// version 1.1 -	added option to make the tooltip static over the content
//					staticTool - true or false
//					staticPos - top, bottom, left, right

// version 1.2 -	fixed the timeout issue when elements are using the same tooltip ID
// version 1.3 -	added focus and blur events to the tooltip so that it can be used in forms
// version 2.0 - 	implmented new plugin architecture: https://github.com/dansdom/plugins-template-v2

(function ($) {
	// this ones for you 'uncle' Doug!
	'use strict';
	
	// Plugin namespace definition
	$.Tooltip = function (options, element, callback)
	{
		// wrap the element in the jQuery object
		this.el = $(element);
		// this is the namespace for all bound event handlers in the plugin
		this.namespace = "tooltip";
		// extend the settings object with the options, make a 'deep' copy of the object using an empty 'holding' object
		this.options = $.extend(true, {}, $.Tooltip.settings, options);
		this.init();
		// run the callback function if it is defined
		if (typeof callback === "function")
		{
			callback.call();
		}
	};
	
	// these are the plugin default settings that will be over-written by user settings
	$.Tooltip.settings = {
		toolID: 'tooltip',
		offsetY : 0,
		offsetX: 0,
		domNode: false,
		ajax: false,
		staticTool: false,
		staticPos: 'right',
		focusEvent : false
	};
	
	// plugin functions go here
	$.Tooltip.prototype = {
		init : function() {
			
			// going to need to define this, as there are some anonymous closures in this function.
			var tooltip = this,
				tool,
				html
				
			// check if the tooltip exists, if not then create it and then add it to the end of the document
			if ($("#" + this.options.toolID).length < 1) {
				tool = '<div id="' + this.options.toolID + '" style="position:absolute;z-index:1000;display:none;"></div>';
				$("body").append(tool);
			}
				
			this.el.content = this.el.attr("title");
			this.el.tool = $("#" + this.options.toolID);
			this.el.onEl = false;
			this.el.onFocus = false;
			this.el.onTool = false;
			
			// if the tooltip is a DOM node, then get the html that is in that selector
			if (this.options.domNode === true) {
				this.el.content = $(this.el.content).html();
			}
			
			// if the tooltip is an ajax call, then get the html from the external file
			if (this.options.ajax === true) {
				html = $.ajax({
					url: this.el.content,
					async: false
				}).responseText;
				this.el.content = html;
			}
			
			this.el.attr("title", "");
			this.el.contentHTML = this.el.attr("href");
			
			// putting this down below
			this.el.bind('mousemove.' + this.namespace, function (e) {
				// just to see where the mouse is pointing
				var cursorX = e.pageX,
					cursorY = e.pageY;
				// if the cursor is following the mouse then use the mousemove function to move the tooltip around
				if (tooltip.options.staticTool !== true) {
					tooltip.el.tool.css({"top": cursorY + tooltip.options.offsetY + "px", "left": cursorX + tooltip.options.offsetX + "px"});
				}
			});
					
			// mouseover function
			this.el.bind('mouseover.' + this.namespace, function () {
				tooltip.el.onEl = true;
				tooltip.showTip();
			});
					
			// mouseout function
			this.el.bind('mouseout.' + this.namespace, function () {
				if (tooltip.options.focusEvent && tooltip.el.onFocus === true) {
					return false;
				}
				tooltip.el.onEl = false;
				// if the tooltip is static then handle hiding it with a timer
				if (tooltip.options.staticTool === true && tooltip.el.onTool === false) {
					tooltip.hideTip();
				} else if (tooltip.options.staticTool === true && tooltip.el.onTool === true) {
					// do nothing
					// console.log("doing nothing - on El");
					return;
				} else {
					tooltip.hideTip();
				}
			});
					
			// adding events for focus and blur
			if (this.options.focusEvent === true) {
				this.el.bind('focus.' + this.namespace, function () {
					tooltip.el.onEl = true;
					tooltip.el.onFocus = true;
					tooltip.el.showTip();
				});

				this.el.bind('blur.' + this.namespace, function () {
					tooltip.el.onEl = false;
					tooltip.el.onFocus = false;
					tooltip.hideTip();
				});
			}
			
			// if the tooltip is static then handle hiding it with a timer
			this.el.tool.bind('mouseover.' + this.namespace, function () {
				tooltip.el.onTool = true;
			});
						 
			this.el.tool.bind('mouseout.' + this.namespace, function () {
				tooltip.el.onTool = false;
				if (tooltip.options.staticTool === true && tooltip.el.onEl === false) {
					tooltip.hideTip();
				} else if (tooltip.options.staticTool === true && tooltip.el.onEl === true) {
					// do nothing
					// console.log("doing nothing - on tool");
					return;
				} else {
					tooltip.hideTip();
				}
			});
			
		},
		option : function(args) {
			this.options = $.extend(true, {}, this.options, args);
		},
		showTip : function(arg) {
			// var toolNode = $("#"+opts.toolID);
			// show the tool tip for the DOM element
			// I will need to set up a DOM element to put the content of the tooltip into, and maybe set a position relative or 2
			this.el.tool.css("display", "block");
			//$("#"+opts.toolID).fadeIn(200);
			this.el.tool.html(this.el.content);

			// if the tooltip has a static position then calculate where it goes in relation to the offset of the DOM node,
			if (this.options.staticTool === true) {
				// 4 cases: top, bottom, left, right
				var elOffset = this.el.offset(),
					toolOffset = {},
					// find the size of the tooltip
					toolX = this.el.tool.outerWidth(),
					toolY = this.el.tool.outerHeight(),
					elX = this.el.outerWidth(),
					elY = this.el.outerHeight();
					//console.log("height: "+toolDimensionY+", width: "+toolDimensionX);
				switch (this.options.staticPos) {
				case "top":
					// console.log("top");					  
					toolOffset.Y = elOffset.top - toolY + this.options.offsetY;
					toolOffset.X = elOffset.left + this.options.offsetX;
					break;
				case "bottom":
					// console.log("bottom");
					toolOffset.Y = elOffset.top + elY + this.options.offsetY;
					toolOffset.X = elOffset.left + this.options.offsetX;
					break;
				case "left":
					// console.log("left");
					toolOffset.Y = elOffset.top + this.options.offsetY;
					toolOffset.X = elOffset.left - toolX + this.options.offsetX;
					break;
				case "right":
					//console.log("right");
					toolOffset.Y = elOffset.top + this.options.offsetY;
					toolOffset.X = elOffset.left + elX + this.options.offsetX;
					break;
				default:
					// do nothing
					break;
				}
				// console.log("offset Y: " + toolOffset.Y + ", offset X: " + toolOffset.X);
				// force the tool onto the page if the offset is outside of it				
				if (toolOffset.Y < 0) {
					toolOffset.Y = 0;
				}
				if (toolOffset.X < 0) {
					toolOffset.X = 0;
				}

				this.el.tool.css({"top": toolOffset.Y + "px", "left": toolOffset.X + "px"});
			}
		},
		hideTip : function () {
			// hide the tool tip
			// I will need to delete the DOM element that I created to house the content of the tool tip
			this.el.tool.css("display", "none");
		},
		destroy : function() {
			this.el.unbind("."+this.namespace);
		}
	};
	
	// the plugin bridging layer to allow users to call methods and add data after the plguin has been initialised
	// props to https://github.com/jsor/jcarousel/blob/master/src/jquery.jcarousel.js for the base of the code & http://isotope.metafizzy.co/ for a good implementation
	$.fn.tooltip = function(options, callback) {
		// define the plugin name here so I don't have to change it anywhere else. This name refers to the jQuery data object that will store the plugin data
		var pluginName = "tooltip",
			args;
		
		// if the argument is a string representing a plugin method then test which one it is
		if ( typeof options === 'string' ) {
			// define the arguments that the plugin function call may make 
			args = Array.prototype.slice.call( arguments, 1 );
			// iterate over each object that the function is being called upon
			this.each(function() {
				// test the data object that the DOM element that the plugin has for the DOM element
				var pluginInstance = $.data(this, pluginName);
				
				// if there is no data for this instance of the plugin, then the plugin needs to be initialised first, so just call an error
				if (!pluginInstance) {
					alert("The plugin has not been initialised yet when you tried to call this method: " + options);
					return;
				}
				// if there is no method defined for the option being called, or it's a private function (but I may not use this) then return an error.
				if (!$.isFunction(pluginInstance[options]) || options.charAt(0) === "_") {
					alert("the plugin contains no such method: " + options);
					return;
				}
				// apply the method that has been called
				else {
					pluginInstance[options].apply(pluginInstance, args);
				}
			});
			
		}
		// initialise the function using the arguments as the plugin options
		else {
			// initialise each instance of the plugin
			this.each(function() {
				// define the data object that is going to be attached to the DOM element that the plugin is being called on
				var pluginInstance = $.data(this, pluginName);
				// if the plugin instance already exists then apply the options to it. I don't think I need to init again, but may have to on some plugins
				if (pluginInstance) {
					pluginInstance.option(options);
					// initialising the plugin here may be dangerous and stack multiple event handlers. if required then the plugin instance may have to be 'destroyed' first
					//pluginInstance.init(callback);
				}
				// initialise a new instance of the plugin
				else {
					$.data(this, pluginName, new $.Tooltip(options, this, callback));
				}
			});
		}
		
		// return the jQuery object from here so that the plugin functions don't have to
		return this;
	};

	// end of module
})(jQuery);
