/**
 * @file customer.main.controller.ts
 * @author 박지만 (jiman.park@sk.com)
 * @since 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { combineLatest } from 'rxjs/observable/combineLatest';
import BrowserHelper from '../../../../utils/browser.helper';
import { REDIS_KEY } from '../../../../types/redis.type';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/observable';

interface Notice {
  content: Array<{
    [key: string]: string
  }>;
}

interface Banners {
  expsSeq: number;
  titleNm: string;
  imgUrl: string;
  imgAltCtt: string;
  dtlBtnUseYn: 'Y' | 'N';
  contsList?: Array<{
    contsSeq: number;
    contsId: string;
    contsNm: string;
  }>;
}
class CustomerMain extends TwViewController {
  private bannersNumber: number;

  constructor() {
    super();
    this.bannersNumber = 5; // 배너 갯수 5
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any): void {
    combineLatest(
      this.getBanners(),
      this.getNotice(req),
      this.getResearch()
    ).subscribe(([banners, notice, researchList]) => {
      const noticeList = this.parseNoticeList(BrowserHelper.isApp(req), notice);
      res.render('main/customer.main.html', {
        svcInfo: svcInfo,
        banners: this.exceptNullObject(banners),
        pageInfo: pageInfo,
        noticeList: noticeList,
        isApp: BrowserHelper.isApp(req),
        researchList: researchList
      });
    });
  }

  private parseNoticeList = (isApp: boolean, notice: Notice) => isApp ? notice.content.splice(0, 3) : notice.content.splice(0, 6);

  private exceptNullObject = (banners: Array<Banners | null>): Array<Banners | null> => {
    const resultData: Array<Banners | null> = [];
    if (banners && banners.length) {
      banners.map(banner => {
        if (banner !== null) {
          resultData.push(banner);        
        }
      }) ;
    }
    return resultData;
  };

  // GET BANNER THROUGH BFF SERVER
  /*private getBanners = () => this.apiService.request(API_CMD.BFF_08_0066, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    })*/

  // TODO: NOT YET VERIFIED: NOTICE API -> REDIS DATA from <doohj1@sk.com> by SMS 1weeks ago
  // TODO: IF REDIS OPTION IS ENABLE AS ONE CALL, IT COULD BE USED
  private getBanners = () => this.redisService.getData(REDIS_KEY.BANNER_ADMIN + 'M000673')
    .map((resp) => {
      return resp.result ? resp.result.banners : [];
    });

  // GETBANNER CURRENT REDIS FUNCTION SHOULD CALL 1 ~ N BRING EACH VARIABLES, SO IT SHOULD USE THIS
  /*private getBanners = (): Observable<Banners | any> => combineLatest(this.setBannersNumber(this.bannersNumber)).pipe( map (x => x));

  private setBannersNumber = (num: number): any => Array(num).fill(0).map((_, index) => this.getRedisBanner(index + 1));
  
  private getRedisBanner = (num: number) => this.redisService.getData(REDIS_KEY.SUBMAIN_BANNER + num)
    .map((resp) => {
      return resp.result;
    })*/
  // REDIS BANNER ENDED

  private getResearch = () => this.apiService.request(API_CMD.BFF_08_0025, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    });

  private getNotice = (req) => {
    const expsChnlCd = this._getTworldChannel(req);

    return this.apiService.request(API_CMD.BFF_08_0029, {
      expsChnlCd: expsChnlCd,
      ntcAreaClCd: 'M'
    }).map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    });
  };

  private _getTworldChannel(req): any {
    if ( BrowserHelper.isAndroid(req) ) {
      return 'A';
    }

    if ( BrowserHelper.isIos(req) ) {
      return 'I';
    }

    return 'M';
  }
}

export default CustomerMain;
