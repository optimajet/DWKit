Ext.define('IIG.pivot.plugin.Configurator', {
    extend: 'Mz.pivot.plugin.Configurator',
    alias: 'iigconfigurator',
    title: 'Report Configuration',

    onBeforeGridRendered: function () {
        var me = this;

        if (me.grid instanceof Mz.pivot.Grid) {
            me.gridMaster = me.grid;
        } else {
            me.gridMaster = me.grid.up('mzpivotgrid');
        }

        if (!me.gridMaster) {
            me.destroy();
            return;
        }

        if (me.gridMaster.down('mzconfigpanel')) {
            me.destroy();
            return;
        }
        me.gridMaster.addDocked({
            xtype: 'panel',
            title: me.title,
            collapsible: true,
            animCollapse: false,
            items: [{
                id: 'config-panel',
                xtype: 'mzconfigpanel',
                grid: me.gridMaster,
                fields: me.fields,
                refreshDelay: me.refreshDelay
            }]
        });

        me.configCt = Ext.ComponentQuery.query('mzconfigpanel')[0];
        me.configCt.fieldsCt.addClass('fields-panel');

        me.gridMaster.addEvents(
            'configchange',
            'fieldsort',
            'showconfigpanel',
            'hideconfigpanel'
        );
    },

    initComponent: function () {
        me = this;
        me.callParent(arguments);
    }
})