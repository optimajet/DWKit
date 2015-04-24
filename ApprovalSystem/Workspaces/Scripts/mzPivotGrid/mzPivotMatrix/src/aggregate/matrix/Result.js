/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* A Result object stores all calculated values for the aggregate dimensions.
* In case of a Local matrix it also stores all records on a left/top axis pair.
* 
*/
Ext.define('Mz.aggregate.matrix.Result', {
    
    /**
    *  key of left axis item or grandTotalKey
    * 
    * @type String
    */
    leftKey:        '',
    /**
    * key of top axis item or grandTotalKey
    * 
    * @type String
    */
    topKey:         '',
    /**
    * Set this flag on true if you modified at least one record in this result.
    * The grid cell will be marked as dirty in such a case.
    * 
    * @type Boolean
    */
    dirty:          false,
    
    /**
    *  Array of records for the left/top axis keys pair.
    * 
    * @type Array
    */
    records:        null,
    /**
    *  Object that stores all calculated values for each pivot aggregate.
    * The object keys are the dimension ids.
    * 
    * @type Object
    */
    values:         null,
    /**
    * Reference to the matrix object
    * 
    * @type {Mz.aggregate.matrix.Abstract}
    */
    matrix:         null,
    
    constructor: function(config){
        var me = this;
        
        Ext.apply(me, config || {});
        
        me.records = [];
        me.values = {};
    },
    
    destroy: function(){
        var me = this;
        
        me.records.length = 0;
        
        delete me.records;
        delete me.matrix;
        
        if(me.values){
            delete me.values;
        }
        if(me.leftAxisItem){
            delete me.leftAxisItem;
        }
        if(me.topAxisItem){
            delete me.topAxisItem;
        }
        
        me.callParent(arguments);
    },
    
    /**
    * Calculate all pivot aggregate dimensions for the internal records
    * 
    */
    calculate: function(){
        var me = this,
            i, dimension,
            length = me.matrix.aggregate.getCount();
        
        // for each pivot aggregate dimension calculate the value and call addValue
        for(i = 0; i < length; i++){
            dimension = me.matrix.aggregate.getAt(i);
            me.addValue(dimension.getId(), dimension.aggregatorFn(me.records, dimension.dataIndex, me.matrix, me.leftKey, me.topKey));
        }
    },
    
    /**
    * Besides the calculation functions defined on your aggregate dimension you could 
    * calculate values based on other store fields and custom functions.
    * 
    * @param key The generated value will be stored in the result under this key for later extraction
    * @param dataIndex The dataIndex that should be used on the records for doing calculations
    * @param aggFn Your custom function
    */
    calculateByFn: function(key, dataIndex, aggFn){
        var me = this,
            v = aggFn(me.records, dataIndex, me.matrix, me.leftKey, me.topKey);
        
        me.addValue(key, v);
        
        return v;
    },
    
    /**
    * Add the calculated value for an aggregate dimension to the internal values storage
    * 
    * @param dimensionId
    * @param value
    */
    addValue: function(dimensionId, value){
        this.values[dimensionId] = value;
    },
    
    /**
    * Returns the calculated value for the specified aggregate dimension
    * 
    * @param dimensionId
    */
    getValue: function(dimensionId){
        return this.values[dimensionId];
    },
    
    /**
    * Add the specified record to the internal records storage.
    * These records will be used for calculating the pivot aggregate dimension values.
    * This should be used only when all calculations are done locally and not remotely.
    * 
    * @param record
    */
    addRecord: function(record){
        this.records.push(record);
    },
    
    /**
    * Returns the left axis item
    * 
    * @returns {Mz.aggregate.axis.Item}
    */
    getLeftAxisItem: function(){
        return this.matrix.leftAxis.items.getByKey(this.leftKey);
    },
    
    /**
    * Returns the top axis item
    * 
    * @returns {Mz.aggregate.axis.Item}
    */
    getTopAxisItem: function(){
        return this.matrix.topAxis.items.getByKey(this.topKey);
    }
});