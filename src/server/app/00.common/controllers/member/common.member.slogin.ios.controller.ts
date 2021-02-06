/**
 * @file common.member.slogin.ios.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.25
 * @desc 공통 > 로그인/로그아웃 > IOS 간편로그인
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { API_CODE } from '../../../../types/api-command.type';
import { REDIS_KEY } from '../../../../types/redis.type';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import BannerHelper from '../../../../utils/banner.helper';

/**
 * @desc 공통 - IOS 간편로그인 class
 */
class CommonMemberSloginIos extends TwViewController {
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
  getBannerText(): Observable<any> {
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
    return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + "0023").pipe(
        switchMap((resp: any) => {
          if (resp.code === API_CODE.CODE_00) {
            resp.result.bannerType = "0023";
            return resp.result;
          } else {
            return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + "0024");
          }
        }),
        switchMap((next: any) => {
          if (next.code === API_CODE.CODE_00) {
            next.result.bannerType = "0024";
            return next.result;
          } else {
            return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + "0025");
          }
        }),
        switchMap((next: any) => {
          if (next.code === API_CODE.CODE_00) {
            next.result.bannerType = "0025";
            return next.result;
          } else {
            return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + "0026");
          }
        }),
        switchMap((next: any) => {
          if (next.code === API_CODE.CODE_00) {
            next.result.bannerType = "0026";
            return next.result;
          } else {
            return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + "0027");
          }
        }),
        switchMap((next: any) => {
          if (next.code === API_CODE.CODE_00) {
            next.result.bannerType = "0027";
            return next.result;
          } else {
            return of(bannerTextTestJsonData);  
          }
        }),
        catchError((err) => {
          return of(bannerTextTestJsonData);
        })
    );
  }

  /**
   * IOS 간편로그인 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const bannerResult = new BannerHelper().getTextBannerTos(req);
    bannerResult.subscribe((resp) => {
      const target = req.query.target !== 'undefined' ? decodeURIComponent(req.query.target) : '';
      res.render('member/common.member.slogin.ios.html', { svcInfo, pageInfo, target, banner: resp.result });
    });
  }

}



export default CommonMemberSloginIos;
