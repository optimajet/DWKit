Ext.define('IIG.form.Template', {
    extend: 'Ext.form.Panel',
    alias: 'widget.ftemplate',

    padding: '5 10',

    nameLabelText: 'Name',
    globalLabelText: 'Global',
    authorLabelText: 'Author',
    changedByLabelText: 'Changed by',
    changeDateLabelText: 'Modified',

    initComponent: function() {
        var me = this;

        var config = {
            layout: { type: 'vbox', align: 'stretch' },
            items: [{
                xtype: 'textfield',
                fieldLabel: me.nameLabelText,
                name: 'Name'
            }, {
                xtype: 'checkbox',
                fieldLabel: me.globalLabelText,
                name: 'IsGlobal'
            }, {
                xtype: 'textfield',
                readOnly: true,
                fieldLabel: me.authorLabelText,
                name: 'AuthorName'
            }, {
                xtype: 'textfield',
                readOnly: true,
                fieldLabel: me.changedByLabelText,
                name: 'ChangeEmployeeName'
            }, {
                xtype: 'datefield',
                readOnly: true,
                fieldLabel: me.changeDateLabelText,
                name: 'ChangeDate'
            }, {
                xtype: 'hidden',
                name: 'Value'
            }, {
                xtype: 'hidden',
                name: 'ChangeEmployeeId'
            }, {
                xtype: 'hidden',
                name: 'BudgetId1'
            },{
                xtype: 'hidden',
                name: 'BudgetId2'
            }, {
                xtype: 'hidden',
                name: 'BudgetName1'
            }, {
                xtype: 'hidden',
                name: 'BudgetName2'
            }, {
                xtype: 'hidden',
                name: 'BudgetVersionId1'
            }, {
                xtype: 'hidden',
                name: 'BudgetVersionId2'
            }, {
                xtype: 'hidden',
                name: 'BudgetVersionName1'
            }, {
                xtype: 'hidden',
                name: 'BudgetVersionName2'
            }]
        };

        Ext.apply(me, config);
        Ext.apply(me.initialConfig, config);
        me.callParent(arguments);
    }
})