import TwRouter from '../../common/route/tw.router';
import MyTUsageController from './controllers/myt.usage.controller';

class MytRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new MyTUsageController() });
  }
}

export default MytRouter;
