/**
 * 이용안내 > 이용자피해예방센터 > 이용자 피해예방 가이드
 * FileName: customer.damage-info.guide.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PROTECT_GUIDE } from '../../../../types/string.type';
import { CUSTOMER_PROTECT_GUIDE_WEBTOON } from '../../../../types/static.type';
import { CUSTOMER_PROTECT_GUIDE_LATEST, CUSTOMER_PROTECT_GUIDE_VIDEO } from '../../../../types/outlink.type';

class CustomerDamagenfoGuide extends TwViewController {
  constructor() {
    super();
  }

  // 허용되는 카테고리 종류
  private _allowedCategoryList = ['video', 'latest', 'webtoon'];

  // 카테고리 별 목록 선언
  private _categoryLists = {
    video: CUSTOMER_PROTECT_GUIDE_VIDEO,  // 동영상으로 보는 피해예방법
    latest: CUSTOMER_PROTECT_GUIDE_LATEST,  // 웹툰으로 보는 피해예방법
    webtoon: CUSTOMER_PROTECT_GUIDE_WEBTOON // 최신 이용자 피해예방 정보
  };

  /**
   * 목록 변환
   * @param category
   * @param guideList
   * @param listMaxSize
   * @private
   */
  private _convertList(category, guideList, listMaxSize): any {
    if (category === 'webtoon') { // 웹툰 리스트는 유형이 달라서 다른 메소드에서 처리
      return this._convertWebtoonList(guideList, listMaxSize);
    }

    // 전체를 다 불러오기 때문에 일부를 숨기기 위한 처리
    return guideList.map((item, i) => {
      return Object.assign(item, {
        itemClass: i >= listMaxSize ? 'none' : ''
      });
    });
  }

  /**
   * 웹툰 목록 변환
   * @param guideList
   * @param listMaxSize
   * @private
   */
  private _convertWebtoonList(guideList, listMaxSize): any {
    const deepCopyList: any = JSON.parse(JSON.stringify(guideList)).reverse();

    // 전체를 다 불러오기 때문에 일부를 숨기기 위한 처리
    return deepCopyList.map((item, i) => {
      return Object.assign(item, {
        idx: (deepCopyList.length - 1) - i,
        itemClass: i >= listMaxSize ? 'none' : ''
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const category = req.query.category || 'video', // 카테고리 값 셋팅. 없으면 기본값 동영상으로 보는 피해예방법
      listMaxSize = 20, // 목록 1페이지당 20개
      renderCommonInfo = {
        svcInfo: svcInfo, // 사용자 정보
        pageInfo: pageInfo, // 페이지 정보
        title: CUSTOMER_PROTECT_GUIDE[category.toUpperCase()] // 페이지 제목
      };

    // 허용된 카테고리 값이 아닐 경우 오류 페이지 연결
    if (this._allowedCategoryList.indexOf(category) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    res.render('damage-info/customer.damage-info.guide.html', Object.assign(renderCommonInfo, {
      category: category, // 카테고리 값
      categoryLabel: CUSTOMER_PROTECT_GUIDE[category.toUpperCase()],  // 카테고리 값에 대한 텍스트
      list: this._convertList(category, this._categoryLists[category], listMaxSize),  // 목록
      listMaxSize: listMaxSize  // 페이지당 개수 - client 에서 더보기 처리를 위한 전달
    }));
  }
}

export default CustomerDamagenfoGuide;
