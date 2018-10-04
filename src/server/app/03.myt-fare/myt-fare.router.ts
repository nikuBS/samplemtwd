import TwRouter from '../../common/route/tw.router';
import MyTFareSubMain from './myt-fare.submain.controller';
import MyTFareBillGuide from './controllers/bill/myt-fare.bill.guide.controllers';
import MyTFareBillSet from './controllers/bill/myt-fare.bill.set.controller';
import MyTFareBillSetReissue from './controllers/bill/myt-fare.bill.set.reissue.controller';
import MyTFareBillSetReturnHistory from './controllers/bill/myt-fare.bill.set.return-history.controller';
import MyTFarePaymentAuto from './controllers/payment/myt-fare.payment.auto.controller';
import MytFarePaymentAccount from './controllers/payment/myt-fare.payment.account.controller';
import MytFarePaymentCard from './controllers/payment/myt-fare.payment.card.controller';
import MytFarePaymentPoint from './controllers/payment/myt-fare.payment.point.controller';
import MytFarePaymentSms from './controllers/payment/myt-fare.payment.sms.controller';
import MytFareHotbill from './controllers/bill/myt-fare.bill.hotbill.controller';
import MyTFareBillSetChange from './controllers/bill/myt-fare.bill.set.change.controller';
import MyTFareBillGuideCallGift from './controllers/bill/myt-fare.bill.guide.call-gift.controllers';
import MyTFareBillGuideRoaming from './controllers/bill/myt-fare.bill.guide.roaming.controllers';
import MyTFareBillGuideDonation from './controllers/bill/myt-fare.bill.guide.donation.controllers';
import MyTFareSubMainNonPayment from './controllers/submain/myt-fare.submain.non-paymt';
import MytFarePaymentOption from './controllers/payment/myt-fare.payment.option.controller';
import MytFarePaymentMicro from './controllers/payment/myt-fare.payment.micro.controller';


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
    this.controllers.push({ url: '/payment/option', controller: new MytFarePaymentOption() });
    this.controllers.push({ url: '/payment/auto', controller: new MyTFarePaymentAuto() });
    this.controllers.push({ url: '/payment/account', controller: new MytFarePaymentAccount() });
    this.controllers.push({ url: '/payment/card', controller: new MytFarePaymentCard() });
    this.controllers.push({ url: '/payment/point', controller: new MytFarePaymentPoint() });
    this.controllers.push({ url: '/payment/sms', controller: new MytFarePaymentSms() });
    this.controllers.push({ url: '/payment/micro', controller: new MytFarePaymentMicro() });
    this.controllers.push({ url: '/bill/set/return-history', controller: new MyTFareBillSetReturnHistory() });
    this.controllers.push({ url: '/bill/set/change', controller: new MyTFareBillSetChange() });
    this.controllers.push({ url: '/bill/hotbill', controller: new MytFareHotbill() });
  }
}

export default MytFareRouter;
