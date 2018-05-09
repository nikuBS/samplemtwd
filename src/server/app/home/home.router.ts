import HomeMainController from './controllers/home.main.controller';
import TwRouter from '../../common/route/tw.router';

class HomeRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new HomeMainController() });
  }
}

export default HomeRouter;
