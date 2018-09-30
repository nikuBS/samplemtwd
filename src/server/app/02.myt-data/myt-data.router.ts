import TwRouter from '../../common/route/tw.router';
import MyTDataSubMain from './myt-data.submain.controller';
import MyTDataUsage from './controllers/usage/myt-data.usage.controller';
import MyTDataRechargeCoupon from './controllers/recharge/myt-data.recharge.coupon.controller';
import MyTDataUsageChild from './controllers/usage/myt-data.usage.child.controller';
import MyTDataTing from './controllers/ting/myt-data.ting.controller';
import MyTDataGift from './controllers/gift/myt-data.gift.controller';
import MyTDataLimit from './controllers/limit/myt-data.limit.controller';
import MyTDataCookiz from './controllers/cookiz/myt-data.cookiz.controller';
import MyTDataRechargeHistory from './controllers/recharge/myt-data.recharge.history.controller';
import MyTDataFamily from './controllers/family/myt-data.family.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new MyTDataSubMain() });
    this.controllers.push({ url: '/usage', controller: new MyTDataUsage() });
    this.controllers.push({ url: '/usage/child(/:childSvcMgmtNum)?', controller: new MyTDataUsageChild() });
    this.controllers.push({ url: '/recharge/history', controller: new MyTDataRechargeHistory() });
    this.controllers.push({ url: '/gift(/:page)?', controller: new MyTDataGift() });
    this.controllers.push({ url: '/ting(/:page)?', controller: new MyTDataTing() });
    this.controllers.push({ url: '/limit(/:page)?', controller: new MyTDataLimit() });
    this.controllers.push({ url: '/cookiz(/:page)?', controller: new MyTDataCookiz() });
    this.controllers.push({ url: '/family(/:page)?', controller: new MyTDataFamily() });
    this.controllers.push({ url: '/recharge/coupon(/:page)?', controller: new MyTDataRechargeCoupon() });
  }
}

export default MytDataRouter;
