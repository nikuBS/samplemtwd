import TwRouter from '../../common/route/tw.router';
import MyTFareSubMain from './myt-fare.submain.controller';
import MyTFareBillGuide from './controllers/bill/myt-fare.bill.guide.controllers';
import MyTFareBillSet from './controllers/bill/myt-fare.bill.set.controller';
import MyTFareBillSetReissue from './controllers/bill/myt-fare.bill.set.reissue.controller';
import MyTFareBillSetReturnHistory from './controllers/bill/myt-fare.bill.set.return-history.controller';
import MyTFarePaymentAuto from './controllers/payment/myt-fare.payment.auto.controller';
import MyTFarePaymentAccount from './controllers/payment/myt-fare.payment.account.controller';
import MyTFarePaymentCard from './controllers/payment/myt-fare.payment.card.controller';
import MyTFarePaymentPoint from './controllers/payment/myt-fare.payment.point.controller';
import MyTFarePaymentSms from './controllers/payment/myt-fare.payment.sms.controller';
import MytFareHotbill from './controllers/bill/myt-fare.bill.hotbill.controller';
import MyTFareBillSetChange from './controllers/bill/myt-fare.bill.set.change.controller';
import MyTFareBillGuideCallGift from './controllers/bill/myt-fare.bill.guide.call-gift.controllers';
import MyTFareBillGuideRoaming from './controllers/bill/myt-fare.bill.guide.roaming.controllers';
import MyTFareBillGuideDonation from './controllers/bill/myt-fare.bill.guide.donation.controllers';
import MyTFareSubMainNonPayment from './controllers/submain/myt-fare.submain.non-paymt';
import MyTFarePaymentOption from './controllers/payment/myt-fare.payment.option.controller';
import MyTFarePaymentMicro from './controllers/payment/myt-fare.payment.micro.controller';
import MyTFarePaymentMicroAuto from './controllers/payment/myt-fare.payment.micro.auto.controller';
import MyTFarePaymentMicroAutoChange from './controllers/payment/myt-fare.payment.micro.auto.change.controller';
import MyTFareBillSetComplete from './controllers/bill/myt-fare.bill.set.complete.controller';

class MytFareRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new MyTFareSubMain() });
    this.controllers.push({ url: '/nonpayment', controller: new MyTFareSubMainNonPayment() });
    this.controllers.push({ url: '/bill/guide', controller: new MyTFareBillGuide() });
    this.controllers.push({ url: '/bill/guide/call-gift', controller: new MyTFareBillGuideCallGift() });
    this.controllers.push({ url: '/bill/guide/roaming', controller: new MyTFareBillGuideRoaming() });
    this.controllers.push({ url: '/bill/guide/donation', controller: new MyTFareBillGuideDonation() });
    this.controllers.push({ url: '/bill/set', controller: new MyTFareBillSet() });
    this.controllers.push({ url: '/bill/set/reissue', controller: new MyTFareBillSetReissue() });
    this.controllers.push({ url: '/payment/option', controller: new MyTFarePaymentOption() });
    this.controllers.push({ url: '/payment/auto', controller: new MyTFarePaymentAuto() });
    this.controllers.push({ url: '/payment/account', controller: new MyTFarePaymentAccount() });
    this.controllers.push({ url: '/payment/card', controller: new MyTFarePaymentCard() });
    this.controllers.push({ url: '/payment/point', controller: new MyTFarePaymentPoint() });
    this.controllers.push({ url: '/payment/sms', controller: new MyTFarePaymentSms() });
    this.controllers.push({ url: '/payment/micro', controller: new MyTFarePaymentMicro() });
    this.controllers.push({ url: '/payment/micro/auto', controller: new MyTFarePaymentMicroAuto() });
    this.controllers.push({ url: '/payment/micro/auto/change', controller: new MyTFarePaymentMicroAutoChange() });
    this.controllers.push({ url: '/bill/set/return-history', controller: new MyTFareBillSetReturnHistory() });
    this.controllers.push({ url: '/bill/set/change', controller: new MyTFareBillSetChange() });
    this.controllers.push({ url: '/bill/set/complete', controller: new MyTFareBillSetComplete() });
    this.controllers.push({ url: '/bill/hotbill', controller: new MytFareHotbill() });
  }
}

export default MytFareRouter;
