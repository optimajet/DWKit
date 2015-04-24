/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This class is used when running in ExtJS 4.1.x.
* It is automatically added to the pivot grid.
* 
*/
Ext.define('Mz.pivot.feature.PivotView41', {
    extend: 'Mz.pivot.feature.PivotViewCommon',

    alias: 'feature.pivotview41',

    requires: [
        'overrides.util.Format'
    ],
    
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