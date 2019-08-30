/**
 * @file main.recommend.product.controller.ts
 * @author 한지훈 (yphannavy80@partner.sk.com)
 * @since 2019.08.27
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../../types/api-command.type';
import { MLS_ERROR, EXPERIMENT_EXPS_SCRN_ID, MLS_PRCPLN_RC_TYP, MLS_DETAIL_MAPPING, MLS_PRODUCT_BENEFIT } from '../../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import TwViewController from '../../../../common/controllers/tw.view.controller';

export default class MainRecommendProduct extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    const recommendProduct = {};

    // 로그인 되어 있고, App인 경우만..
    if (!FormatHelper.isEmpty(svcInfo) && BrowserHelper.isApp(req)) {
      this.apiService.requestStore(SESSION_CMD.BFF_10_0178, {
        experimentExpsScrnId: EXPERIMENT_EXPS_SCRN_ID.RECOMMEND_PRODS, 
        prcplnRcTyp: MLS_PRCPLN_RC_TYP, 
        prcplnChlTyp: BrowserHelper.isApp(req) ? 'MOBILE' : 'WEB'
      })
      .switchMap((resp) => {
        // for test
        resp = {
            "code":"00",
            "msg":"success",
            "result":{
              "items":[
                {
                  "prodId":"NA00006537",
                  "prodType":"fee",
                  "prodNm":"에센스",
                  "props":[
                    {
                      "reasonPreText":"데이터 걱정 없는",
                      "reasonCode":"prcpln_01",
                      "reasonPostText":"어떠세요?",
                      "reasonTyp":"data"
                    },
                    {
                      "reasonPreText":"데이터 걱정 없는",
                      "reasonCode":"prcpln_05",
                      "reasonPostText":"어떠세요?",
                      "reasonTyp":"data"
                    },
                    {
                      "reasonPreText":"#",
                      "reasonCode":"prcpln_08",
                      "reasonPostText":"#",
                      "reasonTyp":"insurance"
                    },
                    {
                      "reasonPreText":"#",
                      "reasonCode":"prcpln_10",
                      "reasonPostText":"#",
                      "reasonTyp":"membership"
                    },
                    {
                      "reasonPreText":"#",
                      "reasonCode":"prcpln_14",
                      "reasonPostText":"#",
                      "reasonTyp":"music"
                    }
                  ]
                }
              ],
              "timestamp":"1559114332.78"
            }
          };
        if ( resp.code === API_CODE.CODE_00 ) {

          // MLS Key 생성
          const items = resp.result.items;

          if (!FormatHelper.isEmpty(items)) {
            const item = resp.result.items[0];
            const list = item.props;
            const keys: any = [];
            const reasonCode: any = [];
            recommendProduct['prodId'] = item.prodId;
            recommendProduct['prodNm'] = item.prodNm;
            recommendProduct['benefit'] = MLS_PRODUCT_BENEFIT[item.prodId];

            list.map((target) => {
              if (target.reasonCode !== '#') {
                reasonCode.push(target.reasonCode);
                keys.concat(Object.keys(MLS_DETAIL_MAPPING[target.reasonCode]));
              }
            });

            recommendProduct['reason_codes'] = reasonCode.join(',');
  
            // MLS 추천 없음
            if (keys.length === 0) {
              return Observable.of({code: API_CODE.CODE_00, resut: {}});
            } else {
              return this.apiService.request(API_CMD.BFF_05_0212, {keys});
            }
          } else {
            throw Error(MLS_ERROR.MLS0001);
            // 오류 화면으로 render
          }
        } else {
          throw resp;
        }
      }).switchMap((resp) => {

        // for test
        resp = {
          "code": "00",
          "status": "OK",
          "results": {
            "data_use_ratio_max": "0.970192",
            "data_use_ratio_bf_m1": "0.97123",
            "data_use_ratio_bf_m2": "0.89213",
            "data_use_ratio_bf_m3": "0.82517",
            "all_night_traffic_mb": "0.31234",
            "night_traffic_mb": "0.78982",
            "all_video_use_traffic_ratio": "0.12343",
            "video_use_traffic_ratio": "0.18373",
            "all_music_use_traffic_ratio": "0.23457",
            "music_use_traffic_ratio": "0.18284",
            "mbr_use_discount_amt": "14500",
            "mbr_discount_amt_theme_park": "8000",
            "mbr_discount_amt_convenience_store": "3000",
            "mbr_discount_amt_pizza": "1500",
            "mbr_discount_amt_family_restaurant": "1500",
            "mbr_discount_amt_coffee": "500",
            "mbr_discount_amt_movie": "0",
            "mbr_discount_amt_shopping": "0",
            "mbr_discount_amt_beauty_and_fashion": "0",
            "mbr_discount_amt_mobile_and_media": "0",
            "mbr_discount_amt_transportation": "0",
            "mbr_discount_amt_education": "0",
            "mbr_discount_amt_food_and_beverage": "0",
            "mbr_discount_amt_jeju": "0",
            "mbr_discount_amt_sports": "0",
            "mbr_discount_amt_bakery": "0",
            "mbr_discount_amt_chocolate": "0"
          }
        };

        if ( resp.code === API_CODE.CODE_00 ) {
          // 가져온 user profile key의 값을 추천 결과에 넣는다.
          return Observable.of(Object.assign(recommendProduct, resp.results));
        } else {
          throw Error(MLS_ERROR.MLS0001);
            // 오류 화면으로 render
        }
      }).subscribe((resp) => {
        console.log(resp);
        res.render('recommend/main.recommend.product.html', { svcInfo, pageInfo, resp });
      }, (err) => {
        throw err;
        // 오류 화면으로 render
      });
    }
  }


}
