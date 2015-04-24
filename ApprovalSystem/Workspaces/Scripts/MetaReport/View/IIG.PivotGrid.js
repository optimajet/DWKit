Ext.define('IIG.PivotGrid', {
    extend: 'Mz.pivot.Grid',
    alias: 'widget.iigpivot',

    keyColumnName: '',
    isBudgetVersionsReport: false,

    startRowGroupsCollapsed: false,
    startColGroupsCollapsed: false,
    colGrandTotalsPosition: 'first',
    rowGrandTotalsPosition: 'first',
    enableLoadMask: false,
    dataIsNotRelevantMessageText: 'Data is not relevant. You can continue to configure fields or reload data',
    loadButtonText: 'Reload',

    initComponent: function () {
        var me = this;

        Ext.apply(me, {
            height: Ext.getBody().getViewSize().height,
            region: 'center',
            autoScroll: true,
            getAggregate: function (doNotAddBudgetVersionAggrFields) {
                var aggrFields = [];
                var result = Enumerable.From(me.aggregate).ForEach(function (item) {
                    var aggr = {
                        dataIndex: item.dataIndex,
                        aggregator: item.aggregator,
                        header: item.header,
                        isDataSource: item.isDataSource,
                        renderer: item.renderer,
                        showDiff: item.showDiff
                    };
                    aggrFields.push(aggr);
                    if (!doNotAddBudgetVersionAggrFields && me.isBudgetVersionsReport) {

                        if (item.isDataSource && item.isDataSource != 0) {
                            var aggr1 = {
                                dataIndex: item.dataIndex + '_1',
                                aggregator: item.aggregator,
                                header: item.header,
                                isDataSource: item.isDataSource,
                                renderer: item.renderer
                            };
                            aggrFields.push(aggr1);
                        }
                    }
                });

                return aggrFields;
            },
            getLeftAxis: function () {
                return Enumerable.From(me.leftAxis).Select(function (item) {
                    return { dataIndex: item.dataIndex, header: item.header, isCustomizable: item.isCustomizable };
                }).ToArray();
            },
            getTopAxis: function () {
                return Enumerable.From(me.topAxis).Select(function (item) { return { dataIndex: item.dataIndex, header: item.header, isCustomizable: item.isCustomizable }; }).ToArray();
            },
            getConfiguration: function (doNotAddBudgetVersionAggrFields) {
                return {
                    aggregate: me.getAggregate(doNotAddBudgetVersionAggrFields),
                    leftAxis: me.getLeftAxis(),
                    topAxis: me.getTopAxis()
                };
            }
        });

        me.addEvents('fieldsChanged');

        me.callParent(arguments);
    },

    reconfigurePivot: function (configuration) {
        var me = this;
        if (configuration) {
            Enumerable.From(configuration.aggregate).ForEach(function (aggrItem) {
                if (aggrItem.aggregator == 'count' || aggrItem.isDataSource == 2) {
                    aggrItem.renderer = Ext.util.Format.numberRenderer('0');
                }
                else {
                    aggrItem.renderer = optimajet.FormatDecimal;
                }
            });

            if (!configuration.suppressFieldsChangedEvent) {
                var store = me.getStore();
                var storeItems = store.data.items || [];
                var leftAxis = configuration.leftAxis || [];
                var topAxis = configuration.topAxis || [];
                var aggregate = configuration.aggregate || [];
                if ((leftAxis.length > 0 || topAxis.length > 0) && aggregate.length > 0) {
                    if (storeItems.length > 0) {
                        var rawItem = storeItems[0].raw;
                        var storeFieldNames = Enumerable.From(rawItem).Select(function (item) { return item.Key; });
                        var topFieldNames = Enumerable.From(configuration.topAxis).Select(function (item) { return item.dataIndex; });
                        var leftFieldNames = Enumerable.From(configuration.leftAxis).Select(function (item) { return item.dataIndex; });
                        var aggrFieldNames = Enumerable.From(configuration.aggregate).Select(function (item) { return item.dataIndex; });
                        var allFieldNames = topFieldNames.Union(leftFieldNames).Union(aggrFieldNames);
                        var newFields = allFieldNames.Except(storeFieldNames).ToArray();
                        me.fireEvent('fieldsChanged', newFields);
                    }
                    else {
                        me.fireEvent('fieldsChanged', [{}]);
                    }
                }
            }
        }

        me.callParent(arguments);
    }
})