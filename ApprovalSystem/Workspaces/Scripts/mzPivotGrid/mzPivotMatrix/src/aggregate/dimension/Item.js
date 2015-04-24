/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This class is used in initialize the dimensions defined on the pivot grid leftAxis, 
* topAxis and aggregate.
* 
* 
*/
Ext.define('Mz.aggregate.dimension.Item', {
    requires: [
        'Mz.aggregate.MixedCollection',
        'Mz.aggregate.filter.Label',
        'Mz.aggregate.filter.Value'
    ],
    
    /**
    * Default column header when this dimension is used on the left axis.
    * Used by the generated columns.
    * 
    * @cfg (required)
    * @type String
    */
    header:             '',

    /**
    * Field name on the record from where this dimension extracts data
    * 
    * @cfg (required)
    * @type String
    */
    dataIndex:          '', 

    /**
    * Field name on the record used when sorting this dimension results. Defaults to {dataIndex} if
    * none is specified.
    * 
    * @cfg
    * @type String
    */
    sortIndex:          '', 

    /**
    * Default column width when this dimension is used on the top/left axis.
    * Used by the generated columns.
    * 
    * @cfg
    * @type Number
    */
    width:              100,

    /**
    * Column flex when this dimension is used on the top/left axis.
    * Used by the generated columns.
    * 
    * @cfg
    * @type Number
    */
    flex:               0,

    /**
    * Column alignment when this dimension is used on the top/left axis.
    * Used by the generated columns.
    * 
    * @cfg
    * @type String
    */
    align:              'left',

    /**
    * Is this dimension sortable when the pivot is generated?
    * 
    * @cfg
    * @type Boolean
    */
    sortable:           true,

    /**
    * If this dimension is sortable then this is the type of sorting.
    * 
    * @cfg
    * @type String
    */
    direction:          'ASC',

    /**
    * Provide here your own sorting function for this dimension. 
    * If none is specified then the defaultSorterFn is used.
    * 
    * @cfg
    * @type Function
    */
    sorterFn:           null,

    /**
    * If this dimension is sortable, should we do a case sensitive sort?
    * 
    * @cfg
    * @type Boolean
    */
    caseSensitiveSort:  true,
    
    /**
    * Provide a filter configuration to filter your axis items.
    * This is only working if this is not an aggregate dimension.
    * 
    * @cfg
    * @type Object
    */
    filter:             null,
    
    /**
    * Default renderer for this dimension. This renderer is used when displaying the data in the pivot table.
    * You can either provide a string value with a number format or your own function.
    * The renderer function will have only one parameter and that is the value that need to be formatted.
    * The renderer function is running in the Dimension scope.
    * 
    * @cfg
    * @type String/Function
    */
    renderer:           null,

    /**
    * This function is used when the groups are generated for the axis.
    * It will return the value that will uniquely identify a group on the axis.
    * ie: you have a Date field that you want to group by year. 
    * This renderer could return the year from that Date value.
    * 
    * The function receives one parameter and that is the record.
    * 
    * @cfg
    * @type Function
    */
    grouperFn:          null,
    
    /**
    * Default text to use when a group name is blank. This value is applied even if you set your own groupRenderer.
    * 
    * @cfg
    * @type String
    */
    blankText:          '(blank)',

    /**
    * Should 0 values be displayed as blank? This config is used when
    * this is an aggregate dimension.
    * 
    * @cfg
    * @type Boolean
    */
    showZeroAsBlank:    false,
    
    /**
    * This is the function that should be used to aggregate when this is an aggregate dimension.
    * 
    * @cfg
    * @type String
    */
    aggregator:         'sum',

    /**
    * Is this dimension an aggregate configuration?
    * 
    * @type Boolean
    */
    isAggregate:        false,

    /**
    * Unique id of this dimension
    * 
    * @type String
    */
    id:                 '',

    /**
    * collection of unique values on this dimension; each item has a "value" and a "display"
    * @type Array
    */
    values:             null,

    /**
    * Reference to the matrix object.
    * 
    * @type {Mz.aggregate.matrix.Abstract}
    */
    matrix:             null,

    constructor: function(config){
        var me = this;
        
        me.initialConfig = config || {};
        
        if(config.isAggregate === true && Ext.isEmpty(config.align)){
            config.align = 'left';
        }
        Ext.apply(me, config || {});
        
        if(Ext.isEmpty(me.id)){
            // generate an internal id used by the matrix
            me.id = Ext.id();
        }
        
        if(me.isAggregate){
            if(Ext.isEmpty(me.dataIndex) && Ext.isDefined(me.measure)){
                me.dataIndex = me.measure;
                delete me.measure;
            }
            if(Ext.isEmpty(me.aggregator)){
                me.aggregator = 'sum';
            }
            if(Ext.isString(me.aggregator)) {
                me.aggregatorFn = Mz.aggregate.Aggregators[me.aggregator];
            }else if(Ext.isFunction(me.aggregator)){
                me.aggregatorFn = me.aggregator;
            }
            me.filter = false;
        }else{
            if(Ext.isObject(me.filter)){
                Ext.applyIf(me.filter, {
                    mztype: 'label'
                });
                me.filter = Ext.createByAlias('pivotfilter.' + me.filter.mztype, me.filter);
            }else{
                me.filter = false;
            }
        }
        
        if(!Ext.isFunction(me.grouperFn)){
            me.grouperFn = me.defaultGrouperFn;
        }
        if(me.sortable && !me.sorterFn){
            me.sorterFn = me.defaultSorterFn;
        }
        if(Ext.isEmpty(me.sortIndex)){
            me.sortIndex = me.dataIndex;
        }
        
        if(!me.renderer){
            me.renderer = me.getDefaultFormatRenderer(me.isAggregate ? '0,000.00' : '');
        }else if(Ext.isString(me.renderer)){
            me.renderer = me.getDefaultFormatRenderer(me.renderer);
        }
        
        me.values = Ext.create('Mz.aggregate.MixedCollection');
        me.values.getKey = function(item){
            return item.value;
        };

        me.callParent(arguments);
    },
    
    destroy: function(){
        var me = this;
        
        Ext.destroy(me.values, me.filter);

        if(me.matrix){
            delete(me.matrix);
        }
    },
    
    /**
    * Returns the serialized dimension data.
    * 
    */
    serialize: function(){
        var me = this;
        
        return {
            id:                 me.id,
            header:             me.header,
            dataIndex:          me.dataIndex,
            sortIndex:          me.sortIndex,
            width:              me.width,
            flex:               me.flex,
            align:              me.align,
            sortable:           me.sortable,
            direction:          me.direction,
            caseSensitiveSort:  me.caseSensitiveSort,
            filter:             me.filter ? me.filter.serialize() : null,
            aggregator:         Ext.isString(me.aggregator) ? me.aggregator : 'sum',
            showZeroAsBlank:    me.showZeroAsBlank
        };
    },
    
    /**
    * Add unique values available for this dimension. These are used when filtering.
    * 
    * @param value
    * @param display
    */
    addValue: function(value, display){
        var me = this;
        
        if(!me.values.getByKey(value)){
            me.values.add({
                value:      value,
                display:    display
            });
        }
    },
    
    /**
    * Returns the collection of unique values available for this dimension.
    * 
    */
    getValues: function(){
        return this.values;
    },
    
    /**
    * Returns the internal id of this dimension.
    * 
    */
    getId: function(){
        return this.id;
    },
    
    /**
    * Default sorter function used to sort the axis dimensions on the same tree level.
    * 
    * @param o1
    * @param o2
    * 
    * @returns {Number}
    */
    defaultSorterFn: function(o1, o2){
        var me = this,
            s1 = o1.sortValue,
            s2 = o2.sortValue,
            result;
        
        if(s1 instanceof Date){
            s1 = s1.getTime();
        }
        if(s2 instanceof Date){
            s2 = s2.getTime();
        }
        if(!me.caseSensitiveSort){
            s1 = String(s1).toUpperCase();
            s2 = String(s2).toUpperCase();
        }
        result = Mz.aggregate.matrix.Abstract.prototype.naturalSort(s1, s2);
        
        if(result < 0 && me.direction === 'DESC'){
            return 1;
        }
        if(result > 0 && me.direction === 'DESC'){
            return -1;
        }
        return result;
    },
    
    /**
    * Builds a renderer function by using the specified format.
    * 
    * @param format Could be either a function or a string
    */
    getDefaultFormatRenderer: function(format){
        var me = this;
        
        return function(v){
            var positive;
            
            if(Ext.isEmpty(format)){
                return v;
            }
            
            if(Ext.isFunction(format)){
                return format.call(me, v);
            }
            
            if(!Ext.isNumber(v)) {
                return v;
            }

            if(me.isAggregate && v === 0 && me.showZeroAsBlank){
                return '';
            }
            
            positive = (v >= 0);
            v = Math.abs(v);
            v = Ext.util.Format.number(v, format);

            return positive ? v : '-' + v;
        }
    },
    
    /**
    * Default grouper function used for rendering axis item values.
    * The grouper function can be used to group together multiple items.
    * Returns a group value
    * 
    * @param record
    */
    defaultGrouperFn: function(record){
        return record.get(this.dataIndex);
    }

});