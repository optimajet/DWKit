$(document).ready(function() {
						   
						   
	var $body = $('body'),
		$content = $('#content');
	
		
		//IE doen't like that fadein
		if(!$.browser.msie) $body.fadeTo(0,0.0).delay(500).fadeTo(1000, 1);
		
		
		$("input").not('input[type=submit]').uniform();
		
		$content.find('.breadcrumb').wl_Breadcrumb({
			allownextonly:true,
			onChange: function(el,id){
				switch(id){
					case 0: //Start
						break;
					case 1: //Information
						break;
					case 2: //Summery
						break;
					case 3: //Installation
						break;
					case 4: //Finish
						break;
				}
			}
		});
		
		$('#loginbtn').click(function(){
			location.href="login.html";							  
		});
		
		
});