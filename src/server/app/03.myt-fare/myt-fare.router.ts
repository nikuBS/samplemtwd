import TwRouter from '../../common/route/tw.router';
import MyTFareBillGuide from './controllers/bill/myt-fare.bill.guide.controllers';
import MyTFareBillSet from './controllers/bill/myt-fare.bill.set.controller';
import MyTFarePayment from './controllers/payment/myt-fare.payment';

import MyTFareBillSetReturnHistory from './controllers/bill/myt-fare.bill.set.return-history.controller';
import MyTFarePaymentAuto from './controllers/payment/myt-fare.payment.auto';
import MytFarePaymentAccount from './controllers/payment/myt-fare.payment.account';
import MytFarePaymentCard from './controllers/payment/myt-fare.payment.card';
import MytFarePaymentPoint from './controllers/payment/myt-fare.payment.point';
import MytFarePaymentSms from './controllers/payment/myt-fare.payment.sms';

class MytFareRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: new HomeMain() });
    this.controllers.push({ url: '/bill/guide', controller: new MyTFareBillGuide() });
    this.controllers.push({ url: '/bill/set', controller: new MyTFareBillSet() });
    this.controllers.push({ url: '/payment/main', controller: new MyTFarePayment() });
    this.controllers.push({ url: '/payment/auto', controller: new MyTFarePaymentAuto() });
    this.controllers.push({ url: '/payment/account', controller: new MytFarePaymentAccount() });
    this.controllers.push({ url: '/payment/card', controller: new MytFarePaymentCard() });
    this.controllers.push({ url: '/payment/point', controller: new MytFarePaymentPoint() });
    this.controllers.push({ url: '/payment/sms', controller: new MytFarePaymentSms() });
    this.controllers.push({ url: '/bill/set/return-history', controller: new MyTFareBillSetReturnHistory() });
  }
}

export default MytFareRouter;
