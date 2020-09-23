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
import CommonHelper from '../../../../utils/common.helper';
import {CURRENCY_UNIT, DATA_UNIT, MYT_FEEPLAN_BENEFIT} from '../../../../types/string.type';
import {switchMap} from 'rxjs/operators';
import ProductHelper from '../../../../utils/product.helper';
/**
 * @desc 버튼 타입(가입, 설정, 해지)
 */
const PLAN_BUTTON_TYPE = {
  SET: 'SE',  // 설정
  TERMINATE: 'TE',  // 해지
  SUBSCRIBE: 'SC' // 가입
};

/**
 * 혜택 종료일 변환
 * @param {String} dcEndDt - 혜택 종료일
 * @return {String}
 */
const DATE_DC_END = '99991231';
const FORMAT_DC_DATE = 'YYYY.M.D.';

const convertDcEndDt = (dcEndDt: string): string => {
  if (dcEndDt === DATE_DC_END) {
    return MYT_FEEPLAN_BENEFIT.ENDLESS;
  }
  return DateHelper.getShortDateWithFormat(dcEndDt, FORMAT_DC_DATE);
};

/**
 * 혜택 값이 높은 순으로 정렬
 * @param list - 옵션 및 할인 프로그램 목록
 */
const sortByHigher = (list: Array<any>): Array<any> =>
    list.sort((itemA, itemB) => (itemA.dcVal > itemB.dcVal) ? -1 : (itemA.dcVal < itemB.dcVal) ? 1 : 0);

/**
 * @desc 부가서비스 BFF 데이터 가공
 * @private
 */
const convertAdditionData = (addition: any) => {
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
    // [OP002-4115] 신규 변경사항 - 유료만 보기 탭 선택시 유료 및 상세참조 부가서비스 카운팅 개수 출력
    isNotFree: addition.payFreeYn === 'N' || addition.payFreeYn === 'Y' && PRODUCT_CALLPLAN.SEE_CONTENTS.includes(addition.basFeeTxt),
    scrbDt: DateHelper.getShortDate(addition.scrbDt) // 신청일
  };
};

/**
 * @desc 등록일 오름차순으로 보이도록 설정
 */
const sortAdditionData = (a, b) => {
  const diff = DateHelper.getDifference(a.scrbDt, b.scrbDt);
  if (diff > 0) {
    return 1;
  }
  if (diff < 0) {
    return -1;
  }
  return 0;
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
   * @param  {Object} svcInfo
   * @param  {Object} _allSvc
   * @param  {Object} _childInfo
   * @param  {Object} pageInfo
   */
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    // 회선선택 영역 확대 2차
    CommonHelper.addCurLineInfo(svcInfo);

    if (svcInfo.svcAttrCd.includes('M')) {
      // 무선 회선일 경우
      Observable.combineLatest(
          this._getWirelessAdditions(svcInfo)
      ).subscribe(([additions]) => {
        if (additions.code) {
          return this.error.render(res, {
            ...additions,
            title: '나의 부가서비스',
            svcInfo: svcInfo,
            pageInfo: pageInfo
          });
        }
        res.render('myplanadd/myt-join.myplanadd.wireless.html', {svcInfo, pageInfo, additions});
      });
    } else {
      // 유선 회선일 경우
      Observable.combineLatest(
          this._getWireAdditions()
      ).subscribe(([additions]) => {
        if (additions.code) {
          return this.error.render(res, {
            ...additions,
            title: '나의 부가서비스',
            svcInfo: svcInfo,
            pageInfo: pageInfo
          });
        }
        res.render('myplanadd/myt-join.myplanadd.wire.html', {svcInfo, pageInfo, additions});
      });
    }
  }

  /**
   * @desc 무선 부가서비스 가져오기
   * @private
   */
  private _getWirelessAdditions(svcInfo: any): Observable<any> {
    return Observable.zip(
        this.apiService.request(API_CMD.BFF_05_0222, {}),
        this.apiService.request(API_CMD.BFF_10_0185, {}, {
          svcMgmtNum: svcInfo.svcMgmtNum,
          svcNum: svcInfo.svcNum,
          custNum: svcInfo.custNum
        }),
        (...resps) => {
          const apiError = resps.find(resp => (resp && !!resp.code && resp.code !== '00'));
          if (!FormatHelper.isEmpty(apiError)) {
            return {
              msg: apiError.msg,
              code: apiError.code
            };
          }
          const [additionProds = {}, smartCallPickProds] = resps.map(resp => resp.result);
          let joinedPaid = (additionProds.addProdPayList || []).map(convertAdditionData);
          let joinedFree = (additionProds.addProdFreeList || []).map(convertAdditionData);
          // 가입된 로밍 요금제가 있을 경우
          const roaming = additionProds.roamingProd ? {
                ...additionProds.roamingProd,
                addRoamingProdCnt: additionProds.roamingProd.recentlyJoinsProdNm ?
                    Number(additionProds.roamingProd.addRoamingProdCnt) - 1 :
                    Number(additionProds.roamingProd.addRoamingProdCnt)
              } :
              {};
          const smartCallPick = smartCallPickProds.listSmartPick;
          // 부가상품에 스마트콜Pick이 있는 경우
          if (smartCallPick.length) {
            if (joinedPaid.length) {
              /*
              if (joinedPaid.filter(item => item.prodId === 'NA00006399').length > 0) {
                // 스마트콜Pick 하위 상품 목록 - 하위 상품 목록은 노출 할 필요가 없어 하위 아이템 추가하는 로직 제거
                // 부가 상품에 조회된 항목에서 스마트콜Pick 옵션 상품 분리
                smartCallPick.forEach((product: any) => {
                  const smtCpItemIdx = joinedPaid.findIndex(prod => prod.prodId === product.prod_id);
                  if (smtCpItemIdx > -1) {
                    joinedPaid.splice(smtCpItemIdx, 1);
                  }
                });
              }
              */
              joinedPaid = joinedPaid.filter(prodJoined => {
                const prodIdJoined = prodJoined.prodId;
                // if (prodIdJoined === 'NA00006399') {
                  return !smartCallPick.find(prodSmartCallPick => (prodIdJoined === prodSmartCallPick.prod_id));
                // }
                // return true;
              });
            }
            // TODO: 무료 상품에도 스마트콜픽이 있지 않을 듯 하지만, 확인 후 제거하자!
            if (joinedFree.length) {
              /*
              if (joinedFree.filter(item => item.prodId === 'NA00006399').length > 0) {
                // 스마트콜Pick 하위 상품 목록 - 하위 상품 목록은 노출 할 필요가 없어 하위 아이템 추가하는 로직 제거
                // 부가 상품에 조회된 항목에서 스마트콜Pick 옵션 상품 분리
                smartCallPick.forEach((product: any) => {
                  const smtCpItemIdx = joinedFree.findIndex(prod => prod.prodId === product.prod_id);
                  if (smtCpItemIdx > -1) {
                    joinedFree.splice(smtCpItemIdx, 1);
                  }
                });
              }
              */
              joinedFree = joinedFree.filter(prodJoined => {
                const prodIdJoined = prodJoined.prodId;
                // if (prodIdJoined === 'NA00006399') {
                  return !smartCallPick.find(prodSmartCallPick => (prodIdJoined === prodSmartCallPick.prod_id));
                // }
                // return true;
              });
            }
          }
          return {
            joined: {
              paids: joinedPaid, // 유료 부가 상품
              frees: joinedFree // 무료 부가 상품
            },
            roaming, // 로밍 요금제
            dcPrograms: this._convertWirelessDcPrograms(additionProds.disProdList || []), // 옵션/할인 프로그램
          };
        });
  }

  /**
   * @desc 유선 부가서비스 가져오기
   * @private
   */
  private _getWireAdditions(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0129, {}).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        const data = resp.result;
        return {
          joined: {
            paids: (data.pays || []).map(convertAdditionData), // 가입된 유료 부가서비스
            frees: (data.frees || []).map(convertAdditionData) // 가입된 무료 부가서비스
          },
          joinable: data.joinables.map(convertAdditionData).sort(sortAdditionData), // 가입 가능한 부가서비스 목록
          reserved: data.reserveds.map(convertAdditionData)  // 가입 예약된 부가서비스 목록
        };
      }
      return resp;
    });
  }

  /**
   * 버튼 목록 컨버팅
   * @param {Array<Object>} btnList - 버튼 목록
   * @param {String} prodSetYn - 해당 상품의 설정 허용 여부
   */
  private _convertBtnList(btnList: Array<any>, prodSetYn: string): Array<any> {
    if (FormatHelper.isEmpty(btnList) || prodSetYn !== 'Y') {
      return [];
    }

    const settingBtnList: any = [];

    btnList.forEach((item) => {
      if (item.btnTypCd !== 'SE') { // 설정 외 버튼은 노출되지 않도록 처리 (by 기획 요건)
        return true;
      }

      settingBtnList.push(item);
    });

    return settingBtnList;
  }

  /**
   * 무선 옵션 및 할인프로그램 데이터 변환
   * @param {Array<Object>} dcPrograms - 옵션 및 할인프로그램 값
   * @return {Array<Object>}
   */
  private _convertWirelessDcPrograms(dcPrograms: Array<any>): Array<any> {
    return dcPrograms.map(program => {
      program.scrbDt = DateHelper.getShortDateWithFormat(program.scrbDt, 'YYYY.M.D.'); // 신청일
      program.btnList = this._convertBtnList(program.btnList, program.prodSetYn); // 버튼 목록 변환
      program.dcStaDt = FormatHelper.isEmpty(program.dcStaDt) ? null : DateHelper.getShortDateWithFormat(program.dcStaDt, 'YYYY.M.D.'); // 시작일
      program.dcEndDt = FormatHelper.isEmpty(program.dcEndDt) ? null : convertDcEndDt(program.dcEndDt); // 종료일
      return program;
    });
  }

  /**
   * 유선상품 할인혜택 데이터 변환
   * @param {Array<Object>} dcBenefits - 유선상품 할인혜택 데이터 값
   * @return {Array<Object>}
   */
  private _convertWireDcBenefits(dcBenefits: Array<any>): Array<any> {
    const dcTypeMoneyList: Array<any> = [];
    const dcTypePercentList: Array<any> = [];

    // 할인 값 단위 형태에 따라 목록 나눔 (원, %)
    dcBenefits.forEach((item) => {
      if (item.dcCttClCd === '01') {
        dcTypeMoneyList.push(item);
        return true;
      }

      dcTypePercentList.push(item);
    });

    // 원단위 높은값 목록 + 퍼센트 높은값 목록을 변환하여 반환
    return [...sortByHigher(dcTypeMoneyList), ...sortByHigher(dcTypePercentList)]
        .map(benefit => {
          benefit.penText = (benefit.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N; // 위약금 여부
          benefit.dcStaDt = DateHelper.getShortDateWithFormat(benefit.dcStaDt, 'YYYY.M.D.'); // 할인기간 (시작)
          benefit.dcEndDt = (benefit.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(benefit.dcEndDt, 'YYYY.M.D.')
              : MYT_FEEPLAN_BENEFIT.ENDLESS;  // 할인기간 (끝)
          benefit.dcVal = benefit.dcCttClCd === '01' ? FormatHelper.addComma(benefit.dcVal.toString()) : benefit.dcVal; // 할인 값
          return benefit;
        });
  }
}

export default MyTJoinMyPlanAdd;
