import FormatHelper from './format.helper';

class ParamsHelper {
  static setQueryParams(params: any) {
    if ( FormatHelper.isEmpty(params) ) {
      return '';
    }
    let result = '?';
    Object.keys(params).forEach(key => {
      result = result + key + '=' + params[key] + '&';
    });
    result = result.substring(0, result.length - 1);
    return result;
  }

  static getQueryParams = (url: string) => {
    if (url.includes('?')) {
      const queryString = url.split('?')[1].split('#')[0];
      const arrParams = queryString.split('&');
      const obj = {};

      const arrLength = arrParams.length;
      for (let i = 0; i < arrLength; i++) {
        const item = arrParams[i].split('=');
        obj[item[0]] = decodeURIComponent(item[1]);
      }

      return obj;
    }
    return null;
  }
}

export default ParamsHelper;
