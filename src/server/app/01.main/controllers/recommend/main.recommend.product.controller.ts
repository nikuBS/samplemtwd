/**
 * @file main.recommend.product.controller.ts
 * @author 한지훈 (yphannavy80@partner.sk.com)
 * @since 2019.08.27
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../../types/api-command.type';
import { MLS_ERROR, EXPERIMENT_EXPS_SCRN_ID, MLS_PRCPLN_RC_TYP } from '../../../../types/bff.type';
import { MLS_DETAIL_MAPPING, MLS_PRODUCT_BENEFIT } from '../../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import TwViewController from '../../../../common/controllers/tw.view.controller';

export default class MainRecommendProduct extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    const recommendProduct = {};
    let keys: any = [];

    // App인 경우만..
    if (BrowserHelper.isApp(req)) {
      this.apiService.request(API_CMD.BFF_10_0178, {
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
            const reasonCode: any = {};
            const categoryValidation: any = {};
            const benefit: any = {};
            let profileKeys: any = {};

            recommendProduct['prodId'] = item.prodId;
            recommendProduct['prodNm'] = item.prodNm;

            // 해택 출력 포맷 변경
            Object.keys(MLS_PRODUCT_BENEFIT[item.prodId]).map((key) => {

              let value = MLS_PRODUCT_BENEFIT[item.prodId][key];

              if ( FormatHelper.isNumber(value)) {
                value = FormatHelper.addComma(String(value));
              }
              benefit[key] = value;
            });

            // 자세히 보기의 헤택별 출력 여부
            recommendProduct['benefit'] = Object.assign(benefit, {
              hasData: benefit.data === '0' ? false : true,
              hasMemberShip: benefit.membership === '0' ? false : true,
              hasFlo: benefit.flo === '0' ? false : true,
              hasPooq: benefit.pooq === '0' ? false : true,
              hasInsurance: benefit.insurance === '0' ? false : true,
              hasSafe: benefit.safe === '0' ? false : true
            });

            // 추천에 대한 세부 근거(profile)를 호출을 위한 데이터 생성
            list.map((target) => {
              // # 뿐 아니라 SB 상 정의되지 않은 reasonCode 넘어올 경우에도 Skip
              if ( (target.reasonCode !== '#') && !FormatHelper.isEmpty(MLS_DETAIL_MAPPING[target.reasonCode]) ) {
                // 해당 Category 영역 표시여부
                categoryValidation[MLS_DETAIL_MAPPING[target.reasonCode]['type']] = true;
                // 해당 Card 표시여부
                reasonCode[target.reasonCode] = true;

                // 상위 type을 각각의 profile_key에 저장한다.
                const parentType = MLS_DETAIL_MAPPING[target.reasonCode]['type'];
                
                Object.keys(MLS_DETAIL_MAPPING[target.reasonCode]['profile_key']).map((key) => {
                  Object.assign(MLS_DETAIL_MAPPING[target.reasonCode]['profile_key'][key], {'parentType': parentType});
                });

                profileKeys = Object.assign(profileKeys, MLS_DETAIL_MAPPING[target.reasonCode]['profile_key']);
                keys = keys.concat(Object.keys(MLS_DETAIL_MAPPING[target.reasonCode]['profile_key']));
              }
            });

            recommendProduct['category_validation'] = categoryValidation;
            recommendProduct['reason_codes'] = reasonCode;
            recommendProduct['profile_keys'] = profileKeys;
            recommendProduct['keys'] = keys;
  
            // MLS 추천 없음
            if (keys.length === 0) {
              throw MLS_ERROR.MLS0001;
            } else {
              // console.log('************ 근거 조회 호출 *****************');
              // console.log({keys});
              return this.apiService.request(API_CMD.BFF_05_0212, {keys});
            }
          } else {
            throw MLS_ERROR.MLS0001;
          }
        } else {
          throw resp;
        }
      }).switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {

          const membershipDatas: any = [];
          const results = resp.result.results;

          // 호출한 key중 require가 true인 것의 수신 데이터가 없으면, 상위 영역은 disable 처리한다.
          recommendProduct['keys'].map((key) => {
            const parentType = recommendProduct['profile_keys'][key]['parentType'];
            const required = recommendProduct['profile_keys'][key]['required'];
            if ( required && !results.hasOwnProperty(key) && recommendProduct['category_validation'][parentType] !== false) {
              recommendProduct['category_validation'][parentType] = false;
            }
          });

          // 데이터 가공
          Object.keys(results).map((target) => {

            const type = recommendProduct['profile_keys'][target].type;
            let value = results[target];

            // 멤버십 데이터 추출
            if ( MLS_DETAIL_MAPPING.prcpln_14.profile_key.hasOwnProperty(target)) {
              membershipDatas.push({
                key: target,
                title: recommendProduct['profile_keys'][target].title,
                amt: Number(value)
              });
            }

            // 유형 별로 Format 수정
            if ( !FormatHelper.isEmpty(type) && !FormatHelper.isEmpty(value)) {

              value = Number(value);

              // 비율일 경우는 소수 셋째자리 반올림
              if ( type === 'ratio') {
                results[target] = value.toFixed(2);

              // 금액은 1000단위 구분자 추가(단, 멤베십은 아래 로직에서 처리)
              } else if ( MLS_DETAIL_MAPPING.prcpln_14.profile_key.hasOwnProperty(target) === false && type === 'amt') {
                value = FormatHelper.isNumber(value) ? value : 0;
                value = FormatHelper.isEmpty(value) ? 0 : value;
                results[target] = FormatHelper.addComma(String(value));
              }
            }
          });

          // 최소 4개의 데이터가 없으면 멤버십카드를 출력하지 않는다.(Total 데이터 수신 여부는 상위 공통 로직에서 체크)
          if ( membershipDatas.length > 4) {
            FormatHelper.sortObjArrDesc(membershipDatas, 'amt');
            const tempArr = membershipDatas.slice(0, 4);

            // 기타 append
            tempArr.push({
              key: 'mbr_discount_amt_cum_etc',
              title: '기타',
              amt: Number(tempArr[0].amt) - Number(tempArr[1].amt) - Number(tempArr[2].amt) - Number(tempArr[3].amt)
            });

            const totalAmt = Number(tempArr[0].amt);

            if ( totalAmt !== 0) {
              tempArr.map((obj) => {
                const amt = obj['amt'];
                obj['percent'] = (Number(amt) / totalAmt).toFixed(2);
                obj['amt'] = FormatHelper.addComma(String(amt));
              });
            }
            
            results['membership'] = {
              total: tempArr[0],
              first: tempArr[1],
              second: tempArr[2],
              third: tempArr[3],
              etc: tempArr[4]
            };
          } else {
            recommendProduct['category_validation']['membership'] = false;
          }

          // 전월계산
          if ( !FormatHelper.isEmpty(results.bf_m0_ym) ) {
            results['date_use_ratio_m0'] = DateHelper.getCurrentMonth(results.bf_m0_ym);
            results['date_use_ratio_m1'] = (results['date_use_ratio_m0'] === 1 ? 12 : results['date_use_ratio_m0'] - 1);
            results['date_use_ratio_m2'] = (results['date_use_ratio_m1'] === 1 ? 12 : results['date_use_ratio_m1'] - 1);
          }

          // 가져온 user profile key의 값을 추천 결과에 넣는다.
          return Observable.of(Object.assign(recommendProduct, {reason_details: results}));
        } else {
          throw MLS_ERROR.MLS0001;
        }
      }).subscribe((resp) => {
        this.logger.debug(this, '[내게 맞는 추천 요금제]\n', JSON.stringify(resp));
        res.render('recommend/main.recommend.product.html', { svcInfo, pageInfo, resp });
      }, (err) => {
        this.error.render(res, {
          svcInfo: svcInfo,
          code: err.code,
          msg: err.msg
        });
      });
    }
  }


}
