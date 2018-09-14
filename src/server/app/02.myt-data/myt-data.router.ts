import TwRouter from '../../common/route/tw.router';
import MyTDataUsage from './controllers/usage/myt-data.usage.controller';
import MytDataGift from './controllers/gift/myt-data.gift.controller';
import MytDataTing from './controllers/ting/myt-data.ting.controller';
import MytDataLimit from './controllers/limit/myt-data.limit.controller';
import MytDataCookiz from './controllers/cookiz/myt-data.cookiz.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/usage', controller: new MyTDataUsage() });
    this.controllers.push({ url: '/gift', controller: new MytDataGift() });
    this.controllers.push({ url: '/ting', controller: new MytDataTing() });
    this.controllers.push({ url: '/limit', controller: new MytDataLimit() });
    this.controllers.push({ url: '/cookiz', controller: new MytDataCookiz() });
  }
}

export default MytDataRouter;
