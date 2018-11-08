import { DATA_UNIT } from '../types/string.type';
import { VOICE_UNIT, UNIT } from '../types/bff.type';

class FormatHelper {
  static leadingZeros(number: number, length: number): string {
    const result = number + '';
    return result.length > length ? result : new Array(length - result.length + 1).join('0') + result;
  }

  static isEmpty(value: any): boolean {
    if ( value === '' || value == null || value === undefined ||
      (value != null && typeof value === 'object' && !Object.keys(value).length) ) {
      return true;
    }
    return false;
  }

  static isObject(value: any): boolean {
    return (!!value) && (value.constructor === Object);
  }

  static isArray(value: any): boolean {
    return (!!value) && (value.constructor === Array);
  }

  static isString(value: any): boolean {
    return typeof(value) === 'string';
  }

  static getValidVars(value: any, emptyValue: any = null): any {
    return FormatHelper.isEmpty(value) ? emptyValue : value;
  }

  static getLastSeq(path: any): any {
    const pathArray = path.split('/');
    return pathArray[pathArray.length - 1];
  }

  static stripTags(context: any): any {
    return context.replace(/(<([^>]+)>)|&nbsp;/ig, '');
  }

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

  static convDataFormat(data: any, curUnit: string): any {
    const units = [DATA_UNIT.KB, DATA_UNIT.MB, DATA_UNIT.GB];
    let unitIdx = units.findIndex(value => value === curUnit);

    data = +data;
    if ( !isFinite(data) ) {
      return {
        data: data,
        unit: curUnit
      };
    }

    while ( data >= 1024 ) {
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
      return FormatHelper.removeZero(number.toFixed(2));
    }
    if ( number >= 100 && number < 1000 && number % 1 !== 0 ) {
      return FormatHelper.removeZero(number.toFixed(1));
    }
    if ( number > 1000 ) {
      return FormatHelper.addComma(number.toFixed(0));
    }

    return number.toString();
  }

  static removeZero(value: string): string {
    if ( value.indexOf('.') !== -1 ) {
      return value.replace(/(0+$)/, '');
    }

    return value;
  }

  static normalizeNumber(num: string): string {
    return num.replace(/(^0+)/, '');
  }

  static addComma(value: string): string {
    if ( FormatHelper.isEmpty(value) ) {
      return '';
    }
    const regexp = /\B(?=(\d{3})+(?!\d))/g;
    return value.replace(regexp, ',');
  }

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
    if ( sec !== 0 || hours + min <= 0 ) {
      formatted.push({ data: sec, unit: sec > 0 ? VOICE_UNIT.SEC : VOICE_UNIT.MIN });
    }
    return formatted;
  }

  static convMinToDay(min: any): any {
    min = +min;
    const day = Math.floor(min / 1440);
    const hours = Math.floor((min - (day * 1440)) / 60);
    return { day, hours };
  }

  static removeNumber(value: any): any {
    return value.replace(/[0-9]/g, '');
  }

  static conTelFormatWithDash(tel: any): any {
    const ret = tel.trim();
    return `${ret.substring(0, 3)}-${ret.substring(3, ret.length - 4)}-${ret.substring(ret.length - 4)}`;
  }

  static sortObjArrDesc(array: any, key: string): any {
    return array.sort((a, b) => parseInt(b[key], 10) - parseInt(a[key], 10));
  }

  static sortObjArrAsc(array: any, key: string): any {
    return array.sort((a, b) => parseInt(a[key], 10) - parseInt(b[key], 10));
  }

  static makeCardYymm(cardYm: string): string {
    return cardYm.substr(0, 4) + '/' + cardYm.substr(4, 2);
  }

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

  static numberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  static zip(arr, ...arrs): any {
    return arr.map((val, i) => arrs.reduce((a, _arr) => [...a, _arr[i]], [val]));
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
   *  group by Array
   *  @param {Array} arr
   *  @param {String} key
   *  @return return the object.
   */
  static groupByArray(arr, key): any {
    const mapped = {};
    arr.forEach(item => {
      const actualKey = item[key];
      if ( !mapped.hasOwnProperty(actualKey) ) {
        mapped[actualKey] = [];
      }
      mapped[actualKey].push(item);
    });
    return mapped;
  }

  /**
   *  format fee contents
   *  @param {String | number} value
   *  @return {String} : if value contains only number, return value added comma
   */
  static getFeeContents(value: string | number): string {
    const sValue = String(value);

    if (/^[0-9]+$/.test(sValue)) {
      return FormatHelper.addComma(sValue);
    }

    return sValue;
  }

  static lpad (str, length, padStr): string {

    while (str.length < length) {
      str = padStr + str;
    }
    return str;
  }
}

export default FormatHelper;
