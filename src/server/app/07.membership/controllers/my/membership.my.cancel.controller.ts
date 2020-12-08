/**
 * @file membership.my.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.12.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { MEMBERSHIP_GROUP, MEMBERSHIP_TYPE } from '../../../../types/bff.type';
import { REDIS_KEY } from '../../../../types/redis.type';

export default class MembershipMyCancel extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    // 웹접근성 대응 : pageInfo의 seoMetaTagTitNm 값이 없어서 redis의 url 메타정보 값을 받아와서 대입, 
    // ejs의 start.component.html에서 사용 (locals.pageInfo.seoMetaTagTitNm)
    this.redisService.getData(REDIS_KEY.URL_META + req.originalUrl).subscribe((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }
      // const urlMeta = new UrlMetaModel(resp.result || {});
      // console.log(">>>[TEST] ", urlMeta);
      // console.log(">>>[TEST] ", urlMeta.seoMetaTagTitNm);
      pageInfo.seoMetaTagTitNm = resp.result.seoMetaTagTitNm;
    });

    this.apiService.request(API_CMD.BFF_11_0013, {}).subscribe((resp) => {
      let myCardData = {};
      if ( resp.code === API_CODE.CODE_00 ) {
        myCardData = this.parseMyCardData(resp.result);
      } else {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }

      res.render('my/membership.my.cancel.html', {
        myCardData: myCardData,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    });
  }

  private parseMyCardData(myCardData): any {
    myCardData.showMbrCardNum = FormatHelper.addCardDash(myCardData.mbrCardNum.toString());
    myCardData.mbrGrStr = MEMBERSHIP_GROUP[myCardData.mbrGrCd];
    myCardData.mbrTypStr = MEMBERSHIP_TYPE[myCardData.mbrTypCd];

    return myCardData;
  }
}
