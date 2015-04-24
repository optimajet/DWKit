$(document).ready(function() {	
	var conversation = [[1,"sadsadsad"],[1,"asdsad"],[0,"asdsada"]];
	$('.user-details-wrapper').click(function(){
			set_user_details($(this).attr('data-user-name'),$(this).attr('data-chat-status'));
			$('#messages-wrapper').addClass('animated');
			$('#messages-wrapper').show();			
			$('#chat-users').removeClass('animated');
			$('#chat-users').hide();
			$('.chat-input-wrapper').show();	
	})
	
	$('.chat-back').click(function(){
			$('#messages-wrapper .chat-messages-header .status').removeClass('online');
			$('#messages-wrapper .chat-messages-header .status').removeClass('busy');
			$('#messages-wrapper').hide();
			$('#messages-wrapper').removeClass('animated');
			$('#chat-users').addClass('animated');
			$('#chat-users').show();
			$('.chat-input-wrapper').hide();
	})
	$('.bubble').click(function(){
		$(this).parent().parent('.user-details-wrapper').children('.sent_time').slideToggle();
	})
	 $('#chat-message-input').keypress(function(e){
		if(e.keyCode == 13)
		{		
			send_message($(this).val());
			$(this).val("");
			$(this).blur()
		}
	 })
	$(window).setBreakpoints({
		distinct: true, 
		breakpoints: [
			320,
			480,
			768,
			1024
		] 
	});   	
	var eleHeight =window.screen.height;
	eleHeight=eleHeight-180;
	
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
		eleHeight=eleHeight-20;
	});	
	
	$(window).bind('enterBreakpoint480',function() {
		eleHeight=eleHeight-20;
	});

	$('#main-chat-wrapper').slimScroll({
		color: '#a1b2bd',
		size: '7px',
		height: eleHeight,
		alwaysVisible: false
	});
})
	function set_user_details(username,status){
		$('#messages-wrapper .chat-messages-header .status').addClass(status);
		$('#messages-wrapper .chat-messages-header span').text(username);
	}	
	function build_conversation(msg,isOpponent,img,retina){
		if(isOpponent==1){
			$('.chat-messages').append('<div class="user-details-wrapper">'+
				'<div class="user-details">'+
					'<div class="user-profile">'+
					'<img src="'+ img +'"  alt="" data-src="'+ img +'" data-src-retina="'+ retina +'" width="35" height="35">'+
					'</div>'+
				  '<div class="bubble old sender">'+	
						msg+
				   '</div>'+
				'</div>'+				
				'<div class="clearfix"></div>'+
			'</div>');		
		}
		else{
		$('.chat-messages').append('<div class="user-details-wrapper pull-right">'+
			'<div class="user-details">'+
			  '<div class="bubble old sender">'+	
					msg+
			   '</div>'+
			'</div>'+				
			'<div class="clearfix"></div>'+
		'</div>')
		}
	}
	function send_message(msg){
		$('.chat-messages').append('<div class="user-details-wrapper pull-right animated fadeIn">'+
			'<div class="user-details">'+
			  '<div class="bubble old sender">'+	
					msg+
			   '</div>'+
			'</div>'+				
			'<div class="clearfix"></div>'+
		'</div>')
	}	