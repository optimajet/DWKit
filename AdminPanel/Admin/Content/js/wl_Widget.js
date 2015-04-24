/*----------------------------------------------------------------------*/
/* wl_Widget v 1.2 by revaxarts.com
/* description: handles all function for the widgets
/* dependency: wl_Store, jquery sortable a.d.
/*----------------------------------------------------------------------*/


$.fn.wl_Widget = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);

		if ($.fn.wl_Widget.methods[method]) {
			return $.fn.wl_Widget.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Widget')) {
				var opts = $.extend({}, $this.data('wl_Widget'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Widget.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Widget')) {

			$this.data('wl_Widget', {});

			//find the widgets within the conatainer
			var $widgets = $this.find('div.widget');

			//iterate thru the widgets
			$widgets.each(function () {
				var $widget = $(this),
					_opts = $.extend({}, opts, $widget.data()),
					$handle = $widget.find('h3.handle'),
					$content = $widget.find('div').eq(0),
					$container = $widget.parent();

				$widget.data('wl_Widget', {});

				//set an icon
				if (_opts.icon) {
					$handle.addClass('icon');
					$('<a>', {
						'class': 'icon i_' + _opts.icon
					}).appendTo($handle);
				}
				
				//if sortable add a class
				if (_opts.sortable) {
					$widget.addClass('sortable');
				}
				
				//if collapsible
				if(_opts.collapsible){
					//add the collapse button
					$('<a>', {
						'class': 'collapse',
						'title': _opts.text.collapse
					}).appendTo($handle);
				
					//collapse if set
					if (_opts.collapsed) {
						$content.hide();
						$widget.addClass('collapsed');
						$handle.find('a.collapse').attr('title',_opts.text.expand);
					}
					
					
					//handle the collapse button (touchstart is required for iOS devices)
					$handle.delegate('a.collapse', 'click.wl_Widget touchstart.wl_Widget', function (event) {
						var _opts = $widget.data('wl_Widget') || _opts,
							_content = $widget.find('div').eq(0);
						
						if (_content.is(':hidden')) {
							
							//expand hidden content
							_content.slideDown(100, function () {
								$widget.removeClass('collapsed').data('wl_Widget').collapsed = false;
								$handle.find('a.collapse').attr('title',_opts.text.collapse);
								//callback
								_opts.onExpand.call($widget[0]);
								//save
								$.fn.wl_Widget.methods.save();
								
								//trigger resize for some plugins
								$(window).resize();
							});
						} else {
							
							//hide content
							$content.slideUp(100, function () {
								$widget.addClass('collapsed').data('wl_Widget').collapsed = true;
								$handle.find('a.collapse').attr('title',_opts.text.expand);
								//callback
								_opts.onCollapse.call($widget[0]);
								//save
								$.fn.wl_Widget.methods.save();
							});
						}
						return false;
						
					//doublclick is equal to collapse button
					}).bind('dblclick', function () {
						$handle.find('a.collapse').trigger('click');
						return false;
					});
				
				}
				
				//handle the reload button (touchstart is required for iOS devices)
				$handle.delegate('a.reload', 'click.wl_Widget touchstart.wl_Widget', function (event) {
					var _opts = $widget.data('wl_Widget') || _opts,
						_content = $widget.find('div').eq(0);
						
					$widget.addClass('loading');
					//set height to prevent "jumping"
					_content.height($content.height());
					
					//removeContent and replace it with a loading information
					if (_opts.removeContent) {
						_content.html(_opts.text.loading);
					}
					_content.load(_opts.load, function (response, status, xhr) {
						$widget.removeClass('loading');
						_content.height('auto');
						
						//error occured
						if (status == "error") {
							_content.html(xhr.status + " " + xhr.statusText);
						}
						
						//autoreload is set
						if (_opts.reload) {
							clearTimeout($widget.data('wl_Widget').timeout);
							$widget.data('wl_Widget').timeout = setTimeout(function () {
								$handle.find('a.reload').trigger('click.wl_Widget');
							}, _opts.reload * 1000);
						}
					});
					return false;
					
				});

				//prevent other anochrs to bubble up the DOM
				$handle.delegate('a', 'click.wl_Widget', function (event) {
					event.stopPropagation();
					return false;
				});

				if (_opts) $.extend($widget.data('wl_Widget'), _opts);

				//ajax widgets get a reload button
				if (_opts.load) {
					$('<a>', {
						'class': 'reload',
						'title': _opts.text.reload
					}).appendTo($handle).trigger('click.wl_Widget');
				}
			});

			
			//Handling sortable and restoring positions
			
			
			var $maincontent = $('#content');

			//save the total count of widgets
			if (!$maincontent.data('wl_Widget')) {
				$maincontent.data('wl_Widget', {
					containercount: $('div.widgets').length,
					currentid: 1
				});
			}

			//if all widgets are initialized
			if ($maincontent.data('wl_Widget').currentid++ >= $maincontent.data('wl_Widget').containercount) {

				var $container = $('div.widgets');

				//get data from the storage
				var wl_Store = new $.wl_Store('wl_' + location.pathname.toString());
				
				//iterate thru the containers
				$container.each(function (i, cont) {
					var widgets = wl_Store.get('widgets_' + i),
						$cont = $(this);
					if (!widgets) return false;
					
					//iterate thru the widgets from the container id i
					$.each(widgets, function (widget, options) {

						var _widget = $('#' + widget);
						

						//widget should be collpased
						(options.collapsed && _widget.data('wl_Widget').collapsible) ? _widget.addClass('collapsed').find('div').eq(0).hide().data('wl_Widget', {
							collapsed: true
						}) : _widget.removeClass('collapsed').find('div').eq(0).show().data('wl_Widget', {
							collapsed: false
						});

						//position handling
						if (_widget.length && (_widget.prevAll('div').length != options.position || _widget.parent()[0] !== $cont[0])) {
							children = $cont.children('div.widget');
							if (children.eq(options.position).length) {
								_widget.insertBefore(children.eq(options.position));
							} else if (children.length) {
								_widget.insertAfter(children.eq(options.position - 1));
							} else {
								_widget.appendTo($cont);
							}
						}
					});
				});
				
				
				//use jQuery UI sortable plugin for the widget sortable function
				$container.sortable({
					items: $container.find('div.widget.sortable'),
					containment: '#content',
					opacity: 0.8,
					distance: 5,
					handle: 'h3.handle',
					connectWith: $container,
					forceHelperSize: true,
					placeholder: 'sortable_placeholder',
					forcePlaceholderSize: true,
					zIndex: 10000,
					start: function (event, ui) {
						ui.item.data('wl_Widget').onDrag.call(ui.item[0]);
					},
					stop: function (event, ui) {
						ui.item.data('wl_Widget').onDrop.call(ui.item[0]);
						$.fn.wl_Widget.methods.save();
					}
				});



			}


		} else {

		}
		if (opts) $.extend($this.data('wl_Widget'), opts);
	});

};

$.fn.wl_Widget.defaults = {
	collapsed: false,
	load: null,
	reload: false,
	removeContent: true,
	collapsible: true,
	sortable: true,
	text: {
		loading: 'loading...',
		reload: 'reload',
		collapse: 'collapse widget',
		expand: 'expand widget'
	},
	onDrag: function () {},
	onDrop: function () {},
	onExpand: function () {},
	onCollapse: function () {}
};
$.fn.wl_Widget.version = '1.2';


$.fn.wl_Widget.methods = {
	save: function () {

		var $containers = $('div.widgets'),
			wl_Store = new $.wl_Store('wl_' + location.pathname.toString());
			
		//iterate thru the containers
		$containers.each(function (containerid, e) {
			var _widgets = {};
			
			//get info from all widgets from that container
			$(this).find('div.widget').each(function (pos, e) {
				var _t = $(this);
				_widgets[this.id] = {
					position: pos,
					collapsed: _t.find('div').eq(0).is(':hidden')
				};
			});
			
			//store the info
			wl_Store.save('widgets_' + containerid, _widgets);
		});

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
			if ($.fn.wl_Widget.defaults[key] !== undefined || $.fn.wl_Widget.defaults[key] == null) {
				$this.data('wl_Widget')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};