Ext.define('IIG.window.SaveConfiguration', {
    extend: 'Ext.window.Window',
    alias: 'widget.saveconf',

    cls: 'popup-template',
    title: optimajet.localization.get('Configuration saving'),
    modal: true,
    layout: 'fit',
    width: 500,
    height: 310,
    msgSystemMessageText: 'System message',
    msgEnterTemplateNameText: 'Please specify template name',
    saveBtnText: 'Save',
    cancelBtnText: 'Cancel',

    initComponent: function () {
        var me = this;

        me.onCancel = function () {
            me.close();
        };
        me.onSave = function () {
            var form = me.down('form').getForm();
            var record = form.getRecord();
            form.updateRecord(record);
            if (record.isValid()) {
                record.save({
                    success: function (rec, operation) {
                        me.close();
                        Ext.StoreManager.lookup('templateStore').reload();
                        optimajet.showInfo(me.msgSystemMessageText, Ext.decode(operation.response.responseText).message);
                    }
                });
            } else {
                optimajet.showError(me.msgSystemMessageText, me.msgEnterTemplateNameText);
            }
        };

        var config = {
            items: [{
                id: 'templateForm',
                xtype: 'ftemplate'
            }],
            dockedItems: [{
                xtype: 'toolbar',
                cls: 'template-toolbar',
                dock: 'bottom',
                items: ['->', {
                    text: me.saveBtnText,
                    iconCls: 'fa fa-check',
                    cls: 'btn btn-primary btn-cons',
                    handler: me.onSave,
                    x: 226
                }, {
                    text: me.cancelBtnText,
                    cls: 'btn btn-default btn-cons',
                    handler: me.onCancel,
                    x: 354
                }]
            }]
        };

        Ext.apply(me, config);

        me.callParent(arguments);
    }
});