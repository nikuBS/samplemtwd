import TwRouter from '../../common/route/tw.router';
import HomeMain from './controllers/home.main.controller';
import HomeMenu from './controllers/home.menu.controller';

class HomeRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new HomeMain() });
    this.controllers.push({ url: '/menu', controller: new HomeMenu() });
  }
}

export default HomeRouter;
