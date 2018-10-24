import TwRouter from '../../common/route/tw.router';
import MyTDataSubMain from './myt-data.submain.controller';
import MyTDataUsage from './controllers/usage/myt-data.usage.controller';
import MyTDataUsageChild from './controllers/usage/myt-data.usage.child.controller';
import MyTDataUsageTotalSharingData from './controllers/usage/myt-data.usage.total-sharing-data.controller';
import MyTDataRechargeCoupon from './controllers/recharge/myt-data.recharge.coupon.controller';
import MyTDataTing from './controllers/ting/myt-data.ting.controller';
import MyTDataGift from './controllers/gift/myt-data.gift.controller';
import MyTDataLimit from './controllers/limit/myt-data.limit.controller';
import MyTDataCookiz from './controllers/cookiz/myt-data.cookiz.controller';
import MyTDataRechargeHistory from './controllers/recharge/myt-data.recharge.history.controller';
import MyTDataFamily from './controllers/family/myt-data.family.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTDataSubMain });
    this.controllers.push({ url: '/usage', controller: MyTDataUsage });
    this.controllers.push({ url: '/usage/child(/:childSvcMgmtNum)?', controller: MyTDataUsageChild });
    this.controllers.push({ url: '/usage/total-sharing-data', controller: MyTDataUsageTotalSharingData });
    this.controllers.push({ url: '/recharge/history', controller: MyTDataRechargeHistory });
    this.controllers.push({ url: '/gift(/:page)?', controller: MyTDataGift });
    this.controllers.push({ url: '/ting(/:page)?', controller: MyTDataTing });
    this.controllers.push({ url: '/limit(/:page)?', controller: MyTDataLimit });
    this.controllers.push({ url: '/cookiz(/:page)?', controller: MyTDataCookiz });
    this.controllers.push({ url: '/family(/:page)?', controller: MyTDataFamily });
    this.controllers.push({ url: '/recharge/coupon(/:page)?', controller: MyTDataRechargeCoupon });
  }
}

export default MytDataRouter;
