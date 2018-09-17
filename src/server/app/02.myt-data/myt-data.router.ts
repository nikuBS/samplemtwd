import TwRouter from '../../common/route/tw.router';
import MyTSubMain from './myt-data.submain.controller';
import MyTDataUsage from './controllers/usage/myt-data.usage.controller';
import MytDataGift from './controllers/gift/myt-data.gift.controller';
import MytDataTing from './controllers/ting/myt-data.ting.controller';
import MytDataLimit from './controllers/limit/myt-data.limit.controller';
import MytDataCookiz from './controllers/cookiz/myt-data.cookiz.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new MyTSubMain() });
    this.controllers.push({ url: '/usage', controller: new MyTDataUsage() });
    this.controllers.push({ url: '/gift(/:page)?', controller: new MytDataGift() });
    this.controllers.push({ url: '/ting(/:page)?', controller: new MytDataTing() });
    this.controllers.push({ url: '/limit(/:page)?', controller: new MytDataLimit() });
    this.controllers.push({ url: '/cookiz(/:page)?', controller: new MytDataCookiz() });
  }
}

export default MytDataRouter;
