/**
 * 상품 > 가입설정해지 > 010캠퍼스요금제,TTL지역할인요금제,TTL캠퍼스10요금제 (MP_02_02_03_08)
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018-11-13
 */
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';
import StringHelper from '../../../../../utils/string.helper';

/**
 * @class
 */
class ProductMobileplanSettingLocation extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00000008', 'NA00002563', 'NA00002585'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.SETTING
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    let showNumberSetting = false;

    // 할인지역, 지정번호 변경
    // - 010캠퍼스요금제(NA00002585)
    // 할인지역 변경
    // - TTL지역할인요금제(NA00000008, NA00002563)
    if (['NA00002585'].indexOf(prodId) !== -1) {
      showNumberSetting = true;
    } else {
      /*
      // DV001-16828
      // 할인지역 번경만인 경우 location-only(마스킹인증 없는 화면)로 url이 지정되지 않은 경우 redirect 시켜줌
      // -> admin에 등록되서 강제 처리하는것은 주석처리 함
      if ( req.url.indexOf('/mobileplan/setting/location-only') === -1) {
        res.redirect('/product/mobileplan/setting/location-only?prod_id=' + prodId);
        return;
      }
      */
    }

    const apiArr = [this.apiService.request(API_CMD.BFF_10_0043, {})];
    if ( showNumberSetting ) {
      apiArr.push(this.apiService.request(API_CMD.BFF_10_0073, {}));
    }

    Observable.combineLatest( apiArr )
      .subscribe((respArr) => {
        // const resp = {
        //   'code': '00',
        //   'msg': 'success',
        //   'result': {
        //     'zoneSetInfoList' : [
        //       {
        //         'dcAreaNum': '22288',
        //         'dcAreaNm': '가천의과학대학교(연수캠퍼스)',
        //         'scrbDt': '20091126',
        //         'auditDtm': '20091126150810'
        //       }
        //     ]
        //   }
        // };
        //
        // const resp2 = {
        //   'code': '00',
        //   'msg': 'success',
        //   'result': {
        //     'snumSetInfoList': [
        //       {
        //         'svcNum': '010xxxxxxxx',
        //         'svcNumMask': '010xx**xx**',
        //         'custNmMask': '',
        //         'auditDtm': '20051016193024'
        //       },
        //       {
        //         'svcNum': '010xxxxxxxx',
        //         'svcNumMask': '010xx**xx**',
        //         'custNmMask': 'x*x',
        //         'auditDtm': '20060920151950'
        //       }
        //     ]
        //   }
        // };


        if ( respArr[0].code === API_CODE.CODE_00 ) {
          if ( respArr.length === 2 ) {
            respArr[0]['result']['snumSetInfoList'] = respArr[1]['result']['snumSetInfoList'];
          }

          respArr[0]['result']['svcNum'] = StringHelper.phoneStringToDash(svcInfo.svcNum);

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: respArr[0].result, showNumberSetting: showNumberSetting };
          res.render('mobileplan/setting/product.mobileplan.setting.location.html', option);

        } else {
          return this.error.render(res, {
            title: PRODUCT_TYPE_NM.SETTING,
            code: respArr[0].code,
            msg: respArr[0].msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (err) => {
        return this.error.render(res, {
          title: PRODUCT_TYPE_NM.SETTING,
          code: err.code,
          msg: err.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      });
  }

}

export default ProductMobileplanSettingLocation;
