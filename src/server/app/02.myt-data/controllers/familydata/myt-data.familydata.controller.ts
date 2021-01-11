/**
 * @file T가족모아 데이터 < 나의 데이터/통화 < MyT
 * @author Jiyoung Jo
 * @editor Kim In Hwan
 * @since 2018.10.01
 * @edit 2020.2.16
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import { UNIT_E } from '../../../../types/bff.type';

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
      const { mbrList, dropMbrList, total, used, remained } = resp.result;
      const mine = mbrList.find(member => member.svcMgmtNum === svcInfo.svcMgmtNum);
      if (!mine) {
        return {
          code: '',
          msg: ''
        };
      }
      const representation = mbrList.find(member => member.repYn === 'Y');
      const dropMbrInfo = {
        isDropMbrList: (dropMbrList && dropMbrList.length > 0),
        usedData: 0,
        totalData: 0,
        totalShared: 0,
        outputTotal: {},
        outputUsed: {}
      };
      const data = {
        hasLimit: mine.limitedYn === 'Y',
        used: Number(mine.used),
        remained: Number(mine.remained),
        total: Number(total) * 1024,
        totalUsed: Number(used),
        totalRemained: Number(remained),
        myLimitation: Number(mine.limitation) * 1024 || 0
      };
        // 한도 있는 경우 한도, 가족 공유 데이터 양 중 최소, 한도 없는 경우 가족 총 공유 데이터가 total
      const usedTotal = data.hasLimit ? Math.min(data.myLimitation, data.total) : data.total;
        // 한도 있는 경우 총량 - 자신의 사용량, 가족 남은 양 중 최소, 한도 없는 경우 총 남은 양(BFF 데이터에서 종종 remained 값이 다르게 내려오는 경우가 있어 방어 코드)
      const usedRemained = data.hasLimit ?
        Math.min(usedTotal - data.used, data.totalRemained) : Math.min(data.total - data.totalUsed, data.totalRemained);
      // 기존 구성원에 탈퇴한 회원 목록이 포함되어 노출되는 경우가 있어 코드 추가
      // existYn : Y <- 현재 구성원  N <- 탈퇴한 구성원
      const nMbrList = mbrList.filter((member) => member.existYn === 'Y');
      // 탈퇴원 그룹원이 있는 경우 - OP002-6669
      if (dropMbrInfo.isDropMbrList) {
        // 탈퇴한 구성원 총 이용 데이터
        dropMbrList.find(dropItem => dropMbrInfo.usedData += Number(dropItem.used));
        // 탈퇴 그룹원 총 공유 데이터  ( 총공유된 데이터 - 포함된 구성원 데이터 합) 온T와 동일
        dropMbrInfo.totalData = usedTotal - data.totalUsed;
        dropMbrInfo.outputTotal = FormatHelper.convDataFormat(dropMbrInfo.totalData, DATA_UNIT.MB);
        dropMbrInfo.outputUsed = FormatHelper.convDataFormat(dropMbrInfo.usedData, DATA_UNIT.MB);
      }

      return {
        ...resp.result,
        total: FormatHelper.convDataFormat(total, DATA_UNIT.GB),
        used: FormatHelper.addComma(used),
        remained: FormatHelper.addComma(remained),
        isRepresentation: !!representation ? representation.svcMgmtNum === svcInfo.svcMgmtNum : false,
        mine: {
          ...mine,
          ratio: data.hasLimit && data.myLimitation === 0 ? 0 : Math.floor(usedRemained / usedTotal * 100),
          remained: FormatHelper.convDataFormat(usedRemained, DATA_UNIT.MB),
          used: FormatHelper.convDataFormat(Number(mine.used), DATA_UNIT.MB),
          shared: FormatHelper.addComma(mine.shared),
          limitation: FormatHelper.addComma(mine.limitation),
          svcNum: FormatHelper.conTelFormatWithDash(mine.svcNum),
          data
        },
        mbrList: nMbrList.map(member => ({
            ...member,
            used: FormatHelper.convDataFormat(member.used, DATA_UNIT.MB),
            shared: FormatHelper.convDataFormat(member.shared, DATA_UNIT.GB),
            limitation: FormatHelper.addComma(member.limitation),
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum)
          }
        )),
        // OP002-6669 VOC T가족모아 탈퇴한 구성원 정보 노출
        dropMbrInfo
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
      // mySharePot - histories
      const { mySharePot } = resp.result;
      return mySharePot ? mySharePot.length : 0;
    });
  }
}
