import TwRouter from '../../../common/route/tw.router';
import Gift from './controllers/gift.controller';
import GiftHistory from './controllers/gift.history.controller';

class GiftRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/gift', controller: new Gift() });
    this.controllers.push({ url: '/giftHistory', controller: new GiftHistory() });
  }
}

export default GiftRouter;
