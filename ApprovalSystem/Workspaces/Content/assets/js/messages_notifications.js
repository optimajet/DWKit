	$(document).ready(function() {		
		$('#popover').popover();
		$('.tip').tooltip();
		
		$('#btnFlip').click(function(){
			$('#animateAlert').show();
			$('#animateAlert').addClass("bounceIn ");
		});
		$('#btnShake').click(function(){
			$('#animateAlert').show();
		});
		$('#btnBouce').click(function(){
			$('#animateAlert').show();		
		});
	});