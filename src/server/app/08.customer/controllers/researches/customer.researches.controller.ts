/**
 * @file 설문조사 < 고객의견 < 이용안내
 * @author Jiyoung Jo
 * @since 2018.11.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { ETC_CENTER } from '../../../../types/string.type';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';
import FormatHelper from '../../../../utils/format.helper';

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
      // console.log('req.query.id ===== ', req.query.id); // 설문
      this._getResearch(req.query.id).subscribe(research => {

        // console.log('research 렌더 하위의 가공된 ===== ', research);
        // console.log('research 렌더 하위의 가공된 현재 타이틀 ===== ', research.info.qstnTitleNm);


        if (research.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo,
            ...research
          });
        }

        res.render('researches/customer.researches.research.html', { svcInfo, pageInfo, research });
      });
    } else if (req.query.qid) {
      // console.log('req.query.qid ===== ', req.query.qid); // 퀴즈
      // console.log('req.query.ctgCd ===== ', req.query.ctgCd); //
      this.__getQuizAndPoll(req.query.qid, req.query.ctgCd).subscribe(research => {
        if (research.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo,
            code: research.code,
            msg: research.msg
          });
        }

        // this.logger.info(this, '[customer.researches.controller] %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', '');
        // this.logger.info(this, '[customer.researches.controller] 설문조사 번호 : ', research.research[0].bnnrRsrchId);
        // this.logger.info(this, '[customer.researches.controller] 설문조사 유형 : ', research.research[0].bnnrRsrchTypCd === 'Q' ? '퀴즈' : '투표');
        // this.logger.info(this, '[customer.researches.controller] 단일/다중선택 여부 : ', research.research[0].bnnrRsrchRpsTypCd === 'R' ? '단일선택' : '다중선택');
        // this.logger.info(this, '[customer.researches.controller] 정렬방식 : ', research.research[0].bnnrRsrchSortMthdCd === 'D' ? '좌우정렬' : '수직정렬');
        // this.logger.info(this, '[customer.researches.controller] 텍스트/이미지 여부 : ', research.research[0].exImgFilePathNm1 !== undefined ? '이미지' : '텍스트');
        // this.logger.info(this, '[customer.researches.controller] API Return : ', research.research[0]);
        // this.logger.info(this, '[customer.researches.controller] %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', '');

        res.render('researches/customer.researches.research.html', { svcInfo, pageInfo, research });
      });
    } else if (req.query.pid) {
      // console.log('req.query.pid ===== ', req.query.pid); // 투표
      // console.log('req.query.ctgCd ===== ', req.query.ctgCd); //
      this.__getQuizAndPoll(req.query.pid, req.query.ctgCd).subscribe(research => {
        if (research.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo,
            code: research.code,
            msg: research.msg
          });
        }

        // this.logger.info(this, '[customer.researches.controller] %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', '');
        // this.logger.info(this, '[customer.researches.controller] 설문조사 번호 : ', research.research[0].bnnrRsrchId);
        // this.logger.info(this, '[customer.researches.controller] 설문조사 유형 : ', research.research[0].bnnrRsrchTypCd === 'Q' ? '퀴즈' : '투표');
        // this.logger.info(this, '[customer.researches.controller] 단일/다중선택 여부 : ', research.research[0].bnnrRsrchRpsTypCd === 'R' ? '단일선택' : '다중선택');
        // this.logger.info(this, '[customer.researches.controller] 정렬방식 : ', research.research[0].bnnrRsrchSortMthdCd === 'D' ? '좌우정렬' : '수직정렬');
        // this.logger.info(this, '[customer.researches.controller] 텍스트/이미지 여부 : ', research.research[0].exImgFilePathNm1 !== undefined ? '이미지' : '텍스트');
        // this.logger.info(this, '[customer.researches.controller] API Return : ', research.research[0]);
        // this.logger.info(this, '[customer.researches.controller] %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%', '');

        res.render('researches/customer.researches.research.html', { svcInfo, pageInfo, research });
      });
    } else {
      this.__getResearches(req.query.quiz, req.query.ctgCd).subscribe(researches => {
        // console.log('req.query.quiz ===== ', req.query.quiz); //
        // this.logger.info(this, '[customer.researches.controller] ###############################################################', '');
        // this.logger.info(this, '[customer.researches.controller] researches : ', researches);
        // this.logger.info(this, '[customer.researches.controller] ###############################################################', '');

        if (researches.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            svcInfo,
            code: researches.code,
            msg: researches.msg
          });
        }

        // 등록일자 기준 내림차순으로 정렬 (2020.1.1, 2019.12.31, ...)
        researches.researches.sort( function (first, second) {
          const conv1st = parseInt(DateHelper.getCurrentShortDate(first['staDtm']), 10);
          const conv2nd = parseInt(DateHelper.getCurrentShortDate(second['staDtm']), 10);          

          return conv2nd - conv1st;
        });

        // this.logger.info(this, '[customer.researches.controller] ###############################################################', '');
        // this.logger.info(this, '[customer.researches.controller] researches : ', researches);
        // this.logger.info(this, '[customer.researches.controller] ###############################################################', '');

        res.render('researches/customer.researches.html', { svcInfo, pageInfo, ...researches });
      });
    }
  }

  /**
   * @desc 설문조사 서브메인의 리스트 가져오기 요청
   * @param {string} quizId 고객센터 서브메인에서 접근한 경우, 해당 설문 id가 리스트 기본 노출 범위(20개) 이후에 있을 경우, 해당 설문조사까지 자동으로 노출되도록 하기 위함(기획 요청)
   * @private
   */
  private __getResearches(quizId, ctgCd) {
    // this.logger.info(this, '[customer.researches.controller] #################################################################################', '');
    // this.logger.info(this, '[customer.researches.controller] quizId : ', quizId);
    // this.logger.info(this, '[customer.researches.controller] ctgCd : ', ctgCd);
    // this.logger.info(this, '[customer.researches.controller] #################################################################################', '');
    return this.apiService.request(API_CMD.BFF_08_0023, {}).map(resp => {
      // console.log('resp ===== ', resp);
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

            // console.log('exam 가공전 exCtt ===== ', 'exCtt' + i); // 보기내용
            // console.log('exam ===== ', research['exCtt' + i]); // 보기 내용 1,2,3,4

            while (exam) {
              const isEtc = exam === 'QSTNETC';
              hasHtml = hasHtml || research['motExCtt' + i]; // mot보기내용 1,2,3,4

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

            // console.log('research.isProceeding ===== ', research.isProceeding);

            if (ctgCd === 'E') {  // 종료된 설문조사
              return !research.isProceeding && research.bnnrRsrchTypCd !== 'R'; // [OP002-4585] 종료 설문조사에서는 설문조사(R) 리스트는 노출하지 않음.
            } else {  // 진행중 설문조사
              return research.isProceeding;
            }
          }),
        ctgCd: ctgCd,
        showCount: quizIdx && quizIdx !== -1 ? Math.floor(quizIdx / DEFAULT_LIST_COUNT + 1) * DEFAULT_LIST_COUNT : DEFAULT_LIST_COUNT
      };
    });
  }

  /**
   * @desc 설문조사 가져오기 요청 (디테일)
   * @param {string} id 설문조사 id
   * @private
   */
  private _getResearch = id => {
    // return of(StepResearch).map(resp => {
    return this.apiService.request(API_CMD.BFF_08_0038, { qstnId: id }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      // console.log('resp _getResearch BFF_08_0038  ===== ', resp);

      // 설문 하위의 질문 리스트들
      const questions: any[] = resp.result.surveyQstnInqItm;
      // 설문 하위의 질문 리스트에 대한 답변 리스트들
      const examples: any[] = resp.result.surveyQstnAnswItm;

      // console.log('questions resp.result.surveyQstnInqItm BFF_08_0038  ===== ', resp.result.surveyQstnInqItm); // 설문 하위의 질문 리스트들
      // console.log('examples resp.result.surveyQstnAnswItm BFF_08_0038  ===== ', resp.result.surveyQstnAnswItm); // 설문 하위의 질문 리스트에 대한 답변할 리스트들

      // 설문 하위의 질문 리스트에 대한 답변 리스트들 개수
      const len = examples.length;
      for (let i = 0; i < len; i++) {
        const example = examples[i];  // 각 답변 대입
        const exampleIdx = Number(example.answItmNum);  // 각 답변 리스트들의 답변 번호 (1번 문항의 5개 답변이 있다면 그 5개의 답변들에 대한 고유 시퀀셜 번호, 예> 1,2,3,4,5)
        const question = questions[Number(example.inqItmNum) - 1];  // 현재 질문, 설문하위의 질문 리스트[현재답변리스트.질문문항번호 - 1]
        // 설문 하위의 답변 리스트에 각각의 설명들 예 5점, 또는 주변 지인 추천으로 등등, QSTNETC?
        const isEtc = example.answItmCtt === 'QSTNETC';

        if (question) { // 현재 질문이 있으면
          // 처음엔 question.examples이 없기 때문에 undefined이며 그것의 반대이기 때문에 TRUE 따라서 처음엔 무조건 빈객체가 생성 됨
          if (!question.examples) {
            question.examples = {};
          }

          question.examples[exampleIdx] = { // 현재 질문의 examples 답변 객체의 각 항목에 ...example(resp.result정.surveyQstnAnswItm) 답변들과
            ...example,
            content: example.answItmCtt || '',
            nextQuestion: Number(example.nxtInqItmNum),
            isEtc
          };
        }
      }

      // 설문에 대한 마스터 정보
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

  /**
   * @desc 퀴즈/투표 가져오기 요청 (디테일)
   * @param {string} quizId 고객센터 서브메인에서 접근한 경우, 해당 설문 id가 리스트 기본 노출 범위(20개) 이후에 있을 경우, 해당 설문조사까지 자동으로 노출되도록 하기 위함(기획 요청)
   * @private
   */
  private __getQuizAndPoll(id, ctgCd) {
      // this.logger.info(this, '[customer.researches.controller] ################################################################################', '');
      // this.logger.info(this, '[customer.researches.controller] [__getQuizAndPoll] id : ', id);
      // this.logger.info(this, '[customer.researches.controller] ctgCd : ', ctgCd);
      // this.logger.info(this, '[customer.researches.controller] ################################################################################', '');
      return this.apiService.request(API_CMD.BFF_08_0023, {}).map(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return {
            code: resp.code,
            msg: resp.msg
          };
        }
          
        return {
          research: resp.result
            .map(research => {

              if (research.bnnrRsrchId === id) {
                
                const examples: Array<{}> = [];
                let i = 1,
                  exam = research['exCtt' + i],
                  hasHtml = false;

                // this.logger.info(this, '[customer.researches.controller] #################################################################################', '');
                // this.logger.info(this, '[customer.researches.controller] research["motExCtt" + i] : ', research['motExCtt' + i]);
                // this.logger.info(this, '[customer.researches.controller] isEmpty : ', FormatHelper.isEmpty(research['motExCtt' + i]));
                // this.logger.info(this, '[customer.researches.controller] #################################################################################', '');
    
                while (exam) {
                  const isEtc = exam === 'QSTNETC';
                  hasHtml = hasHtml || research['motExCtt' + i];
    
                  examples.push({
                    content: isEtc ? ETC_CENTER : exam || '',
                    image: research['exImgFilePathNm' + i],
                    motHtml: FormatHelper.isEmpty(research['motExCtt' + i]) ? '' : research['motExCtt' + i],
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
              }
            })
            .filter(research => {
              if (research !== undefined) {
                return research;
              }
            }),
        };
      });
    }
}
