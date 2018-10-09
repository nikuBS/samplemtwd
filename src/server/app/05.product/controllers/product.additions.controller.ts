/**
 * FileName: product.additions.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.10.09
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { PRODUCT_MY_ADDITIONS } from '../../../mock/server/product.submain.mock';
import { API_CODE, API_CMD } from '../../../types/api-command.type';
import { PRODUCT_ADDITIONS } from '../../../mock/server/product.list.mock';
import FormatHelper from '../../../utils/format.helper';

export default class ProductAdditions extends TwViewController {
  private ADDITION_CODE = 'F01200';

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _layerType: string) {
    const additionData = {
      myAdditions: this.getMyAdditions(),
      additions: this.getAddtions()
    };

    console.log(JSON.stringify(additionData));

    res.render('product.additions.html', { svcInfo, additionData });
  }

  private getMyAdditions = () => {
    // this.apiService.request(API_CMD.BFF_05_0166, {}).map(resp => {});

    const resp = PRODUCT_MY_ADDITIONS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return resp.result.addProductJoinsInfo;
  }

  private getAddtions = () => {
    // this.apiService.request(API_CMD.BFF_10_0031, { idxCtgCd: this.ADDITION_CODE }).map(resp => {});
    const resp = PRODUCT_ADDITIONS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    return {
      ...resp.result,
      products: resp.result.products.map(addition => {
        return {
          ...addition,
          basFeeInfo: FormatHelper.getFeeContents(addition.basFeeInfo)
        };
      })
    };
  }
}
