/**
 * FileName: customer.researches.controller.ts
 * @author Jiyoung Jo
 * Date: 2018.11.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { ETC_CENTER } from '../../../../types/string.type';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';
// import { of } from 'rxjs/observable/of';
// import { Researches, StepResearch } from '../../../../mock/server/customer.researches.mock';

export default class CustomerResearches extends TwViewController {
  constructor() {
    super();
  }

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
      this.getResearches(req.query.quiz).subscribe(researches => {
        if (researches.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo,
            code: researches.code,
            msg: researches.msg
          });
        }
        res.render('researches/customer.researches.html', { svcInfo, pageInfo, ...researches });
      });
    }
  }

  private getResearches = quizId => {
    // return of(Researches).map(resp => {
    return this.apiService.request(API_CMD.BFF_08_0023, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      const quizIdx = quizId
        ? resp.result.findIndex(research => {
          return research.bnnrRsrchId === quizId;
        })
        : undefined;

      return {
        researches: resp.result
          .map(research => {
            const examples: Array<{}> = [];
            let i = 1,
              exam = research['exCtt' + i],
              hasHtml = false;

            while (exam) {
              const isEtc = exam === 'QSTNETC';
              hasHtml = hasHtml || research['motExCtt' + i];

              examples.push({
                content: isEtc ? ETC_CENTER : exam || '',
                image: research['exImgFilePathNm' + i],
                motHtml: research['motExCtt' + i],
                isEtc
              });
              i++;
              exam = research['exCtt' + i];
            }

            return {
              ...research,
              examples,
              hasHtml,
              staDtm: DateHelper.getShortDate(research.staDtm),
              endDtm: DateHelper.getShortDate(research.endDtm),
              isProceeding: DateHelper.getDifference(research.endDtm) > 0
            };
          })
          .filter(research => {
            return research.bnnrRsrchTypCd !== 'R' || research.isProceeding;
          }),
        showCount: quizIdx && quizIdx !== -1 ? Math.floor(quizIdx / DEFAULT_LIST_COUNT + 1) * DEFAULT_LIST_COUNT : DEFAULT_LIST_COUNT
      };
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
            ...example,
            content: example.answItmCtt || '',
            nextQuestion: Number(example.nxtInqItmNum),
            isEtc
          };
        }
      }

      const info = resp.result.surveyQstnMaster[0];
      return {
        info: {
          ...info,
          staDtm: DateHelper.getShortDate(info.staDtm),
          endDtm: DateHelper.getShortDate(info.endDtm)
        },
        questions
      };
    });
  }
}
