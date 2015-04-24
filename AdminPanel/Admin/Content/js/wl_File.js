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
			var queue = {},
				files = [],
				queuelength = 0,
				tempdata, maxNumberOfFiles, dragdropsupport = isEventSupported('dragstart') && isEventSupported('drop') && !! window.FileReader;

			//get native multiple attribute or use defined one 
			opts.multiple = ($this.is('[multiple]') || typeof $this.prop('multiple') === 'string') || opts.multiple;

			//used for the form
			opts.queue = {};
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
				}).html(opts.text.start).bind('click', function () {
					$.each(queue, function (file) {
						upload(queue[file].data);
					});
				}).appendTo(opts.ui);

			}

			//cancel/remove all button
			opts.uiCancel = $('<a>', {
				'class': 'btn small fileupload_cancel',
				'title': opts.text.cancel_all
			}).html(opts.text.cancel_all).appendTo(opts.ui).bind('click', function () {
				var _this = $(this),
					el = opts.filepool.find('li');
				el.addClass('error');

				//IE and Opera delete the data on submit so we store it temporarily
				if (!$this.data('wl_File')) $this.data('wl_File', tempdata);
				
				files = $this.data('wl_File').files = [];

				queuelength = 0;

				$.each(queue, function (name) {
					if (queue[name]) {
						queue[name].fileupload.abort();
						delete queue[name];
					}
				});
				el.delay(700).fadeOut(function () {

					//trigger a change for required inputs
					opts.filepool.trigger('change');
					_this.text(opts.text.cancel_all).attr('title', opts.text.cancel_all);
					$(this).remove();
				});
				//trigger delete event
				opts.onDelete.call($this[0], $.map(el,function(k,v){return $(k).data('fileName');}));
			});


			//filepool and dropzone
			opts.filepool = $('<ul>', {
				'class': 'fileuploadpool'
			}).insertAfter($this)

			//cancel one files
			.delegate('a.cancel', 'click', function () {
				var el = $(this).parent(),
					name = el.data('fileName');

				//IE and Opera delete the data on submit so we store it temporarily
				if (!$this.data('wl_File')) $this.data('wl_File', tempdata);

				//remove clicked file from the list
				$this.data('wl_File').files = files = $.map(files, function (filename) {
					if (filename != name) return filename;
				});

				//abort upload
				queue[name].fileupload.abort();

				//remove from queue
				delete queue[name];
				queuelength--;

				el.addClass('error').delay(700).fadeOut();
				
				//trigger cancel event
				opts.onCancel.call($this[0], name);
				//trigger a change for required inputs
				opts.filepool.trigger('change');
			})

			//remove file from list
			.delegate('a.remove', 'click', function () {
				var el = $(this).parent(),
					name = el.data('fileName');

				if (!$this.data('wl_File')) $this.data('wl_File', tempdata);

				//remove clicked file from the list
				$this.data('wl_File').files = files = $.map(files, function (filename) {
					if (filename != name) return filename;
				});

				el.fadeOut();

				//trigger cancel event
				opts.onDelete.call($this[0], [name]);
				//trigger a change for required inputs
				opts.filepool.trigger('change');
			})

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
				//must be an array
				paramName: opts.paramName + '[]',
				formData: opts.formData,
				add: function (e, data) {

					//cancel current upload and remove item on single upload field
					if (!opts.multiple) {
						opts.uiCancel.click();
						opts.filepool.find('li').remove();
					}

					//add files to the queue
					$.each(data.files, function (i, file) {
						file.ext = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

						queuelength++;
						var error = getError(file);

						if (!error) {

							//add file to queue and to filepool
							addFile(file, data);
						} else {

							//reduces queuelength
							queuelength--;
							//throw error
							opts.onFileError.call($this[0], error, file);
						}
					});

					//IE and Opera delete the data on submit so we store it temporarily
					if ($this.data('wl_File')) {
						$this.data('wl_File').queue = queue;
						tempdata = $this.data('wl_File');
					} else if (tempdata) {
						tempdata.queue = queue;
					}

					//trigger a change for required inputs
					opts.filepool.trigger('change');

					opts.onAdd.call($this[0], e, data);

					//start upload if autoUpload is true
					if (opts.autoUpload) upload(data);
				},
				send: function (e, data) {
					$.each(data.files, function (i, file) {
						queue[file.name].element.addClass(data.textStatus);
						queue[file.name].progress.width('100%');
						queue[file.name].status.text(opts.text.uploading);
					});

					//rename cancel button
					opts.uiCancel.text(opts.text.cancel_all).attr('title', opts.text.cancel_all);
					return opts.onSend.call($this[0], e, data);
				},
				done: function (e, data) {

					$this.data('wl_File', tempdata);
					//set states for each file and push them in the list
					$.each(data.files, function (i, file) {
						if (queue[file.name]) {
							queue[file.name].element.addClass(data.textStatus);
							queue[file.name].progress.width('100%');
							queue[file.name].status.text(opts.text.done);
							queue[file.name].cancel.removeAttr('class').addClass('remove').attr('title', opts.text.remove);
							if ($.inArray(file.name, files) == -1) {
								files.push(file.name);
								$this.data('wl_File').files = files;
							}

							//delete from the queue
							queuelength--;
							delete queue[file.name];
						}
					});


					opts.onDone.call($this[0], e, data);

					//empty queue => all files uploaded
					if ($.isEmptyObject(queue)) {

						//trigger a change for required inputs
						opts.filepool.trigger('change');
						opts.uiCancel.text(opts.text.remove_all).attr('title', opts.text.remove_all);
						opts.onFinish.call($this[0], e, data);
					}

				},
				fail: function (e, data) {
					opts.onFail.call($this[0], e, data);
				},
				always: function (e, data) {
					opts.onAlways.call($this[0], e, data);
				},
				progress: function (e, data) {
					//calculate progress for each file
					$.each(data.files, function (i, file) {
						if (queue[file.name]) {
							var percentage = Math.round(parseInt(data.loaded / data.total * 100, 10));
							queue[file.name].progress.width(percentage + '%');
							queue[file.name].status.text(opts.text.uploading + percentage + '%');
						}
					});
					opts.onProgress.call($this[0], e, data);
				},
				progressall: function (e, data) {
					opts.onProgressAll.call($this[0], e, data);
				},
				start: function (e) {
					opts.onStart.call($this[0], e);
				},
				stop: function (e) {
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

		}

		//upload method

		function upload(data) {
			$.each(data.files, function (i, file) {
				if (queue[file.name]) queue[file.name].fileupload = data.submit();
			});
		}

		//add files to the queue and to the filepool

		function addFile(file, data) {
			var name = file.name;
			var html = $('<li><span class="name">' + name + '</span><span class="progress"></span><span class="status">' + opts.text.ready + '</span><a class="cancel" title="' + opts.text.cancel + '">' + opts.text.cancel + '</a></li>').data('fileName', name).appendTo(opts.filepool);
			queue[name] = {
				element: html,
				data: data,
				progress: html.find('.progress'),
				status: html.find('.status'),
				cancel: html.find('.cancel')
			};
		}

		//check for errors

		function getError(file) {
			if (opts.maxNumberOfFiles && (files.length >= opts.maxNumberOfFiles || queuelength > opts.maxNumberOfFiles)) {
				return {
					msg: 'maxNumberOfFiles',
					code: 1
				};
			}
			if (opts.allowedExtensions && $.inArray(file.ext, opts.allowedExtensions) == -1) {
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
	reset: function () {
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