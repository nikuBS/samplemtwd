/**
 * FileName: myt.join.join-info.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {DATE_FORMAT, CURRENCY_UNIT, MYT_JOIN_TYPE, MYT_JOIN} from '../../../../types/string.old.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';

class MyTJoinJoinInfo extends TwViewController {
  private _svcInfo: any;

  private _urlPath = {
    M : '../../components/join/myt.join.join-info.mobile.html', // 휴대폰, T Login, T Pocket-Fi
    S : '../../components/join/myt.join.join-info.internet.html',
    W : '../../components/join/myt.join.join-info.wibro.html',
    O : ''
  };

  get svcInfo() {
    return this._svcInfo;
  }
  set svcInfo( __svcInfo: any ) {
    this._svcInfo = __svcInfo;
  }

  constructor() {
    super();
  }


  // 마스킹된 날짜 포맷설정
  private getMarskingDateFormat(date, format): any {
    if ( FormatHelper.isEmpty(date) ) {
      return date;
    }
    let _chgDt = date;
    // 마스킹 되어 있을 경우(*을 1로 바꿔서 날짜 포맷팅 후 다시 *로 바꾼다.)
    if ( date.indexOf('*') > -1 ) {
      _chgDt = _chgDt.replace(/\*/g, '1');
      _chgDt = DateHelper.convDateFormat(_chgDt);
      _chgDt = DateHelper.getShortDateWithFormat(_chgDt, format);
      _chgDt = _chgDt.replace(/1/g, '*');
    } else {
      _chgDt = DateHelper.convDateFormat(_chgDt);
      _chgDt = DateHelper.getShortDateWithFormat(_chgDt, format);
    }

    return _chgDt;
  }

  // 모바일 (휴대폰 / T Login / T Pocket-FI) 정보 세팅
  private getMobileResult(data: any): any {

    if ( data.history && data.history.length > 0) {
      const history = data.history;
      const historyData = history.shift();
      data.openingDate = this.getMarskingDateFormat(historyData.chgDt, DATE_FORMAT.YYYYMMDD_TYPE_0);
      data.openingDate = data.openingDate + ' / ' + historyData.chgCd;
    } else {
      data.openingDate = MYT_JOIN.OPENING_DATE_STR;
    }

    data.apprAmt = FormatHelper.addComma(data.apprAmt);

    // 가입비 표시[S]
    if ( data.invBamt > 0 ) {
      const won = CURRENCY_UNIT.WON; // 원
      const pay = MYT_JOIN_TYPE.PAY; // 납부
      const upPayid = MYT_JOIN_TYPE.UNPAID; // 미청구
      data.amtDesc = `(${data.payAmt} ${won} ${pay} / ${data.invBamt} ${won} ${upPayid})`;
    } else {
      data.amtDesc = data.admFeeNm !== '' ? `(${data.admFeeNm})` : '';
    }
    // 가입비 표시[E]

    data.isPwdEditHide = FormatHelper.isEmpty(data.pwdStCd);

    return data;
  }

  // 인터넷/집전화/IPTV
  private getInternetResult(data: any): any {
    const dateFormat = 'YYYY.MM.DD';
    data.joinDate = this.getMarskingDateFormat(data.joinDate, dateFormat);        // 가입일
    data.svcPrdStaDt = this.getMarskingDateFormat(data.svcPrdStaDt, dateFormat);  // 서비스 약정 시작일
    data.svcPrdEndDt = this.getMarskingDateFormat(data.svcPrdEndDt, dateFormat);  // 서비스 약정 종료일
    data.setPrdStaDt = this.getMarskingDateFormat(data.setPrdStaDt, dateFormat);  // 세트 약정 시작일
    data.setPrdEndDt = this.getMarskingDateFormat(data.setPrdEndDt, dateFormat);  // 세트 약정 종료일

    return data;
  }

  // wibro
  private getWibroResult(data: any): any {
    const dateFormat = 'YYYY.MM.DD';
    data.svcScrbDt = this.getMarskingDateFormat(data.svcScrbDt, dateFormat);

    return data;
  }

  // 현재 회선 타입
  private getLinetype(): any {
    switch (this.svcInfo.svcAttrCd) {
      case 'M1':  // 휴대폰
      case 'M3':  // T pocket FI
      case 'M4':  // T Login
        return 'M'; // 모바일

      case 'M5':  // T Wibro
        return 'W'; // T Wibro

      case 'S1' :
      case 'S2' :
      case 'S3' :
        return 'S'; // 인터넷/집전화/IPTV

      case 'O1' :
        return 'O'; // 보안 솔루션

      default :
        return 'X'; // 현재 회선은 권한 없음.
    }
  }

  private getAllJoinInfo(): Observable<any> {
    // 모바일 일때만 가입정보와 개통/변경 이력조회 함
    if ( this.getLinetype() === 'M' ) {
      return this.getJoinInfoAndHistory();
    } else {
      return this.getJoinInfo();
    }
  }

  // 가입정보 + 개통/변경 이력조회
  private getJoinInfoAndHistory(): Observable<any> {
    return Observable.combineLatest(
      this.getJoinInfo(),
      this.getHistory(),
      (joinInfo, history) => {
        joinInfo.result.history = history;
        return joinInfo;
      });
  }

  // 가입정보 조회
  private getJoinInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0068, {}).map((response) => {
      return response;
    });
  }

  // 개통/변경 이력 조회 (무선)
  private getHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0061, {}).map((response) => {
      if ( response.code === API_CODE.CODE_00 ) {
        return this.parseHistory(response.result);
      } else {
        return response;
      }
    });
  }

  private parseHistory(data: any): any {
    if ( FormatHelper.isArray(data) && data.length > 0 ) {
      data.map( (o) => {
        o.chgDt = this.getMarskingDateFormat(o.chgDt, 'YYYY.MM.DD');
      });
    }

    return data;
  }

  private getJoinInfoData(data: any): any {
    switch (this.getLinetype()) {
      case 'M':  data = this.getMobileResult(data);
        break;
      case 'W':  data = this.getWibroResult(data);
        break;
      case 'S':  data = this.getInternetResult(data);
        break;
      case 'O':
        // 보안 솔루션은 7차 스프린트에서..
        this.logger.info(this, 'O1 is 7 sprint...');
        return data;
    }
    return data;
  }

  private getData(svcInfo: any, data: any): any {

    const lineType = this.getLinetype();
    let isContract = true;
    // 모바일 일때..
    if ( lineType === 'M' && data.isRsvYn === 'Y') {
      isContract = false;
    } else if ( lineType === 'S' || lineType === 'O' ) {
      isContract = false;
    }
    // 약정 할인 및 단말.. 버튼 노출 여부
    data.isContract = isContract;

    // 회선별 페이지 PATH
    data.path = this._urlPath[this.getLinetype()];
    data.lineType = lineType;


    return {
      svcInfo,
      data : data
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.svcInfo = svcInfo;

    Observable.combineLatest(
      this.getAllJoinInfo()
    ).subscribe(([joinInfo]) => {
      if ( joinInfo.code === API_CODE.CODE_00) {
        const data = this.getData(svcInfo, this.getJoinInfoData(joinInfo.result));
        res.render('join/myt.join.join-info.html', data);
      } else {
        res.render('error.server-error.html', {
          title: 'error',
          code: joinInfo.code,
          msg: joinInfo.msg,
          svcInfo: svcInfo
        });
      }

    });
  }
}

export default MyTJoinJoinInfo;
