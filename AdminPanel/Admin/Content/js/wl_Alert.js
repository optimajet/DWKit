/*----------------------------------------------------------------------*/
/* wl_Alert v 1.0 by revaxarts.com
/* description: Handles alert boxes
/* dependency: jquery UI Slider, fadeOutSlide plugin
/*----------------------------------------------------------------------*/


$.fn.wl_Alert = function (method) {
	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Alert.methods[method]) {
			return $.fn.wl_Alert.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Alert')) {
				var opts = $.extend({}, $this.data('wl_Alert'), method);
			} else {

				var opts = $.extend({}, $.fn.wl_Alert.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Alert')) {

			$this.data('wl_Alert', {});

			//bind click events to hide alert box
			$this.bind('click.wl_Alert', function (event) {
				event.preventDefault();

				//Don't hide if it is sticky
				if (!$this.data('wl_Alert').sticky) {
					$.fn.wl_Alert.methods.close.call($this[0]);
				}

				//prevent hiding the box if an inline link is clicked
			}).find('a').bind('click.wl_Alert', function (event) {
				event.stopPropagation();
			});
		} else {

		}
		//show it if it is hidden
		if ($this.is(':hidden')) {
			$this.slideDown(opts.speed / 2);
		}

		if (opts) $.extend($this.data('wl_Alert'), opts);
	});

};

$.fn.wl_Alert.defaults = {
	speed: 500,
	sticky: false,
	onBeforeClose: function (element) {},
	onClose: function (element) {}
};
$.fn.wl_Alert.version = '1.0';


$.fn.wl_Alert.methods = {
	close: function () {
		var $this = $(this),
			opts = $this.data('wl_Alert');
		//call callback and stop if it returns false
		if (opts.onBeforeClose.call(this, $this) === false) {
			return false;
		};
		//fadeout and call an callback
		$this.fadeOutSlide(opts.speed, function () {
			opts.onClose.call($this[0], $this);
		});
	},
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Alert.defaults[key] !== undefined || $.fn.wl_Alert.defaults[key] == null) {
				$this.data('wl_Alert')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};

//to create an alert box on the fly
$.wl_Alert = function (text, cssclass, insert, after, options) {
	//go thru all
	$('div.alert').each(function () {
		var _this = $(this);
		//...and hide if one with the same text is allready set
		if (_this.text() == text) {
			_this.slideUp($.fn.wl_Alert.defaults.speed);
		}
	});

	//create a new DOM element and inject it
	var al = $('<div class="alert ' + cssclass + '">' + text + '</div>').hide();
	(after) ? al.appendTo(insert).wl_Alert() : al.prependTo(insert).wl_Alert(options);
	
	//return the element
	return al;
};