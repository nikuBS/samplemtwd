import { DATA_UNIT } from '../types/string.type';

class FormatHelper {
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

  static addComma(value: string): string {
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
}

export default FormatHelper;
