import TwRouter from '../../common/route/tw.router';
import Home from './controllers/home.controller';
import TNotify from './controllers/t-notify.controller';
import Menu from './controllers/menu.controller';
import Search from './controllers/search.controller';

class HomeRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new Home() });
    this.controllers.push({ url: '/t-notify', controller: new TNotify() });
    this.controllers.push({ url: '/menu', controller: new Menu() });
    this.controllers.push({ url: '/search', controller: new Search() });
  }
}

export default HomeRouter;
