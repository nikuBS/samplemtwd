/**
 * @file 결과보기 < 설문조사 < 고객의견 < 이용안내
 * @author Jiyoung Jo
 * @since 2019.01.04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import {CUSTOMER_RESEARCH_ERROR} from '../../../../types/string.type';


/**
 * @class
 * @desc 고객센터 > 설문조사 > 결과보기
 */
export default class CustomerResearchesResult extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * @desc 화면 랜더링
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this._getResult(req.query.id).subscribe(result => {
      // 존재하지 않는 설문 id로 인하여 API 리턴값 00 이지만 정상적인 데이터가 넘어오지 않는 경우에 대한 처리 포함 (이시현 매니저님 요청)
      // CUSTOMER_RESEARCH_ERROR.MSG2,
      if (result.code) {
        return this.error.render(res, {
          svcInfo,
          pageInfo,
          code: result.code !== API_CODE.CODE_00 ? result.code : API_CODE.NODE_1012,
          msg: result.code !== API_CODE.CODE_00 ? result.msg : CUSTOMER_RESEARCH_ERROR.MSG2
          // ...result
        });
      }

      res.render('researches/customer.researches.result.html', { svcInfo, pageInfo, result });
    });
  }

  /**
   * @desc 설문조사 결과보기 데이터 요청
   * @param {string} id 설문조사 id
   * @private
   */
  private _getResult = id => {
    // return of(ResearchResult).map(resp => {
    return this.apiService.request(API_CMD.BFF_08_0024, { bnnrRsrchId: id }).map(resp => {
      if (resp.code !== API_CODE.CODE_00 || FormatHelper.isEmpty(resp.result[0])) {
        return resp;
      }

      const result = resp.result[0];

      if (result) {
        const examples: any[] = [],
          totalCount = result.totRpsCnt,
          answer = Number(result.canswNum || 0);
        let i = 1,
          maxIdx = 0;

        while (result['exCtt' + i]) {
          const count = result['rpsCtt' + i + 'Cnt'];
          examples.push({
            content: result['exCtt' + i] || '',
            count,
            rate: totalCount === 0 ? 0 : Math.floor((count / totalCount) * 100),
            isAnswer: answer === i
          });
          maxIdx = result['rpsCtt' + (maxIdx + 1) + 'Cnt'] < count ? i - 1 : maxIdx;
          i++;
        }

        return {
          ...result,
          staDtm: DateHelper.getShortDate(result.staDtm),
          endDtm: DateHelper.getShortDate(result.endDtm),
          isProceeding: result.endDtm && DateHelper.getDifference(result.endDtm) > 0,
          examples,
          totalCount,
          maxIdx
        };
      } else {
        return result;
      }
    });
  }
}
