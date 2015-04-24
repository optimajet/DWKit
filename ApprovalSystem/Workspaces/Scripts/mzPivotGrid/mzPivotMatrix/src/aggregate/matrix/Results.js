/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This class stores the matrix results. In case of a Local matrix it is able to do the calculations.
* 
*/
Ext.define('Mz.aggregate.matrix.Results', {
    requires: [
        'Mz.aggregate.MixedCollection',
        'Mz.aggregate.matrix.Result'
    ],
    
    /**
    *  Collection of {Mz.aggregate.matrix.Result} objects
    * 
    * @type {Mz.aggregate.MixedCollection}
    */
    items:  null,
    
    /**
    * Reference to the matrix object
    * 
    * @type {Mz.aggregate.matrix.Abstract}
    */
    matrix: null,
    
    constructor: function(matrix){
        var me = this;
        
        me.matrix = matrix;
        me.items = Ext.create('Mz.aggregate.MixedCollection');
        me.items.getKey = function(obj){
            return obj.leftKey + '/' + obj.topKey;
        };
        
        me.callParent(arguments);
    },
    
    destroy: function(){
        var me = this;
        
        delete me.matrix;
        Ext.destroy(me.items);
        
        me.callParent(arguments);
    },
    
    /**
    * Clear all calculated results.
    * 
    */
    clear: function(){
        this.items.clear();
    },
    
    /**
    * Add a new Result object by left/top axis keys. If one of the keys matches the grandTotalKey
    * then mark that Result as grandTotal.
    * If there is already a Result object for the left/top axis pair then return that one.
    * 
    * @param leftKey
    * @param topKey
    * @returns {Mz.aggregate.matrix.Result}
    */
    add: function(leftKey, topKey){
        var me = this,
            obj = me.get(leftKey, topKey);
        
        if(!obj){
            
            obj = me.items.add(Ext.create('Mz.aggregate.matrix.Result', {
                leftKey:        leftKey,
                topKey:         topKey,
                matrix:         me.matrix
            }));
        }
        
        return obj;
    },
    
    /**
    * Returns the Result object for the specified left/top axis keys
    * 
    * @param leftKey
    * @param topKey
    * @returns {Mz.aggregate.matrix.Result}
    */
    get: function(leftKey, topKey){
        return this.items.getByKey(leftKey + '/' + topKey);
    },
    
    /**
    * Return all Result objects for the specified leftKey
    * 
    * @param leftKey
    * @returns Array
    */
    getByLeftKey: function(leftKey){
        var col = this.items.filterBy(function(item, key){
            var keys = String(key).split('/');
            return (leftKey == keys[0]);
        });
        
        return col.getRange();
    },
    
    /**
    * Return all Result objects for the specified leftKey
    * 
    * @param leftKey
    * @returns Array
    */
    getByTopKey: function(topKey){
        var col = this.items.filterBy(function(item, key){
            var keys = String(key).split('/');
            return (keys.length > 1 && topKey == keys[1]);;
        });
        
        return col.getRange();
    },
    
    /**
    * Calculate aggregate values for each available Result object
    * 
    */
    calculate: function(){
        this.items.each(function(item){
            item.calculate();
        });
    }
});