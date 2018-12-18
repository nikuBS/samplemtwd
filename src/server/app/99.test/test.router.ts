import TwRouter from '../../common/route/tw.router';
import TestHome from './controllers/test.home.controller';
import TestMyTDataSubmainController from './controllers/test.myt-data.submain.controller';
import TestMyTFareSubmainController from './controllers/test.myt-fare.submain.controller';
import TestMyTFareUnbill from './controllers/submain/test.myt-fare.submain.non-paymt';
import TestCustomerSvcInfoNoticeTworld from './controllers/test.customer.svc-info.notice.tworld.controller';
import TestCustomerSvcInfoNoticeTworldNohyst from './controllers/test.customer.svc-info.notice.tworld.nohyst.controller';
import TestMyTDataInfo from './controllers/test.myt-data.datainfo.controller';
import TestMainMenuController from './controllers/test.main.menu.controller';
import TestLoginController from './controllers/test.login.controller';
import TestLogoutController from './controllers/test.logout.controller';
import TestCertSmsController from './controllers/test.cert-sms.controller';

class TestRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/main/home', controller: TestHome });
    this.controllers.push({ url: '/myt-data/submain', controller: TestMyTDataSubmainController });
    this.controllers.push({ url: '/myt-fare/submain', controller: TestMyTFareSubmainController });
    this.controllers.push({ url: '/myt-fare/unbill', controller: TestMyTFareUnbill });
    this.controllers.push({ url: '/customer/svc-info/notice(/tworld)?', controller: TestCustomerSvcInfoNoticeTworld });
    this.controllers.push({ url: '/customer/svc-info/notice/tworld/nohyst', controller: TestCustomerSvcInfoNoticeTworldNohyst });
    this.controllers.push({ url: '/myt-data/datainfo', controller: TestMyTDataInfo });
    this.controllers.push({ url: '/main/menu', controller: TestMainMenuController });
    this.controllers.push({ url: '/login', controller: TestLoginController });
    this.controllers.push({ url: '/logout', controller: TestLogoutController });
    this.controllers.push({ url: '/cert-sms', controller: TestCertSmsController });
  }
}

export default TestRouter;
