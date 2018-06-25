if ( !Object.create ) {
  Object.create = function (o, properties) {
    if ( typeof o !== 'object' && typeof o !== 'function' ) throw new TypeError('Object prototype may only be an Object: ' + o);
    else if ( o === null ) throw new Error("This browser's implementation of Object.create is a shim and doesn't support 'null' as the first argument.");

    if ( typeof properties != 'undefined' ) throw new Error("This browser's implementation of Object.create is a shim and doesn't support a second argument.");

    function F() {
    }

    F.prototype = o;

    return new F();
  };
}

if ( !Object.create ) {
  Object.create = (function () {
    function F() {
    }

    return function (o) {
      if ( arguments.length != 1 ) {
        throw new Error('Object.create implementation only accepts one parameter.');
      }
      F.prototype = o;
      return new F();
    }
  })();
}

if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      // 우리는 반드시 특정한 케이스에 대해서 확인해야 합니다.
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}