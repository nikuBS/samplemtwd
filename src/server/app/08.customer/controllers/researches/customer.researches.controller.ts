/**
 * FileName: customer.researches.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
// import { Researches, StepResearch } from '../../../../mock/server/customer.researches.mock';

export default class CustomerResearches extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.params.researchId) {
      this.getResearch(req.params.researchId).subscribe(research => {
        // const research: any = this.getResearch('');

        if (research.code) {
          return this.error.render(res, {
            svcInfo,
            ...research
          });
        }

        res.render('researches/customer.researches.research.html', { svcInfo, pageInfo, research });
      });
    } else {
      // const researches: any = this.getResearches();
      this.getResearches().subscribe(researches => {
        if (researches.code) {
          return this.error.render(res, {
            svcInfo,
            ...researches
          });
        }
        res.render('researches/customer.researches.html', { svcInfo, researches, pageInfo });
      });
    }
  }

  private getResearches = () => {
    // const resp = Researches;
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
            content: research['exCtt' + idx] || '',
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

  private getResearch = id => {
    return this.apiService.request(API_CMD.BFF_08_0038, { qstnId: id }).map(resp => {
      // const resp = StepResearch;
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
