import TwRouter from '../../common/route/tw.router';
import HomeMainController from './controllers/home.main.controller';
import HomeMenuController from './controllers/home.menu.controller';

class HomeRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new HomeMainController() });
    this._controllers.push({ url: '/menu', controller: new HomeMenuController() });
  }
}

export default HomeRouter;
