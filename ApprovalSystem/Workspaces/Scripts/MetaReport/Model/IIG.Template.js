Ext.define('IIG.Template', {
    extend: 'Ext.data.Model',

    idProperty: 'Id',

    fields: [{
        name: 'Id',
        type: 'string'
    }, {
        name: 'Name',
        type: 'string'
    }, {
        name: 'IsGlobal',
        type: 'boolean'
    }, {
        name: 'ChangeDate',
        type: 'date',
        convert: function (date) {
            return moment(date).toDate();
        },
    }, {
        name: 'Value',
        type: 'string'
    }, {
        name: 'ReportId',
        type: 'string'
    }, {
        name: 'AuthorName',
        type: 'string'
    }, {
        name: 'ChangeEmployeeName',
        type: 'string'
    }, {
        name: 'AuthorId',
        type: 'string'
    }, {
        name: 'ChangeEmployeeId',
        type: 'string'
    }],

    validations: [{
        type: 'presence',
        field: 'Name'
    }],

    proxy: {
        type: 'ajax',
        api: {
            create: optimajet.CorrectUrl('Report/CreateTemplate'),
            update: optimajet.CorrectUrl('Report/UpdateTemplate'),
            destroy: optimajet.CorrectUrl('Report/DeleteTemplate')
        },
        reader: {
            type: 'json',
            root: 'data'
        },
        writer: new Ext.data.writer.Json({
            writeAllFields: false,
            writeRecordId: true,
            root: 'record',
            encode: true
        })
    }
})