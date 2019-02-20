/**
 * FileName: product.setting.target-discount.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.11.13
 * Page ID: MP_02_02_03_08
 * Desctiption: 상품 > 가입설정해지 > MYT > TTL캠퍼스10요금제> 할인지역,지정번호입력변경
 */
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';
import StringHelper from '../../../../../utils/string.helper';

class ProductMobileplanSettingLocation extends TwViewController {
  private readonly _allowedProdIdList = ['NA00000008', 'NA00002563', 'NA00002585'];

  constructor() {
    super();
  }

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
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0043, {}),
      this.apiService.request(API_CMD.BFF_10_0073, {}))
      .subscribe(([resp, resp2]) => {
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


        if ( resp.code === API_CODE.CODE_00 ) {
          resp['result']['snumSetInfoList'] = resp2['result']['snumSetInfoList'];
          resp['result']['svcNum'] = StringHelper.phoneStringToDash(svcInfo.svcNum);

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: resp.result, showNumberSetting: showNumberSetting };
          res.render('mobileplan/setting/product.mobileplan.setting.location.html', option);

        } else {
          return this.error.render(res, {
            title: PRODUCT_TYPE_NM.SETTING,
            code: resp.code,
            msg: resp.msg,
            svcInfo: svcInfo
          });
        }
      }, (err) => {
        return this.error.render(res, {
          title: PRODUCT_TYPE_NM.SETTING,
          code: err.code,
          msg: err.msg,
          svcInfo: svcInfo
        });
      });
  }

}

export default ProductMobileplanSettingLocation;
