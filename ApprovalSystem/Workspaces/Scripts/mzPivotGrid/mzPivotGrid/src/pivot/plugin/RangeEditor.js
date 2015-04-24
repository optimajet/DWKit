/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* 
* 
* This plugin allows the user to modify records behind a pivot cell.
* The user has to double click that cell to open the range editor window.
* #### The following types of range editing are available:
* - percentage: the user fills in a percentage that is applied to each record.
* - increment:  the user fills in a value that is added to each record.
* - overwrite:  the new value filled in by the user overwrites each record.
* - uniformly:  the user fills in a value that is uniformly applied to each record. 
*
*/
Ext.define('Mz.pivot.plugin.RangeEditor', {
    alias: 'plugin.mzrangeeditor',

    extend: 'Ext.AbstractPlugin',
    
    requires: [
        'Mz.pivot.Grid',
        'Ext.window.Window',
        'Ext.form.field.Text',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Display',
        'Ext.button.Button',
        'Ext.data.Store'
    ],

    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    /**
    * @cfg {Integer} width Width of the viewer's window.
    */    
    width:        280,
    /**
    * @cfg {Integer} height Height of the viewer's window.
    */    
    height:        180,
    /**
    * @cfg {String} textWindowTitle Range editor window title
    */    
    textWindowTitle:    'Range editor',
    /**
    * @cfg {String} textFieldValue Range editor field Value label
    */    
    textFieldValue:     'Value',
    /**
    * @cfg {String} textFieldEdit Range editor field Edit label
    */    
    textFieldEdit:      'Field',
    /**
    * @cfg {String} textFieldType Range editor field Type label
    */    
    textFieldType:      'Type',
    /**
    * @cfg {String} textButtonOk Range editor window Ok button text
    */    
    textButtonOk:       'Ok',
    /**
    * @cfg {String} textButtonCancel Range editor window Cancel button text
    */    
    textButtonCancel:   'Cancel',
    /**
    * @cfg {String} textTypePercentage Type of range editing
    */    
    textTypePercentage: 'Percentage',
    /**
    * @cfg {String} textTypeIncrement Type of range editing
    */    
    textTypeIncrement:  'Increment',
    /**
    * @cfg {String} textTypeOverwrite Type of range editing
    */    
    textTypeOverwrite:  'Overwrite',
    /**
    * @cfg {String} textTypeUniformly Type of range editing
    */    
    textTypeUniformly:  'Uniformly',
    
    /**
    * @cfg {Function} onBeforeRecordsUpdate Provide a function to handle the records update. 
    *       This one will be fired before updating the records. Return false if you want to stop the process.
    *       The function receives the following arguments: pivot, colDefinition, records, newValue, oldValue
    */
    onBeforeRecordsUpdate: Ext.emptyFn,

    /**
    * @cfg {Function} onAfterRecordsUpdate Provide a function to handle the records update. 
    *       This one will be fired after all records were updated. "sync" could be called on the store inside this function.
	*		The function receives the following arguments: pivot, colDefinition, records, newValue, oldValue
    */
    onAfterRecordsUpdate: Ext.emptyFn,
	
    /**
    * @private
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
    * 
    * @type String
    */
    lockableScope:  'top',
    
    TYPE_PERCENTAGE:        0,
    TYPE_INCREMENT:         1,
    TYPE_OVERWRITE:         2,
    TYPE_UNIFORMLY:         3,
    
    init: function(pivot){
        var me = this;

        me.pivot = (pivot instanceof Mz.pivot.Grid) ? pivot : pivot.up('mzpivotgrid') || pivot.view.pivotGrid;
        if (!pivot) return;

        me.mon(pivot, {
            pivotitemcelldblclick:      me.runPlugin,
            pivotgroupcelldblclick:     me.runPlugin,
            pivottotalcelldblclick:     me.runPlugin,
            scope:                      me
        }, me);
        
        me.callParent(arguments);        
    },
    
    destroy: function(){
        var me = this;
        
        Ext.destroy(me.editorWin);
        delete me.currentRecord;
        delete me.currentCol;
        delete me.editorWin;
        delete me.pivot;
        
        me.callParent(arguments);
    },
    
    runPlugin: function(params, e, eOpts){
        // do nothing if the plugin is disabled
        if(this.disabled) {
            return;
        }
		
        var me = this,
            matrix = me.pivot.getMatrix(),
            dataIndex;
		
        if(params.topKey){
            me.initEditorWindow();
            
		    me.currentResult = matrix.results.get(params.leftKey, params.topKey);
		    if(me.currentResult){
                me.currentCol = params.column;
                dataIndex = me.currentCol.dimension.getId();
		        
                me.editorWin.down('form').getForm().setValues({
                    field:      me.currentCol['text'],
                    value:      me.currentResult.getValue(dataIndex),
                    type:       me.TYPE_OVERWRITE
                });
		        me.editorWin.show();
            }
        }
    },
	
	updateRecords: function(){
		var me = this,
			matrix = me.pivot.getMatrix(),
			result = me.currentResult,
			colDef = me.currentCol,
            agg = colDef.dimension.getId(),
            dataIndex = colDef.dimension.dataIndex,
			values = me.editorWin.down('form').getForm().getValues(),
            records, remainder = 0;
		
        records = result.records;
		
        if(me.onBeforeRecordsUpdate(me.pivot, colDef, records, values.value, result.getValue(agg)) === false){
            return;
        }
        
        me.editorWin.getEl().mask();
        values.value = parseFloat(values.value);
        
        Ext.defer(function(){
            Ext.Array.each(records, function(item){
                var currValue = item.get(dataIndex),
                    newValue, v;
                
                switch(values.type){
                    case me.TYPE_PERCENTAGE:
                        v = Math.floor(currValue * values.value / 100);
                    break;
                    
                    case me.TYPE_INCREMENT:
                        v = currValue + values.value;
                    break;
                    
                    case me.TYPE_OVERWRITE:
                        v = values.value;
                    break;
                    
                    case me.TYPE_UNIFORMLY:
                        newValue = (1 / records.length * values.value) + remainder;
                        v = Math.floor(newValue);
                        remainder += (newValue - v);
                    break;
                }

                // only apply a change if there is actually a change
                if( currValue != v ) {
                    item.set(dataIndex, v);
                }
            });
            
            me.onAfterRecordsUpdate(me.pivot, colDef, records, values.value, result.getValue(agg));

            me.editorWin.getEl().unmask();
            me.editorWin.close();
            
        }, 10);
        
	},
    
    initEditorWindow: function(){
        var me = this;
        
        if(!me.editorWin){
            // create the editor window
            me.editorWin = Ext.create('Ext.window.Window', {
                title:          me.textWindowTitle,
                width:          me.width,
                height:         me.height,
                layout:         'fit',
                modal:          true,
                closeAction:    'hide',
                items: [{
                    xtype:      'form',
                    padding:    5,
                    border:     false,
                    defaults: {
                        anchor:     '100%'
                    },
                    items: [{
                        fieldLabel:     me.textFieldEdit,
                        xtype:          'displayfield',
                        name:           'field'
                    },{
                        fieldLabel:     me.textFieldType,
                        xtype:          'combo',
                        name:           'type',
                        queryMode:      'local',
                        valueField:     'id',
                        displayField:   'text',
                        editable:       false,
                        store: Ext.create('Ext.data.Store',{
                            fields: ['id', 'text'],
                            data: [
                                {'id': me.TYPE_PERCENTAGE, 'text': me.textTypePercentage},
                                {'id': me.TYPE_INCREMENT, 'text': me.textTypeIncrement},
                                {'id': me.TYPE_OVERWRITE, 'text': me.textTypeOverwrite},
                                {'id': me.TYPE_UNIFORMLY, 'text': me.textTypeUniformly}
                            ]
                        })
                    },{
                        fieldLabel:     me.textFieldValue,
                        xtype:          'numberfield',
                        name:           'value'
                    }]
                }],
                buttons: [{
                    text:       me.textButtonOk,
                    handler:    me.updateRecords,
                    scope:      me
                },{
                    text:       me.textButtonCancel,
                    handler:    function(){
                        me.editorWin.close();
                    }
                }]
            });
        }
    }
    
});