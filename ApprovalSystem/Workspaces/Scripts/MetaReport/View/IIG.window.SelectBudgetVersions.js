Ext.define('IIG.window.SelectBudgetVersions', {
    extend: 'Ext.window.Window',
    alias: 'widget.saveconf',

    cls: 'popup-template',
    title: 'Select Budget Versions',
    modal: true,
    layout: 'fit',
    width: 530,
    height: 250,
    minWidth: 530,
    minHeight: 230,
    maxHeight: 230,
    budgetInfo: null,
    renderTo: 'maindiv',
    closable: false,

    initComponent: function () {
        var me = this;

        me.onCancel = function () {
            me.close();
        };

        me.onSave = function () {
            var form = me.down('form').getForm();
            if (form.isValid()) {
                me.budgetInfo.BudgetId1 = form.findField('BudgetId1').getValue();
                me.budgetInfo.BudgetId2 = form.findField('BudgetId2').getValue();
                me.budgetInfo.BudgetVersionId1 = form.findField('BudgetVersionId1').getValue();
                me.budgetInfo.BudgetVersionId2 = form.findField('BudgetVersionId2').getValue();
                me.budgetInfo.BudgetName1 = form.findField('BudgetId1').getDisplayValue();
                me.budgetInfo.BudgetName2 = form.findField('BudgetId2').getDisplayValue();
                me.budgetInfo.BudgetVersionName1 = form.findField('BudgetVersionId1').getDisplayValue();
                me.budgetInfo.BudgetVersionName2 = form.findField('BudgetVersionId2').getDisplayValue();
                me.close();
            }
        };

        me.closable = !isCancelHidden();

        function isCancelHidden() {
            return me.budgetInfo.BudgetVersionId1 == null || me.budgetInfo.BudgetVersionId2 == null;
        }

        var config = {
            items: [{
                id: 'selectBudgetVersionsForm',
                xtype: 'fbudgetversionsselector',
                budgetInfo: this.budgetInfo
            }],
            dockedItems: [{
                xtype: 'toolbar',
                cls: 'template-toolbar',
                dock: 'bottom',
                items: ['->', {
                    text: 'OK',
                    iconCls: 'fa fa-check',
                    cls: 'btn btn-primary btn-cons',
                    handler: me.onSave,
                    x: isCancelHidden() ? 384 : 256,
                }, {
                    text: 'Cancel',
                    cls: 'btn btn-default btn-cons',
                    hidden: isCancelHidden(),
                    handler: me.onCancel,
                    x: 384,
                }]
            }],
            onEsc: me.onCancel
        };
        Ext.apply(me, config);

        me.callParent(arguments);
    }
});