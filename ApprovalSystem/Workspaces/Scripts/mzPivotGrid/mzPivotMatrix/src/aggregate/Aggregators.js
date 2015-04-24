/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/

/**
* This class contains all predefined aggregator functions.
* @singleton
* 
*/
Ext.define('Mz.aggregate.Aggregators', {
    singleton: true,
    
    /**
    * Calculates the sum of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    sum: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total  = 0,
            i;
        
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        
        return total;
    },

    /**
    * Calculates the avg of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    avg: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var length = records.length,
            total  = 0,
            i;
        
        for (i = 0; i < length; i++) {
            total += Ext.Number.from(records[i].get(measure), 0);
        }
        
        return length > 0 ? (total / length) : 0;
    },

    /**
    * Calculates the min of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    min: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var data   = [],
            length = records.length,
            i, v;
        
        for (i = 0; i < length; i++) {
            data.push(records[i].get(measure));
        }
        
        v = Ext.Array.min(data);
        return v;
    },

    /**
    * Calculates the max of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    max: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var data   = [],
            length = records.length,
            i;
        
        for (i = 0; i < length; i++) {
            data.push(records[i].get(measure));
        }
        
        v = Ext.Array.max(data);
        return v;
    },

    /**
    * Calculates the count of all records using the measure field.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    count: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        return records.length;
    },

    /**
    * Calculates the percentage from the row group sum.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    groupSumPercentage: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var sumFn = Mz.aggregate.Aggregators.sum,
            length = records.length,
            result, resultParent,
            sum = 0, sumParent = 0,
            keys = rowGroupKey.split(matrix.keysSeparator);
        
        if(length == 0) return 0;
        
        keys.pop();
        keys = keys.join(matrix.keysSeparator);
        if(Ext.isEmpty(keys)){
            keys = matrix.grandTotalKey;
        }
        
        result = matrix.results.get(rowGroupKey, colGroupKey);
        if(result){
            sum = result.getValue('groupSum');
            if(!Ext.isDefined(sum)){
                sum = result.calculateByFn('groupSum', measure, sumFn);
            }
        }
        
        resultParent = matrix.results.get(keys, colGroupKey);
        if(resultParent){
            sumParent = resultParent.getValue('groupSum');
            if(!Ext.isDefined(sumParent)){
                sumParent = resultParent.calculateByFn('groupSum', measure, sumFn);
            }
        }
        
        return (sumParent > 0 && sum > 0) ? sum/sumParent * 100 : 0;
    },

    /**
    * Calculates the percentage from the row group count.
    * 
    * @param {Array} records Records to process.
    * @param {String} measure Field to aggregate by.
    * @param {Mz.pivot.Matrix} matrix The matrix object reference.
    * @param {String} rowGroupKey Key of the row group.
    * @param {String} colGroupKey Key of the col group.
    * 
    * @returns {Float/String}
    */
    groupCountPercentage: function(records, measure, matrix, rowGroupKey, colGroupKey) {
        var countFn = Mz.aggregate.Aggregators.count,
            length = records.length,
            result, resultParent,
            sum = 0, sumParent = 0,
            keys = rowGroupKey.split(matrix.keysSeparator);
        
        if(length == 0) return 0;
        
        keys.pop();
        keys = keys.join(matrix.keysSeparator);
        if(Ext.isEmpty(keys)){
            keys = matrix.grandTotalKey;
        }

        result = matrix.results.get(rowGroupKey, colGroupKey);
        if(result){
            sum = result.getValue('groupCount');
            if(!Ext.isDefined(sum)){
                sum = result.calculateByFn('groupCount', measure, countFn);
            }
        }
        
        resultParent = matrix.results.get(keys, colGroupKey);
        if(resultParent){
            sumParent = resultParent.getValue('groupCount');
            if(!Ext.isDefined(sumParent)){
                sumParent = resultParent.calculateByFn('groupCount', measure, countFn);
            }
        }
        
        return (sumParent > 0 && sum > 0) ? sum/sumParent * 100 : 0;
    }

});


