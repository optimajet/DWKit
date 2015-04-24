Ext.define('IIG.form.BudgetVersions', {
    extend: 'Ext.form.Panel',
    alias: 'widget.fbudgetversionsselector',
    padding: '20 20',

    budgetInfo: null,
    budgetText: 'Budget',
    budgetVersion1Text: 'Version 1',
    budgetVersion2Text: 'Version 2',
    msgSameBudgetVersions: 'You have selected the same budget version. Please select another one',
    msgBudgetVersionRequired: 'Field cannot be empty',

    initComponent: function () {
        var me = this;
        var budgetsStore = new Ext.data.Store({
            id: 'budgetsStore',
            fields: ['Id', 'Name', 'Versions'],
            data: me.budgetInfo.Budgets
        });
        var budgetVersionsStore = new Ext.data.Store({
            id: 'budgetVersionsStore',
            fields: ['Id', 'Name'],
            data: budgetsStore.findRecord('Id', me.budgetInfo.BudgetId1).data.Versions
        });

        var budgetVersionsStore2 = new Ext.data.Store({
            id: 'budgetVersionsStore2',
            fields: ['Id', 'Name'],
            data: budgetsStore.findRecord('Id', me.budgetInfo.BudgetId2).data.Versions
        });

        if (!me.budgetInfo.BudgetVersionId1) {
            me.budgetInfo.BudgetVersionId1 = me.budgetInfo.CurrentBudgetVersionId;
        }

        function reloadBudgetVersionsStore(budgetId, storeId) {
            var budget = budgetsStore.findRecord('Id', budgetId).data;
            var bvStore = Ext.StoreManager.lookup(storeId)

            bvStore.loadRawData(budget.Versions);
        }

        function validateVersions(combo, anotherComboId) {
            var anotherCombo = Ext.getCmp(anotherComboId);
            var versionId1 = combo.value;
            var versionId2 = anotherCombo.value;

            if (versionId1 == versionId2) {
                return me.msgSameBudgetVersions;
            }

            return true;
        }

        var config = {
            layout: { type: 'vbox', align: 'stretch' },
            items:
            [{
                layout: { type: 'hbox', align: 'stretch' },
                items:
                [{
                    xtype: 'combo',
                    fieldLabel: me.budgetText,
                    id: 'BudgetId1',
                    valueField: 'Id',
                    displayField: 'Name',
                    value: me.budgetInfo.BudgetId1,
                    store: budgetsStore,
                    listeners: {
                        change: function (combo, newValue) {
                            Ext.getCmp('BudgetVersionId1').clearValue();
                            reloadBudgetVersionsStore(newValue, 'budgetVersionsStore');
                        }
                    },
                    allowBlank: false,
                    labelWidth: 50,
                    width: 195,
                    flex: 1
                }, {
                    id: 'BudgetVersionId1',
                    xtype: 'combo',
                    fieldLabel: me.budgetVersion1Text,
                    value: me.budgetInfo.BudgetVersionId1,
                    store: budgetVersionsStore,
                    valueField: 'Id',
                    displayField: 'Name',
                    queryMode: 'local',
                    allowBlank: false,
                    margin: '0 20',
                    labelWidth: 70,
                    flex: 2,
                    validator: function () { return validateVersions(this, 'BudgetVersionId2'); }
                }]
            }, {
                layout: { type: 'hbox', align: 'stretch' },
                margin: '20 0',
                items: [{
                    xtype: 'combo',
                    fieldLabel: me.budgetText,
                    id: 'BudgetId2',
                    valueField: 'Id',
                    displayField: 'Name',
                    value: me.budgetInfo.BudgetId2,
                    store: budgetsStore,
                    listeners: {
                        change: function (combo, newValue) {
                            Ext.getCmp('BudgetVersionId2').clearValue();
                            reloadBudgetVersionsStore(newValue, 'budgetVersionsStore2');
                        }
                    },
                    allowBlank: false,
                    labelWidth: 50,
                    width: 195,
                    flex: 1
                }, {
                    id: 'BudgetVersionId2',
                    xtype: 'combo',
                    fieldLabel: me.budgetVersion2Text,
                    value: me.budgetInfo.BudgetVersionId2,
                    store: budgetVersionsStore2,
                    valueField: 'Id',
                    displayField: 'Name',
                    queryMode: 'local',
                    allowBlank: false,
                    margin: '0 20',
                    labelWidth: 70,
                    flex: 2,
                    validator: function () { return validateVersions(this, 'BudgetVersionId1'); }
                }]
            }]
        };
        Ext.apply(me, config);
        Ext.apply(me.initialConfig, config);
        me.callParent(arguments);
    }
})