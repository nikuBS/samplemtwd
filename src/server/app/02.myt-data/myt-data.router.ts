import TwRouter from '../../common/route/tw.router';
import MyTDataUsage from './controllers/usage/myt-data.usage.controller';
import MytDataGift from './controllers/gift/myt-data.gift.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/usage', controller: new MyTDataUsage() });
    this.controllers.push({ url: '/gift', controller: new MytDataGift() });
  }
}

export default MytDataRouter;
