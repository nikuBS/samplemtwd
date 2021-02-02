/**
 * @file common.member.slogin.aos.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.25
 * @desc 공통 > 로그인/로그아웃 > AOS 간편로그인
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { REDIS_KEY, REDIS_TOS_KEY } from '../../../../types/redis.type';
import { catchError, switchMap } from 'rxjs/operators';
import { API_CODE } from '../../../../types/api-command.type';
import { of } from 'rxjs/observable/of';
import LoginService from '../../../../services/login.service';
import { NODE_API_ERROR } from '../../../../types/string.type';
import { Observable } from 'rxjs';
import DateHelper from '../../../../utils/date.helper';
import BannerHelper from '../../../../utils/banner.helper';


/**
 * @desc AOS 간편로그인 class
 */
class CommonMemberSloginAos extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Toss 텍스트 배너 
   * @param req 
   * @param res 
   * @param next 
   * @param svcInfo 
   * @param allSvc 
   * @param childInfo 
   * @param pageInfo 
   */
  getBannerText(): any {
    // 1. redis read 
    const bannerTextTestJsonData = 
    {
      summary: {
        "imgList": null,
        "tosBatCmpgnSerNum": "C162",
        "cmpgnStaDt": "20210115",
        "cmpgnEndDt": "20210122",
        "cmpgnStaHm": "0000",
        "cmpgnEndHm": "2359",
        "tosCmpgnNum": "20210114CMP004",
        "tosExecSchNum": "210114CMP004421",
        "tosCellNum": "C21AMO024400",
        "tosMsgSerNum": "20210114"
      },
      imgList: [
        {
          "tosBnnrId": "M21ALN464771",
          "bnnrExpsSeq": "",
          "bnnrFileNm": "TEXT BNNER",
          "imgLinkUrl": "https://www.tauth.net/pass/event/eapp",
          "tosImgLinkClCd": "01",
          "tosImgLinkTrgtClCd": "2",
          "imgAltCtt": "[TEST] 이번 연말정산은 PASS인증서로 간편하게 인증하세요.",
          "imgSizeInfo": "NoN",
          "bnnrImgBgcolorCd": ""
        }
      ],
      bannerType: "TEST"
    }
    return bannerTextTestJsonData;
  }

  /**
   * AOS 간편로그인 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res:
    Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const mdnQuery = req.query.mdn;
    const target = req.query.target !== 'undefined' ? decodeURIComponent(req.query.target) : '';
    const bannerResult = new BannerHelper().getTextBannerTos(req);
    bannerResult.subscribe(resp => {
      console.log('resp => ', resp);
      if ( FormatHelper.isEmpty(mdnQuery) ) {
        res.render('member/common.member.slogin.aos.html', { svcInfo, pageInfo, mdn: null, target, banner: resp.result });
        // res.redirect('/common/member/slogin/fail');
      } else {
        const mdn = {
          original: mdnQuery,
          show: FormatHelper.conTelFormatWithDash(mdnQuery)
        };
        res.render('member/common.member.slogin.aos.html', { svcInfo, pageInfo, mdn, target, banner: resp.result });
      }
    })
  }
}

export default CommonMemberSloginAos;
