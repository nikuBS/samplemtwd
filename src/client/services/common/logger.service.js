Tw.LOG = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

Tw.LoggerService = function (environment) {
  this._level = environment === 'prd' ? Tw.LOG.ERROR : Tw.LOG.DEBUG;
  this.log = function() {};
  this.info = function() {};
  this.warn = function() {};
  this.error = function() {};

  this.setLogFunc();
};
Tw.LoggerService.prototype = {
  setLogFunc: function() {
    switch (this._level) {
      case Tw.LOG.DEBUG:
        this.log = $.proxy(console.log, console);
        this.info = $.proxy(console.info, console);
        this.warn = $.proxy(console.warn, console);
        this.error = $.proxy(console.error, console);
        break;
      case Tw.LOG.INFO:
        this.info = $.proxy(console.info, console);
        this.warn = $.proxy(console.warn, console);
        this.error = $.proxy(console.error, console);
        break;
      case Tw.LOG.WARN:
        this.warn = $.proxy(console.warn, console);
        this.error = $.proxy(console.error, console);
        break;
      case Tw.LOG.ERROR:
        this.error = $.proxy(console.error, console);
        break;
      default:
        console.error('Not expected value');
    }
  }
};
