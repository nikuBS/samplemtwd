/**
 * @file T가족모아 데이터 < 나의 데이터/통화 < MyT
 * @author Jiyoung Jo
 * @since 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';

const DATA_ZERO = {
  data: 0,
  unit: DATA_UNIT.KB
};


/**
 * @class
 * @desc T 가족모아 데이터
 */
export default class MyTDataFamily extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * @desc 화면 랜더링
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {Object} svcInfo
   * @param  {Object} _allSvc
   * @param  {Object} _childInfo
   * @param  {Object} pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(this._getFamilyData(svcInfo), this._getHistory()).subscribe(([familyInfo, histories]) => {
      const error = {
        code: familyInfo.code || histories.code,
        msg: familyInfo.msg || histories.msg
      };

      if (error.code) {
        return this.error.render(res, {
          ...error,
          pageInfo,
          svcInfo
        });
      }

      res.render('familydata/myt-data.familydata.html', { svcInfo, pageInfo, familyInfo, histories });
    });
  }

  /**
   * @desc T 가족모아 데이터 가져오기
   * @private
   */
  private _getFamilyData = svcInfo => {
    return this.apiService.request(API_CMD.BFF_06_0044, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
      const representation = resp.result.mbrList.filter(member => member.repYn === 'Y');
      const mine = resp.result.mbrList.filter(member => member.svcMgmtNum === svcInfo.svcMgmtNum);
      if (!mine) {
        return {
          code: '',
          msg: ''
        };
      }

      const data = {
        hasLimit: mine.limitedYn === 'Y',
        used: Number(mine.used),
        remained: Number(mine.remained),
        total: Number(resp.result.total) * 1024,
        totalUsed: Number(resp.result.used),
        totalRemained: Number(resp.result.remained),
        myLimitation: Number(mine.limitation) * 1024 || 0
      },
        // 한도 있는 경우 한도, 가족 공유 데이터 양 중 최소, 한도 없는 경우 가족 총 공유 데이터가 total
        total = data.hasLimit ? Math.min(data.myLimitation, data.total) : data.total,
        // 한도 있는 경우 총량 - 자신의 사용량, 가족 남은 양 중 최소, 한도 없는 경우 총 남은 양(BFF 데이터에서 종종 remained 값이 다르게 내려오는 경우가 있어 방어 코드)
        remained = data.hasLimit ? Math.min(total - data.used, data.totalRemained) : Math.min(data.total - data.totalUsed, data.totalRemained);
      return {
        ...resp.result,
        total: Number(resp.result.total) > 0 ? FormatHelper.convDataFormat(resp.result.total, DATA_UNIT.GB) : DATA_ZERO,
        used: FormatHelper.addComma(resp.result.used),
        remained: FormatHelper.addComma(resp.result.remained),
        isRepresentation: !!representation ? representation.svcMgmtNum === svcInfo.svcMgmtNum : false,
        mine: {
          ...mine,
          ratio: data.hasLimit && data.myLimitation === 0 ? 0 : Math.floor(remained / total * 100),
          remained: remained > 0 ? FormatHelper.convDataFormat(remained, DATA_UNIT.MB) : DATA_ZERO,
          used: FormatHelper.convDataFormat(Number(mine.used), DATA_UNIT.MB),
          shared: FormatHelper.addComma(mine.shared),
          limitation: FormatHelper.addComma(mine.limitation),
          svcNum: FormatHelper.conTelFormatWithDash(mine.svcNum),
          data: data
        },
        mbrList: resp.result.mbrList.map(member => ({
            ...member,
            used: Number(member.used) > 0 ? FormatHelper.convDataFormat(member.used, DATA_UNIT.MB) : DATA_ZERO,
            shared: Number(member.shared) > 0 ? FormatHelper.convDataFormat(member.shared, DATA_UNIT.GB) : DATA_ZERO,
            limitation: FormatHelper.addComma(member.limitation),
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum)
          }
        )),
        // OP002-6669 VOC T가족모아 탈퇴한 구성원 정보 노출 - 데이터 구조는 아직 미정
        dropMbrList: resp.result.dropMbrList.map(member => ({
            ...member,
            used: Number(member.used) > 0 ? FormatHelper.convDataFormat(member.used, DATA_UNIT.MB) : DATA_ZERO,
            shared: Number(member.shared) > 0 ? FormatHelper.convDataFormat(member.shared, DATA_UNIT.GB) : DATA_ZERO,
            limitation: FormatHelper.addComma(member.limitation),
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum)
          }
        ))
      };
    });
  }

  /**
   * @desc 이번달 공유 내역 가져오기
   * @private
   */
  private _getHistory = () => {
    return this.apiService.request(API_CMD.BFF_06_0071, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const histories = resp.result.mySharePot;
      return histories ? histories.length : 0;
    });
  }
}
