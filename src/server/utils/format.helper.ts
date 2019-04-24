import { DATA_UNIT } from '../types/string.type';
import { VOICE_UNIT } from '../types/bff.type';
import StringHelper from './string.helper';

class FormatHelper {
  /**
   * @desc add leading zeros
   * @param  {number} number
   * @param  {number} length
   * @returns {string} 
   * @static
   */
  static leadingZeros(number: number, length: number): string {
    const result = number + '';
    return result.length > length ? result : new Array(length - result.length + 1).join('0') + result;
  }

  /**
   * @desc whether value is empty or not
   * @param  {any} values
   * @returns {boolean}
   * @static
   */
  static isEmpty(value: any): boolean {
    if ( value === '' || value == null || value === undefined ||
      (value != null && typeof value === 'object' && !Object.keys(value).length) ) {
      return true;
    }
    return false;
  }

  /**
   * @desc whether value is object or not 
   * @param  {any} value
   * @returns {boolean}
   * @static
   */
  static isObject(value: any): boolean {
    return (!!value) && (value.constructor === Object);
  }

  /**
   * @desc whether value is array
   * @param  {any} value
   * @returns {boolean}
   * @static
   */
  static isArray(value: any): boolean {
    return (!!value) && (value.constructor === Array);
  }

  /**
   * @desc whether value is string
   * @param {any} value 
   * @returns {boolean}
   * @static
   */
  static isString(value: any): boolean {
    return typeof (value) === 'string';
  }

  static getValidVars(value: any, emptyValue: any = null): any {
    return FormatHelper.isEmpty(value) ? emptyValue : value;
  }


  /**
   * @desc remove all tags
   * @param {string} context 
   * @returns {string}
   * @static
   */
  static stripTags(context: any): any {
    return context.replace(/(<([^>]+)>)|&nbsp;/ig, '');
  }

  /**
   * @desc Convert data unit to target unit
   * @param  {number | string} data
   * @param  {DATA_UNIT} curUnit
   * @param  {DATA_UNIT} targetUnit
   * @returns {object} { data, unit }
   * @static
   */
  static customDataFormat(data: any, curUnit: string, targetUnit: string): any {
    const units = [DATA_UNIT.KB, DATA_UNIT.MB, DATA_UNIT.GB];
    const curUnitIdx = units.findIndex(value => value === curUnit);
    const targetUnitIdx = units.findIndex(value => value === targetUnit);
    const sub = targetUnitIdx - curUnitIdx;

    data = +data;
    if ( sub > 0 ) {
      for ( let i = 0; i < sub; i++ ) {
        data = data / 1024;
      }
    } else {
      for ( let i = 0; i < sub * -1; i++ ) {
        data = data * 1024;
      }
    }

    return {
      data: FormatHelper.convNumFormat(data),
      unit: targetUnit
    };
  }

  /**
   * @desc convert data unit
   * @param  {number | string} data data
   * @param  {DATA_UNIT} curUnit current unit
   * @return {object} { data, unit }
   * @static
   */
  static convDataFormat(data: any, curUnit: string): any {
    const units = [DATA_UNIT.KB, DATA_UNIT.MB, DATA_UNIT.GB, DATA_UNIT.TB], maxIdx = units.length - 1;
    let unitIdx = units.findIndex(value => value === curUnit);

    if ( !isFinite(data) ) {
      return {
        data: data,
        unit: curUnit
      };
    }
    data = +data;

    while ( data >= 1024 && unitIdx < maxIdx ) {
      data /= 1024;
      unitIdx++;
    }

    return {
      data: FormatHelper.convNumFormat(data),
      unit: units[unitIdx]
    };
  }

  static convNumFormat(number: number): string {
    if ( number < 1 ) {
      return FormatHelper.setDecimalPlace(number, 2).toString();
    }
    if ( number > 0 && number < 100 && number % 1 !== 0 ) {
      return parseFloat(number.toFixed(2)).toString();
    }
    if ( number >= 100 && number < 1000 && number % 1 !== 0 ) {
      return parseFloat(number.toFixed(1)).toString();
    }
    if ( number > 1000 ) {
      return FormatHelper.addComma(number.toFixed(0));
    }

    return number.toString();
  }

  /**
   * @desc remove leading zeros
   * @param  {string} value
   * @returns string
   * @static
   */
  static removeZero(value: string): string {
    if ( value.indexOf('.') !== -1 ) {
      return value.replace(/(0+$)/, '');
    }

    return value;
  }

  /**
   * @desc add comma to numbers every three digits
   * @param {number} value
   * @returns {string}
   * @static
   */
  static addComma(value: string): string {
    if ( FormatHelper.isEmpty(value) ) {
      return '';
    }
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    return value.replace(regexp, ',');
  }

  /**
   * @desc convert milliseconds to hours
   * @param  {number | string} data milliseconds
   * @return {object} { hours, min, sec }
   */
  static convVoiceFormat(data: any): any {
    data = +data;
    const hours = Math.floor(data / 3600);
    const min = Math.floor((data - (hours * 3600)) / 60);
    const sec = data - (hours * 3600) - (min * 60);

    return { hours, min, sec };
  }

  static convVoiceMinFormatWithUnit(data: any): any {
    const hours = Math.floor(data / 60),
      min = data - (hours * 60);

    return (hours > 0 ? hours + VOICE_UNIT.HOURS : '') + min + VOICE_UNIT.MIN;
  }

  static convVoiceFormatWithUnit(data: any): any[] {
    const formatted: any = [];
    data = +data;
    const hours = Math.floor(data / 3600);
    if ( hours > 0 ) {
      formatted.push({ data: hours, unit: VOICE_UNIT.HOURS });
    }
    const min = Math.floor((data - (hours * 3600)) / 60);
    if ( min > 0 ) {
      formatted.push({ data: min, unit: VOICE_UNIT.MIN });
    }
    const sec = data - (hours * 3600) - (min * 60);
    if (hours > 0) {
      return formatted;
    }
    if ( sec !== 0 || hours + min <= 0 ) {
      formatted.push({ data: sec, unit: sec > 0 ? VOICE_UNIT.SEC : VOICE_UNIT.MIN });
    }
    return formatted;
  }

  /**
   * @desc add dash to phone number
   * @param {string} tel phone number
   * @returns {string}
   * @static
   */
  static conTelFormatWithDash(tel: any): any {
    if ( this.isEmpty(tel) ) {
      return tel;
    }

    let str: any = tel.trim(),
      j = 0;

    const maskCharIndexs: any = [];

    for ( let i = 0; i < str.length; i++ ) {
      if ( str[i] === '*' ) {
        maskCharIndexs.push(i);
      }
    }

    str = str.replace(/\*/gi, '0');
    str = str.replace(/(^02.{0}|^013[0-2]{1}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/, '$1-$2-$3');

    for ( let i = 0; i < str.length; i++ ) {
      if ( str[i] === '-' ) {
        continue;
      }

      if ( maskCharIndexs.indexOf(j) !== -1 ) {
        str = StringHelper.replaceAt(str, i, '*');
      }

      j++;
    }

    return str;
  }

  /**
   * @desc add dot to date
   * @param {string} date 
   * @returns {string}
   * @static
   */
  static conDateFormatWithDash(date: any): any {
    return date.slice(0, 4) + '.' + date.slice(4, 6) + '.' + date.slice(6, 8);
  }

  /**
   * @desc sort descending
   * @param  {object[]} array
   * @param  {string} key
   * @returns {object[]}
   * @static
   */
  static sortObjArrDesc(array: any[], key: string): any {
    return array.sort((a, b) => parseInt(b[key], 10) - parseInt(a[key], 10));
  }

  /**
   * @desc sort ascending
   * @param  {object[]} array
   * @param  {string} key
   * @returns {object[]}
   * @static
   */
  static sortObjArrAsc(array: any[], key: string): any {
    return array.sort((a, b) => parseInt(a[key], 10) - parseInt(b[key], 10));
  }

  /**
   * @desc get formatted date
   * @param  {string} cardYm
   * @returns {string}
   * @static
   */
  static makeCardYymm(cardYm: string): string {
    return cardYm.substr(0, 4) + '/' + cardYm.substr(4, 2);
  }

  /**
   * @desc return fixed point number
   * @returns {number}
   * @static
   */
  static setDecimalPlace(value: number, point: number): number {
    return parseFloat(value.toFixed(point));
  }

  /**
   * Insert colon into middle of number string
   * @param val normally server response. MUST be 4 characters. ex) '0900', '2000'
   * @returns '09:00', '20:00'
   */
  static insertColonForTime(val: string): string {
    return val.slice(0, 2) + ':' + val.slice(2);
  }

  /**
   * Object deep copy
   * @param {*} value The value to recursively clone.
   * @returns {*} Returns the deep cloned value.
   */
  static objectClone(value): any {
    if ( typeof value === 'object' ) {
      return Object.keys(value)
        .map(k => ({ [k]: this.objectClone(value[k]) }))
        .reduce((a, c) => Object.assign(a, c), {});
    } else if ( Array.isArray(value) ) {
      return value.map(this.objectClone);
    }
    return value;
  }

  /**
   *  format fee contents
   *  @param {String | number} value
   *  @return {String} : if value contains only number, return value added comma
   */
  static getFeeContents(value: string | number): string {
    const sValue = String(value);

    if ( /^[0-9]+$/.test(sValue) ) {
      return FormatHelper.addComma(sValue);
    }

    return sValue;
  }

  /**
   * @desc whether value is number or not
   * @param  {} number
   * @returns boolean
   * @static
   */
  static isNumber(number): boolean {
    const regNumber = /^[0-9]*$/;
    return regNumber.test(number);
  }

  /**
   * @desc add dash to card number
   * @param value 
   * @static
   */
  static addCardDash(value: string): string {
    if ( FormatHelper.isEmpty(value) ) {
      return '';
    }
    const regexp = /\B(?=([\d|\*]{4})+(?![\d|\*]))/g;
    return value.replace(regexp, '-');
  }

  /**
   * @desc add white space to card number
   * @param value 
   * @static
   */
  static addCardSpace(value: string): string {
    if ( FormatHelper.isEmpty(value) ) {
      return '';
    }
    const regexp = /\B(?=([\d|\*]{4})+(?![\d|\*]))/g;
    return value.replace(regexp, ' ');
  }
}

export default FormatHelper;
