import TwRouter from '../../common/route/tw.router';
import MyTUsage from './controllers/myt.usage.controller';

class MytRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new MyTUsage() });
  }
}

export default MytRouter;
