/**
 * @file 지점/대리점 상세정보 페이지 처리
 * @author Hakjoon sim
 * @since 2018-10-29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {CUSTOMER_AGENT_SEARCH} from '../../../../types/string.type';
import {LOGIN_TYPE} from '../../../../types/bff.type';

interface RegionInfoList {
  locCode: string;
  locName: string;
  storeName: string;
  searchAddr: string; // 도로명 주소
  jibunAddr: string;
  tel: string;
  geoX: string;
  geoY: string;
  talkMap: string;
  agnYn: string;
  authAgnYn: string;
  tSharpYn: string; // "T#모바일상담예약", (전문상담:휴대폰일반(신규/기변),유선/인터넷/TV,ADT캡스 보안)
  shopTpsCd: string; // "매장특성구분코드", (04:T Premium Store, 06:T Flagship Store)
  unmanShop: string; // 무인매장 여부 Y,N

  // 처리 가능 업무
  dvcChange: string; // 기기 변경
  nmChange: string; // 명의 변경
  feeAcceptance: string; // 요금 수납
  rbpAsYn: string; // 행복 A/S
  hanaroCode: string; // "SK브로드밴드", (1:Y, 0:N)
  secuConsulting: string; // 보안상담
  appleYn: string; // 애플취급점
  pickupYn: string; // 바로픽업
  nameTheft: string; // 명의 도용 접수
  callHistSearch: string; // 통화 내역 조회
  rentYn: string; // 임대폰
  dvcTechConsulting: string; // 디바이스 기술상담
  skMagicRent: string; // SK매직 렌탈상담

  // 체험존
  fiveGxYn: string; // 5GX 체험존
  vrYn: string; // VR 체험존
  wavveYn: string; // wavve
  floYn: string; // FLO
  xcloudYn: string; // Xcloud

  // 교육 프로그램
  speedYn: string; // 스마트폰 기초 과정
  applEduYn: string; // 스마트폰 응용 과정
  codingEduYn: string; // 코딩 교실

  // 기타
  cultureYn: string; // 지점문화 공간대여
  dstrbStcAplyYn: string; // 매장인증제 통계반응
}

interface Services {
  title: string;
  category: string;
  datas: Array<string>;
}

interface BranchDetail {
  custRateAvg: string;
  custRateCnt: string;
  weekdayOpenTime: string;
  weekdayCloseTime: string;
  satOpenTime: string;
  satCloseTime: string;
  holidayOpenTime: string;
  holidayCloseTime: string;
  regionInfoList: Array<RegionInfoList>;
  // talkMapArr?: Array<string>;
  star?: string;
  services?: Array<Services> | any;
  shopTypeNm?: Array<string> | any; // 매장분류 명
  storeType: string; // 매장유형 (1: 지점, 2:대리점)
  url?: string; // 상담예약 url
  isReserve?: boolean; // 상담예약 가능여부
  charge?: boolean; // 과금팝업 유무
  // 운영시간
  weekTime?: string; // 평일
  satTime?: string; // 토요일/공휴일
  sunTime?: string; // 일요일
  prPhrs: string; // 매장소개
}

class CustomerAgentsearchDetail extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    const branchCode = req.query.code;
    const isExpZone = req.query.isExpZone || false; /* 5gx 및 VR zone 관련 플래그 추가 */
    const isHappy = req.query.isHappy || false; // 행복 커뮤니티 페이지

    this.getBranchDetailInfo(res, svcInfo, pageInfo, branchCode).subscribe(
      (detail) => {
        if (!FormatHelper.isEmpty(detail)) {
          // 20-10-22 OP002-10922 비 로그인/간편로그인 사용자도 진입가능
          const _svcInfo = !svcInfo || svcInfo.loginType === LOGIN_TYPE.EASY ? {} : svcInfo;
          res.render('agentsearch/customer.agentsearch.detail.html', {detail, svcInfo: _svcInfo, pageInfo, isExpZone, isHappy});
        }
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          pageInfo: pageInfo,
          svcInfo
        });
      }
    );
  }

  /**
   * @function
   * @desc 해당 지점의 상세 정보를 BFF로 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @param  {string} code - 조회하고자 하는 지점의 code
   * @returns Observable
   */
  private getBranchDetailInfo(res: Response, svcInfo: any, pageInfo: any, code: string): Observable<BranchDetail | undefined> {
    return this.apiService.request(API_CMD.BFF_08_0007, {locCode: code}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyDetailInfo(resp.result);
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });

      return undefined;
    });
  }

  /**
   * @function
   * @desc BFF로부터 조회된 data를 ejs바인딩 위해 정제처리
   * @param  {BranchDetail} detail - BFF로 부터 받은 response
   * @returns BranchDetail - 정제된 data 정보
   */
  private purifyDetailInfo(detail: BranchDetail): BranchDetail {
    const purified: BranchDetail = {...detail};

    const getTextTime = (time, sTime, eTime) => {
      const etcText = '매장에 문의해주세요', closedText = '영업안함';
      let closed = false;
      if (FormatHelper.isEmpty(sTime) || FormatHelper.isEmpty(eTime) ) {
        closed = true;
      } else if (!FormatHelper.isNumber(sTime) || !FormatHelper.isNumber(eTime)) {
        closed = true;
      } else if (sTime.length !== 4 || eTime.length !== 4) {
        closed = true;
      } else if (sTime === '0000' || eTime === '0000') {
        closed = true;
      }

      if (closed) {
        // 일요일은 "영업안함" 다른날은 "매장에 문의해주세요"
        purified[time] = time === 'sunTime' ? closedText : etcText;
        return;
      }
      sTime = FormatHelper.insertColonForTime(sTime);
      eTime = FormatHelper.insertColonForTime(eTime);
      purified[time] = `${sTime}~${eTime}`;
    };
    getTextTime('weekTime', purified.weekdayOpenTime, purified.weekdayCloseTime);
    getTextTime('satTime', purified.satOpenTime, purified.satCloseTime);
    getTextTime('sunTime', purified.holidayOpenTime, purified.holidayCloseTime);

    const star = Math.round(parseFloat(purified.custRateAvg));
    purified.star = 'star' + star;

    if (purified.custRateAvg.length === 1) {
      purified.custRateAvg += '.0';
    }

    // 별점이 0점이거나 평가된 이력이 없으면 별점정보 노출하지 않음
    if (purified.regionInfoList[0].agnYn === 'Y' || purified.star.includes('NaN') || purified.custRateAvg === '0.0') {
      purified.custRateCnt = '0';
    }

    // API 가 스펙대로 동작안하는데 쓰는 쪽에서 예외처리 하라함....... talkMap field 없으면 예외 처리
    /*if (!FormatHelper.isEmpty(purified.talkMap)) {
      purified.talkMapArr = purified.talkMap.split(/#\^|<br.*?>/gi);
    } else {
      purified.talkMapArr = [];
    }*/

    return this.makeData(purified);
  }

  private makeData(detail: BranchDetail): any {
    const regionInfo: RegionInfoList = detail.regionInfoList[0];
    delete detail.regionInfoList;
    const respData = Object.assign(detail, regionInfo);
    const arrService = new Array<Services>();
    const okData = (key: string) => {
      let value = regionInfo[key];
      // 유선/인터넷TV(SK브로드밴드) 의 경우, Y/N으로 주지않고 1/0 으로 줌.
      if (key === 'hanaroCode') {
        value = ('' + value === '1' ? 'Y' : 'N');
      } else if (key === 'prkPsblCnt') { // 주차 가능 prkPsblCnt > 0
        value = (!!value && parseInt(value, 10) > 0) ? 'Y' : 'N';
      }

      if (!value || ('' + value).toUpperCase() !== 'Y') {
        return false;
      }
      return true;
    };

    // OP002-11979 : 매장타입 노출 수 변경. 기존 1개 -> n개. 따라서 shopTypeNm string -> array 로 타입 변경함.
    if (!respData.shopTypeNm) {
      respData.shopTypeNm = new Array<string>();
    }
    // 매장분류
    // "매장특성구분코드", (04:T Premium Store, 06:T Flagship Store)
    switch (regionInfo.shopTpsCd) {
      case '04' :
        respData.shopTypeNm.push('T Premium Store');
        break;
      case '06' :
        respData.shopTypeNm.push('T Flagship Store');
        break;
    }
    if (regionInfo.unmanShop === 'Y') {
      respData.shopTypeNm.push('무인매장');
    }

    if (regionInfo.skMagicRent && regionInfo.skMagicRent === 'Y') {
      respData.shopTypeNm.push(CUSTOMER_AGENT_SEARCH.POSSIBLE_TASK.BODY.skMagicRent);
    }

    // 매장소개. "#^" 문자를 줄내림 문자로 치환.
    if (!!respData.prPhrs) {
      respData.prPhrs = respData.prPhrs.replace(/\#\^/g, '<br>');
    }

    for (const category in CUSTOMER_AGENT_SEARCH) {
      if (!FormatHelper.isEmpty(category)) {
        const {TITLE, BODY} = CUSTOMER_AGENT_SEARCH[category];
        const datas = Object.keys(BODY).reduce((acc: any[], item: string) => {
          if (okData(item)) {
            // tSharpYn(T# 예약가능) 인경우는. [휴대폰일반, 유선/인터넷/TV, ADT캡스보안] 항목을 각각 넣어준다.
            if (item === 'tSharpYn') {
              acc = acc.concat(BODY[item].split(','));
            } else if (item === 'skMagicRent' && regionInfo.skMagicRent && regionInfo.skMagicRent === 'Y') {
              acc.push(BODY[item]);
            } else {
              acc.push(BODY[item]);
            }
          }
          return acc;
        }, []);
        if (datas.length > 0) {
          arrService.push({
            title: TITLE,
            category,
            datas
          });
        }
      }
    }
    respData.services = arrService;
    return respData;
  }

}

export default CustomerAgentsearchDetail;
