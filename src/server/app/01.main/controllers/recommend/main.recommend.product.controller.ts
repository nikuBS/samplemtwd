/**
 * @file main.recommend.product.controller.ts
 * @author 한지훈 (yphannavy80@partner.sk.com)
 * @since 2019.08.27
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../../types/api-command.type';
import { MLS_ERROR, EXPERIMENT_EXPS_SCRN_ID, MLS_PRCPLN_RC_TYP } from '../../../../types/bff.type';
import { MLS_DETAIL_MAPPING, MLS_USER_PROFILE_KEYS, MLS_PRODUCT_BENEFIT } from '../../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import TwViewController from '../../../../common/controllers/tw.view.controller';

export default class MainRecommendProduct extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    const recommendProduct = {};

    // App인 경우만..
    // if (BrowserHelper.isApp(req)) {
      const channelIds = [EXPERIMENT_EXPS_SCRN_ID.RECOMMEND_PRODS];
      this.apiService.request(API_CMD.BFF_10_0187, {channelIds: channelIds})
      .switchMap((resp) => {

        if ( resp.code === API_CODE.CODE_00 ) {

          // MLS Key 생성
          const items = resp.result.results[EXPERIMENT_EXPS_SCRN_ID.RECOMMEND_PRODS].items;

          if (!FormatHelper.isEmpty(items)) {
            const item = items[0];
            const benefit: any = {};

            recommendProduct['prodId'] = item.id;
            recommendProduct['prodNm'] = item.name;

            // 해택 출력 포맷 변경
            Object.keys(MLS_PRODUCT_BENEFIT[item.id]).map((key) => {

              let value = MLS_PRODUCT_BENEFIT[item.id][key].desc;

              if ( FormatHelper.isNumber(value)) {
                value = FormatHelper.addComma(String(value));
              }
              benefit[key] = {
                desc: value,
                img: MLS_PRODUCT_BENEFIT[item.id][key].img
              };
            });

            // 자세히 보기의 헤택별 출력 여부
            recommendProduct['benefit'] = Object.assign(benefit, {
              hasData: benefit.data.desc === '0' ? false : true,
              hasMemberShip: benefit.membership.desc === '0' ? false : true,
              hasFlo: benefit.flo.desc === '0' ? false : true,
              hasPooq: benefit.pooq.desc === '0' ? false : true,
              hasInsurance: benefit.insurance.desc === '0' ? false : true,
              hasSafe: benefit.safe.desc === '0' ? false : true
            });

            return this.apiService.request(API_CMD.BFF_05_0212, {keys: this.getUserProfileKeys()});

          } else {
            throw MLS_ERROR.MLS0001;
          }
        } else {
          throw resp;
        }
      }).switchMap((resp) => {

        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.of(Object.assign(recommendProduct, this.makeData(resp.result.results, recommendProduct['prodId'])));
        } else {
          throw resp;
        }
      }).subscribe((resp) => {

        this.logger.debug(this, '[내게 맞는 추천 요금제-2]\n', JSON.stringify(resp));

        // 츨력할 category가 없으면, 상픔페이지로 바로 이동한다.
        if (resp.has_category) {
          res.render('recommend/main.recommend.product.html', { svcInfo, pageInfo, resp });
        } else {
          res.redirect('/product/callplan?prod_id=' + resp['prodId']);
        }
      }, (err) => {
        // this.logger.error(this, '[내게 맞는 추천 요금제]\n', JSON.stringify(err));
        this.error.render(res, {
          svcInfo: svcInfo,
          code: err.code,
          msg: err.msg
        });
      });
    // }
  }

  /**
   * @function
   * @desc 데이터를 얻어올 user profile key들을 array로 return 한다.
   * @return {Array}
   */
  private getUserProfileKeys() {
    // MLS_USER_PROFILE_KEYS에 포함된 모든 user profile key를 가져온다.
    let keys: any = [];
    Object.keys(MLS_USER_PROFILE_KEYS).map((key: any) => {
      keys = keys.concat(key);
    });

    return keys;
  }

  /**
   * @function
   * @desc API의 response를 가지고 카테고리(데이터, 동영상 등) 별 사유 코드를 생상한다.
   * @return {Array}
   */
  private makeData(resp: any, prodId: any) {

    const mlsDetailMapping = Object.assign({}, MLS_DETAIL_MAPPING);
    const result = {
      has_category: false
    };
    const membershipDatas: any = [];

    Object.keys(mlsDetailMapping).map((kind: any) => {
      const kindObj = MLS_DETAIL_MAPPING[kind];
      result[kind] = {isShow: false};

      // priority로 정렬
      FormatHelper.sortObjArrAsc(kindObj, 'priority');
      let isKindShow = false;

      kindObj.map((reasonObj) => {

        const reason = Object.assign({}, reasonObj);

        result[reason.reason_code] = false;
        reason['check_get_all_profiles'] = true;
        
        if (isKindShow === false) {
          reason.profile_keys.map((profileObj) => {

            // 결과에 key가 포함
            if ( resp.hasOwnProperty(profileObj.key)) {

              const profile = Object.assign(profileObj, MLS_USER_PROFILE_KEYS[profileObj.key]);
              // 기준 profile인 경우 값의 유효성을 판단하여 해당
              if (!FormatHelper.isEmpty(profile.criteria)) {
                const checkResult = this.checkCriteriaResult(profile, resp[profile.key]);
                this.logger.debug(this, '[내게 맞는 추천 요금제-1]\n', 
                  profile.key, profile.criteria.operator, profile.criteria.value, resp[profile.key], checkResult);
  
                if (FormatHelper.isEmpty(reason['isShow'])) {
                  reason['isShow'] = checkResult;
                } else {
                  if (reason.criteria_condition === 'AND') {
                    reason['isShow'] = reason['isShow'] && checkResult;
                  } else if (reason.criteria_condition === 'OR') {
                    reason['isShow'] = reason['isShow'] || checkResult;
                  }
                }
              }

              const title = FormatHelper.isEmpty(profile.title) ? profile.name : profile.title;
              let value = resp[profile.key];

              if (kind === 'membership' && profile.type === 'amt') {
                membershipDatas.push({
                  key: profile.key,
                  title: title,
                  amt: Number(value)
                });
              }

              // 유형 별로 Format 수정
              if ( !FormatHelper.isEmpty(profile.type) && !FormatHelper.isEmpty(resp[profile.key])) {

                // 비율의 경우 1 또는 0.1보다 작으먄 표시 자릿수를 조정한다.
                if ( profile.type === 'ratio') {
                  value = Number(value) * 100;
                  let cipher = 0;
                  if (value < 0.1) {
                    cipher = 2;
                  } else if (value < 1) {
                    cipher = 1;
                  }

                  value = (value > 100) ? 100 : value.toFixed(cipher);

                // 금액은 1000단위 구분자 추가(단, 멤베십은 아래 로직에서 처리)
                } else if ( kind !== 'membership' && profile.type === 'amt') {
                  value = Number(value);
                  value = FormatHelper.isNumber(value) ? value : 0;
                  value = FormatHelper.isEmpty(value) ? 0 : value;
                  resp[profile.key] = FormatHelper.addComma(String(value));
                }
              }

              result[profile.key] = value;

              // 전월계산
              if ( profile.key === 'bf_m0_ym') {
                result['date_use_ratio_m0'] = DateHelper.getCurrentMonth(resp[profile.key]);
                result['date_use_ratio_m1'] = (Number(result['date_use_ratio_m0']) === 1 ? 12 : result['date_use_ratio_m0'] - 1);
                result['date_use_ratio_m2'] = (Number(result['date_use_ratio_m1']) === 1 ? 12 : result['date_use_ratio_m1'] - 1);
              }
            // API 결과에 출력에 필요한 key가 포함 안 되는 경우..
            } else if ((resp.hasOwnProperty(profileObj.key) === false || FormatHelper.isEmpty(resp[profileObj.key])) && profileObj.required ) {
              reason['check_get_all_profiles'] = false;
            }
          });
  
          // 현재의 사유(reason)가 종류의 카테고리의 사유이고, 필요한 profile의 값이 모두 있을 걍우
          if (reason.isShow && reason.check_get_all_profiles) {
            isKindShow = true;
            let tooltip = reason.tooltip;

            // 추천 요금제가 대상일 경우만 노출
            if (reason.valid_prodIds.indexOf(prodId) !== -1) {
              tooltip = (typeof reason.tooltip === 'object') ? reason.tooltip[prodId] : tooltip;
            } else {
              isKindShow = false;
            }

            result[kind] = {
              isShow: isKindShow,
              tooltip: tooltip
            };

            result[reason.reason_code] = true;

            if (isKindShow === true) {
              result.has_category = true;
            }

          }
        }
      });
    });

    // 최소 4개의 데이터가 없으면 멤버십카드를 출력하지 않는다.(Total 데이터 수신 여부는 상위 공통 로직에서 체크)
    if ( membershipDatas.length > 4 && result['membership']) {

      let total: any;
      membershipDatas.some((obj, idx) => {
        if ( obj.key === 'mbr_use_discount_amt_cum') {
          total = {
            index: idx,
            obj: obj
          };
          return true;
        }
      });

      if ( !FormatHelper.isEmpty(total)) {
        membershipDatas.splice(total.index, 1);
      }

      FormatHelper.sortObjArrDesc(membershipDatas, 'amt');
      if ( !FormatHelper.isEmpty(total)) {
        membershipDatas.unshift(total.obj);
      }

      const tempArr = membershipDatas.slice(0, 4);
      const totalAmt = Number(tempArr[0].amt);

      // 기타 append
      tempArr.push({
        key: 'mbr_discount_amt_cum_etc',
        title: '기타',
        amt: totalAmt - Number(tempArr[1].amt) - Number(tempArr[2].amt) - Number(tempArr[3].amt)
      });

      if ( totalAmt !== 0) {
        let remainder = 100;

        tempArr.map((obj, index) => {
          const amt = obj['amt'];
          const percent = Number(amt) === 0 ? 0 : Math.floor((Number(amt) / totalAmt) * 100);
          obj['percent'] = percent;
          obj['amt'] = FormatHelper.addComma(String(amt));

          // 0번 index는 합계임
          if ( index !== 0) {
            remainder = Number(remainder) - Number(percent);
          }
        });

        // 기타에 입력(남은 %를 입력)
        tempArr[4].percent = Number(tempArr[4].percent) + Number(remainder.toFixed(0));

        result['membership']['total'] = tempArr[0];
        result['membership']['first'] = tempArr[1];
        result['membership']['second'] = tempArr[2];
        result['membership']['third'] = tempArr[3];
        result['membership']['etc'] = tempArr[4];
      } else {
        result['membership']['isShow'] = false;

        // membershop 이외의 보여질 category가 앖다면..
        if (!result.has_category) {
          result.has_category = false;
        }
      }
    } else {
      result['membership']['isShow'] = false;

      // membershop 이외의 보여질 category가 앖다면..
      if (!!result.has_category) {
        result.has_category = false;
      }
    }

    return result;

  }

  private checkCriteriaResult(profile: any, value) {

    const criteria = profile.criteria;
    let criteriaValue = criteria.value;

    if (profile.type === 'ratio' || profile.type === 'amt' || profile.type === 'GB') {
      value = Number(value);
      criteriaValue = Number(criteriaValue);
    }

    // 같음
    if (criteria.operator === 1) {
      return criteria.value === value;
    // 다름
    } else if (criteria.operator === 2) {
      return criteria.value !== value;
      // 미만
    } else if (criteria.operator === 3 && criteria.value > value) {
      return true;
    // 이하
    } else if (criteria.operator === 4) {
      if (criteria.value >= value) {
        return true;
      } else {
        return false;
      }
    // 이상
    } else if (criteria.operator === 5) {
      if (criteria.value <= value) {
        return true;
      } else {
        return false;
      }
    // 초과
    } else if (criteria.operator === 6 && criteria.value < value) {
      return true;
    // 존재여부
    } else if (criteria.operator === 7) {
      return true;
    } else if (criteria.operator === 8) {
      return false;
    } else {
      return false;
    }
  }
}
