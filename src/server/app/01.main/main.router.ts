import TwRouter from '../../common/route/tw.router';
import MainHome from './controllers/main.home.controller';
import MainTNotify from './controllers/main.t-notify.controller';
import MainMenu from './controllers/main.menu.controller';
import MainSearch from './controllers/main.search.controller';

class MainRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/home', controller: MainHome });
    this.controllers.push({ url: '/t-notify', controller: MainTNotify });
    this.controllers.push({ url: '/menu', controller: MainMenu });
    this.controllers.push({ url: '/search', controller: MainSearch });
  }
}

export default MainRouter;
