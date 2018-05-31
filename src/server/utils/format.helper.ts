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


  static convUnit(data: any, curUnit: any, targetUnit: any = 'GB', precision: number = 1): number {
    const units = [
      'bytes',
      'KB',
      'MB',
      'GB',
      'TB',
      'PB'
    ];
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

    return data.toFixed(precision);
  }
}

export default FormatHelper;
