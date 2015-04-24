/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

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
