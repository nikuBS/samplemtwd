import { Request } from 'express';
import BrowserHelper from './browser.helper';
import { DEVICE_CODE } from '../types/redis.type';
import DateHelper from './date.helper';

export default class RedisHelper {
  public static getBrowserType = (req: Request) => {
    return BrowserHelper.isApp(req) ? (BrowserHelper.isAndroid(req) ? DEVICE_CODE.ANDROID : DEVICE_CODE.IOS) : DEVICE_CODE.MWEB;
  }

  public static sortBanners = (req: Request, banners: any[] = []) => {
    const browserCode = RedisHelper.getBrowserType(req);
    return banners
      .filter(banner => {
        return (
          (banner.chnlClCd.includes(DEVICE_CODE.MOBILE) || banner.chnlClCd.includes(browserCode)) &&
          DateHelper.getDifference(banner.expsStaDtm.substring(0, 8)) <= 0 &&
          DateHelper.getDifference(banner.expsEndDtm.substring(0, 8)) >= 0
        );
      })
      .sort((a, b) => {
        return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
      });
  }
}
