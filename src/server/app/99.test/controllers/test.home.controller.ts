/**
 * FileName: test.home.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.22
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import {
  HOME_SMART_CARD,
  LINE_NAME,
  SVC_ATTR_E,
  SVC_ATTR_NAME,
  UNIT,
  UNIT_E,
  MYT_FARE_BILL_CO_TYPE
} from '../../../types/bff.type';
import DateHelper from '../../../utils/date.helper';
import { REDIS_KEY } from '../../../types/redis.type';

class TestHome extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const svcType = this.getSvcType(svcInfo);
    const homeData = {
      usageData: null,
      membershipData: null,
      billData: null,
      ppsInfo: null,
      joinInfo: null
    };
    let smartCard = [];

    if ( svcType.login ) {
      svcInfo = this.parseSvcInfo(svcType, svcInfo);
      if ( svcType.mobile ) {
        smartCard = this.getSmartCardOrder(svcInfo.svcMgmtNum);
        this.getNotice().subscribe((notice) => {
          const testHomeData = {
            usageData:
              {
                data:
                  {
                    skipId: 'DD2N7',
                    skipName: '데이터서비스 이용 음성통화',
                    total: '163840',
                    used: '0',
                    remained: '163840',
                    unit: '140',
                    couponDate: '',
                    isUnlimit: false,
                    remainedRatio: 100,
                    showUsed: { data: '0', unit: 'KB' },
                    showTotal: { data: '160', unit: 'MB' },
                    showRemained: { data: '160', unit: 'MB' }
                  },
                voice:
                  {
                    skipId: 'DD2N6',
                    skipName: '망외 음성 및 영상 통화 100분',
                    total: '6000',
                    used: '296',
                    remained: '5704',
                    unit: '240',
                    couponDate: '',
                    isUnlimit: false,
                    remainedRatio: 95.06666666666666,
                    showUsed: { hours: 0, min: 4, sec: 56 },
                    showTotal: { hours: 1, min: 40, sec: 0 },
                    showRemained: { hours: 1, min: 35, sec: 4 }
                  },
                sms:
                  {
                    skipId: 'DD2N4',
                    skipName: 'SMS/MMS/ⓜ메신저 기본제공',
                    total: '기본제공',
                    used: '기본제공',
                    remained: '기본제공',
                    unit: '310',
                    couponDate: '',
                    isUnlimit: true,
                    remainedRatio: 100,
                    showUsed: '기본제공'
                  },
                first: 'data',
                code: '00'
              },
            membershipData:
              {
                mbrGrCd: 'V',
                mbrCardNum: '249618**********',
                mbrUsedAmt: '93700',
                custNm: '임*린',
                mbrTypCd: '5',
                mbrStCd: 'AC',
                showUsedAmount: '93,700'
              },
            billData: null,
            ppsInfo: null,
            joinInfo: null
          };
          res.render('test.home.html', { svcInfo, svcType, homeData: testHomeData, smartCard, notice, pageInfo });
        });
      } else {
        this.getNotice().subscribe((notice) => {
          res.render('test.home.html', { svcInfo, svcType, homeData, smartCard, notice, pageInfo });
        });
      }
    } else {
      this.getNotice().subscribe((notice) => {
        res.render('test.home.html', { svcInfo, svcType, homeData, smartCard, notice, pageInfo });
      });
    }
  }

  private getSmartCardOrder(svcMgmtNum): any {
    return ['00001', '00002', '00003', '00004', '00005'];
  }

  private getSvcType(svcInfo): any {
    const svcType = {
      svcCategory: LINE_NAME.MOBILE,
      mobile: false,
      login: false
    };

    if ( !FormatHelper.isEmpty(svcInfo) ) {
      svcType.login = true;
      if ( svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE ) {
        svcType.mobile = true;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.INTERNET || svcInfo.svcAttrCd === SVC_ATTR_E.IPTV || svcInfo.svcAttrCd === SVC_ATTR_E.TELEPHONE ) {
        svcType.svcCategory = LINE_NAME.INTERNET_PHONE_IPTV;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.POINT_CAM ) {
        svcType.svcCategory = LINE_NAME.SECURITY;
      }
    }

    return svcType;
  }

  private getNotice(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.APP_VERSION)
      .map((result) => {
        if ( !FormatHelper.isEmpty((result)) ) {
          return result.notice;
        }
        return null;
      });
  }

  private parseSvcInfo(svcType, svcInfo): any {
    svcInfo.showName = FormatHelper.isEmpty(svcInfo.nickNm) ? SVC_ATTR_NAME[svcInfo.svcAttrCd] : svcInfo.nickNm;
    svcInfo.showSvc = svcType.svcCategory === LINE_NAME.INTERNET_PHONE_IPTV ? svcInfo.addr : svcInfo.svcNum;
    return svcInfo;
  }


}

export default TestHome;
