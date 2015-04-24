/*----------------------------------------------------------------------*/
/* wl_Number v 1.0 by revaxarts.com
/* description: Make a Number field out of an input field
/* dependency: mousewheel plugin 
/*----------------------------------------------------------------------*/


$.fn.wl_Number = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Number.methods[method]) {
			return $.fn.wl_Number.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Number')) {
				var opts = $.extend({}, $this.data('wl_Number'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Number.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Number')) {

			$this.data('wl_Number', {});
			
			//fetch the nativ attributes
			opts.min = $this.attr('min') || opts.min;
			opts.max = $this.attr('max') || opts.max;
			opts.step = $this.attr('step') || opts.step;

			$this.bind({

				//bind the mouswheel event
				'mousewheel.wl_Number': function (event, delta) {
					var opts = $this.data('wl_Number') || opts;
					if (opts.mousewheel) {
						event.preventDefault();
						//delta must be 1 or -1 (different on macs and with shiftkey pressed)
						delta = (delta < 0) ? -1 : 1;
						//multiply with 10 if shift key is pressed
						if (event.shiftKey) delta *= 10;
						$.fn.wl_Number.methods.change.call($this[0], delta);
					}
				},


				'change.wl_Number': function () {
					var _this = $(this);
					//correct the input
					$.fn.wl_Number.methods.correct.call($this[0]);
					//callback
					_this.data('wl_Number').onChange.call($this[0], _this.val());
				}

			});

		} else {

		}

		if (opts) $.extend($this.data('wl_Number'), opts);
	});

};

$.fn.wl_Number.defaults = {
	step: 1,
	decimals: 0,
	start: 0,
	min: null,
	max: null,
	mousewheel: true,
	onChange: function (value) {},
	onError: function (value) {}
};
$.fn.wl_Number.version = '1.0';


$.fn.wl_Number.methods = {
	correct: function () {
		var $this = $(this),
			//replace ',' with '.' because in some countries comma is the separator
			val = $this.val().replace(/,/g, '.');
		if (val) $.fn.wl_Number.methods.printValue.call(this, parseFloat(val));
	},
	change: function (delta) {
		var $this = $(this),
			//the current value
			_current = $this.val() || $this.data('wl_Number').start,
			//calculate the new value
			_new = parseFloat(_current, 10) + (delta * $this.data('wl_Number').step);
		$.fn.wl_Number.methods.printValue.call(this, _new);
		$this.trigger('change.wl_Number');
	},
	printValue: function (value) {
		var $this = $(this),
			opts = $this.data('wl_Number') || opts;

		//is not a number
		if (isNaN(value) && value != '') {
			
			//callback
			opts.onError.call(this, $this.val());
			//write '0', focus and select it
			$this.val(0).focus().select();
			$this.trigger('change.wl_Number');
			return;
		}

		//don't go over min and max values
		if (opts.min != null) value = Math.max(opts.min, value);
		if (opts.max != null) value = Math.min(opts.max, value);
		
		//decimals? use parseFloat if yes or round the value if it is an integer (no decimals)
		(opts.decimals) ? value = parseFloat(value, opts.decimals).toFixed(opts.decimals) : value = Math.round(value);
		
		//write value
		$this.val(value);
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
			if ($.fn.wl_Number.defaults[key] !== undefined || $.fn.wl_Number.defaults[key] == null) {
				$this.data('wl_Number')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};