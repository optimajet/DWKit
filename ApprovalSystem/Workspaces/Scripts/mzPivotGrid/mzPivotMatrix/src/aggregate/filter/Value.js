/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

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
    extend: 'Mz.aggregate.filter.Abstract',

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