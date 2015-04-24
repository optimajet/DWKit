/*----------------------------------------------------------------------*/
/* wl_Editor v 1.1 by revaxarts.com
/* description: makes a WYSIWYG Editor
/* dependency: jWYSIWYG Editor
/*----------------------------------------------------------------------*/


$.fn.wl_Editor = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Editor.methods[method]) {
			return $.fn.wl_Editor.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Editor')) {
				var opts = $.extend({}, $this.data('wl_Editor'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Editor.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.wysiwyg(method, args[1], args[2], args[3]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}


		if (!$this.data('wl_Editor')) {

			$this.data('wl_Editor', {});

			//detroying and re-made the editor crashes safari on iOS Devices so I disabled it.
			//normally the browser don't get resized as much.
			//wysiwyg isn't working on iPhone anyway
			/*
			$(window).bind('resize.' + 'wl_Editor', function () {
				$this.wysiwyg('destroy').wysiwyg(opts.eOpts);
			});
			*/

			//make an array out of the buttons or use it if it is allready an array
			opts.buttons = opts.buttons.split('|') || opts.buttons;

			//set initial options
			opts.eOpts = {
				initialContent: opts.initialContent,
				css: opts.css
			};

			//set buttons visible if they are in the array
			var controls = {};
			$.each(opts.buttons, function (i, id) {
				controls[id] = {
					visible: true
				};
			});
			
			//add them to the options
			$.extend(true, opts.eOpts, {
				controls: controls
			}, opts.eOpts);


			//call the jWYSIWYG plugin
			$this.wysiwyg(opts.eOpts);

		} else {

		}

		if (opts) $.extend($this.data('wl_Editor'), opts);
	});

};

$.fn.wl_Editor.defaults = {
	css: 'css/light/editor.css',
	buttons: 'bold|italic|underline|strikeThrough|justifyLeft|justifyCenter|justifyRight|justifyFull|highlight|colorpicker|indent|outdent|subscript|superscript|undo|redo|insertOrderedList|insertUnorderedList|insertHorizontalRule|createLink|insertImage|h1|h2|h3|h4|h5|h6|paragraph|rtl|ltr|cut|copy|paste|increaseFontSize|decreaseFontSize|html|code|removeFormat|insertTable',
	initialContent: ""
};
$.fn.wl_Editor.version = '1.1';


$.fn.wl_Editor.methods = {
	destroy: function () {
		var $this = $(this);
		//destroy it!
		$this.wysiwyg('destroy');
		$this.removeData('wl_Editor');
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
			if ($.fn.wl_Editor.defaults[key] !== undefined || $.fn.wl_Editor.defaults[key] == null) {
				$this.data('wl_Editor')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};