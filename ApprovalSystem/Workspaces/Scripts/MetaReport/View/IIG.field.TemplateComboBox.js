Ext.define('IIG.form.field.TemplateComboBox', {
    extend: 'Ext.form.ComboBox',
    name: 'templateComboBox',
    alias: 'templateComboBox',
    id: 'cmb-template',
    valueField: 'Id',
    emptyText: 'Select template',
    editable: false,
    triggerAction: 'all',
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div class="x-boundlist-item">{Name} - {AuthorName}</div>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{Name} - {AuthorName}',
        '</tpl>'
    )
});