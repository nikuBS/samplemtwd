/**
 * @file customer.researches.controller.ts
 * @author Jiyoung Jo
 * @since 2018.11.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { ETC_CENTER } from '../../../../types/string.type';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';

/**
 * @class 
 * @desc 고객센터 > 설문조사
 */
export default class CustomerResearches extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.query.id) {
      this._getResearch(req.query.id).subscribe(research => {
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
      this.__getResearches(req.query.quiz).subscribe(researches => {
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

  /**
   * @desc 설문조사 가져오기 요청
   * @param {string} quizId 고객센터 서브메인에서 접근한 경우, 해당 설문 id가 리스트 기본 노출 범위(20개) 이후에 있을 경우, 해당 설문조사까지 자동으로 노출되도록 하기 위함(기획 요청)
   * @private
   */
  private __getResearches = quizId => {
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

  /**
   * @desc 설문조사 가져오기 요청
   * @param {string} id 설문조사 id
   * @private
   */
  private _getResearch = id => {
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
