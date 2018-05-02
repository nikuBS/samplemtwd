Tx.Event = function(sender) {
    this._sender = sender;
    this._listeners = [];
};

Event.prototype = {
    attach: function(listener) {
        this._listeners.push(listener);
    },

    notify: function(args) {
        _.each(this._listeners, $.proxy(this._sendEvent, this, args));
    },

    _sendEvent: function(args, listener, index) {
        listener(this._sender, args);
    }
};