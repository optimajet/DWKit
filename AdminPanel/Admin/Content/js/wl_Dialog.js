/*----------------------------------------------------------------------*/
/* wl_Dialog v 1.1 by revaxarts.com
/* description: handles alert boxes, prompt boxes and confirm boxes and
/*				message boxes
/*				contains 4 plugins
/* dependency: jquery UI Dialog
/*----------------------------------------------------------------------*/


/*----------------------------------------------------------------------*/
/* Confirm Dialog
/* like the native confirm method
/*----------------------------------------------------------------------*/
$.confirm = function (text, callback, cancelcallback) {

	var options = $.extend(true, {}, $.alert.defaults, $.confirm.defaults);

	//nativ behaviour
	if (options.nativ) {
		if (result = confirm(unescape(text))) {
			if ($.isFunction(callback)) callback.call(this);
		} else {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
		}
		return;
	}

	//the callbackfunction
	var cb = function () {
			if ($.isFunction(callback)) callback.call(this);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		},

		//the callbackfunction on cancel
		ccb = function () {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		};

	//set some options
	options = $.extend({}, {
		buttons: [{
			text: options.text.ok,
			click: cb
		}, {
			text: options.text.cancel,
			click: ccb
		}]
	}, options);

	//use the dialog
	return $.alert(unescape(text), options);
};

$.confirm.defaults = {
	text: {
		header: 'Please confirm',
		ok: 'Yes',
		cancel: 'No'
	}
};

/*----------------------------------------------------------------------*/
/* Prompt Dialog
/* like the native prompt method
/*----------------------------------------------------------------------*/

$.prompt = function (text, value, callback, cancelcallback) {

	var options = $.extend(true, {}, $.alert.defaults, $.prompt.defaults);

	//nativ behaviour
	if (options.nativ) {
		var val = prompt(unescape($.trim(text)), unescape(value));
		if ($.isFunction(callback) && val !== null) {
			callback.call(this, val);
		} else {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
		}
		return;
	}

	//the callbackfunction
	var cb = function (value) {
			if ($.isFunction(callback)) callback.call(this, value);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		},

		//the callbackfunction on cancel
		ccb = function () {
			if ($.isFunction(cancelcallback)) cancelcallback.call(this);
			$(this).dialog('close');
			$('#wl_dialog').remove();
		};

	//set some options
	options = $.extend({}, {
		buttons: [{
			text: options.text.ok,
			click: function () {
				cb.call(this, $('#wl_promptinputfield').val());
			}
		}, {
			text: options.text.cancel,
			click: ccb
		}],
		open: function () {
			$('#wl_promptinputfield').focus().select();
			$('#wl_promptinputfield').uniform();
			$('#wl_promptinputform').bind('submit', function (event) {
				event.preventDefault();
				cb.call(this, $('#wl_promptinputfield').val());
				$(this).parent().dialog('close');
				$('#wl_dialog').remove();
			});

		}
	}, options);

	//use the dialog
	return $.alert('<p>' + unescape(text) + '</p><form id="wl_promptinputform"><input id="wl_promptinputfield" name="wl_promptinputfield" value="' + unescape(value) + '"></form>', options);
};

$.prompt.defaults = {
	text: {
		header: 'Please prompt',
		ok: 'OK',
		cancel: 'Cancel'
	}
};


/*----------------------------------------------------------------------*/
/* Alert Dialog
/* like the native alert method
/*----------------------------------------------------------------------*/

$.alert = function (content, options) {


	//if no options it is a normal dialog
	if (!options) {
		var options = $.extend(true, {}, {
			buttons: [{
				text: $.alert.defaults.text.ok,
				click: function () {
					$(this).dialog('close');
					$('#wl_dialog').remove();
				}
			}]
		}, $.alert.defaults);
	}

	//nativ behaviour
	if (options.nativ) {
		alert(content);
		return;
	}

	//create a container
	var container = $('<div/>', {
		id: 'wl_dialog'
	}).appendTo('body');

	//set a header
	if (options.text.header) {
		container.attr('title', options.text.header);
	}

	//fill the container
	container.html(content.replace(/\n/g, '<br>'));
	//display the dialog
	container.dialog(options);
	
	return{
		close:function(callback){
			container.dialog('close');
			container.remove();
			if($.isFunction(callback)) callback.call(this);
		},
		setHeader:function(text){
			this.set('title',text);
		},
		setBody:function(html){
			container.html(html);
		},
		set:function(option, value){
			container.dialog("option", option, value);
		}	
	}


};


$.alert.defaults = {
	nativ: false,
	resizable: false,
	modal: true,
	text: {
		header: 'Notification',
		ok: 'OK'
	}
};


/*----------------------------------------------------------------------*/
/* Message Function
/*----------------------------------------------------------------------*/


$.msg = function (content, options) {


	//get the options
	var options = $.extend({}, $.msg.defaults, options);

	var container = $('#wl_msg'),msgbox;

	//the container doen't exists => create it
	if (!container.length) {
		container = $('<div/>', {
			id: 'wl_msg'
		}).appendTo('body').data('msgcount', 0);
		var topoffset = parseInt(container.css('top'), 10);

		//bind some events to it
		container.bind('mouseenter', function () {
			container.data('pause', true);
		}).bind('mouseleave', function () {
			container.data('pause', false);
		});
		container.delegate('.msg-close', 'click', function () {
			container.data('pause', false);
			close($(this).parent());
		});
		container.delegate('.msg-box-close', 'click', function () {
			container.fadeOutSlide(options.fadeTime);
		});

		//bind the scroll event
		$(window).unbind('scroll.wl_msg').bind('scroll.wl_msg', function () {
			var pos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
			if (pos > topoffset) {
				(window.navigator.standalone === undefined) ? container.css({
					position: 'fixed',
					top: 10
				}) : container.css({
					top: pos + 10
				});
			} else {
				(window.navigator.standalone === undefined) ? container.removeAttr('style') : container.css({
					top: topoffset
				});
			}
		}).trigger('scroll.wl_msg');
	}
	
	//stop if no content is set
	if(!content)return false;

	//count of displayed messages
	var count = container.data('msgcount');

	function getHTML(content, headline) {
		return '<div class="msg-box"><h3>' + (headline || '') + '</h3><a class="msg-close">close</a><div class="msg-content">' + content.replace('\n', '<br>') + '</div></div>';
	}

	function create() {
		msgbox = $(getHTML(content, options.header)),
		closeall = $('.msg-box-close');

		//we have some messages allready
		if (count) {

			//No close all button
			if (!closeall.length) {
				msgbox.appendTo(container);
				$('<div class="msg-box-close">close all</div>').appendTo(container).fadeInSlide(options.fadeTime);

				//Close all button
			} else {
				msgbox.insertBefore(closeall);
			}

			//first message
		} else {
			msgbox.appendTo(container);
		}

		//fade it in nicely
		msgbox.fadeInSlide(options.fadeTime);

		//add the count of the messages to the container
		container.data('msgcount', ++count);

		//outclose it only if it's not sticky
		if (!options.sticky) {
			close(msgbox, options.live);
		}
	}

	function close(item, delay, callback) {
		if ($.isFunction(delay)){
			callback = delay;
			delay = 0;
		}else if(!delay){
			delay = 0;
		}
		setTimeout(function () {

			//if the mouse isn't over the container
			if (!container.data('pause')) {
				item.fadeOutSlide(options.fadeTime, function () {
					var count = $('.msg-box').length;
					if (count < 2 && $('.msg-box-close').length) {
						$('.msg-box-close').fadeOutSlide(options.fadeTime);
					}
					container.data('msgcount', count);
					if($.isFunction(callback)) callback.call(item);
				})
				//try again...
			} else {
				close(item, delay);
			}

		}, delay);
	}

	//create the messsage
	create();
	
	return {
		close:function(callback){
			close(msgbox,callback);
		},
		setHeader:function(text){
			msgbox.find('h3').eq(0).text(text);
		},
		setBody:function(html){
			msgbox.find('.msg-content').eq(0).html(html);
		},
		closeAll:function(callback){
			container.fadeOutSlide(options.fadeTime, function(){
				if($.isFunction(callback)) callback.call(this);
			});
		}	
	}

};

$.msg.defaults = {
	header: null,
	live: 5000,
	topoffset: 90,
	fadeTime: 500,
	sticky: false
};

//initial call to prevent IE to jump to the top
$(document).ready(function() {$.msg(false);});
