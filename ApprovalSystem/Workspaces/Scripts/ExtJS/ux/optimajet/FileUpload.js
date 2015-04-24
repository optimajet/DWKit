Ext.define('Ext.ux.optimajet.FileUpload', {
    extend: 'Ext.form.field.File',
    alias: 'widget.fileupload',
    buttonText: 'Upload',
    fieldName: '',
    tokenFieldName: '',
    tableName: 'unknown',
    formSubmitUrl: '',
    listeners: {
        'change': function (fb, v) {
            var url = optimajet.CorrectUrl('FU/Upload?path=' + v + '&tablename=' + this.tableName);
            if (this.AddUrlParams != undefined) {
                url += "&" + this.AddUrlParams;
            }
            this.formSubmitUrl = url;
        },
        'afterrender': function (o, t, th) {
            var ufield = this.up('panel').items.items[1];
            var grid = this.up('grid');
            var form = this.up('form').getForm();
            grid.on('edit', function () {
                form.submit({
                    clientValidation: false,
                    timeout: 60,
                    url: ufield.formSubmitUrl,
                    waitMsg: optimajet.localization.get('Loading') + '...',
                    success: function (fp, o) {
                        if (o.result == undefined)
                            return;
                        ufield.setRawValue(o.result.name);
                        var parent = ufield.getBubbleTarget();
                        if (parent == undefined || parent == null || ((typeof (parent.__proto__) !== "undefined" && parent.__proto__.$className != 'Ext.grid.RowEditor') || (parent.$className != 'Ext.grid.RowEditor')) || ufield.fieldName == '' || ufield.tokenFieldName == '')
                            ;
                        else {
                            var uploadInfo = o.result.result[0];
                            var record = parent.getRecord();

                            if (record != undefined) {
                                record.set(ufield.fieldName, uploadInfo.name);
                                record.set(ufield.tokenFieldName, uploadInfo.id);

                                var fields = record.store.model.getFields();
                                for (var i = 0; i < fields.length; i++) {
                                    if (uploadInfo[fields[i].name] != undefined) {
                                        record.set(fields[i].name, uploadInfo[fields[i].name]);
                                    }
                                }

                                if (o.result.saved) {
                                    record.phantom = false;
                                    parent.hide();
                                } else {
                                    parent.loadRecord(record);
                                }
                            }
                            for (var i = 0; i < parent.items.length; i++) {
                                var item = parent.items.getAt(i);
                                if (item != undefined && item.name == ufield.tokenFieldName) {
                                    item.setValue(uploadInfo.id);
                                }
                            }
                        }
                        optimajet.showInfo(optimajet.localization.get('Loading'), optimajet.localization.get('File has been upload') + '!');
                        ufield.reset();
                        ufield.formSubmitUrl = '';
                    }
                });
            });
        } //afterrender
    }
});