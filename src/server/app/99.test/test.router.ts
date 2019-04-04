import TwRouter from '../../common/route/tw.router';
import TestLoginController from './controllers/test.login.controller';
import TestLogoutController from './controllers/test.logout.controller';

class TestRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/main/home', controller: TestHome });
    // this.controllers.push({ url: '/myt-data/submain', controller: TestMyTDataSubmainController });
    // this.controllers.push({ url: '/myt-fare/submain', controller: TestMyTFareSubmainController });
    // this.controllers.push({ url: '/myt-fare/unbill', controller: TestMyTFareUnbill });
    // this.controllers.push({ url: '/customer/svc-info/notice(/tworld)?', controller: TestCustomerSvcInfoNoticeTworld });
    // this.controllers.push({ url: '/customer/svc-info/notice/tworld/nohyst', controller: TestCustomerSvcInfoNoticeTworldNohyst });
    // this.controllers.push({ url: '/myt-data/datainfo', controller: TestMyTDataInfo });
    // this.controllers.push({ url: '/main/menu', controller: TestMainMenuController });
    this.controllers.push({ url: '/login', controller: TestLoginController });
    this.controllers.push({ url: '/logout', controller: TestLogoutController });
    // this.controllers.push({ url: '/cert-sms', controller: TestCertSmsController });
  }
}

export default TestRouter;
