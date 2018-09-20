import TwRouter from '../../common/route/tw.router';
import MyTSubMain from './myt-data.submain.controller';
import MyTDataUsage from './controllers/usage/myt-data.usage.controller';
import MyTDataRefillCoupon from './controllers/refill/myt-data.refill.coupon.controller';
import MyTDataUsageChild from './controllers/usage/myt-data.usage.child.controller';
import MyTDataTing from './controllers/ting/myt-data.ting.controller';
import MyTDataGift from './controllers/gift/myt-data.gift.controller';
import MyTDataLimit from './controllers/limit/myt-data.limit.controller';
import MyTDataCookiz from './controllers/cookiz/myt-data.cookiz.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new MyTSubMain() });
    this.controllers.push({ url: '/usage', controller: new MyTDataUsage() });
    this.controllers.push({ url: '/usage/child(/:childSvcMgmtNum)?', controller: new MyTDataUsageChild() });
    this.controllers.push({ url: '/gift(/:page)?', controller: new MyTDataGift() });
    this.controllers.push({ url: '/ting(/:page)?', controller: new MyTDataTing() });
    this.controllers.push({ url: '/limit(/:page)?', controller: new MyTDataLimit() });
    this.controllers.push({ url: '/cookiz(/:page)?', controller: new MyTDataCookiz() });
    this.controllers.push({ url: '/refill/coupon(/:page)?', controller: new MyTDataRefillCoupon() });
  }
}

export default MytDataRouter;
