/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This class is used when running in ExtJS 4.2.x
* It is automatically added to the pivot grid.
* 
*/
Ext.define('Mz.pivot.feature.PivotView42', {
    extend: 'Mz.pivot.feature.PivotViewCommon',
    
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