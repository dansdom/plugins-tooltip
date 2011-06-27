// jQuery Tooltip Plugin 1.0 - By Daniel Thomson
//
// settings:
// toolID   - string;    This is the custom ID for the tool tip. Used to create different styles for each tooltip on the page
// offsetY  - integer;   This is the vertical offest of the tooltip from the mouse position
// offsetX  - integer;   This is the horizontal offest of the tooltip from the mouse position
// domNode  - boolean;   If true then it will look for a DOM node to inject into the tooltip
// ajax     - boolean;   If true then it will look for an external resource and inject that content into the tooltip


(function($){

	$.fn.tooltip = function(config)
	{
		// config - default settings
		var settings = {
                              //effect: 'fade',   - I don't think I want to add any visual effects now
                              //speed: 200,       - I don't think I want to add any visual effects now
                              toolID: 'tooltip',
                              offsetY : -30,
                              offsetX: 30,
                              domNode: false,
                              ajax: false
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
                   $("#"+opts.toolID).css({"top":cursorY+opts.offsetY+"px","left":cursorX+opts.offsetX+"px"});
               });

			// mouseover function
			el.mouseover(function()
			{
                   $.fn.tooltip.showTip(el,opts);
			});
			// mouseout function
			el.mouseout(function()
			{
                   $.fn.tooltip.hideTip(el,opts);
			});

			// end of plugin stuff
		});

		// return jQuery object
		return this;
	};


     $.fn.tooltip.showTip = function(el,opts)
     {
         // show the tool tip for the DOM element
         // I will need to set up a DOM element to put the content of the tooltip into, and maybe set a position relative or 2
         $("#"+opts.toolID).css("display","block");
         //$("#"+opts.toolID).fadeIn(200);
         $("#"+opts.toolID).html(el.content);
     };

     $.fn.tooltip.hideTip = function(el,opts)
     {
         // hide the tool tip
         // I will need to delete the DOM element that I created to house the content of the tool tip
         $("#"+opts.toolID).css("display","none");
         //$("#"+opts.toolID).fadeOut(200);
     };

	// end of module
})(jQuery);