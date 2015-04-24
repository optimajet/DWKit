/*
This file is part of mzPivotGrid

Copyright (c) 2012-2014 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance 
with the Commercial Software License Agreement provided with the Software.
 
*/


/**
* Russian translation by Alexey Kushnikov (akushnikov@outlook.com)
* 
*/

Ext.define('Mz.locale.ru.pivot.Grid', {
    override: 'Mz.pivot.Grid',
    
    textTotalTpl:       'Итого по ({name})',
    textGrandTotalTpl:  'ИТОГО'
});

Ext.define('Mz.locale.ru.pivot.plugin.configurator.Panel', {
    override: 'Mz.pivot.plugin.configurator.Panel',
    
    panelAllFieldsText:     'Переместите неиспользуемые колонки сюда',
    panelTopFieldsText:     'Переместите колонки сюда',
    panelLeftFieldsText:    'Переместите строки сюда',
    panelAggFieldsText:     'Переместите поля с данными сюда'

});

Ext.define('Mz.locale.ru.pivot.plugin.configurator.Column', {
    override: 'Mz.pivot.plugin.configurator.Column',
    
    sumText:                    'Сумма',
    avgText:                    'Среднее',
    countText:                  'Количество',
    minText:                    'Минимум',
    maxText:                    'Максимум',
    groupSumPercentageText:     'Процент от суммы',
    groupCountPercentageText:   'Процент от количества',
    
    sortAscText:                'Сортировать по возрастанию',
    sortDescText:               'Сортировать по убыванию',
    sortClearText:              'Очистить сортировку',
    clearFilterText:            'Очистить фильтр по "{0}"',
    labelFiltersText:           'Фильтры по наименованию',
    valueFiltersText:           'Фильтры по значению',
    equalsText:                 'Равно...',
    doesNotEqualText:           'Не равно...',
    beginsWithText:             'Начинается с...',
    doesNotBeginWithText:       'Не начинается с...',
    endsWithText:               'Оканчивается на...',
    doesNotEndWithText:         'Не оканчивается на...',
    containsText:               'Содержит...',
    doesNotContainText:         'Не содержит...',
    greaterThanText:            'Больше чем...',
    greaterThanOrEqualToText:   'Больше или равно...',
    lessThanText:               'Меньше чем...',
    lessThanOrEqualToText:      'Меньше или равно...',
    betweenText:                'Между...',
    notBetweenText:             'Не входит в...',
    top10Text:                  'Топ 10...',

    equalsLText:                'равно',
    doesNotEqualLText:          'не равно',
    beginsWithLText:            'начинается с',
    doesNotBeginWithLText:      'не начинается с',
    endsWithLText:              'оканчивается на',
    doesNotEndWithLText:        'не оканчивается на',
    containsLText:              'содержит',
    doesNotContainLText:        'не содержит',
    greaterThanLText:           'больше чем',
    greaterThanOrEqualToLText:  'больше или равно',
    lessThanLText:              'меньше чем',
    lessThanOrEqualToLText:     'меньше или равно',
    betweenLText:               'между',
    notBetweenLText:            'не входит в',
    top10LText:                 'Топ 10...',
    topOrderTopText:            'Топ',
    topOrderBottomText:         'Низ',
    topTypeItemsText:           'Элементы',
    topTypePercentText:         'Процент',
    topTypeSumText:             'Сумма'

});

Ext.define('Mz.locale.ru.pivot.plugin.configurator.FilterTopWindow', {
    override: 'Mz.pivot.plugin.configurator.FilterTopWindow',
    titleText:      'Топ 10 записей по ({0})',
    fieldText:      'Показать',
    sortResultsText:'Sort results'
});

Ext.define('Mz.locale.ru.pivot.plugin.configurator.FilterLabelWindow', {
    override: 'Mz.pivot.plugin.configurator.FilterLabelWindow',
    titleText:          'Фильтр по наименованию ({0})',
    fieldText:          'Показывать элементы с наименованием',
    caseSensitiveText:  'Учитывать регистр'
});

Ext.define('Mz.locale.ru.pivot.plugin.configurator.FilterValueWindow', {
    override: 'Mz.pivot.plugin.configurator.FilterValueWindow',
    titleText:      'Фильтр по значению ({0})',
    fieldText:      'Показывать элементы, для которых'
});

Ext.define('Mz.locale.ru.pivot.plugin.RangeEditor', {
    override: 'Mz.pivot.plugin.RangeEditor',
    
    textWindowTitle:    'Редактирование диапазона',
    textFieldValue:     'Значение',
    textFieldEdit:      'Поле',
    textFieldType:      'Тип',
    textButtonOk:       'ОК',
    textButtonCancel:   'Отмена',
    textTypePercentage: 'Процент',
    textTypeIncrement:  'Инкремент',
    textTypeOverwrite:  'Перезаписать',
    textTypeUniformly:  'Равномерно'
});
