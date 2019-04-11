/**
 * [혜택 > 나의 혜택/할인 > 쿠키즈 팅포인트] 관련 처리
 * @author Hyeryoun Lee
 * @since 2018-11-5
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MY_BENEFIT } from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';

/**
 * [혜택 > 나의 혜택/할인 > 쿠키즈 팅포인트] API호출 및 렌더링
 * @author Hyeryoun Lee
 * @since 2018-11-5
 */
class BenefitCookiz extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    this.apiService.request(API_CMD.BFF_05_0115, {})
      .subscribe(( cookiz ) => {
        if ( cookiz.code === API_CODE.CODE_00 ) {
          const options = {
            svcInfo,
            pageInfo,
            point: FormatHelper.addComma(cookiz.result.usblPoint),
            erndPoint: FormatHelper.addComma(cookiz.result.erndPoint),
            usdPoint: FormatHelper.addComma(cookiz.result.usdPoint),
            exprdPoint: FormatHelper.addComma(cookiz.result.exprdPoint)
          };

          res.render('my-benefit/benefit.myt-benefit.cookiz.html', options);
        } else {
          return this.error.render(res, {
            title: MY_BENEFIT.MAIN,
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            msg: cookiz.msg,
            code: cookiz.code
          });
        }
      });
  }

}

export default BenefitCookiz;
