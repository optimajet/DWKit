/*----------------------------------------------------------------------*/
/* wl_Slider v 1.1.1 by revaxarts.com
/* description: 
/* dependency: jquery UI Slider, mousewheel plugin
/*----------------------------------------------------------------------*/


$.fn.wl_Slider = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Slider.methods[method]) {
			return $.fn.wl_Slider.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Slider')) {
				var opts = $.extend({}, $this.data('wl_Slider'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Slider.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.slider(method, args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}

		if (!$this.data('wl_Slider')) {

			$this.data('wl_Slider', {});

			
			//bind mousewheel events
			$this.bind('mousewheel.wl_Slider', function (event, delta) {
				if (opts.mousewheel) {
					
					//delta must be 1 or -1 (different on macs and with shiftkey pressed)
					delta = (delta < 0) ? -1 : 1;
					event.preventDefault();

					//slider with one handler
					if ($this.data('range') !== true) {
						var _value = $this.slider('value');
						$.fn.wl_Slider.methods.values.call($this[0], _value + (delta * opts.step));
						
						//update the tooltip
						if (opts.tooltip){
							var _handle = $this.find('a');

							_handle.tipsy('setTitel',opts.tooltipPattern.replace('%n', _value + (delta * opts.step)));
							_handle.tipsy('update');	
						} 
						
					//slider with two handlers
					} else {
						var _values = $this.slider('values');
						var _handler = $this.find('a'),
							_h1 = _handler.eq(0).offset(),
							_h2 = _handler.eq(1).offset();
							
						//callculate the affected handler depending on the mouseposition
						if (opts.orientation == 'horizontal') {
							if (_h1.left + (_h2.left - _h1.left) / 2 > event.clientX) {
								$.fn.wl_Slider.methods.values.call($this[0], Math.min(_values[0] + (delta * opts.step), _values[1]), _values[1]);
							} else {
								$.fn.wl_Slider.methods.values.call($this[0], _values[0], Math.max(_values[1] + (delta * opts.step), _values[0]));
							}
						} else if (opts.orientation == 'vertical') {
							if (_h2.top + (_h1.top - _h2.top) / 2 < event.pageY) {
								$.fn.wl_Slider.methods.values.call($this[0], Math.min(_values[0] + (delta * opts.step), _values[1]), _values[1]);
							} else {
								$.fn.wl_Slider.methods.values.call($this[0], _values[0], Math.max(_values[1] + (delta * opts.step), _values[0]));
							}
						}
						//update the tooltip
						if (opts.tooltip){
							_handler.eq(0).tipsy('setTitel',opts.tooltipPattern.replace('%n', _values[0] + (delta * opts.step)));
							_handler.eq(0).tipsy('update');
							_handler.eq(1).tipsy('setTitel',opts.tooltipPattern.replace('%n', _values[0] + (delta * opts.step)));
							_handler.eq(1).tipsy('update');
						} 
					}
					$.fn.wl_Slider.methods.slide.call($this[0]);
				}
			});
		} else {
			//destroy it
			$this.unbind('slide slidechange').slider('destroy');
		}


		//call the jQuery UI slider plugin and add callbacks
		$this.slider(opts).bind('slide', function (event, ui) {
			$.fn.wl_Slider.methods.slide.call($this[0], ui.value);
		}).bind('slidechange', function (event, ui) {
			$.fn.wl_Slider.methods.change.call($this[0], ui.value);
		});


		//slider is connected to an input field
		if (opts.connect) {
			
			//single slider
			if ($this.data('range') !== true) {
				var _input = $('#' + opts.connect),
					_value = _input.val() || $this.data('value') || opts.min;
					
				if(!_input.data('wl_Number')) _input.wl_Number();

				$this.unbind('slide slidechange').slider('value', _value);
				
				//set callbacks on slide to change input fields
				$this.bind('slide', function (event, ui) {
					_input.val(ui.value);
					$.fn.wl_Slider.methods.slide.call($this[0], ui.value);
				}).bind('slidechange', function (event, ui) {
					_input.val(ui.value);
					$.fn.wl_Slider.methods.change.call($this[0], ui.value);
				});
				_input.val(_value).wl_Number('set', $.extend({}, opts, {
					onChange: function (value) {
						$this.slider('value', value);
						$this.wl_Slider('slide');
						$this.wl_Slider('change');
					}
				}));
				
			//range slider with two handlers
			} else {
				var _input = $.parseData(opts.connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]),
					_value1 = _input1.val() || $this.data('values')[0] || opts.min,
					_value2 = _input2.val() || $this.data('values')[1] || opts.max;

				if(!_input1.data('wl_Number')) _input1.wl_Number();
				if(!_input2.data('wl_Number')) _input2.wl_Number();
				
				//set callbacks on slide to change input fields
				$this.unbind('slide slidechange').slider('option', 'values', [_value1, _value2]).bind('slide', function (event, ui) {
					_input1.val(ui.values[0]);
					_input2.val(ui.values[1]);
					$.fn.wl_Slider.methods.slide.call($this[0], ui.values);
				}).bind('slidechange', function (event, ui) {
					_input1.val(ui.values[0]);
					_input2.val(ui.values[1]);
					$.fn.wl_Slider.methods.change.call($this[0], ui.values);
				});

				//set callbacks to the connected input fields
				_input1.wl_Number('set', $.extend({}, opts, {
					onChange: function (value) {
						$this.slider('option', 'values', [value, _input2.val()]);
						_input2.wl_Number('set', 'min', parseFloat(value));
						$this.wl_Slider('slide');
						$this.wl_Slider('change');
					},
					min: opts.min,
					max: _input2.val() || _value2
				})).val(_value1);

				_input2.wl_Number('set', $.extend({}, opts, {
					onChange: function (value) {
						$this.slider('option', 'values', [_input1.val(), value]);
						_input1.wl_Number('set', 'max', parseFloat(value));
						$this.wl_Slider('slide');
						$this.wl_Slider('change');
					},
					min: _input1.val() || _value1,
					max: opts.max
				})).val(_value2);
			}
		}
		
		//activate tooltip
		if(opts.tooltip){
			
			var e = $this.find('.ui-slider-handle');
			var gravity, handles = [];
			
			//set the gravity
			if($.isArray(opts.tooltipGravity)){
				if(opts.orientation == 'horizontal'){
					gravity = opts.tooltipGravity[0];
				}else if(opts.orientation == 'vertical'){
					gravity = opts.tooltipGravity[1];
				}
			}else{
				gravity = opts.tooltipGravity;
			}
			
			//for each handle (e)
			$.each(e, function(i,handle){
				
				var value;
				
				handles.push($(handle));
				
				//get the value as array. set it to zero if undefined (required for init)
				if(opts.values){
					value = opts.values;
				}else if(opts.value){
					value = [opts.value];
				}else{
					value = [0,0];	
				}
				
				//use tipsy for a tooltip
				handles[i].tipsy($.extend({}, config.tooltip, {
					trigger: 'manual',
					gravity: gravity,
					html: true,
					fallback: opts.tooltipPattern.replace('%n',value[i]),
					appendTo: handles[i]
				}));
				
				//prevent the tooltip to wrap
				var tip = handles[i].tipsy('tip');
				tip.find('.tipsy-inner').css('white-space','nowrap');
				
				//bind events to the handler(s)
				handles[i].bind({
					'mouseenter.wl_Slider touchstart.wl_Slider':function(){handles[i].tipsy('show');},
					'mouseleave.wl_Slider touchend.wl_Slider':function(){handles[i].tipsy('hide');},
					'mouseenter touchstart':function(){handles[i].data('mouseIsOver',true);},
					'mouseleave touchend':function(){handles[i].data('mouseIsOver',false);}
				});
				
			});
			
			
			$this
			//unbind events if the slider starts (prevents flickering if the cursor leaves the handle)
			.bind('slidestart', function (event, ui) {
				$(ui.handle).unbind('mouseleave.wl_Slider touchstart.wl_Slider mouseenter.wl_Slider touchend.wl_Slider');
			})
			//rebind them again on slidestop
			.bind('slidestop', function (event, ui) {
				var handle = $(ui.handle);
				handle.bind({
					'mouseenter.wl_Slider touchstart.wl_Slider':function(){handle.tipsy('show');},
					'mouseleave.wl_Slider touchend.wl_Slider':function(){handle.tipsy('hide');}
				});
				//hide the tooltip if the mouse isn't over the handle
				if(!handle.data('mouseIsOver'))handle.tipsy('hide');
			})
			
			//update the tooltip on the slide event
			.bind('slide', function (event, ui) {
				var handle = $(ui.handle);
				handle.tipsy('setTitel',opts.tooltipPattern.replace('%n',ui.value));
				handle.tipsy('update');
			});
			
			
		}

		//disable if set
		if (opts.disabled) {
			$this.fn.wl_Slider.methods.disable.call($this[0]);
		}

		if (opts) $.extend($this.data('wl_Slider'), opts);
	});

};

$.fn.wl_Slider.defaults = {
	min: 0,
	max: 100,
	step: 1,
	animate: false,
	disabled: false,
	orientation: 'horizontal',
	range: false,
	mousewheel: true,
	connect: null,
	tooltip: false,
	tooltipGravity: ['s','w'],
	tooltipPattern: '%n',
	onSlide: function (value) {},
	onChange: function (value) {}
};
$.fn.wl_Slider.version = '1.1.1';


$.fn.wl_Slider.methods = {
	disable: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		
		//disable slider
		$this.slider('disable');
		
		//disable connected input fields
		if (opts.connect) {
			if ($this.data('range') !== true) {
				$('#' + opts.connect).prop('disabled', true);
			} else {
				var _input = $.parseData(opts.connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]);
				_input1.attr('disabled', true);
				_input2.attr('disabled', true);
			}
		}
		$this.data('wl_Slider').disabled = true;
	},
	enable: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		
		//enable slider
		$this.slider('enable');
		
		//enable connected input fields
		if ($this.data('wl_Slider').connect) {
			if ($this.data('range') !== true) {
				$('#' + opts.connect).prop('disabled', false);
			} else {
				var _input = $.parseData(opts.connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]);
				_input1.removeAttr('disabled');
				_input2.removeAttr('disabled');
			}
		}
		$this.data('wl_Slider').disabled = false;
	},
	change: function (value) {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if ($this.data('range') !== true) {
			opts.onChange.call(this, value || $this.slider('value'));
		} else {
			opts.onChange.call(this, value || $this.slider('values'));
		}
	},
	slide: function (value) {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if ($this.data('range') !== true) {
			opts.onSlide.call(this, value || $this.slider('value'));
		} else {
			opts.onSlide.call(this, value || $this.slider('values'));
		}
	},
	value: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if (opts.range !== true) {
			$this.slider('value', arguments[0]);
		}
	},
	values: function () {
		var $this = $(this),
			opts = $this.data('wl_Slider');
		if (opts.range === true) {
			if (typeof arguments[0] === 'object') {
				$this.slider('values', 0, arguments[0][0]);
				$this.slider('values', 1, arguments[0][1]);
			} else {
				$this.slider('values', 0, arguments[0]);
				$this.slider('values', 1, arguments[1]);
			}
		} else {
			$.fn.wl_Slider.methods.value.call(this, arguments[0]);
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
		if ($this.data('wl_Slider').connect) {
			if ($this.data('range') !== true) {
				var _input1 = $('#' + $this.data('wl_Slider').connect);
			} else {
				var _input = $.parseData($this.data('wl_Slider').connect, true),
					_input1 = $('#' + _input[0]),
					_input2 = $('#' + _input[1]);
			}
		}
		$.each(options, function (key, value) {
			if ($.fn.wl_Slider.defaults[key] !== undefined || $.fn.wl_Slider.defaults[key] == null) {
				$this.slider('option', key, value).data('wl_Slider')[key] = value;
				if (_input1) _input1.data(key, value).trigger('change');
				if (_input2) _input2.data(key, value).trigger('change');
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};