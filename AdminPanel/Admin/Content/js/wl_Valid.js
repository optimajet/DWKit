/*----------------------------------------------------------------------*/
/* wl_Valid v 1.0 by revaxarts.com
/* description: validates an input
/* dependency: 
/*----------------------------------------------------------------------*/


$.fn.wl_Valid = function (method) {

	var args = arguments;

	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Valid.methods[method]) {
			return $.fn.wl_Valid.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Valid')) {
				var opts = $.extend({}, $this.data('wl_Valid'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Valid.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		//regex is a string => convert it
		if (typeof opts.regex === 'string') {
			opts.regex = new RegExp(opts.regex);
		}

		if (!$this.data('wl_Valid')) {

			$this.data('wl_Valid', {});

			$this.bind({

				//validate on change event
				'change.wl_Valid': function () {
					var opts = $this.data('wl_Valid') || opts;
					$.fn.wl_Valid.methods.validate.call($this[0]);
					
					//callback
					opts.onChange.call($this[0], $this, $this.val());
					if (!opts.valid) {
						//error callback
						opts.onError.call($this[0], $this, $this.val());
					}
				},

				//for instant callback
				'keyup.wl_Valid': function () {
					var opts = $this.data('wl_Valid') || opts;
					if (opts.instant) {
						//validate only  if minlength is reached
						if ($this.val().length >= $this.data('wl_Valid').minLength) {
							$this.wl_Valid('validate');
						}
					}
				}
			});

		} else {

		}

		if (opts) $.extend($this.data('wl_Valid'), opts);
		$.fn.wl_Valid.methods.validate.call($this);
	});

};

$.fn.wl_Valid.defaults = {
	errorClass: 'error',
	instant: true,
	regex: /.*/,
	minLength: 0,
	onChange: function ($this, value) {},
	onError: function ($this, value) {}
};

$.fn.wl_Valid.version = '1.0';


$.fn.wl_Valid.methods = {
	validate: function () {
		var $this = $(this),
			opts = $this.data('wl_Valid') || opts,
			value = $this.val();

		//check for validation, empty is valid too!
		opts.valid = (!value || opts.regex.test(value));

		//field is valid or equal to a placeholder attribute
		if (opts.valid || (value == $this.attr('placeholder'))) {
			$this.removeClass(opts.errorClass);
		} else {
			$this.addClass(opts.errorClass);
		}
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
			if ($.fn.wl_Valid.defaults[key] !== undefined || $.fn.wl_Valid.defaults[key] == null) {
				switch (key) {
				case 'regex':
					value = new RegExp(value);
					break;
				default:
				}
				$this.data('wl_Valid')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};



/*----------------------------------------------------------------------*/
/* wl_Mail by revaxarts.com
/* description: Shorthand for wl_Valid for email addresses
/* dependency: wl_Valid
/*----------------------------------------------------------------------*/


$.fn.wl_Mail = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);
		if ($.fn.wl_Valid.methods[method]) {
			return $.fn.wl_Valid.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Valid')) {
				var opts = $.extend({}, $this.data('wl_Valid'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Mail.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		$this.wl_Valid(opts);

		if (opts) $.extend($this.data('wl_Valid'), opts);

	});

};

$.fn.wl_Mail.defaults = {
	regex: /^([\w-]+(?:\.[\w-]+)*)\@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$|(\[?(\d{1,3}\.){3}\d{1,3}\]?)$/i,
	onChange: function (element, value) {
		element.val(value.toLowerCase());
	}
};

/*----------------------------------------------------------------------*/
/* wl_URL by revaxarts.com
/* description: Shorthand for wl_Valid for urls
/* dependency: wl_Valid
/*----------------------------------------------------------------------*/


$.fn.wl_URL = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Valid.methods[method]) {
			return $.fn.wl_Valid.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Valid')) {
				var opts = $.extend({}, $this.data('wl_Valid'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_URL.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		$this.wl_Valid(opts);

		if (opts) $.extend($this.data('wl_Valid'), opts);

	});

};

$.fn.wl_URL.defaults = {
	regex: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w]))*\.+(([\w#!:.?+=&%@!\-\/]))?/,
	instant: false,
	onChange: function (element, value) {
		if (value != '' && !/^(ftp|http|https):\/\//.test(value)) element.val('http://' + value).trigger('change.wl_Valid');
	}
};