/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* @private
* This is the class that implements common functions of all features.
* 
*/
Ext.define('Mz.pivot.feature.PivotViewCommon',{
    extend: 'Mz.pivot.feature.PivotEvents',
    
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