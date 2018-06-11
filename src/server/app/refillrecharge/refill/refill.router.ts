import TwRouter from '../../../common/route/tw.router';
import Refill from './controllers/refill.controller';
import RefillHistory from './controllers/refill.history.controller';

class RefillRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/refill', controller: new Refill() });
    this.controllers.push({ url: '/refillHistory', controller: new RefillHistory() });
  }
}

export default RefillRouter;
