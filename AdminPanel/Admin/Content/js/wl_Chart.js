/*----------------------------------------------------------------------*/
/* wl_Chart v 1.2 by revaxarts.com
/* description: extends the flot library
/* dependency: flot library 
/*----------------------------------------------------------------------*/
$.fn.wl_Chart = function (method) {

	var args = arguments;
	return this.each(function () {

		var $this = $(this);


		if ($.fn.wl_Chart.methods[method]) {
			return $.fn.wl_Chart.methods[method].apply(this, Array.prototype.slice.call(args, 1));
		} else if (typeof method === 'object' || !method) {
			if ($this.data('wl_Chart')) {
				var opts = $.extend({}, $this.data('wl_Chart'), method);
			} else {
				var opts = $.extend({}, $.fn.wl_Chart.defaults, method, $this.data());
			}
		} else {
			try {
				return $this.data('wl_Chart').plot[method](args[1], args[2]);
			} catch (e) {
				$.error('Method "' + method + '" does not exist');
			}
		}

		//throw an error if wrong chart typ is set
		if (!/^(lines|bars|pie)$/.test(opts.type)) {
			$.error('Type of "' + opts.type + '" is not allowed');
		}

		if (!$this.data('wl_Chart')) {

			$this.data('wl_Chart', {});

			//bind a resize event to redraw the chart if the window size change
			$(window).bind('resize.wl_Chart', function () {
				$this.data('wl_Chart').holder.width('99%');
				$.fn.wl_Chart.methods.draw.call($this[0]);
			});

			//make a holder for the chart and set the width too 99% (100% causes overflow problems in some browsers)
			opts.holder = $('<div/>', {
				'class': 'chart'
			}).css({
				width: (opts.width || $this.width() || '100%') / 100 * 99,
				height: opts.height || 300
			}).insertAfter($this);


		} else {

			//quick destroy
			opts.holder.unbind("plothover").unbind('mouseout');

		}



		//set the width
		opts.width = opts.holder.width();

		//show or hide the table
		(opts.hideTable) ? $this.hide() : $this.show();


		//bind the click event on the stats
		opts.holder.bind("plotclick", function (event, pos, item) {
			if (item) {
				var patt = {};
				switch (opts.type) {
				case 'bars':
					patt['value'] = item.datapoint[1];
					patt['label'] = item.series.xaxis.ticks[item.dataIndex].label;
					patt['id'] = item.seriesIndex;
					break;
				case 'pie':
					patt['value'] = item.datapoint[1][0][1];
					patt['label'] = item.series.xaxis.options.ticks[0][1];
					patt['id'] = item.seriesIndex;
					break;
				default:
					patt['value'] = item.datapoint[1];
					patt['label'] = item.series.xaxis.ticks[item.datapoint[0]].label;
					patt['id'] = item.seriesIndex;

				}
				patt['legend'] = item.series.label;
				opts.onClick.call($this[0], patt['value'], patt['legend'], patt['label'], patt['id'], item);
			}
		});

		//We have a tooltip
		if (opts.tooltip) {

			//attach the tipsy tooltip to the holder
			opts.holder.tipsy($.extend({}, config.tooltip, {
				fallback: '',
				followMouse: true,
				gravity: opts.tooltipGravity || 'n'
			}));


			var prev = null,
				text;

			//bind a hover event to the graph
			opts.holder.bind("plothover", function (e, pos, item) {
				if (item) {

					//check if we don't have to do the same stuff more then once
					if (item.datapoint.toString() != prev) {
						var patt = {};
						prev = item.datapoint.toString();


						switch (opts.type) {
						case 'bars':
							//stacked bars have an offset (http://support.revaxarts-themes.com/discussion/165/tooltip-on-a-stacked-chart)
							patt['value'] = (opts.stack) ? item.datapoint[1]-item.datapoint[2] : item.datapoint[1];
							patt['label'] = item.series.xaxis.ticks[item.dataIndex].label;
							patt['id'] = item.seriesIndex;
							break;
						case 'pie':
							patt['value'] = item.datapoint[1][0][1];
							patt['label'] = item.series.xaxis.options.ticks[0][1];
							patt['id'] = item.seriesIndex;
							break;
						default:
							patt['value'] = item.datapoint[1];
							patt['label'] = item.series.xaxis.ticks[item.datapoint[0]].label;
							patt['id'] = item.seriesIndex;

						}
						patt['legend'] = item.series.label;

						//is the pattern a function or a simple string?
						if ($.isFunction(opts.tooltipPattern)) {
							text = opts.tooltipPattern.call($this[0], patt['value'], patt['legend'], patt['label'], patt['id'], item);
						} else {
							text = opts.tooltipPattern.replace(/%1/g, patt['value']).replace(/%2/g, patt['legend']).replace(/%3/g, patt['label']).replace(/%4/g, patt['id']);
						}
						//set the title and show the tooltip
						opts.holder.tipsy('setTitel', text);
						opts.holder.tipsy('show');

					} else {
						return;
					}

				} else {
					//hide tooltip if we leave the point
					opts.holder.tipsy('hide');
					prev = null;
				}
			}).bind('mouseout', function () {

				//hide tooltip if we leave the plot
				opts.holder.tipsy('hide');
				prev = null;
			});

		}


		//the colors are maybe not an array if they a specified within a data attribute
		if (!$.isArray(opts.colors)) {
			opts.colors = $.parseData(opts.colors, true);
		}

		var colors = [];

		//a data object is set (no table)
		if (!$.isEmptyObject(opts.data)) {

			//labels on the x axis are set
			if (opts.xlabels) {

				//convert them in the proper format
				opts.xlabels = $.map(opts.xlabels, function (value, key) {
					return [[key, value]];
				});

				//no labels are set
			} else {

				//get labels out of the data
				opts.xlabels = function () {
					var ret = [];
					$.each(opts.data, function (i, e) {
						$.map(opts.data[i].data, function (value, key) {
							ret[value[0]] = key;
						});
					});
					return $.map(ret, function (value, key) {
						return key;
					});
				}();

			}

			//define colors in a loop
			colors = $.map(opts.data, function (value, key) {
				return opts.colors[key % opts.colors.length];
			});

			//data is from a table
		} else if ($.isEmptyObject(opts.data) && $this.is('table')) {

			opts.xlabels = opts.xlabels || [];
			opts.data = [];

			switch (opts.orientation) {


			//table is in horizontal mode (normal)
			case 'horizontal':

				var $xlabels = $this.find('thead th'),
					$legends = $this.find('tbody th'),
					$rows = $this.find('tbody tr');

				var legendlength = $legends.length;

				//strip the very first cell because it's not necessary
				if (legendlength) $xlabels = $xlabels.slice(1);

				//fetch each row of the table
				$rows.each(function (i, row) {
					var data = $(row).find('td'),
						_d = [];

					//fetch each cell of the row
					data.each(function (j, td) {
						var d = parseFloat(td.innerHTML);

						//only numbers are valid
						if (!isNaN(d)) _d.push([j, (d || 0)]);

						//some stuff for the labels on the x axis
						opts.xlabels.push([j, $xlabels.eq(j).text()]);
					});
					
					//push the data in the data-object for this row (label)
					opts.data.push({
						'label': $legends.eq(i).text(),
						'data': (opts.type != 'pie') ? _d : _d[0][1]
					});

					//define colors in a loop
					colors[i] = $rows.eq(i).data('color') || opts.colors[i] || colors[i % opts.colors.length];
				});
				break;


			//table is in vertical mode
			case 'vertical':

				var $xlabels = $this.find('tbody th'),
					$legends = $this.find('thead th'),
					$rows = $this.find('tbody tr');

				var legendlength = $legends.length;

				if (legendlength) {
					$legends = $legends.slice(1);
					legendlength--;
				}

				var _d = [];

				//fetch each row of the table
				$rows.each(function (i, row) {
					var data = $(row).find('td');
					data.each(function (j, td) {
						var d = parseFloat(td.innerHTML);
						_d[j] = _d[j] || [];

						//only numbers are valid
						if (!isNaN(d)) _d[j].push([i, (d || 0)]);

					});

					//some stuff for the labels on the x axis
					opts.xlabels.push([i, $xlabels.eq(i).text()]);

				});

				//push the data in the data-object for this row (label) and define the colors
				for (var i = 0; i < legendlength; i++) {
					opts.data.push({
						'label': $legends.eq(i).text(),
						'data': _d[i]
					});
					colors[i] = opts.colors[i] || colors[i % opts.colors.length];
				}

				break;

			default:
				//trigger an error
				$.error('Orientation "' + opts.orientation + '" is not allowed');


			}

		} else {

			//trigger an error id no data or ttable is set
			$.error('No data or data table!');

		}


		opts.colors = colors;
		var std = {};

		//define some chart type specific standards
		switch (opts.type) {
		case 'bars':
			std = {
				points: {
					show: (opts.points !== null) ? opts.points : false
				},
				bars: {
					order: (opts.stack) ? null : true,
					show: true,
					border: false,
					fill: (opts.fill !== null) ? opts.fill : true,
					fillColor: (opts.fillColor !== null) ? opts.fillColor : null,
					align: opts.align || 'center',
					horizontal: opts.horizontal || false,
					barWidth: opts.barWidth || (opts.stack) ? 0.85 : 0.85 / opts.data.length,
					lineWidth: (opts.lineWidth !== null) ? opts.lineWidth : 0
				},
				lines: {
					show: false
				},
				pie: {
					show: false
				}
			};
			break;
		case 'pie':
			std = {
				points: {
					show: (opts.points !== null) ? opts.points : true
				},
				bars: {
					show: false
				},
				lines: {
					show: false
				},
				pie: {
					show: true,
					label: true,
					tilt: opts.tilt || 1,
					innerRadius: (opts.innerRadius) ? opts.innerRadius : 0,
					radius: (opts.tilt && !opts.radius) ? 0.8 : opts.radius || 1,
					shadowSize: 2
				}
			};
			break;
		case 'lines':
		default:
			std = {
				points: {
					show: (opts.points !== null) ? opts.points : true
				},
				bars: {
					show: false
				},
				lines: {
					show: true,
					lineWidth: (opts.lineWidth !== null) ? opts.lineWidth : 4,
					fill: (opts.fill !== null) ? opts.fill : false,
					fillColor: (opts.fillColor !== null) ? opts.fillColor : null
				},
				pie: {
					show: false
				}
			};
		}


		//some more standards and maybe the flot object
		var options = $.extend(true, {}, {

			series: $.extend(true, {}, {
				//must set to null not to false
				stack: (opts.stack) ? true : null,
				points: {
					show: opts.points
				}
			}, std),

			shadowSize: opts.shadowSize || 0,

			grid: {
				hoverable: opts.tooltip,
				clickable: true,
				color: '#666',
				borderWidth: null
			},

			legend: {
				show: opts.legend,
				position: (/^(ne|nw|se|sw)$/.test(opts.legendPosition)) ? opts.legendPosition : 'ne'
			},
			colors: opts.colors,
			xaxis: {
				ticks: opts.xlabels
			}
		}, opts.flot);

		//extend the flot object
		opts.flotobj = $.extend({}, opts.flotobj, options);

		if (opts) $.extend($this.data('wl_Chart'), opts);

		//let's draw the graph
		$.fn.wl_Chart.methods.draw.call(this);
	});

};

$.fn.wl_Chart.defaults = {
	width: null,
	height: 300,
	hideTable: true,
	data: {},
	stack: false,
	type: 'lines',
	points: null,
	shadowSize: 2,
	fill: null,
	fillColor: null,
	lineWidth: null,
	legend: true,
	legendPosition: "ne", // or "nw" or "se" or "sw"
	tooltip: true,
	tooltipGravity: 'n',
	tooltipPattern: function (value, legend, label, id, itemobj) {
		return "value is " + value + " from " + legend + " at " + label + " (" + id + ")";
	},
	orientation: 'horizontal',
	colors: ['#b2e7b2', '#f0b7b7', '#b5f0f0', '#e8e8b3', '#efb7ef', '#bbb6f0'],
	flot: {},
	onClick: function (value, legend, label, id, itemobj) {}
};

$.fn.wl_Chart.version = '1.2';


$.fn.wl_Chart.methods = {
	draw: function () {
		var $this = $(this),
			_opts = $this.data('wl_Chart');
		//draw the chart and save it within the DOM
		$this.data('wl_Chart').plot = $.plot(_opts.holder, _opts.data, _opts.flotobj);
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
			if ($.fn.wl_Chart.defaults[key] !== undefined || $.fn.wl_Chart.defaults[key] == null) {
				$this.data('wl_Chart')[key] = value;
			} else {
				$.error('Key "' + key + '" is not defined');
			}
		});

	}
};