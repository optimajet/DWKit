/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


/**
* Turkish translation by Deniz Girginer
* 
*/

Ext.define('Mz.locale.en.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Toplam ({name})',
    textGrandTotalTpl:  'Genel toplam',
    total:'Toplam',
    blank:'(boş)'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Kullanılmayan alanları buraya sürükleyin',
    panelTopFieldsText:     'Sütun alanları buraya',
    panelLeftFieldsText:    'Satır alanları buraya',
    panelAggFieldsText:     'Hesap alanları buraya'

});

Ext.define('Mz.locale.en.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Topla',
    avgText:                    'Ort',
    countText:                  'Sayı',
    minText:                    'En Küçük',
    maxText:                    'En Büyük',
    groupSumPercentageText:     'Grup toplam yüzde',
    groupCountPercentageText:   'Grup sayı yüzde',
    
    sortAscText:                'Sırala A to Z',
    sortDescText:               'Sırala Z to A',
    sortClearText:              'Sıralama iptal',
    clearFilterText:            'Filtre temizle  "{0}"',
    labelFiltersText:           'Etiket sorgula',
    valueFiltersText:           'Value sorgula',
    equalsText:                 'Eşit...',
    doesNotEqualText:           'Eşit değil...',
    beginsWithText:             '... ile başlayan',
    doesNotBeginWithText:       '... ile başlamayan',
    endsWithText:               '... ile biten',
    doesNotEndWithText:         '... ile bitmeyen',
    containsText:               'içinde ... olan',
    doesNotContainText:         'içinde ... olmayan',
    greaterThanText:            '... dan büyük',
    greaterThanOrEqualToText:   '... dan büyük ve eşit',
    lessThanText:               '... den küçük',
    lessThanOrEqualToText:      '... den küçük ve eşit',
    betweenText:                '... arasında ',
    notBetweenText:             '... arasında olmayan',
    top10Text:                  'En yüksek 10 ...',

    equalsLText:                'Eşit',
    doesNotEqualLText:          'Eşit değil',
    beginsWithLText:            'ile başlayan',
    doesNotBeginWithLText:      'ile başlamayan',
    endsWithLText:              'ile biten',
    doesNotEndWithLText:        'ile bitmeyen',
    containsLText:              'içende',
    doesNotContainLText:        'içinde olmayan',
    greaterThanLText:           'dan büyük',
    greaterThanOrEqualToLText:  'den büyük ve eşit',
    lessThanLText:              'den küçük',
    lessThanOrEqualToLText:     'den küçük ve eşit',
    betweenLText:               'arasında',
    notBetweenLText:            'arasında değil',
    top10LText:                 'En yüksek 10...',
    topOrderTopText:            'En yüksek',
    topOrderBottomText:         'Alt',
    topTypeItemsText:           'Öğeler',
    topTypePercentText:         'Yüzde',
    topTypeSumText:             'Toplam'

});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterTopWindow',{
    titleText:      'En yüksek 10 sorgu ({0})',
    fieldText:      'Göster',
    sortResultsText:'Sonuç sırala'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterLabelWindow',{
    titleText:          'Etiket sorgu ({0})',
    fieldText:          'Öğeleri göster hangi etiket için',
    caseSensitiveText:  'Harfe duyarlı'
});

Ext.define('Mz.locale.en.pivot.plugin.configurator.FilterValueWindow',{
    titleText:      'Değer filtre ({0})',
    fieldText:      'Öğeleri göster'
});

Ext.define('Mz.locale.en.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Aralık editor',
    textFieldValue:     'Değer',
    textFieldEdit:      'Alan',
    textFieldType:      'Tip',
    textButtonOk:       'Tamam',
    textButtonCancel:   'İptal',
    textTypePercentage: 'Yüzde',
    textTypeIncrement:  'Artış',
    textTypeOverwrite:  'Üstüneyaz',
    textTypeUniformly:  'Düzgün'
    
});
