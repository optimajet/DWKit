/*----------------------------------------------------------------------*/
/* wl_Calendar v 1.0 by revaxarts.com
/* description: makes a Calendar
/* dependency: fullcalendar plugin (calendar.js)
/*----------------------------------------------------------------------*/


$.fn.wl_Calendar = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Calendar.methods[method]) {
			return $.fn.wl_Calendar.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Calendar')) {
				var opts = $.extend({}, $this.data('wl_Calendar'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Calendar.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.fullCalendar(method, args[1], args[2], args[3], args[4]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Calendar')) {

			$this.data('wl_Calendar', {});

			//we need to use the jquery UI Theme
			opts.theme = true;

			//some shorties for the header, you can add more easily
			switch (opts.header) {
			case 'small':
				opts.header = {
					left: 'title',
					right: 'prev,next'
				};
				break;
			case 'small-today':
				opts.header = {
					left: 'title',
					right: 'prev,today,next'
				};
				break;
			default:
			}

			//call the fullCalendar plugin
			$this.fullCalendar(opts);


		} else {

		}

		if (opts) $.extend($this.data('wl_Calendar'), opts);

	});

};

$.fn.wl_Calendar.defaults = {};
$.fn.wl_Calendar.version = '1.0';


$.fn.wl_Calendar.methods = {
	set: function () {
		var $this = $(this),
			options = {};
		if (typeof arguments[0] === 'object') {

			options = arguments[0];
		} else if (arguments[0] && arguments[1] !== undefined) {
			options[arguments[0]] = arguments[1];
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Calendar.defaults[key] !== undefined || $.fn.wl_Calendar.defaults[key] == null) {
				$this.data('wl_Calendar')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};