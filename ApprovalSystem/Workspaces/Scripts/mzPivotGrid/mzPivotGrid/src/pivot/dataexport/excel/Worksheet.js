/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
*   Class used to create an Excel worksheet
*/
Ext.define('Mz.pivot.dataexport.excel.Worksheet', {
    extend: 'Mz.pivot.dataexport.excel.Workbase',

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