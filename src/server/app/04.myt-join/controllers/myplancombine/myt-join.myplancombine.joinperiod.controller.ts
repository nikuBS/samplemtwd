/**
 * @file 총적용가입기간 상세 팝업 < 나의 결합상품 < 나의 가입 정보 < MyT
 * @author 양정규
 * @since 2019.10.10
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import MyTHelper from '../../../../utils/myt.helper';

/**
 * @class
 * @desc 총적용가입기간 상세 팝업
 */
export default class MyTJoinMyPlanCombineJoinPeriod extends TwViewController {
  constructor() {
    super();
  }

  private res: any;
  private renderCommonInfo: any;

  /**
   * @desc 화면 랜더링
   * @param req
   * @param res
   * @param _next
   * @param svcInfo
   * @param _allSvc
   * @param _childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const prodId = req.query.prodId;
    this.renderCommonInfo = {
      pageInfo,
      svcInfo
    };
    this.res = res;
    if (!prodId) {  // prodId 없는 경우 에러 페이지 랜딩
      return this.errorRender();
    }

    this.apiService.request(API_CMD.BFF_05_0134, {}, {}, [prodId]).subscribe(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return this.errorRender(resp);
      }

      res.render('myplancombine/myt-join.myplancombine.joinperiod.html', {
        ...this.renderCommonInfo,
        combination: this.parseData(resp.result)
      });
    });
  }

  /**
   * @desc 데이터 파싱
   * @param combination 결합상품 상세 수신값
   */
  private parseData(combination): any {
    const _parse = (item: any) => {
      Object.assign(item, {
        totJoinPeriod: MyTHelper.getPeriod({yy: item.uyy, mm: item.umm}), // 총 가입기간
        totExcludePeriod: MyTHelper.getPeriod({yy: item.totMYy, mm: item.totMMm}), // 총 제외기간
        useYy: MyTHelper.getPeriod({yy: item.useYy}) // 적용가입기간
      });
    };

    // 무선정보
    combination.combinationWirelessMemberList.forEach(item => {
      item.svcNum = StringHelper.phoneStringToDash(item.svcNum); // 휴대폰 번호
      _parse(item);
    });

    // 유선정보
    combination.combinationWireMemberList.map(item => _parse(item));
    return combination;
  }

  /**
   * @desc 공통에러처리
   * @param resp
   */
  private errorRender(resp?): any {
    return this.error.render(this.res, {
      ...this.renderCommonInfo,
      ...resp
    });
  }
}
