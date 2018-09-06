import TwRouter from '../../common/route/tw.router';
import Home from './controllers/home.controller';

class HomeRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/new', controller: new Home() });
  }
}

export default HomeRouter;
