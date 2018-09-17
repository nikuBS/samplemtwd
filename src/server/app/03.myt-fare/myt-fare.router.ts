import TwRouter from '../../common/route/tw.router';
import MytFareBillGuide from './controllers/bill/myt-fare.bill.guide.controllers';
import MyTFareBillSet from './controllers/bill/myt-fare.bill.set.controller';
import MyTFarePayment from './controllers/payment/myt-fare.payment';

class MytFareRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/bill/guide', controller: new MytFareBillGuide() });
    this.controllers.push({ url: '/bill/set', controller: new MyTFareBillSet() });
    this.controllers.push({ url: '/payment/main', controller: new MyTFarePayment() });
  }
}

export default MytFareRouter;
