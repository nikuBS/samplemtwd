/**
 * FileName: customer.researches.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { RESEARCH_EXAMPLE_TYPE } from '../../../../types/string.old.type';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

export default class CustomerResearches extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    // if (req.params.researchId) {
    //   this.apiService.request(API_CMD.BFF_08_0038, { qstnId: req.params.researchId }).subscribe(resp => {
    //     const research = this.getProperResearchData(resp.result);
    //     res.render('researches/customer.researches.research.html', { svcInfo, research });
    //   });
    // } else {

    this.getResearches().subscribe(researches => {
      if (researches.code) {
        return this.error.render(res, {
          svcInfo,
          ...researches
        });
      }
      res.render('researches/customer.researches.html', { svcInfo, researches, pageInfo });
    });
    // }
  }

  private getResearches = () => {
    return this.apiService.request(API_CMD.BFF_08_0023, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result.map(research => {
        const examples: Array<{}> = [];
        const count = Number(research.exCttCnt);

        for (let i = 0; i < count; i++) {
          const idx = i + 1;
          const isEtc = idx === count && research['exCtt' + idx] === 'QSTNETC';

          examples.push({
            content: isEtc ? RESEARCH_EXAMPLE_TYPE.ETC : research['exCtt' + idx] || '',
            image: research['exImgFilePathNm' + idx],
            motHtml: research['motExCtt' + idx],
            isEtc
          });
        }

        return {
          ...research,
          examples,
          isProceeding: DateHelper.getDifference(research.endDtm.replace(/\./g, '')) > 0
        };
      });
    });
  }
}
