/**
 * MenuName: T멤버십 > 제휴브랜드 > 혜택보기
 * @file membership.benefit.brand-benefit.controller.ts
 * @author Hakjoon sim (hakjoon.sim@sk.com)
 * @since 2018.11.06
 * Summary: 제휴브랜드의 혜택 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import ParamsHelper from '../../../../utils/params.helper';

class MembershipBenefitBrandBenefit extends TwViewController {

  // 로그인이 필요한 category 및 brand code 정의
  private needLoginList = [
    {catCd : '49', brandCd : '2012003539'}
  ];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    const brandCd = req.query.brandCd;
    const needLogin = this.needLoginList.findIndex(data => ((data.catCd === req.query.cateCd && data.brandCd === req.query.brandCd)));
    
    // 미로그인 상태 & 로그인이 필요한 경우
    if ((svcInfo ? 'Y' : 'N') === 'N' && needLogin !== -1) {
        const path = req.baseUrl + (req.path !== '/' ? req.path : '');

        res.render('error.login-block.html', { target: path + ParamsHelper.setQueryParams(req.query) });
    } 

    if (FormatHelper.isEmpty(brandCd)) {
      this.error.render(res, {
        code: '',
        msg: 'not found brand code',
        pageInfo: pageInfo,
        svcInfo
      });
      return;
    }

    const param = {
      brandCd : brandCd
    };

    Observable.combineLatest(
      this.getBrandInfo(param),
      this.getAgreeInfo(svcInfo)
      // this.apiService.request(API_CMD.BFF_11_0018, param),      // 혜택조회
      // this.apiService.request(API_CMD.BFF_03_0021, {})   // 위치동의여부 조회
    ).subscribe(([resp1, resp2]) => {

      if ( resp1.code === API_CODE.CODE_00 ) {

        const data = resp1.result;
        if ( data.totLikeCount ) {
          data['totLikeCount'] = FormatHelper.addComma(data.totLikeCount);
          data['myLike'] = (data.myLikeCount && data.myLikeCount !== '0');
        }

        data['loginYn'] = (svcInfo ? 'Y' : 'N');  // 로그인 여부
        data['locAgreeYn'] = 'N';   // 위치동의 여부

        // 위치동의 조회
        if ( resp2.code === API_CODE.CODE_00 ) {
          data['locAgreeYn'] = resp2.result.twdLocUseAgreeYn;
        }

        this.goView(res, svcInfo, pageInfo, data);
      }
    });
  }

  /**
   * 화면으로 이동
   * @param res
   * @param svcInfo
   * @param pageInfo
   * @param data
   */
  private goView(res: Response, svcInfo: any, pageInfo: any, data: any) {

    res.render('benefit/membership.benefit.brand-benefit.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      data: data
    });
  }

  /**
   * 제휴브랜드 혜택 조회
   * @private
   * return Observable
   */
  private getBrandInfo(param: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0018, param);
  }

  /**
   * T world 동의여부 조회 (광고정보수신/개인정보수집이용/위치정보이용)
   * @private
   * return Observable
   */
  private getAgreeInfo(svcInfo): Observable<any> {
    if (FormatHelper.isEmpty(svcInfo)) {
      return Observable.of({code: API_CODE.BFF_0003});
    } else {
      return this.apiService.request(API_CMD.BFF_03_0021, {});
    }
  }
}

export default MembershipBenefitBrandBenefit;
