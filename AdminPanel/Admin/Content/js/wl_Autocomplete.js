/*----------------------------------------------------------------------*/
/* wl_Autocomplete v 1.0 by revaxarts.com
/* description: extends the jQuery Autocomplete Function
/* dependency: jQUery UI Autocomplete, parseData function
/*----------------------------------------------------------------------*/


$.fn.wl_Autocomplete = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Autocomplete.methods[method]) {
			return $.fn.wl_Autocomplete.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Autocomplete')) {
				var opts = $.extend({}, $this.data('wl_Autocomplete'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Autocomplete.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.autocomplete(method, args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Autocomplete')) {

			$this.data('wl_Autocomplete', {});

			//if source is a function use the returning value of that function
			if ($.isFunction(window[opts.source])) {
				opts.source = window[opts.source].call(this);
			}
			//if it is an string it must be an array to parse (typeof '[1,2,3]' === 'string') 
			if (typeof opts.source === 'string') {
				opts.source = $.parseData(opts.source, true);
			}

			//call the jQueryUI autocomplete plugin
			$this.autocomplete(opts);


		} else {

		}

		if (opts) $.extend($this.data('wl_Autocomplete'), opts);
	});

};

$.fn.wl_Autocomplete.defaults = {
	//check http://jqueryui.com/demos/autocomplete/ for all options
};
$.fn.wl_Autocomplete.version = '1.0';


$.fn.wl_Autocomplete.methods = {
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {
			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Autocomplete.defaults[key] !== undefined || $.fn.wl_Autocomplete.defaults[key] == null) {
				$this.data('wl_Autocomplete')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};