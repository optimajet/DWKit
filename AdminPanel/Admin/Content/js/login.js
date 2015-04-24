$(document).ready(function() {
						   
						   
	var $body = $('body'),
		$content = $('#content'),
		$form = $content.find('#loginform');
	
		
		//IE doen't like that fadein
		if(!$.browser.msie) $body.fadeTo(0,0.0).delay(500).fadeTo(1000, 1);
		
		
		$("input").uniform();
		

		$form.wl_Form({
			status:false,
			onBeforeSubmit: function(data){
				$form.wl_Form('set','sent',false);
				if(data.username || data.password){
					location.href="dashboard.html";
				}else{
					$.wl_Alert('Please provide something!','info','#content');
				}
				return false;

			}							  
		});
		
		
});