/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


/**
* French translation by Daniel Grana
* 
*/

Ext.define('Mz.locale.fr.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Total ({name})',
    textGrandTotalTpl:  'Total général'
});

Ext.define('Mz.locale.fr.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Placez les champs inutilisés ici',
    panelTopFieldsText:     'Placez les champs colonnes ici',
    panelLeftFieldsText:    'Placez les champs lignes ici',
    panelAggFieldsText:     'Placez les champs aggrégés ici'

});

Ext.define('Mz.locale.fr.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Somme',
    avgText:                    'Moyenne',
    countText:                  'Nombre',
    minText:                    'Min',
    maxText:                    'Max',
    groupSumPercentageText:     'Pourcentage somme cumulée',
    groupCountPercentageText:   'Pourcentage nombre cumulé',

    sortAscText:                'Trier A to Z',
    sortDescText:               'Trier Z to A',
    sortClearText:              'Desactiver triage',
    clearFilterText:            'Vider filtres de "{0}"',
    labelFiltersText:           'Filtres label',
    valueFiltersText:           'Filtres valeurs',
    equalsText:                 'Egal...',
    doesNotEqualText:           'Différent de...',
    beginsWithText:             'Commence avec...',
    doesNotBeginWithText:       'Ne commence pas avec...',
    endsWithText:               'Termine avec...',
    doesNotEndWithText:         'Ne termine pas avec...',
    containsText:               'Contient...',
    doesNotContainText:         'Ne contient pas...',
    greaterThanText:            'Supérieur à...',
    greaterThanOrEqualToText:   'Supérieur ou égal à...',
    lessThanText:               'Inférieur à...',
    lessThanOrEqualToText:      'Inférieur ou égal à...',
    betweenText:                'Entre...',
    notBetweenText:             'Pas entre...',
    top10Text:                  'Top 10...',

    equalsLText:                'égal à',
    doesNotEqualLText:          'pas égal à',
    beginsWithLText:            'commence avec',
    doesNotBeginWithLText:      'ne commence pas avec',
    endsWithLText:              'termine avec',
    doesNotEndWithLText:        'ne termine pas avec',
    containsLText:              'contient',
    doesNotContainLText:        'ne contient pas',
    greaterThanLText:           'est supérieur à',
    greaterThanOrEqualToLText:  'est supérieur ou égal à',
    lessThanLText:              'est inférieur à',
    lessThanOrEqualToLText:     'est inférieur ou égal à',
    betweenLText:               'est entre',
    notBetweenLText:            'n\'est pas entre',
    top10LText:                 'Top 10...',
    topOrderTopText:            'Top',
    topOrderBottomText:         'Dessous',
    topTypeItemsText:           'Entrées',
    topTypePercentText:         'Pourcentage',
    topTypeSumText:             'Somme'
    
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterTopWindow',{
    titleText:      'Filtre Top 10 ({0})',
    fieldText:      'Afficher',
    sortResultsText:'Trier les résultats'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterLabelWindow',{
    titleText:          'Filtre label ({0})',
    fieldText:          'Afficher entrées avec label',
    caseSensitiveText:  'Sensibilité à la casse'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterValueWindow',{
    titleText:      'Filtre valeurs ({0})',
    fieldText:      'Afficher entrées avec'
});

Ext.define('Mz.locale.fr.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Editeur de plage',
    textFieldValue:     'Valeur',
    textFieldEdit:      'Champ',
    textFieldType:      'Type',
    textButtonOk:       'Ok',
    textButtonCancel:   'Annuler',
    textTypePercentage: 'Pourcentage',
    textTypeIncrement:  'Incrément',
    textTypeOverwrite:  'Ecraser',
    textTypeUniformly:  'Uniformément'
    
});
