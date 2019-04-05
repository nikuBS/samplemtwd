/**
 * @file myt-fare.bill.set.controller.ts
 * 화면 ID : MF_04
 * 설명 : 나의요금 > 요금안내서 설정
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018.09.12
 */
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import MyTFareBillSetCommon from './myt-fare.bill.set.common.controller';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_JOIN_WIRE_SVCATTRCD} from '../../../../types/string.type';

class MyTFareBillSet extends MyTFareBillSetCommon {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.svcInfo = svcInfo;
    Observable.combineLatest(
      this.reqBillType()
      // this.apiService.request(API_CMD.BFF_05_0049, {})  // 통합청구등록회선 리스트 조회 , 13차수는 보류
    ).subscribe(([resBillType]) => {
      const apiError = this.error.apiError([resBillType]);
      if ( !FormatHelper.isEmpty(apiError) ) {
        this.fail(res, apiError, svcInfo, pageInfo);
        return;
      }

      const data = this.getData(resBillType.result, {}, svcInfo, pageInfo);
      res.render('bill/myt-fare.bill.set.html', data);

    });
  }

  /**
   * page 에 전달할 object 만들기
   * @param data
   * @param integrate
   * @param svcInfo
   * @param pageInfo
   */
  private getData(data: any, integrate: any, svcInfo: any, pageInfo: any): any {
    this.makeBillInfo(data);
    this.makeAnotherBillList(data);
    this.parseData(data);
    this.makeOptions(data);
    this.makeHpNum(data);
    this.parseIntegration(data, integrate);

    return {
      svcInfo,
      pageInfo,
      data
    };
  }

  /**
   * 통합청구 회선 데이터 파싱
   * @param data
   * @param integrate
   */
  private parseIntegration(data: any, integrate: any): void {
    if (FormatHelper.isEmpty(integrate.result)) {
      data.integrateList = [];
      return;
    }
    // 정렬
    const sort = {};
    sort[MYT_JOIN_WIRE_SVCATTRCD.M1] = 1; // 휴대폰
    sort[MYT_JOIN_WIRE_SVCATTRCD.M3] = 2; // T pocket Fi
    sort[MYT_JOIN_WIRE_SVCATTRCD.M4] = 3; // T Login
    sort[MYT_JOIN_WIRE_SVCATTRCD.S1] = 4; // 인터넷
    sort[MYT_JOIN_WIRE_SVCATTRCD.S3] = 5; // 집전화
    sort[MYT_JOIN_WIRE_SVCATTRCD.S2] = 6; // IPTV

    const list = integrate.result.map(o => {
      o.idx = sort[o.svcType];
      // 전화번호 포맷팅
      o.svcNum = FormatHelper.conTelFormatWithDash(o.svcNum);
      // 유형이 "인터넷" 인 경우만 주소 정보를 보여준다.(나머지는 전화번호 노출)
      o.value = MYT_JOIN_WIRE_SVCATTRCD.S1 === o.svcType ? o.dtlAddr : o.svcNum;
      return o;
    });

    data.integrateList = FormatHelper.sortObjArrAsc(list, 'idx');
  }

  /**
   * 우편, 전자추가발송, 유선 (문자)일 때, 핸드폰 번호 보임
   * @param data
   */
  private makeHpNum(data: any): void {
    const lineType = this.getLinetype();
    // 우편, 전자추가발송 일때
    if (['1', 'ADD'].indexOf(data.billInfo[0].cd) !== -1) {
      data.hpNum = data.cntcNum1 || ' ';
    } else if ('S' === lineType && 'B' === data.billInfo[0].cd) {
      data.hpNum = data.wsmsBillSndNum || ' ';
    }
  }

  /**
   * "설정한 옵션" 생성
   * @param data
   */
  private makeOptions(data: any): void {
    const billType = data.billInfo[0].cd;
    const mergeType = billType + (data.billInfo.length > 1 ? data.billInfo[1].cd : 'X');
    const lineType = this.getLinetype();

    const options = new Array();
    data.options = options;
    // 전자추가발송, 모바일 퀵 은 옵션 비노출
    if (['D', 'E', 'ADD'].indexOf(billType) > -1) {
      return;
    }

    /**
       '1':'Bill Letter 보안강화',
       '2':'휴대폰번호 전체 표시',
       '3':'콘텐츠 이용 상세내역 표시',
       '4':'법정대리인 함께 수령',
       '5':'문자 수신'
     */
    // Bill Letter  보안강화 (안내서 유형이 Bill Letter 포함일때)
    if ('H' === billType && data.scurBillYn === 'Y') {
      options.push('1');
    }
    // 휴대폰 번호 전체 표시 여부
    if (['H2', 'BX', 'B2', '2X', '1X'].indexOf(mergeType) !== -1 && data.phonNumPrtClCd === 'Y') {
      if (mergeType === 'BX') {
        if (lineType === 'S') {
          options.push('2');
        }
      } else {
        options.push('2');
      }
    }

    // 회선이 무선 일때
    if (lineType === 'M') {
      // "문자 수신" 여부
      if (billType === 'P' && data.isusimchk === 'Y' && data.nreqGuidSmsSndYn === 'Y') {
        options.push('5');
      }
      // 콘텐츠 이용 상세내역 표시
      if (mergeType.indexOf('2') !== -1 && (data.scurMailYn + data.infoInvDtlDispChkYn + data.infoInvDtlDispYn) === 'YYY') {
        options.push('3');
      }

      // 법정 대리인 함께 수령
      if (['HX', 'H2', 'BX', 'B2'].indexOf(mergeType) > -1 && data.kidsYn === 'Y') {
        options.push('4');
      }
    }
  }

  /**
   * 하단 > "다른 요금안내서로 받기" 리스트
   * @param data
   */
  private makeAnotherBillList(data: any): void {
    const billList = new Array();

    'P,H,B,2,1'.split(',').forEach((cd) => {
      // 현재 안내서는 빼기
      if (cd !== data.billInfo[0].cd) {
        if (this.getLinetype() === 'W' && ['H', 'B'].some(e => e === cd)) {
          return true;
        }

        this.pushBillInfo(billList, cd);
      }
    });

    data.billList = billList;
  }
}

export default MyTFareBillSet;
