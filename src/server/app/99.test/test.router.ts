import TwRouter from '../../common/route/tw.router';
import TestHome from './controllers/test.home.controller';
import TestMyTDataSubmainController from './controllers/test.myt-data.submain.controller';
import TestMyTFareSubmainController from './controllers/test.myt-fare.submain.controller';
import TestMyTFareUnbill from './controllers/submain/test.myt-fare.submain.non-paymt';

class TestRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/main/home', controller: TestHome });
    this.controllers.push({ url: '/myt-data/submain', controller: TestMyTDataSubmainController });
    this.controllers.push({ url: '/myt-fare/submain', controller: TestMyTFareSubmainController });
    this.controllers.push({ url: '/myt-fare/unbill', controller: TestMyTFareUnbill });
  }
}

export default TestRouter;
