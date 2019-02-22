/**
 * FileName: customer.researches.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
// import { of } from 'rxjs/observable/of';
// import { Researches, StepResearch } from '../../../../mock/server/customer.researches.mock';

export default class CustomerResearches extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.query.id) {
      this.getResearch(req.query.id).subscribe(research => {
        if (research.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo,
            ...research
          });
        }

        res.render('researches/customer.researches.research.html', { svcInfo, pageInfo, research });
      });
    } else {
      this.getResearches().subscribe(researches => {
        if (researches.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo,
            ...researches
          });
        }
        res.render('researches/customer.researches.html', { svcInfo, researches, pageInfo });
      });
    }
  }

  private getResearches = () => {
    // return of(Researches).map(resp => {
    return this.apiService.request(API_CMD.BFF_08_0023, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result
        .map(research => {
          const examples: Array<{}> = [];
          let i = 1;

          while (research['exCtt' + i]) {
            const isEtc = research['exCtt' + i] === 'QSTNETC';

            examples.push({
              content: research['exCtt' + i] || '',
              image: research['exImgFilePathNm' + i],
              motHtml: research['motExCtt' + i],
              isEtc
            });
            i++;
          }

          return {
            ...research,
            examples,
            staDtm: DateHelper.getShortDate(research.staDtm),
            endDtm: DateHelper.getShortDate(research.endDtm),
            isProceeding: DateHelper.getDifference(research.endDtm.replace(/\./g, '')) > 0
          };
        })
        .filter((research: any) => research.isProceeding || research.bnnrRsrchTypCd !== 'R');
    });
  }

  private getResearch = id => {
    // return of(StepResearch).map(resp => {
    return this.apiService.request(API_CMD.BFF_08_0038, { qstnId: id }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const questions: any[] = resp.result.surveyQstnInqItm;
      const examples: any[] = resp.result.surveyQstnAnswItm;

      const len = examples.length;
      for (let i = 0; i < len; i++) {
        const example = examples[i];
        const exampleIdx = Number(example.answItmNum);
        const question = questions[Number(example.inqItmNum) - 1];
        const isEtc = example.answItmCtt === 'QSTNETC';

        if (question) {
          if (!question.examples) {
            question.examples = {};
          }

          question.examples[exampleIdx] = {
            content: example.answItmCtt || '',
            nextQuestion: Number(example.nxtInqItmNum),
            isEtc
          };
        }
      }

      return {
        info: resp.result.surveyQstnMaster[0] || {},
        questions
      };
    });
  }
}
