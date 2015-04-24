/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This is the window that allows configuring a top10 value filter
* 
*/
Ext.define('Mz.pivot.plugin.configurator.FilterTopWindow',{
    extend: 'Ext.window.Window',
    
    requires: [
        'Ext.form.Panel',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Ext.form.field.ComboBox',
        'Ext.layout.container.HBox'
    ],
    
    width:          450,
    height:         170,
    modal:          true,
    closeAction:    'destroy',
    
    titleText:      'Top 10 filter ({0})',
    fieldText:      'Show',
    sortResultsText:'Sort results',

    initComponent: function(){
        var me = this,
            items = [];
            
        items.push({
            xtype:          'combo',
            editable:       false,
            queryMode:      'local',
            valueField:     'value',
            store:          me.storeTopOrder,
            name:           'topOrder'
        },{
            xtype:          'textfield',
            margin:         '0 0 0 5',
            name:           'value'
        },{
            xtype:          'combo',
            margin:         '0 0 0 5',
            editable:       false,
            queryMode:      'local',
            valueField:     'value',
            store:          me.storeTopType,
            name:           'topType'
        },{
            xtype:          'combo',
            margin:         '0 0 0 5',
            editable:       false,
            queryMode:      'local',
            valueField:     'value',
            store:          me.storeAgg,
            name:           'dimensionId'
        });
        
        Ext.apply(me, {
            title:      Ext.String.format(me.titleText, me.title),
            layout:     'fit',
            
            items: [{
                xtype:  'form',
                bodyPadding:    5,
                
                defaults: {
                    allowBlank: false
                },
                
                items: [{
                    xtype:  'hidden',
                    name:   'mztype'
                },{
                    xtype:  'hidden',
                    name:   'type'
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
                        flex:       1,
                        allowBlank: false
                    },
                    
                    items: items 
                },{
                    xtype:          'checkbox',
                    boxLabel:       me.sortResultsText,
                    name:           'topSort'
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