/*----------------------------------------------------------------------*/
/* wl_Form v 1.3.3 by revaxarts.com
/* description:	handles the serialization, unserialization and sending
/*				of a form
/* dependency: 	$.confirm, wl_Number*, wl_Slider*, wl_Date*, wl_Value*,
/* 				wl_Password*, wl_File*, wl_Multiselect*
/*				* only when fields are within the form
/*----------------------------------------------------------------------*/
$.fn.wl_Form = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Form.methods[method]) {
			return $.fn.wl_Form.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Form')) {
				var opts = $.extend({}, $this.data('wl_Form'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Form.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}

		//all fields within that form
		var $inputs = $this.find('input,textarea,select,div.date,div.slider'),
			//$required = $inputs.filter('[required]'), //Doenst work on IE7/8
			$submitbtn = (opts.submitButton instanceof jQuery) ? opts.submitButton : $this.find(opts.submitButton),
			$resetbtn = (opts.resetButton instanceof jQuery) ? opts.resetButton : $this.find(opts.resetButton);

		if (!$this.data('wl_Form')) {

			$this.data('wl_Form', {});

			//get options from the forms nativ attributes
			opts.action = $this.attr('action') || opts.action;
			opts.method = $this.attr('method') || opts.method;

			//prevent the forms default behaviour
			$this.bind({
				'submit.wl_Form': function (event) {
					event.preventDefault();
					return false;
				},
				'reset.wl_Form': function (event) {
					event.preventDefault();
					return false;
				}
			});

			//bind the click action to the submit button
			$submitbtn.bind('click.wl_Form', function (event) {
				$.fn.wl_Form.methods.submit.call($this[0]);
				return false;
			});
			//bind the click action to the submit button
			$resetbtn.bind('click.wl_Form', function (event) {
				$.fn.wl_Form.methods.reset.call($this[0]);
				return false;
			});

			//iterate through the fields
			$inputs.each(function () {
				var _this = $(this),
					_row = _this.closest('section'),
					//the label should be nice readable
					_label = _row.find('label').eq(0).html() || this.name || this.id || '';
					


				//This is required because IEs < 9 can't handle this as expected
				if (_this.is('[required]') || typeof _this.prop('required') == 'string') {
					_this.data('required', true);
					//only append one required asterix
					if(!_row.find('span.required').length) _row.find('label').eq(0).append('&nbsp;<span class="required">&nbsp;</span>');
				}

				//add the label to the field (and strip out unwanted info)
				_this.data('wl_label', _label.replace(/<span>([^<]+)<\/span>|<([^>]+)\/?>/g, ''));

				//set initial data for Form reset
				_this.data('wl_initdata', function () {

					var _type = _this.attr("type");

					if (_type == "checkbox" || _type == "radio") {
						return _this.prop("checked");

						//datepicker
					} else if (_this.data('wl_Date')) {
						return _this.datepicker('getDate');

						//slider
					} else if (_this.data('wl_Slider')) {
						if (!_this.data('wl_Slider').connect) {
							if (_this.data('wl_Slider').range) {
								return _this.slider('option', 'values');
							} else {
								return _this.slider('option', 'value');
							}
						}
						//other fields
					} else {
						return _this.val();
					}

				}());
			});


			//set the form status after the submit button if status is true
			if (opts.status && !$submitbtn.closest('div').is('span.wl_formstatus')) {
				$submitbtn.closest('div').append('<span class="wl_formstatus"></span>');
			}

			//parse the location.search parameters
			if (opts.parseQuery) {
				$this.wl_Form.methods.unserialize.call(this);
			}


		} else {

		}

		if (opts) $.extend($this.data('wl_Form'), opts);
	});

};

$.fn.wl_Form.defaults = {
	submitButton: 'button.submit',
	resetButton: 'button.reset',
	method: 'post',
	action: null,
	ajax: true,
	serialize: false,
	parseQuery: true,
	dataType: 'text',
	status: true,
	sent: false,
	confirmSend: true,
	text: {
		required: 'This field is required',
		valid: 'This field is invalid',
		password: 'This password is to short',
		passwordmatch: 'This password doesn\'t match',
		fileinqueue: 'There is at least one file in the queue',
		incomplete: 'Please fill out the form correctly!',
		send: 'send form...',
		sendagain: 'send again?',
		success: 'form sent!',
		error: 'error while sending!',
		parseerror: 'Can\'t unserialize query string:\n %e'
	},
	tooltip: {
		gravity: 'nw'
	},
	onRequireError: function (element) {},
	onValidError: function (element) {},
	onPasswordError: function (element) {},
	onFileError: function (element) {},
	onBeforePrepare: function () {},
	onBeforeSubmit: function (data) {},
	onReset: function () {},
	onComplete: function (textStatus, jqXHR) {},
	onError: function (textStatus, error, jqXHR) {},
	onSuccess: function (data, textStatus, jqXHR) {}
};
$.fn.wl_Form.version = '1.3.3';


$.fn.wl_Form.methods = {
	disable: function () {
		var $this = $(this),
			_inputs = $this.find($this.data('wl_Form').submitButton + ',input,textarea,select,div.date,div.slider');
		//iterate through all fields
		_inputs.each(function () {
			var _this = $(this);
			if (_this.is('div')) {
				//disable slider and datefields
				if (_this.is('div.slider') && _this.data('wl_Slider')) {
					_this.wl_Slider('disable');
				} else if (_this.is('div.date') && _this.data('wl_Date')) {
					_this.wl_Date('disable');
				}
			} else {
				//disable normal fields
				_this.prop('disabled', true);
			}
		});
		$this.data('wl_Form').disabled = true;
	},
	enable: function () {
		var $this = $(this),
			_inputs = $this.find($this.data('wl_Form').submitButton + ',input,textarea,select,div.date,div.slider');
		//iterate through all fields
		_inputs.each(function () {
			var _this = $(this);
			if (_this.is('div')) {
				//enable slider and datefields
				if (_this.is('div.slider') && _this.data('wl_Slider')) {
					_this.wl_Slider('enable');
				} else if (_this.is('div.date') && _this.data('wl_Date')) {
					_this.wl_Date('enable');
				}
			} else {
				//enable normal fields
				_this.prop('disabled', false);
			}
		});
		$this.data('wl_Form').disabled = false;
	},
	reset: function () {
		var $this = $(this),
			_inputs = $this.find('input,textarea,select,div.date,div.slider');

		//trigger callback
		if ($this.data('wl_Form').onReset.call($this[0]) === false) return false;

		//remove all errorclasses
		$this.find('section.error').removeClass('error');
		
		//iterate through all fields
		_inputs.each(function () {
			var _this = $(this),
				_type = _this.attr("type");

			if (_type == "checkbox") {
				_this.prop("checked", _this.data('wl_initdata')).trigger('change');

				//radio buttons
			} else if (_type == "radio") {
				_this.prop("checked", _this.data('wl_initdata')).trigger('change');

				//datepicker
			} else if (_this.data('wl_Date')) {
				_this.datepicker('setDate', _this.data('wl_initdata'));

				//time 
			} else if (_this.data('wl_Time')) {
				_this.val(_this.data('wl_initdata'));

				//multi select
			} else if (_this.data('wl_Multiselect')) {
				_this.wl_Multiselect('clear');
				_this.wl_Multiselect('select', _this.data('wl_initdata'));

				//slider
			} else if (_this.data('wl_Slider')) {
				if (!_this.data('wl_Slider').connect) {
					if (_this.data('wl_Slider').range) {
						_this.slider('option', 'values', $.parseData(_this.data('wl_initdata')));
					} else {
						_this.slider('option', 'value', _this.data('wl_initdata'));
					}
					_this.wl_Slider("change");
					_this.wl_Slider("slide");
				}
				//prevent file inputs to get triggered
			} else if (_this.data('wl_File')) {
				_this.wl_File('reset');

				//wysiwyg editor
			} else if (_this.data('wl_Editor')) {
				_this.val(_this.data('wl_initdata')).wysiwyg("setContent", _this.data('wl_initdata'));

				//colorpicker
			} else if (_this.data('wl_Color')) {
				_this.wl_Color('set', 'value', _this.data('wl_initdata'));

				//other fields
			} else {
				_this.val(_this.data('wl_initdata')).trigger('change');

				//placeholder text needs some CSS
				if (_this.is('[placeholder]')) {
					if (_this.data('wl_initdata') == "" || _this.data('wl_initdata') == _this.attr("placeholder")) {
						_this.addClass("placeholder").val(_this.attr("placeholder")).data("uservalue", false);
					} else {
						_this.removeClass("placeholder").data("uservalue", true);
					}
				}
			}

		});
	},
	submit: function () {

		//collect some required info
		var $this = $(this),
			_data = {},
			_opts = $this.data('wl_Form'),
			_inputs = $this.find('input,textarea,select,div.date,div.slider'),
			_statusel = $this.find('.wl_formstatus'),
			_requiredelements = Array(),
			_validelements = Array(),
			_passwordelements = Array(),
			_fileelements = Array(),
			_submit = true,
			_submitbtn = (_opts.submitButton instanceof jQuery) ? _opts.submitButton : $this.find(_opts.submitButton),
			_callbackReturn, _addHiddenField = function (after, id, name, value) {
				if (!$('#' + id).length) $('<input>', {
					type: 'hidden',
					id: id,
					name: name,
					value: value
				}).insertAfter(after);
			};

		//status reset
		_statusel.text("");

		//iterate through all fields
		_inputs.each(function (i, e) {
			var _this = $(this),
				_row = _this.closest('section');

			//remove all error classes
			_row.removeClass('error');

			//if a placeholder is set remove the value temporary
			if (_this.prop('placeholder') && _this.val() == _this.prop('placeholder') && !_this.data('uservalue')) {
				_this.val('');
			}
			//if field is required and a value isn't set or it is a checkbox and the checkbox isn't checked or it is a file upload with no files
			if (_this.data('required')) {
				if ((!_this.val() || _this.is(':checkbox') && !_this.is(':checked')) && !_this.data('wl_File')) {
					_requiredelements.push(_this);
					_submit = false;
				} else if (_this.is(':radio')) {
					
					//get all checked radios;
					var checked = $('input[name='+_this.attr('name')+']:checked');
					//no radio button is selected
					if(!checked.length){
						_requiredelements.push(_this);
						_submit = false;
					}

				} else if (_this.data('wl_File') && !_this.data('wl_File').files.length) {
					//use the filepool for the tooltip
					_requiredelements.push(_row.find('.fileuploadpool').eq(0));
					_submit = false;

				}
			}
			//if it is a valid field but it isn't valid
			if (_this.data('wl_Valid') && !_this.data('wl_Valid').valid) {
				_validelements.push(_this);
				_submit = false;
			}
			//check if there is a file in the queue
			if (_this.data('wl_File') && !$.isEmptyObject(_this.data('wl_File').queue)) {
				//use the filepool for the tooltip
				_fileelements.push(_row.find('.fileuploadpool').eq(0));
				_submit = false;
			}
			//if it is a password
			if (_this.data('wl_Password')) {
				var value = _this.val();
				//password confirmation is set and the confirmation isn't equal the password or the password is shorter than the minlength of the password field
				if ((_this.data('wl_Password').confirm && _this.data('wl_Password').connect && value != $('#' + _this.data('wl_Password').connect).val()) || (value && value.length < _this.data('wl_Password').minLength)) {
					//_row.addClass('error');
					_passwordelements.push(_this);
					_submit = false;

				}
			};
		});

		//if some of the above errors occures
		if (!_submit) {

			//iterate through all required fields
			$.each(_requiredelements, function (i, e) {
												
				var _row = e.closest('section');
				_row.addClass('error');
				
				//callback
				_opts.onRequireError.call(e[0], e);

				//use tipsy for a tooltip
				e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
					trigger: 'manual',
					fallback: e.data('errortext') || _opts.text.required
				}));
				e.tipsy('show');

				//hide the tooltip on every radio button
				if(e.is(':radio')){
					var radiosiblings = $('input[name='+e.attr('name')+']');
					radiosiblings.bind('focus.tooltip, click.tooltip, change.tooltip', function () {
						e.unbind('focus.tooltip, click.tooltip, change.tooltip').tipsy('hide');
					});
				}else{
					//hide tooltip on fieldfocus or change
					e.bind('focus.tooltip, click.tooltip, change.tooltip', function () {
						$(this).unbind('focus.tooltip, click.tooltip, change.tooltip').tipsy('hide');
					});
				}
			});


			//iterate through all valid fields
			$.each(_validelements, function (i, e) {
												
				var _row = e.closest('section');
				//highlight the row
				_row.addClass('error');
				
				//callback
				_opts.onValidError.call(e[0], e);

				//use tipsy for a tooltip
				e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
					trigger: 'manual',
					fallback: e.data('errortext') || e.data('wl_Valid').errortext || _opts.text.valid
				}));
				e.tipsy('show');

				//hide tooltip on fieldfocus
				e.bind('focus.tooltip, click.tooltip', function () {
					$(this).unbind('focus.tooltip, click.tooltip').tipsy('hide');
				});
			});

			//iterate through all password fields
			$.each(_passwordelements, function (i, e) {
				var text = '',
					value = e.val(),
					_row = e.closest('section');
					
				//highlight the row
				_row.addClass('error');
				
				//confirmation is set
				if (e.data('wl_Password').confirm) {
					var connect = $('#' + e.data('wl_Password').connect);

					//but password is not equal confimration
					if (value != connect.val()) {

						//tipsy on the confirmation field
						connect.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
							trigger: 'manual',
							fallback: connect.data('errortext') || _opts.text.passwordmatch
						}));
						connect.tipsy('show');

						//hide tooltip in fieldfocus
						connect.bind('focus.tooltip, click.tooltip', function () {
							$(this).unbind('focus.tooltip, click.tooltip').tipsy('hide');
						});
					}
				}

				//length is to short
				if (value.length < e.data('wl_Password').minLength) {
					_opts.onPasswordError.call(e[0], e);

					//tipsy
					e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
						trigger: 'manual',
						fallback: e.data('errortext') || _opts.text.password
					}));
					e.tipsy('show');

					//hide tooltip in fieldfocus
					e.bind('focus.tooltip, click.tooltip', function () {
						$(this).unbind('focus.tooltip, click.tooltip').tipsy('hide');
					});
				}

			});

			//iterate through all file upload fields
			$.each(_fileelements, function (i, e) {

				var _row = e.closest('section');
				//highlight the row
				_row.addClass('error');
				//callback
				_opts.onFileError.call(e[0], e);

				//use tipsy for a tooltip
				e.tipsy($.extend({}, config.tooltip, _opts.tooltip, {
					trigger: 'manual',
					fallback: e.data('errortext') || _opts.text.fileinqueue
				}));
				e.tipsy('show');

				//hide tooltip on fieldfocus or change
				e.bind('focus.tooltip, click.tooltip, change.tooltip', function () {
					$(this).unbind('focus.tooltip, click.tooltip, change.tooltip').tipsy('hide');
				});
			});
			//Set status message
			_statusel.text(_opts.text.incomplete);
			return false;
		}


		//confirmation is required if the form was allready sent
		if (_opts.confirmSend && _opts.sent === true) {
			$.confirm(_opts.text.sendagain, function () {
				_opts.sent = false;
				$.fn.wl_Form.methods.submit.call($this[0]);
			});
			return false;
		}

		//callback can return false
		if (_opts.onBeforePrepare.call($this[0]) === false) {
			return false;
		}

		//iterate through all fields and prepare data
		_inputs.each(function (i, e) {
			var _el = $(e),
				key = _el.attr('name') || e.id,
				value = null;

			//datepicker
			if (_el.data('wl_Date')) {

				var connect = $this.find('input[data-connect=' + e.id + ']').eq(0),
					dateobj = new Date(_el.datepicker('getDate')),
					//format: YYYY-MM-DD
					date = dateobj.getFullYear() + '-' + $.leadingZero(dateobj.getMonth() + 1) + '-' + $.leadingZero(dateobj.getDate());
				if (dateobj.getTime()) {
					//is connected to a timefield
					if (connect.length) {
						value = date + ' ' + (connect.data('wl_Time').time || '00:00');
						//insert a hidden field for non ajax submit
						if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, value);
					} else {
						value = date;
						//correct the format on nativ submit
						if (!_opts.ajax) _el.val(value);
					}
				}

				//inline Date needs a hidden input for nativ submit
				if (!_opts.ajax && _el.is('div')) {
					_addHiddenField(_el, key + '_wlHidden', key, value)
				}
				_data[key] = value;

				//slider
			} else if (_el.data('wl_Slider')) {

				//if it is connected we have a input field too so skip it
				if (!_el.data('wl_Slider').connect) {
					if (_el.data('wl_Slider').range !== true) {
						value = _el.slider('option', 'value');
						//insert a hidden field for non ajax submit
						if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, value);
					} else {
						value = _el.slider('option', 'values');
						//insert hidden fields for non ajax submit
						if (!_opts.ajax) {
							for (var i = value.length - 1; i >= 0; i--) {
								_addHiddenField(_el, key + '_' + i + '_wlHidden', key + '[]', value[i]);
							}
						}
					}
					_data[key] = value;

				} else {
					//form needs a name attribute for nativ submit
					if (!_opts.ajax) {
						if (_el.data('wl_Slider').range !== true) {
							var input = $('#' + _el.data('wl_Slider').connect);
							if (!input.attr('name')) input.attr('name', _el.data('wl_Slider').connect);
						} else {
							var connect = $.parseData(_el.data('wl_Slider').connect, true);
							var input1 = $('#' + connect[0]);
							var input2 = $('#' + connect[1]);
							if (!input1.attr('name')) input1.attr('name', connect[0]);
							if (!input2.attr('name')) input2.attr('name', connect[1]);
						}
					}
				}

				//wysiwyg editor
			} else if (_el.data('wl_Editor')) {

				//copy the content to the textarea
				_el.wysiwyg('save');
				_data[key] = _el.val();

				//file upload
			} else if (_el.data('wl_File')) {

				_data[key] = _el.data('wl_File').files;

				//if no file was uploaded value is null
				if ($.isEmptyObject(_data[key])) {
					_data[key] = null;
					//insert a hidden field for non ajax submit
					if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, 'null');
				} else {
					//insert hidden fields for non ajax submit
					if (!_opts.ajax) {
						for (var i = _data[key].length - 1; i >= 0; i--) {
							_addHiddenField(_el, key + '_' + i + '_wlHidden', key + '[]', _data[key][i]);
						}
					}
				}

				//timefield
			} else if (_el.data('wl_Time')) {

				//if it is connected we have a datefield too so skip it
				if (!_el.data('wl_Time').connect) {
					_data[key] = _el.data('wl_Time').time;

					//insert a hidden field for non ajax submit
					if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, _el.data('wl_Time').time);
				}


				//password
			} else if (_el.data('wl_Password')) {

				//only add if it's not the confirmation field
				if (!_el.data('wl_Password').confirmfield) _data[key] = _el.val();
				if (!_opts.ajax && _el.data('wl_Password').confirmfield) _el.prop('disabled', true);

				//radio buttons
			} else if (_el.is(':radio')) {

				if (_el.is(':checked')) {
					//use the value attribute if present or id as fallback (new in 1.1)
					_data[key] = (_el.val() != 'on') ? _el.val() : e.id;
				}

				//checkbox
			} else if (_el.is(':checkbox')) {

				//if checkbox name has '[]' at the and we need an array
				if (/\[\]$/.test(key)) {
					_data[key] = _data[key] || [];
					//checkbox is checked
					if (_el.is(':checked')) {
						//if value = 'on' value isn't set use id or val if id isn't defined
						var val = _el.val();
						_data[key].push((val != 'on') ? val : _el.attr('id') || val);
					}
				} else {
					_data[key] = _el.is(':checked');
				}

				//insert a hidden field for non ajax submit
				if (!_opts.ajax) _addHiddenField(_el, key + '_wlHidden', key, _data[key]);

				//number field
			} else if (_el.data('wl_Number')) {

				value = _el.val();
				if (isNaN(value)) {
					value = null;
				}
				_data[key] = value;

				//other fields
			} else {
				var val = _el.val();
				//if name attribute has '[]' at the and we need an array
				if (/\[\]$/.test(key) && !$.isArray(val)) {
					_data[key] = _data[key] || [];
					_data[key].push(val);
				} else {
					_data[key] = val;
				}
			}
		});
		
		//add the name attribut of the submit button to the data (native behavior)
		var submitbtnname = _submitbtn.attr('name');
		if(submitbtnname){
			_data[submitbtnname] = _submitbtn.attr('value') || true;
			//insert a hidden field for non ajax submit
			if (!_opts.ajax) _addHiddenField(_submitbtn, submitbtnname + '_wlHidden', submitbtnname, _data[submitbtnname]);
		}


		//callback
		_callbackReturn = _opts.onBeforeSubmit.call($this[0], _data);

		//can return false to prevent sending
		if (_callbackReturn === false) {
			return false;
			//can return an object to modifie the _data
		} else if (typeof _callbackReturn == 'object') {
			_data = _callbackReturn;
		}


		//should we serialize it? (key=value&key2=value2&...)
		if (_opts.serialize) {
			_data = $.param(_data);
		}
		//set status text
		_statusel.text(_opts.text.send);

		//send the form natively
		if (!_opts.ajax) {
			$this.unbind('submit.wl_Form');
			$this.submit();
			return false;
		}

		//now disable it
		$.fn.wl_Form.methods.disable.call(this);


		//send the form
		$.ajax({
			url: _opts.action,
			type: _opts.method,
			data: _data,
			dataType: _opts.dataType,
			//callback on success
			success: function (data, textStatus, jqXHR) {
				_statusel.textFadeOut(_opts.text.success);
				_opts.onSuccess.call($this[0], data, textStatus, jqXHR);
			},
			//callback on complete
			complete: function (jqXHR, textStatus) {
				$.fn.wl_Form.methods.enable.call($this[0]);
				_opts.sent = true;
				_opts.onComplete.call($this[0], textStatus, jqXHR);
			},
			//callback on error
			error: function (jqXHR, textStatus, error) {
				_statusel.text(_opts.text.error);
				_opts.onError.call($this[0], textStatus, error, jqXHR);
			}
		});

	},
	unserialize: function (string) {
		var $this = $(this),
			_searchquery = string || location.search.substr(1);

		//parse only if we have something to parse
		if (_searchquery) {

			//could throw an error because its an userinput
			try {

				//prepare string to get a clean array with with key => value
				values = decodeURIComponent(_searchquery).split('&');

				var serialized_values = [];

				$.each(values, function () {
					var properties = this.split("="),
						key = properties.shift();

					properties = properties.join('=');

					if ((typeof key !== 'undefined') && (typeof properties !== 'undefined')) {
						key = key.replace(/\+/g, " ");
						//handle Array
						if (/\[\]$/.test(key)) {
							key = key.replace('[]', '');
							serialized_values[key] = serialized_values[key] || [];
							serialized_values[key].push(properties.replace(/\+/g, " "));
						} else {
							serialized_values[key] = properties.replace(/\+/g, " ");
						}
					}
				});
				values = serialized_values;

				// Iterate through each element
				$this.find("input,textarea,select,div.date,div.slider").each(function () {
					var _this = $(this),
						_type = _this.attr("type"),
						tag_name = this.name || this.id;

					//remove '[]' if present
					if (/\[\]$/.test(tag_name)) tag_name = tag_name.replace('[]', '');

					// Set the values to field
					if (values[tag_name] != null) {

						//chechboxes
						if (_type == "checkbox") {
							_this.data('wl_initdata', (values[tag_name] == 'true')).prop("checked", (values[tag_name] == 'true'));

							//radio buttons
						} else if (_type == "radio") {
							$('input[id="' + values[tag_name] + '"]').data('wl_initdata', true).attr("checked", true);

							//password
						} else if (_type == "password") {
							//don't write passwords for security reasons
							//_this.val(values[tag_name]).trigger('change')
							//datepicker
						} else if (_this.data('wl_Date') && _this.is('input')) {
							if (/(\d\d:\d\d)$/.test(values[tag_name])) {
								var time = values[tag_name].substr(11),
									date = values[tag_name].substr(0, 10);
								_this.data('wl_initdata', new Date(date)).datepicker('setDate', new Date(date));
								$('input[data-connect="' + tag_name + '"]').data('wl_initdata', time).val(time).data('wl_Time').time = time;
							} else {
								_this.data('wl_initdata', new Date(values[tag_name])).datepicker('setDate', new Date(values[tag_name]));
							}

							//inline datepicker
						} else if (_this.data('wl_Date') && _this.is('div')) {
							_this.data('wl_initdata', new Date(values[tag_name])).datepicker('setDate', new Date(values[tag_name]));

							//colorpicker
						} else if (_this.data('wl_Color')) {
							_this.data('wl_initdata', values[tag_name]).wl_Color('set', 'value', values[tag_name]);

							//Slider
						} else if (_this.data('wl_Slider')) {
							if (!_this.data('wl_Slider').connect) {
								if (_this.data('wl_Slider').range) {
									_this.slider('option', 'values', $.parseData(values[tag_name]));
								} else {
									_this.slider('option', 'value', values[tag_name]);
								}
								_this.data('wl_initdata', values[tag_name]);
								_this.wl_Slider("change");
								_this.wl_Slider("slide");
							}

							//Multiselect
						} else if (_this.data('wl_Multiselect')) {
							_this.data('wl_initdata', values[tag_name]).wl_Multiselect('select', values[tag_name]);

							//wysiwyg editor
						} else if (_this.data('wl_Editor')) {
							_this.data('wl_initdata', values[tag_name]).val(values[tag_name]).wysiwyg("setContent", values[tag_name]);

							//other fields
						} else {
							_this.data('wl_initdata', values[tag_name]).val(values[tag_name]).trigger('change');
						}
					}
				});
			} catch (e) {

				//call a message to prevent crashing the application
				$.msg($this.data('wl_Form').text.parseerror.replace('%e', e));
			}
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
			if ($.fn.wl_Form.defaults[key] !== undefined && $.fn.wl_Form.defaults[key] !== null) {
				$this.data('wl_Form')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};