Ext.define('Ext.ux.optimajet.DictionaryField', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.dictionaryfield',
    width: "100%",
    eventController: undefined,
    //Init
    //2-trigger
    trigger1Cls: 'x-form-arrow-trigger',
    //trigger2Cls: 'x-form-search-trigger',
    hideTrigger1: false,
    //hideTrigger2: false,
    //Custom properties
    prefix: 'gridfield',
    viewName: '',
    parentAttributeId: '',
    grid: undefined,
    windowCaption: '',
    fieldsToSearch: undefined,
    gridType: optimajet.GridType.Grid,
    //NEW
    listConfig: {
        loadingText: optimajet.localization.get('Searching') + '...',
        emptyText: optimajet.localization.get('No matching found') + '.',

        // Custom rendering template for each item
        //getInnerTpl: function() {
        //    return '{name}';
        //}
    },
    pageSize: 10,
    minChars: 2,
    lastquerydate: new Date(),
    querytimeout: false,
    querydelta: 250,
    waschangedmanually: false,
    constructor: function (config) {
        var me = this;

        me.eventController = new EventController();
        me.enableKeyEvents = true;

        this.callParent(arguments);


        me.on('beforequery', me.onBeforeQuery);
        me.on('select', me.onSelect);
        me.on('keydown', me.onKeydown);

        me.listConfig.getInnerTpl = function () {
            return '{' + this.pickerField.listPropertyName + '}';
        }

        if (me.gridType != optimajet.GridType.Grid) {
            me.listConfig = undefined;
        }
    },


    destroy: function () {
        var me = this;

        me.eventController.destroy();

        this.callParent(arguments);
    },
    storeOnLoad: function (t, records, successful, eOpts) {
        if (t.owner == undefined) {
            return;
        }

        if (t.owner.isExpanded) {
            if (records.length == 1) {
                t.owner.collapse();
                optimajet.formBindHandler(t.owner.grid, records[0]);
                t.owner.waschangedmanually = false;
                t.owner.fireEvent('change', t.owner, t.owner.getValue(), t.owner.getValue(), undefined);
                t.owner.isValid();
                var el = $('#' + t.owner.id + '-triggerWrap');
                el.css('border-color', 'green');
                setTimeout(function () {
                    el.css('border-color', '');
                }, 1000);
            }
            else {
                var fieldsToBind = t.owner.getFieldsToBind();
                for (var i = 0; i < fieldsToBind.length; i++) {
                    if (t.owner == fieldsToBind[i]) continue;

                    fieldsToBind[i].originalValue = fieldsToBind[i].getValue();
                    fieldsToBind[i].setValue(null);
                }
            }
        }

    },
    onKeydown: function (t, e, eOpts) {
        var me = this;
        if (e.keyCode == 9)
            return;
        me.waschangedmanually = true;
    },
    onPaste: function () {
        var me = this;
        if (!me.readOnly && !me.disabled && me.editable) {
            //me.doQueryTask.delay(me.queryDelay);
            me.doQuery(me.getValue());
        }
    },
    onBeforeQuery: function (queryPlan, eOpts) {

        queryPlan.cancel = true;
        var me = this;

        if (me.gridType != optimajet.GridType.Grid) return false;

        me.lastquerydate = new Date();

        if (me.querytimeout === false) {
            me.querytimeout = true;
            setTimeout(function () { me.query(me); }, me.querydelta);
        }

        return false;

    },
    query: function (me) {

        if (new Date() - me.lastquerydate < me.querydelta) {
            setTimeout(function () { me.query(me); }, me.querydelta);
        } else {
            me.querytimeout = false;
            var fieldsToBind = me.getFieldsToBind();
            optimajet.defaultLoader.loadGrid(me.prefix, me.viewName, me.windowCaption, fieldsToBind, me.gridType,
                function (gridid) {
                    var storeName = gridid + '_' + me.viewName + '_store';
                    Ext.ComponentManager.onAvailable(gridid, function (item) {
                        me.grid = item;
                    });
                    optimajet.containerOnAvailable(storeName, function () {
                        me.DictionaryStore = optimajet.container[storeName];
                        me.store = me.DictionaryStore;
                        me.store.owner = me;
                        me.store.on('load', me.storeOnLoad);
                        me.setListFilter(new Ext.util.Filter({
                            property: me.listPropertyName,
                            value: me.getValue(),
                            filterFn: function (i) { return true; }
                        }));
                        me.UpdateStoreFilterAndExtra();
                        me.expand();
                    });
                }, false);
        }
    },
    onSelect: function (combo, records, eOpts) {
        if (records.length < 1)
            return;
        var me = this;
        optimajet.formBindHandler(me.grid, records[0]);
        me.waschangedmanually = false;
        me.fireEvent('change', me, me.getValue(), me.getValue(), undefined);
        me.isValid();
        return false;
    },
    onTrigger1Click: function () {
        var me = this;
        if (me.viewName == '')
            return;

        var fieldsToBind = me.getFieldsToBind();

        var bc = function () { me.onBindComplete(me, bc); };
        optimajet.defaultLoader.addBindComplete(bc);

        optimajet.defaultLoader.loadGrid(me.prefix, me.viewName, me.windowCaption, fieldsToBind, me.gridType,
            function (gridid) {
                var storeName = gridid + '_' + me.viewName + '_store';
                Ext.ComponentManager.onAvailable(gridid, function (item) {
                    me.grid = item;
                });
                optimajet.containerOnAvailable(storeName, function () {
                    me.DictionaryStore = optimajet.container[storeName];
                    if (me.gridType == optimajet.GridType.Grid) {
                        me.store = me.DictionaryStore;
                        me.store.owner = me;
                        me.store.on('load', me.storeOnLoad);
                    }
                    me.setListFilter(undefined);
                    me.UpdateStoreFilterAndExtra();
                });
            }, true);

    },
    onBindComplete: function (me, bc) {
        me.waschangedmanually = false;
        me.isValid();
        optimajet.defaultLoader.removeBindComplete(bc);
        me.eventController.fire('valuechanged');
    },
    addValueChanged: function (listener) {
        this.eventController.addListener('valuechanged', listener);
    },
    removeValueChanged: function (listener) {
        this.eventController.removeListener('valuechanged', listener);
    },
    getFieldsToBind: function () {
        var me = this;
        var fieldsToBind = new Array();
        var item;
        var i;

        if (me.fieldsToSearch == undefined) {

            var parent = me.getBubbleTarget();

            if (parent == undefined || parent == null /*|| parent.__proto__.$className != 'Ext.grid.RowEditor'*/)
                return fieldsToBind;

            var items = parent.items;


            for (i = 0; i < items.length; i++) {
                item = items.items[i];
                if (item != undefined && item != null && item.parentAttributeId != undefined && item.parentAttributeId == me.parentAttributeId)
                    fieldsToBind.push(item);
            }
        } else {

            for (i = 0; i < me.fieldsToSearch.length; i++) {
                item = me.fieldsToSearch[i];
                if (item != undefined && item != null && item.parentAttributeId != undefined && item.parentAttributeId == me.parentAttributeId)
                    fieldsToBind.push(item);
            }
        }

        return fieldsToBind;
    },
    render: function (container, position) {

        var me = this;
        me.container = container;
        me.callParent(arguments);

        if (me.gridType != optimajet.GridType.Grid) {
            me.setEditable(false);
        }

        me.inputEl.on('dblclick', function () {
            me.onTrigger1Click();
        });

    },
    needResizeToContainer: true,
    resizeToContainer: function () {
        var me = this;
        var size1 = me.container.getSize();
        me.setSize({ width: size1.width });
    },
    storeNeedReload: false,
    storeFilter: undefined,
    //Фильтр для выбора значений
    listFilter: undefined,
    DictionaryStore: undefined,
    setStoreFilter: function (value) {
        if (this.storeFilter != value) {
            this.storeNeedReload = true;
        }
        this.storeFilter = value;
    },
    setListFilter: function (value) {
        if (this.listFilter != value) {
            this.storeNeedReload = true;
        }
        this.listFilter = value;
    },
    storeExtraParams: new Array(),
    setExtraParams: function (name, value) {
        var isFind = false;
        for (var i = 0; i < this.storeExtraParams.length; i++) {
            if (this.storeExtraParams[i].name == name) {
                isFind = true;
                if (this.storeExtraParams[i].value != value) {
                    this.storeNeedReload = true;
                    this.storeExtraParams[i].value = value;
                }
                break;
            }
        }

        if (!isFind) {
            this.storeExtraParams.push({ name: name, value: value });
            this.storeNeedReload = true;
        }
    },
    UpdateFilterAndExtra: function () {
        var me = this;
        me.UpdateStore(false);
    },
    UpdateStoreFilterAndExtra: function () {
        var me = this;
        me.UpdateStore(true);
    },
    ProxyCustomUrl: undefined,
    UpdateStore: function (reload) {
        if (this.DictionaryStore != undefined) {
            var proxy = this.DictionaryStore.getProxy();
            if (this.ProxyCustomUrl && proxy.url != this.ProxyCustomUrl) {
                proxy.url = this.ProxyCustomUrl;
                this.storeNeedReload = true;
            }

            if (this.storeNeedReload) {
                if (this.DictionaryStore.filters.getByKey('DictionaryFieldFilter') != undefined) {
                    this.DictionaryStore.filters.removeAtKey('DictionaryFieldFilter');
                }
                if (this.storeFilter != undefined) {
                    this.DictionaryStore.filters.add("DictionaryFieldFilter", this.storeFilter);
                }

                if (this.DictionaryStore.filters.getByKey('ListFilter') != undefined) {
                    this.DictionaryStore.filters.removeAtKey('ListFilter');
                }

                if (this.listFilter != undefined) {
                    this.DictionaryStore.filters.add("ListFilter", this.listFilter);
                }

                for (var i = 0; i < this.storeExtraParams.length; i++) {
                    proxy.extraParams[this.storeExtraParams[i].name] = this.storeExtraParams[i].value;
                }

                if (reload)
                    this.DictionaryStore.reload();

                this.storeNeedReload = false;
            }
        }
    },
    getErrors: function (value) {

        var me = this;
        if (!me.allowBlank && me.waschangedmanually) {
            var errors = new Array();
            errors.push(optimajet.localization.get('Unknown value') + '.');
            return errors;
        }

        return this.callParent(arguments);
    }


});
Ext.define('Ext.ux.optimajet.DictionaryFieldWithClear', {
    extend: 'Ext.ux.optimajet.DictionaryField',
    alias: 'widget.dictionaryfieldwithclear',
    trigger2Cls: 'x-form-clear-trigger',
    hideTrigger2: false,
    onTrigger2Click: function () {
        var me = this;
        if (me.viewName == '')
            return;

        var fieldsToBind = me.getFieldsToBind();
        for (var i = 0; i < fieldsToBind.length; i++) {
            fieldsToBind[i].originalValue = fieldsToBind[i].getValue();
            fieldsToBind[i].setValue(null);
        }
    }
});