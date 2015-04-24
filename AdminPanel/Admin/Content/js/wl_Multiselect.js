/*----------------------------------------------------------------------*/
/* wl_Multiselect v 1.2 by revaxarts.com
/* description: Makes a Multiselector out of a select input
/* dependency: jQuery UI
/*----------------------------------------------------------------------*/
$.fn.wl_Multiselect = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Multiselect.methods[method]) {
			return $.fn.wl_Multiselect.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Multiselect')) {
				var opts = $.extend({}, $this.data('wl_Multiselect'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Multiselect.defaults, method, $this.data());
			}
		} else {
			$.error('Method "' + method + '" does not exist');
		}


		if (!$this.data('wl_Multiselect')) {

			$this.data('wl_Multiselect', {});

			//Hide the native input
			$this.hide();

			//insert the required HTML
			$('<div class="comboselectbox"><div class="combowrap"><ul class="comboselect"></ul></div><div class="comboselectbuttons"><a class="add btn"></a><a class="addall btn"></a><a class="removeall btn"></a><a class="remove btn"></a></div><div class="combowrap"><ul class="comboselect"></ul></div></div>').insertAfter($this);

		} else {

		}

		var $box = $this.next('.comboselectbox'),
			$add = $box.find('a.add'),
			$remove = $box.find('a.remove'),
			$addall = $box.find('a.addall'),
			$removeall = $box.find('a.removeall'),
			$lists = $box.find('.comboselect'),
			$i = $([]);

		var name = $this.attr('name'),
			j = 0,
			selected = [];

		opts.pool = $lists.eq(0), opts.selection = $lists.eq(1);


		//append a '[]' if isn't set (required for multiple values
		if (!/\[\]$/.test(name)) $this.attr('name', name + '[]');

		//set the height of the box
		$box.height(opts.height);

		//if items ar sett append them to the native input
		if (opts.items.length) {
			if (opts.selected.length && !$.isArray(opts.selected)) opts.selected = [opts.selected];
			$.each(opts.items, function (i, data) {
				var name, value, selected = '';
				if (typeof data == 'object') {
					name = data.name;
					value = data.value;
				} else {
					name = value = data;
				}
				if (opts.selected.length && $.inArray(value, opts.selected) != -1) selected = ' selected';
				$i = $i.add($('<option value="' + value + '"' + selected + '>' + name + '</option>'));
			});
			$i.appendTo($this);
		}

		//refresh the positions if a change is triggered
		$this.bind('change.wl_Multiselect', function () {
			refreshPositions();
		});

		//clear them
		opts.items = [];
		opts.selected = [];

		//and iterate thru all native options
		$.each($this.find('option'), function (i, e) {
			var _this = $(this),
				name = _this.text(),
				value = _this.val();
			var item = $('<li><a>' + name + '</a></li>').append('<a class="add"></a>').data({
				'pos': i,
				'value': value,
				'name': name,
				'native': _this
			}).appendTo(opts.pool);
			opts.items[value] = item;

			//if it's selected we need it in the selection list
			if (_this.is(':selected')) {
				opts.selected.push(value);
				item.clone(true).data({
					'pos': j++
				}).attr('data-value', value).append('<a class="remove"></a>').appendTo(opts.selection).find('.add').remove();
				item.data('native').prop('selected', true);
				item.addClass('used');
				if (!opts.showUsed) item.hide();
			}
		});


		//Bind click events to the buttons in the middle
		$add.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.pool.find('li.selected'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('select', selection);
		});

		$remove.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.selection.find('li.selected'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('unselect', selection);
		});

		$addall.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.pool.find('li'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('select', selection);
		});

		$removeall.bind('click.wl_Multiselect', function () {
			var selection = $.map(opts.selection.find('li'), function (el) {
				return $(el).data('value');
			});
			$this.wl_Multiselect('unselect', selection);
		});


		//Bind events to the elements
		opts.pool.delegate('li', 'click.wl_Multiselect', {
			'list': opts.pool
		}, clickHandler).delegate('li', 'dblclick.wl_Multiselect', function () {
			$this.wl_Multiselect('select', $(this).data('value'));
		}).delegate('a.add', 'click.wl_Multiselect', function () {
			$this.wl_Multiselect('select', $(this).parent().data('value'));
		}).disableSelection();

		opts.selection.delegate('li', 'click.wl_Multiselect', {
			'list': opts.selection
		}, clickHandler).delegate('a.remove', 'click.wl_Multiselect', function () {
			$this.wl_Multiselect('unselect', $(this).parent().data('value'));
		});

		//make the selection list sortable
		opts.selection.sortable({
			containment: opts.selection,
			distance: 20,
			handle: 'a:first',
			forcePlaceholderSize: true,
			forceHelperSize: true,
			update: function () {
				refreshPositions();
				opts.onSort.call($this[0], $this.data('wl_Multiselect').selected);
			},
			items: 'li'
		});

		//function to refresh positions. simple add a position to the element and sort the native select list

		function refreshPositions() {
			var li = opts.pool.find('li').not('.used'),
				selected = [];

			$.each(li, function (i) {
				$(this).data('pos', i);
			});
			li = opts.selection.find('li');
			$.each(li, function (i) {
				var _this = $(this);
				_this.data('pos', i);
				opts.items[_this.data('value')].data('native').appendTo($this);
				selected.push(_this.data('value'));
			});
			$this.data('wl_Multiselect').selected = selected;
		}


		//the click handle simulates a native click behaviour on the elements

		function clickHandler(event) {
			var _this = $(this),
				selected = event.data.list.find('li.selected');

			//stop when the clicked element is used
			if (_this.hasClass('used')) return false;

			//remove the selected class if it's a normal click
			if (!event.shiftKey && !event.ctrlKey) selected.removeClass('selected');

			//shift clicks selects from selected to previous selected element
			if (event.shiftKey) {
				var first, second, items = event.data.list.find('li').not('.used');
				if (_this.data('pos') > event.data.list.data('last')) {
					first = event.data.list.data('last');
					second = _this.data('pos');
				} else {
					first = _this.data('pos');
					second = event.data.list.data('last');
				}
				for (var i = first; i <= second; i++) {
					items.eq(i).addClass('selected');
				}
				event.data.list.data('last', second);

				//a normal click (or with ctrl key) select the current one
			} else {
				event.data.list.data('last', _this.data('pos'));
				_this.toggleClass('selected');
			}
			return false;
		}

		if (opts) $.extend($this.data('wl_Multiselect'), opts);

	});

};

$.fn.wl_Multiselect.defaults = {
	height: 200,
	items: [],
	selected: [],
	showUsed: false,
	onAdd: function (values) {},
	onRemove: function (values) {},
	onSelect: function (values) {},
	onUnselect: function (values) {},
	onSort: function (values) {}
};
$.fn.wl_Multiselect.version = '1.2';


$.fn.wl_Multiselect.methods = {
	add: function (items, select) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect'),
			i = opts.itemsum || 0,
			_items = {};

		//make an object from the input
		if (typeof items != 'object') {
			_items[items] = items;
		} else if ($.isArray(items)) {
			for (var i = 0; i < items.length; i++) {
				_items[items[i]] = items[i];
			}
		} else {
			_items = items;
		}

		//iterate thru all _items
		$.each(_items, function (value, name) {
			//make native items
			var _native = $('<option value="' + value + '">' + name + '</option>').appendTo($this);
			//and elements
			var item = $('<li><a>' + name + '</a></li>').append('<a class="add"></a>').data({
				'pos': i++,
				'native': _native,
				'name': name,
				'value': value
			}).appendTo(opts.pool);

			//store info in the object
			$this.data('wl_Multiselect').items[value] = item;
			if (select) $this.wl_Multiselect('select', value);
		});

		//trigger the callback function
		opts.onAdd.call($this[0], $.map(_items, function (k, v) {
			return k;
		}));
	},
	remove: function (values) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');
			
		if (values && !$.isArray(values)) {
			values = [values];
		}
		//unselect all values before
		$this.wl_Multiselect('unselect', values);

		if(values){
			//remove all elements + native options
			$.each(values, function (i, value) {
				var item = opts.items[value];
				item.data('native').remove();
				item.remove();
				delete opts.items[value];
				$this.data('wl_Multiselect').items = opts.items;
			});
		}

		//trigger a change
		$this.trigger('change.wl_Multiselect');
		//trigger the callback function
		opts.onRemove.call($this[0], values);
	},
	select: function (values) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');

		if (values && !$.isArray(values)) {
			values = [values];
		}
		
		if(values){
			//add elements to the selection list and select the native option
			$.each(values, function (i, value) {
				var item = opts.items[value];
				if (item.hasClass('used')) return;
				item.removeClass('selected').clone(true).attr('data-value', value).append('<a class="remove"></a>').appendTo(opts.selection).find('.add').remove();
				item.data('native').prop('selected', true);
				item.addClass('used');
				if (!opts.showUsed) item.hide();
			});
		}

		//trigger a change
		$this.trigger('change.wl_Multiselect');
		//trigger the callback function
		opts.onSelect.call($this[0], values);
	},
	unselect: function (values) {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');

		if (values && !$.isArray(values)) {
			values = [values];
		}
		var li = opts.selection.find('li');

		if(values){
			//remove elements from the selection list and select the native option
			$.each(values, function (i, value) {
				var item = opts.items[value];
				if (!item.hasClass('used')) return;
				item.data('native').prop('selected', false);
				li.filter('[data-value="' + value + '"]').remove();
				item.removeClass('used');
				if (!opts.showUsed) item.show();
			});
		}

		//trigger a change
		$this.trigger('change.wl_Multiselect');
		//trigger the callback function
		opts.onUnselect.call($this[0], values);
	},
	clear: function () {
		var $this = $(this),
			opts = $this.data('wl_Multiselect');

		//unselect all seleted
		$this.wl_Multiselect('unselect', opts.selected);
		//trigger a change
		$this.trigger('change.wl_Multiselect');
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
			if ($.fn.wl_Multiselect.defaults[key] !== undefined) {
				$this.data('wl_Multiselect')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};