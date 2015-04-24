Ext.define('IIG.matrix.Remote', {
    extend: 'Mz.aggregate.matrix.Remote',
    alias: 'pivotmatrix.iigremote',
    mztype: 'iigremote',

    pageSize: 1000,

    delayedProcess: function (manual) {
        var me = this,
            grid = Ext.ComponentQuery.query('iigpivot')[0];

        if (!manual) {
            me.endProcess();
            return;
        }

        var params = {
            aggregate: grid.getAggregate(),
            left: grid.getLeftAxis(),
            top: grid.getTopAxis(),
            reportId: grid.reportId,
            budgetId: grid.budgetId,
            budgetVersionId: grid.budgetVersionId,
            budgetName: Ext.get('cbCurrentBudget').getValue(),
            budgetVersionName: 1// Ext.get('cbCurrentBudgetVersion').getValue()
        };
        Ext.Ajax.on('beforerequest', function (connection, options) {
            Ext.getBody().mask('Загрузка...');
        });
        Ext.Ajax.on('requestcomplete', function (connection, options) {
            Ext.getBody().unmask();
        });

        Ext.Ajax.on('requestexception', function (connection, options) {
            Ext.getBody().unmask();
        });
        Ext.Ajax.request({
            url: me.url,
            timeout: 900000,
            jsonData: {
                pivotConfiguration: Ext.encode(params)
            },
            success: me.processRemoteResults,
            failure: me.processFailed,
            scope: me
        });
    },

    initComponent: function() {
        var me = this;

        me.callParent(arguments);
    }
})