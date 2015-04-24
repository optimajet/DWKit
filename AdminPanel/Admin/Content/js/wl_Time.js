/*----------------------------------------------------------------------*/
/* wl_Time v 1.0 by revaxarts.com
/* description: makes a timefield out of an input field
/* dependency: jQuery Datepicker, mousewheel plugin, $.leadingZero
/*----------------------------------------------------------------------*/


$.fn.wl_Time = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Time.methods[method]) {
			return $.fn.wl_Time.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Time')) {
				var opts = $.extend({}, $this.data('wl_Time'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Time.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Time')) {

			$this.data('wl_Time', {});

			$this.bind({

				'mousewheel.wl_Time': function (event, delta) {
					var opts = $this.data('wl_Time') || opts;
					if (opts.mousewheel) {
						event.preventDefault();
						
						//delta must be 1 or -1 (different on macs and with shiftkey pressed)
						delta = (delta < 0) ? -1 : 1;
						
						//scroll thru hours if shift key is pressed
						if (event.shiftKey) delta *= 60 / opts.step;
						$.fn.wl_Time.methods.change.call($this[0], delta);
					}
				},

				'change.wl_Time': function () {
					var opts = $this.data('wl_Time') || opts;
					
					//correct input value
					$.fn.wl_Time.methods.correct.call($this[0]);
					//print it
					$.fn.wl_Time.methods.printTime.call($this[0]);
					//callback
					opts.onChange.call($this[0], opts.time);
				}
				
				//for 12h format ad a little span after the input and set length to 5 (hh:mm)
			}).after('<span class="timeformat"/>').attr('maxlength', 5);


			//is connected to a datepicker
			if (opts.connect !== null) {
				var _date = $('#' + opts.connect),
					_oldcallback = opts.onDateChange;

				//set a callback if the time reaches another date
				_callback = function (offset) {
					var current = new Date(_date.datepicker('getDate')).getTime();
					if (current) _date.datepicker('setDate', new Date(current + (864e5 * offset)));
					_oldcallback.call($this[0], offset);
				};
				opts.onDateChange = _callback;
			}


			//value is set and has to get translated (self-explanatory) 
			if (opts.value) {
				var now = new Date().getTime(),
					date;
				switch (opts.value) {
				case 'now':
					date = new Date(now);
					break;
				default:
					//if a valid number add them as days to the date field
					if (!isNaN(opts.value)) date = new Date(now + (60000 * (opts.value % 60)));
				}
				
				//set the time (hh:mm)
				opts.time = $.leadingZero(date.getHours()) + ':' + $.leadingZero(date.getMinutes());
				//write it into the input
				$this.val(opts.time);
			}

		} else {

		}

		if (opts) $.extend($this.data('wl_Time'), opts);
	});

};

$.fn.wl_Time.defaults = {
	step: 5,
	timeformat: 24,
	roundtime: true,
	time: null,
	value: null,
	mousewheel: true,
	onDateChange: function (offset) {},
	onHourChange: function (offset) {},
	onChange: function (value) {}
};
$.fn.wl_Time.version = '1.0';



$.fn.wl_Time.methods = {
	change: function (delta) {
		var $this = $(this),
			opts = $this.data('wl_Time'),
			_current = new Date('2010/01/01 ' + ($this.data('wl_Time').time || '00:00')),
			_new = new Date(_current.getTime() + (delta * $this.data('wl_Time').step * 60000)),
			_hours = _new.getHours(),
			_minutes = _new.getMinutes();

		//round the time on a mousewheel
		if (opts.roundtime) {
			_minutes -= (_minutes % $this.data('wl_Time').step);
		}

		//save time
		$this.data('wl_Time').time = $.leadingZero(_hours) + ':' + $.leadingZero(_minutes);
		
		//and print it
		$.fn.wl_Time.methods.printTime.call(this);

		//callbacks
		opts.onChange.call(this, $this.data('wl_Time').time);
		if (Math.abs(_current.getMinutes() - _minutes) == (60 - opts.step)) {
			opts.onHourChange.call(this, (_hours - _current.getHours()));
		}
		if (Math.abs(_current.getHours() - _hours) == (23)) {
			opts.onDateChange.call(this, (_hours) ? -1 : 1);
		}
	},
	printTime: function () {
		var $this = $(this),
			opts = $this.data('wl_Time'),
			time = opts.time;
	
		if (time) {
			time = time.split(':');
			
			//calculate the 12h format
			if (opts.timeformat == 12) {
				$this.val($.leadingZero(((time[0] % 12 == 0) ? 12 : time[0] % 12)) + ':' + $.leadingZero(time[1])).next().html((time[0] / 12 >= 1) ? 'pm' : 'am');
			
			//or set the 24h format
			} else {
				$this.val($.leadingZero(time[0]) + ':' + $.leadingZero(time[1]));
			}
		}
	},
	correct: function () {
		var $this = $(this),
			val = $this.val(),
			time;
		
		//no value => stop
		if (val == '') return;
		
		//it is not hh:mm format
		if (!/^\d+:\d+$/.test(val)) {
			
			//convert the input (read the docs for more details)
			if (val.length == 1) {
				val = "0" + val + ":00";
			} else if (val.length == 2) {
				val = val + ":00";
			} else if (val.length == 3) {
				val = val.substr(0, 2) + ":" + val.substr(2, 3) + "0";
			} else if (val.length == 4) {
				val = val.substr(0, 2) + ":" + val.substr(2, 4);
			}
		}
		time = val.split(':');
		
		//value is wrong or out of range
		if (!/\d\d:\d\d$/.test(val) && val != "" || time[0] > 23 || time[1] > 59) {
			$this.val('00:00').focus().select();
			$this.data('wl_Time').time = '00:00';
			$.fn.wl_Time.methods.printTime.call(this);
		
		//value is a time
		} else {
			//save it
			$this.data('wl_Time').time = val;
			//print it
			$.fn.wl_Time.methods.printTime.call(this);
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
			if ($.fn.wl_Time.defaults[key] !== undefined || $.fn.wl_Time.defaults[key] == null) {
				$this.data('wl_Time')[key] = value;
				$this.trigger('change.wl_Time');
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};