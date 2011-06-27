// jQuery Tooltip Plugin 1.0 - By Daniel Thomson
//
// settings:
// toolID   - string;    This is the custom ID for the tool tip. Used to create different styles for each tooltip on the page
// offsetY  - integer;   This is the vertical offest of the tooltip from the mouse position
// offsetX  - integer;   This is the horizontal offest of the tooltip from the mouse position
// domNode  - boolean;   If true then it will look for a DOM node to inject into the tooltip
// ajax     - boolean;   If true then it will look for an external resource and inject that content into the tooltip

//  version 1.1 - added option to make the tooltip static over the content
//  staticTool - true or false
//  staticPos - top, bottom, left, right


(function($){

	$.fn.tooltip = function(config)
	{
		// config - default settings
		var settings = {
                              //effect: 'fade',   - I don't think I want to add any visual effects now
                              //speed: 200,       - I don't think I want to add any visual effects now
                              toolID: 'tooltip',
                              offsetY : -20,
                              offsetX: -20,
                              domNode: false,
                              ajax: false,
                              staticTool: true,
                              staticPos: 'top'
					};

		// if settings have been defined then overwrite the default ones
		// comments:        true value makes the merge recursive. that is - 'deep' copy
		//                  {} creates an empty object so that the second object doesn't overwrite the first object
		//                  this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//				the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, settings, config);

		// check if the tooltip exists, if not then create it and then add it to the end of the document
		if ($("#"+opts.toolID).length < 1)
		{
		   var tooltip = '<div id="'+opts.toolID+'" style="position:absolute;z-index:1000;display:none;"></div>';
		   $("body").append(tooltip);
		}

		// iterate over each object that calls the plugin and do stuff
		this.each(function(){
			// do pluging stuff here
			// each box calling the plugin now has the variable name: myBox
			var el = $(this);
			el.content = el.attr("title");
			var timer;

			// if the tooltip is a DOM node, then get the html that is in that selector
			if (opts.domNode === true)
			{
                   el.content = $(el.content).html();

               }
               // if the tooltip is an ajax call, then get the html from the external file
               if (opts.ajax === true)
               {
                   var html = $.ajax({
                            url: el.content,
                            async: false
                       }).responseText;
                   el.content = html;
               }
			el.attr("title","");
			el.contentHTML = el.attr("href");


			$(document).mousemove(function(e)
               {
                   // just to see where the mouse is pointing
                   var cursorX = e.pageX;
                   var cursorY = e.pageY;
                   // this next line just for testing X and Y position of the mouse
                   //$("#mouse").html("<p class='x'>X : "+cursorX+"</p><p class='y'>Y : "+cursorY+"</p>");
                   // if the cursor is following the mouse then use the mousemove function to move the tooltip around
                   if (opts.staticTool !== true)
                   {
                       $("#"+opts.toolID).css({"top":cursorY+opts.offsetY+"px","left":cursorX+opts.offsetX+"px"});
                   }
               });

			// mouseover function
			el.mouseover(function()
			{

                   if (opts.staticTool === true)
                   {
                       //alert("over");
                       clearTimeout(timer);

                   }
                   $.fn.tooltip.showTip(el,opts);
			});
			// mouseout function
			el.mouseout(function()
			{
                   // if the tooltip is static then handle hiding it with a timer
                   if (opts.staticTool === true)
                   {
                       timer = setTimeout(function(){$.fn.tooltip.hideTip(el,opts);},20);
                   }
                   else
                   {
                       $.fn.tooltip.hideTip(el,opts);
                   }
			});

			// if the tooltip is static then handle hiding it with a timer
			$("#"+opts.toolID).mouseover(function(){
                   if (opts.staticTool === true)
                   {
                       clearTimeout(timer);
                   }
               });
               $("#"+opts.toolID).mouseout(function(){
                   if (opts.staticTool === true)
                   {
                       timer = setTimeout(function(){$.fn.tooltip.hideTip(el,opts);},20);
                   }
                   else
                   {
                       $.fn.tooltip.hideTip(el,opts);
                   }
               });

			// end of plugin stuff
		});

		// return jQuery object
		return this;
	};
	
	$.fn.tooltip.hideTip = function(el,opts)
     {
         // hide the tool tip
         // I will need to delete the DOM element that I created to house the content of the tool tip
         $("#"+opts.toolID).css("display","none");
         //$("#"+opts.toolID).fadeOut(200);
     };


     $.fn.tooltip.showTip = function(el,opts)
     {
         var toolNode = $("#"+opts.toolID);
         // show the tool tip for the DOM element
         // I will need to set up a DOM element to put the content of the tooltip into, and maybe set a position relative or 2
         toolNode.css("display","block");
         //$("#"+opts.toolID).fadeIn(200);
         toolNode.html(el.content);
         // if the tooltip is static then calculate where it goes in relation to the offset of the DOM node
         if (opts.staticTool === true)
         {
             // 4 cases: top, bottom, left, right
             var elOffset = el.offset();
             var toolOffset = {};
             // find the size of the tooltip
             var toolX = toolNode.outerWidth();
             var toolY = toolNode.outerHeight();
             var elX = el.outerWidth();
             var elY = el.outerHeight();
             //console.log("height: "+toolDimensionY+", width: "+toolDimensionX);
             switch (opts.staticPos){
                 case "top" :
                      console.log("top");
                      toolOffset.Y = elOffset.top - toolY + opts.offsetY;
                      toolOffset.X = elOffset.left + opts.offsetX;
                      //alert(elOffset.left + opts.offsetX;);
                      break;
                 case "bottom" :
                      console.log("bottom");
                      toolOffset.Y = elOffset.top + elY + opts.offsetY;
                      toolOffset.X = elOffset.left + opts.offsetX;
                      break;
                 case "left" :
                      console.log("left");
                      toolOffset.Y = elOffset.top + opts.offsetY;
                      toolOffset.X = elOffset.left - toolX + opts.offsetX;
                      break;
                 case "right" :
                      console.log("right");
                      toolOffset.Y = elOffset.top + opts.offsetY;
                      toolOffset.X = elOffset.left + elX + opts.offsetX;
                      break;
                 default:
                      // do nothing
             }
             $("#"+opts.toolID).css({"top":toolOffset.Y+"px","left":toolOffset.X+"px"});
         }

     };



	// end of module
})(jQuery);