/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* Local processing axis class
* 
*/
Ext.define('Mz.aggregate.axis.Local', {
    extend: 'Mz.aggregate.axis.Abstract',
    
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