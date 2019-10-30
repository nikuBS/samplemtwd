/**
 * @file 총적용가입기간 상세 팝업 < 나의 결합상품 < 나의 가입 정보 < MyT
 * @author 양정규
 * @since 2019.10.10
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import 'rxjs/add/observable/of';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_JOIN_MYPLANCOMBINE, MYT_JOIN_WIRE_SET_PAUSE, MYT_STRING_KOR_TERM} from '../../../../types/string.type';
import StringHelper from '../../../../utils/string.helper';

/**
 * @class
 * @desc 총적용가입기간 상세 팝업
 */
export default class MyTJoinMyPlanCombineJoinPeriod extends TwViewController {
  constructor() {
    super();
  }
  /**
   * @desc 화면 랜더링
   * @param req 
   * @param res 
   * @param _next 
   * @param svcInfo 
   * @param _allSvc 
   * @param _childInfo 
   * @param pageInfo 
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0134, {}, {}, [req.query.prodId]).subscribe(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          pageInfo: pageInfo,
          ...resp,
          svcInfo
        });
      }
      // 총 적용 가입기간
      let totalUseYy = 0 // 총 적용 가입기간(년도)
        , totalUseMm = 0; // 총 적용 가입기간(월)
      const isWire = req.query.type === '2'; // T+B인터(패밀리형) 유무
      const joinPeriodList: Array<any> = new Array<any>();


      // 가족 합산 총 가입기간 더하기
      const addTotalUse = (useYy, useMm) => {
        if ( !FormatHelper.isNumber(useYy) && !FormatHelper.isNumber(useMm) ) {
          return;
        }
        totalUseYy += Number(useYy);
        totalUseMm += Number(useMm);
      };

      // 년도(yy), 월(mm) 값이 0이 아닌경우만 노출. 둘다 0 이면 하이픈(-)
      const getTextDate = (yy, mm) => {
        yy = yy ? yy.toString() : '0';
        mm = mm ? mm.toString() : '0';

        const template = MYT_JOIN_MYPLANCOMBINE.DATE_FORMAT;
        let text = '';
        // 마스킹 상태인 경우
        if (!pageInfo.masking) {
          return template.replace('{0}', yy).replace('{1}', mm);
        }
        // 년도 가 0이 아닌경우
        if (yy !== '0') {
          text = yy + MYT_STRING_KOR_TERM.year;
        }
        if (mm !== '0') {
          text += ' ' + mm + MYT_JOIN_WIRE_SET_PAUSE.MONTH;
        }
        if (yy === '0' && mm === '0') {
          return '-';
        }
        return text.trim();
      };

      // 가족 합산 총 가입기간 텍스트 변환
      const getTotalUseDate = () => {
        // 마스킹 상태인 경우
        if (!pageInfo.masking) {
          return getTextDate('*', '*');
        }
        totalUseYy += Math.floor(totalUseMm / 12);
        totalUseMm = totalUseMm % 12;
        return getTextDate(totalUseYy, totalUseMm);
      };

      // 리스트에 들어갈 내용 만들기
      const makeListBody = (item, svcType: string) => {
        addTotalUse(item.useYy, item.useMm);
        if (isWire) {
          item.svcType = svcType;
        }
        item.svcNum = svcType === 'T' ? StringHelper.phoneStringToDash(item.svcNum) : '-'; // B상품인 경우 하이픈(-)처리
        item.totalJoinDate = getTextDate(item.uyy, item.umm);       // 총 가입기간
        item.totalExpDate = getTextDate(item.totMYy, item.totMMm);  // 총 제외기간
        item.totalUseDate = getTextDate(item.useYy, item.useMm);    // 적용 가입기간
        joinPeriodList.push(item);
      };

      // T끼리온가족할인
      (resp.result.combinationWirelessMemberList || []).forEach( item => {
        makeListBody(item, 'T');
      });

      // T+B인터(패밀리형)
      if (isWire) {
        const code = ['NH00000037', 'NH00000039', 'TW00000062'].indexOf(req.query.prodId) !== -1 ? 'I' : 'P';
        (resp.result.combinationWireMemberList || []).forEach( item => {
          if (item.svcCd !== code ) {
            return false;
          }
          makeListBody(item, 'B');
        });
      }

      res.render('myplancombine/myt-join.myplancombine.period.html', {
        svcInfo,
        pageInfo,
        totUseYyText: getTotalUseDate(),
        joinPeriodList
      });
    });

  }
}
