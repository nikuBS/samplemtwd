/**
 * MenuName: T멤버십 > 제휴브랜드
 * FileName: membership.benefit.brand.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.12.21
 * Summary: 제휴브랜드 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { T_MEMBERSHIP_BENEFIT_BRAND } from '../../../../types/string.type';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class MembershipBenefitBrand extends TwViewController {
  private VIEW = {
    DEFAULT: 'benefit/membership.benefit.brand.html'
  };
  private ICO_GRD_CHK_CD = {
    V: 'vip',
    G: 'gold',
    S: 'silver',
    A: 'all'
  };
  private PAGE_NO: number = 1;
  private PAGE_SIZE: number = 20;
  private cateCd;
  private ordCol;
  private subTabCd;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.cateCd = req.query.cateCd || '00'; // 전체순
    this.ordCol = req.query.ordCol || 'L';  // 좋아요순
    this.subTabCd = req.query.subTabCd || '';  // 전체 등급

    Observable.combineLatest(
      this.reqCateList(),
      this.reqBrandList(),
      this.reqMembershipInfo()
    ).subscribe(([respCateList, respBrandList, respMembershipInfo]) => {
      const apiError = this.error.apiError([
        respCateList, respBrandList
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const cateList = this.getCateList(respCateList);
      const brandResult = this.getBrandResult(respBrandList);
      const brandList = brandResult.list;
      const brandTotalCnt = brandResult.totalCnt;
      const hasMore = brandResult.hasMore;

      const options = {
        svcInfo,
        pageInfo,
        cateList,
        brandList,
        brandTotalCnt,
        hasMore,
        isLogin: !FormatHelper.isEmpty(svcInfo),
        selectedCateCd: this.cateCd,
        selectedSubTabCd: this.subTabCd,
        noMembership: false
      };

      // 멤버십 미소지
      if ( respMembershipInfo.code === 'MBR0001' || respMembershipInfo.code === 'MBR0002' ) {
        options['noMembership'] = true;
      }

      res.render(this.VIEW.DEFAULT, options);
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  private getResult(resp: any): any {
    return resp.result;
  }

  /**
   * 카테고리 목록 조회
   * @private
   * return Observable
   */
  private reqCateList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0016, {});
  }

  /**
   * 제휴브랜드 목록 조회
   * @private
   * return Observable
   */
  private reqBrandList(): Observable<any> {
    const params = {
      pageNo: this.PAGE_NO,
      pageSize: this.PAGE_SIZE,
      cateCd: this.cateCd,
      ordCol: this.ordCol
    };
    if (this.cateCd === '00') {
      params['subTabCd'] = this.subTabCd;
    }
    return this.apiService.request(API_CMD.BFF_11_0017, params);
  }

  /**
   * 나의 멤버십 정보 조회
   * @private
   * return Observable
   */
  private reqMembershipInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0001, {});
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: T_MEMBERSHIP_BENEFIT_BRAND.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo
    });
  }

  /**
   * 카테고리 목록 데이터 가공후 반환
   * @private
   * return categories{Array}
   */
  private getCateList(resp: any): any {
    const categories = this.getResult(resp);
    categories.map((category, _idx) => {
      const idx = FormatHelper.leadingZeros(++_idx, 2);
      category.showImgUrl = '/img/benefit/ico-category' + idx + '.png';
    });
    return categories;
  }

  /**
   * 제휴브랜드 목록 데이터 가공후 반환
   * @private
   * return result{Object}
   */
  private getBrandResult(resp: any): any {
    const self = this;
    const result = this.getResult(resp);
    const list = result.list;
    const charsToArr = (chars) => {
      return chars.split('').map((char) => {
        return self.ICO_GRD_CHK_CD[char];
      });
    };
    list.map((item) => {
      item.showIcoGrdChk1 = charsToArr(item.icoGrdChk1);
      item.showIcoGrdChk2 = charsToArr(item.icoGrdChk2);
      item.showIcoGrdChk3 = charsToArr(item.icoGrdChk3);
      item.showIcoGrdChk4 = charsToArr(item.icoGrdChk4);
      item.showTotLikeCount = FormatHelper.addComma(item.totLikeCount);
    });
    result.hasMore = parseInt(result.totalCnt, 10) > this.PAGE_SIZE * this.PAGE_NO;
    return result;
  }
}

export default MembershipBenefitBrand;
