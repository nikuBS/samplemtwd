/**
 * FileName: myt.usage.graphbox.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 1.
 */

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { UNIT, UNIT_E } from '../../../../types/bff.old.type';
import { SKIP_NAME } from '../../../../types/string.old.type';
import { DAY_BTN_STANDARD_SKIP_ID } from '../../../../types/bff.old.type';

class MyTUsageGraphbox {
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
      data.remainedRatio = data.remained / data.total * 100;
    }
    if ( !data.isUsedUnlimited ) {
      data.showUseds = this.convFormatWithUnit(data.used, data.unit);
    }
    if ( !data.isRemainUnlimited ) {
      data.showRemaineds = this.convFormatWithUnit(data.remained, data.unit);
    }

    data.isExceed = data.skipId === SKIP_NAME.EXCEED;
    data.couponDate = data.couponDate ? DateHelper.getShortDateNoDot(data.couponDate) : '';
    data.barClassName = this.getBarStayle(data.isUnlimited); // TODO 삭제예정
    data.barClass = this.getBarStyle(data.isUnlimited, data.unit);
    data.isVisibleDayBtn = this.isVisibleDayBtn(data.skipId);
  }

  static convFormat(data: string, unit: string): string {
    switch ( unit ) {
      case UNIT_E.DATA:
        return FormatHelper.convDataFormat(data, UNIT[unit]);
      case UNIT_E.VOICE:
      case UNIT_E.VOICE_2:
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
        return [FormatHelper.customDataFormat(data, UNIT[unit], 'GB')];
      case UNIT_E.VOICE:
      case UNIT_E.VOICE_2:
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
    let className = '';
    switch ( unit ) {
      case UNIT_E.DATA:
        className = 'red';
        break;
      case UNIT_E.VOICE:
      case UNIT_E.VOICE_2:
        className = 'blue';
        break;
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        className = 'green';
        break;
      case UNIT_E.FEE:
        className = 'orange';
        break;
      default:
    }
    if ( isUnlimited ) {
      className += '-stripe';
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

export default MyTUsageGraphbox;
