/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청내역 > 장애/AS 신청현황 > 상세화면 (MS_04_01_03_01)
 * @file myt-join.wire.as.detail.controller.ts
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 장애/AS 신청내역 상세 조회
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { MYT_JOIN_WIRE } from '../../../../types/string.type';
import StringHelper from '../../../../utils/string.helper';


class MyTJoinWireASDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.AS_DETAIL.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }

    const troubleNum = req.query.troubleNum;
    const troubleDt = req.query.troubleDt;
    const svcNm = req.query.svcNm;
    const stNm = req.query.stNm;
    const troubleDetail = req.query.troubleDetail;

    if ( !troubleNum ) {
      this.error.render(res, {
        title: MYT_JOIN_WIRE.AS_DETAIL.TITLE,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
      return;
    }

    this.apiService.request(API_CMD.BFF_05_0157, { troubleNum : troubleNum })
      .subscribe((resp) => {
        /*const resp = {
          'code': '00',
          'msg': 'success',
          'result': {
            'custNm': '고객명',
            'cntcNum': '01011112222',
            'addrNm': '설치주소',
            'mvotOperCoId': '출동작업업체ID',
            'mvotOperCoNm': '출동작업업체명',
            'coPhonNum': '03151514848',
            'mvotCoFnshOpertrId': '행복기사사번',
            'mvotCoFnshOpertrNm': '행복기사명',
            'opertrPhonNum': '행복기사전화번호',
            'operSchdDtm': '201810200506'
          }
        };*/

        if ( resp.code === API_CODE.CODE_00 ) {
          const data = resp.result;
          data['troubleNum'] = troubleNum;
          data['troubleDt'] = DateHelper.getShortDate(troubleDt);
          data['svcNm'] = svcNm;
          data['stNm'] = stNm;
          data['troubleDetail'] = troubleDetail;
          data['operSchdDtm'] = DateHelper.getFullDateAndTime(data['operSchdDtm']);
          data['cntcNum'] = StringHelper.phoneStringToDash(data['cntcNum']);

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: data};

          res.render('wire/myt-join.wire.as.detail.html', option);
        } else {
          return this.error.render(res, {
            title: MYT_JOIN_WIRE.AS_DETAIL.TITLE,
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: MYT_JOIN_WIRE.AS_DETAIL.TITLE,
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      });
  }
}

export default MyTJoinWireASDetail;

