Ext.onReady(function () {

    Ext.define('IIG.pivot.plugin.configurator.DropZone', {
        override: 'Mz.pivot.plugin.configurator.DropZone',

        onNodeOver: function (node, dragZone, e, data) {
            var me = this,
                doPosition;

            doPosition = true;
            if (data.header.el.dom === node) {
                doPosition = false;
            }

            if (doPosition) {
                me.positionIndicator(data, node, e);
                me.valid = me.validateDataSource(data);
            } else {
                me.valid = false;
            }
            return me.valid ? me.dropAllowed : me.dropNotAllowed;
        },
        validateDataSource: function (data) {
            var me = this,
                columnData;
            columnData = data.header.dimension;
            if (me.panel.itemId == 'fieldsCt')
                return true;
            if (me.panel.isAgg && !Boolean(columnData.isDataSource))
                return false;
            if (!me.panel.isAgg && Boolean(columnData.isDataSource))
                return false;
            return true;
        }
    });

    Ext.define('IIG.pivot.plugin.configurator.Column', {
        override: 'Mz.pivot.plugin.configurator.Column',

        dataSourceCls: null,
        diffText: 'Show difference',
        isBudgetVersionsReport: false,

        renderTpl:
            '<div id="{id}-configCol" class="' + Ext.baseCSSPrefix + 'config-column-inner {dataSourceCls}">' +
                '<tpl if="(!isAgg && isCustomizable) || (isCustomizable && (isAggregationChangeable || isBudgetVersionsReport))">' +
                '<span id="{id}-customCol" class="' + Ext.baseCSSPrefix + 'config-column-customize"></span>' +
                '</tpl>' +
                '<tpl if="isAggregationChangeable && isBudgetVersionsReport">' +
                '<span id="{id}-textCol" class="' + Ext.baseCSSPrefix + 'config-column-text ' + Ext.baseCSSPrefix + 'column-header-text">' +
                '{header}{aggregator}' +
                '</span>' +
                '<tpl else>' +
                '<span id="{id}-textCol" class="' + Ext.baseCSSPrefix + 'config-column-text ' + Ext.baseCSSPrefix + 'column-header-text">' +
                '{header}' +
                '</span>' +
                '</tpl>' +
                '<span id="{id}-sortCol" class=""></span>' +
                '<span id="{id}-filterCol" class=""></span>' +
            '</div>',
        initRenderData: function () {
            var me = this;
            return Ext.apply(me.callParent(arguments), {
                header: me.dimension.header,
                aggregator: me.isAgg && me.isDataSource == 1 ? ' (' + me.dimension.aggregator + ')' : '',
                dimension: me.dimension,
                isCustomizable: me.isCustomizable,
                dataSourceCls: me.dataSourceCls,
                isAggregationChangeable: me.isDataSource == 1,
                isBudgetVersionsReport: me.isBudgetVersionsReport,
                isAgg: me.isAgg,
                isDataSource: me.isDataSource
            });
        },
        showAggMenu: function () {
            var me = this,
                aggregator = me.dimension.aggregator;
            Ext.destroy(me.menu);
            var showDiffMenuItem = {
                group: 'advanced',
                text: me.diffText,
                aggregator: '',
                checked: me.dimension.showDiff,
                handler: function () {
                    this.checked = me.dimension.showDiff;
                    me.dimension.showDiff = !Boolean(me.dimension.showDiff);
                    me.fireEvent('configchange');
                }
            };
            me.menu = Ext.create('Ext.menu.Menu', {
                floating: true,
                defaults: {
                    handler: me.handleMenuClick,
                    scope: me,
                    xtype: 'menucheckitem',
                    group: 'aggregator'
                }
            });

            if (me.isDataSource == 1) {
                me.menu.add({ text: me.sumText, aggregator: 'sum', checked: aggregator == 'sum' },
                            { text: me.avgText, aggregator: 'avg', checked: aggregator == 'avg' },
                            { text: me.countText, aggregator: 'count', checked: aggregator == 'count' },
                            { text: me.maxText, aggregator: 'max', checked: aggregator == 'max' },
                            { text: me.minText, aggregator: 'min', checked: aggregator == 'min' }
                );
            }
            if (me.isBudgetVersionsReport) {
                if (me.isDataSource == 1) {
                    me.menu.add({ xtype: 'menuseparator' });
                }
                me.menu.add(showDiffMenuItem);
            }

            if (me.menu.items.length > 0) {
                me.menu.showBy(me);
            }
        }
    });

    Ext.define('IIG.pivot.plugin.configurator.Container', {
        override: 'Mz.pivot.plugin.configurator.Container',

        addColumn: function (config, pos, notify) {
            var me = this, newCol, cfg = {},
                itemFound = me.items.findIndex('dimensionId', new RegExp('^' + config.id + '$', 'i')) >= 0;

            if (!me.isAgg) {
                if (itemFound) {
                    if (notify === true) {
                        me.notifyGroupChange();
                    }
                    return;
                }
            } else {
                if (itemFound) {
                    config.id = Ext.id();
                }
            }

            if (me.items.getCount() == 0) {
                me.hideGroupByText();
            }

            Ext.apply(cfg, {
                dimension: config,
                dimensionId: config.id,
                header: config.header,
                dataSourceCls: config.isDataSource && config.isDataSource != 0 ? Ext.baseCSSPrefix + 'config-column-data-source' : '',
                isCustomizable: me.isCustomizable,
                isAgg: me.isAgg,
                isDataSource: config.isDataSource
            });

            if (me.isAgg) {
                config.aggregator = config.aggregator || 'sum';
            }

            newCol = Ext.create('Mz.pivot.plugin.configurator.Column', cfg);

            if (pos != -1) {
                me.insert(pos, newCol);
            } else {
                me.add(newCol);
            }
            me.updateColumnIndexes();
            newCol.relayers = me.relayEvents(newCol, ['sortchange', 'filterchange', 'configchange']);

            if (notify === true) {
                me.notifyGroupChange();
            }
        }
    });

    Ext.define('IIG.aggregate.matrix.Results', {
        override: 'Mz.aggregate.matrix.Results',

        calculate: function () {
            Ext.Array.forEach(this.items.items, function (item) {
                item.calculate();
            });
        }
    });

    Ext.define('IIG.pivot.plugin.ExcelExport', {
        override: 'Mz.pivot.plugin.ExcelExport',

        onBeforeGridRendered: function () {
            var me = this;

            if (me.grid instanceof Mz.pivot.Grid) {
                me.gridMaster = me.grid;
            } else {
                me.gridMaster = me.grid.up('iigpivot');
            }

            if (!me.gridMaster) {
                me.destroy();
                return;
            }
        },
    });

    Ext.define('IIG.aggregate.axis.Abstract', {
        override: 'Mz.aggregate.axis.Abstract',

        blankText: '(empty)',
        sortMonths: function (a, b, direction) {
            var n1 = a.value,
                n2 = b.value;

            var result = moment().month(n1).month() - moment().month(n2).month();

            if (n1 == blankText) result = -1;
            if (n2 == blankText) result = 1;

            if (result < 0 && direction === 'DESC') return 1;
            if (result > 0 && direction === 'DESC') return -1;

            return result;
        },
        sortTree: function () {
            var tree = arguments[0] || this.tree,
                dimension,
                me = this;

            if (tree.length > 0) {
                dimension = tree[0].dimension;
            }

            if (dimension) {
                //Custom sorting by PeriodName
                if (dimension.dataIndex == 'PeriodName') {
                    Ext.Array.sort(tree, function (a, b) {
                        return me.sortMonths(a, b, dimension.sortable ? dimension.direction : 'ASC');
                    });
                }
                else if (dimension.sortable === true) {
                    Ext.Array.sort(tree, function (a, b) {
                        return dimension.sorterFn(a, b);
                    });
                }
            }

            Ext.Array.each(tree, function (item) {
                if (item.children) {
                    this.sortTree(item.children);
                }
            }, this);
        },
    });

    Ext.define('IIG.aggregate.dimension.Item', {
        override: 'Mz.aggregate.dimension.Item',

        //blankText: '(пусто)'
    });

    Ext.define('IIG.pivot.plugin.DrillDown', {
        override: 'Mz.pivot.plugin.DrillDown',

        width: 900,
        height: 600,
        textWindow: 'Data Details',
        keyColumnName: '',
        metaReportId: '',
        editForm: '',
        dataUrl: '',
        exportActionUrl: '',
        reportName: '',
        budgetVersionId1: '',
        budgetVersionId2: '',

        renderFn: function (value) {
            return Ext.util.Format.number(value, '0,000.00');
        },

        showView: function (filter, detalizationProperty) {
            var me = this;
            var suffix = '_1';
            var dataIndex = detalizationProperty;
            var keyColumnName = me.keyColumnName;
            var is_1 = detalizationProperty.indexOf(suffix, detalizationProperty.length - suffix.length) > -1;
            
            if (is_1)
            {
                dataIndex = detalizationProperty.replace(suffix, '');
                keyColumnName = keyColumnName + suffix;
            }

            var columns = Enumerable
                .From(me.columns)
                .Where(function (column) { return column.isDataSource == 0 || column.id == dataIndex; });

            var detalizationColumn = columns.Where(function (column) { return column.id == dataIndex; }).FirstOrDefault();
            if (!detalizationColumn) {
                return;
            }
            detalizationColumn.summaryRenderer = me.renderFn;
            detalizationColumn.align = "right";
            detalizationColumn.renderer = me.renderFn;
            var endWith_1 = detalizationColumn.dataIndex.indexOf(suffix, detalizationColumn.dataIndex.length - suffix.length) > -1;
            if (endWith_1) {
                detalizationColumn.dataIndex = detalizationColumn.dataIndex.replace(suffix, '');
            }
            if (is_1) {
                detalizationColumn.dataIndex += '_1';
            }

            var fields = columns
                 .Select(function (column) { return column.dataIndex; })
                    .ToArray();

            fields.unshift("NumberId");
            fields.unshift(keyColumnName);

            var viewColumns = columns.ToArray();
            viewColumns.splice(0, 0, { id: 'NumberId', dataIndex: 'NumberId', header: 'Number', isDataSource: 0 });

            var store = Ext.create('Ext.data.Store', {
                pageSize: 30,
                fields: fields,
                proxy: {
                    type: 'ajax',
                    api: {
                        read: optimajet.CorrectUrl(me.dataUrl)
                    },
                    timeout: 900000,
                    extraParams: {
                        filter: Ext.encode(filter),
                        keyColumnName: keyColumnName,
                        metaReport: me.pivot.metaReport,
                        detalizationProperty: detalizationProperty,
                        budgetVersionId1: me.budgetVersionId1,
                        budgetVersionId2: me.budgetVersionId2
                    },
                    reader: {
                        type: 'json',
                        root: 'data',
                        totalProperty: 'totalCount',
                        messageProperty: 'message'
                    }
                }
            });

            me.view = Ext.create('Ext.window.Window', {
                title: me.textWindow,
                width: me.width,
                height: me.height,
                layout: 'fit',
                modal: true,
                maximizable: true,
                items: [{
                    xtype: 'grid',
                    cls: 'drill-down',
                    border: false,
                    columnLines: true,
                    viewConfig: {
                        loadMask: true
                    },
                    columns: viewColumns,
                    features: [{
                        ftype: 'summary',
                        remoteRoot: 'summaryData',
                        dock: 'bottom'
                    }],
                    store: store,
                    dockedItems: [{
                        itemId: 'idPager',
                        xtype: 'pagingtoolbar',
                        store: store,
                        dock: 'bottom',
                        displayInfo: true
                    }, {
                        xtype: 'toolbar',
                        docked: 'bottom',
                        items: [{
                            iconCls: 'toolbar-excel',
                            text: 'Excel',
                            reportName: me.textWindow,
                            handler: function () {
                                var urlFormat = '{0}?keyColumnName={1}&metaReport={2}&filter={3}&detalizationProperty={4}&reportName={5}';
                                var url = Ext.String.format(urlFormat, me.exportActionUrl, keyColumnName, me.pivot.metaReport, Ext.encode(filter), detalizationProperty, me.reportName);
                                if (me.budgetVersionId1 != '' && me.budgetVersionId2 != '')
                                {
                                    url += Ext.String.format('&budgetVersionId1={0}&budgetVersionId2={1}', me.budgetVersionId1, me.budgetVersionId2);
                                }
                                location.href = url;
                            }
                        }]
                    }],
                    listeners: {
                        itemdblclick: function (view, record) {
                            var query = {
                                editform: me.editForm,
                                selectquerytype: 0,
                                needredirect: false,
                                id: record.get(keyColumnName)
                            };

                            var url = Ext.String.format('/#WS/{0}/GetContent?{1}', me.editForm, Ext.Object.toQueryString(query));
                            window.open(optimajet.CorrectUrl(url));
                        }
                    }
                }]
            });

            me.store = store;
            me.view.down('#idPager').moveFirst();
            me.view.show();
        },

        getFilter: function (lk, tk) {
            var me = this,
                matrix = me.pivot.getMatrix(),
                leftKeys = [],
                topKeys = [],
                leftFilter = Enumerable.From([]),
                topFilter = Enumerable.From([]);

            var leftItem = Enumerable
                .From(matrix.leftAxis.items.items)
                .Where(function (item) { return item.key == lk; })
                .SingleOrDefault();
            var topItem = Enumerable
                .From(matrix.topAxis.items.items)
                .Where(function (item) { return item.key == tk; })
                .SingleOrDefault();

            var configuration = me.pivot.getConfiguration();
            var leftAxis = configuration.leftAxis;
            var topAxis = configuration.topAxis;

            if (Boolean(leftItem)) {
                leftKeys = Object.keys(leftItem.data);
                leftFilter = Enumerable
                .From(leftAxis)
                .Select(function (item) {
                    var i = leftAxis.indexOf(item);
                    return {
                        dataIndex: item.dataIndex,
                        value: leftItem.data[leftKeys[i]]
                    }
                })
                .Where(function (item) { return Boolean(item.value); });
            }

            if (Boolean(topItem)) {
                topKeys = Object.keys(topItem.data);
                topFilter = Enumerable
                .From(topAxis)
                .Select(function (item) {
                    var i = topAxis.indexOf(item);
                    return {
                        dataIndex: item.dataIndex,
                        value: topItem.data[topKeys[i]]
                    }
                })
                .Where(function (item) { return Boolean(item.value); });
            }

            return leftFilter.Union(topFilter).ToArray();
        },

        runPlugin: function (params) {
            // do nothing if the plugin is disabled
            if (this.disabled) return;

            var me = this,
                matrix = me.pivot.getMatrix(),
                result, lk, tk,
                detalizationProperty;

            lk = params.leftKey;
            tk = params.topKey;
            detalizationProperty = params.column.dimension.dataIndex;
            if (params.column.dimension.isDataSource == 2) {
                return;
            }
            if (lk && tk) {
                result = matrix.results.get(lk, tk);
                if (result) { //pivot cell has value
                    me.showView(me.getFilter(lk, tk), detalizationProperty);
                } else {
                    optimajet.showWarning('Сообщение системы', 'Для данной ячейки исходные записи не найдены');
                }
            }
        }
    });

    Ext.define('IIG.grid.feature.Summary', {
        override: 'Ext.grid.feature.Summary',
        getSummary: function (store, type, field, group) {
            var reader = store.proxy.reader;
            if (this.remoteRoot && reader.rawData) {
                // reset reader root and rebuild extractors to extract summaries data
                var root = reader.root;
                reader.root = this.remoteRoot;
                reader.buildExtractors(true);
                var summaryRow = reader.getRoot(reader.rawData);
                // restore initial reader configuration
                reader.root = root;
                reader.buildExtractors(true);
                if (typeof summaryRow[field] != 'undefined') {
                    return summaryRow[field];
                }

                return '';
            }

            return this.callParent(arguments);
        }
    });

    Ext.define('IIG.aggregate.matrix.Abstract', {
        override: 'Mz.aggregate.matrix.Abstract',

        budgetName1: '',
        budgetName2: '',
        budgetVersionName1: '',
        budgetVersionName2: '',
        headerFormat: '{0}-{1}',
        diffText: 'Difference',

        initAggregates: function (aggregates) {

            var me = this;

            if (me.budgetVersionName1 != '' && me.budgetVersionName2 != '') {
                var newAggregates = [];
                for (i = 0; i < aggregates.length; i++) {
                    var agrr = aggregates[i];
                    newAggregates.push(agrr);
                    var agrr_1 = {
                        dataIndex: agrr.dataIndex + '_1',
                        aggregator: agrr.aggregator,
                        header: agrr.header,
                        isDataSource: agrr.isDataSource,
                        renderer: agrr.renderer
                    };
                    newAggregates.push(agrr_1);
                    if (agrr.showDiff) {
                        var diff = {
                            dataIndex: agrr.dataIndex + '_diff',
                            header: me.diffText,
                            aggregator: 'diff',
                            renderer: agrr.renderer,
                            isDiff: true,
                            initialAggregator: agrr.aggregator
                        };
                        newAggregates.push(diff);
                    }
                }

                aggregates = newAggregates;
            }

            me.callParent(arguments);
        },

        updateHeaders: function (columns, parentColumn) {
            var me = this;
            Enumerable.From(columns).ForEach(function (col) {
                if (col.columns && col.columns.length > 0) {
                    me.updateHeaders(col.columns, col);
                }
            });
            var aggrColumns = Enumerable.From(columns).Where(function (c) { return c.dimension && c.dimension.isDataSource });
            aggrColumns.ForEach(function (col) {
                var col_1 = Enumerable.From(columns).Where(function (c) { return c.dimension && c.dimension.dataIndex == col.dimension.dataIndex + '_1'; }).FirstOrDefault();
                var col_diff = Enumerable.From(columns).Where(function (c) { return c.dimension && c.dimension.dataIndex == col.dimension.dataIndex + '_diff'; }).FirstOrDefault();
                var header = col.header;
                var text = col.text;
                col.text = Ext.String.format(me.headerFormat, me.budgetName1, me.budgetVersionName1);
                col_1.text = Ext.String.format(me.headerFormat, me.budgetName2, me.budgetVersionName2);
                var newColumn = {
                    header: header,
                    text: text,
                    columns: [col, col_1]
                };
                if (col_diff != null) {
                    newColumn.columns.push(col_diff);
                }
                var colIndex = parentColumn.columns.indexOf(col);
                parentColumn.columns[colIndex] = newColumn;
                var colIndex_1 = parentColumn.columns.indexOf(col_1);
                if (colIndex_1 > -1)
                    parentColumn.columns.splice(colIndex_1, 1);
                if (col_diff != null) {
                    var colDiffIndex = parentColumn.columns.indexOf(col_diff);
                    if (colDiffIndex > -1)
                        parentColumn.columns.splice(colDiffIndex, 1);
                }
            });
        },

        onBuildColumns: function (columns) {
            var me = this;
            if (me.budgetVersionName1 != '' && me.budgetVersionName2 != '') {
                this.updateHeaders(columns);
                var grandTotalCol = Enumerable.From(columns).Where(function (c) { return c.grandTotal }).FirstOrDefault();
                if (grandTotalCol && grandTotalCol.columns && grandTotalCol.columns.length > 0) {
                    var grandTotalColIndex = columns.indexOf(grandTotalCol);
                    if (grandTotalColIndex > -1) {
                        for (var i = grandTotalCol.columns.length - 1; i >= 0; i--) {
                            columns.splice(grandTotalColIndex, 0, grandTotalCol.columns[i]);
                        }
                        grandTotalColIndex = columns.indexOf(grandTotalCol);
                        columns.splice(grandTotalColIndex, 1);
                    }
                }
            }
        }
    });

    Ext.define('IIG.aggregate.Aggregators', {
        override: 'Mz.aggregate.Aggregators',

        diff: function (records, measure, matrix, rowGroupKey, colGroupKey) {
            var diff = 0;
            var dataIndex = measure.replace('_diff', '');
            var initialAggregatorFn = Mz.aggregate.Aggregators[this.initialAggregator];
            if (initialAggregatorFn && Ext.isFunction(initialAggregatorFn)) {
                var total = initialAggregatorFn(records, dataIndex, matrix, rowGroupKey, colGroupKey);
                var total_1 = initialAggregatorFn(records, dataIndex + '_1', matrix, rowGroupKey, colGroupKey);
                diff = total_1 - total;
            }

            return diff;
        }
    });

    Ext.define('IIG.pivot.plugin.configurator.FilterValueWindow', {
        override: 'Mz.pivot.plugin.configurator.FilterValueWindow',

        width: 500,
        height: 200,
        minWidth: 500,
        minHeight: 200
    });

    Ext.define('IIG.pivot.plugin.configurator.FilterLabelWindow', {
        override: 'Mz.pivot.plugin.configurator.FilterLabelWindow',

        width: 500,
        height: 200,
        minWidth: 500,
        minHeight: 200
    });

    Ext.define('IIG.pivot.plugin.configurator.FilterTopWindow', {
        override: 'Mz.pivot.plugin.configurator.FilterTopWindow',

        width: 500,
        height: 200,
        minWidth: 500,
        minHeight: 200
    });
})