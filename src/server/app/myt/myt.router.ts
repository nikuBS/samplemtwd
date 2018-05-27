import TwRouter from '../../common/route/tw.router';
import MyTMainController from './controllers/myt.main.controller';

class MytRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new MyTMainController() });
  }
}

export default MytRouter;
