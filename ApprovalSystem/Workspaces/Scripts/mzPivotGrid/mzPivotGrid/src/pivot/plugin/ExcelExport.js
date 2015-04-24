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
    extend: 'Ext.AbstractPlugin',

    requires: [
        'Mz.pivot.dataexport.excel.Formatter'
    ],

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