Ext.define('Ext.ux.optimajet.FileUploadForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.fileuploadform',
    fieldName: '',
    tokenControlName: '',
    tableName: 'unknown',
    items: [{layout : 'column',items :[
        {
        xtype: 'filefield',
        id: 'form-file',
        columnWidth: 1,
        labelWidth: 0,
        emptyText: 'Выберите файл для загрузки...',
        fieldLabel: '',
        name: 'path',
        buttonText: 'Upload',
        listeners: {
            'change': function (fb, v) {
                if (v == undefined || v == '')
                    return;
                var me = this;
                var url = optimajet.CorrectUrl('FU/Upload?path=' + v + '&tablename=' + me.tableName);
                var form = this.up('form').getForm();
                form.submit({
                    clientValidation: false,
                    timeout: 60,
                    url: url,
                    waitMsg: optimajet.localization.get('Loading') + '...',
                    success: function (fp, o) {

                        var uploadInfo = o.result.result[0];

                        if (uploadInfo == undefined)
                            return;
                        var parent = this.form.owner;
                        parent.setValue(uploadInfo.name);
                        var tokenControl = Ext.getCmp(parent.tokenControlName);
                        if (tokenControl != undefined)
                            tokenControl.setValue(uploadInfo.id);
                        parent.isValid();
                        //optimajet.showInfo('Загрузка файла', 'Файл ' + o.result.name + ' успешно загружен');
                    }
                });
            }
        }
    },
    {
        xtype: 'button',
        text: optimajet.localization.get('Download'),
        disabled: true,
        handler: function () {
            var parent = this.ownerCt.ownerCt;
            var tokenControl = Ext.getCmp(parent.tokenControlName);
            if (tokenControl != undefined) {
                var token = tokenControl.getValue();
                var fileName = parent.getValue();
                if (token != undefined && fileName != undefined) {
                    var url = optimajet.CorrectUrl('FU/Download');
                    url = url + '?token=' + token + '&filename=' + fileName;
                    location.href = url;
                }
            }
        }
    }]
    }],
    constructor: function(config) {
        var me = this;
        this.callParent(arguments);
        var item = me.items.items[0].items.get('form-file');
        item.button.setDisabled(me.readOnly);
        item.allowBlank = me.allowBlank;

    },
    setValue: function (value) {
        var me = this;
        var item = me.items.items[0].items.get('form-file');
        item.setValue(value);
        item.setRawValue(value);
        var downloadBtn = me.items.items[0].items.items[1];
        downloadBtn.setDisabled(!value);
    },
    getValue: function () {
        var me = this;
        var item = me.items.items[0].items.get('form-file');
        return item.getValue();
    },
    isValid: function () {
        var me = this;
        var item = me.items.items[0].items.get('form-file');
        var res = item.validate();
        if (res) {
            me.items.items[0].addCls('x-panel-default');
            me.items.items[0].removeCls('workspace_error_border');
        } else {
            me.items.items[0].removeCls('x-panel-default');
            me.items.items[0].addCls('workspace_error_border');
        }
        return res;
    }
});