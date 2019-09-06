/**
 * @file main.recommend.product.controller.ts
 * @author 한지훈 (yphannavy80@partner.sk.com)
 * @since 2019.08.27
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../../types/api-command.type';
import { MLS_ERROR, EXPERIMENT_EXPS_SCRN_ID, MLS_PRCPLN_RC_TYP, MLS_DETAIL_MAPPING, MLS_PRODUCT_BENEFIT, MLS_CATEGORY_MAPPING } from '../../../../types/bff.type';
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
        if ( resp.code === API_CODE.CODE_00 ) {
          console.log('\n\n[추천 요금제 호출]\n\n', JSON.stringify(resp));

          // MLS Key 생성
          const items = resp.result.items;

          if (!FormatHelper.isEmpty(items)) {
            const item = resp.result.items[0];
            const list = item.props;
            let keys: any = [];
            const reasonCode: any = {};
            const categoryValidation: any = {};
            recommendProduct['prodId'] = item.prodId;
            recommendProduct['prodNm'] = item.prodNm;
            recommendProduct['benefit'] = MLS_PRODUCT_BENEFIT[item.prodId];

            list.map((target) => {
              // # 뿐 아니라 SB 상 정의되지 않은 reasonCode 넘어올 경우에도 Skip
              if ( (target.reasonCode !== '#') && !FormatHelper.isEmpty(MLS_DETAIL_MAPPING[target.reasonCode]) ) {
                // 해당 Category 영역 표시여부
                categoryValidation[MLS_CATEGORY_MAPPING[target.reasonCode]] = true;
                // 해당 Card 표시여부
                reasonCode[target.reasonCode] = true;
                keys = keys.concat(Object.keys(MLS_DETAIL_MAPPING[target.reasonCode]));
              }
            });
            
            // 테스트용 코드 (전체카드 노출)
            categoryValidation['data'] = true;
            categoryValidation['video'] = true;
            categoryValidation['music'] = true;
            categoryValidation['insurance'] = true;
            categoryValidation['membership'] = true;
            Object.keys(MLS_CATEGORY_MAPPING).map((keys) => {
              reasonCode[keys] = true;
            })
            // 테스트용 코드 (전체카드 노출)

            console.log('\n\n', keys, '\n\n');
            recommendProduct['category_validation'] = categoryValidation;
            recommendProduct['reason_codes'] = reasonCode;
            // recommendProduct['reason_codes'] = reasonCode.join(',');
  
            // MLS 추천 없음
            if (keys.length === 0) {
              return Observable.of({code: API_CODE.CODE_00, resut: {}});
            } else {
              console.log('************ 근거 조회 호출 *****************');
              console.log({keys});
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
        // TODO: 응답코드가 2001로 오고있음 ㅠ 일단 테스트용 데이터 수동으로 넣어서 작업
        resp = {
          "code": "00",
          "status": "success",
          "results": {
            'data_use_ratio_bf_m0': '0.83',
            'data_use_ratio_bf_m1': '0.95',
            'data_use_ratio_bf_m2': '0.69',
            'bf_m0_ym': '201907',

            'data_use_night_ratio': '0.34',
            'data_use_night_ratio_median': '0.11',

            'app_use_traffic_music_ratio': '0.34',
            'app_use_traffic_music_ratio_median': '0.21',

            'additional_svc_ansim_option_scrb_type': 'paid',
            'additional_svc_flo_scrb_type': 'paid',
            'additional_svc_melon_scrb_type': 'paid',
            'additional_svc_bugs_scrb_type': 'paid',
            'app_use_traffic_video_ratio': '0.92',
            'app_use_traffic_video_ratio_median': '0.21',
            'app_use_traffic_video_ratio_median_yn': 'Y'
          }
        };
        console.log('\n\n[추천 근거 호출]\n\n', resp);
        if ( resp.code === API_CODE.CODE_00 ) {
          
          // 받아온 값들의 유형 별로 Format 수정(단위 등)
          if ( !FormatHelper.isEmpty(resp.results.bf_m0_ym) ) {
            resp.results['date_use_ratio_m0'] = DateHelper.getCurrentMonth(resp.results.bf_m0_ym);
            resp.results['date_use_ratio_m1'] = (resp.results['date_use_ratio_m0'] === 1 ? 12 : resp.results['date_use_ratio_m0'] - 1);
            resp.results['date_use_ratio_m2'] = (resp.results['date_use_ratio_m1'] === 1 ? 12 : resp.results['date_use_ratio_m1'] - 1);
          }
          // addDots(formattedResult)...



          // 가져온 user profile key의 값을 추천 결과에 넣는다.
          return Observable.of(Object.assign(recommendProduct, {reason_details: resp.results}));
        } else {
          throw Error(MLS_ERROR.MLS0001);
            // 오류 화면으로 render
        }
      }).subscribe((resp) => {
        console.log('[렌더링 파라미터]\n', resp);
        res.render('recommend/main.recommend.product.html', { svcInfo, pageInfo, resp });
      }, (err) => {
        throw err;
        // 오류 화면으로 render
      });
    }
  }


}
