/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This is the window that allows configuring a label filter
* 
*/
Ext.define('Mz.pivot.plugin.configurator.FilterLabelWindow',{
    extend: 'Ext.window.Window',
    
    requires: [
        'Ext.form.Panel',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.HBox'
    ],
    
    width:          400,
    height:         160,
    modal:          true,
    closeAction:    'destroy',
    
    titleText:          'Label filter ({0})',
    fieldText:          'Show items for which the label',
    caseSensitiveText:  'Case sensitive',

    initComponent: function(){
        var me = this,
            items = [];
            
        items = me.filterFields || [];
        
        items.push({
            xtype:          'combo',
            editable:       false,
            queryMode:      'local',
            valueField:     'value',
            store:          me.store,
            name:           'type',
            
            listeners: {
                change: function(combo, newValue){
                    var hidden = (newValue == Mz.aggregate.filter.Label.TypeBetween || newValue == Mz.aggregate.filter.Label.TypeNotBetween);
                    this.down('#fValue').setVisible(!hidden);
                    this.down('#fValue').allowBlank = hidden;
                    this.down('#fFrom').setVisible(hidden);
                    this.down('#fFrom').allowBlank = !hidden;
                    this.down('#fTo').setVisible(hidden);
                    this.down('#fTo').allowBlank = !hidden;
                },
                scope:  me
            }
        },{
            itemId:     'fValue',
            xtype:      'textfield',
            margin:     '0 0 0 5',
            name:       'value'
        },{
            itemId:     'fFrom',
            xtype:      'textfield',
            margin:     '0 0 0 5',
            name:       'from'
        },{
            itemId:     'fTo',
            xtype:      'textfield',
            margin:     '0 0 0 5',
            name:       'to'
        });
        
        Ext.apply(me, {
            title:      Ext.String.format(me.titleText, me.title),
            layout:     'fit',
            
            items: [{
                xtype:  'form',
                bodyPadding:    5,
                
                items: [{
                    xtype:  'hidden',
                    name:   'mztype'
                },{
                    xtype:          'fieldcontainer',
                    labelSeparator: '',
                    fieldLabel:     me.fieldText,
                    labelAlign:     'top',
                    layout: {
                        type: 'hbox',
                        align: 'stretch'
                    },
                    
                    defaults: {
                        allowBlank: false,
                        flex:       1
                    },
                    
                    items: items 
                },{
                    xtype:          'checkbox',
                    boxLabel:       me.caseSensitiveText,
                    name:           'caseSensitive'
                }]
            }],
            
            buttons: [{
                text:       Ext.Msg.buttonText.ok,
                handler:    me.applyFilter,
                scope:      me
            },{
                text:       Ext.Msg.buttonText.cancel,
                handler:    me.cancelFilter,
                scope:      me
            }]
        });
        
        me.callParent(arguments);
    },
    
    applyFilter: function(){
        var me = this;
        
        if(me.down('form').getForm().isValid()){
            me.fireEvent('filter', me);
        }
    },
    
    cancelFilter: function(){
        this.close();
    }
});