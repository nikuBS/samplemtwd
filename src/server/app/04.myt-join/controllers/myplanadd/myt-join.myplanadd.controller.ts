/**
 * @file 나의 부가서비스 < 나의 가입 정보 < MyT
 * @author Jiyoung Jo
 * @editor Kim InHwan
 * @since 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { PRODUCT_CALLPLAN } from '../../../../types/bff.type';
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
      this._getMobileAdditions.apply(this, [res, svcInfo, pageInfo]);
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
  private _getMobileAdditions = (res, svcInfo, pageInfo) => {  // 무선 가입 부가서비스 가져오기
    Observable.combineLatest(
        this._wirelessAdditionProduct(),
        this._smartCallPickProduct(svcInfo)
    ).subscribe(([wirelessAddProd, smartCallPickProd]) => {
      if (wirelessAddProd.code) {
        return this.error.render(res, {
          ...wirelessAddProd,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: '나의 부가서비스'
        });
      }
      // 부가상품에 스마트콜Pick이 있는 경우
      if (wirelessAddProd.additions.filter(item => item.prodId === 'NA00006399').length > 0) {
        // 스마트콜Pick 하위 상품 목록 - 하위 상품 목록은 노출 할 필요가 없어 하위 아이템 추가하는 로직 제거
        // 부가 상품에 조회된 항목에서 스마트콜Pick 옵션 상품 분리
        smartCallPickProd.forEach((pProd) => {
          const smtCpItemIdx = wirelessAddProd.additions.findIndex(wProd => wProd.prodId === pProd.prod_id);
          if (smtCpItemIdx > -1) {
            wirelessAddProd.additions.splice(smtCpItemIdx, 1);
          }
        });
      }
      res.render('myplanadd/myt-join.myplanadd.mobile.html', { svcInfo, pageInfo, ...wirelessAddProd });
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
      // [OP002-3974] 신규 변경사항 - 유료만 보기 탭 선택시 유료 및 상세참조 부가서비스 카운팅 개수 출력
      isNotFree: addition.payFreeYn === 'N' || addition.payFreeYn === 'Y' && PRODUCT_CALLPLAN.SEE_CONTENTS.includes(addition.basFeeTxt),
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

  /**
   * 스마트콜 Pick 상품 조회
   * @param svcInfo
   * @private
   */
  private _smartCallPickProduct(svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0185, {}, {
      svcMgmtNum: svcInfo.svcMgmtNum,
      svcNum: svcInfo.svcNum,
      custNum: svcInfo.custNum
    }).map( resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }
      return resp.result.listSmartPick;
    });
  }

  /**
   * @desc 무선 부가서비스 상품 조회
   * @private
   */
  private _wirelessAdditionProduct(): Observable<any> {
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
}

export default MyTJoinMyPlanAdd;
