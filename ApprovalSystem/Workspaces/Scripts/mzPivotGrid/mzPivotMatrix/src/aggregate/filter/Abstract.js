/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* Abstract implementation of a pivot grid filter. Handles common filters.
* 
*/
Ext.define('Mz.aggregate.filter.Abstract', {
    alias: 'pivotfilter.abstract',
    
    inheritableStatics: {
        /**
        * Filter type 'equals'
        * 
        * @type Number
        */
        TypeEquals:                 1,
        /**
        * Filter type 'not equal'
        * 
        * @type Number
        */
        TypeDoesNotEqual:           2,
        /**
        * Filter type 'greater than'
        * 
        * @type Number
        */
        TypeGreaterThan:            3,
        /**
        * Filter type 'greater than or equal to'
        * 
        * @type Number
        */
        TypeGreaterThanOrEqualTo:   4,
        /**
        * Filter type 'less than'
        * 
        * @type Number
        */
        TypeLessThan:               5,
        /**
        * Filter type 'less than or equal to'
        * 
        * @type Number
        */
        TypeLessThanOrEqualTo:      6,
        /**
        * Filter type 'between'
        * 
        * @type Number
        */
        TypeBetween:                7,
        /**
        * Filter type 'not between'
        * 
        * @type Number
        */
        TypeNotBetween:             8
    },
    
    /**
    * Use this when you define a filter on a dimension to check what kind of filter has
    * to be instantiated. Same treatment as the 'xtype' config in ExtJS.
    * 
    * @cfg
    * @type String
    */
    mztype:         'abstract',

    /**
    * The type of filter to check. Use one of the constants defined in this class' statics.
    * 
    * @cfg
    * @type Number
    */
    type:           0,
    
    /**
    * Used in case of a '/not between' type of filter
    * 
    * @cfg
    * @type String
    */
    from:           null,

    /**
    * Used in case of a '/not between' type of filter
    * 
    * @cfg
    * @type String
    */
    to:             null,

    /**
    * Value to filter by.
    * 
    * @cfg
    * @type String
    */
    value:          null,

    /**
    * During filtering should we use case sensitive comparison?
    * 
    * @cfg
    * @type Boolean
    */
    caseSensitive:  true,
    
    constructor: function(config){
        Ext.apply(this, config || {});
    },
    
    /**
    * Returns the serialized filter data.
    * 
    */
    serialize: function(){
        var me = this;
        
        return Ext.apply({
            mztype:         me.mztype,
            type:           me.type,
            from:           me.from,
            to:             me.to,
            value:          me.value,
            caseSensitive:  me.caseSensitive
        }, this.getSerialArgs() || {});
    },
    
    /**
     * Template method to be implemented by all subclasses that is used to
     * get and return serialized filter data.
     * Defaults to Ext.emptyFn.
     */
    getSerialArgs: Ext.emptyFn,
    
    /**
    * Check if the specified value matches the filter.
    * @returns Boolean True if the value matches the filter
    * 
    * @param value
    */
    isMatch: function(value){
        var me = this,
            sorter = Mz.aggregate.matrix.Abstract.prototype.naturalSort,
            ret = (me.caseSensitive ? sorter(value || '', me.value || '') : sorter(String(value || '').toLowerCase(), String(me.value || '').toLowerCase())),
            retFrom, retTo;
        
        if(me.type == me.self.TypeEquals){
            return (ret === 0);
        }

        if(me.type == me.self.TypeDoesNotEqual){
            return (ret !== 0);
        }

        if(me.type == me.self.TypeGreaterThan){
            return (ret >= 1);
        }

        if(me.type == me.self.TypeGreaterThanOrEqualTo){
            return (ret >= 0);
        }

        if(me.type == me.self.TypeLessThan){
            return (ret < 0);
        }

        if(me.type == me.self.TypeLessThanOrEqualTo){
            return (ret <= 0);
        }

        retFrom = (me.caseSensitive ? sorter(String(value || '').toLowerCase(), String(me.from || '').toLowerCase()) : sorter(value || '', me.from || ''));
        retTo = (me.caseSensitive ? sorter(String(value || '').toLowerCase(), String(me.to || '').toLowerCase()) : sorter(value || '', me.to || ''));

        if(me.type == me.self.TypeBetween){
            return (retFrom >= 0 && retTo <= 0);
        }

        if(me.type == me.self.TypeNotBetween){
            return !(retFrom >= 0 && retTo <= 0);
        }
        
        // no valid type was specified. ignore filtering
        return true;
    }
});