/*----------------------------------------------------------------------*/
/* wl_Date v 1.0 by revaxarts.com
/* description: extends the Datepicker
/* dependency: jQuery Datepicker, mousewheel plugin
/*----------------------------------------------------------------------*/


$.fn.wl_Date = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Date.methods[method]) {
			return $.fn.wl_Date.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Date')) {
				var opts = $.extend({}, $this.data('wl_Date'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Date.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.datepicker(method, args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Date')) {

			$this.data('wl_Date', {});

			//call the jQuery UI datepicker plugin
			$this.datepicker(opts);

			//bind a mousewheel event to the input field
			$this.bind('mousewheel.wl_Date', function (event, delta) {
				if (opts.mousewheel) {
					event.preventDefault();
					//delta must be 1 or -1 (different on macs and with shiftkey pressed)
					delta = (delta < 0) ? -1 : 1;
					
					//shift key is pressed
					if (event.shiftKey) {
						var _date = $this.datepicker('getDate');
						//new delta is the current month day count (month in days)
						delta *= new Date(_date.getFullYear(), _date.getMonth() + 1, 0).getDate();
					}
					//call the method
					$.fn.wl_Date.methods.changeDay.call($this[0], delta);
				}
			});


			//value is set and has to get translated (self-explanatory) 
			if (opts.value) {
				var today = new Date().getTime();
				switch (opts.value) {
				case 'now':
				case 'today':
					$this.datepicker('setDate', new Date());
					break;
				case 'next':
				case 'tomorrow':
					$this.datepicker('setDate', new Date(today + 864e5 * 1));
					break;
				case 'prev':
				case 'yesterday':
					$this.datepicker('setDate', new Date(today + 864e5 * -1));
					break;
				default:
					//if a valid number add them as days to the date field
					if (!isNaN(opts.value)) $this.datepicker('setDate', new Date(today + 864e5 * opts.value));
				}

			}
			//disable if set
			if (opts.disabled) {
				$.fn.wl_Date.methods.disable.call(this);
			}
		} else {

		}

		if (opts) $.extend($this.data('wl_Date'), opts);
	});

};

$.fn.wl_Date.defaults = {
	value: null,
	mousewheel: true
};
$.fn.wl_Date.version = '1.0';


$.fn.wl_Date.methods = {
	disable: function () {
		var $this = $(this);
		//disable the datepicker
		$this.datepicker('disable');
		$this.data('wl_Date').disabled = true;
	},
	enable: function () {
		var $this = $(this);
		//enable the datepicker
		$this.datepicker('enable');
		$this.data('wl_Date').disabled = false;
	},
	next: function () {
		//select next day
		$.fn.wl_Date.methods.changeDay.call(this, 1);
	},
	prev: function () {
		//select previous day
		$.fn.wl_Date.methods.changeDay.call(this, -1);
	},
	changeDay: function (delta) {
		var $this = $(this),
			_current = $this.datepicker('getDate') || new Date();
		//set day to currentday + delta
		_current.setDate(_current.getDate() + delta);
		$this.datepicker('setDate', _current);
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
			if ($.fn.wl_Date.defaults[key] !== undefined || $.fn.wl_Date.defaults[key] == null) {
				$this.data('wl_Date')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};