/**
 * MenuName: 나의 가입정보 > 서브메인 > 개통정보 조회
 * @file myt-join.submain.opening-detail.controller.ts(MS_01)
 * @author Kim, Hansoo (skt.P148890@partner.sk.com)
 * @since 2019.12.17
 * Summary: 개통정보 조회
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, SESSION_CMD } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_USAGE_CANCEL_TSHARE } from '../../../../types/string.type';

class MyTJoinOpeningDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.apiService.requestStore(SESSION_CMD.BFF_05_0061, {}),
      this.apiService.request(API_CMD.BFF_05_0216, {
        svcNum: svcInfo.svcNum
      }),
      this.apiService.requestStore(SESSION_CMD.BFF_05_0068, {})
    ).subscribe(([resHistories, resDetail, myInfo]) => {
      const apiError = this.error.apiError([resHistories, resDetail, myInfo]);
      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.error.render(res, {
          title: MYT_DATA_USAGE_CANCEL_TSHARE.TITLE,
          code: apiError.code,
          msg: apiError.msg,
          svcInfo,
          pageInfo
        });
      }
      const histories = resHistories.result;
      const options = {
        svcInfo,
        pageInfo,
        detail: resDetail.result,
        myInfo: {
          apprAmt: FormatHelper.addComma(myInfo.result.apprAmt),
          invBamt: FormatHelper.addComma(myInfo.result.invBamt)
        }
      };
      // NOTE: 2007년 3월 1일 이후에는 자료가 있다. 즉, 자료가 없으면, 2007년 3월 1일 이전 가입자다.
      if ( histories && histories.length > 0 ) {
        // 첫번째가 개통일(신규 가입일)
        options['histories'] = histories.map(history => {
          const chgDt = history.chgDt;
          return {
            // 개통일자 (마스킹시 ****.**.** 이와 같이 변경)
            chgDt: this.isMasking(chgDt) ? this.dateMaskingReplace(chgDt) : DateHelper.getShortDate(chgDt),
            // NOTE: 내용이면서도 코드처럼 표현되어 있어 임의로 보정
            chgNm: history.chgCd
          };
        });
      } else {
        options['histories'] = null;
      }

      res.render('submain/myt-join.submain.opening.detail.html', options);
    });
  }

  /**
   *
   * @param {string} target
   * @return {boolean}
   */
  dateMaskingReplace(target): string {
    return target
      .replace(/\B((?=([*]{2})(?![*])))/g, '.')
      .replace(/\B((?=([.*]{5})(?![.*])))/g, '.');
  }

  /**
   *
   * @param {string} target
   * @return {boolean}
   */
  isMasking(target: string): boolean {
    let result = false;
    const MASK_CODE = '*';
    if ( target && target.indexOf(MASK_CODE) > -1 ) {
      result = true;
    }
    return result;
  }
}

export default MyTJoinOpeningDetail;
