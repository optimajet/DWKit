/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


/**
* German translation by Daniel Grana
* 
*/

Ext.define('Mz.locale.de.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Summe ({name})',
    textGrandTotalTpl:  'Gesamtsumme'
});

Ext.define('Mz.locale.de.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Unbenutzte Felder hier platzieren',
    panelTopFieldsText:     'Felder für Spalten hier platzieren',
    panelLeftFieldsText:    'Felder für Zeilen hier platzieren',
    panelAggFieldsText:     'Felder für Summen hier platzieren'

});

Ext.define('Mz.locale.de.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Summe',
    avgText:                    'Durchschnitt',
    countText:                  'Anzahl',
    minText:                    'Min',
    maxText:                    'Max',
    groupSumPercentageText:     'Prozent Blocksumme',
    groupCountPercentageText:   'Prozent Gesamtanzahl',
    
    sortAscText:                'Sortierung A - Z',
    sortDescText:               'Sortierung Z - A',
    sortClearText:              'Sortierung ausschalten',
    clearFilterText:            'Filter löschen "{0}"',
    labelFiltersText:           'Filter Label',
    valueFiltersText:           'Filter Werte',
    equalsText:                 'Gleich...',
    doesNotEqualText:           'Ist ungleich...',
    beginsWithText:             'Beginnt mit...',
    doesNotBeginWithText:       'Beginnt nicht mit...',
    endsWithText:               'Endet mit...',
    doesNotEndWithText:         'Endet nicht mit...',
    containsText:               'Enthält...',
    doesNotContainText:         'Enthält nicht...',
    greaterThanText:            'Grösser als...',
    greaterThanOrEqualToText:   'Grösser als oder gleich...',
    lessThanText:               'Kleiner als...',
    lessThanOrEqualToText:      'Kleiner als oder gleich...',
    betweenText:                'Zwischen...',
    notBetweenText:             'Nicht zwischen...',
    top10Text:                  'Top 10...',

    equalsLText:                'gleich',
    doesNotEqualLText:          'ungleich',
    beginsWithLText:            'beginnt mit',
    doesNotBeginWithLText:      'beginnt nicht mit',
    endsWithLText:              'endet mit',
    doesNotEndWithLText:        'ende nicht mit',
    containsLText:              'enthält',
    doesNotContainLText:        'enthält nicht',
    greaterThanLText:           'ist grösser als',
    greaterThanOrEqualToLText:  'ist grösser oder gleich als',
    lessThanLText:              'ist kleiner als',
    lessThanOrEqualToLText:     'ist kleiner oder gleich als',
    betweenLText:               'ist zwischen',
    notBetweenLText:            'ist nicht zwischen',
    top10LText:                 'Top 10...',
    topOrderTopText:            'Top',
    topOrderBottomText:         'Unten',
    topTypeItemsText:           'Einträge',
    topTypePercentText:         'Prozent',
    topTypeSumText:             'Summe'

});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterTopWindow',{
    titleText:      'Top 10 Filter ({0})',
    fieldText:      'Anzeigen',
    sortResultsText:'Sortiere Ergebnisse'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterLabelWindow',{
    titleText:          'Filter Label ({0})',
    fieldText:          'Zeige Einträge mit Label',
    caseSensitiveText:  'Gross-/Kleinschreibung beachten'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterValueWindow',{
    titleText:      'Filter Werte ({0})',
    fieldText:      'Zeige Einträge mit'
});

Ext.define('Mz.locale.de.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Bereichseditor',
    textFieldValue:     'Wert',
    textFieldEdit:      'Feld',
    textFieldType:      'Typ',
    textButtonOk:       'Ok',
    textButtonCancel:   'Abbrechen',
    textTypePercentage: 'Prozent',
    textTypeIncrement:  'Zunahme',
    textTypeOverwrite:  'Überschreiben',
    textTypeUniformly:  'Einheitlich'
    
});
