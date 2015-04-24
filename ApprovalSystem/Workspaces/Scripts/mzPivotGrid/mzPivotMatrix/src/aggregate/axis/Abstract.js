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
* This class is used for building pivot axis.
*/
Ext.define('Mz.aggregate.axis.Abstract', {

    alias: 'pivotaxis.abstract',
    
    requires: [
        'Mz.aggregate.MixedCollection',
        'Mz.aggregate.dimension.Item',
        'Mz.aggregate.axis.Item'
    ],
    
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
