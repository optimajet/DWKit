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

Ext.define('Mz.aggregate.Aggregators', {
    singleton: true,
    
    
    sum: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total  = 0,
            i;
        
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        
        return total;
    },

    
    avg: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total  = 0,
            i;
        
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        
        return length > 0 ? (total / length) : 0;
    },

    
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

    
    count: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        return records.length;
    },

    
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
        
        this.clear();
    }
});

Ext.define('Mz.aggregate.filter.Abstract', {
    alias: 'pivotfilter.abstract',
    
    inheritableStatics: {
        
        TypeEquals:                 1,
        
        TypeDoesNotEqual:           2,
        
        TypeGreaterThan:            3,
        
        TypeGreaterThanOrEqualTo:   4,
        
        TypeLessThan:               5,
        
        TypeLessThanOrEqualTo:      6,
        
        TypeBetween:                7,
        
        TypeNotBetween:             8
    },
    
    
    mztype:         'abstract',

    
    type:           0,
    
    
    from:           null,

    
    to:             null,

    
    value:          null,

    
    caseSensitive:  true,
    
    constructor: function(config){
        Ext.apply(this, config || {});
    },
    
    
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
    
    
    getSerialArgs: Ext.emptyFn,
    
    
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
        
        
        return true;
    }
});

Ext.define('Mz.aggregate.filter.Label', {
    extend:  Mz.aggregate.filter.Abstract ,

    alias: 'pivotfilter.label',
    
    mztype: 'label',
    
    inheritableStatics: {
        
        TypeBeginsWith:             21,
        
        TypeDoesNotBeginWith:       22,
        
        TypeEndsWith:               23,
        
        TypeDoesNotEndWith:         24,
        
        TypeContains:               25,
        
        TypeDoesNotContain:         26
    },

    
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
        
        
        return me.callParent(arguments);
    },
    
    
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

Ext.define('Mz.aggregate.filter.Value', {
    extend:  Mz.aggregate.filter.Abstract ,

    alias: 'pivotfilter.value',
    
    mztype: 'value',
    
    inheritableStatics: {
        
        TypeTop10:  31
    },
    
    
    dimensionId:    '',
    
    
    topType:        'items',
    
    
    topOrder:       'top',
    
    
    topSort:        true,
    
    
    isTopFilter:    false,
    
    constructor: function(){
        var me = this;
        
        me.callParent(arguments);
        
        me.isTopFilter = (me.type == me.self.TypeTop10);
    },
    
    
    getSerialArgs: function(){
        var me = this;
        
        return {
            dimensionId:    me.dimensionId,
            topType:        me.topType,
            topOrder:       me.topOrder
        }
    },
    
    
    
    applyFilter: function(axis, treeItems){
        var me = this,
            items = me.topSort ? treeItems : Ext.Array.clone(treeItems),
            ret = [];
            
        if(treeItems.length == 0){
            return ret;
        }
        
        
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

Ext.define('Mz.aggregate.dimension.Item', {
               
                                       
                                    
                                   
      
    
    
    header:             '',

    
    dataIndex:          '', 

    
    sortIndex:          '', 

    
    width:              100,

    
    flex:               0,

    
    align:              'left',

    
    sortable:           true,

    
    direction:          'ASC',

    
    sorterFn:           null,

    
    caseSensitiveSort:  true,
    
    
    filter:             null,
    
    
    renderer:           null,

    
    grouperFn:          null,
    
    
    blankText:          '(blank)',

    
    showZeroAsBlank:    false,
    
    
    aggregator:         'sum',

    
    isAggregate:        false,

    
    id:                 '',

    
    values:             null,

    
    matrix:             null,

    constructor: function(config){
        var me = this;
        
        me.initialConfig = config || {};
        
        if(config.isAggregate === true && Ext.isEmpty(config.align)){
            config.align = 'left';
        }
        Ext.apply(me, config || {});
        
        if(Ext.isEmpty(me.id)){
            
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
    
    
    addValue: function(value, display){
        var me = this;
        
        if(!me.values.getByKey(value)){
            me.values.add({
                value:      value,
                display:    display
            });
        }
    },
    
    
    getValues: function(){
        return this.values;
    },
    
    
    getId: function(){
        return this.id;
    },
    
    
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
    
    
    defaultGrouperFn: function(record){
        return record.get(this.dataIndex);
    }

});

Ext.define('Mz.aggregate.axis.Item', {
    
    level:          0,
    
    
    key:            '',
    
    
    value:          '',
    
    
    sortValue:      '',
    
    
    name:           '',
    
    
    dimensionId:    '',
    
    
    dimension:      null,
    
    
    children:       null,
    
    
    record:         null,
    
    
    axis:           null,
    
    
    data:           null,
    
    
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

Ext.define('Mz.aggregate.axis.Abstract', {

    alias: 'pivotaxis.abstract',
    
               
                                       
                                      
                                
      
    
    
    dimensions: null,

    
    matrix:     null,
    
    
    items:      null,
    
    
    tree:       null,
    
    
    levels:     0,
    
    
    leftAxis:   false,
    
    constructor: function(config){
        var me = this, 
            i, sorter;
        
        if(!config || !config.matrix){
            
            Ext.log('Wrong initialization of the axis!');
            
            return;
        }
        
        me.leftAxis = config.leftAxis || me.leftAxis;
        me.matrix = config.matrix;
        me.tree = [];
        
        
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
    
    
    addDimension: function(config){
        var me = this;
        
        if(config){
            me.dimensions.add(Ext.create('Mz.aggregate.dimension.Item', Ext.apply({matrix: me.matrix}, config)));
        }
    },
    
    
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
    
    
    clear: function(){
        var me = this;
        
        me.items.clear();
        me.tree = null;
    },
    
    
    getTree: function(){
        var me = this;
        
        if(Ext.isEmpty(me.tree)){
            me.buildTree();
        }
        return me.tree;
    },
    
    
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

    
    buildTree: function(){
        var me = this,
            addToTreeFn;
        
        me.tree = [];
        
        
        me.items.each(me.addItemToTree, me);
        me.sortTree();
    },
    
    
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
        
        me.levels = Math.max(me.levels, item.level);
    },
    
    
    sortTree: function(){
        var tree = arguments[0] || this.tree,
            dimension;
        
        if(tree.length > 0){
            dimension = tree[0].dimension;
        }
        
        if(dimension && dimension.sortable === true){
            
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
            
            temp = dimension.direction;
            dimension.direction = direction;
            Ext.Array.sort(tree, function(a, b){
                return dimension.sorterFn(a, b);
            });
            dimension.direction = temp;
            
            return true;
        }
        
        
        if(records){
            
            me.sortTreeRecords(tree, field, direction);
            Ext.Array.each(tree, function(item){
                
                me.recordIndexer ++;
                item.record.index = me.recordIndexer;
            });
            return true;
        }else{
            
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
    
    
    sortTreeRecords: function(tree, field, direction){
        var me = this;
        
        direction = direction || 'ASC';
        
        
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


Ext.define('Mz.aggregate.axis.Local', {
    extend:  Mz.aggregate.axis.Abstract ,
    
    alias: 'pivotaxis.local',

    
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
    
    
    buildTree: function(){
        var me = this;
        
        me.callParent(arguments);
        me.filterTree();
    },
    
    
    filterTree: function(){
        var me = this,
            length = me.dimensions.getCount(),
            hasFilters = false,
            i;
        
        
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
            
            for(i = 0; i < filteredItems.length; i++){
                me.items.remove(filteredItems[i]);
            }
        }
        
        for(i = 0; i < items.length; i++){
            if(items[i].children){
                me.filterTreeItems(items[i].children);
                if(items[i].children.length === 0){
                    
                    me.items.remove(items[i]);
                    
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
        
        
        for(i = 0; i < results.length; i++){
            me.removeItemsFromArray(results[i].records, toRemove.records);
        }

        keys = item.key.split(me.matrix.keysSeparator);
        keys.length = keys.length - 1;

        while(keys.length > 0){

            
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

Ext.define('Mz.aggregate.matrix.Result', {
    
    
    leftKey:        '',
    
    topKey:         '',
    
    dirty:          false,
    
    
    records:        null,
    
    values:         null,
    
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
    
    
    calculate: function(){
        var me = this,
            i, dimension,
            length = me.matrix.aggregate.getCount();
        
        
        for(i = 0; i < length; i++){
            dimension = me.matrix.aggregate.getAt(i);
            me.addValue(dimension.getId(), dimension.aggregatorFn(me.records, dimension.dataIndex, me.matrix, me.leftKey, me.topKey));
        }
    },
    
    
    calculateByFn: function(key, dataIndex, aggFn){
        var me = this,
            v = aggFn(me.records, dataIndex, me.matrix, me.leftKey, me.topKey);
        
        me.addValue(key, v);
        
        return v;
    },
    
    
    addValue: function(dimensionId, value){
        this.values[dimensionId] = value;
    },
    
    
    getValue: function(dimensionId){
        return this.values[dimensionId];
    },
    
    
    addRecord: function(record){
        this.records.push(record);
    },
    
    
    getLeftAxisItem: function(){
        return this.matrix.leftAxis.items.getByKey(this.leftKey);
    },
    
    
    getTopAxisItem: function(){
        return this.matrix.topAxis.items.getByKey(this.topKey);
    }
});

Ext.define('Mz.aggregate.matrix.Results', {
               
                                       
                                    
      
    
    
    items:  null,
    
    
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
    
    
    clear: function(){
        this.items.clear();
    },
    
    
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
    
    
    get: function(leftKey, topKey){
        return this.items.getByKey(leftKey + '/' + topKey);
    },
    
    
    getByLeftKey: function(leftKey){
        var col = this.items.filterBy(function(item, key){
            var keys = String(key).split('/');
            return (leftKey == keys[0]);
        });
        
        return col.getRange();
    },
    
    
    getByTopKey: function(topKey){
        var col = this.items.filterBy(function(item, key){
            var keys = String(key).split('/');
            return (keys.length > 1 && topKey == keys[1]);;
        });
        
        return col.getRange();
    },
    
    
    calculate: function(){
        this.items.each(function(item){
            item.calculate();
        });
    }
});

Ext.define('Mz.aggregate.matrix.Abstract', {
    extend:  Ext.util.Observable ,
    
    alias:  'pivotmatrix.abstract',
    
    mztype: 'abstract',
    
               
                               
                              
                        
                                   
                                       
                                     
                                      
                                     
      
    
    
    mztypeLeftAxis:     'abstract',

    
    mztypeTopAxis:      'abstract',
    
    
    textRowLabels:      'Row labels',
    
    
    textTotalTpl:       'Total ({name})',

    
    textGrandTotalTpl:  'Grand total',

    
    keysSeparator:      '#_#',
    
    
    grandTotalKey:      '#mzgrandtotal#',
    
    
    compactViewKey:     '#compactview#',
    
    
    viewLayoutType:             'outline',

    
    rowSubTotalsPosition:       'first',

    
    rowGrandTotalsPosition:     'first',

    
    colSubTotalsPosition:       'first',

    
    colGrandTotalsPosition:     'first',

    
    showZeroAsBlank:            false,

    
    leftAxis:       null,

    
    topAxis:        null,

    
    aggregate:      null,
    
    
    results:        null,
    
    
    pivotStore:     null,
    
    
    isDestroyed:    false,
    
    constructor: function(config){
        var me = this;
        
        me.callParent(arguments);

        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                
                'cleardata',
                
                
                'start',
                
                
                'progress',

                
                'done',

                
                'modelbuilt',

                
                'columnsbuilt',

                
                'recordbuilt',

                
                'buildtotals',

                
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
    
    
    crc32: function(str, crc){
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D",
            n = 0, 
            x = 0; 
 
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

    
    initialize: function(firstTime, config){
        var me = this,    
            props = [
                'viewLayoutType', 'rowSubTotalsPosition', 'rowGrandTotalsPosition', 
                'colSubTotalsPosition', 'colGrandTotalsPosition', 'showZeroAsBlank'
            ], i;
            
        
        me.initResults();
        
        
        me.initAggregates(config.aggregate || []);
        
        
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
    
    
    onInitialize: Ext.emptyFn,
    
    
    onDestroy: Ext.emptyFn,
    
    
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
    
    
    onReconfigure: Ext.emptyFn,
    
    
    initResults: function(){
        var me = this;
        
        Ext.destroy(me.results);
        me.results = Ext.create('Mz.aggregate.matrix.Results', me);
    },
    
    
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
    
    
    startProcess: Ext.emptyFn,
    
    
    endProcess: function(){
        var me = this,
            leftTree, topTree;
        
        leftTree = me.leftAxis.getTree();
        topTree = me.topAxis.getTree();
        
        
        me.buildModelAndColumns();
        
        
        me.buildPivotStore();
        if(Ext.isFunction(me.onBuildStore)){
            me.onBuildStore(me.pivotStore);
        }
        me.fireEvent('storebuilt', me, me.pivotStore);
        
        me.fireEvent('done');
    },
    
    
    onBuildModel: Ext.emptyFn,
    
    
    onBuildColumns: Ext.emptyFn,
    
    
    onBuildRecord: Ext.emptyFn,
    
    
    onBuildTotals: Ext.emptyFn,
    
    
    onBuildStore: Ext.emptyFn,
    
    
    buildModelAndColumns: function(){
        var me = this;
            
        me.model = [
            {name: 'id', type: 'string'}
            
        ];
        
        me.buildColumnHeaders(false);
    },
    
    
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
                
                return columns;
            }
        }else{
            if(me.colSubTotalsPosition == 'first'){
                o2 = me.addColSummary(item, disableChangeModel, true);
                if(o2){
                    retColumns.push(o2);
                }
            }
            
            
            
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
    
    
    addColSummary: function(item, disableChangeModel, addColumns){
        var me = this,
            o2, doAdd = false;
            
        
        o2 = me.parseAggregateForColumn(item, {
            text:           item.expanded ? item.getTextTotal() : item.name,
            subTotal:       true
        }, disableChangeModel);

        if(addColumns){
            doAdd = true;
        }else{
            
            
            
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
                topAxis:    true,   
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
    
    
    buildPivotStore: function(){
        var me = this;
        
        if(Ext.isFunction(me.pivotStore.model.setFields)){
            me.pivotStore.model.setFields(me.model);
        }else{
            
            me.pivotStore.model.replaceFields(me.model, true);
        }
        me.pivotStore.removeAll(true);

        Ext.Array.each(me.leftAxis.getTree(), me.addRecordToPivotStore, me);
        me.addGrandTotalsToPivotStore();
    },
    
    
    addGrandTotalsToPivotStore: function(){
        var me = this,
            totals = [];
            
        
        totals.push({
            title:      me.textGrandTotalTpl,
            values:     me.preparePivotStoreRecordData({key: me.grandTotalKey})
        });
        
        
        if(Ext.isFunction(me.onBuildTotals)){
            me.onBuildTotals(totals);
        }
        me.fireEvent('buildtotals', me, totals);
        
        
        Ext.Array.forEach(totals, function(t){
            if(Ext.isObject(t) && Ext.isObject(t.values)){
                
                me.totals.push({
                    title:      t.title || '',
                    record:     me.pivotStore.add(t.values)[0]
                });
            }
        });
    },
    
    
    addRecordToPivotStore: function(item){
        var me = this,
            record;
        
        if(!item.children){
            
            record = me.pivotStore.add(me.preparePivotStoreRecordData(item));
            item.record = record[0];
            
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
    
    
    preparePivotStoreRecordData: function(group){
        var me = this,
            data = {};
        
        data['id'] = group.key;
        Ext.apply(data, group.data || {}); 
        
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
        
        
        
        
        
        
        return data;
    },
    
    
    getColumns: function(){
        return this.model;
    },
    
    
    getColumnHeaders: function(){
        var me = this;
        
        if(!me.model){
            me.buildModelAndColumns();
        }else{
            me.buildColumnHeaders(true);
        }
        return me.columns;
    },
    
    
    isGroupRow: function(key) {
        var obj = this.leftAxis.findTreeElement('key', key);
        if(!obj) return false;
        return (obj['node']['children'] && obj['node']['children'].length == 0) ? 0 : obj['level'];
    },
    
    
    isGroupCol: function(key) {
        var obj = this.topAxis.findTreeElement('key', key);
        if(!obj) return false;
        return (obj['node']['children'] && obj['node']['children'].length == 0) ? 0 : obj['level'];
    }

    
    
    
});

Ext.define('Mz.aggregate.matrix.Local', {
    extend:  Mz.aggregate.matrix.Abstract ,
    
    alias:  'pivotmatrix.local',
    mztype: 'local',
    
               
                                       
                                 
      

    mztypeLeftAxis:     'local',
    mztypeTopAxis:      'local',
    
    
    store:              null,
    
    
    recordsPerJob:      1000,
    
    
    timeBetweenJobs:    2,
    
    constructor: function(){
        var me = this;
        
        me.callParent(arguments);
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                
                'beforeupdate',
                
                
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
            
            newStore = config.store;
        }else{
            if(me.store){
                if(me.store.isStore && !me.storeListeners){
                    
                    store = me.store;
                }else{
                    
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
            
            
            me.store = store;
            
            me.storeListeners = me.store.on({
                refresh:        me.startProcess,
                
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
    
    
    onOriginalStoreBeforeLoad: function(store){
        var me = this;
        
        me.fireEvent('start', me);
    },
    
    
    onOriginalStoreAdd: function(store, records){
        var me = this;
        
        me.newRecords = me.newRecords || [];
        me.newRecords = Ext.Array.merge(me.newRecords, Ext.Array.from(records));
        
        me.newRecordsDelayedTask.delay(100);
    },
    
    
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
    
    
    onOriginalStoreUpdate: function(store, records){
        var me = this;
        
        me.updateRecords = me.updateRecords || [];
        me.updateRecords = Ext.Array.merge(me.updateRecords, Ext.Array.from(records));
        
        me.updateRecordsDelayedTask.delay(100);
    },
    
    
    onOriginalStoreUpdateDelayed: function(){
        var me = this;
        
        me.recalculateResults(me.store, me.updateRecords);
        me.updateRecords.length = 0;
    },
    
    
    onOriginalStoreRemove: function(store, record, index, isMove){
        if(isMove){
            
            return;
        }
        
        
        this.startProcess();
    },
    
    
    isReallyDirty: function(store, records){
        var me = this,
            found = true;
        
        records = Ext.Array.from(records);
        
        me.leftAxis.dimensions.each(function(dimension){
            Ext.Array.forEach(records, function(record){
                found = (record && record.isModel && dimension.values.containsKey(record.get(dimension.dataIndex)));
                return found;
            });
            return found;
        });
        
        return !found;
    },
    
    
    recalculateResults: function(store, records){
        var me = this;
        
        if(me.isReallyDirty(store, records)){
            me.startProcess();
            return;
        }
        
        me.fireEvent('beforeupdate', me);

        
        me.results.calculate();
        
        Ext.Array.each(me.leftAxis.getTree(), me.updateRecordToPivotStore, me);
        
        me.updateGrandTotalsToPivotStore();

        me.fireEvent('afterupdate', me);
    },

    
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
        
        
        if(Ext.isFunction(me.onBuildTotals)){
            me.onBuildTotals(totals);
        }
        me.fireEvent('buildtotals', me, totals);
        
        
        if(me.totals.length === totals.length){
            for(i = 0; i < me.totals.length; i++){
                if(Ext.isObject(totals[i]) && Ext.isObject(totals[i].values) && (me.totals[i].record instanceof Ext.data.Model) ){
                    delete(totals[i].values.id);
                    me.totals[i].record.set(totals[i].values);
                }
            }
        }
    },
    
    
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
        
        
        if(!me.store || (me.store && !me.store.isStore) || me.isDestroyed){
            
            return;
        }
        
        me.clearData();
        
        me.localDelayedTask.delay(50);
    },
    
    delayedProcess: function(){
        var me = this;
        
        
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
        
        
        if(me.isDestroyed){
            return;
        }
        
        me.statusInProgress = true;

        while(i < totalLength && i < position + me.recordsPerJob && me.statusInProgress){
            me.processRecord(me.records[i], i, totalLength);
            i++;
        }
        
        
        if(i >= totalLength){
            me.statusInProgress = false;
            
            
            me.results.calculate();

            
            me.leftAxis.buildTree();
            me.topAxis.buildTree();

            
            if(me.filterApplied){
                me.results.calculate();
            }
            
            me.endProcess();
            return;
        }
        
        
        if(me.statusInProgress && totalLength > 0){
            Ext.defer(me.processRecords, me.timeBetweenJobs, me, [i]);
        }
    },
    
    
    processRecord: function(record, index, length){
        var me = this,
            grandTotalKey = me.grandTotalKey,
            leftKeys, topKeys, i, j;
        
        
        
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
    
    
    getRecordsByGroups: function(rowKey, colKey){
        var result = this.results.get(rowKey, colKey);
        
        return ( result ? result.records || [] : []);
    }
    
});

Ext.define('Mz.aggregate.matrix.Remote', {
    extend:  Mz.aggregate.matrix.Abstract ,
    
    alias:  'pivotmatrix.remote',
    mztype: 'remote',
    
    
    url:    '',
    
    onInitialize: function(){
        var me = this;
        
        me.remoteDelayedTask = new Ext.util.DelayedTask(me.delayedProcess, me);
        
        me.callParent(arguments);
    },
    
    startProcess: function(){
        var me = this;
        
        if(Ext.isEmpty(me.url)){
            
            return;
        }
        
        me.clearData();
        
        
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
            
            me.store.model.replaceFields(fields, true);
        }
        me.store.removeAll(true);
        me.store.suspendEvents(false);

        me.storeInfo = {};

        if(!Ext.isFunction(fn)){
            
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
                
                me.storeInfo[record.internalId].rendererParams['topaxis'] = {
                    fn: 'topAxisRenderer'
                };
            });
            
            me.store.add(record);
        });
    },
    


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
        
        
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: (hasSummaryData ? 'topAxisRenderer' : 'topAxisNoRenderer')
        };
        
        config.results.push(record);
    },

    processRecordOutline: function(config){
        var me = this,
            group = config['group'], 
            found = false,
            
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
        
        
        me.storeInfo[record.internalId].rendererParams['topaxis'] = {
            fn: 'topAxisRenderer'
        };

        config.results.push(record);
    },
    
    

    
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

Ext.define('Mz.pivot.feature.PivotEvents',{
    extend:  Ext.grid.feature.Feature ,
    
    alias: 'feature.pivotevents',

               
                                     
      

    eventPrefix:    'pivotcell',
    eventSelector:  '.' + Ext.baseCSSPrefix + 'grid-cell',

    
    lockedViewGridCls:          Ext.baseCSSPrefix + 'pivot-gridview-locked',
    
    
    summaryDataCls:             Ext.baseCSSPrefix + 'pivot-summary-data',
    summaryDataSelector:        '.' + Ext.baseCSSPrefix + 'pivot-summary-data',
    cellSelector:               '.' + Ext.baseCSSPrefix + 'grid-cell',
    groupHeaderCls:             Ext.baseCSSPrefix + 'pivot-group-header',
    groupHeaderCollapsibleCls:  Ext.baseCSSPrefix + 'pivot-group-header-collapsible',

    
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
            
            eventName = 'pivottotal';
        }else if(row.hasCls(me.summaryRowCls)){
            
            eventName = 'pivotgroup';
        }else if(row.hasCls(me.summaryDataCls)){
            
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

Ext.define('Mz.pivot.feature.PivotViewCommon',{
    extend:  Mz.pivot.feature.PivotEvents ,
    
    
    groupTitleCls:              Ext.baseCSSPrefix + 'pivot-group-title',
    groupHeaderCollapsedCls:    Ext.baseCSSPrefix + 'pivot-group-header-collapsed',
    tableCls:                   Ext.baseCSSPrefix + 'grid-table',
    rowCls:                     Ext.baseCSSPrefix + 'grid-row',
    dirtyCls:                   Ext.baseCSSPrefix + 'grid-dirty-cell',
    
    
    outlineCellHiddenCls:       Ext.baseCSSPrefix + 'pivot-outline-cell-hidden',
    outlineCellGroupExpandedCls:Ext.baseCSSPrefix + 'pivot-outline-cell-previous-expanded',
    
    compactGroupHeaderCls:      Ext.baseCSSPrefix + 'pivot-group-header-compact',
    
    compactLayoutPadding:       25,

    cellTpl: [
        '{%',
            'values.hideCell = values.tdAttr == "hidden";\n',
            
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
            
            value = me.encodeValue(value, group);
            
            if(colspan > 0){
                metaData.tdAttr = 'id="' + group.key + '" colspan = "' + colspan + '"';
                
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
            
            value = me.encodeValue(value, group);
            
            if(hidden){
                
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
    
    
    encodeValue: function(value, group){
        return value;
        
    }
});

Ext.define('Mz.pivot.feature.PivotView50', {
    extend:  Mz.pivot.feature.PivotViewCommon ,
    
    alias: 'feature.pivotview50',
    
    outerTpl: [
        '{%',
            
            'var me = this.pivotViewFeature;',
            'if (!(me.disabled)) {',
                'me.setup();',
            '}',

            
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

        
        view.addTpl(Ext.XTemplate.getTpl(me, 'outerTpl')).pivotViewFeature = me;
        
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

Ext.define('Mz.pivot.feature.PivotView42', {
    extend:  Mz.pivot.feature.PivotViewCommon ,
    
    alias: 'feature.pivotview42',
    
    tableTpl: {
        before: function (values) {
            this.pivotViewFeature.setup();
        },
        after: function (values) {
            
            
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

        
        view.addTableTpl(me.tableTpl).pivotViewFeature = me;
        
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
                Ext.baseCSSPrefix + 'grid-cell ' + Ext.baseCSSPrefix + 'grid-td' 
            ]
        };

        me.view.preserveScrollOnRefresh = true;
    },
    
    getFragmentTpl: function() {
        var me = this;
        
        return {
            
            getPivotFeature: function(){
                return me;
            }
        };
    },

    
    getMetaRowTplFragments: function() {
        return {
            isRow: this.isRow,
            closeRow: this.closeRow
        };
    },

    
    
    isRow: function() {
        
        
        return '{% this.getPivotFeature().renderGroups(out); %}' + '<tpl if="typeof rows === \'undefined\'">';
    },

    
    
    closeRow: function() {
        return '</tpl>';
    },

    
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

            me.renderRow(record, out);
        });
    },
    
    
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
                
                
                record.cssWarning = true;
                cellValues.tdCls += ' ' + cellValues.css;
                delete cellValues.css;
            }
        } else {
            value = fieldValue;
        }
        cellValues.value = (value == null || value === '') ? '&#160;' : value;

        
        classes[1] = Ext.baseCSSPrefix + 'grid-cell-' + column.getItemId();
            
        
        
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

        
        classes.length = clsInsertPoint;

        cellValues.tdCls = classes.join(' ');

        cellTpl.applyOut(cellValues, out);
        
        
        cellValues.column = null;
    }
    
    
});

Ext.define('Mz.pivot.Grid', {
    extend:  Ext.grid.Panel ,

    alternateClassName: 'Mz.pivot.Table',
    alias: 'widget.mzpivotgrid',
    
               
                                    
                                     
                                       
                                       
                                       
                               
                             
      
    
    subGridXType:       'gridpanel',
    debugMode:          false,
    
    
    matrixConfig:       null,
    
    
    enableLoadMask:     true,

    
    enableLocking:      false,

    
    columnLines:        true,

    
    viewLayoutType:             'outline',

    
    rowSubTotalsPosition:       'first',

    
    rowGrandTotalsPosition:     'last',

    
    colSubTotalsPosition:       'last',

    
    colGrandTotalsPosition:     'last',

    
    textTotalTpl:               'Total ({name})',

    
    textGrandTotalTpl:          'Grand total',

    
    leftAxis:           null,

    
    topAxis:            null,

    
    aggregate:          null,
    
    
    clsGroupTotal:      Ext.baseCSSPrefix + 'grid-group-total',

    
    clsGrandTotal:      Ext.baseCSSPrefix + 'grid-grand-total',
    
    
    startRowGroupsCollapsed: true,
    
    
    startColGroupsCollapsed: true,
    
    
    showZeroAsBlank: false,
    
    stateEvents: [
        'pivotgroupexpand', 'pivotgroupcollapse', 'pivotdone'
    ],
    
    
    initComponent : function(){
        var me = this;
        
        me.columns = [];

        me.preInitialize();
        me.callParent(arguments);
        me.postInitialize();
    },
    
    
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

        
        if(me.store){
            me.originalStore = me.store;
        }
        
        
        me.store = Ext.create('Ext.data.ArrayStore', {
            fields: []
        });
        
        me.enableColumnMove = false;
        
        me.delayedTask = new Ext.util.DelayedTask(me.refreshView, me);
    },
    
    
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
                
                'pivotstart',
                
                
                'pivotprogress',

                
                'pivotdone',

                
                'pivotmodelbuilt',

                
                'pivotcolumnsbuilt',

                
                'pivotrecordbuilt',

                
                'pivotbuildtotals',

                
                'pivotstorebuilt',
                
                
                'pivotgroupexpand',
                
                
                'pivotgroupcollapse',
                
                
                'pivotgroupclick',

                
                'pivotgroupdblclick',

                
                'pivotgroupcontextmenu',

                
                'pivotgroupcellclick',

                
                'pivotgroupcelldblclick',

                
                'pivotgroupcellcontextmenu',

                
                'pivotitemclick',

                
                'pivotitemdblclick',

                
                'pivotitemcontextmenu',

                
                'pivotitemcellclick',

                
                'pivotitemcelldblclick',

                
                'pivotitemcellcontextmenu',
                
                
                'pivottotalclick',

                
                'pivottotaldblclick',

                
                'pivottotalcontextmenu',

                
                'pivottotalcellclick',

                
                'pivottotalcelldblclick',

                
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
    
    
    onMatrixClearData: function(){
        var me = this;
        
        me.store.removeAll(true);
        if(!me.expandedItemsState){
            me.lastColumnsState = null;
        }
    },
    
    
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
    
    
    onMatrixBeforeUpdate: function(){
        
        this.store.suspendEvents();
    },
    
    
    onMatrixAfterUpdate: function(){
        var me = this;
        
        me.store.resumeEvents();
        me.store.fireEvent('pivotstoreremodel');
    },
    
    
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
            }
            
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
    
    
    getMatrix: function(){
        return this.matrix;
    },
    
    
    doExpandCollapseTree: function(tree, expanded){
        var i;
        
        for(i = 0; i < tree.length; i++){
            tree[i].expanded = expanded;
            if(tree[i].children){
                this.doExpandCollapseTree(tree[i].children, expanded);
            }
        }
    },
    
    
    doExpandCollapse: function(type, groupId, state){
        var me = this,
            item;
        
        if(!me.matrix){
            
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

        
        me.fireEvent((item.node.expanded ? 'pivotgroupexpand' : 'pivotgroupcollapse'), me, type, item.node);
    },
    
    
    expandRow: function(groupId){
        this.doExpandCollapse('row', groupId, true);
    },
    
    
    collapseRow: function(groupId){
        this.doExpandCollapse('row', groupId, false);
    },
    
    
    expandCol: function(groupId){
        this.doExpandCollapse('col', groupId, true);
    },
    
    
    collapseCol: function(groupId){
        this.doExpandCollapse('col', groupId, false);
    },
    
    
    expandAll: function(){
        var me = this;
        
        me.expandAllColumns();
        me.expandAllRows();
    },
    
    
    expandAllRows: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), true);
        me.delayedTask.delay(10);
    },
    
    
    expandAllColumns: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), true);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },
    
    
    collapseAll: function(){
        var me = this;
        
        me.collapseAllRows();
        me.collapseAllColumns();
    },
    
    
    collapseAllRows: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().leftAxis.getTree(), false);
        me.delayedTask.delay(10);
    },
    
    
    collapseAllColumns: function(){
        var me = this;

        if(!me.getMatrix()) return;
        me.doExpandCollapseTree(me.getMatrix().topAxis.getTree(), false);
        me.scheduledReconfigure = true;
        me.delayedTask.delay(10);
    },

    
    getStore: function(){
        var me = this,
            matrix = me.getMatrix();
        
        return ( (matrix instanceof Mz.aggregate.matrix.Local) ? matrix.store : me.originalStore ) || me.store;
    },
    
    
    getPivotStore: function(){
        return this.store;
    },
    
    
    onHeaderClick: function(ct, column, e){
        var me = this, 
            columns, el,
            sortState = (column.sortState ? (column.sortState == 'ASC' ? 'DESC' : 'ASC') : 'ASC');
        
        if(!column.xexpandable) {
            if(e) {
                e.stopEvent();
            }

            if((column.leftAxis || column.topAxis) && !Ext.isEmpty(column.dataIndex)){
                
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
    
    
    getState: function(){
        var me = this,
            state = {},
            props = me.getStateProperties(),
            i;
        
        for(i = 0; i < props.length; i++){
            state[props[i]] = me[props[i]];
        }
        
        
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
        
        
        me.matrix.leftAxis.dimensions.each(function(item, index){
            state['leftAxis'][index]['id'] = item.getId();
        });
        
        state['pivotcolumns'] = me.getPivotColumnsState();
        
        return state;
    },
    
    
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
    
    
    restorePivotColumnsState: function(columns){
        var me = this,
            
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



Ext.define('Mz.pivot.dataexport.Formatter', {
    
    onlyExpandedNodes:  false,

    matrix:             null,
    config:             null,
    data:               null,

    
    constructor: function(config){
        var me = this;
        
        config = config || {};
        
        me.matrix = config.matrix;
        me.onlyExpandedNodes = config.onlyExpandedNodes;
        me.config = config.config;
        
        
        me.data = me.prepareData();
    },

    
    format: Ext.emptyFn,
    
    
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

Ext.define('Mz.pivot.dataexport.excel.Workbase', {
    
               
                        
                                         
      
    
    constructor: function (config) {
        var me = this;
        
        config = Ext.clone(config || {});
        
        Ext.apply(me, config, {
            
            title: "Workbook",

            
            cellFontName: "Arial",

            
            cellFontSize: "10",

            
            cellBorderColor: "#E4E4E4",

            
            cellFillColor: "",

            
            titleFontSize: "14",

            
            titleFillColor: "",

            
            dateFormat:     'Short Date',

            
            numberFormat:   'Standard',
            
            
            styles: [],

            
            compiledStyles: []            
        });
    },
    
    
    addStyle: function (config) {
        var me = this,
            style = Ext.create('Mz.pivot.dataexport.excel.Style', config || {});

        me.styles.push(style);

        return style;
    },

    
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

Ext.define('Mz.pivot.dataexport.excel.Worksheet', {
    extend:  Mz.pivot.dataexport.excel.Workbase ,

    constructor: function (config) {
        var me = this;
        
        me.callParent(arguments);

        Ext.applyIf(me, {
            
            showTitle: true,
            
            
            groupHeaderFontSize: "10",

            
            groupHeaderFillColor: "#D8D8D8",

            
            groupFooterFontSize: "10",

            
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
                
                '{header}',
                
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
            
        
        values = Ext.Array.pluck(me.styles, 'id');
        if(Ext.Array.indexOf(values, 'SummaryHeader' + level) < 0){
            me.addSummaryStyle('SummaryHeader', level, me.groupHeaderFontSize, me.groupHeaderFillColor);
            me.addSummaryStyle('SummaryFooter', level, me.groupFooterFontSize, me.groupFooterFillColor);
        }
    }

});

Ext.define('Mz.pivot.dataexport.excel.Workbook', {
    extend:  Mz.pivot.dataexport.excel.Workbase ,
    
               
                        
                                              
                                         
                                         
      
    
    constructor: function (config) {
        var me = this;
        
        me.callParent(arguments);
        
        Ext.applyIf(me, {
            
            hasDefaultStyle: true,

            
            headerFontSize: "10",

            
            headerFillColor: "#BFBFBF",

            
            windowHeight: 9000,

            
            windowWidth: 50000,

            
            protectStructure: false,

            
            protectWindows: false,
        
            
            worksheets: [],

            
            compiledWorksheets: []

        });
        
        if (me.hasDefaultStyle) {
            me.addDefaultStyle();
        }

        me.addHeaderStyle();
    },

    
    render: function () {
        var me = this;
        
        me.compileWorksheets();
        me.joinedWorksheets = me.compiledWorksheets.join("");

        me.compileStyles();
        me.joinedCompiledStyles = me.compiledStyles.join("");

        return me.tpl.apply(me);
    },

    
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

Ext.define('Mz.pivot.dataexport.excel.Formatter', {
    extend:  Mz.pivot.dataexport.Formatter ,

               
                                            
      

    format: function () {
        var me = this,
            workbook = Ext.create('Mz.pivot.dataexport.excel.Workbook', me.config || {});
            
        workbook.addWorksheet(me.data, me.config || {});

        return workbook.render();
    }
});

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
    
    
    height:         26,
    
    initComponent: function() {
        var me = this;
        
        me.callParent(arguments);
        
        if (!Ext.getVersion('extjs').match(5.0)) {
            me.addEvents(
                
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
            
            if(target.items.getCount() > 0){
                
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

        
        if (targetHeader === me.lastTargetHeader && pos === me.lastDropPos) {
            return;
        }
        nextHd       = dragHeader.nextSibling('gridcolumn:not([hidden])');
        prevHd       = dragHeader.previousSibling('gridcolumn:not([hidden])');
        me.lastTargetHeader = targetHeader;
        me.lastDropPos = pos;

        
        

        data.dropLocation = dropLocation;

        if ((dragHeader !== targetHeader) &&
            ((pos === "before" && nextHd !== targetHeader) ||
            (pos === "after" && prevHd !== targetHeader)) &&
            !targetHeader.isDescendantOf(dragHeader)) {

            
            
            
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
            
            
            if(targetHeader instanceof Mz.pivot.plugin.configurator.Container && targetHeader.items.getCount() > 0){
                
                topXY = topIndicator.getAlignToXY(targetHeader.items.last().el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.items.last().el, bottomAnchor);
            }else{
                topXY = topIndicator.getAlignToXY(targetHeader.el, topAnchor);
                bottomXY = bottomIndicator.getAlignToXY(targetHeader.el, bottomAnchor);
            }

            
            headerCtEl = me.panel.el;
            minX = headerCtEl.getX() - me.indicatorXOffset;
            maxX = headerCtEl.getX() + headerCtEl.getWidth();

            topXY[0] = Ext.Number.constrain(topXY[0], minX, maxX);
            bottomXY[0] = Ext.Number.constrain(bottomXY[0], minX, maxX);

            
            topIndicator.setXY(topXY);
            bottomIndicator.setXY(bottomXY);
            topIndicator.show();
            bottomIndicator.show();

        
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
        
        var me = this,
            dragColumn = data.header,
            dropLocation = data.dropLocation,
            newCol, pos, newPos;
        
        if (me.valid && dropLocation){
            
            
            if(dragZone.id != me.panel.id){
                pos = me.panel.getColumnPosition(dropLocation.header, dropLocation.pos);
                newCol = dragColumn.serialize();
                
                
                if(!me.panel.isAgg){
                    dragZone.panel.remove(dragColumn);
                }
                
                me.panel.addColumn(newCol.dimension, pos, true);
            }else{
                
                me.panel.moveColumn(dragColumn.id, dropLocation.header instanceof Mz.pivot.plugin.configurator.Container ? dropLocation.header.items.last().id : dropLocation.header.id, dropLocation.pos);
            }
            
        }
        
    }
});

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
    
    
    addColumn: function(config, pos, notify){
        var me = this, newCol, cfg = {},
            itemFound = me.items.findIndex('dimensionId', new RegExp('^' + config.id + '$', 'i')) >= 0;
        
        if(!me.isAgg){
            
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
    
    
    getColumnPosition: function(column, position){
        var me = this, pos;
        
        if(column instanceof Mz.pivot.plugin.configurator.Column){
            
            pos = me.items.findIndex('id', column.id);
            pos = (position === 'before') ? pos : pos + 1;
        }else{
            pos = -1;
        }
        return pos;
    },
    
    
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
    
    
    updateColumnIndexes: function(){
        var me = this;
        
        me.items.each(function(item, index, all){
            item.index = index;
        });
    },
    
    
    notifyGroupChange: function(){
        var me = this;
        me.fireEvent('configchange');
    },
    
    
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
    
    
    hideGroupByText: function(){
        var me = this,
            method;
        
        if(me.targetEl){
            method = me.targetEl.setHtml ? 'setHtml' : 'setHTML';
            me.targetEl[method]('');
        }
    }
    
    
});

Ext.define('Mz.pivot.plugin.configurator.Panel', {
    extend:  Ext.container.Container ,

               
                                                
      
    
    alias: 'widget.mzconfigpanel',
    
    dock:       'top',
    
    weight:         50, 
    
    minHeight:      78,
    grid:           null,
    fields:         [],
    refreshDelay:   1000,
    
    
    panelAllFieldsText:     'Drop Unused Fields Here',

    
    panelTopFieldsText:     'Drop Column Fields Here',

    
    panelLeftFieldsText:    'Drop Row Fields Here',

    
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
            
            defaults: {
                xtype:          'mzconfigcontainer',
                
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

    
    onConfigChanged: function(){
        var me = this,
            topAxis = [], leftAxis = [], agg = [];
        
        if(me.disabled) {
            
            return;
        }
        
        me.task.delay(me.refreshDelay);
    },
    
    
    getFieldsFromContainer: function(ct, excludeWidth){
        var fields = [];
        
        ct.items.each(function(item){
            fields.push(item.dimension);
        });
        
        return fields;
    },
    
    
    onSortChanged: function(column, direction){
        var me = this, fields;
        
        if(me.disabled) {
            
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
            
            return;
        }
        
        me.task.delay(me.refreshDelay);
    },
    
    
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
        
        
        if(!me.lastFields){
            me.lastFields = me.fetchAllFieldConfigurations();
        }
        
        cFields = me.lastFields.clone();
        
        
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
        
        
        Ext.each(Ext.Array.merge(fieldsTop, fieldsLeft), function(item){
            var i, found = false;
            
            
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
    
    
    addFieldsToConfigurator: function(fields, fieldsCt){
        Ext.each(fields, function(item, index, len){
            fieldsCt.addColumn(item, -1);
        });
    },
    
    
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

Ext.define('Mz.pivot.plugin.Configurator', {
    extend:  Ext.AbstractPlugin ,
               
                               
                                
                                     
                                            
      

    alias: 'plugin.mzconfigurator',
    
    
    fields:         [],
    
    
    refreshDelay:   300,

    
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
        
        
        if(me.gridMaster.down('mzconfigpanel')){
            
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
                
                'configchange',
                
                
                'fieldsort',
                
                
                'showconfigpanel',
                
                
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

Ext.define('Mz.pivot.plugin.drilldown.PagingMemoryProxy', {
    extend:  Ext.data.proxy.Memory ,
    alias: 'proxy.mzpagingmemory',

    read : function(operation, callback, scope){
        var reader = this.getReader(),
            result = reader.read(this.data),
            sorters, filters, sorterFn, records;

        scope = scope || this;
        
        filters = operation.filters;
        if (filters && filters.length > 0) {
            
            
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
        
        
        sorters = operation.sorters;
        if (sorters && sorters.length > 0) {
            
            sorterFn = function(r1, r2) {
                var result = sorters[0].sort(r1, r2),
                    length = sorters.length,
                    i;
                
                    
                    for (i = 1; i < length; i++) {
                        result = result || sorters[i].sort.call(this, r1, r2);
                    }                
               
                return result;
            };
    
            result.records.sort(sorterFn);
        }
        
        
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


Ext.define('Mz.pivot.plugin.DrillDown', {
	alias: 'plugin.mzdrilldown',

	extend:  Ext.AbstractPlugin ,
	
	           
                        
                                                      
		                    
                         
		                    
	  

	mixins: {
        observable:  Ext.util.Observable 
    },
	
    
	columns: 	[],
        
	width:		400,
        
	height:		300,
        
	textWindow: 'Drill down window',
	
    
    lockableScope:  'top',
    
	init: function(grid){
	    
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
            
	        
	        if (columns.length === 0) {
	            Ext.Array.each(fields, function (value, index, all) {
	                columns.push({
	                    header: Ext.String.capitalize(value.name),
	                    dataIndex: value.name
	                });
	            });
	        }

	        
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
	                    store: store,   
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

Ext.define('Mz.pivot.plugin.ExcelExport', {
    alias: 'plugin.mzexcelexport',
    extend:  Ext.AbstractPlugin ,

               
                                             
      

    constructor: function(config){
        var me = this;
        
        config = config || {};
        
        me.config = Ext.apply({
            
            showTitle: true,

            
            title: "Workbook",

            
            cellFontName: "Arial",

            
            cellFontSize: "10",

            
            cellBorderColor: "#E4E4E4",

            
            cellFillColor: "",

            
            titleFontSize: "14",

            
            titleFillColor: "",

            
            headerFontSize: "10",

            
            headerFillColor: "#BFBFBF",

            
            groupHeaderFontSize: "10",

            
            groupHeaderFillColor: "#D8D8D8",

            
            groupFooterFontSize: "10",

            
            groupFooterFillColor: "#BFBFBF",

            
            dateFormat:     'Short Date',

            
            numberFormat:   'Standard',

            
            hasDefaultStyle: true,

            
            windowHeight: 9000,

            
            windowWidth: 50000,

            
            protectStructure: false,

            
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

Ext.define('Mz.pivot.plugin.RangeEditor', {
    alias: 'plugin.mzrangeeditor',

    extend:  Ext.AbstractPlugin ,
    
               
                        
                            
                              
                                
                                  
                                 
                            
                        
      

    mixins: {
        observable:  Ext.util.Observable 
    },
    
        
    width:        280,
        
    height:        180,
        
    textWindowTitle:    'Range editor',
        
    textFieldValue:     'Value',
        
    textFieldEdit:      'Field',
        
    textFieldType:      'Type',
        
    textButtonOk:       'Ok',
        
    textButtonCancel:   'Cancel',
        
    textTypePercentage: 'Percentage',
        
    textTypeIncrement:  'Increment',
        
    textTypeOverwrite:  'Overwrite',
        
    textTypeUniformly:  'Uniformly',
    
    
    onBeforeRecordsUpdate: Ext.emptyFn,

    
    onAfterRecordsUpdate: Ext.emptyFn,
	
    
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
