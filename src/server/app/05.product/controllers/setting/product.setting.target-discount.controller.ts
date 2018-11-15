/**
 * FileName: product.setting.target-discount.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.11.13
 * Page ID: MP_02_02_03_08
 * Desctiption: 상품 > 가입설정해지 > MYT > TTL캠퍼스10요금제> 할인지역,지정번호입력변경
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class ProductSettingTargetDiscount extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    // Observable.combineLatest(
    //   this.apiService.request(API_CMD.BFF_10_0072, {}),
    //   this.apiService.request(API_CMD.BFF_10_0073, {}))
    //   .subscribe(([resp, resp2]) => {
        const resp = {
          'code': '00',
          'msg': 'success',
          'result': {
            'zoneSetInfoList': [
              {
                'dcAreaNum': '10135',
                'dcAreaNm': '중앙대학교',
                'auditDtm': '20100806170537'
              }
            ],
            'snumSetInfoList': [
              {
                'svcNum': '010xxxxxxxx',
                'auditDtm': '20100806170537'
              },
              {
                'svcNum': '011xxxxxxxx',
                'auditDtm': '20100806170537'
              },
              {
                'svcNum': '010xxxxxxxx',
                'auditDtm': '20100806170537'
              }
            ]
          }
        };

        const resp2 = {
          'code': '00',
          'msg': 'success',
          'result': {
            'snumSetInfoList': [
              {
                'svcNum': '010xxxxxxxx',
                'svcNumMask': '010xx**xx**',
                'custNmMask': '',
                'auditDtm': '20051016193024'
              },
              {
                'svcNum': '010xxxxxxxx',
                'svcNumMask': '010xx**xx**',
                'custNmMask': 'x*x',
                'auditDtm': '20060920151950'
              }
            ]
          }
        };


    if ( resp.code === API_CODE.CODE_00 ) {
          resp['result']['snumSetInfoList'] = resp2['result']['snumSetInfoList'];

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: resp.result };
          res.render('setting/product.setting.target-discount.html', option);

        } else {
          return this.error.render(res, {
            title: '할인지역,지정번호 설정',
            code: resp.code,
            msg: resp.msg,
            svcInfo: svcInfo
          });
        }
    //   }, (err) => {
    //     return this.error.render(res, {
    //       title: '할인지역,지정번호 설정',
    //       code: err.code,
    //       msg: err.msg,
    //       svcInfo: svcInfo
    //     });
    //   });

  }
}

export default ProductSettingTargetDiscount;
