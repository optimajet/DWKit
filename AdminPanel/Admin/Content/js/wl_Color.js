/*----------------------------------------------------------------------*/
/* wl_Color v 1.0 by revaxarts.com
/* description: Makes a colorpicker on an input field
/* dependency: miniColors Plugin
/*----------------------------------------------------------------------*/
$.fn.wl_Color = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Color.methods[method]) {
			return $.fn.wl_Color.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Color')) {
				var opts = $.extend({}, $this.data('wl_Color'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Color.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.miniColors(method, args[1]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Color')) {

			$this.data('wl_Color', {});

			//bind the mouswheel event
			$this.bind('mousewheel.wl_Color', function (event, delta) {
				if (opts.mousewheel) {
					event.preventDefault();
					//delta must be 1 or -1 (different on macs and with shiftkey pressed)
					var delta = (delta < 0) ? -1 : 1,
						hsb = $this.data('hsb');
						
						//saturation with shift key
					if(event.shiftKey){
						hsb.s -= delta*2;
						hsb.s = Math.round(Math.max(0,Math.min(100,hsb.s)));
						
						//hue with alt key
					}else if(event.altKey && event.shiftKey){
						hsb.h += delta*5;
						hsb.h = Math.round(hsb.h);
						
						//brightness without additional key
					}else{
						hsb.b += delta*2;
						hsb.b = Math.round(Math.max(0,Math.min(100,hsb.b)));
					}
					
					$this.miniColors('value',hsb);
					$this.trigger('change.wl_Color');
				}
			});
			
			//call the miniColors plugin with extra options
			$this.miniColors($.extend({}, {
				change: function (hex, rgb) {
					$(this).trigger('change.wl_Color');
				}
			}), opts).trigger('keyup.miniColors');
			
			//bind a change event to the evet field for the callback
			$this.bind('change.wl_Color', function () {
				var val = $(this).val();
				if (val && !/^#/.test(val)) val = '#'+val;
				$(this).val(val);
				opts.onChange.call($this[0], $(this).data('hsb'), val);
			})
			//hex values have 7 chars with #
			.attr('maxlength',7);

			
			//prepend a '#' if not set
			var val = $this.val();
			if (val && !/^#/.test($this.val())) {
				$this.val('#' + val.substr(0,6));
			}

		} else {

		}
		

		if (opts) $.extend($this.data('wl_Color'), opts);
	});

};

$.fn.wl_Color.defaults = {
	mousewheel: true,
	onChange: function (hsb, rgb) {}
};
$.fn.wl_Color.version = '1.0';


$.fn.wl_Color.methods = {
	destroy: function () {
		var $this = $(this);
		//destroy them
		$this.removeData('wl_Color');
		$this.miniColors('destroy');
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
			if ($.fn.wl_Color.defaults[key] !== undefined) {
				$this.data('wl_Color')[key] = value;
			} else if (key == 'value') {
				$this.val(value).trigger('keyup.miniColors');
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};