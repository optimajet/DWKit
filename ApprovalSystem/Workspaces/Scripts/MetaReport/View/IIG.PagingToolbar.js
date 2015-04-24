Ext.define('IIG.PagingToolbar', {
    extend: 'Ext.PagingToolbar',
    alias: 'widget.iigpagingtb',

    matrix: null,
    grid: null,

    getPageData: function() {
        
    },

    bindMatrix: function() {
        var me = this,
            grid;
        grid = me.up('iigpivot');
        if (grid) {
            me.grid = grid;
            me.matrix = grid.getMatrix();
        }
    },

    initComponent: function() {
        var me = this;

        me.on('beforerender', me.bindMatrix, me, { single: true });

        me.callParent(arguments);
    }
})