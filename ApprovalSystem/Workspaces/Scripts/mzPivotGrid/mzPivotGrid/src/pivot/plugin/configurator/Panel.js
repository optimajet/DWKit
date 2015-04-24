/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* @private
* 
* This class implements the config panel. It is used internally by the configurator plugin.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.Panel', {
    extend: 'Ext.container.Container',

    requires: [
        'Mz.pivot.plugin.configurator.Container'
    ],
    
    alias: 'widget.mzconfigpanel',
    
    dock:       'top',
    
    weight:         50, // the column header container has a weight of 100 so we want to dock it before that.
    //height:         78,
    minHeight:      78,
    grid:           null,
    fields:         [],
    refreshDelay:   1000,
    
    /**
    * @cfg {String} panelAllFieldsText Text displayed in the container reserved for all available fields.
    */
    panelAllFieldsText:     'Drop Unused Fields Here',

    /**
    * @cfg {String} panelTopFieldsText Text displayed in the container reserved for all top axis fields.
    */
    panelTopFieldsText:     'Drop Column Fields Here',

    /**
    * @cfg {String} panelLeftFieldsText Text displayed in the container reserved for all left axis fields.
    */
    panelLeftFieldsText:    'Drop Row Fields Here',

    /**
    * @cfg {String} panelAggFieldsText Text displayed in the container reserved for all aggregate fields.
    */
    panelAggFieldsText:     'Drop Agg Fields Here',
    
    initComponent: function(){
        var me = this,
            listeners = {
                configchange:   me.onConfigChanged,
                sortchange:     me.onSortChanged,
                filterchange:   me.onFilterChanged,
                scope:          me,
                destroyable:    true
            };
        
        Ext.apply(me, {
            //layout: 'vbox',
            defaults: {
                xtype:          'mzconfigcontainer',
                //height:         me.height/3,
                minHeight:      me.minHeight/3
            },
            items: [{
                itemId:         'fieldsCt',
                label:          'All fields',
                isCustomizable: false,
                dragDropText:   me.panelAllFieldsText
            },{
                itemId:         'fieldsAggCt',
                label:          'Aggregate',
                isCustomizable: true,
                isAgg:          true,
                dragDropText:   me.panelAggFieldsText
            },{
                defaults: {
                    xtype:          'mzconfigcontainer',
                    //height:         me.height/3,
                    minHeight:      me.minHeight/3,
                    flex:    1
                },
                xtype:      'container',
                minHeight:  me.minHeight/3,
                layout: {
                    type:   'hbox',
                    align:  'stretchmax'
                },
                items: [{
                    itemId:         'fieldsLeftCt',
                    label:          'Left axis',
                    pivotField:     'leftAxis',
                    isCustomizable: true,
                    dragDropText:   me.panelLeftFieldsText
                },{
                    itemId:         'fieldsTopCt',
                    label:          'Top axis',
                    pivotField:     'topAxis',
                    isCustomizable: true,
                    dragDropText:   me.panelTopFieldsText
                }]
            }]
        });
        
        me.callParent(arguments);

        me.fieldsCt = me.down('#fieldsCt');
        me.fieldsTopCt = me.down('#fieldsTopCt');
        me.fieldsLeftCt = me.down('#fieldsLeftCt');
        me.fieldsAggCt = me.down('#fieldsAggCt');
        
        me.fieldsCtListeners = me.fieldsCt.on(listeners);
        me.fieldsLeftCtListeners = me.fieldsLeftCt.on(listeners);
        me.fieldsTopCtListeners = me.fieldsTopCt.on(listeners);
        me.fieldsAggCtListeners = me.fieldsAggCt.on(listeners);

        me.fieldsExtracted = false;
        
        me.gridListeners = me.grid.on({
            pivotdone:  me.initPivotFields, 
            scope:      me,
            destroyable:true
        });

        me.task = new Ext.util.DelayedTask(function(){
            me.grid.reconfigurePivot({
                topAxis:    me.getFieldsFromContainer(me.fieldsTopCt),
                leftAxis:   me.getFieldsFromContainer(me.fieldsLeftCt),
                aggregate:  me.getFieldsFromContainer(me.fieldsAggCt)
            });
        });
        
    },
    
    destroy: function(){
        var me = this;
        
        delete(me.grid);
        Ext.destroy(me.relayers, me.fieldsCtListeners, me.fieldsLeftCtListeners, me.fieldsTopCtListeners, me.fieldsAggCtListeners, me.gridListeners);
        
        me.callParent();
    },
    
    enable: function(){
        var me = this;
        
        if(me.fieldsCt){
            me.fieldsCt.enable();
            me.fieldsTopCt.enable();
            me.fieldsLeftCt.enable();
            me.fieldsAggCt.enable();
            me.initPivotFields();
        }

        me.show();
    },
    
    disable: function(){
        var me = this;
        
        if(me.fieldsCt){
            me.fieldsCt.disable();
            me.fieldsTopCt.disable();
            me.fieldsLeftCt.disable();
            me.fieldsAggCt.disable();
        }
        me.hide();
    },

    /**
    * @private
    * This is the 'configchange' event handler raised by each sub container.
    * 
    */
    onConfigChanged: function(){
        var me = this,
            topAxis = [], leftAxis = [], agg = [];
        
        if(me.disabled) {
            // if the plugin is disabled don't do anything
            return;
        }
        
        me.task.delay(me.refreshDelay);
    },
    
    /**
    * @private
    * This function is used to retrieve all configured fields in a fields container.
    * 
    */
    getFieldsFromContainer: function(ct, excludeWidth){
        var fields = [];
        
        ct.items.each(function(item){
            fields.push(item.dimension);
        });
        
        return fields;
    },
    
    /**
    * @private
    * This is the 'sortchange' event handler raised by each sub container.
    * 
    */
    onSortChanged: function(column, direction){
        var me = this, fields;
        
        if(me.disabled) {
            // if the plugin is disabled don't do anything
            return;
        }
        
        fields = me.grid[column.ownerCt.pivotField];
        
        Ext.each(fields, function(field){
            if(field.dataIndex == column.dataIndex){
                field.direction = direction;
                return false;
            }
        });
        me.task.delay(me.refreshDelay);
    },
    
    onFilterChanged: function(column, filter){
        var me = this, fields;
        
        if(me.disabled) {
            // if the plugin is disabled don't do anything
            return;
        }
        
        me.task.delay(me.refreshDelay);
    },
    
    /**
    * @private
    * Initialize all container fields fetching the configuration from the pivot grid.
    * 
    */
    initPivotFields: function(){
        var me = this,
            store = me.grid.getStore(),
            model = store ? store.model : null,
            fields = model ? model.getFields() : [],
            fieldsAll = [], fieldsTop = [], fieldsLeft = [], fieldsAgg = [],
            newCol, cFields, mergeField;
        
        if(model != me.lastModel){
            Ext.destroy(me.lastFields);
            delete(me.lastFields);
            me.lastModel = model;
        }
        
        // let's collect all field configurations
        if(!me.lastFields){
            me.lastFields = me.fetchAllFieldConfigurations();
        }
        
        cFields = me.lastFields.clone();
        
        // remove all previously created columns
        me.fieldsCt.removeAll();
        me.fieldsTopCt.removeAll();
        me.fieldsLeftCt.removeAll();
        me.fieldsAggCt.removeAll();
        
        fieldsTop = me.getConfigFields(me.grid.topAxis);
        fieldsLeft = me.getConfigFields(me.grid.leftAxis);
        fieldsAgg = me.getConfigFields(me.grid.aggregate);
        
        mergeField = function(item){
            var el = me.lastFields.getByKey(item.header),
                id;
                
            if(el){
                id = el.id;
                Ext.apply(el, item);
                el.id = id;
            }
        };
        
        // remove all config fields from the fieldsAll
        Ext.each(Ext.Array.merge(fieldsTop, fieldsLeft), function(item){
            var i, found = false;
            
            // if the dimension is filtered but there is no aggregate with that id then remove filter
            if(item.filter && item.filter.dimensionId){
                for(i = 0; i < fieldsAgg.length; i++){
                    if(fieldsAgg[i].id == item.filter.dimensionId){
                        found = true;
                        break;
                    }
                }
                
                if(!found){
                    delete item.filter;
                }
            }
            
            cFields.removeAtKey(item.header);
            mergeField(item);
        });
        
        Ext.each(fieldsAgg, function(item){
            mergeField(item);
        });
        
        Ext.suspendLayouts();

        me.addFieldsToConfigurator(cFields.getRange(), me.fieldsCt);
        me.addFieldsToConfigurator(fieldsTop, me.fieldsTopCt);
        me.addFieldsToConfigurator(fieldsLeft, me.fieldsLeftCt);
        me.addFieldsToConfigurator(fieldsAgg, me.fieldsAggCt);
        
        me.fieldsTopCt.aggregateDimensions = fieldsAgg;
        me.fieldsLeftCt.aggregateDimensions = fieldsAgg;
        
        Ext.resumeLayouts(true);
        
    },
    
    fetchAllFieldConfigurations: function(){
        var me = this,
            store = me.grid.getStore(),
            fields = store ? store.model.getFields() : [],
            allFields = [], lastFields;
        
        lastFields = Ext.create('Ext.util.MixedCollection');
        lastFields.getKey = function(el){
            return el.header;
        }
        
        if(me.fields.length > 0){
            allFields = me.fields;
        }else{
            Ext.each(fields, function(field){
                allFields.push({
                    header:     Ext.String.capitalize(field.name),
                    dataIndex:  field.name,
                    direction:  field.sortDir
                });
            });
        }
        
        Ext.each(allFields, function(field){
            field.id = field.id || Ext.id();
        });
        
        lastFields.addAll(allFields);
        return lastFields;
    },
    
    /**
    * @private
    * Easy function for assigning fields to a container.
    * 
    */
    addFieldsToConfigurator: function(fields, fieldsCt){
        Ext.each(fields, function(item, index, len){
            fieldsCt.addColumn(item, -1);
        });
    },
    
    /**
    * @private
    * Build the fields array for each container by parsing all given fields or from the pivot config.
    * 
    */
    getConfigFields: function(dimension){
        var me = this,
            fields = [];
        
        Ext.each(dimension, function(obj){
            var field = Ext.clone(obj);
            
            if(me.grid.matrix.aggregate.getByKey(obj.id)){
                Ext.apply(field, {
                    values: me.grid.matrix.aggregate.getByKey(obj.id).values
                });
            }
            field.id = field.id || Ext.id();
            
            if(!me.lastFields.getByKey(field.header)){
                me.lastFields.add(field);
            }
            
            fields.push(field);
        });
        
        return fields;
    }
    
    
    
});