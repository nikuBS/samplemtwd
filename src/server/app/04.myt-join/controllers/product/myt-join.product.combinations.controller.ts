/**
 * FileName: myt-join.product.combinations.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { MYT_COMBINATIONS } from '../../../../mock/server/myt-join.product.combinations';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { resolvePtr } from 'dns';
import { COMBINATION_PRODUCT } from '../../../../types/bff.type';

export default class MyTJoinProductCombinations extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.params.combination) {
      const id = req.params.combination;
      this.getCombination(id).subscribe(combination => {
        const pageId = COMBINATION_PRODUCT[id || ''];
        console.log('!!', pageId, combination);

        if (combination.code || !pageId) {
          return this.error.render(res, {
            ...combination,
            svcInfo
          });
        }

        res.render('product/myt-join.product.combinations.combination.html', { svcInfo, pageInfo, combination, pageId });
      });
    } else {
      // this.apiService.request(API_CMD.BFF_05_0133, {}).subscribe(resp => {
      //   if (resp.code !== API_CODE.CODE_00) {
      //     return this.error.render(res, {
      //       code: resp.code,
      //       msg: resp.msg,
      //       svcInfo
      //     });
      //   }
      const combinations = MYT_COMBINATIONS.result.combinationWirelessMemberList;
      res.render('product/myt-join.product.combinations.html', { svcInfo, pageInfo, combinations });
      // });
    }
  }

  private getCombination = id => {
    return this.apiService.request({ ...API_CMD.BFF_05_0134, path: API_CMD.BFF_05_0134.path + '/' + id }, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }
}
