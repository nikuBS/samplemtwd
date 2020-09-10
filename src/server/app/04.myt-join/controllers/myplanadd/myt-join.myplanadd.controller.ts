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
    scrbDt: DateHelper.getShortDate(addition.scrbDt)
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
          this._getWirelessAdditions(svcInfo),
          this._getWirelessPlan()
          // this._getBenefits(svcInfo)
      ).subscribe(([additions, feePlan]) => {
        if (additions.code) {
          return this.error.render(res, {
            ...additions,
            title: '나의 부가서비스',
            svcInfo: svcInfo,
            pageInfo: pageInfo
          });
        }
        res.render('myplanadd/myt-join.myplanadd.wireless.html', {svcInfo, pageInfo, additions, dcPrograms: feePlan.dcPrograms || []});
      });
    } else {
      // 유선 회선일 경우
      Observable.combineLatest(
          this._getWireAdditions(),
          this._getWirePlan()
      ).subscribe(([additions, feePlan]) => {
        if (additions.code) {
          return this.error.render(res, {
            ...additions,
            title: '나의 부가서비스',
            svcInfo: svcInfo,
            pageInfo: pageInfo
          });
        }
        res.render('myplanadd/myt-join.myplanadd.wire.html', {svcInfo, pageInfo, additions, dcBenefits: feePlan.dcBenefits || []});
      });
    }
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

  // 무선 옵션 및 할인프로그램
  private _getWirelessPlan(): Observable<any> { // command: any): Observable<any> {
    // BFF_05_0222 신규
    // @site: http://devops.sktelecom.com/myshare/pages/viewpage.action?pageId=119906839
    // return this.apiService.request(API_CMD.BFF_05_0222, {}).map((resp) => {
    return this.apiService.request(API_CMD.BFF_05_0136, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const data = resp.result;
        return this._convertWirelessPlan(data);
      }
      // error
      return null;
    });
  }

  //
  private _getWirePlan(): Observable<any> { // command: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0128, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const data = resp.result;
        return this._convertWirePlan(data);
      }
      // error
      return null;
    });
  }

  /**
   * 무선 옵션 및 할인프로그램 데이터 변환
   * @param {Array<Object>} dcPrograms - 옵션 및 할인프로그램 값
   * @return {Array<Object>}
   */
  private _convertWirelessDcPrograms(dcPrograms: Array<any>): Array<any> {
    return dcPrograms.map(program => {
      program.scrbDt = DateHelper.getShortDateWithFormat(program.scrbDt, 'YYYY.M.D.'); // 가입일
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

  /**
   * 무선 데이터 변환
   * @param data - 무선 요금제 데이터
   */
  private _convertWirelessPlan(data): any {
    if (FormatHelper.isEmpty(data.feePlanProd)) {
      return null;
    }
    // 금액, 음성, 문자, 할인상품 값 체크
    /*
    const basFeeTxt = FormatHelper.getValidVars(data.feePlanProd.basFeeTxt),
        basOfrVcallTmsCtt = FormatHelper.getValidVars(data.feePlanProd.basOfrVcallTmsTxt),
        basOfrCharCntCtt = FormatHelper.getValidVars(data.feePlanProd.basOfrLtrAmtTxt),
        disProdList = FormatHelper.getValidVars(data.disProdList, []);
    // 데이터 값 변환
    const basDataGbTxt = FormatHelper.getValidVars(data.feePlanProd.basDataGbTxt),
        basDataMbTxt = FormatHelper.getValidVars(data.feePlanProd.basDataMbTxt),
        basDataTxt = this._convertBasDataTxt(basDataGbTxt, basDataMbTxt);
    // 상품 스펙 공통 헬퍼 사용하여 컨버팅
    const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);
    */
    const disProdList = FormatHelper.getValidVars(data.disProdList, []);
    return {
      // ...data,
      /*
      product: FormatHelper.isEmpty(data.feePlanProd) ? null : {
        ...data.feePlanProd,
        scrbDt: DateHelper.getShortDateWithFormat(data.feePlanProd.scrbDt, 'YYYY.M.D.'),  // 가입일
        basFeeInfo: spec.basFeeInfo,  // 금액
        basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
        basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
        basOfrCharCntCtt: spec.basOfrCharCntCtt,  // 문자
        btnList: this._convertBtnList(data.feePlanProd.btnList, data.feePlanProd.prodSetYn) // 버튼 목록
      },
      */
      dcPrograms: this._convertWirelessDcPrograms(disProdList) // 옵션 및 할인 프로그램
    };
  }

  /**
   * 유선 값 변환
   * @param {Object} data - 유선 요금제 정보
   * @return {Object}
   */
  private _convertWirePlan(data): any {
    // const isBasFeeAmtNumber = !isNaN(Number(data.basFeeAmt)); // 금액 숫자 여부
    return {
      /*
      product: {
        ...data,
        basFeeAmt: isBasFeeAmtNumber && parseInt(data.basFeeAmt, 10) > 0 ?
            FormatHelper.addComma(data.basFeeAmt.toString()) + CURRENCY_UNIT.WON : 0, // 금액 값 단위 붙여서 제공
        svcScrbDt: DateHelper.getShortDateWithFormat(data.svcScrbDt, 'YYYY.M.D.') // 가입일
      },
      */
      dcBenefits: this._convertWireDcBenefits(data.dcBenefits) // 혜택 값 변환
    };
  }

  /**
   * @desc 무선 부가서비스 가져오기
   * @private
   */
  private _getWirelessAdditions(svcInfo: any): Observable<any> {
    return Observable.zip(
        this.apiService.request(API_CMD.BFF_05_0137, {}),
        this.apiService.request(API_CMD.BFF_10_0185, {}, {
          svcMgmtNum: svcInfo.svcMgmtNum,
          svcNum: svcInfo.svcNum,
          custNum: svcInfo.custNum
        }),
        (...resps) => {
          const apiError = resps.find(item => (item && !!item.code && item.code !== '00'));
          if (!FormatHelper.isEmpty(apiError)) {
            return {
              msg: apiError.msg,
              code: apiError.code
            };
          }
          const [additionProds = {}, smartCallPickProds] = resps.map(resp => resp.result);
          const joined = (additionProds.addProdList || []).map(convertAdditionData);
          // 가입된 로밍 요금제가 있을 경우
          const roaming = additionProds.roamingProd ? {
                ...additionProds.roamingProd,
                addRoamingProdCnt: additionProds.roamingProd.recentlyJoinsProdNm ?
                    Number(additionProds.roamingProd.addRoamingProdCnt) - 1 :
                    Number(additionProds.roamingProd.addRoamingProdCnt)
              } :
              {};
          let smartCallPick;
          const listSmartPick = smartCallPickProds.listSmartPick; // || [];
          if (joined.length && listSmartPick.length) {
            // 부가상품에 스마트콜Pick이 있는 경우

            if (joined.filter(item => item.prodId === 'NA00006399').length > 0) {
              // 스마트콜Pick 하위 상품 목록 - 하위 상품 목록은 노출 할 필요가 없어 하위 아이템 추가하는 로직 제거
              // 부가 상품에 조회된 항목에서 스마트콜Pick 옵션 상품 분리
              listSmartPick.forEach((product: any) => {
                const smtCpItemIdx = joined.findIndex(prod => prod.prodId === product.prod_id);
                if (smtCpItemIdx > -1) {
                  joined.splice(smtCpItemIdx, 1);
                }
              });
            }
            smartCallPick = listSmartPick;
          }
          return {
            joined: {
              paids: joined.filter(addition => addition.payFreeYn === 'N'), // 유료 부가 상품
              frees: joined.filter(addition => addition.payFreeYn === 'Y') // 무료 부가 상품
            },
            roaming, // 로밍 요금제
            smartCallPick // 스마트콜픽 상품
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

  // 혜택/할인: 요금 할인 (bill-discounts)
  private _getBillBenefits(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0106, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }

  // 혜택/할인: 결합할인 (combination-discounts)
  private _getCombinationBenefits(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0094, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }

  // 혜택/할인: 장기가입혜택 (loyalty-benefits)
  private _getLoyaltyBenefits(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0196, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }

  // 혜택/할인: 리필쿠폰 내역 (refill-coupons)
  private _getRefillCoupons(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      // error
      return resp;
    });
  }

  // 혜택/할인
  // XXX: svcInfo의 type이 정해진 적 없음
  private _getBenefits(svcInfo: any): Observable<any> {
    if (['M1', 'M3', 'M4'].indexOf(svcInfo.svcAttrCd) > -1) {
      return Observable.combineLatest(
          this._getBillBenefits(),
          this._getCombinationBenefits(),
          this._getLoyaltyBenefits(),
          this._getRefillCoupons()
      ).pipe(
          switchMap((resps: Array<any>) => {
            const apiError = resps.find(item => (item && !!item.code && item.code !== '00'));
            if (!FormatHelper.isEmpty(apiError)) {
              return Observable.of({
                msg: apiError.msg,
                code: apiError.code
              });
            }
            const [bill, combination, loyalty, coupons] = resps;
            const benefits: any = {
              count: 0
            };

            const billList = bill.priceAgrmtList.filter(item =>
                (item.prodId !== bill.clubCd || item.prodId !== bill.tplusCd || item.prodId !== bill.chucchucCd));
            // 요금할인
            if (billList.length > 0) {
              benefits.bill = {
                total: billList.length,
                item: billList[0].prodNm
              };
              benefits.count += billList.length;
            }
            // club상품
            if (bill.clubYN) {
              benefits.club = {
                name: bill.clubNm
              };
              benefits.count += 1;
            }
            // 척척 할인
            if (bill.chucchuc) {
              benefits.goodDiscount = true;
              benefits.count += 1;
            }
            // T끼리 Plus 상품
            if (bill.tplus) {
              benefits.tplus = true;
              benefits.count += 1;
            }
            // 데이터 선물하기
            if (bill.dataGiftYN) {
              benefits.dataGift = true;
              benefits.count += 1;
            }
            // 특화혜택
            if (bill.thigh5 || bill.kdbthigh5) {
              const thighCount = (bill.thigh5 && bill.kdbthigh5) ? 2 : 1;
              benefits.special = {thighCount};
              benefits.count += thighCount;
            }
            // 요금할인- 복지고객
            if (bill.wlfCustDcList && bill.wlfCustDcList.length > 0) {
              benefits.welfare = true;
              benefits.count += bill.wlfCustDcList.length;
            }
            // 결합할인
            if (combination.prodNm.trim().length > 0) {
              combination.bond = {
                name: combination.prodNm,
                total: parseInt(combination.etcCnt, 10) + 1
              };
              benefits.count += combination.bond.total;
            }
            // 데이터 쿠폰
            if (loyalty.benfList.length > 0 && loyalty.benfList.findIndex((item) => (item.benfCd === '1')) > -1) {
              benefits.coupons = coupons.length;
              benefits.count += 1;
            }
            // 장기가입 요금
            if (bill.longjoin) {
              // 장기요금할인 복수개 가능여부 확인 필요
              benefits.loyalty = true;
              benefits.count += loyalty.dcList.length;
            }
            return Observable.of(benefits);
          })
      );
    }
    return Observable.of([]);
  }
}

export default MyTJoinMyPlanAdd;
