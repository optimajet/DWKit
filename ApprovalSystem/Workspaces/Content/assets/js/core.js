$(document).ready(function() {		
	calculateHeight();
	$(".remove-widget").click(function() {		
		$(this).parent().parent().parent().addClass('animated fadeOut');
		$(this).parent().parent().parent().attr('id', 'id_a');

		//$(this).parent().parent().parent().hide();
		 setTimeout( function(){			
			$('#id_a').remove();	
		 },400);	
	return false;
	});
	
	$(".create-folder").click(function() {
		$('.folder-input').show();
		return false;
	});
	
	$(".folder-name").keypress(function (e) {
        if(e.which == 13) {
			 $('.folder-input').hide();
			 $( '<li><a href="#"><div class="status-icon green"></div>'+  $(this).val() +'</a> </li>' ).insertBefore( ".folder-input" );
			 $(this).val('');
		}
    });
	
	$("#menu-collapse").click(function() {	
		if($('.page-sidebar').hasClass('mini')){
			$('.page-sidebar').removeClass('mini');
			$('.page-content').removeClass('condensed-layout');
			$('.footer-widget').show();
		}
		else{
			$('.page-sidebar').addClass('mini');
			$('.page-content').addClass('condensed-layout');
			$('.footer-widget').hide();
			calculateHeight();
		}
	});

	$(".inside").children('input').blur(function(){
		$(this).parent().children('.add-on').removeClass('input-focus');		
	})
	
	$(".inside").children('input').focus(function(){
		$(this).parent().children('.add-on').addClass('input-focus');		
	})	
	
	$(".input-group.transparent").children('input').blur(function(){
		$(this).parent().children('.input-group-addon').removeClass('input-focus');		
	})
	
	$(".input-group.transparent").children('input').focus(function(){
		$(this).parent().children('.input-group-addon').addClass('input-focus');		
	})	
	
	$(".bootstrap-tagsinput input").blur(function(){
		$(this).parent().removeClass('input-focus');
	})
	
	$(".bootstrap-tagsinput input").focus(function(){
		$(this).parent().addClass('input-focus');		
	})	
	
	/*$('#my-task-list').popover({ 
        html : true, 
        content: function() {
          return $('#notification-list').html();
        }
    });*/

//*********************************** BEGIN CHAT POPUP*****************************
	// $('.chat-menu-toggle').sidr({
	//	name:'sidr',
	//	side: 'right',
	//	complete:function(){		 
	//	}
	//});
	//$(".simple-chat-popup").click(function(){
	//	$(this).addClass('hide');
	//	$('#chat-message-count').addClass('hide');	
	//});

	//setTimeout( function(){
	//	$('#chat-message-count').removeClass('hide');	
	//	$('#chat-message-count').addClass('animated bounceIn');
	//	$('.simple-chat-popup').removeClass('hide');			
	//	$('.simple-chat-popup').addClass('animated fadeIn');		
	//},5000);	
	//setTimeout( function(){
	//	$('.simple-chat-popup').addClass('hide');			
	//	$('.simple-chat-popup').removeClass('animated fadeIn');		
	//	$('.simple-chat-popup').addClass('animated fadeOut');		
	//},8000);
	
//*********************************** END CHAT POPUP*****************************	
	
//**********************************BEGIN MAIN MENU********************************
	jQuery('.page-sidebar li > a').on('click', function (e) {
            if ($(this).next().hasClass('sub-menu') == false) {
                return;
	}
     var parent = $(this).parent().parent();

            parent.children('li.open').children('a').children('.arrow').removeClass('open');
            parent.children('li.open').children('.sub-menu').slideUp(200);
            parent.children('li.open').removeClass('open');

            var sub = jQuery(this).next();
            if (sub.is(":visible")) {
                jQuery('.arrow', jQuery(this)).removeClass("open");
                jQuery(this).parent().removeClass("open");
                sub.slideUp(200, function () {
                    handleSidenarAndContentHeight();
                });
            } else {
                jQuery('.arrow', jQuery(this)).addClass("open");
                jQuery(this).parent().addClass("open");
                sub.slideDown(200, function () {
                    handleSidenarAndContentHeight();
                });
            }

            e.preventDefault();
        });
//**********************************END MAIN MENU********************************
		
//***********************************BEGIN Fixed Menu*****************************



//***********************************BEGIN Grids*****************************		
		 $('.grid .tools a.remove').on('click', function () {
            var removable = jQuery(this).parents(".grid");
            if (removable.next().hasClass('grid') || removable.prev().hasClass('grid')) {
                jQuery(this).parents(".grid").remove();
            } else {
                jQuery(this).parents(".grid").parent().remove();
            }
        });

        $('.grid .tools a.reload').on('click', function () {
            var el =  jQuery(this).parents(".grid");
            blockUI(el);
			window.setTimeout(function () {
               unblockUI(el);
            }, 1000);
        });
		
		$('.grid .tools .collapse, .grid .tools .expand').on('click', function () {
            var el = jQuery(this).parents(".grid").children(".grid-body");
            if (jQuery(this).hasClass("collapse")) {
                jQuery(this).removeClass("collapse").addClass("expand");
                el.slideUp(200);
            } else {
                jQuery(this).removeClass("expand").addClass("collapse");
                el.slideDown(200);
            }
        });		
		
		$('.user-info .collapse').on('click', function () {
            jQuery(this).parents(".user-info ").slideToggle();
		});   
//***********************************END Grids*****************************				
		var handleSidenarAndContentHeight = function () {
        var content = $('.page-content');
        var sidebar = $('.page-sidebar');

        if (!content.attr("data-height")) {
            content.attr("data-height", content.height());
        }

        if (sidebar.height() > content.height()) {
            content.css("min-height", sidebar.height() + 120);
        } else {
            content.css("min-height", content.attr("data-height"));
        }
    }
	$('.panel-group').on('hidden.bs.collapse', function (e) {
	  $(this).find('.panel-heading').not($(e.target)).addClass('collapsed');
	})
	
	$('.panel-group').on('shown.bs.collapse', function (e) {
	 // $(e.target).prev('.accordion-heading').find('.accordion-toggle').removeClass('collapsed');
	})

//***********************************BEGIN Layout Readjust *****************************		

	$(window).setBreakpoints({
		distinct: true, 
		breakpoints: [
			320,
			480,
			768,
			1024
		] 
	});   	
	//Break point entry 
	$(window).bind('enterBreakpoint320',function() {	
		$('#main-menu-toggle-wrapper').show();		
		$('#portrait-chat-toggler').show();	
		$('#header_inbox_bar').hide();	
		$('#main-menu').removeClass('mini');		   
		$('.page-content').removeClass('condensed');
		rebuildSider();
	});	
	
	$(window).bind('enterBreakpoint480',function() {
		$('#main-menu-toggle-wrapper').show();		
		$('.header-seperation').show();		
		$('#portrait-chat-toggler').show();				
		$('#header_inbox_bar').hide();	
		//Incase if condensed layout is applied
		$('#main-menu').removeClass('mini');		   
		$('.page-content').removeClass('condensed');			
		rebuildSider();
	});
	
	$(window).bind('enterBreakpoint768',function() {		
		$('#main-menu-toggle-wrapper').show();		
		$('#portrait-chat-toggler').show();	
		
		$('#header_inbox_bar').hide();	
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {			
			$('#main-menu').removeClass('mini');	
			$('.page-content').removeClass('condensed');	
			rebuildSider();
		}	
	});

	$(window).bind('exitBreakpoint320',function() {	
		$('#main-menu-toggle-wrapper').hide();		
		$('#portrait-chat-toggler').hide();	
		$('#header_inbox_bar').show();			
		closeAndRestSider();		
	});	
	
	$(window).bind('exitBreakpoint480',function() {
		$('#main-menu-toggle-wrapper').hide();		
		$('#portrait-chat-toggler').hide();	
		$('#header_inbox_bar').show();			
		closeAndRestSider();	
	});
	
	$(window).bind('exitBreakpoint768',function() {
		$('#main-menu-toggle-wrapper').hide();		
		$('#portrait-chat-toggler').hide();	
		$('#header_inbox_bar').show();			
		closeAndRestSider();
	});
//***********************************END Layout Readjust *****************************	

//***********************************BEGIN Function calls *****************************	
	function closeAndRestSider(){
	  if($('#main-menu').attr('data-inner-menu')=='1'){
		$('#main-menu').addClass("mini");	
		$.sidr('close', 'main-menu');
		$.sidr('close', 'sidr');		
		$('#main-menu').removeClass("sidr");	
		$('#main-menu').removeClass("left");	
	  }
	  else{
		$.sidr('close', 'main-menu');
		$.sidr('close', 'sidr');		
		$('#main-menu').removeClass("sidr");	
		$('#main-menu').removeClass("left");
	}
	
	}
	function rebuildSider(){
		$('#main-menu-toggle').sidr({		
				name : 'main-menu',
				side: 'left'
		});
	}
//***********************************END Function calls *****************************	

//***********************************BEGIN Main Menu Toggle *****************************	
	$('#layout-condensed-toggle').click(function(){
	  $.sidr('close', 'sidr');
	 if($('#main-menu').attr('data-inner-menu')=='1'){
		//Do nothing
		//console.log("Menu is already condensed");
	 }
	 else{
	  if($('#main-menu').hasClass('mini')){
		$('#main-menu').removeClass('mini');
		$('.page-content').removeClass('condensed');		
		$('.scrollup').removeClass('to-edge');	
		$('.header-seperation').show();
		//Bug fix - In high resolution screen it leaves a white margin
		$('.header-seperation').css('height','61px');
		$('.footer-widget').show();
		$.cookie("layout-condensed-toggle", "show");
	  }	
	  else{
		$('#main-menu').addClass('mini');
		$('.page-content').addClass('condensed');		
		$('.scrollup').addClass('to-edge');	
		$('.header-seperation').hide();
		$('.footer-widget').hide();
		$.cookie("layout-condensed-toggle", "hide");
	  }
	 }

	 WorkspaceControls.FireGlobalResize();
	});
//***********************************END Main Menu Toggle *****************************	
	
//***********************************BEGIN Slimscroller *****************************		
	$('.scroller').each(function () {
        $(this).slimScroll({
                size: '7px',
                color: '#a1b2bd',
                height: $(this).attr("data-height"),
                alwaysVisible: ($(this).attr("data-always-visible") == "1" ? true : false),
                railVisible: ($(this).attr("data-rail-visible") == "1" ? true : false),
                disableFadeOut: true
        });
    });
//***********************************END Slimscroller *****************************	

//***********************************BEGIN dropdow menu *****************************		
	$('.dropdown-toggle').click(function () {
		$("img").trigger("unveil");
	});
//***********************************END dropdow menu *****************************	

//***********************************BEGIN Global sparkline chart  *****************************	   
	if ($.fn.sparkline) {
		$('.sparklines').sparkline('html', { enableTagOptions: true });
	}
//***********************************END Global sparkline chart  *****************************	

//***********************************BEGIN Function calls *****************************	
	 $('table th .checkall').on('click', function () {
			if($(this).is(':checked')){
				$(this).closest('table').find(':checkbox').attr('checked', true);
				$(this).closest('table').find('tr').addClass('row_selected');
				//$(this).parent().parent().parent().toggleClass('row_selected');	
			}
			else{
				$(this).closest('table').find(':checkbox').attr('checked', false);
				$(this).closest('table').find('tr').removeClass('row_selected');
			}
    });
//***********************************BEGIN Function calls *****************************	

//***********************************BEGIN Function calls *****************************	
	$('.animate-number').each(function(){
		 $(this).animateNumbers($(this).attr("data-value"), true, parseInt($(this).attr("data-animation-duration")));	
	})
	$('.animate-progress-bar').each(function(){
		 $(this).css('width', $(this).attr("data-percentage"));
		
	})
//***********************************BEGIN Function calls *****************************	

//***********************************BEGIN Tiles Controller Options *****************************		
	$('.controller .reload').click(function () { 
		var el =$(this).parent().parent().parent();
		blockUI(el);
		  window.setTimeout(function () {
               unblockUI(el);
            }, 1000);
	});
	$('.controller .remove').click(function () {
		$(this).parent().parent().parent().parent().addClass('animated fadeOut');
		$(this).parent().parent().parent().parent().attr('id', 'id_remove_temp_id');
		 setTimeout( function(){			
			$('#id_remove_temp_id').remove();	
		 },400);
	});
        if (!jQuery().sortable) {
            return;
        }
        $(".sortable").sortable({
            connectWith: '.sortable',
            iframeFix: false,
            items: 'div.grid',
            opacity: 0.8,
            helper: 'original',
            revert: true,
            forceHelperSize: true,
            placeholder: 'sortable-box-placeholder round-all',
            forcePlaceholderSize: true,
            tolerance: 'pointer'
        });
//***********************************BEGIN Function calls *****************************	

//***********************************BEGIN Function calls *****************************	
    function blockUI(el) {		
            $(el).block({
                message: '<div class="loading-animator"></div>',
                css: {
                    border: 'none',
                    padding: '2px',
                    backgroundColor: 'none'
                },
                overlayCSS: {
                    backgroundColor: '#fff',
                    opacity: 0.3,
                    cursor: 'wait'
                }
            });
     }
	 
     // wrapper function to  un-block element(finish loading)
     function unblockUI(el) {
            $(el).unblock();
    }
	
	$(window).resize(function() {
			calculateHeight();
	});
	
	$(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('.scrollup').fadeIn();
        } else {
            $('.scrollup').fadeOut();
        }
    });
//***********************************BEGIN Function calls *****************************		
	$('.scrollup').click(function(){
		$("html, body").animate({ scrollTop: 0 }, 700);
		return false;
    });
	
	 $("img").unveil();
});
$( window ).resize(function() {
	  $.sidr('close', 'sidr');
});
function calculateHeight(){
		var contentHeight=parseInt($('.page-content').height());
		if(911 > contentHeight){	
			//console.log("Small");
		}	
}	