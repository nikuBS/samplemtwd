import TwRouter from '../../common/route/tw.router';
import MyTDataSubMain from './myt-data.submain.controller';
import MyTDataUsage from './controllers/usage/myt-data.usage.controller';
import MyTDataUsageChild from './controllers/usage/myt-data.usage.child.controller';
import MyTDataUsageTotalSharingData from './controllers/usage/myt-data.usage.total-sharing-data.controller';
import MyTDataUsageCancelTshare from './controllers/usage/myt-data.usage.cancel-tshare.controller';
import MyTDataRechargeCoupon from './controllers/recharge/myt-data.recharge.coupon.controller';
import MyTDataTing from './controllers/ting/myt-data.ting.controller';
import MyTDataGift from './controllers/gift/myt-data.gift.controller';
import MyTDataLimit from './controllers/limit/myt-data.limit.controller';
import MyTDataCookiz from './controllers/cookiz/myt-data.cookiz.controller';
import MyTDataInfo from './controllers/datainfo/myt-data.datainfo.controller';
import MyTDataFamily from './controllers/familydata/myt-data.familydata.controller';
import MyTDataPrepaid from './controllers/prepaid/myt-data.prepaid.controller';
import MyTDataPrepaidHistory from './controllers/prepaid/myt-data.prepaid.history.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTDataSubMain });
    this.controllers.push({ url: '/giftdata(/:page)?', controller: MyTDataGift });
    this.controllers.push({ url: '/ting(/:page)?', controller: MyTDataTing });
    this.controllers.push({ url: '/limit(/:page)?', controller: MyTDataLimit });
    this.controllers.push({ url: '/cookiz(/:page)?', controller: MyTDataCookiz });
    this.controllers.push({ url: '/recharge/coupon(/:page)?', controller: MyTDataRechargeCoupon });

    // new url
    this.controllers.push({ url: '/familydata(/share)?', controller: MyTDataFamily });
    this.controllers.push({ url: '/datainfo', controller: MyTDataInfo });
    this.controllers.push({ url: '/submain', controller: MyTDataSubMain });
    this.controllers.push({ url: '/submain/child-hotdata(/:childSvcMgmtNum)?', controller: MyTDataUsageChild });
    this.controllers.push({ url: '/hotdata', controller: MyTDataUsage });
    this.controllers.push({ url: '/hotdata/total-sharing', controller: MyTDataUsageTotalSharingData });
    this.controllers.push({ url: '/hotdata/cancel-tshare', controller: MyTDataUsageCancelTshare });
    this.controllers.push({ url: '/recharge/prepaid/history', controller: MyTDataPrepaidHistory });
    this.controllers.push({ url: '/recharge/prepaid(/:page)?', controller: MyTDataPrepaid });
  }
}

export default MytDataRouter;
