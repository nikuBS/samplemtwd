import TwRouter from '../../common/route/tw.router';
import MyTMainController from './controllers/myt.usage.controller';

class MytRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new MyTMainController() });
  }
}

export default MytRouter;
