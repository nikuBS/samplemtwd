Tx.HomeView = function(rootEl) {
    this.$container = rootEl;
    this._bindEvent();
};

Tx.HomeView.prototype = {
    _bindEvent: function() {
        this.$container.on('click', '.btn-test', $.proxy(this._onClickAddButton, this));
    },

    _onClickAddButton: function() {
        var $div = this.$container.find('.div-test');
        $div.append('test-click');
    }
};