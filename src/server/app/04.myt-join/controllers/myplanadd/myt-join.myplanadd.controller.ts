/**
 * @file myt-join.myplanadd.controller.ts
 * @author Jiyoung Jo
 * @since 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * @desc 버튼 타입(가입, 설정, 해지)
 */
const PLAN_BUTTON_TYPE = {
  SET: 'SE',  // 설정
  TERMINATE: 'TE',  // 해지
  SUBSCRIBE: 'SC' // 가입
};

/**
 * @class
 * @desc 나의 부가서비스
 */
class MyTJoinMyPlanAdd extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * @desc 화면 랜더링
   * @param  {Request} _req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (svcInfo.svcAttrCd.includes('M')) {  // 모바일 회선일 경우
      this._getMobileAdditions().subscribe(mobile => {
        if (mobile.code) {
          return this.error.render(res, {
            ...mobile,
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            title: '나의 부가서비스'
          });
        }

        res.render('myplanadd/myt-join.myplanadd.mobile.html', { svcInfo, pageInfo, ...mobile });
      });
    } else {  // 유선 회선일 경우
      this._getWireAdditions().subscribe(wire => {
        if (wire.code) {
          return this.error.render(res, {
            ...wire,
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            title: '나의 부가서비스'
          });
        }

        res.render('myplanadd/myt-join.myplanadd.wire.html', { svcInfo, pageInfo, ...wire });
      });
    }
  }

  /**
   * @desc 무선 부가서비스 가져오기
   * @private
   */
  private _getMobileAdditions = () => {  // 무선 가입 부가서비스 가져오기
    return this.apiService.request(API_CMD.BFF_05_0137, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        additions: (resp.result.addProdList || []).map(this._convertAdditions),
        roaming: resp.result.roamingProd ? // 가입된 로밍 요금제가 있을 경우
          {
            ...resp.result.roamingProd,
            addRoamingProdCnt: resp.result.roamingProd.recentlyJoinsProdNm ?
              Number(resp.result.roamingProd.addRoamingProdCnt) - 1 :
              Number(resp.result.roamingProd.addRoamingProdCnt)
          } :
          {}
      };
    });
  }

  /**
   * @desc 유선 부가서비스 가져오기
   * @private
   */
  private _getWireAdditions = () => {  // 유선 가입 부가서비스 가져오기
    return this.apiService.request(API_CMD.BFF_05_0129, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return {
        joined: (resp.result.pays || []).concat(resp.result.frees || []).map(this._convertAdditions),  // 가입된 유료 부가서비스, 무료 부가서비스 합치기
        joinable: resp.result.joinables.map(this._convertAdditions).sort(this._sortAdditions), // 가입 가능한 부가서비스 목록
        reserved: resp.result.reserveds.map(this._convertAdditions)  // 가입 예약된 부가서비스 목록
      };
    });
  }

  /**
   * @desc 부가서비스 BFF 데이터 가공
   * @private
   */
  private _convertAdditions = (addition: any) => {
    return {
      ...addition,  // 추가작업 불필요한 속성들 스프레드
      ...(addition.btnList && addition.btnList.length > 0 ? // 버튼 리스트가 있을 경우
        {
          btnList: addition.btnList
            .filter(btn => {
              return btn.btnTypCd === PLAN_BUTTON_TYPE.SET && addition.prodSetYn === 'Y'; // 설정 버튼이 있고, 어드민에서 설정버튼 노출 Y일 경우(가입, 해지버튼 미노출)
            })
          // .sort(this._sortButtons) // 해지버튼을 제일 뒤에 노출해달라는 요구사항이 있어 추가 -> 설정 버튼 외 미노출로 변경되어 삭제
        } :
        {}),
      basFeeTxt: FormatHelper.getFeeContents(addition.basFeeTxt),
      scrbDt: DateHelper.getShortDate(addition.scrbDt)
    };
  }

  
  /**
   * @desc 등록일 오름차순으로 보이도록 설정
   * @private
   */
  private _sortAdditions = (a, b) => {
    const diff = DateHelper.getDifference(a.scrbDt, b.scrbDt);
    if (diff > 0) {
      return 1;
    } else if (diff < 0) {
      return -1;
    }

    return 0;
  }
}

export default MyTJoinMyPlanAdd;
