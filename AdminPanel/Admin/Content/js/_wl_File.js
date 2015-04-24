/*----------------------------------------------------------------------*/
/* wl_File v 1.2 by revaxarts.com
/* description:makes a fancy html5 file upload input field
/* dependency: jQuery File Upload Plugin 5.0.2
/*----------------------------------------------------------------------*/


$.fn.wl_File = function (method) {

	var args = arguments;

	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_File.methods[method]) {
			return $.fn.wl_File.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_File')) {
				var opts = $.extend({}, $this.data('wl_File'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_File.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.fileupload(method, args[1], args[2], args[3], args[4]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}

		if (!$this.data('wl_File')) {

			$this.data('wl_File', {});
			
			//The queue, the upload files and drag&drop support of the current browser
			var queue = 0, maxNumberOfFiles, dragdropsupport = isEventSupported('dragstart') && isEventSupported('drop') && !! window.FileReader;

			//get native multiple attribute or use defined one 
			opts.multiple = ($this.is('[multiple]') || typeof $this.prop('multiple') === 'string') || opts.multiple;

			//used for the form
			opts.queue = queue;
			opts.files = [];

			if (typeof opts.allowedExtensions === 'string') opts.allowedExtensions = $.parseData(opts.allowedExtensions);

			//the container for the buttons
			opts.ui = $('<div>', {
				'class': 'fileuploadui'
			}).insertAfter($this);

			//start button only if autoUpload is false
			if (!opts.autoUpload) {
				opts.uiStart = $('<a>', {
					'class': 'btn small fileupload_start',
					'title': opts.text.start
				})
				.html(opts.text.start)
				.bind('click', startHandler)
				.appendTo(opts.ui);
			}

			//cancel/remove all button
			opts.uiCancel = $('<a>', {
				'class': 'btn small fileupload_cancel',
				'title': opts.text.cancel_all
			})
			.html(opts.text.cancel_all)
			.appendTo(opts.ui)
			.bind('click', function () {
				var _this = $(this),
					el = opts.filepool.find('.remove, .cancel');
					el.trigger('click.wl_File');
					opts.onDelete.call($this[0], $this.data('wl_File').files);
					return false;
			});


			//filepool and dropzone
			opts.filepool = $('<ul>', {
				'class': 'fileuploadpool'
			}).insertAfter($this)
			//add some classes to the filepool
			.addClass((!opts.multiple) ? 'single' : 'multiple').addClass((dragdropsupport) ? 'drop' : 'nodrop');


			//call the fileupload plugin
			$this.fileupload({
				url: opts.url,
				dropZone: (opts.dragAndDrop) ? opts.filepool : null,
				fileInput: $this,
				//required
				singleFileUploads: true,
				sequentialUploads: opts.sequentialUploads,
				replaceFileInput: false,
				//must be an array
				paramName: opts.paramName + '[]',
				formData: opts.formData,
				
				add: function (e, data) {
					var that = $(this).data('fileupload');
					
					adjustMaxNumberOfFiles(-data.files.length);
					data.isAdjusted = true;
					data.isValidated = validate(data.files);
					data.context = render(data.files)
						.appendTo(opts.filepool).fadeIn(function () {
							// Fix for IE7 and lower:
							$(this).show();
						}).data('data', data)
						.delegate('a.cancel','click.wl_File', cancelHandler)
						.delegate('a.remove','click.wl_File', removeHandler);
					if ((opts.autoUpload) && data.isValidated) {
						data.jqXHR = data.submit();
					}
				},
				
				send: function (e, data) {
					if (!data.isValidated) {
						var that = $(this).data('fileupload');
						if (!data.isAdjusted) {
							adjustMaxNumberOfFiles(-data.files.length);
						}
						if (!validate(data.files)) {
							return false;
						}
					}
					if (data.context && data.dataType &&
							data.dataType.substr(0, 6) === 'iframe') {
						// Iframe Transport does not support progress events.
						// In lack of an indeterminate progress bar, we set
						// the progress to 100%, showing the full animated bar:
						data.context.find('.progress').width('100%');
						data.context.find('.status').html(opts.text.uploading);
					}
				},
				
				done: function (e, data) {
					 if (data.context) {
						data.context.each(function (index) {
							var _el = $(this);
							var file = ($.isArray(data.result) &&
									data.result[index]) || {error: 'emptyResult'};
							if (file.error) {
								adjustMaxNumberOfFiles(1);
							}
							_el.addClass(data.textStatus);
							_el.find('.progress').width('100%');
							_el.find('.status').html(opts.text.done);
							_el.find('.cancel').removeAttr('class').addClass('remove').attr('title', opts.text.remove);
							
							queue--;
							refreshFileList();

							//$this.data('wl_File').files;
							//_el.fadeOut();
						});
					} else {
					}
				},
				
				fail: function (e, data) {
					console.log('fail');
               		adjustMaxNumberOfFiles(data.files.length);
					
                	if (data.context) {
                    	data.context.each(function (index) {
                            if (data.errorThrown !== 'abort') {
                                var file = data.files[index];
                                file.error = file.error || data.errorThrown || true;
                            } else {
                                data.context.remove();
                            }
                    	});
               		 } else if (data.errorThrown !== 'abort') {
						 
                    	adjustMaxNumberOfFiles(-data.files.length);

               		}
					opts.onFail.call($this[0], e, data);
				},
				
				always: function (e, data) {
					console.log('always');
					opts.onAlways.call($this[0], e, data);
				},
				
				progress: function (e, data) {
					if (data.context) {
						var percentage = Math.round(parseInt(data.loaded / data.total * 100, 10));
						data.context.find('.progress').width(percentage + '%');
						data.context.find('.status').html(opts.text.uploading + percentage + '%');
						opts.onProgress.call($this[0], e, data);
                	}
				},
				
				progressall: function (e, data) {
				},
				
				start: function (e) {
					console.log('start');
				},
				
				stop: function (e) {
					console.log('stop');
					opts.onStop.call($this[0], e);
				},
				
				change: function (e, data) {
					opts.onChange.call($this[0], e, data);
				},
				
				drop: function (e, data) {
					opts.onDrop.call($this[0], e, data);
				},
				
				dragover: function (e) {
					opts.onDragOver.call($this[0], e);
				}
				
			});

		} else {

		};
		
		 function adjustMaxNumberOfFiles(operand) {
            if (opts.maxNumberOfFiles) {
                opts.maxNumberOfFiles += operand;
                if (opts.maxNumberOfFiles < 1) {
                   // this._disableFileInputButton();
                } else {
                    //this._enableFileInputButton();
                }
            }
        }
		
		function validate(files) {
            var that = this,
                valid = !!files.length;
				$.each(files, function (index, file) {
					file.error = hasError(file);
					if (file.error) {
						valid = false;
					}
				});
            return valid;
        }
		
		function refreshFileList(){
			var files = [];
			opts.filepool.find('li').each(function(){
				var data = $(this).data('data');
				if(data.isValidated){
					files.push($(this).find('.name').text());
				}
			});
			$this.data('wl_File').files = files;
			$this.data('wl_File').queue = queue;
		}
		
       function startHandler (e) {
            e.preventDefault();
			console.log(opts.filepool);
			opts.filepool.find('li').each(function(){
				var data = $(this).data('data');
				if(data && data.isValidated && data.submit && !data.jqXHR){
               		$(this).data('data').jqXHR = data.submit();
				}
			});
        }
        
        function cancelHandler(e) {
            e.preventDefault();
			var el = $(this).parent(),
				data = el.data('data');
			
			el.addClass('error').delay(700).fadeOut(function(){
				if (!data.jqXHR) {
					data.errorThrown = 'abort';
				} else {
					data.jqXHR.abort();
				}
				el.remove();
				refreshFileList();
				//trigger cancel event
				opts.onDelete.call($this[0], [name]);
				//trigger a change for required inputs
				opts.filepool.trigger('change');
			});
			
			return false;
			
        }
		
        function removeHandler(e) {
            e.preventDefault();
			var el = $(this).parent();
			
			el.fadeOut(function(){
				el.remove();
				refreshFileList();
				//trigger cancel event
				opts.onDelete.call($this[0], [name]);
				//trigger a change for required inputs
				opts.filepool.trigger('change');
			});
			
			return false;
			
        }
        
        function deleteHandler(e) {
            e.preventDefault();
            var button = $(this);
            e.data.fileupload._trigger('destroy', e, {
                context: button.closest('.template-download'),
                url: button.attr('data-url'),
                type: button.attr('data-type'),
                dataType: e.data.fileupload.options.dataType
            });
        }
		
		function hasError (file) {
            if (file.error) {
                return file.error;
            }
            // The number of added files is subtracted from
            // maxNumberOfFiles before validation, so we check if
            // maxNumberOfFiles is below 0 (instead of below 1):
            if (opts.maxNumberOfFiles && ( opts.maxNumberOfFiles < 0)) {
				return {
					msg: 'maxNumberOfFiles',
					code: 1
				};
            }
            // Files are accepted if either the file type or the file name
            // matches against the acceptFileTypes regular expression, as
            // only browsers with support for the File API report the type:
            if (false && opts.allowedExtensions && $.inArray(file.ext, opts.allowedExtensions) == -1) {
				return {
					msg: 'allowedExtensions',
					code: 2
				};
            }
			if (typeof file.size === 'number' && opts.maxFileSize && file.size > opts.maxFileSize) {
				return {
					msg: 'maxFileSize',
					code: 3
				};
			}
			if (typeof file.size === 'number' && opts.minFileSize && file.size < opts.minFileSize) {
				return {
					msg: 'minFileSize',
					code: 4
				};
			}
            return null;
        }
		
		function render(files) {
			var html = '';
				$.each(files, function (index, file) {
					queue++;
					html += '<li><span class="name">' + file.name + '</span><span class="progress"></span><span class="status">' + opts.text.ready + '</span><a class="cancel" title="' + opts.text.cancel + '">' + opts.text.cancel + '</a></li>';
				});
			$this.data('wl_File').queue = queue;
			return $(html);
        };

		//took from the modernizr script (thanks paul)

		function isEventSupported(eventName) {

			var element = document.createElement('div');
			eventName = 'on' + eventName;

			// When using `setAttribute`, IE skips "unload", WebKit skips "unload" and "resize", whereas `in` "catches" those
			var isSupported = eventName in element;

			if (!isSupported) {
				// If it has no `setAttribute` (i.e. doesn't implement Node interface), try generic element
				if (!element.setAttribute) {
					element = document.createElement('div');
				}
				if (element.setAttribute && element.removeAttribute) {
					element.setAttribute(eventName, '');
					isSupported = typeof element[eventName] == 'function';

					// If property was created, "remove it" (by setting value to `undefined`)
					if (typeof element[eventName] != undefined) {
						element[eventName] = undefined;
					}
					element.removeAttribute(eventName);
				}
			}

			element = null;
			return isSupported;
		}

		if (opts) $.extend($this.data('wl_File'), opts);

	});

};

$.fn.wl_File.defaults = {
	url: 'upload.php',
	autoUpload: true,
	paramName: 'files',
	multiple: false,
	allowedExtensions: false,
	maxNumberOfFiles: 0,
	maxFileSize: 0,
	minFileSize: 0,
	sequentialUploads: false,
	dragAndDrop: true,
	formData: {},
	text: {
		ready: 'ready',
		cancel: 'cancel',
		remove: 'remove',
		uploading: 'uploading...',
		done: 'done',
		start: 'start upload',
		add_files: 'add files',
		cancel_all: 'cancel upload',
		remove_all: 'remove all'
	},
	onAdd: function (e, data) {},
	onDelete:function(files){},
	onCancel:function(file){},
	onSend: function (e, data) {},
	onDone: function (e, data) {},
	onFinish: function (e, data) {},
	onFail: function (e, data) {},
	onAlways: function (e, data) {},
	onProgress: function (e, data) {},
	onProgressAll: function (e, data) {},
	onStart: function (e) {},
	onStop: function (e) {},
	onChange: function (e, data) {},
	onDrop: function (e, data) {},
	onDragOver: function (e) {},
	onFileError: function (error, fileobj) {}
};

$.fn.wl_File.version = '1.2';


$.fn.wl_File.methods = {
	clear: function () {
		var $this = $(this),
			opts = $this.data('wl_File');
		
		//default value if uniform is used
		if($.uniform)$this.next().html($.uniform.options.fileDefaultText);
		//empty file pool
		opts.filepool.empty();
		//reset button
		opts.uiCancel.attr('title',opts.text.cancel_all).text(opts.text.cancel_all);
		//clear array
		$this.data('wl_File').files = [];
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
			if ($.fn.wl_File.defaults[key] !== undefined || $.fn.wl_File.defaults[key] == null) {
				$this.data('wl_File')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};