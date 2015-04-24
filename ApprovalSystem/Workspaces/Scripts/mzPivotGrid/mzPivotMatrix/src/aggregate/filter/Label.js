/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* Label filter class
* 
*/
Ext.define('Mz.aggregate.filter.Label', {
    extend: 'Mz.aggregate.filter.Abstract',

    alias: 'pivotfilter.label',
    
    mztype: 'label',
    
    inheritableStatics: {
        /**
        * Filter type 'begins with'
        * 
        * @type Number
        */
        TypeBeginsWith:             21,
        /**
        * Filter type 'not begin with'
        * 
        * @type Number
        */
        TypeDoesNotBeginWith:       22,
        /**
        * Filter type 'ends with'
        * 
        * @type Number
        */
        TypeEndsWith:               23,
        /**
        * Filter type 'not end with'
        * 
        * @type Number
        */
        TypeDoesNotEndWith:         24,
        /**
        * Filter type 'contains'
        * 
        * @type Number
        */
        TypeContains:               25,
        /**
        * Filter type 'does not contain'
        * 
        * @type Number
        */
        TypeDoesNotContain:         26
    },

    /**
    * Check if the specified value matches the filter type/value
    * 
    * @param value
    */
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
        
        // no valid type was specified. check if it matches the parent class.
        return me.callParent(arguments);
    },
    
    /**
    * Check if the specified string contains the substring
    * 
    * @param s
    * @param start
    * @param ignoreCase
    */
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
    
    /**
     * Checks if a string starts with a substring
     * In ExtJS 4.2.x this function is part of Ext.String class. Added here for compatibility with 4.1.x.
     * @param {String} s The original string
     * @param {String} start The substring to check
     * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
     */
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
    
    /**
     * Checks if a string ends with a substring
     * In ExtJS 4.2.x this function is part of Ext.String class. Added here for compatibility with 4.1.x.
     * @param {String} s The original string
     * @param {String} start The substring to check
     * @param {Boolean} [ignoreCase=false] True to ignore the case in the comparison
     */
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