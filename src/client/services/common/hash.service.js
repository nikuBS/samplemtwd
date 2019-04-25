/**
 * @class
 * @desc for using hash
 */
Tw.HashService = function () {
  this._callbackList = [];
  this._currentHashNav = undefined;
};

Tw.HashService.prototype = {
  /**
   * @desc bind onchangehash event
   * @param {function} callback 
   * @public
   */
  initHashNav: function (callback) {  
    if ( !callback || typeof callback !== 'function' ) {
      return false;
    }

    this._callbackList.push(callback);

    if ( 'onhashchange' in window ) {
      window.addEventListener('hashchange', $.proxy(this._checkHash, this));
    } else {
      setInterval($.proxy(this._checkHash, this), 100);
    }

    this._checkHash(callback);
    return this._currentHashNav;
  },

  /**
   * @desc check whether change hash or not
   * @private
   */
  _checkHash: function () { 
    var hash = window.location.hash.replace(/^#/i, '');
    if ( hash !== this._currentHashNav ) {
      var newHash = hash;

      var chopped = this._chopHash(newHash);
      _.map(this._callbackList, function (callback) {
        callback(chopped);
      });

      this._currentHashNav = newHash;
    }
  },

  /** 
   * @desc Do something with the new hash
   * @returns {object}
   * @private
   */
  _chopHash: function (hash) {
    hash = {
      raw: hash,
      base: decodeURIComponent(hash),
      parameters: null
    };

    if ( hash.raw.match(/[?]/) ) {
      // It's a query string with a base
      // var chunks = hash.raw.split('?');

      hash.base = decodeURIComponent(hash.raw.replace(/[?].*/, ''));
      hash.parameters = this._parametersFromString(hash.raw.replace(/.*[?]/, ''));

    } else if ( hash.raw.match(/[&]/) ) {
      // It's a query string with no base
      hash.parameters = this._parametersFromString(hash.raw);
    }

    return hash;

  },

  /**
   * @desc get query parameters from url
   * @param {string} paramString 
   */
  _parametersFromString: function (paramString) { 
    if ( !paramString.length ) return null;
    var paramPairs = paramString.split('&');
    if ( !paramPairs.length ) return null;
    var results = {};

    for ( var i = 0, len = paramPairs.length; i < len; i++ ) {
      if ( !paramPairs[i].length ) continue;
      var kv = paramPairs[i].split('=');
      if ( !kv[0].length ) continue;
      results[decodeURIComponent(kv[0])] = kv.length > 1 ? decodeURIComponent(kv[1]) : null;

    }
    for ( var name in results ) {
      return results;
    }
    return null;
  },

  /**
   * @desc when click reload button on browser
   * @public
   */
  detectIsReload: function () { 
    if ( window.performance ) {
      if ( performance.navigation.type === 1 ) {
        location.hash = '';
      }
    }
  }

};
// for using services
Tw.Hash = new Tw.HashService();
