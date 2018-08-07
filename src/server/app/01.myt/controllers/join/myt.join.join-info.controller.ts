/**
 * FileName: myt.join.join-info.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {DATE_FORMAT, CURRENCY_UNIT, MYT_JOIN_TYPE} from '../../../../types/string.type';
import {Info, History} from '../../../..//mock/server/join.info.mock';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';

class MytJoinJoinInfoController extends TwViewController {
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

    if ( data.history !== null && data.history.length > 0) {
      const history = data.history;
      const historyData = history[0];
      Object.assign(data, {
        chgDt : this.getMarskingDateFormat(historyData.chgDt, DATE_FORMAT.YYYYMMDD_TYPE_0),
        chgCd : historyData.chgCd
      });
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
    Object.assign(data, {
      joinDate : DateHelper.getShortDateWithFormat(data.joinDate, 'YYYY.MM.DD'),        // 가입일
      svcPrdStaDt : DateHelper.getShortDateWithFormat(data.svcPrdStaDt, 'YYYY.MM.DD'),  // 서비스 약정 시작일
      svcPrdEndDt : DateHelper.getShortDateWithFormat(data.svcPrdEndDt, 'YYYY.MM.DD'),  // 서비스 약정 종료일
      setPrdStaDt : DateHelper.getShortDateWithFormat(data.setPrdStaDt, 'YYYY.MM.DD'),  // 세트 약정 시작일
      setPrdEndDt : DateHelper.getShortDateWithFormat(data.setPrdEndDt, 'YYYY.MM.DD')  // 세트 약정 종료일
    });

    return data;
  }

  // wibro
  private getWibroResult(data: any): any {
    Object.assign(data, {
      svcScrbDt : DateHelper.getShortDateWithFormat(data.svcScrbDt, DATE_FORMAT.YYYYMMDD_TYPE_0)
    });

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
        if ( joinInfo !== null && history !== null ) {
          joinInfo.history = history;
          return joinInfo;
        } else {
          return null;
        }
      });
  }

  // 가입정보 조회
  private getJoinInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0068, {}).map((response) => {
      return this.getResult(response);
    });
  }

  // 개통/변경 이력 조회
  private getHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0061, {}).map((response) => {
      return this.parseHistory(this.getResult(response));
    });
  }

  private parseHistory(data: any): any {
    if ( data !== null && data.length > 0 ) {
      data.map( (o) => {
        o.chgDt = this.getMarskingDateFormat(o.chgDt, 'YYYY.MM.DD');
      });
    }

    return data;
  }

  private getResult(data: any): any {
    if (data.code === API_CODE.CODE_00) {
      return data.result;
    } else {
      return null;
    }
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
        return null;
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

    // const data = this.getWibroResult( Info.wibro.result );
    // const data = this.getMobileResult( Info.mobile.result );
    // const data = this.getInternetResult( Info.internet.result );
    Observable.combineLatest(
      this.getAllJoinInfo()
    ).subscribe(([joinInfo]) => {
      const data = this.getData(svcInfo, this.getJoinInfoData(joinInfo));
      this.logger.info(this, '#### data ', data);

      res.render('join/myt.join.join-info.html', data);
    });
  }
}

export default MytJoinJoinInfoController;
