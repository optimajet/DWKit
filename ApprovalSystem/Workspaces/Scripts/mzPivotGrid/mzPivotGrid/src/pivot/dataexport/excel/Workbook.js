/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
*   Class used to create an Excel workbook
*/
Ext.define('Mz.pivot.dataexport.excel.Workbook', {
    extend: 'Mz.pivot.dataexport.excel.Workbase',
    
    requires: [
        'Ext.XTemplate',
        'Mz.pivot.dataexport.excel.Worksheet',
        'Mz.pivot.dataexport.excel.Cell',
        'Mz.pivot.dataexport.excel.Style'
    ],
    
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