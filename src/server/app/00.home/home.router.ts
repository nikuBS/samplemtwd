import TwRouter from '../../common/route/tw.router';
import HomeMain from './controllers/home.main.controller';
import HomeMenu from './controllers/home.menu.sprint3.controller';
import PostcodeMain from './controllers/postcode/postcode.main.controller';
import HomeMainSprint3 from './controllers/home.main.sprint3.controller';

class HomeRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new HomeMain() });
    this.controllers.push({ url: '/menu', controller: new HomeMenu() });
    this.controllers.push({ url: '/postcode', controller: new PostcodeMain() });
    this.controllers.push({ url: '/sprint3', controller: new HomeMainSprint3() });
  }
}

export default HomeRouter;
