import TwRouter from '../../common/route/tw.router';
import MainHome from './controllers/main.home.controller';
import MainTNotify from './controllers/main.t-notify.controller';
import MainMenu from './controllers/main.menu.controller';
import MainSearch from './controllers/main.search.controller';

class MainRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/home', controller: new MainHome() });
    this.controllers.push({ url: '/t-notify', controller: new MainTNotify() });
    this.controllers.push({ url: '/menu', controller: new MainMenu() });
    this.controllers.push({ url: '/search', controller: new MainSearch() });
  }
}

export default MainRouter;
