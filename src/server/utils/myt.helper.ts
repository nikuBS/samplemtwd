import { SKIP_NAME, MYT_DATA_USAGE } from '../types/string.type';
import {
  UNIT,
  UNIT_E,
  UNLIMIT_CODE,
  INFINITY_DATA_PROD_ID,
  DAY_BTN_STANDARD_SKIP_ID,
  TPLAN_SHARE_LIST,
  TOTAL_SHARE_DATA_SKIP_ID
} from '../types/bff.type';
import FormatHelper from './format.helper';
import DateHelper from './date.helper';

// 기본제공 데이터: (사용중인 요금제에 해당하는 공제항목으로 존재할경우 공제항목 최상단에 노출)
//  - usageData.gnrlData[n] 중에 svcInfo.prodId와 같은 prodId를 가진 공제항목
// 통합공유 데이터: (t가족모아, t끼리 데이터 선물하기, 데이터함께쓰기)
//  - 기본제공데이터가 있는 경우 기본제공 데이터 하단에 노출
//    - t가족모아 이용중인 경우 (usageData.spclData[n]중 TOTAL_SHARE_DATA_SKIP_ID에 속하는 데이터가 있는경우)
//      - 가능량: usageData.spclData[n].showRemained
//      - 사용량: usageData.spclData[n].showUsed
//    - 아닌 경우
//      - 가능량: 기본제공데이터.showRemaineds,
//      - 사용량: T끼리 데이터 선물하기 + 데이터 함께쓰기 사용량
//    - 기본제공 데이터가 있지만 기본제공 데이터량이 무제한인 경우(INFINITY_DATA_PROD_ID에 속하는 경우)엔 표시 안함[DV001-18235]
//  - 기본제공데이터가 없는 경우 표시안함
const kinds = [
  MYT_DATA_USAGE.DATA_TYPE.DATA,
  MYT_DATA_USAGE.DATA_TYPE.VOICE,
  MYT_DATA_USAGE.DATA_TYPE.SMS,
  MYT_DATA_USAGE.DATA_TYPE.ETC
];

/**
 * dataArray중 target의 공제ID에 해당하는 데이터 반환
 * @param {Array} target
 * @param {Array} data
 * @private
 * return data
 */
function getDataInTarget(target: Array<any>, data: Array<any>): any {
  let found;
  // TODO: 구문이 find last가 되며, mapping할 필요가 없다.
  // data.map(item => {
  data.forEach(item => {
    if (target.indexOf(item.skipId) !== -1) {
      found = item;
    }
  });
  return found;
  // TODO: 구문이 find first라면, 아래와 같이 한다.
  // return data.find(item => (target.indexOf(item.skipId) > -1));
}

class MyTHelper {

  /**
   * 총데이터 잔여량 데이터 세팅
   * @param usageData
   * @private
   */
  static setTotalRemained(usageData: any) {
    const gnrlData = usageData.gnrlData || [];
    let totalRemainUnLimited = false;
    // 범용데이터 중 무제한 데이터가 있는지 확인
    gnrlData.map((_data) => {
      if ( UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    // 무제한 데이터가 있으면 무제한 표시, 없으면 합산 잔여량 표시
    if ( totalRemainUnLimited ) {
      usageData.totalRemainUnLimited = true;
      usageData.totalRemained = SKIP_NAME.UNLIMIT;
    } else {
      const totalRemained = gnrlData.reduce((_memo, _data) => {
        return _data.remained ? _memo + parseInt(_data.remained, 10) : _memo + 0;
      }, 0);
      usageData.totalRemained = FormatHelper.convDataFormat(totalRemained, UNIT[UNIT_E.DATA]);
    }
  }

  /**
   * 사용량 데이터 가공(휴대폰 제외)
   * @param usageData
   * @public
   */
  static parseUsageData(usageData: any): any {
    MyTHelper.setTotalRemained(usageData);
    usageData.data = usageData.gnrlData || [];

    kinds.forEach((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].forEach((data) => {
          MyTHelper.convShowData(data);
        });
      }
    });
    return usageData;
  }

  /**
   * 사용량 데이터 가공(휴대폰)
   * @param usageData
   * @param svcInfo
   * @public
   */
  static parseCellPhoneUsageData(usageData: any, svcInfo: any): any {
    const gnrlData = usageData.gnrlData || [];  // 범용 데이터 공제항목 (합산 가능한 공제항목)
    const spclData = usageData.spclData || [];  // 특수 데이터 공제항목
    let dataArr: Array<any> = [];
    let defaultData;                            // 기본제공데이터
    let tOPlanSharedData;                       // 통합공유데이터

    if ( gnrlData ) {
      // 총데이터 잔여량 표시 데이터 세팅
      MyTHelper.setTotalRemained(usageData);

      // 기본제공데이터
      defaultData = gnrlData.find((_data) => {
        return _data.prodId === svcInfo.prodId && FormatHelper.isEmpty(_data.rgstDtm);
      }) || {};

      // 기본제공데이터를 제외한 데이터 배열 취합
      dataArr = dataArr.concat(gnrlData.filter((_data) => {
        return _data.skipId !== defaultData.skipId;
      }));

      // 기본제공데이터가 있는 경우 최상위 노출
      if ( !FormatHelper.isEmpty(defaultData.skipId) ) {
        dataArr.unshift(defaultData);
        usageData.hasDefaultData = true;
      } else {
        usageData.hasDefaultData = false;
      }
    }

    if ( spclData ) {
      // 통합공유데이터
      tOPlanSharedData = getDataInTarget(TOTAL_SHARE_DATA_SKIP_ID, spclData) || {};

      // 통합공유데이터 제외한 데이터 배열 취합
      dataArr = dataArr.concat(spclData.filter((_data) => {
        return _data.skipId !== tOPlanSharedData.skipId;
      }));

      // 기본제공 데이터 존재
      if ( usageData.hasDefaultData ) {
        // t가족모아 이용중인 경우 기본제공 데이터의 tOPlanSharedData에 할당
        if ( !FormatHelper.isEmpty(tOPlanSharedData.skipId) ) {
          defaultData.tOPlanSharedData = tOPlanSharedData;
        } else {
          // [DV001-18235] 기본데이터가 무제한으로 무제한 공유 가능으로 표기되면 안되는 항목들 통합공유데이터 표시안함
          if ( INFINITY_DATA_PROD_ID.indexOf(defaultData.prodId) !== -1 ) {
            defaultData.sharedData = false;
          } else { // T끼리 데이터 선물 사용량 + 데이터 함께쓰기 사용량 표시를 위한 키값
            defaultData.sharedData = true;
          }
        }
      }
    }

    // 당일 사용량(PA) DDZ25, DDZ23, DD0PB 에 해당하는 공제항목이 있으면
    // 해당 항목의 prodId와 같고 && skipId가 'PA'인 항목은 노출 제외

    const pas = dataArr.filter((_data) => {
      return DAY_BTN_STANDARD_SKIP_ID.indexOf(_data.skipId) !== -1;
    });

    if ( pas.length > 0 ) {
      pas.forEach((pa) => {
        dataArr = dataArr.filter((_data) => {
          return !(_data.skipId === SKIP_NAME.DAILY && _data.prodId === pa.prodId);
        });
      });
    }

    // skipId가 'PA' && 무제한이 아닌 경우 노출 제외
    dataArr = dataArr.filter((_data) => {
      return !(_data.skipId === SKIP_NAME.DAILY && (UNLIMIT_CODE.indexOf(_data.unlimit) === -1));
    });

    usageData.data = dataArr;

    kinds.forEach((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].forEach((data) => {
          MyTHelper.convShowData(data);
        });
      }
    });
    return usageData;
  }

  /**
   * 자녀회선 사용량 데이터 가공(휴대폰)
   * @param usageData
   * @public
   */
  static parseChildCellPhoneUsageData(usageData: any): any {
    const gnrlData = usageData.gnrlData || [];  // 범용 데이터 공제항목
    const spclData = usageData.spclData || [];  // 특수 데이터 공제항목
    let dataArr = gnrlData.concat(spclData);

    MyTHelper.setTotalRemained(usageData);

    // 당일 사용량(PA) DDZ25, DDZ23, DD0PB 에 해당하는 공제항목이 있으면
    // 해당 항목의 prodId와 같고 && skipId가 'PA'인 항목은 노출 제외

    const pas = dataArr.filter((_data) => {
      return DAY_BTN_STANDARD_SKIP_ID.indexOf(_data.skipId) !== -1;
    });

    if ( pas.length > 0 ) {
      pas.map((pa) => {
        dataArr = dataArr.filter((_data) => {
          return !(_data.skipId === SKIP_NAME.DAILY && _data.prodId === pa.prodId);
        });
      });
    }

    // skipId가 'PA' && 무제한이 아닌 경우 노출 제외
    dataArr = dataArr.filter((_data) => {
      return !(_data.skipId === SKIP_NAME.DAILY && (UNLIMIT_CODE.indexOf(_data.unlimit) === -1));
    });

    usageData.data = dataArr;

    kinds.forEach((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].forEach((data) => {
          MyTHelper.convShowData(data);
        });
      }
    });

    return usageData;
  }

  static convShowData(data: any) {
    data.isUnlimited = !isFinite(data.total);
    data.isUsedUnlimited = !isFinite(data.used);
    data.isRemainUnlimited = !isFinite(data.remained);
    data.remainedRatio = 100;
    data.showUsed = this.convFormat(data.used, data.unit);

    if ( !data.isUnlimited ) {
      // TODO 삭제예정
      data.showUsed = this.convFormat(data.used, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.remainedRatio = Math.round(data.remained / data.total * 100) || 0;
    }
    if ( !data.isUsedUnlimited ) {
      data.showUseds = this.convFormatWithUnit(data.used, data.unit);
    }
    if ( !data.isRemainUnlimited ) {
      data.showRemaineds = this.convFormatWithUnit(data.remained, data.unit);
    }
    // 통합공유데이터가 있는 경우
    if ( data.tOPlanSharedData ) {
      // data.showUsed = this.convFormat(data.used, data.unit);
      data.showTotal = this.convFormat(data.total, data.unit);
      data.tOPlanSharedData.showTotal = this.convFormat(data.tOPlanSharedData.total, data.unit);
      data.tOPlanSharedData.showRemained = this.convFormat(data.tOPlanSharedData.remained, data.unit);
      data.tOPlanSharedData.showUsed = this.convFormat(data.tOPlanSharedData.used, data.unit);
    }

    data.isExceed = data.skipId === SKIP_NAME.EXCEED;
    data.isDailyUsed = data.skipId === SKIP_NAME.DAILY;
    data.isRunout = data.remained === '0' || data.isExceed;
    data.isTFamilyData = TPLAN_SHARE_LIST.indexOf(data.skipId) !== -1;
    data.rgstDtm = data.rgstDtm ? DateHelper.getShortDate(data.rgstDtm) : '';
    data.barClassName = this.getBarStayle(data.isUnlimited); // TODO 삭제예정
    data.barClass = this.getBarStyle(data.isUnlimited, data.unit);
    data.isVisibleDayBtn = this.isVisibleDayBtn(data.skipId);
  }

  static convFormat(data: string, unit: string): any {
    switch ( unit ) {
      case UNIT_E.DATA:
        return FormatHelper.convDataFormat(data, UNIT[unit]);
      case UNIT_E.VOICE:
      case UNIT_E.VOICE_2:
      case UNIT_E.VOICE_3:
        return FormatHelper.convVoiceFormat(data);
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return FormatHelper.addComma(data);
      case UNIT_E.FEE:
        return FormatHelper.addComma(data);
      default:
    }
    return '';
  }

  static convFormatWithUnit(data: string, unit: string): object[] {
    switch ( unit ) {
      case UNIT_E.DATA:
        // return [FormatHelper.customDataFormat(data, UNIT[unit], 'GB')];
        return [FormatHelper.convDataFormat(data, UNIT[unit])];
      case UNIT_E.VOICE:
      case UNIT_E.VOICE_2:
      case UNIT_E.VOICE_3:
        return FormatHelper.convVoiceFormatWithUnit(data);
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return [{ data: FormatHelper.addComma(data), unit: UNIT[unit] }];
      case UNIT_E.FEE:
        return [{ data: FormatHelper.addComma(data), unit: UNIT[unit] }];
    }
    return [];
  }

  // TODO 삭제예정
  static getBarStayle(isUnlimited: boolean): string {
    let className = 'progressbar-type01';
    if ( isUnlimited ) {
      className = 'progressbar-type02';
    }
    return className;
  }

  static getBarStyle(isUnlimited: boolean, unit: string): string {
    let className = 'red';
    // switch ( unit ) {
    //   case UNIT_E.DATA:
    //     className = 'red';
    //     break;
    //   case UNIT_E.VOICE:
    //   case UNIT_E.VOICE_2:
    //     className = 'blue';
    //     break;
    //   case UNIT_E.SMS:
    //   case UNIT_E.SMS_2:
    //     className = 'green';
    //     break;
    //   case UNIT_E.FEE:
    //     className = 'orange';
    //     break;
    //   default:
    // }
    if ( isUnlimited ) {
      className = 'blue-stripe';
    }
    return className;
  }

  /**
   * 당일 사용량 조회 버튼 노출 조건을 검사
   * @param skipId
   */
  static isVisibleDayBtn(skipId: any): boolean {
    return DAY_BTN_STANDARD_SKIP_ID.indexOf(skipId) > -1;
  }

}

export default MyTHelper;
