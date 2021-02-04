/**
 * MenuName: 나의 요금 > 서브메인 (나의혜택/할인 영역)
 * @file myt-fare.submain.my-benefit.controller.ts
 * @author 양정규
 * @since 2020.12.30
 *
 */
import {API_CMD} from '../../../../types/api-command.type';
import {Request, Response} from 'express';
import MytFareSubmainCommonService from './myt-fare.submain.common.service';
import {Observable} from 'rxjs/Observable';
import {LOGIN_TYPE, MEMBERSHIP_GROUP} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';

export class MytFareSubmainMyBenefitService extends MytFareSubmainCommonService {

  constructor(req: Request, res: Response, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    super(req, res, svcInfo, allSvc, childInfo, pageInfo);
  }


  public getBenefit(): Observable<any> {
    this.apiService.setTimeout(3000); // 타임아웃 3초 설정
    return Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_11_0001, {}), // membership
      this.apiService.request(API_CMD.BFF_05_0106, {}), // 요금할인 (bill-discounts)
      this.apiService.request(API_CMD.BFF_05_0094, {}), // 결합할인 (combination-discounts)
      this.apiService.request(API_CMD.BFF_05_0196, {}), // 장기가입혜택 (loyalty-benefits)
    ).map( ([membership, bill, combination, loyalty]) => {

      return this.parseData(membership, bill, combination, loyalty);
    });
  }

  private parseData(membership, bill, combination, loyalty): any {
    const {svcInfo} = this.info;
    let benefitCount = 0;
    const membershipResult = membership.result || {};
    const billResult = bill.result || {};
    const {clubCd, tplusCd, chucchucCd, clubYN, chucchuc, tplus, dataGiftYN, thigh5, kdbthigh5} = billResult;
    const {wlfCustDcList = [], longjoin} = billResult;

    const loyaltyResult = loyalty.result || {};
    const {benfList = [], dcList = []} = loyaltyResult;

    const billList = (billResult.priceAgrmtList || []).filter(item => {
      const prodId = item.prodId;
      if ( prodId !== clubCd || prodId !== tplusCd || prodId !== chucchucCd ) {
        return item;
      }
    });

    const addCount = (v: any, cnt?: number) => {
      benefitCount += v ? (cnt ? cnt : 1) : 0;
    };
    addCount(billList.length, billList.length); // 요금할인
    addCount(clubYN); // club상품
    addCount(chucchuc); // 척척할인
    addCount(tplus); // T끼리 Plus 상품
    addCount(dataGiftYN); // 데이터 선물하기
    addCount(wlfCustDcList.length > 0, wlfCustDcList.length); // 요금할인- 복지고객
    addCount(longjoin, dcList.length); // 장기가입 요금

    // 결합할인
    const combiResult = combination.result || {};
    if ( (combiResult.prodNm || '').trim().length > 0 ) {
      benefitCount += parseInt((combiResult.etcCnt || '0'), 10) + 1;
    }
    // 데이터 쿠폰
    if ( benfList.length > 0 && benfList.findIndex( item => item.benfCd === '1') > -1 ) {
      benefitCount++;
    }

    // 특화혜택
    if ( thigh5 || kdbthigh5 ) {
      benefitCount += (thigh5 && kdbthigh5) ? 2 : 1;
    }
    const result = {
      mbsGrade: (MEMBERSHIP_GROUP[membershipResult.mbrGrCd] || '가입하기').toUpperCase(), // 멤버십 등급
      showUsedAmount: membershipResult.mbrUsedAmt ? FormatHelper.addComma((+membershipResult.mbrUsedAmt).toString()) : '', // 연간 혜택
      benefitCount // 혜택/할인 건수
    };
    if (svcInfo.loginType === LOGIN_TYPE.EASY) {
      result.mbsGrade = '간편 로그인</br>조회불가';
      result.showUsedAmount = '';
    }

    return result;
  }

}
