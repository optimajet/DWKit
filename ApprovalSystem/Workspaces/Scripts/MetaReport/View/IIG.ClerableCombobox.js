Ext.define('IIG.ClearableCombobox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.clerablecombo',

    trigger2Cls: 'x-form-clear-trigger',
    
    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            onTrigger2Click: function() {
                me.reset();
            }
        });

        me.callParent(arguments);
    }
})