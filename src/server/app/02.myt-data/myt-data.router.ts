import TwRouter from '../../common/route/tw.router';
import MytDataGift from './controllers/gift/myt-data.gift.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/gift', controller: new MytDataGift() });
  }
}

export default MytDataRouter;
