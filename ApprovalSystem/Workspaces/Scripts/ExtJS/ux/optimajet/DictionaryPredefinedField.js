Ext.define('Ext.ux.optimajet.DictionaryPredefinedField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.dictionarypredefinedfield',
    width: "100%",
    eventController: undefined,
    //Init
    //2-trigger
    trigger1Cls: 'x-form-arrow-trigger',
    hideTrigger1: false,
    //Custom properties
    prefix: 'gridfield',
    viewName: '',
    parentAttributeId: '',
    grid: undefined,
    windowCaption: '',
    fieldsToSearch: undefined,
    queryMode: 'local',
    displayField: "value",
    valueField: "key",
    typeAhead: true,
    transform: 'stateSelect',
    editable: false,
    constructor: function (config) {
        var me = this;

        me.eventController = new EventController();
        //debugger;
        me.resizeTimer = 1;
        Ext.define('Ext.form.field.Picker.BoundModel', {
            extend: 'Ext.data.Model',
            fields: [
                {name: 'key', type: 'string'},
                {name: 'value',  type: 'string'}
            ]
        });
        
       this.callParent(arguments);

    },
    destroy: function () {
        var me = this;

        me.eventController.destroy();

        this.callParent(arguments);
    },
    data : {},
    addData: function (data) {
        var me = this;
        for (var i = 0; i < data.length; i++) {
            me.store.add(data[i]);
        }
    },
    createPicker: function() {
        var me = this;
        me.store = Ext.create('Ext.data.Store', {
            model: 'Ext.form.field.Picker.BoundModel'
        });

        me.addData(me.data);
        me.inputEl.on('dblclick', function () {
                    me.expand();
                });
        var b = this.callParent(arguments);

        return b;

        //var bl = Ext.create('Ext.view.BoundList', {
        //    floating: true,
        //    hidden: true,
        //    minHeight: 50,
        //    displayField: "value",
        //    valueField: "key",
        //    store: me.store
        //});
        //bl.on('selectionchange', function (t, s, e) { me.selectionchange(me,s,e); });

        //return bl;
    },
    addValueChanged: function (listener) {
        this.eventController.addListener('valuechanged', listener);
    },
    removeValueChanged: function (listener) {
        this.eventController.removeListener('valuechanged', listener);
    },
    resizeTimer: undefined,
    //render: function (container, position) {

    //    var me = this;
    //    debugger;
    //    me.inputEl.on('dblclick', function () {
    //        me.expand();
    //    });
    //    me.callParent(arguments);

    //    //me.inputEl.on('dblclick', function () {
    //    //    me.expand();
    //    //});

    //},
    getValue: function () {
        var me = this;
        return me.selectedRawValue;
    },
    selectedRawValue : undefined,
    setValue: function (value) {
        
        var me = this;
        
        if (Array.isArray(value)) {
            me.selectedRawValue = value[0].raw.key;
            me.callParent(arguments);
            return;
        }


        me.selectedRawValue = value;
        
        if (value != undefined) {
            for (var i = 0; i < me.data.length; i++) {
                var item = me.data[i];
                if (item.key == value) {
                    arguments[0] = item.value;
                    this.callParent(arguments);
                    return;
                }
            }
        }

        arguments[0] = undefined;
        this.callParent(arguments);
    }
    //,
    //selectionchange: function (t, s, e) {
    //    var me = t;
    //    if (s.length > 1) {
    //        me.setValue(s[0].raw.key);
    //    } else {
    //        me.setValue(undefined);
    //    }
        
    //    me.collapse();
    //    me.eventController.fire('valuechanged');
    //}
});

Ext.define('Ext.ux.optimajet.DictionaryPredefinedFieldWithClear', {
    extend: 'Ext.ux.optimajet.DictionaryPredefinedField',
    alias: 'widget.dictionarypredefinedfieldwithclear',
    trigger2Cls: 'x-form-clear-trigger',
    hideTrigger2: false,
    onTrigger2Click: function () {
        var me = this;
        me.setValue(undefined);
    }
});