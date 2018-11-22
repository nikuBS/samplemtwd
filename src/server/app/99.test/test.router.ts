import TwRouter from '../../common/route/tw.router';
import TestHome from './controllers/test.home.controller';

class TestRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/main/home', controller: TestHome });
  }
}

export default TestRouter;
