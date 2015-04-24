/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

if (Ext.getVersion('extjs').match('4.1')) {
    Ext.define('overrides.dom.Element', {
        override: 'Ext.dom.Element',

        getAttribute: (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) ?
            function (name, ns) {
                var d = this.dom,
                        type;
                if (ns) {
                    type = typeof d[ns + ":" + name];
                    if (type != 'undefined' && type != 'unknown') {
                        return d[ns + ":" + name] || null;
                    }
                    return null;
                }
                if (name === "for") {
                    name = "htmlFor";
                }
                return d[name] || null;
            } : function (name, ns) {
                var d = this.dom;
                if (ns) {
                    return d.getAttributeNS(ns, name) || d.getAttribute(ns + ":" + name);
                }
                return d.getAttribute(name) || d[name] || null;
            }
    });


}
/**
* This class contains all predefined aggregator functions.
* @singleton
* 
*/
Ext.define('Mz.aggregate.Aggregators', {
    singleton: true,
    
    /**
    * Calculates the sum of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    sum: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total  = 0,
            i;
        
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        
        return total;
    },

    /**
    * Calculates the avg of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    avg: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total  = 0,
            i;
        
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        
        return length > 0 ? (total / length) : 0;
    },

    /**
    * Calculates the min of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    min: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var data   = [],
            length = records.length,
            i, v;
        
        for (i = 0; i < length; i++) {
            data.push(records[i].get(measure));
        }
        
        v = Ext.Array.min(data);
        return v;
    },

    /**
    * Calculates the max of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    max: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var data   = [],
            length = records.length,
            i;
        
        for (i = 0; i < length; i++) {
            data.push(records[i].get(measure));
        }
        
        v = Ext.Array.max(data);
        return v;
    },

    /**
    * Calculates the count of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    count: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        return records.length;
    },

    /**
    * Calculates the percentage from the row group sum.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    groupSumPercentage: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var sumFn = Mz.aggregate.Aggregators.sum,
            length = records.length,
            result, resultParent,
            sum = 0, sumParent = 0,
            keys = rowGroupKey.split(matrix.keysSeparator);
        
        if(length == 0) return 0;
        
        keys.pop();
        keys = keys.join(matrix.keysSeparator);
        if(Ext.isEmpty(keys)){
            keys = matrix.grandTotalKey;
        }
        
        result = matrix.results.get(rowGroupKey, colGroupKey);
        if(result){
            sum = result.getValue('groupSum');
            if(!Ext.isDefined(sum)){
                sum = result.calculateByFn('groupSum', measure, sumFn);
            }
        }
        
        resultParent = matrix.results.get(keys, colGroupKey);
        if(resultParent){
            sumParent = resultParent.getValue('groupSum');
            if(!Ext.isDefined(sumParent)){
                sumParent = resultParent.calculateByFn('groupSum', measure, sumFn);
            }
        }
        
        return (sumParent > 0 && sum > 0) ? sum/sumParent * 100 : 0;
    },

    /**
    * Calculates the percentage from the row group count.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    groupCountPercentage: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var countFn = Mz.aggregate.Aggregators.count,
            length = records.length,
            result, resultParent,
            sum = 0, sumParent = 0,
            keys = rowGroupKey.split(matrix.keysSeparator);
        
        if(length == 0) return 0;
        
        keys.pop();
        keys = keys.join(matrix.keysSeparator);
        if(Ext.isEmpty(keys)){
            keys = matrix.grandTotalKey;
        }

        result = matrix.results.get(rowGroupKey, colGroupKey);
        if(result){
            sum = result.getValue('groupCount');
            if(!Ext.isDefined(sum)){
                sum = result.calculateByFn('groupCount', measure, countFn);
            }
        }
        
        resultParent = matrix.results.get(keys, colGroupKey);
        if(resultParent){
            sumParent = resultParent.getValue('groupCount');
            if(!Ext.isDefined(sumParent)){
                sumParent = resultParent.calculateByFn('groupCount', measure, countFn);
            }
        }
        
        return (sumParent > 0 && sum > 0) ? sum/sumParent * 100 : 0;
    }

});



/**
* This class enhances the Ext.util.MixedCollection class by allowing the 
* children objects to be destroyed on remove.
* 
*/
Ext.define('Mz.aggregate.MixedCollection', {
    extend:  Ext.util.MixedCollection ,
    
    removeAt: function(index){
        var me = this,
            obj = me.callParent(arguments);
        
        Ext.destroy(obj);
    },
    
    clear: function(){
        var me = this;
        
        Ext.destroy(me.items);
        me.callParent(arguments);
    },
    
    removeAll: function(){
        var me = this;
        
        Ext.destroy(me.items);
        me.callParent(arguments);
    },
    
    destroy: function(){
        // destroy all objects in the items array
        this.clear();
    }
});
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
/**
* Label filter class
* 
*/
Ext.define('Mz.aggregate.filter.Label', {
    extend:  Mz.aggregate.filter.Abstract ,

    alias: 'pivotfilter.label',
    
    mztype: 'label',
    
    inheritableStatics: {
        /**
        * Filter type 'begins with'
        * 
        * @type Number
        */
        TypeBeginsWith:             21,
        /**
        * Filter type 'not begin with'
        * 
        * @type Number
        */
        TypeDoesNotBeginWith:       22,
        /**
        * Filter type 'ends with'
        * 
        * @type Number
        */
        TypeEndsWith:               23,
        /**
        * Filter type 'not end with'
        * 
        * @type Number
        */
        TypeDoesNotEndWith:         24,
        /**
        * Filter type 'contains'
        * 
        * @type Number
        */
        TypeContains:               25,
        /**
        * Filter type 'does not contain'
        * 
        * @type Number
        */
        TypeDoesNotContain:         26
    },

    /**
    * Check if the specified value matches the filter type/value
    * 
    * @param value
    */
    isMatch: function(value){
        var me = this;
        
        if(me.type == me.self.TypeBeginsWith){
            return me.startsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        
        if(me.type == me.self.TypeDoesNotBeginWith){
            return !me.startsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        
        if(me.type == me.self.TypeEndsWith){
            return me.endsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        
        if(me.type == me.self.TypeDoesNotEndWith){
            return !me.endsWith(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        
        if(me.type == me.self.TypeContains){
            return me.stringContains(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        
        if(me.type == me.self.TypeDoesNotContain){
            return !me.stringContains(String(value || ''), String(me.value || ''), !me.caseSensitive);
        }
        
        // no valid type was specified. check if it matches the parent class.
        return me.callParent(arguments);
    },
    
    /**
    * Check if the specified string contains the substring
    * 
    * @param s
    * @param start
    * @param ignoreCase
    */
    stringContains: function(s, start, ignoreCase){
        var result = (start.length <= s.length);
        
        if(result){
            if (ignoreCase) {
                s = s.toLowerCase();
                start = start.toLowerCase();
            }
            result = (s.lastIndexOf(start) >= 0);
        }
        
        return result;
    },
    
    /**
     * Checks if a string starts with a substring
     * In ExtJS 4.2.x this function is part of Ext.String class. Added here for compatibility with 4.1.x.
     * @param {String} s The original string
     * @param {String} start The substring to check
     * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
     */
    startsWith: function(s, start, ignoreCase){
        var result = (start.length <= s.length);
        
        if (result) {
            if (ignoreCase) {
                s = s.toLowerCase();
                start = start.toLowerCase();
            }
            result = s.lastIndexOf(start, 0) === 0;
        }
        return result;
    },
    
    /**
     * Checks if a string ends with a substring
     * In ExtJS 4.2.x this function is part of Ext.String class. Added here for compatibility with 4.1.x.
     * @param {String} s The original string
     * @param {String} start The substring to check
     * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
     */
    endsWith: function(s, end, ignoreCase){
        var result = (start.length <= s.length);
        
        if (result) {
            if (ignoreCase) {
                s = s.toLowerCase();
                end = end.toLowerCase();
            }
            result = s.indexOf(end, s.length - end.length) !== -1;
        }
        return result;
    }    
    
});
/**
* Value filter class.
* 
* Top 10 works as following:
* 
* First of all sort axis groups by grandtotal value of the specified dimension. The sorting
* order depends on top/bottom configuration.
* 
* 1. Top/Bottom 10 Items: Keep only the top x items from the groups array
* 
* 2. Top/Bottom 10 Percent: Find first combined values to total at least x percent of the parent grandtotal
* 
* 3. Top/Bottom 10 Sum: Find first combined values to total at least x
* 
*/
Ext.define('Mz.aggregate.filter.Value', {
    extend:  Mz.aggregate.filter.Abstract ,

    alias: 'pivotfilter.value',
    
    mztype: 'value',
    
    inheritableStatics: {
        /**
        * Filter type 'top10'
        * 
        * @type Number
        */
        TypeTop10:  31
    },
    
    /**
    * Id of the aggregate dimension used to filter by the specified value
    * 
    * @cfg
    * @type String
    */
    dimensionId:    '',
    
    /**
    * Specify here which kind of Top10 we need to perform.
    * Possible values: items, percent, sum
    * 
    * @cfg
    * @type String
    */
    topType:        'items',
    
    /**
    * Which kind of top10 do you want? Possible values: top, bottom
    * 
    * @cfg
    * @type String
    */
    topOrder:       'top',
    
    /**
    * Should the top10 results be sorted? If True then the dimension sorting is ignored and
    * the results are sorted by the grand total in DESC (topOrder = top) or ASC (topOrder = bottom) order.
    * 
    * @cfg
    * @type Boolean
    */
    topSort:        true,
    
    /**
    * Is this a top10 type of filter?
    * 
    * @type Boolean
    */
    isTopFilter:    false,
    
    constructor: function(){
        var me = this;
        
        me.callParent(arguments);
        
        me.isTopFilter = (me.type == me.self.TypeTop10);
    },
    
    /**
     * @private
     * Template method that is used to get and return serialized filter data.
     * @return {Object} An object containing key value pairs representing the current 
     * configuration of the filter.
     */
    getSerialArgs: function(){
        var me = this;
        
        return {
            dimensionId:    me.dimensionId,
            topType:        me.topType,
            topOrder:       me.topOrder
        }
    },
    
    
    /**
    * This function performs top10 on the specified array.
    * 
    * @param axis
    * @param treeItems
    */
    applyFilter: function(axis, treeItems){
        var me = this,
            items = me.topSort ? treeItems : Ext.Array.clone(treeItems),
            ret = [];
            
        if(treeItems.length == 0){
            return ret;
        }
        
        //sort the items by the grand total value in ASC(top)/DESC(bottom) order
        me.sortItemsByGrandTotal(axis, items);
        
        switch(me.topType){
            case 'items':
                ret = me.extractTop10Items(items);
            break;
            
            case 'sum':
                ret = me.extractTop10Sum(items);
            break;
            
            case 'percent':
                ret = me.extractTop10Percent(axis, items);
            break;
        }
        
        if(!me.topSort){
            items.length = 0;
        }
        
        return ret;
    },
    
    extractTop10Items: function(items){
        // we have to extract all values which are not part of the top
        // ie: we need to extract top2 but there are 3 values which are the same
        var me = this,
            uniqueValues = [],
            i;
            
        for(i = 0; i < items.length; i++){
            if(uniqueValues.indexOf(items[i]['tempVar']) < 0){
                uniqueValues.push(items[i]['tempVar']);
                if(uniqueValues.length > me.value || (me.value < i + 1 && i > 0)){
                    break;
                }
            }
        }
        
        return Ext.Array.slice(items, i);
    },
    
    extractTop10Sum: function(items){
        var me = this,
            sum = 0,
            i;
            
        for(i = 0; i < items.length; i++){
            sum += items[i]['tempVar'];
            if(sum >= me.value){
                break;
            }
        }

        return Ext.Array.slice(items, i + 1);
    },
    
    extractTop10Percent: function(axis, items){
        var me = this,
            sum = 0,
            keys = items[0].key.split(axis.matrix.keysSeparator),
            i, leftKey, topKey, parentKey, result, grandTotal;
            
        //let's find the parent grand total
        keys.length--;
        parentKey = (keys.length > 0 ? keys.join(axis.matrix.keysSeparator) : axis.matrix.grandTotalKey);
        leftKey = (axis.leftAxis ? parentKey : axis.matrix.grandTotalKey);
        topKey = (axis.leftAxis ? axis.matrix.grandTotalKey : parentKey);
        
        result = axis.matrix.results.get(leftKey, topKey);
        grandTotal = (result ? result.getValue(me.dimensionId) : 0);

        for(i = 0; i < items.length; i++){
            sum += items[i]['tempVar'];
            if((sum * 100 / grandTotal) >= me.value){
                break;
            }
        }

        return Ext.Array.slice(items, i + 1);
    },
    
    sortItemsByGrandTotal: function(axis, items){
        var me = this,
            leftKey, topKey, result, i;
            
        //let's fetch the grandtotal values and store them in a temp var on each item
        for(i = 0; i < items.length; i++){
            leftKey = (axis.leftAxis ? items[i].key : axis.matrix.grandTotalKey);
            topKey = (axis.leftAxis ? axis.matrix.grandTotalKey : items[i].key);
            result = axis.matrix.results.get(leftKey, topKey);
            
            items[i]['tempVar'] = (result ? result.getValue(me.dimensionId) : 0);
        }
        
        Ext.Array.sort(items, function(a, b){
            var result = axis.matrix.naturalSort(a['tempVar'], b['tempVar']);
            
            if(result < 0 && me.topOrder === 'top'){
                return 1;
            }
            if(result > 0 && me.topOrder === 'top'){
                return -1;
            }
            return result;
        });
    }
});
/**
* This class is used in initialize the dimensions defined on the pivot grid leftAxis, 
* topAxis and aggregate.
* 
* 
*/
Ext.define('Mz.aggregate.dimension.Item', {
               
                                       
                                    
                                   
      
    
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
/**
* The axis has items that are generated when the records are processed.
* This class stores info about such an item.
* 
*/
Ext.define('Mz.aggregate.axis.Item', {
    /**
    * The tree level this item belongs to
    * 
    * @type Number
    */
    level:          0,
    
    /**
    * The key that uniquely identifies this item in the tree. The key is a string compound of
    * all parent items keys separated by the matrix keysSeparator
    * 
    * @type String
    */
    key:            '',
    
    /**
    * The item value as it appears in the store
    * 
    * @type String
    */
    value:          '',
    
    /**
    * The item sort value as it appears in the store. This value will be used when sorting results.
    * 
    * @type String
    */
    sortValue:      '',
    
    /**
    * The item name after the grouperFn was applied to the value
    * 
    * @type String
    */
    name:           '',
    
    /**
    * Id of the dimension this item refers to.
    * 
    * @type String
    */
    dimensionId:    '',
    
    /**
    * The dimension instance
    * 
    * @type {Mz.aggregate.dimension.Item}
    * 
    */
    dimension:      null,
    
    /**
    * Array of children items this item has
    * 
    * 
    * @type Array
    */
    children:       null,
    
    /**
    * When the Local matrix is used this is the pivot store record generated for this axis item
    * 
    * @type {Ext.data.Model}
    */
    record:         null,
    
    /**
    * Parent axis instance
    * 
    * @type {Mz.aggregate.axis.Abstract}
    * 
    */
    axis:           null,
    
    /**
    * Object that stores all values from all axis items parents
    * 
    * @type Object
    */
    data:           null,
    
    /**
    * Is this item expanded or collapsed?
    * 
    * @type Boolean
    */
    expanded:       false,
    
    constructor: function(config){
        var me = this;
        
        Ext.apply(me, config || {});
        
        if(Ext.isEmpty(me.sortValue)){
            me.sortValue = me.value;
        }
        
        me.callParent(arguments);
    },
    
    destroy: function(){
        var me = this;
        
        if(me.axis){
            delete me.axis;
        }
        
        if(me.data){
            delete me.data;
        }
        
        if(me.dimension){
            delete me.dimension;
        }
        
        if(me.record){
            delete me.record;
        }
        
        if(Ext.isArray(me.children)){
            me.children.length = 0;
        }
        
        me.callParent(arguments);
    },
    
    /**
    * Returns the group total text formatted according to the template defined in the matrix
    * 
    */
    getTextTotal: function(){
        var me = this,
            groupHeaderTpl;
        
        if(Ext.XTemplate.getTpl){
            groupHeaderTpl = Ext.XTemplate.getTpl(me.axis.matrix, 'textTotalTpl');
        }else{
            groupHeaderTpl = new Ext.XTemplate(me.axis.matrix['textTotalTpl']);
        }
        
        return groupHeaderTpl.apply({
            groupField: me.dimension.dataIndex,
            columnName: me.dimension.dataIndex,
            name:       me.name,
            rows:       me.children || []
        });
    }
});
/**
* 
* This class is used for building pivot axis.
*/
Ext.define('Mz.aggregate.axis.Abstract', {

    alias: 'pivotaxis.abstract',
    
               
                                       
                                      
                                
      
    
    /**
    * All dimensions configured for this axis.
    * 
    * @type {Mz.aggregate.MixedCollection}
    */
    dimensions: null,

    /**
    * Matrix instance.
    * 
    * @type {Mz.aggregate.matrix.Abstract}
    */
    matrix:     null,
    
    /**
    * All items generated for this axis are stored in this collection.
    * 
    * @type {Mz.aggregate.MixedCollection}
    */
    items:      null,
    
    /**
    * When the tree is built for this axis it is stored in this property.
    * 
    * @type Array
    */
    tree:       null,
    
    /**
    * No of levels this axis tree has
    * 
    * @type Number
    */
    levels:     0,
    
    /**
    * internal flag to know which axis is this one
    * @type Boolean
    */
    leftAxis:   false,
    
    constructor: function(config){
        var me = this, 
            i, sorter;
        
        if(!config || !config.matrix){
            //<debug>
            Ext.log('Wrong initialization of the axis!');
            //</debug>
            return;
        }
        
        me.leftAxis = config.leftAxis || me.leftAxis;
        me.matrix = config.matrix;
        me.tree = [];
        
        // init dimensions
        me.dimensions = Ext.create('Mz.aggregate.MixedCollection');
        me.dimensions.getKey = function(item){
            return item.getId();
        };
        
        me.items = Ext.create('Mz.aggregate.MixedCollection');
        me.items.getKey = function(item){
            return item.key;
        };
        
        Ext.Array.each(Ext.Array.from(config.dimensions || []), me.addDimension, me);
    },
    
    destroy: function(){
        var me = this;
        
        Ext.destroyMembers(me, 'dimensions', 'items', 'tree');
        if(me.matrix){
            delete me.matrix;
        }
    },
    
    /**
    * Create a {Mz.aggregate.dimension.Item} object with the specified config and add it to the
    * internal collection of dimensions.
    * 
    * @param config
    */
    addDimension: function(config){
        var me = this;
        
        if(config){
            me.dimensions.add(Ext.create('Mz.aggregate.dimension.Item', Ext.apply({matrix: me.matrix}, config)));
        }
    },
    
    /**
    * Add the specified item to the internal collection of items.
    * 
    * @param item
    */
    addItem: function(item){
        var me = this;
        
        if(!Ext.isObject(item) || Ext.isEmpty(item.key) || Ext.isEmpty(item.value) || Ext.isEmpty(item.name) || Ext.isEmpty(item.dimensionId)){
            return false;
        }
        
        item.key = String(item.key);
        item.dimension = me.dimensions.getByKey(item.dimensionId);
        item.dimension.addValue(item.value, item.name);
        item.axis = me;
        if(!me.items.getByKey(item.key) && item.dimension){
            me.items.add(Ext.create('Mz.aggregate.axis.Item', item));
            return true;
        }
        
        return false;
    },
    
    /**
    * Clear all items and the tree.
    * 
    */
    clear: function(){
        var me = this;
        
        me.items.clear();
        me.tree = null;
    },
    
    /**
    * This function parses the internal collection of items and builds a tree.
    * This tree is used by the Matrix class to generate the pivot store and column headers.
    * 
    */
    getTree: function(){
        var me = this;
        
        if(Ext.isEmpty(me.tree)){
            me.buildTree();
        }
        return me.tree;
    },
    
    /**
    *    Find the first element in the tree that matches the criteria (attribute = value). 
    *    It returns an object with the tree element and depth level.
    */
    findTreeElement: function(attribute, value){
        var me = this,
            tree = arguments[2] || me.tree || [],
            level = arguments[3] || 1;
            
        var filter = Ext.Array.filter(tree, function(item, index, all){
            return Ext.isDate(value) ? Ext.Date.isEqual(item[attribute], value) : item[attribute] === value;
        }, me);
        
        if(filter.length > 0){
            return {
                level: level,
                node: filter[0]
            };
        }
        
        var obj = null;
        Ext.Array.each(tree, function(item, index, all){
            if(item.children){
                obj = this.findTreeElement(attribute, value, item.children, level + 1);
                if(obj) {
                    return false;
                }
            }
        }, me);
        
        return obj;
    },

    /**
    * This function builds the internal tree after all records were processed
    */
    buildTree: function(){
        var me = this,
            addToTreeFn;
        
        me.tree = [];
        
        // build the tree
        me.items.each(me.addItemToTree, me);
        me.sortTree();
    },
    
    /**
    * @private
    * Add the specified item to the tree
    * 
    * @param item
    */
    addItemToTree: function(item){
        var me = this,
            keys = String(item.key).split(me.matrix.keysSeparator),
            parentKey = '', el;
        
        keys = Ext.Array.slice(keys, 0, keys.length - 1);
        parentKey = keys.join(me.matrix.keysSeparator);
        
        el = me.findTreeElement('key', parentKey);
        if(el){
            item.level = el.level;
            item.data = Ext.clone(el.node.data || {});
            el.node.children = el.node.children || [];
            el.node.children.push(item);
        }else{
            item.level = 0;
            item.data = {};
            me.tree.push(item);
        }
        item.data[item.dimension.getId()] = item.name;
        //item.data[item.dimension.getId()] = item.value;
        me.levels = Math.max(me.levels, item.level);
    },
    
    /**
    * Sort the tree using the sorters defined on the axis dimensions
    * 
    */
    sortTree: function(){
        var tree = arguments[0] || this.tree,
            dimension;
        
        if(tree.length > 0){
            dimension = tree[0].dimension;
        }
        
        if(dimension && dimension.sortable === true){
            // let's sort this array
            Ext.Array.sort(tree, function(a, b){
                return dimension.sorterFn(a, b);
            });
        }
        
        Ext.Array.each(tree, function(item){
            if(item.children){
                this.sortTree(item.children);
            }
        }, this);
    },
    
    /**
    * Sort the tree by the specified field and direction.
    * If the field is one of the axis dimension then sort by that otherwise go to the records and sort
    * them by that field.
    * 
    * @param field
    * @param direction
    * 
    * @returns {Boolean}
    */
    sortTreeByField: function(field, direction){
        var me = this,
            tree = arguments[2] || me.tree,
            dimension, records, temp,
            sortDone = false,
            sortMainStore = !arguments[2];
        
        if(sortMainStore){
            me.recordIndexer = -1;
        }
        if(tree.length > 0){
            dimension = tree[0].dimension;
            records = tree[0].record;
        }
        
        direction = direction || 'ASC';
        
        if(dimension && (dimension.sortable === true) && (dimension.getId() == field)){
            // we have to sort this tree items by the dimension sorterFn
            temp = dimension.direction;
            dimension.direction = direction;
            Ext.Array.sort(tree, function(a, b){
                return dimension.sorterFn(a, b);
            });
            dimension.direction = temp;
            // ready now so exit
            return true;
        }
        
        // do we have items with records on this level?
        if(records){
            // on this tree level we have leaves with records so let's sort them
            me.sortTreeRecords(tree, field, direction);
            Ext.Array.each(tree, function(item){
                // reindex the records
                me.recordIndexer ++;
                item.record.index = me.recordIndexer;
            });
            return true;
        }else{
            // let's sort this tree by the field summary
            me.sortTreeLeaves(tree, field, direction);
            Ext.Array.each(tree, function(item){
                if(item.children){
                    sortDone = this.sortTreeByField(field, direction, item.children) || sortDone;
                }
            }, me);
        }
        
        if(sortMainStore && me.matrix.pivotStore && me.matrix.pivotStore.data){
            me.matrix.pivotStore.data.sort('index', 'ASC');
        }
        
        return sortDone;
    },
    
    /**
    * @private
    * Sort the records array of each item in the tree
    * 
    * @param tree
    * @param field
    * @param direction
    */
    sortTreeRecords: function(tree, field, direction){
        var me = this;
        
        direction = direction || 'ASC';
        
        // let's sort the records of this item
        Ext.Array.sort(tree || [], function(a, b){
            var result,
                o1 = a.record, o2 = b.record;
            
            if(!(o1 && o1.isModel && o2 && o2.isModel)){
                return 0;
            }
            
            result = me.matrix.naturalSort(o1.get(field) || '', o2.get(field) || '');
            
            if(result < 0 && direction === 'DESC'){
                return 1;
            }
            if(result > 0 && direction === 'DESC'){
                return -1;
            }
            return result;
        });
    },
    
    /**
    * @private
    * 
    * @param tree
    * @param field
    * @param direction
    * 
    * @returns {Boolean}
    */
    sortTreeLeaves: function(tree, field, direction){
        var me = this,
            model = Ext.Array.pluck(me.matrix.model, 'name'),
            idx = model.indexOf(field),
            col, agg;
        
        if(idx < 0){
            return false;
        }
        col = me.matrix.model[idx]['col'];
        agg = me.matrix.model[idx]['agg'];
        
        direction = direction || 'ASC';
        
        // let's sort the records of this item
        Ext.Array.sort(tree || [], function(a, b){
            var result,
                o1, o2;
            
            o1 = me.matrix.results.get(a.key, col);
            if(o1){
                o1 = o1.getValue(agg);
            }else{
                o1 = 0;
            }
            o2 = me.matrix.results.get(b.key, col);
            if(o2){
                o2 = o2.getValue(agg);
            }else{
                o2 = 0;
            }
            
            result = me.matrix.naturalSort(o1, o2);
            
            if(result < 0 && direction === 'DESC'){
                return 1;
            }
            if(result > 0 && direction === 'DESC'){
                return -1;
            }
            return result;
        });
    }
    
    
});

/**
* Local processing axis class
* 
*/
Ext.define('Mz.aggregate.axis.Local', {
    extend:  Mz.aggregate.axis.Abstract ,
    
    alias: 'pivotaxis.local',

    /**
    * Provide a record to extract dimensions keys and build the internal tree.
    * 
    * @param record
    * 
    */
    addRecord: function(record){
        var me = this,
            keys = [],
            processDimensionFn,
            parentKey = '',
            dimCount = me.dimensions.getCount(),
            groupValue, groupKey, groupName, dimension, i,
            filterOk = true, items = [];
        
        for(i = 0; i < dimCount; i++){
            dimension = me.dimensions.getAt(i);
            groupValue = dimension.grouperFn(record);
            groupKey = parentKey ? parentKey + me.matrix.keysSeparator : '';
                
            groupValue = Ext.isEmpty(groupValue) ? dimension.blankText : groupValue;
            groupKey += me.matrix.formatKeys(groupValue);
            groupName = dimension.renderer(groupValue);
            
            if(Ext.isEmpty(groupName)){
                groupName = groupValue;
            }
            
            if(dimension.filter instanceof Mz.aggregate.filter.Label){
                filterOk = dimension.filter.isMatch(groupName);
            }
            
            // if at least one filter has no match then don't add this record
            if(!filterOk){
                break;
            }
            
            items.push({
                name:           groupName,
                value:          groupValue,
                sortValue:      record.get(dimension.sortIndex),
                key:            groupKey,
                dimensionId:    dimension.getId()
            });
            parentKey = groupKey;
            
            keys.push(groupKey);
        }
        
        if(filterOk){
            for(i = 0; i < items.length; i++){
                me.addItem(items[i]);
            }
            return keys;
        }else{
            return null;
        }
    },
    
    /**
    * Build the tree and apply value filters.
    * 
    */
    buildTree: function(){
        var me = this;
        
        me.callParent(arguments);
        me.filterTree();
    },
    
    /**
    * Apply all value filters to the tree.
    * 
    */
    filterTree: function(){
        var me = this,
            length = me.dimensions.getCount(),
            hasFilters = false,
            i;
        
        // if at least one dimension has a value filter then parse the tree
        for(i = 0; i < length; i++){
            hasFilters = hasFilters || (me.dimensions.getAt(i).filter instanceof Mz.aggregate.filter.Value);
        }
        
        if(!hasFilters){
            return;
        }

        me.matrix.filterApplied = true;
        me.filterTreeItems(me.tree);
    },
    
    filterTreeItems: function(items){
        var me = this,
            filter, i, filteredItems;
        
        if(!items || !Ext.isArray(items) || items.length <= 0){
            return;
        }
        
        filter = items[0].dimension.filter;
        if(filter && (filter instanceof Mz.aggregate.filter.Value)){
            if(filter.isTopFilter){
                filteredItems = filter.applyFilter(me, items) || [];
            }else{
                filteredItems = Ext.Array.filter(items, me.canRemoveItem, me);
            }
            me.removeRecordsFromResults(filteredItems);
            me.removeItemsFromArray(items, filteredItems);
            // destroy removed items??
            for(i = 0; i < filteredItems.length; i++){
                me.items.remove(filteredItems[i]);
            }
        }
        
        for(i = 0; i < items.length; i++){
            if(items[i].children){
                me.filterTreeItems(items[i].children);
                if(items[i].children.length === 0){
                    // destroy removed item?
                    me.items.remove(items[i]);
                    // if all children were removed then remove the parent too
                    Ext.Array.erase(items, i, 1);
                    i--;
                }
            }
        }
    },
    
    canRemoveItem: function(item){
        var me = this,
            leftKey = (me.leftAxis ? item.key : me.matrix.grandTotalKey),
            topKey = (me.leftAxis ? me.matrix.grandTotalKey : item.key),
            result = me.matrix.results.get(leftKey, topKey),
            filter = item.dimension.filter;
            
        return (result ? !filter.isMatch(result.getValue(filter.dimensionId)) : false);
    },
    
    removeItemsFromArray: function(source, toDelete){
        for(var i = 0; i < source.length; i++){
            if(Ext.Array.indexOf(toDelete, source[i]) >= 0){
                Ext.Array.erase(source, i, 1);
                i--;
            }
        }
    },
    
    removeRecordsFromResults: function(items){
        for(var i = 0; i < items.length; i++){
            this.removeRecordsByItem(items[i]);
        }
    },
    
    removeRecordsByItem: function(item){
        var me = this,
            keys, i, results, result, toRemove;
        
        if(me.leftAxis){
            toRemove  = me.matrix.results.get(item.key, me.matrix.grandTotalKey);
            results = me.matrix.results.getByLeftKey(me.matrix.grandTotalKey);
        }else{
            toRemove = me.matrix.results.get(me.matrix.grandTotalKey, item.key);
            results = me.matrix.results.getByTopKey(me.matrix.grandTotalKey);
        }
        if(!toRemove){
            return;
        }
        
        // remove records from grand totals
        for(i = 0; i < results.length; i++){
            me.removeItemsFromArray(results[i].records, toRemove.records);
        }

        keys = item.key.split(me.matrix.keysSeparator);
        keys.length = keys.length - 1;

        while(keys.length > 0){

            // remove records from parent groups
            if(me.leftAxis){
                results  = me.matrix.results.getByLeftKey(keys.join(me.matrix.keysSeparator));
            }else{
                results = me.matrix.results.getByTopKey(keys.join(me.matrix.keysSeparator));
            }
            
            for(i = 0; i < results.length; i++){
                me.removeItemsFromArray(results[i].records, toRemove.records);
            }

            keys.length = keys.length - 1;
        }
    }

});
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
/**
* This class stores the matrix results. In case of a Local matrix it is able to do the calculations.
* 
*/
Ext.define('Mz.aggregate.matrix.Results', {
               
                                       
                                    
      
    
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
/**
* This class is used to generate the pivot data.
* 
*/
Ext.define('Mz.aggregate.matrix.Abstract', {
    extend:  Ext.util.Observable ,
    
    alias:  'pivotmatrix.abstract',
    /**
    * Use this when you define a matrix type in the matrixConfig of the grid.
    * Same treatment as the 'xtype' config in ExtJS.
    * 
    * @cfg
    * @type String
    */
    mztype: 'abstract',
    
               
                               
                              
                        
                                   
                                       
                                     
                                      
                                     
      
    
    /**
    * Define the type of left Axis this class uses. Specify here the pivotaxis alias.
    * 
    * @cfg
    * @type String
    */
    mztypeLeftAxis:     'abstract',

    /**
    * Define the type of top Axis this class uses. Specify here the pivotaxis alias.
    * 
    * @cfg
    * @type String
    */
    mztypeTopAxis:      'abstract',
    
    /**
    * In compact layout only one column is generated for the left axis dimensions.
    * This is value of that column header. 
    * 
    * @cfg
    * @type String
    */
    textRowLabels:      'Row labels',
    
    /**
    * @cfg {String} textTotalTpl Configure the template for the group total. (i.e. '{name} ({rows.length} items)')
    * @cfg {String}           textTotalTpl.groupField         The field name being grouped by.
    * @cfg {String}           textTotalTpl.name               Group name
    * @cfg {Ext.data.Model[]} textTotalTpl.rows               An array containing the child records for the group being rendered.
    */
    textTotalTpl:       'Total ({name})',

    /**
    * @cfg {String} textGrandTotalTpl Configure the template for the grand total.
    */
    textGrandTotalTpl:  'Grand total',

    /**
    * Do not use regexp special chars for this.
    * 
    * @type String
    */
    keysSeparator:      '#_#',
    
    /**
    * Generic key used by the grand total records.
    * 
    * @type String
    */
    grandTotalKey:      '#mzgrandtotal#',
    
    /**
    * In compact view layout mode the matrix generates only one column for all left axis dimensions.
    * This is the 'dataIndex' field name on the pivot store model.
    * 
    * @type String
    */
    compactViewKey:     '#compactview#',
    
    /**
    * @cfg {String} viewLayoutType Type of layout used to display the pivot data. 
    * Possible values: outline, compact.
    */
    viewLayoutType:             'outline',

    /**
    * @cfg {String} rowSubTotalsPosition Possible values: first, none, last
    */
    rowSubTotalsPosition:       'first',

    /**
    * @cfg {String} rowGrandTotalsPosition Possible values: first, none, last
    */
    rowGrandTotalsPosition:     'first',

    /**
    * @cfg {String} colSubTotalsPosition Possible values: first, none, last
    */
    colSubTotalsPosition:       'first',

    /**
    * @cfg {String} colGrandTotalsPosition Possible values: first, none, last
    */
    colGrandTotalsPosition:     'first',

    /**
    * @cfg {Boolean} showZeroAsBlank Should 0 values be displayed as blank?
    * 
    */
    showZeroAsBlank:            false,

    /**
    * Left axis object stores all generated groups for the left axis dimensions
    * 
    * @type {Mz.aggregate.axis.Abstract}
    */
    leftAxis:       null,

    /**
    * Top axis object stores all generated groups for the top axis dimensions
    * 
    * @type {Mz.aggregate.axis.Abstract}
    */
    topAxis:        null,

    /**
    * Collection of configured aggregate dimensions
    * 
    * @type {Mz.aggregate.MixedCollection}
    */
    aggregate:      null,
    
    /**
    * Stores the calculated results
    * 
    * @type {Mz.aggregate.matrix.Results}
    */
    results:        null,
    
    /**
    * The generated pivot store
    * 
    * @type {Ext.data.ArrayStore}
    */
    pivotStore:     null,
    
    /**
    * This property is set to true when the matrix object is destroyed.
    * This is useful to check when functions are deferred.
    * 
    * @type {Boolean}
    */
    isDestroyed:    false,
    
    constructor: function(config){
        var me = this;
        
        me.callParent(arguments);

        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                /**
                * Fires before the generated data is destroyed.
                * The components that uses the matrix should unbind this pivot store before is destroyed.
                * The grid panel will trow errors if the store is destroyed and the grid is refreshed.
                * 
                * @event cleardata
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'cleardata',
                
                /**
                * Fires when the matrix starts processing the records.
                * 
                * @event start
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'start',
                
                /**
                * Fires during records processing.
                * 
                * @event progress
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Integer} index Current index of record that is processed
                * @param {Integer} total Total number of records to process
                */
                'progress',

                /**
                * Fires when the matrix finished processing the records
                * 
                * @event done
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'done',

                /**
                * Fires after the matrix built the store model.
                * 
                * @event modelbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} model The built model
                */
                'modelbuilt',

                /**
                * Fires after the matrix built the columns.
                * 
                * @event columnsbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} columns The built columns
                */
                'columnsbuilt',

                /**
                * Fires after the matrix built a pivot store record.
                * 
                * @event recordbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} record The built record
                */
                'recordbuilt',

                /**
                * Fires before grand total records are created in the pivot store.
                * Push additional objects to the array if you need to create additional grand totals.
                * 
                * @event buildtotals
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} totals Array of objects that will be used to create grand total records in the pivot store. Each object should have:
                * @param {String} totals.title Name your grand total
                * @param {Object} totals.values Values used to generate the pivot store record
                */
                'buildtotals',

                /**
                * Fires after the matrix built the pivot store.
                * 
                * @event storebuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Store} store The built store
                */
                'storebuilt'
            );
        }
        
        me.initialize(true, config);
    },
    
    destroy: function(){
        var me = this;
        
        me.delayedTask.cancel();
        delete(me.delayedTask);
        
        if(Ext.isFunction(me.onDestroy)){
            me.onDestroy();
        }
        
        Ext.destroy(me.results, me.leftAxis, me.topAxis, me.aggregate, me.pivotStore);
        
        if(Ext.isArray(me.columns)){
            me.columns.length = 0;
        }
        delete(me.columns);
        if(Ext.isArray(me.model)){
            me.model.length = 0;
        }
        delete(me.model);
        if(Ext.isArray(me.totals)){
            me.totals.length = 0;
        }
        delete(me.totals);
        
        me.isDestroyed = true;

        me.callParent(arguments);
    },
    
    /**
    * The arguments are combined in a string and the function returns the crc32
    * for that key
    * 
    * @returns {String}
    */
    formatKeys: function(){
        var me = this,
            keys = Ext.Array.from(arguments),
            ret = [];
            
        Ext.Array.each(keys, function(key){
            if(!Ext.isEmpty(key)){
                ret.push(me.crc32(key));
            }
        });
        return ret.join(me.keysSeparator).toString();
    },
    
    /**
    * @private
    *
    * Crc32 is a JavaScript function for computing the CRC32 of a string
    * 
    * Version: 1.2 - 2006/11 - http://noteslog.com/category/javascript/
    * Copyright (c) 2006 Andrea Ercolino
    * http://www.opensource.org/licenses/mit-license.php
    * 
    * @param str
    */
    crc32: function(str, crc){
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D",
            n = 0, //a number between 0 and 255 
            x = 0; //an hex number 
 
        if(!Ext.isDefined(crc)){
            crc = 0;
        }
        crc = crc ^ (-1);
        str = str.toString(); 
        for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
            n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
            x = "0x" + table.substr( n * 9, 8 ); 
            crc = ( crc >>> 8 ) ^ x; 
        } 
        return crc ^ (-1);         
    },
    
    /**
    * @private
    * 
    *     Natural Sort algorithm for Javascript 
    *   Copyright (C) 2010  Sven van Bolt (http://pimpmybyte.de/services/natsort.html)
    * 
    *   Adjusted to be able to compare negative numbers too
    */
    naturalSort: function (s1, s2) {
        var n = /^(\d+|-\d+)(.*)$/;
        s1 = s1 || '';
        s2 = s2 || '';
        
        while (true) {
            if (s1 === s2) { return 0; }
            if (s1 === '') { return -1; }
            if (s2 === '') { return 1; }
            var n1 = n.exec(s1);
            var n2 = n.exec(s2);
            if ( (n1 != null) && (n2 != null) ) {
                if (n1[1] != n2[1]) { return n1[1] - n2[1]; }
                s1 = n1[2];
                s2 = n2[2];
            } else {
                n1 = s1.toString().charCodeAt(0);
                n2 = s2.toString().charCodeAt(0);
                if (n1 != n2) { return n1 - n2; }
                s1 = s1.toString().substr(1);
                s2 = s2.toString().substr(1);
            }
        }
    },

    /**
    * @private
    * 
    * Initialize the matrix with the new config object
    * 
    * @param firstTime
    * @param config
    */
    initialize: function(firstTime, config){
        var me = this,    
            props = [
                'viewLayoutType', 'rowSubTotalsPosition', 'rowGrandTotalsPosition', 
                'colSubTotalsPosition', 'colGrandTotalsPosition', 'showZeroAsBlank'
            ], i;
            
        // initialize the results object
        me.initResults();
        
        // initialize aggregates
        me.initAggregates(config.aggregate || []);
        
        // initialize dimensions and build axis tree
        me.initAxis(config.leftAxis || [], config.topAxis || []);

        for(i = 0; i < props.length; i++){
            if(config.hasOwnProperty(props[i])){
                me[props[i]] = config[props[i]];
            }
        }
        me.totals = [];
        
        if(firstTime){
            me.pivotStore = Ext.create('Ext.data.ArrayStore', {
                autoDestroy:    false,
                fields:         []
            });
            
            me.delayedTask = new Ext.util.DelayedTask(me.startProcess, me);
            
            if(Ext.isFunction(me.onInitialize)){
                me.onInitialize();
            }
        }
    },
    
    /**
    * Template method called to do your internal initialization.
    */
    onInitialize: Ext.emptyFn,
    
    /**
    * Template method called before destroying the instance.
    */
    onDestroy: Ext.emptyFn,
    
    /**
    * Call this function to reconfigure the matrix
    * 
    * @param config
    */
    reconfigure: function(config){
        var me = this,
            config = Ext.clone(config || {});
        
        me.initialize(false, config);
        
        me.clearData();
        
        if(Ext.isFunction(me.onReconfigure)){
            me.onReconfigure(config);
        }
        
        me.delayedTask.delay(5);
    },
    
    /**
    * Template function called when the matrix has to reconfigured with a new set of configs
    */
    onReconfigure: Ext.emptyFn,
    
    /**
    * Initialize the Results object
    */
    initResults: function(){
        var me = this;
        
        Ext.destroy(me.results);
        me.results = Ext.create('Mz.aggregate.matrix.Results', me);
    },
    
    /**
    * @private
    */
    initAggregates: function(aggregates){
        var me = this,
            i, item;
        
        Ext.destroy(me.aggregate);
        me.aggregate = Ext.create('Mz.aggregate.MixedCollection');
        me.aggregate.getKey = function(item){
            return item.getId();
        };
        
        if(Ext.isEmpty(aggregates)){
            return;
        }
        
        aggregates = Ext.Array.from(aggregates);
        
        for(i = 0; i < aggregates.length; i++){
            item = aggregates[i];
            Ext.applyIf(item, {
                isAggregate:        true,
                align:              'right',
                showZeroAsBlank:    me.showZeroAsBlank
            });
            me.aggregate.add(Ext.create('Mz.aggregate.dimension.Item', item));
        }
    },
    
    /**
    * @private
    */
    initAxis: function(leftAxis, topAxis){
        var me = this;
        
        leftAxis = Ext.Array.from(leftAxis || []);
        topAxis = Ext.Array.from(topAxis || []);
        
        Ext.destroy(me.leftAxis);
        me.leftAxis = Ext.createByAlias('pivotaxis.' + me.mztypeLeftAxis, {
            matrix:     me,
            dimensions: leftAxis,
            leftAxis:   true
        });
        
        Ext.destroy(me.topAxis);
        me.topAxis = Ext.createByAlias('pivotaxis.' + me.mztypeTopAxis, {
            matrix:     me,
            dimensions: topAxis,
            leftAxis:   false
        });
    },
    
    /**
    * This function clears any data that was previously calculated/generated.
    */
    clearData: function(){
        var me = this;
        
        me.fireEvent('cleardata', me);
        
        me.leftAxis.clear();
        me.topAxis.clear();
        me.results.clear();
        
        if(Ext.isArray(me.columns)){
            me.columns.length = 0;
        }
        
        if(Ext.isArray(me.model)){
            me.model.length = 0;
        }
        
        me.totals = [];
        
        if(me.pivotStore){
            me.pivotStore.removeAll(true);
        }
    },
    
    /**
    * Template function called when the calculation process is started.
    * This function needs to be implemented in the subclass.
    */
    startProcess: Ext.emptyFn,
    
    /**
    * Call this function after you finished your matrix processing.
    * This function will build up the pivot store and column headers.
    */
    endProcess: function(){
        var me = this,
            leftTree, topTree;
        
        leftTree = me.leftAxis.getTree();
        topTree = me.topAxis.getTree();
        
        // build pivot store model and column headers
        me.buildModelAndColumns();
        
        // build pivot store rows
        me.buildPivotStore();
        if(Ext.isFunction(me.onBuildStore)){
            me.onBuildStore(me.pivotStore);
        }
        me.fireEvent('storebuilt', me, me.pivotStore);
        
        me.fireEvent('done');
    },
    
    /**
    * Template function called after the pivot store model was created.
    * You could extend the model in a subclass if you implement this method.
    * 
    * @param {Array} model
    */
    onBuildModel: Ext.emptyFn,
    
    /**
    * Template function called after the pivot columns were created.
    * You could extend the columns in a subclass if you implement this method.
    * 
    * @param {Array} columns
    */
    onBuildColumns: Ext.emptyFn,
    
    /**
    * Template function called after a pivot store record was created.
    * You can use this to populate the record with your data.
    * 
    * @param {Ext.data.Model} record
    */
    onBuildRecord: Ext.emptyFn,
    
    /**
    * Template function called before building grand total records.
    * Use it to add additional grand totals to the pivot grid.
    * You have to push objects into the totals array with properties for each matrix.model fields.
    * For each object that you add a new record will be added to the pivot store
    * and will be styled as a grand total.
    * 
    * @param {Array} totals
    */
    onBuildTotals: Ext.emptyFn,
    
    /**
    * Template function called after the pivot store was created.
    * 
    * @param {Ext.data.ArrayStore} store
    */
    onBuildStore: Ext.emptyFn,
    
    /**
    * This function dynamically builds the model of the pivot records.
    */
    buildModelAndColumns: function(){
        var me = this;
            
        me.model = [
            {name: 'id', type: 'string'}
            //{name: 'info', type: 'object'}
        ];
        
        me.buildColumnHeaders(false);
    },
    
    /**
    * @private
    */
    buildColumnHeaders: function(disableChangeModel){
        var me = this;
        
        me.internalCounter = 0;
        me.columns = [];

        if(me.viewLayoutType == 'compact'){
            me.generateCompactLeftAxis(disableChangeModel);
        }else{
            me.leftAxis.dimensions.each(function(item){
                me.parseLeftAxisDimension(item, disableChangeModel);
            }, me);
        }
        
        if(me.colGrandTotalsPosition == 'first'){
            me.columns.push(me.parseAggregateForColumn(null, {
                text:       me.textGrandTotalTpl,
                grandTotal: true
            }, disableChangeModel));
        }
        Ext.Array.each(me.topAxis.getTree(), function(item){
            me.parseTopAxisItem(item, disableChangeModel);
        }, me);
        
        if(me.colGrandTotalsPosition == 'last'){
            me.columns.push(me.parseAggregateForColumn(null, {
                text:       me.textGrandTotalTpl,
                grandTotal: true
            }, disableChangeModel));
        }

        // call the hook functions
        if(!disableChangeModel){
            if(Ext.isFunction(me.onBuildModel)){
                me.onBuildModel(me.model);
            }
            me.fireEvent('modelbuilt', me, me.model);
        }
        if(Ext.isFunction(me.onBuildColumns)){
            me.onBuildColumns(me.columns);
        }
        me.fireEvent('columnsbuilt', me, me.columns);
    },
    
    /**
    * @private
    */
    parseLeftAxisDimension: function(dimension, disableChangeModel){
        var me = this;
        
        if(!disableChangeModel){
            me.model.push({
                name:   dimension.getId(), 
                type:   'string'
            });
        }
        me.columns.push({
            dataIndex:  dimension.getId(),
            text:       dimension.header,
            dimension:  dimension,
            leftAxis:   true
        });
    },
    
    /**
    * @private
    */
    generateCompactLeftAxis: function(disableChangeModel){
        var me = this;
        
        if(!disableChangeModel){
            me.model.push({
                name:   me.compactViewKey,
                type:   'string'
            });
        }
        me.columns.push({
            dataIndex:  me.compactViewKey,
            text:       me.textRowLabels,
            leftAxis:   true,
            width:      200
        });
    },
    
    /**
    * @private
    */
    parseTopAxisItem: function(item, disableChangeModel){
        var me = this,
            columns = [],
            retColumns = [],
            o1, o2, doAdd = false;
        
        if(!item.children){
            columns = me.parseAggregateForColumn(item, null, disableChangeModel);
            if(item.level === 0){
                me.columns.push(columns);
            }else{
                // we reached the deepest level so we can add to the model now
                return columns;
            }
        }else{
            if(me.colSubTotalsPosition == 'first'){
                o2 = me.addColSummary(item, disableChangeModel, true);
                if(o2){
                    retColumns.push(o2);
                }
            }
            
            // this part has to be done no matter if the column is added to the grid or not
            // the dataIndex is generated incrementally
            Ext.Array.each(item.children, function(child){
                var ret = me.parseTopAxisItem(child, disableChangeModel);
                
                if(Ext.isArray(ret)){
                    columns = Ext.Array.merge(columns, ret);
                }else{
                    columns.push(ret);
                }
            });

            if(item.expanded || !disableChangeModel){
                o1 = {
                    text:           item.name,
                    columns:        columns,
                    key:            item.key,
                    xcollapsible:   item.expanded,
                    xexpanded:      item.expanded,
                    xexpandable:    true
                };
                if(item.level === 0){
                    me.columns.push(o1);
                }
                retColumns.push(o1);
            }
            
            if(me.colSubTotalsPosition == 'last'){
                o2 = me.addColSummary(item, disableChangeModel, true);
                if(o2){
                    retColumns.push(o2);
                }
            }

            if(me.colSubTotalsPosition == 'none'){
                o2 = me.addColSummary(item, disableChangeModel, false);
                if(o2){
                    retColumns.push(o2);
                }
            }

            
            return retColumns;
        }
    },
    
    /**
    * @private
    */
    addColSummary: function(item, disableChangeModel, addColumns){
        var me = this,
            o2, doAdd = false;
            
        // add subtotal columns if required
        o2 = me.parseAggregateForColumn(item, {
            text:           item.expanded ? item.getTextTotal() : item.name,
            subTotal:       true
        }, disableChangeModel);

        if(addColumns){
            doAdd = true;
        }else{
            // this has to change since we want to show the totals 
            // when the column is collapsed but hide them when is expanded
            /*o2 = {
                text:           item.expanded ? item.getTextTotal() : item.name,
                dimension:      item.dimension,
                subTotal:       true
            };*/
            doAdd = !item.expanded;
        }
        
        if(doAdd){
            if(item.level === 0){
                me.columns.push(o2);
            }
            
            Ext.apply(o2, {
                key:            item.key,
                xcollapsible:   !item.expanded,
                xexpanded:      item.expanded,
                xexpandable:    !item.expanded
            });
            return o2;
        }
    },
    
    /**
    * @private
    */
    parseAggregateForColumn: function(item, config, disableChangeModel){
        var me = this,
            columns = [],
            column = {};
        
        me.aggregate.each(function(agg){
            me.internalCounter++;
            if(!disableChangeModel){
                me.model.push({
                    name:           'c' + me.internalCounter, 
                    type:           'auto',
                    defaultValue:   undefined,
                    useNull:        true,
                    col:            item ? item.key : me.grandTotalKey,
                    agg:            agg.getId()
                });
            }

            columns.push({
                dataIndex:  'c' + me.internalCounter,
                text:       agg.header,
                topAxis:    true,   // generated based on the top axis
                subTotal:   (config ? config.subTotal === true : false),
                grandTotal: (config ? config.grandTotal === true : false),
                dimension:  agg
            });
        });

        if(columns.length == 0 && me.aggregate.getCount() == 0){
            me.internalCounter++;
            column = Ext.apply({
                text:       item ? item.name : '',
                dataIndex:  'c' + me.internalCounter
            }, config || {});
        }else if(columns.length == 1){
            column = Ext.applyIf({
                text:   item ? item.name : ''
            }, columns[0]);
            Ext.apply(column, config || {});
            // if there is only one aggregate available then don't show the grand total text
            // use the aggregate header instead.
            if(config && config.grandTotal && me.aggregate.getCount() == 1){
                column.text = me.aggregate.getAt(0).header || config.text;
            }
        }else{
            column = Ext.apply({
                text:       item ? item.name : '',
                columns:    columns
            }, config || {});
        }
        return column;
    },
    
    /**
    * @private
    */
    buildPivotStore: function(){
        var me = this;
        
        if(Ext.isFunction(me.pivotStore.model.setFields)){
            me.pivotStore.model.setFields(me.model);
        }else{
            // ExtJS 5 has no "setFields" anymore so fallback to "replaceFields"
            me.pivotStore.model.replaceFields(me.model, true);
        }
        me.pivotStore.removeAll(true);

        Ext.Array.each(me.leftAxis.getTree(), me.addRecordToPivotStore, me);
        me.addGrandTotalsToPivotStore();
    },
    
    /**
    * @private
    */
    addGrandTotalsToPivotStore: function(){
        var me = this,
            totals = [];
            
        // first of all add the grand total
        totals.push({
            title:      me.textGrandTotalTpl,
            values:     me.preparePivotStoreRecordData({key: me.grandTotalKey})
        });
        
        // additional grand totals can be added. collect these using events or 
        if(Ext.isFunction(me.onBuildTotals)){
            me.onBuildTotals(totals);
        }
        me.fireEvent('buildtotals', me, totals);
        
        // add records to the pivot store for each grand total
        Ext.Array.forEach(totals, function(t){
            if(Ext.isObject(t) && Ext.isObject(t.values)){
                //t.values.id = '';
                me.totals.push({
                    title:      t.title || '',
                    record:     me.pivotStore.add(t.values)[0]
                });
            }
        });
    },
    
    /**
    * @private
    */
    addRecordToPivotStore: function(item){
        var me = this,
            record;
        
        if(!item.children){
            // we are on the deepest level so it's time to build the record and add it to the store
            record = me.pivotStore.add(me.preparePivotStoreRecordData(item));
            item.record = record[0];
            // this should be moved into the function "preparePivotStoreRecordData"
            if(Ext.isFunction(me.onBuildRecord)){
                me.onBuildRecord(record[0]);
            }
            me.fireEvent('recordbuilt', me, record[0]);
        }else{
            Ext.Array.each(item.children, function(child){
                me.addRecordToPivotStore(child);
            });
        }
    },
    
    /**
    * Create an object using the pivot model and data of an axis item.
    * This object is used to create a record in the pivot store.
    */
    preparePivotStoreRecordData: function(group){
        var me = this,
            data = {};
        
        data['id'] = group.key;
        Ext.apply(data, group.data || {}); // merge the left axis data
        
        Ext.Array.each(me.model, function(field){
            var result;
            
            if(field.col && field.agg){
                result = me.results.get(group.key, field.col);
                if(result){
                    data[field.name] = result.getValue(field.agg);
                }
            }
        });
        
        if(me.viewLayoutType == 'compact'){
            data[me.compactViewKey] = group.name;
        }
        
        // @TODO this function is used intensively in the pivot grid when the pivot grid store is generated
        // there is a need for a "recordbuild" event so that the developer can add
        // additional data to the record that will be added to the pivot store.
        // the matrix should fire "recordbuild" and the pivot grid should relay that event
        
        return data;
    },
    
    /**
    * Returns the generated model fields
    * 
    * @returns Array
    */
    getColumns: function(){
        return this.model;
    },
    
    /**
    * Returns all generated column headers
    * 
    * @returns Array
    */
    getColumnHeaders: function(){
        var me = this;
        
        if(!me.model){
            me.buildModelAndColumns();
        }else{
            me.buildColumnHeaders(true);
        }
        return me.columns;
    },
    
    /**
    *    Find out if the specified key belongs to a row group.
    *    Returns FALSE if the key is not found.
    *    Returns 0 if the current key doesn't belong to a group. That means that group children items will always be 0.
    *    If it'a a group then it returns the level number which is always > 0.
    * 
    * @param {String} key
    */
    isGroupRow: function(key) {
        var obj = this.leftAxis.findTreeElement('key', key);
        if(!obj) return false;
        return (obj['node']['children'] && obj['node']['children'].length == 0) ? 0 : obj['level'];
    },
    
    /**
    *    Find out if the specified key belongs to a col group.
    *    Returns FALSE if the key is not found.
    *    Returns 0 if the current key doesn't belong to a group. That means that group children items will always be 0.
    *    If it'a a group then it returns the level number which is always > 0.
    * 
    * @param {String} key
    */
    isGroupCol: function(key) {
        var obj = this.topAxis.findTreeElement('key', key);
        if(!obj) return false;
        return (obj['node']['children'] && obj['node']['children'].length == 0) ? 0 : obj['level'];
    }

    
    
    
});
/**
* This matrix processes the records locally without any remote calls to the server.
* 
*/
Ext.define('Mz.aggregate.matrix.Local', {
    extend:  Mz.aggregate.matrix.Abstract ,
    
    alias:  'pivotmatrix.local',
    mztype: 'local',
    
               
                                       
                                 
      

    mztypeLeftAxis:     'local',
    mztypeTopAxis:      'local',
    
    /**
    * This is the store used to pivot the data.
    * 
    * @cfg
    * @type {Ext.data.Store}
    */
    store:              null,
    
    /**
    * The matrix processes the records in multiple jobs.
    * Specify here how many records should be processed in a single job.
    * 
    * @cfg
    * @type Number
    */
    recordsPerJob:      1000,
    
    /**
    * How many miliseconds between processing jobs?
    * 
    * @cfg
    * @type Number
    */
    timeBetweenJobs:    2,
    
    constructor: function(){
        var me = this;
        
        me.callParent(arguments);
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                /**
                * Fires before updating the matrix data due to a change in the bound store.
                * 
                * @event beforeupdate
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'beforeupdate',
                
                /**
                * Fires after updating the matrix data due to a change in the bound store.
                * 
                * @event afterupdate
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'afterupdate'
                
            )
        }
    },
    
    onInitialize: function(){
        var me = this;
        
        me.localDelayedTask = new Ext.util.DelayedTask(me.delayedProcess, me);
        me.newRecordsDelayedTask = new Ext.util.DelayedTask(me.onOriginalStoreAddDelayed, me);
        me.updateRecordsDelayedTask = new Ext.util.DelayedTask(me.onOriginalStoreUpdateDelayed, me);
        
        me.callParent(arguments);
    },
    
    onReconfigure: function(config){
        var me = this,
            store, newStore;
        
        if(config.store){
            // a new store was passed to
            newStore = config.store;
        }else{
            if(me.store){
                if(me.store.isStore && !me.storeListeners){
                    // we have a store but no listeners were attached to it
                    store = me.store;
                }else{
                    // we need to initialize the store that we got
                    newStore = me.store;
                }
            }
        }
        
        if(newStore){
            store = Ext.getStore(newStore || '');
            if(Ext.isEmpty(store) && Ext.isString(newStore)){
                store = Ext.create(newStore);
            }
        }

        if(store && store.isStore){
            Ext.destroy(me.storeListeners);
            
            if(me.store && me.store.autoDestroy && store != me.store){
                Ext.destroy(me.store);
            }
            
            // let's initialize the store (if needed)
            me.store = store;
            // add listeners to the store
            me.storeListeners = me.store.on({
                refresh:        me.startProcess,
                //datachanged:    me.startProcess,
                beforeload:     me.onOriginalStoreBeforeLoad,
                add:            me.onOriginalStoreAdd,
                update:         me.onOriginalStoreUpdate,
                remove:         me.onOriginalStoreRemove,
                clear:          me.startProcess,
                scope:          me,
                destroyable:    true
            });
        }
        
        me.callParent(arguments);
    },
    
    onDestroy: function(){
        var me = this;
        
        me.localDelayedTask.cancel();
        me.localDelayedTask = null;
        me.newRecordsDelayedTask.cancel();
        me.newRecordsDelayedTask = null;
        me.updateRecordsDelayedTask.cancel();
        me.updateRecordsDelayedTask = null;
        
        if(Ext.isArray(me.records)){
            me.records.length = 0;
        }
        delete(me.records);
        
        Ext.destroy(me.storeListeners);
        if(me.store && me.store.isStore && me.store.autoDestroy){
            Ext.destroy(me.store);
        }
        
        me.callParent(arguments);
    },
    
    /**
    * @private
    */
    onOriginalStoreBeforeLoad: function(store){
        var me = this;
        
        me.fireEvent('start', me);
    },
    
    /**
    * @private
    */
    onOriginalStoreAdd: function(store, records){
        var me = this;
        
        me.newRecords = me.newRecords || [];
        me.newRecords = Ext.Array.merge(me.newRecords, Ext.Array.from(records));
        
        me.newRecordsDelayedTask.delay(100);
    },
    
    /**
    * @private
    */
    onOriginalStoreAddDelayed: function(){
        var me = this,
            i, records;
        
        records = Ext.Array.from(me.newRecords || []);
        for(i = 0; i < records.length; i++){
            me.processRecord(records[i], i, records.length);
        }
        me.newRecords = [];
        
        me.leftAxis.tree = null;
        me.leftAxis.buildTree();
        
        me.topAxis.tree = null;
        me.topAxis.buildTree();
        
        me.recalculateResults(me.store, records);
    },
    
    /**
    * @private
    */
    onOriginalStoreUpdate: function(store, records){
        var me = this;
        
        me.updateRecords = me.updateRecords || [];
        me.updateRecords = Ext.Array.merge(me.updateRecords, Ext.Array.from(records));
        
        me.updateRecordsDelayedTask.delay(100);
    },
    
    /**
    * @private
    */
    onOriginalStoreUpdateDelayed: function(){
        var me = this;
        
        me.recalculateResults(me.store, me.updateRecords);
        me.updateRecords.length = 0;
    },
    
    /**
    * @private
    */
    onOriginalStoreRemove: function(store, record, index, isMove){
        if(isMove){
            //don't do anything. nothing changed in the data
            return;
        }
        
        // this can also be optimized to just remove axis items if necessary
        this.startProcess();
    },
    
    /**
    * @private
    */
    isReallyDirty: function(store, records){
        var me = this,
            found = true;
        
        records = Ext.Array.from(records);
        // for all records find out if there's a new axis value
        me.leftAxis.dimensions.each(function(dimension){
            Ext.Array.forEach(records, function(record){
                found = (record && record.isModel && dimension.values.containsKey(record.get(dimension.dataIndex)));
                return found;
            });
            return found;
        });
        
        return !found;
    },
    
    /**
    * @private
    */
    recalculateResults: function(store, records){
        var me = this;
        
        if(me.isReallyDirty(store, records)){
            me.startProcess();
            return;
        }
        
        me.fireEvent('beforeupdate', me);

        // recalculate all results
        me.results.calculate();
        // now update the pivot store records
        Ext.Array.each(me.leftAxis.getTree(), me.updateRecordToPivotStore, me);
        // update all grand totals
        me.updateGrandTotalsToPivotStore();

        me.fireEvent('afterupdate', me);
    },

    /**
    * @private
    */
    updateGrandTotalsToPivotStore: function(){
        var me = this,
            totals = [],
            i;
        
        if(me.totals.length <= 0){
            return;
        }

        totals.push({
            title:      me.textGrandTotalTpl,
            values:     me.preparePivotStoreRecordData({key: me.grandTotalKey})
        });
        
        // additional grand totals can be added. collect these using events or 
        if(Ext.isFunction(me.onBuildTotals)){
            me.onBuildTotals(totals);
        }
        me.fireEvent('buildtotals', me, totals);
        
        // update records to the pivot store for each grand total
        if(me.totals.length === totals.length){
            for(i = 0; i < me.totals.length; i++){
                if(Ext.isObject(totals[i]) && Ext.isObject(totals[i].values) && (me.totals[i].record instanceof Ext.data.Model) ){
                    delete(totals[i].values.id);
                    me.totals[i].record.set(totals[i].values);
                }
            }
        }
    },
    
    /**
    * @private
    */
    updateRecordToPivotStore: function(item){
        var me = this;
        
        if(!item.children){
            if(item.record){
                item.record.set(me.preparePivotStoreRecordData(item));
            }
        }else{
            Ext.Array.each(item.children, function(child){
                me.updateRecordToPivotStore(child);
            });
        }
    },
    
    startProcess: function(){
        var me = this;
        
        // if we don't have a store then do nothing
        if(!me.store || (me.store && !me.store.isStore) || me.isDestroyed){
            // nothing to do
            return;
        }
        
        me.clearData();
        
        me.localDelayedTask.delay(50);
    },
    
    delayedProcess: function(){
        var me = this;
        
        // let's start the process
        me.fireEvent('start', me);
        
        me.records = me.store.getRange();

        if(me.records.length == 0){
            me.endProcess();
            return;
        }
        
        me.statusInProgress = false;
        
        me.processRecords(0);
    },
    
    processRecords: function(position){
        var me = this,
            i = position, totalLength = me.records.length;
        
        // don't do anything if the matrix was destroyed while doing calculations.
        if(me.isDestroyed){
            return;
        }
        
        me.statusInProgress = true;

        while(i < totalLength && i < position + me.recordsPerJob && me.statusInProgress){
            me.processRecord(me.records[i], i, totalLength);
            i++;
        }
        
        // if we reached the last record then stop the process
        if(i >= totalLength){
            me.statusInProgress = false;
            
            // now that the cells matrix was built let's calculate the aggregates
            me.results.calculate();

            // let's build the trees and apply value filters
            me.leftAxis.buildTree();
            me.topAxis.buildTree();

            // recalculate everything after applying the value filters
            if(me.filterApplied){
                me.results.calculate();
            }
            
            me.endProcess();
            return;
        }
        
        // if the matrix was not reconfigured meanwhile then start a new job
        if(me.statusInProgress && totalLength > 0){
            Ext.defer(me.processRecords, me.timeBetweenJobs, me, [i]);
        }
    },
    
    /**
    * Process the specified record and fire the 'progress' event
    */
    processRecord: function(record, index, length){
        var me = this,
            grandTotalKey = me.grandTotalKey,
            leftKeys, topKeys, i, j;
        
        // if null is returned that means it was filtered out
        // if array was returned that means it is valid
        leftKeys = me.leftAxis.addRecord(record);
        topKeys = me.topAxis.addRecord(record);
        
        if(leftKeys && topKeys){
            me.results.add(grandTotalKey, grandTotalKey).addRecord(record);
        }

        if(leftKeys){
            for (i = 0; i < leftKeys.length; i++) {
                me.results.add(leftKeys[i], grandTotalKey).addRecord(record);

                if(topKeys){
                    for (j = 0; j < topKeys.length; j++) {
                        me.results.add(leftKeys[i], topKeys[j]).addRecord(record);
                    }
                }
            }

            if(topKeys){
                for (j = 0; j < topKeys.length; j++) {
                    me.results.add(grandTotalKey, topKeys[j]).addRecord(record);
                }
            }
        }


        me.fireEvent('progress', me, index + 1, length);
    },
    
    /**
    * Fetch all records that belong to the specified row group
    * 
    * @param {String} key Row group key
    */
    getRecordsByRowGroup: function(key){
        var results = this.results.getByLeftKey(key),
            length = results.length,
            records = [], 
            i;
            
        for(i = 0; i < length; i++){
            records = Ext.Array.merge(records, results[i].records || []);
        }
        
        return records;
    },
    
    /**
    * Fetch all records that belong to the specified col group
    * 
    * @param {String} key Col group key
    */
    getRecordsByColGroup: function(key){
        var results = this.results.getByTopKey(key),
            length = results.length,
            records = [], 
            i;
            
        for(i = 0; i < length; i++){
            records = Ext.Array.merge(records, results[i].records || []);
        }
        
        return records;
    },
    
    /**
    * Fetch all records that belong to the specified row/col group
    * 
    * @param {String} rowKey Row group key
    * @param {String} colKey Col group key
    */
    getRecordsByGroups: function(rowKey, colKey){
        var result = this.results.get(rowKey, colKey);
        
        return ( result ? result.records || [] : []);
    }
    
});
/**
* This matrix allows you to do all the calculations on the backend.
* This is handy when you have large datasets.
* 
* Basically this class sends to the specified URL the configurations for
* leftAxis, topAxis and aggregate and expects back a JSON with the following format:
* 
* - success = true/false
* 
* - leftAxis = array of items that were generated for the left axis. Each item is an 
* object with keys for: key, value, name, dimensionId
* 
* - topAxis = array of items that were generated for the top axis.
* 
* - results = array of results for all left/top axis items. Each result is an object
* with keys for: leftKey, topKey, values. The 'values' object has keys for each
* aggregate id that was sent to the backend.
* 
* It is very important to use the dimension IDs that were sent to the backend
* instead of creating new ones.
* 
* This class can also serve as an example for implementing various types of
* remote matrix.
* 
*/
Ext.define('Mz.aggregate.matrix.Remote', {
    extend:  Mz.aggregate.matrix.Abstract ,
    
    alias:  'pivotmatrix.remote',
    mztype: 'remote',
    
    /**
    * URL on the backend where the calculations are performed.
    * 
    * @cfg
    * @type String
    */
    url:    '',
    
    onInitialize: function(){
        var me = this;
        
        me.remoteDelayedTask = new Ext.util.DelayedTask(me.delayedProcess, me);
        
        me.callParent(arguments);
    },
    
    startProcess: function(){
        var me = this;
        
        if(Ext.isEmpty(me.url)){
            // nothing to do
            return;
        }
        
        me.clearData();
        
        // let's start the process
        me.fireEvent('start', me);

        me.statusInProgress = false;
        
        me.remoteDelayedTask.delay(5);
    },
    
    delayedProcess: function(){
        var me = this,
            leftAxis = [],
            topAxis = [],
            aggregate = [];
        
        me.leftAxis.dimensions.each(function(item){
            leftAxis.push(item.serialize());
        });
        
        me.topAxis.dimensions.each(function(item){
            topAxis.push(item.serialize());
        });
        
        me.aggregate.each(function(item){
            aggregate.push(item.serialize());
        });
        
        // do an Ajax call to the configured URL and fetch the results
        Ext.Ajax.request({
            url:        me.url,
            jsonData: {
                leftAxis:   leftAxis,
                topAxis:    topAxis,
                aggregate:  aggregate
            },
            success:    me.processRemoteResults,
            failure:    me.processFailed,
            scope:      me
        });
        
    },
    
    processRemoteResults: function(response, opts){
        var me = this,
            data = Ext.JSON.decode(response.responseText, true);
            
        if(!data || !data['success']){
            me.endProcess();
            return;
        }
        
        Ext.Array.each(Ext.Array.from(data.leftAxis || []), function(item){
            if(Ext.isObject(item)){
                me.leftAxis.addItem(item);
            }
        });
        
        Ext.Array.each(Ext.Array.from(data.topAxis || []), function(item){
            if(Ext.isObject(item)){
                me.topAxis.addItem(item);
            }
        });
        
        Ext.Array.each(Ext.Array.from(data.results || []), function(item){
            if(Ext.isObject(item)){
                var result = me.results.add(item.leftKey || '', item.topKey || '');
                Ext.Object.each(item.values || {}, result.addValue, result);
            }
        });
        
        me.endProcess();
    },
    
    processFailed: function(){
        this.endProcess();        
    }
    
});
/**
* @private
* This class remodels the grid store when required.
* 
*/
Ext.define('Mz.pivot.feature.PivotStore', {
    constructor: function(config) {
        var me = this;

        Ext.apply(me, config);

        me.bindStore(config.store);
    },
    
    destroy: function(){
        var me = this;
        
        delete me.store;
        delete me.matrix;
        delete me.pivotFeature;
        delete me.storeInfo;
        
        Ext.destroy(me.storeListeners);
        
        me.callParent(arguments);
    },
    
    bindStore: function(store) {
        var me = this;

        if (me.store) {
            Ext.destroy(me.storeListeners);
            me.store = null;
        }
        if (store) {
            me.storeListeners = store.on({
                pivotstoreremodel:  me.processStore,
                scope:              me,
                destroyable:        true
            });
            me.store = store;
        }
    },
    
    processStore: function(){
        if(!this.matrix){
            return;
        }
        
        var me = this,
            data = me.data,
            fn = me['processGroup' + Ext.String.capitalize(me.matrix.viewLayoutType)],
            fields = me.matrix.getColumns(),
            outputFn;
        
        if(Ext.isFunction(me.store.model.setFields)){
            me.store.model.setFields(fields);
        }else{
            // ExtJS 5 has no "setFields" anymore so fallback to "replaceFields"
            me.store.model.replaceFields(fields, true);
        }
        me.store.removeAll(true);
        me.store.suspendEvents(false);

        me.storeInfo = {};

        if(!Ext.isFunction(fn)){
            // specified view type doesn't exist so let's use the outline view
            fn = me.processGroupOutline;
        }
        outputFn = Ext.Function.bind(fn, me);
        
        if(me.matrix.rowGrandTotalsPosition == 'first'){
            me.processGrandTotal();
        }
        
        Ext.Array.each(me.matrix.leftAxis.getTree(), function(group, index, all){
            me.store.add(outputFn({
                group:              group,
                previousExpanded:   (index > 0 ? all[index-1].expanded : false)
            }));
        }, me);
        
        if(me.matrix.rowGrandTotalsPosition == 'last'){
            me.processGrandTotal();
        }
        
        me.store.resumeEvents();
        me.store.fireEvent('refresh', me.store);
    },
    
    processGroup: function(config){
        var me = this,
            fn = me['processGroup' + Ext.String.capitalize(me.matrix.viewLayoutType)],
            outputFn;
        
        if(!Ext.isFunction(fn)){
            // specified view type doesn't exist so let's use the outline view
            fn = me.processGroupOutline;
        }
        outputFn = Ext.Function.bind(fn, me);
        
        return outputFn(config);
    },
    
    createGridStoreRecord: function(values){
        var me = this,
            data = me.matrix.preparePivotStoreRecordData(values || {}),
            record;
            
        data.id = '';
        record = new me.store.model(data);
        if(Ext.isEmpty(values)){
            Ext.Object.each(data, function(field){
                if(field != 'id'){
                    record.set(field, null);
                }
            });
            record.commit();
        }
        
        record.isPlaceholder = true;
        //record.internalId = values.key;
        
        return record;
    },
    
    processGrandTotal: function(){
        var me = this,
            found = false,
            group = {
                key:    me.matrix.grandTotalKey
            };
            
        Ext.Array.forEach(me.matrix.totals || [], function(total){
            var record = total.record,
                i = me.matrix.leftAxis.dimensions.getCount();
            
            if(!(record instanceof Ext.data.Model)){
                return;
            }
            
            me.storeInfo[record.internalId] = {
                leftKey:        group.key,
                rowStyle:       '',
                rowClasses:    [me.pivotFeature.gridMaster.clsGrandTotal, me.pivotFeature.summaryDataCls],
                rendererParams: {}
            };
            
            me.matrix.leftAxis.dimensions.each(function(column, index){
                var key;
                
                if(me.matrix.viewLayoutType == 'compact' || index === 0){
                    if(me.matrix.viewLayoutType == 'compact'){
                        key = me.matrix.compactViewKey;
                        i = 1;
                    }else{
                        key = column.getId();
                    }
                    record.set(key, total.title);
                    record.commit(false, [key]);
                    me.storeInfo[record.internalId].rendererParams[key] = {
                        fn:                 'groupOutlineRenderer',
                        group:              group, 
                        colspan:            i, 
                        hidden:             false, 
                        subtotalRow:        true
                    }; 
                    found = true;
                }else{
                    me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                        fn:                 'groupOutlineRenderer',
                        group:              group, 
                        colspan:            0, 
                        hidden:             found, 
                        subtotalRow:        true
                    }; 
                    i--;
                }
                // for all top axis columns use a new renderer
                me.storeInfo[record.internalId].rendererParams['topaxis'] = {
                    fn: 'topAxisRenderer'
                };
            });
            
            me.store.add(record);
        });
    },
    
// Outline view functions    

    processGroupOutline: function(config){
        var me = this,
            group = config['group'],
            results = [];
        
        if(group.record){
            me.processRecordOutline({
                results:            results,
                group:              group
            });
        }else{
            me.processGroupOutlineWithChildren({
                results:            results,
                group:              group,
                previousExpanded:   config.previousExpanded
            });
        }
        
        return results;
    },

    processGroupOutlineWithChildren: function(config){
        var me = this,
            group = config['group'],
            previousExpanded = config['previousExpanded'],
            hasSummaryData = false,
            record, i;
            
        if(!group.expanded || (group.expanded && me.matrix.rowSubTotalsPosition == 'first')){
            // summary row is on the group header
            hasSummaryData = true;
            record = me.createGridStoreRecord(group);
        }else if(me.matrix.rowSubTotalsPosition == 'last' || me.matrix.rowSubTotalsPosition == 'none'){
            record = me.createGridStoreRecord();
            record.set(group.dimension.getId(), group.name);
        }
        record.commit();
        
        me.processGroupHeaderRecordOutline({
            results:            config.results,
            group:              group, 
            record:             record, 
            previousExpanded:   previousExpanded,
            hasSummaryData:     hasSummaryData
        });

        if(group.expanded){
            if(group.children){
                for(i = 0; i < group.children.length; i++){
                    if(group.children[i]['children']){
                        me.processGroupOutlineWithChildren({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }else{
                        me.processRecordOutline({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }
                }
            }
            if(me.matrix.rowSubTotalsPosition == 'last'){
                record = me.createGridStoreRecord(group);
                record.set(group.dimension.getId(), group.getTextTotal());
                record.commit();
                me.processGroupHeaderRecordOutline({
                    results:            config.results,
                    group:              group, 
                    record:             record, 
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        true,
                    hasSummaryData:     true
                });
            }
        }
    },
    
    processGroupHeaderRecordOutline: function(config){
        var me = this,
            group = config['group'], 
            record = config['record'], 
            previousExpanded = config['previousExpanded'], 
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'],
            i = me.matrix.leftAxis.dimensions.getCount(), 
            found = false;
            
        me.storeInfo[record.internalId] = {
            leftKey:        group.key,
            rowStyle:       '',
            rowClasses:    [me.pivotFeature.gridMaster.clsGroupTotal, hasSummaryData ? me.pivotFeature.summaryDataCls : ''],
            rendererParams: {}
        };

        me.matrix.leftAxis.dimensions.each(function(column, index){
            if(column.getId() == group.dimension.getId()){
                me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                    fn:                 'groupOutlineRenderer',
                    group:              group, 
                    colspan:            i, 
                    hidden:             false, 
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        subtotalRow
                };
                found = true;
            }else{
                me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                    fn:                 'groupOutlineRenderer',
                    group:              group, 
                    colspan:            0, 
                    hidden:             found, 
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        subtotalRow
                };
                i--;
            }
        });
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: (hasSummaryData ? 'topAxisRenderer' : 'topAxisNoRenderer')
        };
        
        config.results.push(record);
    },

    processRecordOutline: function(config){
        var me = this,
            group = config['group'], 
            found = false,
            //record = me.createGridStoreRecord(group);
            record = group.record;

        me.storeInfo[record.internalId] = {
            leftKey:        group.key,
            rowStyle:       '',
            rowClasses:    [me.pivotFeature.rowCls, me.pivotFeature.summaryDataCls],
            rendererParams: {}
        };

        me.matrix.leftAxis.dimensions.each(function(column, index){
            if(column.getId() == group.dimension.getId()){
                found = true;
            }

            me.storeInfo[record.internalId].rendererParams[column.getId()] = {
                fn:                 'recordOutlineRenderer',
                group:              group, 
                hidden:             !found
            };
        });
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: 'topAxisRenderer'
        };

        config.results.push(record);
    },
    
    
// Compact view functions
    
    processGroupCompact: function(config){
        var me = this,
            group = config['group'], 
            previousExpanded = config['previousExpanded'],
            results = [];
        
        if(group.record){
            me.processRecordCompact({
                results:            results,
                group:              group
            });
        }else{
            me.processGroupCompactWithChildren({
                results:            results,
                group:              group, 
                previousExpanded:   previousExpanded
            });
        }
        
        return results;
    },

    processGroupCompactWithChildren: function(config){
        var me = this,
            group = config['group'], 
            previousExpanded = config['previousExpanded'],
            hasSummaryData = false,
            record, i;
            
        if(!group.expanded || (group.expanded && me.matrix.rowSubTotalsPosition == 'first')){
            // summary row is on the group header
            hasSummaryData = true;
            record = me.createGridStoreRecord(group);
        }else if(me.matrix.rowSubTotalsPosition == 'last' || me.matrix.rowSubTotalsPosition == 'none'){
            record = me.createGridStoreRecord();
            record.set(me.matrix.compactViewKey, group.name);
        }
        record.commit();
        
        me.processGroupHeaderRecordCompact({
            results:            config.results,
            group:              group, 
            record:             record, 
            previousExpanded:   previousExpanded,
            hasSummaryData:     hasSummaryData
        });

        if(group.expanded){
            if(group.children){
                for(i = 0; i < group.children.length; i++){
                    if(group.children[i]['children']){
                        me.processGroupCompactWithChildren({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }else{
                        me.processRecordCompact({
                            results:    config.results,
                            group:      group.children[i]
                        });
                    }
                }
            }
            if(me.matrix.rowSubTotalsPosition == 'last'){
                record = me.createGridStoreRecord(group);
                record.set(me.matrix.compactViewKey, group.getTextTotal());
                record.commit();
                me.processGroupHeaderRecordCompact({
                    results:            config.results,
                    group:              group, 
                    record:             record, 
                    previousExpanded:   previousExpanded, 
                    subtotalRow:        true,
                    hasSummaryData:     true
                });
            }
        }
    },
    
    processGroupHeaderRecordCompact: function(config){
        var me = this,
            group = config['group'], 
            record = config['record'], 
            previousExpanded = config['previousExpanded'], 
            subtotalRow = config['subtotalRow'],
            hasSummaryData = config['hasSummaryData'],
            i = me.matrix.leftAxis.dimensions.getCount(), 
            found = false;
            
        me.storeInfo[record.internalId] = {
            leftKey:        group.key,
            rowStyle:       '',
            rowClasses:    [me.pivotFeature.gridMaster.clsGroupTotal, hasSummaryData ? me.pivotFeature.summaryDataCls : ''],
            rendererParams: {}
        };

        me.storeInfo[record.internalId].rendererParams[me.matrix.compactViewKey] = {
            fn:                 'groupCompactRenderer',
            group:              group, 
            colspan:            0, 
            previousExpanded:   previousExpanded, 
            subtotalRow:        subtotalRow
        }; 
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: (hasSummaryData ? 'topAxisRenderer' : 'topAxisNoRenderer')
        };

        config.results.push(record);
    },

    processRecordCompact: function(config){
        var me = this,
            group = config['group'], 
            found = false,
            record = me.createGridStoreRecord(group);
            
        me.storeInfo[record.internalId] = {
            leftKey:        group.key,
            rowStyle:       '',
            rowClasses:    [me.pivotFeature.rowCls, me.pivotFeature.summaryDataCls],
            rendererParams: {}
        };
        
        me.storeInfo[record.internalId].rendererParams[me.matrix.compactViewKey] = {
            fn:         'recordCompactRenderer',
            group:      group
        }; 
        
        // for all top axis columns use a new renderer
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: 'topAxisRenderer'
        };

        config.results.push(record);
    },
    
    doExpandCollapse: function(key, oldRecord){
        var me = this,
            extjsVersion = Ext.getVersion('extjs'),
            gridMaster = me.pivotFeature.gridMaster,
            group;
        
        group = me.matrix.leftAxis.findTreeElement('key', key);
        if(!group){
            return;
        }
        
        if (extjsVersion.match('4.1')) {
            me.doExpandCollapse41(group, oldRecord);
        }else if (extjsVersion.match('4.2')) {
            me.doExpandCollapse42(group, oldRecord);
        }else if (extjsVersion.isGreaterThanOrEqual && extjsVersion.isGreaterThanOrEqual(5.0)) {
            me.doExpandCollapse50(group, oldRecord);
        }
        gridMaster.fireEvent((group.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), gridMaster, 'row', group.node);
    },
    
    doExpandCollapse41: function(group, oldRecord){
        var me = this;

        me.store.suspendEvents(false);
        me.doExpandCollapseInternal.apply(me, arguments);
        me.store.resumeEvents();
        me.store.fireEvent('refresh', me.store);
    },
    
    doExpandCollapse42: function(group, oldRecord){
        var me = this,
            extjsVersion = Ext.getVersion('extjs'),
            is421 = extjsVersion.isGreaterThanOrEqual('4.2.1');

        me.store.suspendEvents(false);
        me.doExpandCollapseInternal.apply(me, arguments);
        me.store.resumeEvents();

        if(me.pivotFeature.view.bufferedRenderer){
            me.pivotFeature.view.refresh();
            if(is421){
                me.pivotFeature.view.bufferedRenderer.setBodyTop(me.pivotFeature.view.bufferedRenderer.bodyTop);
            }
            if(me.pivotFeature.lockingPartner){
                me.pivotFeature.lockingPartner.view.refresh();
                if(is421){
                    me.pivotFeature.lockingPartner.view.bufferedRenderer.setBodyTop(me.pivotFeature.lockingPartner.view.bufferedRenderer.bodyTop);
                }
            }
            // this should run after view refresh to sync the row heights of locked and normal grids
//            if(me.gridMaster && me.gridMaster.syncRowHeights && me.lockingPartner && me.view.bufferedRenderer){
//                me.gridMaster.syncRowHeights();
//            }
        }else{
            me.store.fireEvent('refresh', me.store);
        }
    },
    
    doExpandCollapse50: function(group, oldRecord){
        var me = this;

        me.doExpandCollapseInternal.apply(me, arguments);
    },
    
    doExpandCollapseInternal: function(group, oldRecord){
        var me = this,
            items, oldItems, startIdx, len;
        
        oldItems = me.processGroup({
            group:              group.node,
            previousExpanded:   false
        });
        
        group.node.expanded = !group.node.expanded;
        
        items = me.processGroup({
            group:              group.node,
            previousExpanded:   false
        });
        
        if(items.length && (startIdx = me.store.indexOf(oldRecord)) !== -1){
            if(group.node.expanded){
                me.store.removeAt(startIdx);
                
                me.store.insert(startIdx, items);
                me.removeStoreInfoData([oldRecord]);
            }else{
                len = oldItems.length;
                oldItems = me.store.getRange(startIdx, startIdx + len - 1);
                me.store.remove(oldItems);
                
                me.store.insert(startIdx, items);
                me.removeStoreInfoData(oldItems);
            }
        }
    },
    
    removeStoreInfoData: function(records){
        var me = this;
        
        Ext.Array.each(records, function(record){
            if(me.storeInfo[record.internalId]){
                delete me.storeInfo[record.internalId];
            }
        });
    }
});
/**
* This is the class that takes care of pivot grid mouse events.
* 
*/
Ext.define('Mz.pivot.feature.PivotEvents',{
    extend:  Ext.grid.feature.Feature ,
    
    alias: 'feature.pivotevents',

               
                                     
      

    eventPrefix:    'pivotcell',
    eventSelector:  '.' + Ext.baseCSSPrefix + 'grid-cell',

    // this cls is added when running in 4.2.x to fix a bug in the framework
    lockedViewGridCls:          Ext.baseCSSPrefix + 'pivot-gridview-locked',
    
    // this cls is used to catch events on the summary data rows (not on the header)
    summaryDataCls:             Ext.baseCSSPrefix + 'pivot-summary-data',
    summaryDataSelector:        '.' + Ext.baseCSSPrefix + 'pivot-summary-data',
    cellSelector:               '.' + Ext.baseCSSPrefix + 'grid-cell',
    groupHeaderCls:             Ext.baseCSSPrefix + 'pivot-group-header',
    groupHeaderCollapsibleCls:  Ext.baseCSSPrefix + 'pivot-group-header-collapsible',

    // summary rows styling
    summaryRowCls:              Ext.baseCSSPrefix + 'grid-group-total',
    summaryRowSelector:         '.' + Ext.baseCSSPrefix + 'grid-group-total',
    grandSummaryRowCls:         Ext.baseCSSPrefix + 'grid-grand-total',
    grandSummaryRowSelector:    '.' + Ext.baseCSSPrefix + 'grid-grand-total',

    init: function(grid){
        var me = this,
            view = me.view,
            lockPartner;
        
        me.initEventsListeners();
        
        me.callParent(arguments);

        // Share the GroupStore between both sides of a locked grid
        lockPartner = me.lockingPartner;
        if (lockPartner && lockPartner.dataSource) {
            me.dataSource = lockPartner.dataSource;
        } else {
            me.dataSource = new Mz.pivot.feature.PivotStore({
                store:          me.grid.store,
                pivotFeature:   me
            });
        }
    },
    
    destroy: function(){
        var me = this;
        
        delete me.view;
        delete me.grid;
        
        if(me.gridMaster){
            delete me.gridMaster;
        }
        if(me.matrix){
            delete me.matrix;
        }
        
        me.destroyEventsListeners();
        me.callParent(arguments);
    },

    initEventsListeners: function(){
        var me = this;
        
        me.eventsViewListeners = me.view.on(Ext.apply({
            scope:          me,
            destroyable:    true
        }, me.getViewListeners() || {}));

        me.gridListeners = me.grid.on(Ext.apply({
            scope:          me,
            destroyable:    true
        }, me.getGridListeners() || {}));
    },
    
    getViewListeners: function(){
        var me = this,
            listeners = {
                afterrender:    me.onViewAfterRender
            };
        
        listeners[me.eventPrefix + 'click'] = me.onCellEvent;
        listeners[me.eventPrefix + 'dblclick'] = me.onCellEvent;
        listeners[me.eventPrefix + 'contextmenu'] = me.onCellEvent;
        
        return listeners;
    },
    
    getGridListeners: Ext.emptyFn,

    destroyEventsListeners: function(){
        var me = this;
        
        Ext.destroy(me.eventsViewListeners, me.gridListeners);
    },
    
    onViewAfterRender: function(){
        var me = this,
            extjsVersion = Ext.getVersion('extjs');
        
        me.gridMaster = me.view.up('mzpivotgrid');
        me.matrix = me.gridMaster.getMatrix();
        me.dataSource.matrix = me.matrix;
        
        // just fix a bug in the locked view with overflow: hidden !important;
        if(extjsVersion.match('4.2') && me.gridMaster.getView().lockedGrid){
            me.gridMaster.getView().lockedGrid.getView().addCls(me.lockedViewGridCls);
        }
    },
    
    getRowId: function(record){
        return this.view.id + '-record-' + record.internalId;
    },

    getRecord: function(row){
        return this.view.getRecord(row);
    },
    
    onCellEvent: function(view, tdCell, e){
        var me = this,
            colIndex = -1,
            row = Ext.fly(tdCell).findParent(me.summaryDataSelector) || Ext.fly(tdCell).findParent(me.summaryRowSelector),
            group, ret, eventName,
            colIndex, column, colDef, leftKey, topKey,
            record = me.getRecord(row),
            params = {
                grid:       me.gridMaster,
                view:       me.view,
                cellEl:     tdCell
            };
        
        if(!row || !record){
            return false;
        }
        
        leftKey = me.dataSource.storeInfo[record.internalId].leftKey;
        row = Ext.fly(row);
        
        if(row.hasCls(me.grandSummaryRowCls)){
            // we are on the grand total row
            eventName = 'pivottotal';
        }else if(row.hasCls(me.summaryRowCls)){
            // we are on a group total row
            eventName = 'pivotgroup';
        }else if(row.hasCls(me.summaryDataCls)){
            // we are on a pivot item row
            eventName = 'pivotitem';
        }
        
        colIndex = Ext.getDom(tdCell).getAttribute('columnid');
        column = me.getColumnHeaderById(colIndex);
        
        Ext.apply(params, {
            columnId:   colIndex,
            column:     column,
            leftKey:    leftKey
        });
        
        if(Ext.fly(tdCell).hasCls(me.groupHeaderCls)){
            // it's a header cell
        }else if(column){
            eventName += 'cell';
            colDef = me.getTopAxisGroupByDataIndex(column.dataIndex);
            if(colDef){
                topKey = colDef.col;
                
                Ext.apply(params, {
                    topKey:         topKey,
                    dimensionId:    colDef.agg
                });
            }
        }
        
        ret = me.gridMaster.fireEvent(eventName + e.type, params, e);
        
        if(ret !== false && e.type == 'click' && Ext.fly(tdCell).hasCls(me.groupHeaderCollapsibleCls)){
            // if this is a pivotgroupclick event type then expand/collapse that row group
            me.dataSource.doExpandCollapse(leftKey, record);
            
            if(!me.view.bufferedRenderer && Ext.fly(me.getRowId(record))){
                Ext.fly(me.getRowId(record)).scrollIntoView(me.view.el, false, false);
            }
        }
        
        return false;
    },
    
    getColumnHeaderById: function(columnId){
        var me = this,
            columns = me.view.getGridColumns(),
            i;
        
        for(i = 0; i < columns.length; i++){
            if(columns[i].id === columnId){
                return columns[i];
            }
        }
    },
    
    getTopAxisGroupByDataIndex: function(dataIndex){
        var me = this,
            columns = me.gridMaster.matrix.getColumns(),
            i;
            
        for(i = 0; i < columns.length; i++){
            if(columns[i].name === dataIndex){
                return columns[i];
            }
        }
    }


});
/**
* @private
* This is the class that implements common functions of all features.
* 
*/
Ext.define('Mz.pivot.feature.PivotViewCommon',{
    extend:  Mz.pivot.feature.PivotEvents ,
    
    // all views css classes
    groupTitleCls:              Ext.baseCSSPrefix + 'pivot-group-title',
    groupHeaderCollapsedCls:    Ext.baseCSSPrefix + 'pivot-group-header-collapsed',
    tableCls:                   Ext.baseCSSPrefix + 'grid-table',
    rowCls:                     Ext.baseCSSPrefix + 'grid-row',
    dirtyCls:                   Ext.baseCSSPrefix + 'grid-dirty-cell',
    
    // outline view css classes
    outlineCellHiddenCls:       Ext.baseCSSPrefix + 'pivot-outline-cell-hidden',
    outlineCellGroupExpandedCls:Ext.baseCSSPrefix + 'pivot-outline-cell-previous-expanded',
    
    compactGroupHeaderCls:      Ext.baseCSSPrefix + 'pivot-group-header-compact',
    
    compactLayoutPadding:       25,

    cellTpl: [
        '{%',
            'values.hideCell = values.tdAttr == "hidden";\n',
            //'debugger;\n',
        '%}',
        '<tpl if="!hideCell">',
            '<td class="{tdCls}" {tdAttr} data-columnid="{column.id}" columnid="{column.id}" columnindex="{columnIndex}">',
                '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner"',
                    'style="text-align:{align};<tpl if="style">{style}</tpl>">{value}</div>',
            '</td>',
        '</tpl>', {
            priority: 200
        }
    ],

    rtlCellTpl: [
        '{%',
            'values.hideCell = values.tdAttr == "hidden";\n',
            //'debugger;\n',
        '%}',
        '<tpl if="!hideCell">',
            '<td class="{tdCls}" {tdAttr} data-columnid="{column.id}" columnid="{column.id}" columnindex="{columnIndex}">',
                '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner"',
                    'style="text-align:{[this.getAlign(values.align)]};<tpl if="style">{style}</tpl>">{value}</div>',
            '</td>',
        '</tpl>', {
            priority: 200,
            rtlAlign: {
                right: 'left',
                left: 'right',
                center: 'center'
            },
            getAlign: function(align) {
                return this.rtlAlign[align];
            }
        }
    ],

    setup: function () {
        var me = this;

        me.columns = me.view.getGridColumns();
    },
    
    isRTL: function(){
        var me = this,
            grid = me.gridMaster || me.grid;
        
        if(Ext.isFunction(grid.isLocalRtl)){
            return grid.isLocalRtl();
        }
        
        return false;
    },

    setRenderers: function(rendererParams){
        var me = this;

        Ext.Array.each(me.columns, function(column){
            if(Ext.isDefined(rendererParams[column.dataIndex])){
                column.savedRenderer = column.renderer;
                column.renderer = me[rendererParams[column.dataIndex].fn](Ext.apply({renderer: column.savedRenderer}, rendererParams[column.dataIndex]));
            }else if(Ext.isDefined(rendererParams['topaxis'])){
                column.savedRenderer = column.renderer;
                column.renderer = me[rendererParams['topaxis'].fn](Ext.apply({renderer: column.savedRenderer}, rendererParams[column.dataIndex]));
            }
        });
    },
    
    resetRenderers: function(){
        var me = this;
        
        Ext.Array.each(me.columns, function(column){
            if(Ext.isDefined(column.savedRenderer)){
                column.renderer = column.savedRenderer;
                delete column.savedRenderer;
            }
        });
    },

    groupOutlineRenderer: function(config){
        var me = this,
            prevRenderer = config['renderer'], 
            group = config['group'], 
            colspan = config['colspan'], 
            hidden = config['hidden'], 
            previousExpanded = config['previousExpanded'], 
            subtotalRow = config['subtotalRow'];
        
        return function (value, metaData, record, rowIndex, colIndex, store, view) {
            if(Ext.isFunction(prevRenderer)){
                value = prevRenderer.apply(this, arguments);
            }
            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);
            
            if(colspan > 0){
                metaData.tdAttr = 'id="' + group.key + '" colspan = "' + colspan + '"';
                //metaData.tdCls = me.summaryTableTitleCls;
                metaData.tdCls = me.groupHeaderCls;
                if(!subtotalRow){
                    metaData.tdCls += ' ' + me.groupHeaderCollapsibleCls;
                    if(!group.expanded){
                        metaData.tdCls += ' ' + me.groupHeaderCollapsedCls;
                    }
                    if(previousExpanded){
                        metaData.tdCls += ' ' + me.outlineCellGroupExpandedCls;
                    }
                }
                
                return '<div class="' + me.groupTitleCls +'">' + value + '</div>';
            }
            if(hidden){
                metaData.tdAttr = 'hidden';
            }
            metaData.tdCls = me.outlineCellHiddenCls;
            return '';
        }
    },

    recordOutlineRenderer: function(config){
        var me = this,
            prevRenderer = config['renderer'], 
            group = config['group'], 
            hidden = config['hidden'];
        
        return function (value, metaData, record, rowIndex, colIndex, store, view) {
            if(Ext.isFunction(prevRenderer)){
                value = prevRenderer.apply(this, arguments);
            }
            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);
            
            if(hidden){
                //metaData.tdCls = ''; // a class that hides the cell borders
                metaData.tdCls = me.outlineCellHiddenCls;
                return '';
            }
            metaData.tdCls = me.groupHeaderCls + ' ' + me.groupTitleCls;
            return value;
        }
    },
    
    groupCompactRenderer: function(config){
        var me = this,
            prevRenderer = config['renderer'], 
            group = config['group'], 
            colspan = config['colspan'], 
            previousExpanded = config['previousExpanded'], 
            subtotalRow = config['subtotalRow'];
        
        return function (value, metaData, record, rowIndex, colIndex, store, view) {
            if(Ext.isFunction(prevRenderer)){
                value = prevRenderer.apply(this, arguments);
            }

            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);

            if(group.level > 0){
                metaData.style = (me.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * group.level) + 'px;';
            }
            
            metaData.tdAttr = 'id="' + group.key + '"';
            metaData.tdCls = me.groupHeaderCls + ' ' + me.compactGroupHeaderCls;
            if(!subtotalRow){
                metaData.tdCls += ' ' + me.groupHeaderCollapsibleCls;
                if(!group.expanded){
                    metaData.tdCls += ' ' + me.groupHeaderCollapsedCls;
                }
                if(previousExpanded){
                    metaData.tdCls += ' ' + me.outlineCellGroupExpandedCls;
                }
            }
            
            return '<div class="' + me.groupTitleCls +'">' + value + '</div>';
        }
    },

    recordCompactRenderer: function(config){
        var me = this,
            prevRenderer = config['renderer'], 
            group = config['group'];
        
        return function (value, metaData, record, rowIndex, colIndex, store, view) {
            if(Ext.isFunction(prevRenderer)){
                value = prevRenderer.apply(this, arguments);
            }

            // the value has to be encoded to avoid messing up the DOM
            value = me.encodeValue(value, group);

            if(group.level > 0){
                metaData.style = (me.isRTL() ? 'margin-right: ' : 'margin-left: ') + (me.compactLayoutPadding * group.level) + 'px;';
            }
            
            metaData.tdCls = me.groupHeaderCls + ' ' + me.groupTitleCls + ' ' + me.compactGroupHeaderCls;
            return value;
        }
    },
    
    topAxisNoRenderer: function(config){
        return function(value, metaData, record, rowIndex, colIndex, store, view){
            return '';
        }
    },
    
    topAxisRenderer: function(config){
        var me = this,
            prevRenderer = config['renderer'];
        
        return function(value, metaData, record, rowIndex, colIndex, store, view){
            var hideValue = (value === 0 && me.gridMaster.showZeroAsBlank);

            if(Ext.isFunction(prevRenderer)){
                value = prevRenderer.apply(this, arguments);
            }
            
            return hideValue ? '' : value;
        }
    },
    
    /**
    * @private
    * 
    * At some point maybe provide a way on the Dimension item to html encode the value?
    * 
    * @param group
    * @param value
    */
    encodeValue: function(value, group){
        return value;
        //return Ext.String.htmlEncode(String(value));
    }
});
/**
* This class is used when running in ExtJS 5.0.x
* It is automatically added to the pivot grid.
* 
*/
Ext.define('Mz.pivot.feature.PivotView50', {
    extend:  Mz.pivot.feature.PivotViewCommon ,
    
    alias: 'feature.pivotview50',
    
    outerTpl: [
        '{%',
            // Set up the grouping unless we are disabled
            'var me = this.pivotViewFeature;',
            'if (!(me.disabled)) {',
                'me.setup();',
            '}',

            // Process the item
            'this.nextTpl.applyOut(values, out, parent);',
        '%}',
    {
        priority: 200
    }],
    
    rowTpl: [
        '{%',
            'var me = this.pivotViewFeature;',
            'me.setupRowData(values.record, values.rowIndex, values);',
            'values.view.renderColumnSizer(values, out);',
            'this.nextTpl.applyOut(values, out, parent);',
            'me.resetRenderers();',
        '%}',
        {
            priority: 200,
            
            syncRowHeights: function(firstRow, secondRow) {
                var firstHeight, secondHeight;
                
                firstRow = Ext.fly(firstRow, 'syncDest');
                if(firstRow){
                    firstHeight = firstRow.offsetHeight;
                }
                secondRow = Ext.fly(secondRow, 'sycSrc');
                if(secondRow){
                    secondHeight = secondRow.offsetHeight;
                }
                
                // Sync the heights of row body elements in each row if they need it.
                if (firstRow && secondRow) {
                    if (firstHeight > secondHeight) {
                        Ext.fly(secondRow).setHeight(firstHeight);
                    }
                    else if (secondHeight > firstHeight) {
                        Ext.fly(firstRow).setHeight(secondHeight);
                    }
                }

            }

        }
    ],

    init: function (grid) {
        var me = this,
            view = me.view;

        me.callParent(arguments);

        // Add a table level processor
        view.addTpl(Ext.XTemplate.getTpl(me, 'outerTpl')).pivotViewFeature = me;
        // Add a row level processor
        view.addRowTpl(Ext.XTemplate.getTpl(me, 'rowTpl')).pivotViewFeature = me;

        view.preserveScrollOnRefresh = true;
        
        if (view.bufferedRenderer) {
            view.bufferedRenderer.variableRowHeight = true;
        }else{
            grid.variableRowHeight = view.variableRowHeight = true;
        }

    },
    
    getViewListeners: function(){
        var me = this;
        
        return Ext.apply(me.callParent(arguments) || {}, {
            refresh:   me.onViewReady
        });
    },
    
    getGridListeners: function(){
        var me = this;
        
        return Ext.apply(me.callParent(arguments) || {}, {
            beforerender:   me.onBeforeGridRendered
        });
    },

    onBeforeGridRendered: function(grid){
        var me = this;
        
        if(me.isRTL()){
            me.view.addCellTpl(Ext.XTemplate.getTpl(me, 'rtlCellTpl'));
        }else{
            me.view.addCellTpl(Ext.XTemplate.getTpl(me, 'cellTpl'));
        }
        
        if(me.view.bufferedRenderer && Ext.isFunction(me.view.bufferedRenderer.onRangeFetched)){
            me.view.bufferedRenderer.onRangeFetched = Ext.Function.createSequence(me.view.bufferedRenderer.onRangeFetched, function(){
                me.onViewReady();
            });
        }
    },
    
    onViewReady: function(){
        var me = this;
        
        if(me.gridMaster && me.gridMaster.syncRowHeights && me.lockingPartner && me.view.bufferedRenderer){
            me.gridMaster.syncRowHeights();
        }
    },
    
    vetoEvent: function (record, row, rowIndex, e) {
        // Do not veto mouseover/mouseout
        if (e.type !== 'mouseover' && e.type !== 'mouseout' && e.type !== 'mouseenter' && e.type !== 'mouseleave' && e.getTarget(this.eventSelector)) {
            return false;
        }
    },
    
    setupRowData: function(record, idx, rowValues) {
        var me = this,
            storeInfo = me.dataSource.storeInfo[record.internalId],
            rendererParams = storeInfo ? storeInfo.rendererParams : {};
        
        rowValues.rowClasses.length = 0;
        Ext.Array.insert(rowValues.rowClasses, 0, storeInfo ? storeInfo.rowClasses : []);
        
        me.setRenderers(rendererParams);
    }
    
    
});
/**
* This class is used when running in ExtJS 4.2.x
* It is automatically added to the pivot grid.
* 
*/
Ext.define('Mz.pivot.feature.PivotView42', {
    extend:  Mz.pivot.feature.PivotViewCommon ,
    
    alias: 'feature.pivotview42',
    
    tableTpl: {
        before: function (values) {
            this.pivotViewFeature.setup();
        },
        after: function (values) {
            // some cleanup here?
            //this.pivotViewFeature.cleanup();
        },
        priority: 200
    },
    
    rowTpl: [
        '{%',
            'var me = this.pivotViewFeature;',
            'me.setupRowData(values.record, values.rowIndex, values);',
            'this.nextTpl.applyOut(values, out, parent);',
            'me.resetRenderers();',
        '%}',
        {
            priority: 200,

            syncRowHeights: function(firstRow, secondRow) {
                var firstHeight, secondHeight;
                
                firstRow = Ext.fly(firstRow, 'syncDest');
                if(firstRow){
                    firstHeight = firstRow.offsetHeight;
                }
                secondRow = Ext.fly(secondRow, 'sycSrc');
                if(secondRow){
                    secondHeight = secondRow.offsetHeight;
                }
                
                // Sync the heights of row body elements in each row if they need it.
                if (firstRow && secondRow) {
                    if (firstHeight > secondHeight) {
                        Ext.fly(secondRow).setHeight(firstHeight);
                    }
                    else if (secondHeight > firstHeight) {
                        Ext.fly(firstRow).setHeight(secondHeight);
                    }
                }

            }
        }
    ],

    init: function (grid) {
        var me = this,
            view = me.view;

        me.callParent(arguments);

        // Add a table level processor
        view.addTableTpl(me.tableTpl).pivotViewFeature = me;
        // Add a row level processor
        view.addRowTpl(Ext.XTemplate.getTpl(me, 'rowTpl')).pivotViewFeature = me;

        view.preserveScrollOnRefresh = true;
    },
    
    getViewListeners: function(){
        var me = this;
        
        return Ext.apply(me.callParent(arguments) || {}, {
            refresh:   me.onViewReady
        });
    },
    
    getGridListeners: function(){
        var me = this;
        
        return Ext.apply(me.callParent(arguments) || {}, {
            beforerender:   me.onBeforeGridRendered
        });
    },

    onBeforeGridRendered: function(grid){
        var me = this;
        
        if(me.isRTL()){
            me.view.addCellTpl(Ext.XTemplate.getTpl(me, 'rtlCellTpl'));
        }else{
            me.view.addCellTpl(Ext.XTemplate.getTpl(me, 'cellTpl'));
        }

        if(me.view.bufferedRenderer && Ext.isFunction(me.view.bufferedRenderer.onRangeFetched)){
            me.view.bufferedRenderer.onRangeFetched = Ext.Function.createSequence(me.view.bufferedRenderer.onRangeFetched, function(){
                me.onViewReady();
            });
        }
    },
    
    onViewReady: function(){
        var me = this;
        
        if(me.gridMaster && me.gridMaster.syncRowHeights && me.lockingPartner && me.view.bufferedRenderer){
            me.gridMaster.syncRowHeights();
        }
    },
    
    vetoEvent: function (record, row, rowIndex, e) {
        // Do not veto mouseover/mouseout
        if (e.type !== 'mouseover' && e.type !== 'mouseout' && e.type !== 'mouseenter' && e.type !== 'mouseleave' && e.getTarget(this.eventSelector)) {
            return false;
        }
    },
    
    setupRowData: function(record, idx, rowValues) {
        var me = this,
            storeInfo = me.dataSource.storeInfo[record.internalId],
            rendererParams = storeInfo ? storeInfo.rendererParams : {};
        
        rowValues.rowClasses.length = 0;
        Ext.Array.insert(rowValues.rowClasses, 0, storeInfo ? storeInfo.rowClasses : []);
        
        me.setRenderers(rendererParams);
    }
    

});
Ext.define('overrides.util.Format', {
    override: 'Ext.util.Format',
    
    attributes: function(attributes) {
        if (typeof attributes === 'object') {
            var result = [],
                name;

            for (name in attributes) {
                result.push(name, '="', name === 'style' ? Ext.DomHelper.generateStyles(attributes[name]) : Ext.htmlEncode(attributes[name]), '"');
            }
            attributes = result.join('');
        }
        return attributes||'';
    }
});

/**
* This class is used when running in ExtJS 4.1.x.
* It is automatically added to the pivot grid.
* 
*/
Ext.define('Mz.pivot.feature.PivotView41', {
    extend:  Mz.pivot.feature.PivotViewCommon ,

    alias: 'feature.pivotview41',

               
                               
      
    
    rowTpl: [
        '{%',
            'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
        '%}',
        '<tr role="row" {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
            'data-boundView="{view.id}" ',
            'data-recordId="{record.internalId}" ',
            'data-recordIndex="{recordIndex}" ',
            'class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
            '{rowAttr:attributes} tabIndex="-1">',
            '<tpl for="columns">' +
                '{%',
                    'this.getPivotFeature().renderCell(values, parent.record, parent.recordIndex, xindex - 1, out, parent)',
                 '%}',
            '</tpl>',
        '</tr>',
        {
            priority: 0
        }
    ],

    cellValues: null,

    init: function(grid){
        var me = this;

        me.callParent(arguments);
        me.cellValues = {
            classes: [
                Ext.baseCSSPrefix + 'grid-cell ' + Ext.baseCSSPrefix + 'grid-td' // for styles shared between cell and rowwrap 
            ]
        };

        me.view.preserveScrollOnRefresh = true;
    },
    
    getFragmentTpl: function() {
        var me = this;
        
        return {
            // @todo inject here the function that will be called from the template and renders the grid
            getPivotFeature: function(){
                return me;
            }
        };
    },

    // Injects isRow and closeRow into the metaRowTpl.
    getMetaRowTplFragments: function() {
        return {
            isRow: this.isRow,
            closeRow: this.closeRow
        };
    },

    // injected into rowtpl and wrapped around metaRowTpl
    // becomes part of the standard tpl
    isRow: function() {
        // @todo inject here the function that renders the rows
        // @todo in collectData set o.rows = [null]; to avoid any output of the row template
        return '{% this.getPivotFeature().renderGroups(out); %}' + '<tpl if="typeof rows === \'undefined\'">';
    },

    // injected into rowtpl and wrapped around metaRowTpl
    // becomes part of the standard tpl
    closeRow: function() {
        return '</tpl>';
    },

    // isRow and closeRow are injected via getMetaRowTplFragments
    mutateMetaRowTpl: function(metaRowTpl) {
        metaRowTpl.unshift('{[this.isRow()]}');
        metaRowTpl.push('{[this.closeRow()]}');
    },

    collectData: function(records, preppedRecords, startIndex, fullWidth, o) {
        var me = this;
        
        if(me.gridMaster && me.gridMaster.syncRowHeights && !me.gridMaster.hasMyInterceptor){
            me.gridMaster.syncRowHeights = Ext.Function.createInterceptor(me.gridMaster.syncRowHeights, me.syncGroupHeaders());
            me.gridMaster.hasMyInterceptor = true;
        }
        
        me.setup();
        o.rows = [null];
        
        return o;
    },
    
    renderGroups: function(out){
        var me = this;
        
        me.gridMaster.store.each(function(record){
//        me.dataSource.data.each(function(record){
            me.renderRow(record, out);
        });
    },
    
    // we need to sync the group headers too if the grid is locked
    syncGroupHeaders: function(){
        var pivotFeature = this;
        
        return function(){
            var me = this,
                ln,
                i  = 0,
                lockedView, normalView,
                lockedRowEls, normalRowEls,
                scrollTop;

            lockedView = me.lockedGrid.getView();
            normalView = me.normalGrid.getView();
            lockedRowEls = lockedView.el.query('tr:any(' + pivotFeature.summaryRowSelector + '|' + pivotFeature.grandSummaryRowSelector + ')');
            normalRowEls = normalView.el.query('tr:any(' + pivotFeature.summaryRowSelector + '|' + pivotFeature.grandSummaryRowSelector + ')');
            ln = lockedRowEls.length;
            
            if(lockedRowEls.length == normalRowEls.length){
                for (; i < ln; i++) {
                    Ext.fly(normalRowEls[i]).setHeight(lockedRowEls[i].offsetHeight);
                }
            }
        }
    },
    
    setup: function () {
        var me = this;

        me.columns = me.view.getGridColumns();
        
        if(Ext.XTemplate.getTpl){
            me.pivotRowTpl = Ext.XTemplate.getTpl(me, 'rowTpl');
            me.pivotCellTpl = Ext.XTemplate.getTpl(me, 'cellTpl');
        }else{
            me.pivotRowTpl = new Ext.XTemplate(me['rowTpl']);
            me.pivotCellTpl = new Ext.XTemplate(me['cellTpl']);
        }
    },

    getRecord: function(row){
        var id = Ext.getDom(row).getAttribute('data-recordid');
        return this.gridMaster.store.data.getByKey(id);
    },
    
    renderRow: function(record, out){
        var me = this,
            tpl = me.pivotRowTpl,
            values,
            storeInfo = me.dataSource.storeInfo[record.internalId],
            rendererParams = storeInfo ? storeInfo.rendererParams : {};

        values = {
            view:           me.view,
            record:         record,
            rowStyle:       '',
            rowClasses:     [],
            itemClasses:    Ext.clone(storeInfo ? storeInfo.rowClasses || [] : []),
            recordIndex:    me.gridMaster.store.indexOf(record),
            rowId:          me.getRowId(record),
            columns:        me.columns
        };
        
        if(Ext.Array.indexOf(values.itemClasses, me.rowCls) < 0){
            values.itemClasses.push(me.rowCls);
        }
        
        tpl.getPivotFeature = function(){
            return me;
        };

        me.setRenderers(rendererParams);
        tpl.applyOut(values, out);
        me.resetRenderers();
    },
    
    renderCell: function(column, record, recordIndex, columnIndex, out) {
        var me = this,
            selModel = me.grid.selModel,
            cellValues = me.cellValues,
            classes = cellValues.classes,
            fieldValue = record.data[column.dataIndex],
            cellTpl = me.pivotCellTpl,
            value, clsInsertPoint;

        cellValues.record = record;
        cellValues.column = column;
        cellValues.recordIndex = recordIndex;
        cellValues.columnIndex = columnIndex;
        cellValues.cellIndex = columnIndex;
        cellValues.align = column.align;
        cellValues.tdCls = column.tdCls;
        cellValues.innerCls = column.innerCls;
        cellValues.style = cellValues.tdAttr = "";
        cellValues.unselectableAttr = me.grid.enableTextSelection ? '' : 'unselectable="on"';

        if (column.renderer && column.renderer.call) {
            value = column.renderer.call(column.scope || me.ownerCt, fieldValue, cellValues, record, recordIndex, columnIndex, me.dataSource, me);
            if (cellValues.css) {
                // This warning attribute is used by the compat layer
                // TODO: remove when compat layer becomes deprecated
                record.cssWarning = true;
                cellValues.tdCls += ' ' + cellValues.css;
                delete cellValues.css;
            }
        } else {
            value = fieldValue;
        }
        cellValues.value = (value == null || value === '') ? '&#160;' : value;

        // Calculate classes to add to cell
        classes[1] = Ext.baseCSSPrefix + 'grid-cell-' + column.getItemId();
            
        // On IE8, array[len] = 'foo' is twice as fast as array.push('foo')
        // So keep an insertion point and use assignment to help IE!
        clsInsertPoint = 2;

        if (column.tdCls) {
            classes[clsInsertPoint++] = column.tdCls;
        }
        if (me.markDirty && record.isModified(column.dataIndex)) {
            classes[clsInsertPoint++] = me.dirtyCls;
        }
        if (column.isFirstVisible) {
            classes[clsInsertPoint++] = me.grid.firstCls;
        }
        if (column.isLastVisible) {
            classes[clsInsertPoint++] = me.grid.lastCls;
        }
        if (!me.enableTextSelection) {
            classes[clsInsertPoint++] = Ext.baseCSSPrefix + 'unselectable';
        }

        classes[clsInsertPoint++] = cellValues.tdCls;
        if (selModel && selModel.isCellSelected && selModel.isCellSelected(me, recordIndex, columnIndex)) {
            classes[clsInsertPoint++] = (me.grid.selectedCellCls);
        }

        // Chop back array to only what we've set
        classes.length = clsInsertPoint;

        cellValues.tdCls = classes.join(' ');

        cellTpl.applyOut(cellValues, out);
        
        // Dereference objects since cellValues is a persistent var in the XTemplate's scope chain
        cellValues.column = null;
    }
    
    
});
/**
* 
* This component is a pivot table implementation useful for reporting. 
* The component is compatible with Extjs 4.1.x, 4.2.x and 5.0.0.
*
*/
Ext.define('Mz.pivot.Grid', {
    extend:  Ext.grid.Panel ,

    alternateClassName: 'Mz.pivot.Table',
    alias: 'widget.mzpivotgrid',
    
               
                                    
                                     
                                       
                                       
                                       
                               
                             
      
    
    subGridXType:       'gridpanel',
    debugMode:          false,
    
    /**
    * @cfg {Object} matrixConfig Define here matrix specific configuration.
    * 
    */
    matrixConfig:       null,
    
    /**
    * @cfg {Boolean} enableLoadMask Set this on false if you don't want to see the loading mask.
    */
    enableLoadMask:     true,

    /**
    * @cfg {Boolean} enableLocking Set this on false if you don't want to lock the left axis columns.
    */
    enableLocking:      false,

    /**
    * @cfg {Boolean} columnLines Set this on false if you don't want to show the column lines.
    */
    columnLines:        true,

    /**
    * @cfg {String} viewLayoutType Type of layout used to display the pivot data. 
    * Possible values: outline, compact.
    */
    viewLayoutType:             'outline',

    /**
    * @cfg {String} rowSubTotalsPosition Possible values: first, none, last
    */
    rowSubTotalsPosition:       'first',

    /**
    * @cfg {String} rowGrandTotalsPosition Possible values: first, none, last
    */
    rowGrandTotalsPosition:     'last',

    /**
    * @cfg {String} colSubTotalsPosition Possible values: first, none, last
    */
    colSubTotalsPosition:       'last',

    /**
    * @cfg {String} colGrandTotalsPosition Possible values: first, none, last
    */
    colGrandTotalsPosition:     'last',

    /**
    * @cfg {String} textTotalTpl Configure the template for the group total. (i.e. '{name} ({rows.length} items)')
    * @cfg {String}           textTotalTpl.groupField         The field name being grouped by.
    * @cfg {String}           textTotalTpl.name               Group name
    * @cfg {Ext.data.Model[]} textTotalTpl.rows               An array containing the child records for the group being rendered.
    */
    textTotalTpl:               'Total ({name})',

    /**
    * @cfg {String} textGrandTotalTpl Configure the template for the grand total.
    */
    textGrandTotalTpl:          'Grand total',

    /**
    * @cfg {Array} leftAxis Define the left axis used by the grid. Each item of the array
    * is a configuration object used to instantiate a {Mz.aggregate.dimension.Item}.
    * 
#Example usage:#

        leftAxis: [{
            width:      80,         // column width in the grid
            dataIndex:  'person',   // field used for extracting data from the store
            header:     'Persons',  // column title
            direction:  'ASC',      // sort values ascending
            renderer: function(v){
                return v;           // do your own stuff here
            }                       // grid cell renderer
        },{
            width:      90,
            dataIndex:  'quarter',
            header:     'Quarter'
        },{
            width:      90,
            dataIndex:  'product',
            header:     'Products'
        }]

    */
    leftAxis:           null,

    /**
    * @cfg {Array} topAxis Define the top axis used by the pivot grid. Each item of the array
    * is a configuration object used to instantiate a {Mz.aggregate.dimension.Item}.
    * 
#Example usage:#

        topAxis: [{
            dataIndex:  'city',     // field used for extracting data from the store
            direction:  'ASC'       // sort values ascending
            renderer: function(v){
                return v;           // do your own stuff here
            }                       // grid cell renderer
        }]
        
    * 
    */
    topAxis:            null,

    /**
    * @cfg {Array} aggregate Define the fields you want to aggregate in the pivot grid. 
    * You can have one or multiple fields. Each item of the array
    * is a configuration object used to instantiate a {Mz.aggregate.dimension.Item}.
    * 
#Example usage:#

        aggregate: [{
            dataIndex:  'value',        // what field is aggregated
            header:     'Total',        // column title
            aggregator: 'sum',          // function used for aggregating
            align:      'right',        // grid cell alignment
            width:      100,            // column width
            renderer:   '0'             // grid cell renderer
        },{
            measure:    'quantity',
            header:     'Quantity',
            aggregator: function(records, measure, matrix, rowGroupKey, colGroupKey){
                // provide your own aggregator function
                return records.length;
            },
            align:      'right',
            width:      80,
            renderer:   '0'             // grid cell renderer
        }]
        
    * 
    */
    aggregate:          null,
    
    /**
    * @cfg {String} clsGroupTotal CSS class assigned to the group totals.
    */
    clsGroupTotal:      Ext.baseCSSPrefix + 'grid-group-total',

    /**
    * @cfg {String} clsGrandTotal CSS class assigned to the grand totals.
    */
    clsGrandTotal:      Ext.baseCSSPrefix + 'grid-grand-total',
    
    /**
    * @cfg {Boolean} startRowGroupsCollapsed Should the row groups be expanded on first init?
    * 
    */
    startRowGroupsCollapsed: true,
    
    /**
    * @cfg {Boolean} startColGroupsCollapsed Should the col groups be expanded on first init?
    * 
    */
    startColGroupsCollapsed: true,
    
    /**
    * @cfg {Boolean} showZeroAsBlank Should 0 values be displayed as blank?
    * 
    */
    showZeroAsBlank: false,
    
    stateEvents: [
        'pivotgroupexpand', 'pivotgroupcollapse', 'pivotdone'
    ],
    
    /**
    * @private
    */
    initComponent : function(){
        var me = this;
        
        me.columns = [];

        me.preInitialize();
        me.callParent(arguments);
        me.postInitialize();
    },
    
    /***
    * @private
    * 
    */
    preInitialize: function(){
        var me = this,
            extjsVersion = Ext.getVersion('extjs'),
            feature = {
                id:                 'group',
                ftype:              '',
                summaryRowCls:      me.clsGroupTotal,
                grandSummaryRowCls: me.clsGrandTotal
            }, ftype;
        
        me.features = [];
        if (extjsVersion.match('4.1')) {
            ftype = 'pivotview41';
        }else if (extjsVersion.match('4.2')) {
            ftype = 'pivotview42';
        }else if (extjsVersion.isGreaterThanOrEqual && extjsVersion.isGreaterThanOrEqual(5.0)) {
            ftype = 'pivotview50';
        }
        if(ftype){
            feature.ftype = ftype;
            me.features.push(feature);
        }

        /*
            In v3 the store doesn't have to be provided to the grid directly.
            Put this inside the matrix config instead.
        */
        if(me.store){
            me.originalStore = me.store;
        }
        
        // create a grid store that will be reconfigured whenever the matrix store changes
        me.store = Ext.create('Ext.data.ArrayStore', {
            fields: []
        });
        
        me.enableColumnMove = false;
        
        me.delayedTask = new Ext.util.DelayedTask(me.refreshView, me);
    },
    
    /**
    * @private
    */
    postInitialize: function(){
        var me = this,
            matrixConfig = {},
            headerListener = {
                headerclick:    me.onHeaderClick,
                scope:          me,
                destroyable:    true
            };
        
        if(me.enableLocking){
            me.lockedHeaderCtListeners = me.getView().lockedView.getHeaderCt().on(headerListener);
            me.headerCtListeners = me.getView().normalView.getHeaderCt().on(headerListener);
        }else{
            me.headerCtListeners = me.getView().getHeaderCt().on(headerListener);
        }
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                /**
                * Fires when the matrix starts processing the records.
                * 
                * @event pivotstart
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'pivotstart',
                
                /**
                * Fires during records processing.
                * 
                * @event pivotprogress
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Integer} index Current index of record that is processed
                * @param {Integer} total Total number of records to process
                */
                'pivotprogress',

                /**
                * Fires when the matrix finished processing the records
                * 
                * @event pivotdone
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                */
                'pivotdone',

                /**
                * Fires after the matrix built the store model.
                * 
                * @event pivotmodelbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} model The built model
                */
                'pivotmodelbuilt',

                /**
                * Fires after the matrix built the columns.
                * 
                * @event pivotcolumnsbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} columns The built columns
                */
                'pivotcolumnsbuilt',

                /**
                * Fires after the matrix built a pivot store record.
                * 
                * @event pivotrecordbuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Model} record The built record
                */
                'pivotrecordbuilt',

                /**
                * Fires before grand total records are created in the pivot store.
                * Push additional objects to the array if you need to create additional grand totals.
                * 
                * @event pivotbuildtotals
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Array} totals Array of objects that will be used to create grand total records in the pivot store. Each object should have:
                * @param {String} totals.title Name your grand total
                * @param {Object} totals.values Values used to generate the pivot store record
                */
                'pivotbuildtotals',

                /**
                * Fires after the matrix built the pivot store.
                * 
                * @event pivotstorebuilt
                * @param {Mz.aggregate.matrix.Abstract} matrix Reference to the Matrix object
                * @param {Ext.data.Store} store The built store
                */
                'pivotstorebuilt',
                
                /**
                * Fires when a pivot group is expanded. Could be a row or col pivot group.
                * @event pivotgroupexpand
                * @param {String} type  Either 'row' or 'col'
                * @param {Mz.aggregate.axis.Item} group The axis item
                */
                'pivotgroupexpand',
                
                /**
                * Fires when a pivot group is collapsed. Could be a row or col pivot group.
                * @event pivotgroupcollapse
                * @param {String} type  Either 'row' or 'col'
                * @param {Mz.aggregate.axis.Item} group The axis item
                */
                'pivotgroupcollapse',
                
                /**
                * Fires when a mouse click is detected on a pivot group element.
                * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * Return false if you want to prevent expanding/collapsing that group.
                * 
                * @event pivotgroupclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupclick',

                /**
                * Fires when a mouse double click is detected on a pivot group element.
                * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotgroupdblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupdblclick',

                /**
                * Fires when a mouse right click is detected on a pivot group element.
                * The pivot group element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotgroupcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot group cell.
                * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotgroupcellclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcellclick',

                /**
                * Fires when a mouse double click is detected on a pivot group cell.
                * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotgroupcelldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcelldblclick',

                /**
                * Fires when a mouse right click is detected on a pivot group cell.
                * The pivot group cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotgroupcellcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotgroupcellcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot item element.
                * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotitemclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemclick',

                /**
                * Fires when a mouse double click is detected on a pivot item element.
                * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotitemdblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemdblclick',

                /**
                * Fires when a mouse right click is detected on a pivot item element.
                * The pivot item element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivotitemcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot item cell.
                * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotitemcellclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcellclick',

                /**
                * Fires when a mouse double click is detected on a pivot item cell.
                * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotitemcelldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcelldblclick',

                /**
                * Fires when a mouse right click is detected on a pivot item cell.
                * The pivot item cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivotitemcellcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivotitemcellcontextmenu',
                
                /**
                * Fires when a mouse click is detected on a pivot grand total element.
                * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivottotalclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalclick',

                /**
                * Fires when a mouse double click is detected on a pivot grand total element.
                * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivottotaldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotaldblclick',

                /**
                * Fires when a mouse right click is detected on a pivot grand total element.
                * The pivot grand total element is the one that belongs to the columns generated for the left axis dimensions.
                * 
                * @event pivottotalcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcontextmenu',

                /**
                * Fires when a mouse click is detected on a pivot grand total cell.
                * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivottotalcellclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcellclick',

                /**
                * Fires when a mouse double click is detected on a pivot grand total cell.
                * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivottotalcelldblclick
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcelldblclick',

                /**
                * Fires when a mouse double click is detected on a pivot grand total cell.
                * The pivot total cell is the one that belongs to the columns generated for the top axis dimensions.
                * 
                * @event pivottotalcellcontextmenu
                * @param {Object} params Object with following configuration
                * @param {Mz.pivot.Grid} params.grid Pivot grid instance
                * @param {Ext.view.Table} params.view Grid view
                * @param {HTMLElement} params.cellEl The target of the event
                * @param {String} params.leftKey Key of the left axis item
                * @param {String} params.topKey Key of the top axis item
                * @param {String} params.dimensionId Id of the aggregate dimension
                * @param {String} params.columnId Id of the column header
                * @param {Ext.grid.column.Column} params.column Column header object
                * @param {Ext.EventObject} e Event object
                */
                'pivottotalcellcontextmenu'
            );
        }
        
        Ext.apply(matrixConfig, {
            leftAxis:               me.leftAxis,
            topAxis:                me.topAxis,
            aggregate:              me.aggregate,
            showZeroAsBlank:        me.showZeroAsBlank,
            textTotalTpl:           me.textTotalTpl,
            textGrandTotalTpl:      me.textGrandTotalTpl,
            viewLayoutType:         me.viewLayoutType,
            rowSubTotalsPosition:   me.rowSubTotalsPosition,
            rowGrandTotalsPosition: me.rowGrandTotalsPosition,
            colSubTotalsPosition:   me.colSubTotalsPosition,
            colGrandTotalsPosition: me.colGrandTotalsPosition
        });
        
        Ext.applyIf(matrixConfig, me.matrixConfig || {});
        Ext.applyIf(matrixConfig, {
            mztype: 'local'
        });
        // just a bit of hardcoding for old version compatibility
        if(matrixConfig.mztype == 'local' && me.originalStore){
            Ext.applyIf(matrixConfig, {
                store: me.originalStore
            });
        }
        
        me.matrix = Ext.createByAlias('pivotmatrix.' + matrixConfig.mztype, matrixConfig);
        
        me.matrixListeners = me.matrix.on({
            cleardata:      me.onMatrixClearData,
            start:          me.onMatrixProcessStart,
            progress:       me.onMatrixProcessProgress,
            done:           me.onMatrixDataReady,
            beforeupdate:   me.onMatrixBeforeUpdate,
            afterupdate:    me.onMatrixAfterUpdate,
            scope:          me,
            destroyable:    true
        });
        
        me.matrixRelayedListeners = me.relayEvents(me.matrix, ['start', 'progress', 'done', 'modelbuilt', 'columnsbuilt', 'recordbuilt', 'buildtotals', 'storebuilt'], 'pivot');
    },
    
    destroy: function(){
        var me = this;

        me.delayedTask.cancel();
        Ext.destroy(me.matrixRelayedListeners, me.matrixListeners, me.headerCtListeners, me.lockedHeaderCtListeners);
        Ext.destroy(me.matrix, me.delayedTask, me.originalStore);
        
        me.callParent();
    },
    
    afterRender: function(){
        var me = this;
        
        me.reconfigurePivot();
        
        me.callParent(arguments);
    },
    
    /**
    * @private
    * Refresh the view.
    */
    refreshView: function(){
        var me = this,
            store,
            columns;
        
        if(me.scheduledReconfigure === true){
            me.scheduledReconfigure = false;
            columns = me.getMatrix().getColumnHeaders();
            me.preparePivotColumns(columns);
            me.restorePivotColumnsState(columns);
            me.reconfigure(undefined, columns);
        }
        me.store.fireEvent('pivotstoreremodel', me);
    },
    
    /**
    * @private
    * 
    */
    onMatrixClearData: function(){
        var me = this;
        
        me.store.removeAll(true);
        if(!me.expandedItemsState){
            me.lastColumnsState = null;
        }
    },
    
    /**
    * @private
    * 
    */
    onMatrixProcessStart: function(){
        var me = this;
        
        me.startTime = Ext.Date.now();
        if(me.debugMode){
            Ext.log('Matrix process started');
        }
        if (me.enableLoadMask) {
            me.setLoading(true);
        }
    },
    
    /**
    * @private
    * 
    */
    onMatrixProcessProgress: function(matrix, index, length){
        var me = this,
            pEl, percent = ((index || 0.1) * 100)/(length || 0.1);
        
        if(me.loadMask){
            if(me.loadMask.msgTextEl){
                pEl = me.loadMask.msgTextEl;
            }else if(me.loadMask.msgEl){
                pEl = me.loadMask.msgEl;
            }

            if(pEl){
                pEl.update(Ext.util.Format.number(percent, '0')  + '%');
            }
        }
    },
    
    /**
    * @private
    * 
    */
    onMatrixBeforeUpdate: function(){
        /*
        * Auto update of html elements when a record is updated doesn't work on ExtJS 5
        * because the pivot grid uses an outerTpl which add table cols to each grid row
        * and this messes up the logic in Ext.view.Table.handleUpdate function.
        * The workaround is to suspend events on the grid store before updating the matrix
        * and resume events after all store records were update.
        * As a final step the grid is refreshed.
        */
        this.store.suspendEvents();
    },
    
    /**
    * @private
    * 
    */
    onMatrixAfterUpdate: function(){
        var me = this;
        
        me.store.resumeEvents();
        me.store.fireEvent('pivotstoreremodel');
    },
    
    /**
    * @private
    * 
    */
    onMatrixDataReady: function(){
        var me = this,
            cols = me.matrix.getColumnHeaders(),
            stateApplied = false;
        
        if (me.enableLoadMask) {
            me.setLoading(false);
        }
        
        if(me.expandedItemsState){
            me.matrix.leftAxis.items.each(function(item){
                if(Ext.Array.indexOf(me.expandedItemsState['rows'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            
            me.matrix.topAxis.items.each(function(item){

                if(Ext.Array.indexOf(me.expandedItemsState['cols'], item.key) >= 0){
                    item.expanded = true;
                    stateApplied = true;
                }
            });
            
            if(stateApplied){
                cols = me.matrix.getColumnHeaders(),
                delete me.expandedItemsState;
            }
            
        }else{
            me.doExpandCollapseTree(me.matrix.leftAxis.getTree(), !me.startRowGroupsCollapsed);
            me.doExpandCollapseTree(me.matrix.topAxis.getTree(), !me.startColGroupsCollapsed);
            cols = me.matrix.getColumnHeaders();
        }
        
        me.preparePivotColumns(cols);
        me.restorePivotColumnsState(cols);

        me.reconfigure(undefined, cols);
        me.store.fireEvent('pivotstoreremodel', me);
                 
        if(me.debugMode){
            Ext.log('Matrix process ended in ' + (Ext.Date.now() - me.startTime) + 'ms');
        }
    },
    
    /**
    * @private
    *
    * Prepare columns delivered by the Matrix to be used inside the grid panel
    * 
    * @param columns
    */
    preparePivotColumns: function(columns){
        var me = this,
            defaultColConfig = {
                menuDisabled:   true,
                sortable:       false,
                lockable:       false
            }, 
            colCount = columns.length,
            i, column;
        
        for(i = 0; i < colCount; i++){
            column = columns[i];
            column.cls = column.cls || '';
            
            Ext.apply(column, defaultColConfig);
            
            if(column.leftAxis){
                column.locked = me.enableLocking;
            }//else leave it as it is
            
            if(column.subTotal){
                column.cls = column.tdCls = me.clsGroupTotal;
            }
            if(column.grandTotal){
                column.cls = column.tdCls = me.clsGrandTotal;
            }
            
            if(!column.xexpanded){
                column.cls += ' ' + Ext.baseCSSPrefix + 'grid-row-collapsed';
            }
            if(column.xcollapsible){
                column.text = Ext.String.format('<span class="' + Ext.baseCSSPrefix + 'grid-row-expander" style="padding-left: 13px">{0}</span>', column.text);
            }
            
            if(Ext.isEmpty(column.columns)){
                if(column.dimension){
                    column.renderer = (column.dimension && !column.leftAxis) ? column.dimension.renderer : false;
                    column.align = column.dimension.align;
                    if(column.dimension.flex > 0){
                        column.flex = column.dimension.flex;
                    }else{
                        column.width = column.dimension.width;
                    }
                }
            }else{
                me.preparePivotColumns(column.columns);
            }
        }
    },
    
    /**
    * If you want to reconfigure the pivoting parameters then use this function.
    * If you use a local matrix then send the new store here too.
    * The config object is used to reconfigure the matrix object.
    * 
    * @param config
    */
    reconfigurePivot: function(config){
        var me = this,
            props = Ext.clone(me.getStateProperties()),
            i;
        
        props.push('startRowGroupsCollapsed', 'startColGroupsCollapsed', 'showZeroAsBlank');
        
        config = config || {};
        
        for(i = 0; i < props.length; i++){
            if(!config.hasOwnProperty(props[i])){
                if(me[props[i]]){
                    config[props[i]] = me[props[i]];
                }
            }else{
                me[props[i]] = config[props[i]];
            }
        }

        me.getMatrix().reconfigure(config);
    },
    
    /**
    * Returns the matrix object that does all calculations
    * @returns {Mz.aggregate.matrix.Abstract}
    * 
    */
    getMatrix: function(){
        return this.matrix;
    },
    
    /**
    * Collapse or expand the Matrix tree items.
    */
    doExpandCollapseTree: function(tree, expanded){
        var i;
        
        for(i = 0; i < tree.length; i++){
            tree[i].expanded = expanded;
            if(tree[i].children){
                this.doExpandCollapseTree(tree[i].children, expanded);
            }
        }
    },
    
    /**
    * @private
    *
    *   Expand or collapse the specified group. 
    *   If no "state" is provided then toggle the expanded property
    */
    doExpandCollapse: function(type, groupId, state){
        var me = this,
            item;
        
        if(!me.matrix){
            // nothing to do
            return;
        }
        
        item = (type == 'row' ? me.matrix.leftAxis : me.matrix.topAxis)['findTreeElement']('key', groupId);
        if(!item){
            return;
        }
        
        item.node.expanded = Ext.isDefined(state) ? state : !item.node.expanded;
        if(type == 'col'){
            me.scheduledReconfigure = true;
        }
        me.refreshView();

        // fire the pivotgroupexpand or pivotgroupcollapse event
        me.fireEvent((item.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), me, type, item.node);
    },
    
    /**
    * Expand the specified row group
    */
    expandRow: function(groupId){
        this.doExpandCollapse('row', groupId, true);
    },
    
    /**
    * Collapse the specified row group
    */
    collapseRow: function(groupId){
        this.doExpandCollapse('row', groupId, false);
    },
    
    /**
    * Expand the specified col group
    */
    expandCol: function(groupId){
        this.doExpandCollapse('col', groupId, true);
    },
    
    /**
    * Collapse the specified col group
    */
    collapseCol: function(groupId){
        this.doExpandCollapse('col', groupId, false);
    },
    
    /**
    * Expand all groups.
    * 
    */
    expandAll: function(){
        var me = this;
        
        me.expandAllColumns();
        me.expandAllRows();
    },
    
    /**
    * Expand all row groups
    * 
    */
    expandAllRows: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), true);
        me.delayedTask.delay(10);
    },
    
    /**
    * Expand all column groups
    * 
    */
    expandAllColumns: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), true);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },
    
    /**
    * Collapse all groups.
    * 
    */
    collapseAll: function(){
        var me = this;
        
        me.collapseAllRows();
        me.collapseAllColumns();
    },
    
    /**
    * Collapse all row groups
    * 
    */
    collapseAllRows: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), false);
        me.delayedTask.delay(10);
    },
    
    /**
    * Collapse all column groups
    * 
    */
    collapseAllColumns: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), false);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },

    /**
    *     Returns the original store with the data to process.
    *    @returns {Ext.data.Store}
    */
    getStore: function(){
        var me = this,
            matrix = me.getMatrix();
        
        return ( (matrix instanceof Mz.aggregate.matrix.Local) ? matrix.store : me.originalStore ) || me.store;
    },
    
    /**
    *    Returns the pivot store with the aggregated values
    *    @returns {Ext.data.Store}
    */
    getPivotStore: function(){
        return this.store;
    },
    
    /**
    * @private
    */
    onHeaderClick: function(ct, column, e){
        var me = this, 
            columns, el,
            sortState = (column.sortState ? (column.sortState == 'ASC' ? 'DESC' : 'ASC') : 'ASC');
        
        if(!column.xexpandable) {
            if(e) {
                e.stopEvent();
            }

            if((column.leftAxis || column.topAxis) && !Ext.isEmpty(column.dataIndex)){
                // sort the results when a dataIndex column was clicked
                if(me.getMatrix().leftAxis.sortTreeByField(column.dataIndex, sortState )){
                    me.refreshView();

                    if (Ext.getVersion('extjs').match(5.0)) {
                        column.setSortState(new Ext.util.Sorter({direction: sortState, property: 'dummy'}));
                        column.sortState = sortState;
                    }else{
                        column.setSortState(sortState, false, true);
                    }
                }
            }

            return false;
        }

        me.doExpandCollapse('col', column.key);

        if(e) e.stopEvent();
    },

    
    getStateProperties: function(){
        return ['viewLayoutType', 'rowSubTotalsPosition', 'rowGrandTotalsPosition', 'colSubTotalsPosition', 'colGrandTotalsPosition', 'aggregate', 'leftAxis', 'topAxis'];
    },
    
    /**
    * Applies the saved state of the pivot grid
    */
    applyState: function(state){
        var me = this,
            props = me.getStateProperties(),
            i;
        
        for(i = 0; i < props.length; i++){
            if(state[props[i]]){
                me[props[i]] = state[props[i]];
            }
        }
        
        if(state['expandedItems']){
            me.expandedItemsState = state['expandedItems'];
        }
        
        me.lastColumnsState = state['pivotcolumns'] || {};
        
        if(me.rendered){
            me.reconfigurePivot();
        }
    },
    
    /**
    *    Get the current state of the pivot grid. 
    *    Be careful that the stateful feature won't work correctly in this cases:
    *    - if you provide an aggregator function to the aggregate item then this won't be serialized. 
    *        You could extend {Mz.aggregate.Aggregators} to add your own function
    *    - if you provide a renderer function then this won't be serialized. You need to provide a formatting string instead.
    */
    getState: function(){
        var me = this,
            state = {},
            props = me.getStateProperties(),
            i;
        
        for(i = 0; i < props.length; i++){
            state[props[i]] = me[props[i]];
        }
        
        // save the state of all expanded axis groups
        state['expandedItems'] = {
            cols:   [],
            rows:   []
        };
        
        me.matrix.leftAxis.items.each(function(item){
            if(item.expanded){
                state['expandedItems']['rows'].push(item.key);
            }
        });
        
        me.matrix.topAxis.items.each(function(item){
            if(item.expanded){
                state['expandedItems']['cols'].push(item.key);
            }
        });
        
        // to be able to restore the width/flex of the left axis columns we need the IDs
        me.matrix.leftAxis.dimensions.each(function(item, index){
            state['leftAxis'][index]['id'] = item.getId();
        });
        
        state['pivotcolumns'] = me.getPivotColumnsState();
        
        return state;
    },
    
    /**
    * @private
    */
    getPivotColumnsState: function(){
        var me = this,
            i, cols;
        
        if(!me.lastColumnsState){
            cols = me.getDataIndexColumns(me.getMatrix().getColumnHeaders());
            me.lastColumnsState = {};
            
            for(i = 0; i < cols.length; i++){
                if(cols[i].dataIndex){
                    me.lastColumnsState[cols[i].dataIndex] = {
                        width:  cols[i].width,
                        flex:   cols[i].flex || 0
                    };
                }
            }
        }
        
        cols = me.getView().getGridColumns();
        for(i = 0; i < cols.length; i++){
            if(cols[i].dataIndex){
                me.lastColumnsState[cols[i].dataIndex] = {
                    width:  cols[i].rendered ? cols[i].getWidth() : cols[i].width,
                    flex:   cols[i].flex || 0
                };
            }
        }
        
        return me.lastColumnsState;
    },

    /**
    * @private
    */
    getDataIndexColumns: function(columns){
        var cols = [], i;
        
        for(i = 0; i < columns.length; i++){
            if(columns[i].dataIndex){
                cols.push(columns[i].dataIndex);
            }else if (Ext.isArray(columns[i].columns)){
                cols = Ext.Array.merge(cols, this.getDataIndexColumns(columns[i].columns));
            }
        }
        
        return cols;
    },
    
    /**
    * @private
    */
    restorePivotColumnsState: function(columns){
        var me = this,
            //state = fromState ? me.lastPivotColumnsState || me.getPivotColumnsState() : me.getPivotColumnsState(),
            state = me.getPivotColumnsState(),
            parseColumns;
            
        parseColumns = function(columns){
            var item, i;
            
            if(!columns){
                return;
            }
            for(i = 0; i < columns.length; i++){
                item = state[columns[i].dataIndex];
                if(item){
                    if(item.flex){
                        columns[i].flex = item.flex;
                    }else if(item.width){
                        columns[i].width = item.width;
                    }
                }
                parseColumns(columns[i].columns);
            }
        };
        
        parseColumns(columns);
    }
    
});


/**
 * This should be subclassed in order to implement different export types.
 * It prepares the pivot data though.
 */
Ext.define('Mz.pivot.dataexport.Formatter', {
    /**
    * Which nodes should be exported? All of them or just the ones that are expanded?
    * 
    * @type Boolean
    */
    onlyExpandedNodes:  false,

    matrix:             null,
    config:             null,
    data:               null,

    /**
    *   Pass the data object generated by matrix.prepareDataForExport
    */
    constructor: function(config){
        var me = this;
        
        config = config || {};
        
        me.matrix = config.matrix;
        me.onlyExpandedNodes = config.onlyExpandedNodes;
        me.config = config.config;
        
        // format the data for export
        me.data = me.prepareData();
    },

    /**
     * Performs the actual formatting. This must be overridden by a subclass
     */
    format: Ext.emptyFn,
    
    /**
    * Prepare data for export.
    * 
    */
    prepareData: function(){
        var me = this,
            matrix = me.matrix,
            group, columns, headers, record, i, dataIndexes;
        
        if(!me.onlyExpandedNodes){
            me.setColumnsExpanded(matrix.topAxis.getTree(), true);
        }

        columns = Ext.clone(matrix.getColumnHeaders());
        headers = me.getColumnHeaders(columns, 0);
        dataIndexes = me.getDataIndexColumns(columns);

        if(!me.onlyExpandedNodes){
            me.setColumnsExpanded(matrix.topAxis.getTree());
        }
        
        group = me.extractGroups(matrix.leftAxis.getTree(), dataIndexes);
        
        Ext.apply(group, {
            columns:        headers,
            summary:        [],
            summaryText:    matrix.textGrandTotalTpl
        });
        
        record = matrix.preparePivotStoreRecordData({key: matrix.grandTotalKey});
        for(i = 0; i < dataIndexes.length; i++){
            group.summary.push(record[dataIndexes[i]] || '');
        }

        return group;
    },
    
    /**
    * @private
    * If we have to export everything then expand all top axis tree nodes temporarily
    * 
    * @param items
    * @param expanded
    */
    setColumnsExpanded: function(items, expanded){
        for(var i = 0; i < items.length; i++){
            if(Ext.isDefined(expanded)){
                items[i].backupExpanded = items[i].expanded;
                items[i].expanded = expanded;
            }else{
                items[i].expanded = items[i].backupExpanded;
                items[i].backupExpanded = null;
            }
            
            if(items[i].children){
                this.setColumnsExpanded(items[i].children, expanded);
            }
        }
    },
    
    /**
    * @private
    * Returns an array of column headers to be used in the export file
    * 
    * @param columns
    * @param level
    * 
    * @returns {Array}
    */
    getColumnHeaders: function(columns, level){
        var cols = [], i, obj;
        
        for(i = 0; i < columns.length; i++){
            obj = {
                text:   columns[i].text,
                level:  level
            };
            
            if(columns[i].columns){
                obj.columns = this.getColumnHeaders(columns[i].columns, level + 1);
            }
            cols.push(obj);
        }
        
        return cols;
    },
    
    /**
    * @private
    * Find all columns that have a dataIndex
    * 
    * @param columns
    * 
    * @returns {Array}
    */
    getDataIndexColumns: function(columns){
        var cols = [], i;
        
        for(i = 0; i < columns.length; i++){
            if(columns[i].dataIndex){
                cols.push(columns[i].dataIndex);
            }else if (Ext.isArray(columns[i].columns)){
                cols = Ext.Array.merge(cols, this.getDataIndexColumns(columns[i].columns));
            }
        }
        
        return cols;
    },
    
    /**
    * @private
    * Extract data from left axis groups.
    * 
    * @param items
    * @param columns
    * 
    * @returns {Object}
    */
    extractGroups: function(items, columns){
        var me = this,
            group = {},
            i, j, doExtract, item, row, record;
        
        for(i = 0; i < items.length; i++){
            item = items[i];
            
            if(item.record){
                group.rows = group.rows || [];
                
                row = [];
                for(j = 0; j < columns.length; j++){
                    row.push(item.record.get(columns[j]) || '');
                }
                group.rows.push(row);
                
            }else if(item.children){
                group.groups = group.groups || [];
                row = {};
                
                doExtract = me.onlyExpandedNodes ? item.expanded : true;
                if(doExtract){
                    row = me.extractGroups(item.children, columns);
                }

                Ext.apply(row, {
                    summary:        [],
                    summaryText:    item.getTextTotal(),
                    text:           item.name
                });
                
                record = me.matrix.preparePivotStoreRecordData(item);
                for(j = 0; j < columns.length; j++){
                    row.summary.push(record[columns[j]] || '');
                }
                
                group.groups.push(row);
            }
            
        }
        
        return group;
    }
    
    
});
/**
*   Class used to create an Excel cell
*/
Ext.define('Mz.pivot.dataexport.excel.Cell', {
    constructor: function (config) {
        Ext.applyIf(config, {
            type:   "String",
            style:  'Default'
        });

        Ext.apply(this, config);
    },

    render: function () {
        return this.tpl.apply(this);
    },

    tpl: new Ext.XTemplate(
        '<ss:Cell ss:MergeAcross="{merge}" <tpl if="style">ss:StyleID="{style}"</tpl>>',
            '<ss:Data ss:Type="{type}">',
                '<tpl switch="type">',
                    '<tpl case="String">',
                        '{[this.formatString(values.value)]}',
                    '<tpl default>',
                        '{value}',
                '</tpl>',
            '</ss:Data>',
        '</ss:Cell>', {
            formatString: Ext.String.htmlEncode
        }
    )
});
/**
*   Class used to create an Excel style
*/
Ext.define('Mz.pivot.dataexport.excel.Style', {
    constructor: function (config) {
        var me = this;
        
        config = config || {};

        Ext.apply(me, config, {
            parentStyle:    '',
            attributes:     []
        });

        if (!Ext.isDefined(me.id)) throw new Error("An ID must be provided to Style");

        me.preparePropertyStrings();
    },

    /**
     * Iterates over the attributes in this style, and any children they may have, creating property
     * strings on each suitable for use in the XTemplate
     */
    preparePropertyStrings: function () {
        var me = this;
        
        Ext.each(me.attributes, function (attr, index) {
            this.attributes[index].propertiesString = this.buildPropertyString(attr);
            this.attributes[index].children = attr.children || [];

            Ext.each(attr.children, function (child, childIndex) {
                this.attributes[index].children[childIndex].propertiesString = this.buildPropertyString(child);
            }, this);
        }, me);
    },

    /**
     * Builds a concatenated property string for a given attribute, suitable for use in the XTemplate
     */
    buildPropertyString: function (attribute) {
        var me = this,
            propertiesString = "";

        Ext.each(attribute.properties || [], function (property) {
            propertiesString += Ext.String.format('ss:{0}="{1}" ', property.name, property.value);
        }, me);

        return propertiesString;
    },

    render: function () {
        var me = this;
        
        return me.tpl.apply(me);
    },

    tpl: new Ext.XTemplate(
        '<tpl if="parentStyle.length == 0">',
            '<ss:Style ss:ID="{id}">',
        '</tpl>',
        '<tpl if="parentStyle.length != 0">',
            '<ss:Style ss:ID="{id}" ss:Parent="{parentStyle}">',
        '</tpl>',
        '<tpl for="attributes">',
            '<tpl if="children.length == 0">',
                '<ss:{name} {propertiesString} />',
            '</tpl>',
            '<tpl if="children.length &gt; 0">',
                '<ss:{name} {propertiesString}>',
                    '<tpl for="children">',
                        '<ss:{name} {propertiesString} />',
                    '</tpl>',
                '</ss:{name}>',
            '</tpl>',
        '</tpl>',
        '</ss:Style>'
    )
});
/**
*   Class used to create an Excel workbook
*/
Ext.define('Mz.pivot.dataexport.excel.Workbase', {
    
               
                        
                                         
      
    
    constructor: function (config) {
        var me = this;
        
        config = Ext.clone(config || {});
        
        Ext.apply(me, config, {
            /**
             * @cfg title
             * @type String
             * The title of the workbook
             */
            title: "Workbook",

            /**
             * @cfg cellFontName
             * @type String
             * The default font name used in the workbook. This is applied when {hasDefaultStyle} is true.
             */
            cellFontName: "Arial",

            /**
             * @cfg cellFontSize
             * @type String
             * The default font size used in the workbook. This is applied when {hasDefaultStyle} is true.
             */
            cellFontSize: "10",

            /**
             * @cfg cellBorderColor
             * @type String
             * The colour of border to use for each Cell
             */
            cellBorderColor: "#E4E4E4",

            /**
             * @cfg cellFillColor
             * @type String
             * The fill colour of each summary Cell
             */
            cellFillColor: "",

            /**
             * @cfg titleFontSize
             * @type String
             * Font size used for the table title
             */
            titleFontSize: "14",

            /**
             * @cfg titleFillColor
             * @type String
             * Fill folor used for the table title
             */
            titleFillColor: "",

            /**
            * @cfg dateFormat
            * @type String
            * Default format used for the date values
            */
            dateFormat:     'Short Date',

            /**
            * @cfg numberFormat
            * @type String
            * Default format used for the number values
            */
            numberFormat:   'Standard',
            
            /**
             * @property styles
             * @type Array
             * The array of Mz.pivot.dataexport.excel.Style objects attached to this object
             */
            styles: [],

            /**
             * @property compiledStyles
             * @type Array
             * Array of all rendered Mz.pivot.dataexport.excel.Style objects for this object
             */
            compiledStyles: []            
        });
    },
    
    /**
     * Adds a new Mz.pivot.dataexport.excel.Style to this Workbook
     * @param {Object} config The style config, passed to the Style constructor (required)
     */
    addStyle: function (config) {
        var me = this,
            style = Ext.create('Mz.pivot.dataexport.excel.Style', config || {});

        me.styles.push(style);

        return style;
    },

    /**
    * @private
    * 
    * @param fillColor
    */
    getInteriorStyle: function(fillColor){
        var style = {
            name: "Interior"
        };
        
        if(!Ext.isEmpty(fillColor)){
            style.properties = [
                { name: "Pattern", value: "Solid" },
                { name: "Color", value: fillColor }
            ];
        }
        
        return style;
    }

    
});
/**
*   Class used to create an Excel worksheet
*/
Ext.define('Mz.pivot.dataexport.excel.Worksheet', {
    extend:  Mz.pivot.dataexport.excel.Workbase ,

    constructor: function (config) {
        var me = this;
        
        me.callParent(arguments);

        Ext.applyIf(me, {
            /**
             * @cfg showTitle
             * @type Boolean
             * Show or hide the title
             */
            showTitle: true,
            
            /**
             * @cfg groupHeaderFontSize
             * @type String
             * Font size applied to the summary group header cells
             */
            groupHeaderFontSize: "10",

            /**
             * @cfg groupHeaderFillColor
             * @type String
             * Fill folor used for the summary group header cells
             */
            groupHeaderFillColor: "#D8D8D8",

            /**
             * @cfg groupFooterFontSize
             * @type String
             * Font size applied to the summary group footer cells
             */
            groupFooterFontSize: "10",

            /**
             * @cfg groupFooterFillColor
             * @type String
             * Fill folor used for the summary group footer cells
             */
            groupFooterFillColor: "#BFBFBF",

            columns:            me.data ? me.data.columns || [] : []
        });

        if (me.showTitle){
            me.addTitleStyle();
        }
        
    },

    worksheetTpl: new Ext.XTemplate(
        '<ss:Worksheet ss:Name="{title}">',
            '<ss:Names>',
                '<ss:NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'{title}\'!R1:R2" />',
            '</ss:Names>',
            '<ss:Table x:FullRows="1" x:FullColumns="1" ss:ExpandedColumnCount="{colCount}" ss:ExpandedRowCount="{rowCount}">',
                '{columns}',
                '<tpl if="showTitle">',
                    '<ss:Row ss:Height="38">',
                        '<ss:Cell ss:StyleID="Title" ss:MergeAcross="{colCount - 1}">',
                            '<ss:Data ss:Type="String">{title}</ss:Data>',
                            '<ss:NamedCell ss:Name="Print_Titles" />',
                        '</ss:Cell>',
                    '</ss:Row>',
                '</tpl>',
                //'<ss:Row ss:AutoFitHeight="1">',
                '{header}',
                //'</ss:Row>',
                '{rows}',
            '</ss:Table>',
            '<x:WorksheetOptions>',
                '<x:PageSetup>',
                    '<x:Layout x:CenterHorizontal="1" x:Orientation="Landscape" />',
                    '<x:Footer x:Data="Page &amp;P of &amp;N" x:Margin="0.5" />',
                    '<x:PageMargins x:Top="0.5" x:Right="0.5" x:Left="0.5" x:Bottom="0.8" />',
                '</x:PageSetup>',
                '<x:FitToPage />',
                '<x:Print>',
                    '<x:PrintErrors>Blank</x:PrintErrors>',
                    '<x:FitWidth>1</x:FitWidth>',
                    '<x:FitHeight>32767</x:FitHeight>',
                    '<x:ValidPrinterInfo />',
                    '<x:VerticalResolution>600</x:VerticalResolution>',
                '</x:Print>',
                '<x:Selected />',
                '<x:DoNotDisplayGridlines />',
                '<x:ProtectObjects>False</x:ProtectObjects>',
                '<x:ProtectScenarios>False</x:ProtectScenarios>',
            '</x:WorksheetOptions>',
        '</ss:Worksheet>'
    ),

    /**
     * Builds the Worksheet XML
     */
    render: function () {
        var me = this;
        
        me.fixColumns(me.data.columns, me.getColDepth(me.data.columns, -1));
        var rows = me.buildRows();
        
        return me.worksheetTpl.apply({
            header:     me.buildHeader(),
            columns:    '',
            rows:       rows.join(""),
            colCount:   me.getColCount(me.data.columns),
            rowCount:   rows.length + me.getColDepth(me.data.columns, 1),
            title:      me.title,
            showTitle:  me.showTitle
        });
    },

    getColCount: function(columns){
        var me = this,
            s = 0;

        if (!columns) return s;

        for (var i = 0; i < columns.length; i++) {
            if (!columns[i].columns) {
                s += 1;
            } else {
                s += me.getColCount(columns[i].columns);
            }
        }

        return s;
    },

    getColDepth: function(columns, level){
        var me = this,
            m = 0;

        if (!columns) return level;

        for (var i = 0; i < columns.length; i++) {
            m = Math.max(m, me.getColDepth(columns[i].columns, level + 1));
        }
        
        return m;
    },

    fixColumns: function (columns, depth) {
        var me = this,
            col;

        if (!columns) return;

        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            if (!col.columns && depth > col.level) {
                col.columns = [];
                col.columns.push({
                    text: '',
                    level: col.level + 1
                });
            }
            me.fixColumns(col.columns, depth);
        }
    },

    buildColumns: function () {
        var me = this,
            cols = [];

        Ext.each(me.columns, function (column) {
            cols.push(this.buildColumn());
        }, me);

        return cols;
    },

    buildColumn: function (width) {
        return String.format('<ss:Column ss:AutoFitWidth="1" ss:Width="{0}" />', width || 164);
    },

    buildRows: function () {
        var me = this,
            rows = [], cells,
            leftMerge = me.data.columns.length > 0 ? me.getColCount(me.data.columns[0].columns) : 0,
            colMerge = me.getColCount(me.data.columns),
            groups = Ext.isDefined(me.data.groups) ? me.data.groups : Ext.Array.from(me.data);
        
        me.buildSummaryRows(groups, rows, colMerge, 1);

        if(Ext.isDefined(me.data.groups) && me.data.summary.length > 0){
            me.addGroupLevelStyle(1);
            cells = [];
            cells.push(me.buildCell(me.data.summaryText, 0, 'SummaryFooter1').render());
            for (var j = 1; j < me.data.summary.length; j++) {
                cells.push(me.buildCell(me.data.summary[j], 0, 'SummaryFooter1').render());
            }
            rows.push(Ext.String.format("<ss:Row>{0}</ss:Row>", cells.join('')));
        }

        return rows;
    },

    buildSummaryRows: function (groups, rows, colMerge, level) {
        var me = this,
            g, cells;

        if (!groups) return;

        for (var i = 0; i < groups.length; i++) {
            me.addGroupLevelStyle(level);
            
            g = groups[i];
            rows.push(Ext.String.format("<ss:Row>{0}</ss:Row>", me.buildCell(g.text, colMerge - 1, 'SummaryHeader' + level, 'String').render()));

            me.buildSummaryRows(g.groups, rows, colMerge, level + 1);
            me.buildGroupRows(g.rows, rows);

            if(g.summary.length > 0){
                cells = [];
                cells.push(me.buildCell(g.summaryText, 0, 'SummaryFooter' + level, 'String').render());
                for (var j = 1; j < g.summary.length; j++) {
                    cells.push(me.buildCell(g.summary[j], 0, 'SummaryFooter' + level).render() );
                }
                rows.push(Ext.String.format("<ss:Row>{0}</ss:Row>", cells.join('')) );
            }

        }
    },
    
    buildGroupRows: function(lines, rows){
        var me = this,
            l, cells;

        if (!lines) return;

        for (var i = 0; i < lines.length; i++) {
            l = lines[i];
            cells = [];
            var style = i % 2 == 0 ? 'even' : 'odd';
            for (var j = 0; j < l.length; j++) {
                cells.push(me.buildCell(l[j], 0, me.hasDefaultStyle ? 'Default' : '').render());
            }
            rows.push(Ext.String.format("<ss:Row>{0}</ss:Row>", cells.join('') ));
        }
    },

    buildHeader: function () {
        var me = this,
            cells = [], ret = {}, s = '';
        
        me.buildHeaderRows(me.data.columns, ret);

        Ext.Object.each(ret, function (key, value, me) {
            cells.push(Ext.String.format('<ss:Row ss:AutoFitHeight="1">{0}</ss:Row>', value.join("")));
        });
        
        return cells.join("");
    },

    buildHeaderRows: function (columns, result) {
        var me = this,
            col, count, s;

        if (!columns) return;

        for (var i = 0; i < columns.length; i++) {
            col = columns[i];
            count = me.getColCount(col.columns);
            result['s' + col.level] = result['s' + col.level] || [];

            if (count === 0 || count === 1) {
                s = Ext.String.format('<ss:Cell ss:StyleID="Header"><ss:Data ss:Type="String">{0}</ss:Data><ss:NamedCell ss:Name="Print_Titles" /></ss:Cell>', col.text);
            } else {
                s = Ext.String.format('<ss:Cell ss:MergeAcross="{0}" ss:StyleID="Header"><ss:Data ss:Type="String">{1}</ss:Data><ss:NamedCell ss:Name="Print_Titles" /></ss:Cell>', count - 1, col.text);
            }

            result['s' + col.level].push(s);

            me.buildHeaderRows(col.columns, result);
        }
    },

    buildCell: function (value, merge, style, type) {
        var me = this;
            
        if(!type){
            type = me.getExcelValueType(value);
        }
            
        if (type == "DateTime") {
            value = Ext.Date.format(value, 'Y-m-d\\TH:i:s');
        }
        
        if(!Ext.isEmpty(style)){
            style += (type != 'String') ? type : '';
        }

        return Ext.create('Mz.pivot.dataexport.excel.Cell', {
            value:      value,
            type:       type,
            merge:      merge,
            style:      style
        });
    },
    
    getExcelValueType: function(v){
        return Ext.isNumeric(v) ? 'Number' : (Ext.isDate(v) ? 'DateTime' : 'String');
    },

    /**
    * Add style for the table title
    * 
    */
    addTitleStyle: function () {
        var me = this;
        
        me.addStyle({
            id: "Title",
            attributes: [
              { name: "Borders" },
              {
                  name: "Font",
                  properties: [
                    { name: "Bold", value: "1" },
                    { name: "Size", value: me.titleFontSize }
                  ]
              },
              {
                  name: "NumberFormat",
                  properties: [
                    { name: "Format", value: "@" }
                  ]
              },
              me.getInteriorStyle(me.titleFillColor),
              {
                  name: "Alignment",
                  properties: [
                    { name: "WrapText", value: "1" },
                    { name: "Horizontal", value: "Center" },
                    { name: "Vertical", value: "Center" }
                  ]
              }
            ]
        });
    },

    /**
    * Add style for the summary group
    * 
    * @param level
    */
    addSummaryStyle: function (name, level, fontSize, fillColor) {
        var me = this,
            parentStyle = name + level;
            
        me.addStyle({
            id: parentStyle,
            attributes: [
              {
                  name: "Font",
                  properties: [
                    { name: "Bold", value: "1" },
                    { name: "Size", value: fontSize }
                  ]
              },
              me.getInteriorStyle(fillColor),
              {
                  name: "Alignment",
                  properties: [
                    { name: "Indent", value: level - 1 },
                    { name: "Vertical", value: "Center" }
                  ]
              }
            ]
        });

        me.addStyle({
            id: parentStyle + 'Number',
            parentStyle: parentStyle,
            attributes: [
              {
                  name: "NumberFormat",
                  properties: [{ name: "Format", value: me.numberFormat }]
              },
              {
                  name: "Alignment",
                  properties: [
                    { name: "Horizontal", value: "Right" }
                  ]
              }
            ]
        });

        me.addStyle({
            id: parentStyle + 'DateTime',
            parentStyle: parentStyle,
            attributes: [
              {
                  name: "NumberFormat",
                  properties: [{ name: "Format", value: me.dateFormat }]
              },
              {
                  name: "Alignment",
                  properties: [
                    { name: "Horizontal", value: "Right" }
                  ]
              }
            ]
        });

        me.addStyle({
            id: parentStyle + 'String',
            parentStyle: parentStyle,
            attributes: [
              {
                  name: "Alignment",
                  properties: [
                    { name: "Horizontal", value: "Left" }
                  ]
              }
            ]
        });

    },
    
    addGroupLevelStyle: function(level){
        var me = this,
            values;
            
        // let's see what summary styles we have to add
        values = Ext.Array.pluck(me.styles, 'id');
        if(Ext.Array.indexOf(values, 'SummaryHeader' + level) < 0){
            me.addSummaryStyle('SummaryHeader', level, me.groupHeaderFontSize, me.groupHeaderFillColor);
            me.addSummaryStyle('SummaryFooter', level, me.groupFooterFontSize, me.groupFooterFillColor);
        }
    }

});
/**
*   Class used to create an Excel workbook
*/
Ext.define('Mz.pivot.dataexport.excel.Workbook', {
    extend:  Mz.pivot.dataexport.excel.Workbase ,
    
               
                        
                                              
                                         
                                         
      
    
    constructor: function (config) {
        var me = this;
        
        me.callParent(arguments);
        
        Ext.applyIf(me, {
            /**
             * @cfg hasDefaultStyle
             * @type Boolean
             * True to add the default styling options to all cells (defaults to true)
             */
            hasDefaultStyle: true,

            /**
             * @cfg headerFontSize
             * @type String
             * Font size used for the table header.
             */
            headerFontSize: "10",

            /**
             * @cfg headerFillColor
             * @type String
             * Fill folor used for the table header cells
             */
            headerFillColor: "#BFBFBF",

            /**
             * @cfg windowHeight
             * @type Number
             * Excel window height
             */
            windowHeight: 9000,

            /**
             * @cfg windowWidth
             * @type Number
             * Excel window width
             */
            windowWidth: 50000,

            /**
             * @cfg protectStructure
             * @type Boolean
             * Protect structure
             */
            protectStructure: false,

            /**
             * @cfg protectWindows
             * @type Boolean
             * Protect windows
             */
            protectWindows: false,
        
            /**
             * @property worksheets
             * @type Array
             * The array of worksheets inside this workbook
             */
            worksheets: [],

            /**
             * @property compiledWorksheets
             * @type Array
             * Array of all rendered Worksheets
             */
            compiledWorksheets: []

        });
        
        if (me.hasDefaultStyle) {
            me.addDefaultStyle();
        }

        me.addHeaderStyle();
    },

    /**
    * Render this workbook
    * 
    */
    render: function () {
        var me = this;
        
        me.compileWorksheets();
        me.joinedWorksheets = me.compiledWorksheets.join("");

        me.compileStyles();
        me.joinedCompiledStyles = me.compiledStyles.join("");

        return me.tpl.apply(me);
    },

    /**
     * Adds a worksheet to this workbook based on a store and optional config
     * @param {Ext.data.Store} store The store to initialize the worksheet with
     * @param {Object} config Optional config object
     * @return {Mz.pivot.dataexport.excel.Worksheet} The worksheet
     */
    addWorksheet: function (data, config) {
        var me = this, values, i, worksheet;

        worksheet = Ext.create(
            'Mz.pivot.dataexport.excel.Worksheet', 
            Ext.apply({
                data:               data, 
                hasDefaultStyle:    me.hasDefaultStyle, 
                showTitle:          me.showTitle
            }, config)
        );

        me.worksheets.push(worksheet);
        
        return worksheet;
    },

    /**
     * Compiles each Style attached to this Workbook by rendering it
     * @return {Array} The compiled styles array
     */
    compileStyles: function () {
        var me = this;
        
        me.compiledStyles = [];

        Ext.each(me.worksheets, function (worksheet) {
            me.styles = Ext.Array.merge(me.styles, worksheet.styles);
        }, me);

        Ext.each(me.styles, function (style) {
            me.compiledStyles.push(style.render());
        }, me);
        
        return me.compiledStyles;
    },

    /**
     * Compiles each Worksheet attached to this Workbook by rendering it
     * @return {Array} The compiled worksheets array
     */
    compileWorksheets: function () {
        var me = this;
        
        me.compiledWorksheets = [];

        Ext.each(me.worksheets, function (worksheet) {
            me.compiledWorksheets.push(worksheet.render());
        }, me);

        return me.compiledWorksheets;
    },

    tpl: new Ext.XTemplate(
        '<?xml version="1.0" encoding="utf-8"?>',
        '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:o="urn:schemas-microsoft-com:office:office">',
        '<o:DocumentProperties>',
            '<o:Title>{title}</o:Title>',
        '</o:DocumentProperties>',
        '<ss:ExcelWorkbook>',
            '<ss:WindowHeight>{windowHeight}</ss:WindowHeight>',
            '<ss:WindowWidth>{windowWidth}</ss:WindowWidth>',
            '<ss:ProtectStructure>{protectStructure}</ss:ProtectStructure>',
            '<ss:ProtectWindows>{protectWindows}</ss:ProtectWindows>',
        '</ss:ExcelWorkbook>',
        '<ss:Styles>',
            '{joinedCompiledStyles}',
        '</ss:Styles>',
            '{joinedWorksheets}',
      '</ss:Workbook>'
    ),

    /**
     * Adds the default Style to this workbook. This sets the default font face and size, as well as cell borders
     */
    addDefaultStyle: function () {
        var me = this,
            borderProperties = [
                { name: "Color", value: me.cellBorderColor },
                { name: "Weight", value: "1" },
                { name: "LineStyle", value: "Continuous" }
            ];

        me.addStyle({
            id: 'Default',
            attributes: [
              {
                  name: "Alignment",
                  properties: [
                    { name: "Vertical", value: "Top" },
                    { name: "WrapText", value: "1" }
                  ]
              },
              {
                  name: "Font",
                  properties: [
                    { name: "FontName", value: me.cellFontName },
                    { name: "Size", value: me.cellFontSize }
                  ]
              },
              me.getInteriorStyle(me.cellFillColor),
              { name: "NumberFormat" }, 
              { name: "Protection" },
              {
                  name: "Borders",
                  children: [
                    {
                        name: "Border",
                        properties: [{ name: "Position", value: "Top" }].concat(borderProperties)
                    },
                    {
                        name: "Border",
                        properties: [{ name: "Position", value: "Bottom" }].concat(borderProperties)
                    },
                    {
                        name: "Border",
                        properties: [{ name: "Position", value: "Left" }].concat(borderProperties)
                    },
                    {
                        name: "Border",
                        properties: [{ name: "Position", value: "Right" }].concat(borderProperties)
                    }
                  ]
              }
            ]
        });
        
        me.addStyle({
            id: 'DefaultNumber',
            parentStyle: 'Default',
            attributes: [
              {
                  name: "NumberFormat",
                  properties: [{ name: "Format", value: me.numberFormat }]
              },
              {
                  name: "Alignment",
                  properties: [
                    { name: "Horizontal", value: "Right" }
                  ]
              }
            ]
        });

        me.addStyle({
            id: 'DefaultDateTime',
            parentStyle: 'Default',
            attributes: [
              {
                  name: "NumberFormat",
                  properties: [{ name: "Format", value: me.dateFormat }]
              },
              {
                  name: "Alignment",
                  properties: [
                    { name: "Horizontal", value: "Right" }
                  ]
              }
            ]
        });

    },

    /**
    * Add style for the table header
    * 
    */
    addHeaderStyle: function () {
        var me = this;
        
        me.addStyle({
            id: "Header",
            attributes: [
              {
                  name: "Font",
                  properties: [
                    { name: "Bold", value: "1" },
                    { name: "Size", value: me.headerFontSize }
                  ]
              },
              me.getInteriorStyle(me.headerFillColor),
              {
                  name: "Alignment",
                  properties: [
                    { name: "WrapText", value: "1" },
                    { name: "Horizontal", value: "Center" }
                  ]
              }
            ]
        });
    }
    

});
/**
*   The excel formatter is a modified version of Ext.ux.Formatter (https://github.com/edspencer/Ext.ux.Exporter).
*/
Ext.define('Mz.pivot.dataexport.excel.Formatter', {
    extend:  Mz.pivot.dataexport.Formatter ,

               
                                            
      

    format: function () {
        var me = this,
            workbook = Ext.create('Mz.pivot.dataexport.excel.Workbook', me.config || {});
            
        workbook.addWorksheet(me.data, me.config || {});

        return workbook.render();
    }
});
/**
* This is the window that allows configuring a label filter
* 
*/
Ext.define('Mz.pivot.plugin.configurator.FilterLabelWindow',{
    extend:  Ext.window.Window ,
    
               
                         
                                  
                              
                                  
                                   
      
    
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
/**
* @private
* 
* This class is used for creating a configuration field.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.Column',{
    extend:  Ext.Component ,
    
               
                        
                                                        
      
    
    alias: 'widget.mzconfigcolumn',
    
    childEls: ['textCol', 'filterCol', 'sortCol'],
    
    renderTpl: 
        '<div id="{id}-configCol" class="' + Ext.baseCSSPrefix + 'config-column-inner">' +
            '<tpl if="isCustomizable">' +
                '<span id={id}-customCol class="' + Ext.baseCSSPrefix + 'config-column-customize"></span>' +
            '</tpl>' +
            '<span id="{id}-textCol" class="' + Ext.baseCSSPrefix + 'config-column-text ' + Ext.baseCSSPrefix + 'column-header-text">' + 
                '{header}{aggregator}' +
            '</span>' +
            '<span id={id}-sortCol class=""></span>' +
            '<span id={id}-filterCol class=""></span>' +
        '</div>',
        
    header:         '&#160;',
    isCustomizable: false,
    dimension:      null,
    isAgg:          false,

    sumText:                    'Sum',
    avgText:                    'Avg',
    countText:                  'Count',
    minText:                    'Min',
    maxText:                    'Max',
    groupSumPercentageText:     'Group sum percentage',
    groupCountPercentageText:   'Group count percentage',

    sortAscText:                'Sort A to Z',
    sortDescText:               'Sort Z to A',
    sortClearText:              'Disable sorting',
    clearFilterText:            'Clear filter from "{0}"',
    labelFiltersText:           'Label filters',
    valueFiltersText:           'Value filters',
    equalsText:                 'Equals...',
    doesNotEqualText:           'Does not equal...',
    beginsWithText:             'Begins with...',
    doesNotBeginWithText:       'Does not begin with...',
    endsWithText:               'Ends with...',
    doesNotEndWithText:         'Does not end with...',
    containsText:               'Contains...',
    doesNotContainText:         'Does not contain...',
    greaterThanText:            'Greater than...',
    greaterThanOrEqualToText:   'Greater than or equal to...',
    lessThanText:               'Less than...',
    lessThanOrEqualToText:      'Less than or equal to...',
    betweenText:                'Between...',
    notBetweenText:             'Not between...',
    top10Text:                  'Top 10...',

    equalsLText:                'equals',
    doesNotEqualLText:          'does not equal',
    beginsWithLText:            'begins with',
    doesNotBeginWithLText:      'does not begin with',
    endsWithLText:              'ends with',
    doesNotEndWithLText:        'does not end with',
    containsLText:              'contains',
    doesNotContainLText:        'does not contain',
    greaterThanLText:           'is greater than',
    greaterThanOrEqualToLText:  'is greater than or equal to',
    lessThanLText:              'is less than',
    lessThanOrEqualToLText:     'is less than or equal to',
    betweenLText:               'is between',
    notBetweenLText:            'is not between',
    top10LText:                 'Top 10...',
    topOrderTopText:            'Top',
    topOrderBottomText:         'Bottom',
    topTypeItemsText:           'Items',
    topTypePercentText:         'Percent',
    topTypeSumText:             'Sum',

    ascSortCls:         Ext.baseCSSPrefix + 'config-column-sort-ASC',
    descSortCls:        Ext.baseCSSPrefix + 'config-column-sort-DESC',
    baseCls:            Ext.baseCSSPrefix + 'config-column',
    filteredCls:        Ext.baseCSSPrefix + 'config-column-filtered',
    clearFilterIconCls: Ext.baseCSSPrefix + 'clearFilterIcon',
    ascSortIconCls:     Ext.baseCSSPrefix + 'sortAscIcon',
    descSortIconCls:    Ext.baseCSSPrefix + 'sortDescIcon',
    disableSortIconCls: Ext.baseCSSPrefix + 'sortDisableIcon',
    
    //height:         '100%',
    height:         26,
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                /**
                * @event sortchange
                * @param {Mz.pivot.plugin.configurator.Column} col
                * @param String direction
                */
                'sortchange',
                
                'filterchange'
                
            );
        }
    },
    
    destroy: function(){
        var me = this;
        
        delete(me.dimension);
        Ext.destroy(me.relayers, me.menu);
        me.callParent(arguments);
    },
    
    show: function(){
        var me = this;
        
        me.callParent();
    },
    
    initRenderData: function() {
        var me = this;

        return Ext.apply(me.callParent(arguments), {
            header:         me.dimension.header,
            aggregator:     me.isAgg ? ' (' + me.dimension.aggregator + ')' : '',
            dimension:      me.dimension,
            isCustomizable: me.isCustomizable
        });
    },
    
    afterRender: function(){
        var me = this;
        
        me.callParent();

        if(me.isCustomizable){
            if(me.dimension.sortable){
                me.addSortCls(me.dimension.direction);
            }
            
            if(me.dimension.filter){
                me.addFilterCls();
            }

            me.mon(me.getTargetEl(), {
                scope: me,
                click: me.handleColClick
            });
        } 
        
    },

    handleColClick: function(e, t){
        // handles grid column sorting
        var me = this;
        
        if(me.isAgg){
            me.showAggMenu();
            e.stopEvent();
        }else{
            me.showColMenu();
        }
    },
    
    handleMenuClick: function(item, e){
        var me = this,
            method;
        
        me.dimension.aggregator = item.aggregator;
        if(me.textCol){
            method = me.textCol.setHtml ? 'setHtml' : 'setHTML';
            me.textCol[method](me.header + ' (' + me.dimension.aggregator + ')');
        }
        me.ownerCt.updateLayout();
        me.fireEvent('configchange');
    },
    
    addSortCls: function(direction){
        var me = this;
        
        if(!me.sortCol){
            return;
        }
        
        if(direction === 'ASC'){
            me.sortCol.addCls(me.ascSortCls);
            me.sortCol.removeCls(me.descSortCls);
        }else{
            me.sortCol.addCls(me.descSortCls);
            me.sortCol.removeCls(me.ascSortCls);
        }

    },
    
    removeSortCls: function(direction){
        var me = this;
        
        if(!me.sortCol){
            return;
        }
        
        if(direction === 'ASC'){
            me.sortCol.removeCls(me.ascSortCls);
        }else{
            me.sortCol.removeCls(me.descSortCls);
        }

    },
    
    addFilterCls: function(){
        var me = this;
        
        if(me.filterCol && !me.filterCol.hasCls(me.filteredCls)){
            me.filterCol.addCls(me.filteredCls);
        }
    },
    
    removeFilterCls: function(){
        var me = this;
        
        if(me.filterCol){
            me.filterCol.removeCls(me.filteredCls);
        }
    },

    serialize: function(){
        var me = this;
        
        return Ext.applyIf({
            idColumn:       me.id
        }, me.initialConfig);
    },
    
    showAggMenu: function(){
        var me = this,
            aggregator = me.dimension.aggregator;
        
        //create a menu with possible aggregate functions
        Ext.destroy(me.menu);
        me.menu = Ext.create('Ext.menu.Menu', {
            floating:   true,
            defaults: {
                handler:    me.handleMenuClick,
                scope:      me,
                xtype:      'menucheckitem',
                group:      'aggregator'
            },
            items: [{
                text:       me.sumText,
                aggregator: 'sum',
                checked:    aggregator == 'sum'
            },{
                text:       me.avgText,
                aggregator: 'avg',
                checked:    aggregator == 'avg'
            },{
                text:       me.countText,
                aggregator: 'count',
                checked:    aggregator == 'count'
            },{
                text:       me.maxText,
                aggregator: 'max',
                checked:    aggregator == 'max'
            },{
                text:       me.minText,
                aggregator: 'min',
                checked:    aggregator == 'min'
            },{
                text:       me.groupSumPercentageText,
                aggregator: 'groupSumPercentage',
                checked:    aggregator == 'groupSumPercentage'
            },{
                text:       me.groupCountPercentageText,
                aggregator: 'groupCountPercentage',
                checked:    aggregator == 'groupCountPercentage'
            }]
        });
        me.menu.showBy(me);
    },
    
    showColMenu: function(){
        var me = this,
            items = [], 
            labelItems, valueItems, commonItems, i,
            filter = me.dimension.filter;

        Ext.destroy(me.menu);
        
        // check if the dimension is sortable
        items.push({
            text:       me.sortAscText,
            direction:  'ASC',
            iconCls:    me.ascSortIconCls,
            handler:    me.sortMe
        }, {
            text:       me.sortDescText,
            direction:  'DESC',
            iconCls:    me.descSortIconCls,
            handler:    me.sortMe
        }, {
            text:       me.sortClearText,
            direction:  '',
            disabled:   !me.dimension.sortable,
            iconCls:    me.disableSortIconCls,
            handler:    me.sortMe
        },{
            xtype:  'menuseparator'
        });
        
        commonItems = [{
            text:       me.equalsText,
            filterType: Mz.aggregate.filter.Label.TypeEquals
        },{
            text:       me.doesNotEqualText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotEqual
        },{
            xtype:  'menuseparator'
        },{
            text:       me.greaterThanText,
            filterType: Mz.aggregate.filter.Label.TypeGreaterThan
        },{
            text:       me.greaterThanOrEqualToText,
            filterType: Mz.aggregate.filter.Label.TypeGreaterThanOrEqualTo
        },{
            text:       me.lessThanText,
            filterType: Mz.aggregate.filter.Label.TypeLessThan
        },{
            text:       me.lessThanOrEqualToText,
            filterType: Mz.aggregate.filter.Label.TypeLessThanOrEqualTo
        },{
            xtype:  'menuseparator'
        },{
            text:       me.betweenText,
            filterType: Mz.aggregate.filter.Label.TypeBetween
        },{
            text:       me.notBetweenText,
            filterType: Mz.aggregate.filter.Label.TypeNotBetween
        }];

        labelItems = Ext.clone(commonItems);
        Ext.Array.insert(labelItems, 3, [{
            text:       me.beginsWithText,
            filterType: Mz.aggregate.filter.Label.TypeBeginsWith
        },{
            text:       me.doesNotBeginWithText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotBeginWith
        },{
            text:       me.endsWithText,
            filterType: Mz.aggregate.filter.Label.TypeEndsWith
        },{
            text:       me.doesNotEndWithText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotEndWith
        },{
            xtype:  'menuseparator'
        },{
            text:       me.containsText,
            filterType: Mz.aggregate.filter.Label.TypeContains
        },{
            text:       me.doesNotContainText,
            filterType: Mz.aggregate.filter.Label.TypeDoesNotContain
        },{
            xtype:  'menuseparator'
        }]);

        for(i = 0; i < labelItems.length; i++){
            labelItems[i]['checked'] = (filter && filter.mztype == 'label' && filter.type == labelItems[i].filterType);
        }
        
        valueItems = Ext.clone(commonItems);
        valueItems.push({
            xtype:  'menuseparator'
        },{
            text:       me.top10Text,
            filterType: Mz.aggregate.filter.Value.TypeTop10
        });

        for(i = 0; i < valueItems.length; i++){
            valueItems[i]['checked'] = (filter && filter.mztype == 'value' && filter.type == valueItems[i].filterType);
        }
        
        items.push({
            text:       Ext.String.format(me.clearFilterText, me.header),
            iconCls:    me.clearFilterIconCls,
            disabled:   !filter,
            handler:    me.onRemoveFilter
        },{
            text:   me.labelFiltersText,
            menu: {
                defaults: {
                    handler:    me.onShowFilter,
                    scope:      me,
                    xtype:      'menucheckitem',
                    group:      'filterlabel',
                    mztype:     'label'
                },
                items: labelItems
            }
        },{
            text:   me.valueFiltersText,
            menu: {
                defaults: {
                    handler:    me.onShowFilter,
                    scope:      me,
                    xtype:      'menucheckitem',
                    group:      'filtervalue',
                    mztype:     'value'
                },
                items: valueItems
            }
        });
        
        me.menu = Ext.create('Ext.menu.Menu', {
            floating:   true,
            defaults: {
                scope:      me
            },
            items: items
        });
        me.menu.showBy(me);
    },
    
    sortMe: function(btn){
        var me = this;
            
        if(Ext.isEmpty(btn.direction)){
            //disable sorting
            me.dimension.sortable = false;
            me.removeSortCls(me.dimension.direction);
        }else{
            me.dimension.sortable = true;
            me.addSortCls(btn.direction);
            me.dimension.direction = btn.direction;
        }
        me.fireEvent('sortchange', me, btn.direction);
    },
    
    onShowFilter: function(btn){
        var me = this,
            win, store, winClass, winCfg = {}, data, dataAgg,
            filter = me.dimension.filter,
            values = {
                mztype:         btn.mztype,
                type:           btn.filterType,
                value:          (filter ? filter.value : ''),
                from:           (filter ? filter.from : ''),
                to:             (filter ? filter.to : ''),
                caseSensitive:  (filter ? filter.caseSensitive : false),
                topSort:        (filter ? filter.topSort : false)
            };
        
        dataAgg = [];
        Ext.each(me.ownerCt.aggregateDimensions, function(field){
            dataAgg.push([field.header, field.id]);
        });

        if(btn.mztype == 'label' || (btn.mztype == 'value' && btn.filterType != Mz.aggregate.filter.Value.TypeTop10)){
            data = [
                [me.equalsLText, Mz.aggregate.filter.Label.TypeEquals],
                [me.doesNotEqualLText, Mz.aggregate.filter.Label.TypeDoesNotEqual],
                [me.greaterThanLText, Mz.aggregate.filter.Label.TypeGreaterThan],
                [me.greaterThanOrEqualToLText, Mz.aggregate.filter.Label.TypeGreaterThanOrEqualTo],
                [me.lessThanLText, Mz.aggregate.filter.Label.TypeLessThan],
                [me.lessThanOrEqualToLText, Mz.aggregate.filter.Label.TypeLessThanOrEqualTo],
                [me.betweenLText, Mz.aggregate.filter.Label.TypeBetween],
                [me.notBetweenLText, Mz.aggregate.filter.Label.TypeNotBetween]
            ];
            
            if(btn.mztype == 'label'){
                Ext.Array.insert(data, 3, [
                    [me.beginsWithLText, Mz.aggregate.filter.Label.TypeBeginsWith],
                    [me.doesNotBeginWithLText, Mz.aggregate.filter.Label.TypeDoesNotBeginWith],
                    [me.endsWithLText, Mz.aggregate.filter.Label.TypeEndsWith],
                    [me.doesNotEndWithLText, Mz.aggregate.filter.Label.TypeDoesNotEndWith],
                    [me.containsLText, Mz.aggregate.filter.Label.TypeContains],
                    [me.doesNotContainLText, Mz.aggregate.filter.Label.TypeDoesNotContain]
                ]);
                winClass = 'Mz.pivot.plugin.configurator.FilterLabelWindow';
            }else{
                winClass = 'Mz.pivot.plugin.configurator.FilterValueWindow';
                Ext.apply(values, {
                    dimensionId:    (filter ? filter.dimensionId : '')
                });
                
                winCfg.storeAgg = Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:   dataAgg
                });
            }
            
            winCfg.store = Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data:   data
            });
        }else{
            winClass = 'Mz.pivot.plugin.configurator.FilterTopWindow';
            data = [];

            Ext.apply(winCfg, {
                storeTopOrder: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:[
                        [me.topOrderTopText, 'top'],
                        [me.topOrderBottomText, 'bottom']
                    ]
                }),
                storeTopType: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:[
                        [me.topTypeItemsText, 'items'],
                        [me.topTypePercentText, 'percent'],
                        [me.topTypeSumText, 'sum']
                    ]
                }),
                storeAgg: Ext.create('Ext.data.ArrayStore', {
                    fields: ['text', 'value'],
                    data:   dataAgg
                })
            });

            Ext.apply(values, {
                type:           Mz.aggregate.filter.Value.TypeTop10,
                dimensionId:    (filter ? filter.dimensionId : ''),
                topType:        (filter ? filter.topType : 'items'),
                topOrder:       (filter ? filter.topOrder : 'top')
            });
        }
        
        win = Ext.create(winClass, Ext.apply(winCfg || {}, {
            title:      me.header,
            listeners: {
                filter: me.onApplyFilter,
                scope:  me
            }
        }));
        
        win.down('form').getForm().setValues(values);
        win.show();
    },
    
    onApplyFilter: function(win){
        var me = this,
            filter = win.down('form').getForm().getValues();
        
        filter.caseSensitive = (filter.caseSensitive === 'on');
        filter.topSort = (filter.topSort === 'on');
        win.close();
        me.addFilterCls();
        me.dimension.filter = filter;
        me.fireEvent('filterchange', me, filter);
    },
    
    onRemoveFilter: function(){
        var me = this;
        
        me.removeFilterCls();
        me.dimension.filter = null;
        me.fireEvent('filterchange', me, null);
    }
    
    
});
/**
* @private
* 
* This class is used for managing the drag zone for each container.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.DragZone', {
    extend:  Ext.dd.DragZone ,

    configColumnSelector:       '.' + Ext.baseCSSPrefix + 'config-column',
    configColumnInnerSelector:  '.' + Ext.baseCSSPrefix + 'config-column-inner',
    maxProxyWidth:              120,
    dragging:                   false,
    
    constructor: function(panel) {
        this.panel = panel;
        this.ddGroup =  this.getDDGroup();
        this.callParent([panel.el]);
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'configurator-' + this.panel.up('gridpanel').id;
    },
    
    getDragData: function(e) {
        if (e.getTarget(this.configColumnInnerSelector)) {
            var header = e.getTarget(this.configColumnSelector),
                headerCmp,
                ddel;

            if (header) {
                headerCmp = Ext.getCmp(header.id);
                
                if (!this.panel.dragging) {
                    ddel = document.createElement('div');
                    ddel.innerHTML = headerCmp.header;
                    return {
                        ddel: ddel,
                        header: headerCmp
                    };
                }
            }
        }
        return false;
    },

    onBeforeDrag: function() {
        return !(this.panel.dragging || this.disabled);
    },

    onInitDrag: function() {
        this.panel.dragging = true;
        this.callParent(arguments);
    },
    
    onDragDrop: function() {
        if(!this.dragData.dropLocation){
            this.panel.dragging = false;
            this.callParent(arguments);
            return;
        }
        
        /*
            when a column is dragged out from the grouping panel we have to do the following:
            1. remove the column from grouping panel
            2. adjust the grid groupers
        */
        var dropCol = this.dragData.dropLocation.header, 
            dragCol = this.dragData.header,
            pos = -1;
        
        if(dropCol instanceof Ext.grid.column.Column){
            dropCol.show();
            pos = this.panel.items.findIndex('idColumn', dragCol.id);
            this.panel.remove(this.panel.items.getAt(pos));
            this.panel.notifyGroupChange();
        }

        this.panel.dragging = false;
        this.callParent(arguments);
    },

    afterRepair: function() {
        this.callParent();
        this.panel.dragging = false;
    },

    getRepairXY: function() {
        return this.dragData.header.el.getXY();
    },
    
    disable: function() {
        this.disabled = true;
    },
    
    enable: function() {
        this.disabled = false;
    }

});
/**
* @private
* 
* This class is used for managing the drop zone for each container.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.DropZone', {
    extend:  Ext.dd.DropZone ,
    
    proxyOffsets: [-4, -9],
    configPanelCls:     Ext.baseCSSPrefix + 'config-panel-ct',
    configColumnCls:    Ext.baseCSSPrefix + 'config-column',

    constructor: function(panel){
        this.panel = panel;
        this.ddGroup = this.getDDGroup();
        this.callParent([panel.id]);
    },

    disable: function() {
        this.disabled = true;
    },
    
    enable: function() {
        this.disabled = false;
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'configurator-' + this.panel.up('gridpanel').id;
    },

    getTargetFromEvent : function(e){
        return e.getTarget('.' + this.configColumnCls) || e.getTarget('.' + this.configPanelCls);
    },

    getTopIndicator: function() {
        if (!this.topIndicator) {
            this.self.prototype.topIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: 'col-move-top ' + Ext.baseCSSPrefix + 'col-move-top',
                html: "&#160;"
            }, true);
            this.self.prototype.indicatorXOffset = Math.floor((this.topIndicator.dom.offsetWidth + 1) / 2);
        }
        return this.topIndicator;
    },

    getBottomIndicator: function() {
        if (!this.bottomIndicator) {
            this.self.prototype.bottomIndicator = Ext.DomHelper.append(Ext.getBody(), {
                cls: 'col-move-bottom ' + Ext.baseCSSPrefix + 'col-move-bottom',
                html: "&#160;"
            }, true);
        }
        return this.bottomIndicator;
    },

    getLocation: function(e, t) {
        var x      = e.getXY()[0],
            target = Ext.getCmp(t.id),
            region,
            pos;
            
        if(target instanceof Mz.pivot.plugin.configurator.Container){
            // that means that the column is dragged above the grouping panel so find out if there are any columns already
            if(target.items.getCount() > 0){
                // now fetch the position of the last item
                region = Ext.fly(target.items.last().el).getRegion();
            }else{
                region = new Ext.util.Region(0, 1000000, 0, 0);
            }
        }else{
            region = Ext.fly(t).getRegion();
        }
        
        if ((region.right - x) <= (region.right - region.left) / 2) {
            pos = "after";
        } else {
            pos = "before";
        }
        return {
            pos: pos,
            header: Ext.getCmp(t.id),
            node: t
        };
    },

    positionIndicator: function(data, node, e){
        var me = this,
            dragHeader   = data.header,
            dropLocation = me.getLocation(e, node),
            targetHeader = dropLocation.header,
            pos          = dropLocation.pos,
            nextHd,
            prevHd,
            topIndicator, bottomIndicator, topAnchor, bottomAnchor,
            topXY, bottomXY, headerCtEl, minX, maxX,
            allDropZones, ln, i, dropZone,
            extjs41 = Ext.getVersion('extjs').match('4.1');

        // Avoid expensive CQ lookups and DOM calculations if dropPosition has not changed
        if (targetHeader === me.lastTargetHeader && pos === me.lastDropPos) {
            return;
        }
        nextHd       = dragHeader.nextSibling('gridcolumn:not([hidden])');
        prevHd       = dragHeader.previousSibling('gridcolumn:not([hidden])');
        me.lastTargetHeader = targetHeader;
        me.lastDropPos = pos;

        // Cannot drag to before non-draggable start column
        /*if (!targetHeader.draggable && pos === 'before' && targetHeader.getIndex() === 0) {
            return false;
        }*/

        data.dropLocation = dropLocation;

        if ((dragHeader !== targetHeader) &&
            ((pos === "before" && nextHd !== targetHeader) ||
            (pos === "after" && prevHd !== targetHeader)) &&
            !targetHeader.isDescendantOf(dragHeader)) {

            // As we move in between different DropZones that are in the same
            // group (such as the case when in a locked grid), invalidateDrop
            // on the other dropZones.
            allDropZones = Ext.dd.DragDropManager.getRelated(me);
            ln = allDropZones.length;
            i  = 0;

            for (; i < ln; i++) {
                dropZone = allDropZones[i];
                if (dropZone !== me && dropZone.invalidateDrop) {
                    dropZone.invalidateDrop();
                }
            }

            me.valid = true;
            topIndicator = me.getTopIndicator();
            bottomIndicator = me.getBottomIndicator();
            if (pos === 'before') {
                topAnchor = (!extjs41 ? 'b' : '') + 'c-tl';
                bottomAnchor = (!extjs41 ? 't' : '') + 'c-bl';
            } else {
                topAnchor = (!extjs41 ? 'b' : '') + 'c-tr';
                bottomAnchor = (!extjs41 ? 't' : '') + 'c-br';
            }
            
            // Calculate arrow positions. Offset them to align exactly with column border line
            if(targetHeader instanceof Mz.pivot.plugin.configurator.Container && targetHeader.items.getCount() > 0){
                // if dropping zone is the container then align the rows to the last column item
                topXY = topIndicator.getAlignToXY(targetHeader.items.last().el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.items.last().el, bottomAnchor);
            }else{
                topXY = topIndicator.getAlignToXY(targetHeader.el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.el, bottomAnchor);
            }

            // constrain the indicators to the viewable section
            headerCtEl = me.panel.el;
            minX = headerCtEl.getX() - me.indicatorXOffset;
            maxX = headerCtEl.getX() + headerCtEl.getWidth();

            topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
            bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);

            // position and show indicators
            topIndicator.setXY(topXY);
            bottomIndicator.setXY(bottomXY);
            topIndicator.show();
            bottomIndicator.show();

        // invalidate drop operation and hide indicators
        } else {
            me.invalidateDrop();
        }
    },

    invalidateDrop: function() {
        this.valid = false;
        this.hideIndicators();
    },

    onNodeOver: function(node, dragZone, e, data) {
        var me = this,
            from = data.header,
            doPosition,
            to,
            fromPanel,
            toPanel;

        doPosition = true;
        if (data.header.el.dom === node) {
            doPosition = false;
        }
        
        if (doPosition) {
            me.positionIndicator(data, node, e);
        } else {
            me.valid = false;
        }
        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    },

    hideIndicators: function() {
        var me = this;
        
        me.getTopIndicator().hide();
        me.getBottomIndicator().hide();
        me.lastTargetHeader = me.lastDropPos = null;

    },

    onNodeOut: function() {
        this.hideIndicators();
    },

    onNodeDrop: function(node, dragZone, e, data) {
        //debugger;
        var me = this,
            dragColumn = data.header,
            dropLocation = data.dropLocation,
            newCol, pos, newPos;
        
        if (me.valid && dropLocation){
            /* 
                there are 2 possibilities here:
                1. a new grid column should be added to the grouping panel
                2. an existing group column changes its position
            */
            
            if(dragZone.id != me.panel.id){
                pos = me.panel.getColumnPosition(dropLocation.header, dropLocation.pos);
                newCol = dragColumn.serialize();
                
                // the field has to be removed from the dragZone
                if(!me.panel.isAgg){
                    dragZone.panel.remove(dragColumn);
                }
                
                me.panel.addColumn(newCol.dimension, pos, true);
            }else{
                // 2nd possibility
                me.panel.moveColumn(dragColumn.id, dropLocation.header instanceof Mz.pivot.plugin.configurator.Container ? dropLocation.header.items.last().id : dropLocation.header.id, dropLocation.pos);
            }
            
        }
        
    }
});
/**
* @private
* 
* This class is used for managing all fields for an axis.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.Container', {
    extend:  Ext.container.Container ,

               
                                              
                                                
                                               
      
    
    alias: 'widget.mzconfigcontainer',
    
    style:          'overflow:hidden',
    childEls:       ['innerCt', 'targetEl'],
    layout:         'column',
    handleSorting:  false,
    handleFiltering:false,
    isAgg:          false,
    height:         'auto',

    dragDropText:   'Drop Column Fields Here',
    baseCls:        Ext.baseCSSPrefix + 'config-panel-ct',

    destroy: function(){
        var me = this;
        
        Ext.destroy(me.dragZone, me.dropZone, me.relayers, me.targetEl);
        
        me.callParent();
    },
    
    enable: function(){
        var me = this;
        
        if(me.dragZone){
            me.dragZone.enable();
        }
        if(me.dropZone){
            me.dropZone.enable();
        }
    },
    
    disable: function(){
        var me = this;
        
        if(me.dragZone){
            me.dragZone.disable();
        }
        if(me.dropZone){
            me.dropZone.disable();
        }
    },

    afterRender: function(){
        var me = this;
        
        me.callParent();

        me.dragZone = new Mz.pivot.plugin.configurator.DragZone(me);
        me.dropZone = new Mz.pivot.plugin.configurator.DropZone(me);

        me.mon(me, 'afterlayout', me.showGroupByText, me);
    },
    
    /**
    * This is used for adding a new config field to this container.
    * 
    */
    addColumn: function(config, pos, notify){
        var me = this, newCol, cfg = {},
            itemFound = me.items.findIndex('dimensionId', new RegExp('^' + config.id + '$', 'i')) >= 0;
        
        if(!me.isAgg){
            // if column found then don't do anything
            if(itemFound){
                if (notify === true) {
                    me.notifyGroupChange();
                }
                return;
            }
        }else{
            if(itemFound){
                config.id = Ext.id();
            }
        }

        if(me.items.getCount() == 0){
            me.hideGroupByText();
        }
        
        Ext.apply(cfg, {
            dimension:      config,
            dimensionId:    config.id,
            header:         config.header,
            isCustomizable: me.isCustomizable,
            isAgg:          me.isAgg
        });
        
        if(me.isAgg){
            config.aggregator = config.aggregator || 'sum';
        }
        
        newCol = Ext.create('Mz.pivot.plugin.configurator.Column', cfg);
        
        if(pos != -1){
            me.insert(pos, newCol);
        }else{
            me.add(newCol);
        }
        me.updateColumnIndexes();
        newCol.relayers = me.relayEvents(newCol, ['sortchange', 'filterchange', 'configchange']);

        if(notify === true){
            me.notifyGroupChange();
        }
    },
    
    /**
    * This is used for calculating column position in this container.
    * 
    */
    getColumnPosition: function(column, position){
        var me = this, pos;
        
        if(column instanceof Mz.pivot.plugin.configurator.Column){
            //we have to insert before or after this column
            pos = me.items.findIndex('id', column.id);
            pos = (position === 'before') ? pos : pos + 1;
        }else{
            pos = -1;
        }
        return pos;
    },
    
    /**
    * This is used for moving a column inside this container.
    * 
    */
    moveColumn: function(idFrom, idTo, position){
        var me = this,
            pos = me.items.findIndex('id', idFrom),
            newPos = me.items.findIndex('id', idTo);
        
        if(pos != newPos){
            if(newPos > pos){
                newPos = (position === 'before') ? Math.max(newPos - 1, 0) : newPos;                        
            }else{
                newPos = (position === 'before') ? newPos : newPos + 1;
            }
            
            me.move(pos, newPos);
            me.updateColumnIndexes();
            me.notifyGroupChange();
        }
    },
    
    /**
    * @private
    * After a column is moved the indexes has to be updated.
    * 
    */
    updateColumnIndexes: function(){
        var me = this;
        
        me.items.each(function(item, index, all){
            item.index = index;
        });
    },
    
    /**
    * This is used for firing the 'configchange' event
    * 
    */
    notifyGroupChange: function(){
        var me = this;
        me.fireEvent('configchange');
    },
    
    /**
    * The container has an info text displayed inside. This function makes it visible.
    * 
    */
    showGroupByText: function(){
        var me = this,
            method;
        
        if(me.items.getCount() === 0){
            me.innerCt.setHeight(me.minHeight);
            if(me.targetEl){
                method = me.targetEl.setHtml ? 'setHtml' : 'setHTML';
                me.targetEl[method]('<div class="' + Ext.baseCSSPrefix + 'config-panel-text">' + me.dragDropText + '</div>');
            }else{
                me.targetEl = me.innerCt.createChild();
            }
        }
    },
    
    /**
    * The container has an info text displayed inside. This function hides it.
    * 
    */
    hideGroupByText: function(){
        var me = this,
            method;
        
        if(me.targetEl){
            method = me.targetEl.setHtml ? 'setHtml' : 'setHTML';
            me.targetEl[method]('');
        }
    }
    
    
});
/**
* @private
* 
* This class implements the config panel. It is used internally by the configurator plugin.
* 
*/
Ext.define('Mz.pivot.plugin.configurator.Panel', {
    extend:  Ext.container.Container ,

               
                                                
      
    
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
/**
* 
* This plugin allows the user to configure the pivot grid using drag and drop.
*/
Ext.define('Mz.pivot.plugin.Configurator', {
    extend:  Ext.AbstractPlugin ,
               
                               
                                
                                     
                                            
      

    alias: 'plugin.mzconfigurator',
    
    /**
    * @cfg {Array} fields This is the array of fields you want to be used in the configurator.
    * Each field is an object with the following properties: dataIndex, header.
    * If no fields are defined then the model fields are taken.
    * 
    */
    fields:         [],
    
    /**
    * @cfg {Number} refreshDelay Number of miliseconds to wait for pivot refreshing when a config change occured.
    */
    refreshDelay:   300,

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

    init: function(grid) {
        var me = this;

        if(grid.down('mzconfigpanel')){
            return;
        }
        
        me.grid = grid;
        me.fields = Ext.Array.from(me.fields);

        me.gridListeners = me.grid.on({
            beforerender:   me.onBeforeGridRendered,
            afterrender:    me.onAfterGridRendered,
            single:         true,
            scope:          me,
            destroyable:    true
        });
        
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function() {
        var me = this;

        delete me.grid;
        delete me.fields;
        if(me.gridMaster){
            delete me.gridMaster;
        }
        Ext.destroy(me.fieldsCt, me.gridListeners, me.gridStateListeners);
        me.callParent(arguments);
    },
    
    /**
    * Enable the plugin to show the configurator panel.
    * 
    */
    enable: function() {
        var me = this;

        me.disabled = false;
        
        if(me.configCt){
            me.configCt.enable();
        }
        if(me.gridMaster){
            me.gridMaster.fireEvent('showconfigpanel', me.configCt);
        }
    },
    
    /**
    * Disable the plugin to hide the configurator panel.
    * 
    */
    disable: function() {
        var me = this;

        me.disabled = true;
        
        if(me.configCt){
            me.configCt.disable();
        }
        if(me.gridMaster){
            me.gridMaster.fireEvent('hideconfigpanel', me.configCt);
        }
    },
    
    onBeforeGridRendered: function(){
        var me = this;
        
        if(me.grid instanceof Mz.pivot.Grid){
            me.gridMaster = me.grid;
        }else{
            me.gridMaster = me.grid.up('mzpivotgrid');
        }
        
        if(!me.gridMaster){
            me.destroy();
            return;
        }
        
        // if the grid is locked and ExtJS version is 4.1.1 then lockableScope doesn't work
        if(me.gridMaster.down('mzconfigpanel')){
            // do nothing; there is already a plugin instance that deals with the grid
            me.destroy();
            return;
        }
        
        me.configCt = me.gridMaster.addDocked({
            xtype:          'mzconfigpanel',
            grid:           me.gridMaster,
            fields:         me.fields,
            refreshDelay:   me.refreshDelay
        })[0];
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.gridMaster.addEvents(
                /**
                * @event configchange
                * @param {Mz.pivot.plugin.Configurator} panel
                * @param {Object} config
                */
                'configchange',
                
                /**
                * @event fieldsort
                * @param {Mz.pivot.plugin.configurator.Column} col
                * @param String direction
                */
                'fieldsort',
                
                /**
                * @event showconfigpanel
                * @param {Mz.pivot.plugin.configurator.Panel} panel
                */
                'showconfigpanel',
                
                /**
                * @event hideconfigpanel
                * @param {Mz.pivot.plugin.configurator.Panel} panel
                */
                'hideconfigpanel'
            );
        }
    },
    
    onAfterGridRendered: function(){
        var me = this;
        
        if(me.disabled === true){
            me.disable();
        }else{
            me.enable();
        }
    }
    

});
/**
 * 	Paging Memory Proxy, allows to use paging grid with in memory dataset.
 *  This class was copied from the Sencha Ext JS package and renamed to match our namespace.
 */
Ext.define('Mz.pivot.plugin.drilldown.PagingMemoryProxy', {
    extend:  Ext.data.proxy.Memory ,
    alias: 'proxy.mzpagingmemory',

    read : function(operation, callback, scope){
        var reader = this.getReader(),
            result = reader.read(this.data),
            sorters, filters, sorterFn, records;

        scope = scope || this;
        // filtering
        filters = operation.filters;
        if (filters && filters.length > 0) {
            //at this point we have an array of  Ext.util.Filter objects to filter with,
            //so here we construct a function that combines these filters by ANDing them together
            records = [];

            Ext.each(result.records, function(record) {
                var isMatch = true,
                    length = filters.length,
                    i;

                for (i = 0; i < length; i++) {
                    var filter = filters[i],
                        fn     = filter.filterFn,
                        scope  = filter.scope;

                    isMatch = isMatch && fn.call(scope, record);
                }
                if (isMatch) {
                    records.push(record);
                }
            }, this);

            result.records = records;
            result.totalRecords = result.total = records.length;
        }
        
        // sorting
        sorters = operation.sorters;
        if (sorters && sorters.length > 0) {
            //construct an amalgamated sorter function which combines all of the Sorters passed
            sorterFn = function(r1, r2) {
                var result = sorters[0].sort(r1, r2),
                    length = sorters.length,
                    i;
                
                    //if we have more than one sorter, OR any additional sorter functions together
                    for (i = 1; i < length; i++) {
                        result = result || sorters[i].sort.call(this, r1, r2);
                    }                
               
                return result;
            };
    
            result.records.sort(sorterFn);
        }
        
        // paging (use undefined cause start can also be 0 (thus false))
        if (operation.start !== undefined && operation.limit !== undefined) {
            result.records = result.records.slice(operation.start, operation.start + operation.limit);
            result.count = result.records.length;
        }

        Ext.apply(operation, {
            resultSet: result
        });
        
        operation.setCompleted();
        operation.setSuccessful();

        Ext.Function.defer(function () {
            Ext.callback(callback, scope, [operation]);
        }, 10);
    }
});

/**
* 
* This plugin allows the user to view all records that were aggregated for a specified cell. 
* The user has to double click that cell to open the viewer.
*/
Ext.define('Mz.pivot.plugin.DrillDown', {
	alias: 'plugin.mzdrilldown',

	extend:  Ext.AbstractPlugin ,
	
	           
                        
                                                      
		                    
                         
		                    
	  

	mixins: {
        observable:  Ext.util.Observable 
    },
	
    /**
    * @cfg {Array} columns Specify which columns should be visible in the grid. 
    * Use the same definition you would use for a grid column. Header and dataIndex are the most important ones.
    */
	columns: 	[],
    /**
    * @cfg {Integer} width Width of the viewer's window.
    */    
	width:		400,
    /**
    * @cfg {Integer} height Height of the viewer's window.
    */    
	height:		300,
    /**
    * @cfg {String} textWindow Viewer's window title.
    */    
	textWindow: 'Drill down window',
	
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
    
	init: function(grid){
	    // this plugin is available only for the pivot grid
		var me = this;

        me.gridListeners = grid.on({
            afterrender:    me.onGridRendered,
            scope:          me,
            destroyable:    true
        });
        
        me.callParent(arguments);        
	},
	
	destroy: function(){
		var me = this;
		
		Ext.destroy(me.view, me.gridListeners, me.pivotListeners);
		delete me.pivot;
		delete me.view;
	},
    
    onGridRendered: function(grid){
        var me = this;
        
        me.pivot = (Mz.pivot.Grid && grid instanceof Mz.pivot.Grid) ? grid : grid.up('mzpivotgrid');
        if (!me.pivot || (me.pivot && me.pivot.hasDrillDown)) return;

        me.pivot.hasDrillDown = true;
        me.pivotListeners = me.pivot.on({
            pivotitemcelldblclick:      me.runPlugin,
            pivotgroupcelldblclick:     me.runPlugin,
            pivottotalcelldblclick:     me.runPlugin,
            scope:                      me,
            destroyable:                true
        });
    },

	showView: function(records){
	    var me = this;

	    if (!me.view) {
	        var fields = me.pivot.getMatrix().store.model.getFields(),
			    columns = me.columns,
                extjsVersion = Ext.getVersion('extjs'),
			    proxy = 'mzpagingmemory',
                store;
            
            if (extjsVersion.isGreaterThanOrEqual && extjsVersion.isGreaterThanOrEqual(5.0)){
                proxy = 'memory';
            }
            
            store = Ext.create('Ext.data.Store', {
                pageSize: 25,
                remoteSort: true,
                fields: Ext.clone(fields),
                proxy: {
                    type: proxy,
                    reader: {
                        type: 'array'
                    }
                }
            });
            
	        // if no columns are defined then use those defined in the pivot grid store
	        if (columns.length === 0) {
	            Ext.Array.each(fields, function (value, index, all) {
	                columns.push({
	                    header: Ext.String.capitalize(value.name),
	                    dataIndex: value.name
	                });
	            });
	        }

	        // create the window that will show the records
	        me.view = Ext.create('Ext.window.Window', {
	            title: me.textWindow,
	            width: me.width,
	            height: me.height,
	            layout: 'fit',
	            modal: true,
	            closeAction: 'hide',
	            items: [{
	                xtype: 'grid',
	                border: false,
	                viewConfig: {
	                    loadMask: false
	                },
	                columns: columns,
	                store: store,
	                dockedItems: [{
	                    itemId: 'idPager',
	                    xtype: 'pagingtoolbar',
	                    store: store,   // same store GridPanel is using
	                    dock: 'bottom',
	                    displayInfo: true
	                }]
	            }]
	        });

	        me.store = store;
	    }
	    me.store.getProxy().data = records;
	    me.store.load();
	    me.view.down('#idPager').moveFirst();
	    me.view.show();
	},
	
	runPlugin: function(params, e, eOpts){
		// do nothing if the plugin is disabled
		if(this.disabled) return;
		
		var me = this,
			matrix = me.pivot.getMatrix(),
			result;
		
		if(params.topKey){
		    result = matrix.results.get(params.leftKey, params.topKey);
            if(result){
                me.showView(result.records);
            }
		}
	}
	
});
/**
* 
* 
* This plugin allows the user to export the pivot table data to an Excel file.
*
#Example usage:#

    var excelExportPlugin = Ext.create('Mz.pivot.plugin.ExcelExport', {
        title:  'Pivot grid export'
    });

    // in a button/menu handler do like this
    var f = excelExportPlugin.getExcelData(true);
    document.location = 'data:application/vnd.ms-excel;base64,' + Base64.encode(f);

*
*
* This solution doesn't work in all browsers so you might want to send the Base64 content
* to the backend server and get back the download file with proper HTTP headers. Please have a 
* look at this example: http://dean.edwards.name/weblog/2005/06/base64-ie/
*
*
*/
Ext.define('Mz.pivot.plugin.ExcelExport', {
    alias: 'plugin.mzexcelexport',
    extend:  Ext.AbstractPlugin ,

               
                                             
      

    constructor: function(config){
        var me = this;
        
        config = config || {};
        
        me.config = Ext.apply({
            /**
             * @cfg showTitle
             * @type Boolean
             * Show or hide the title
             */
            showTitle: true,

            /**
             * @cfg title
             * @type String
             * The title of the workbook
             */
            title: "Workbook",

            /**
             * @cfg cellFontName
             * @type String
             * The default font name used in the workbook. This is applied when {hasDefaultStyle} is true.
             */
            cellFontName: "Arial",

            /**
             * @cfg cellFontSize
             * @type String
             * The default font size used in the workbook. This is applied when {hasDefaultStyle} is true.
             */
            cellFontSize: "10",

            /**
             * @cfg cellBorderColor
             * @type String
             * The colour of border to use for each Cell
             */
            cellBorderColor: "#E4E4E4",

            /**
             * @cfg cellFillColor
             * @type String
             * The fill colour of each summary Cell
             */
            cellFillColor: "",

            /**
             * @cfg titleFontSize
             * @type String
             * Font size used for the table title
             */
            titleFontSize: "14",

            /**
             * @cfg titleFillColor
             * @type String
             * Fill folor used for the table title
             */
            titleFillColor: "",

            /**
             * @cfg headerFontSize
             * @type String
             * Font size used for the table header.
             */
            headerFontSize: "10",

            /**
             * @cfg headerFillColor
             * @type String
             * Fill folor used for the table header cells
             */
            headerFillColor: "#BFBFBF",

            /**
             * @cfg groupHeaderFontSize
             * @type String
             * Font size applied to the summary group header cells
             */
            groupHeaderFontSize: "10",

            /**
             * @cfg groupHeaderFillColor
             * @type String
             * Fill folor used for the summary group header cells
             */
            groupHeaderFillColor: "#D8D8D8",

            /**
             * @cfg groupFooterFontSize
             * @type String
             * Font size applied to the summary group footer cells
             */
            groupFooterFontSize: "10",

            /**
             * @cfg groupFooterFillColor
             * @type String
             * Fill folor used for the summary group footer cells
             */
            groupFooterFillColor: "#BFBFBF",

            /**
            * @cfg dateFormat
            * @type String
            * Default format used for the date values
            */
            dateFormat:     'Short Date',

            /**
            * @cfg numberFormat
            * @type String
            * Default format used for the number values
            */
            numberFormat:   'Standard',

            /**
             * @cfg hasDefaultStyle
             * @type Boolean
             * True to add the default styling options to all cells (defaults to true)
             */
            hasDefaultStyle: true,

            /**
             * @cfg windowHeight
             * @type Number
             * Excel window height
             */
            windowHeight: 9000,

            /**
             * @cfg windowWidth
             * @type Number
             * Excel window width
             */
            windowWidth: 50000,

            /**
             * @cfg protectStructure
             * @type Boolean
             * Protect structure
             */
            protectStructure: false,

            /**
             * @cfg protectWindows
             * @type Boolean
             * Protect windows
             */
            protectWindows: false
        }, config);
    },

    init: function (grid) {
        var me = this;
        
        me.grid = grid; 
        me.config = Ext.clone(me.config);

        me.gridListeners = me.grid.on({
            beforerender:   me.onBeforeGridRendered,
            single:         true,
            scope:          me,
            destroyable:    true
        });
    },

    destroy: function () {
        var me = this;
        
        delete me.grid;
        if(me.gridMaster){
            delete me.gridMaster;
        }
        
        Ext.destroy(me.gridListeners);
        
        me.callParent(arguments);
    },

    onBeforeGridRendered: function(){
        var me = this;
        
        if(me.grid instanceof Mz.pivot.Grid){
            me.gridMaster = me.grid;
        }else{
            me.gridMaster = me.grid.up('mzpivotgrid');
        }
        
        if(!me.gridMaster){
            me.destroy();
            return;
        }
    },
    
    /**
    * @param onlyExpandedNodes Set to true if you want to have a WYSIWYG Excel file.
    */
    getExcelData: function (onlyExpandedNodes) {
        var me = this;
        
        if(!me.gridMaster) return;

        var f = Ext.create('Mz.pivot.dataexport.excel.Formatter', {
            matrix:             me.gridMaster.getMatrix(),
            onlyExpandedNodes:  onlyExpandedNodes,
            config:             me.config
        });
        return f.format();
    }
});
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

    extend:  Ext.AbstractPlugin ,
    
               
                        
                            
                              
                                
                                  
                                 
                            
                        
      

    mixins: {
        observable:  Ext.util.Observable 
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
/**
* This is the window that allows configuring a top10 value filter
* 
*/
Ext.define('Mz.pivot.plugin.configurator.FilterTopWindow',{
    extend:  Ext.window.Window ,
    
               
                         
                                  
                              
                                  
                                   
      
    
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
/**
* This is the window that allows configuring a value filter
* 
*/
Ext.define('Mz.pivot.plugin.configurator.FilterValueWindow',{
    extend:  Mz.pivot.plugin.configurator.FilterLabelWindow ,
    
    width:          500,
    height:         150,
    
    titleText:      'Value filter ({0})',
    fieldText:      'Show items for which',

    initComponent: function(){
        var me = this;
        
        me.filterFields = [{
            xtype:          'combo',
            editable:       false,
            queryMode:      'local',
            valueField:     'value',
            store:          me.storeAgg,
            name:           'dimensionId'
        }];
        
        me.callParent(arguments);
    }
});
