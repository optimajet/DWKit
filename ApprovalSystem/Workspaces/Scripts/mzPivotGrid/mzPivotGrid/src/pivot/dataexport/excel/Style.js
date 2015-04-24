/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
*   Class used to create an Excel style
*/
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

    /**
     * Iterates over the attributes in this style, and any children they may have, creating property
     * strings on each suitable for use in the XTemplate
     */
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

    /**
     * Builds a concatenated property string for a given attribute, suitable for use in the XTemplate
     */
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