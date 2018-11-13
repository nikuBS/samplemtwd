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
import MyTFarePaymentMicroAutoInfo from './controllers/payment/myt-fare.payment.micro.auto.info.controller';
import MyTFarePaymentContents from './controllers/payment/myt-fare.payment.contents.controller';
import MyTFarePaymentContentsAuto from './controllers/payment/myt-fare.payment.contents.auto.controller';
import MyTFarePaymentContentsAutoInfo from './controllers/payment/myt-fare.payment.contents.auto.info.controller';
import MyTFarePaymentContentsAutoChange from './controllers/payment/myt-fare.payment.contents.auto.change.controller';
import MyTFareHistory from './controllers/history/myt-fare.history.controller';
import MyTFarePaymentHistory from './controllers/history/myt-fare.payment.history.controller';
import MyTFarePaymentHistoryDetail from './controllers/history/myt-fare.payment.history.detail.controller';
import MyTFareBillHistory from './controllers/history/myt-fare.bill-history.controller';
import MyTFareOverpayRefund from './controllers/history/myt-fare.overpay-refund.controller';
import MyTFarePaymentCashbag from './controllers/payment/myt-fare.payment.cashbag.controller';
import MyTFarePaymentTPoint from './controllers/payment/myt-fare.payment.tpoint.controller';
import MyTFarePaymentRainbow from './controllers/payment/myt-fare.payment.rainbow.controller';

class MytFareRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTFareSubMain });
    this.controllers.push({ url: '/nonpayment', controller: MyTFareSubMainNonPayment });
    this.controllers.push({ url: '/bill/guide', controller: MyTFareBillGuide });
    this.controllers.push({ url: '/bill/guide/call-gift', controller: MyTFareBillGuideCallGift });
    this.controllers.push({ url: '/bill/guide/roaming', controller: MyTFareBillGuideRoaming });
    this.controllers.push({ url: '/bill/guide/donation', controller: MyTFareBillGuideDonation });
    this.controllers.push({ url: '/bill/set', controller: MyTFareBillSet });
    this.controllers.push({ url: '/bill/set/reissue', controller: MyTFareBillSetReissue });
    this.controllers.push({ url: '/payment/option', controller: MyTFarePaymentOption });
    this.controllers.push({ url: '/payment/auto', controller: MyTFarePaymentAuto });
    this.controllers.push({ url: '/payment/account', controller: MyTFarePaymentAccount });
    this.controllers.push({ url: '/payment/card', controller: MyTFarePaymentCard });
    this.controllers.push({ url: '/payment/point', controller: MyTFarePaymentPoint });
    this.controllers.push({ url: '/payment/sms', controller: MyTFarePaymentSms });
    this.controllers.push({ url: '/payment/cashbag', controller: MyTFarePaymentCashbag });
    this.controllers.push({ url: '/payment/tpoint', controller: MyTFarePaymentTPoint });
    this.controllers.push({ url: '/payment/rainbow', controller: MyTFarePaymentRainbow });
    this.controllers.push({ url: '/payment/micro', controller: MyTFarePaymentMicro });
    this.controllers.push({ url: '/payment/micro/auto', controller: MyTFarePaymentMicroAuto });
    this.controllers.push({ url: '/payment/micro/auto/info', controller: MyTFarePaymentMicroAutoInfo });
    this.controllers.push({ url: '/payment/micro/auto/change', controller: MyTFarePaymentMicroAutoChange });
    this.controllers.push({ url: '/payment/contents', controller: MyTFarePaymentContents });
    this.controllers.push({ url: '/payment/contents/auto', controller: MyTFarePaymentContentsAuto });
    this.controllers.push({ url: '/payment/contents/auto/info', controller: MyTFarePaymentContentsAutoInfo });
    this.controllers.push({ url: '/payment/contents/auto/change', controller: MyTFarePaymentContentsAutoChange });
    this.controllers.push({ url: '/bill/set/return-history', controller: MyTFareBillSetReturnHistory });
    this.controllers.push({ url: '/bill/set/change', controller: MyTFareBillSetChange });
    this.controllers.push({ url: '/bill/set/complete', controller: MyTFareBillSetComplete });
    this.controllers.push({ url: '/bill/hotbill', controller: MytFareHotbill });

    // 소액결제, 컨텐츠 이용료
    this.controllers.push({ url: '/billsmall/history', controller: MyTFareHistory });
    this.controllers.push({ url: '/billsmall/monthly', controller: MyTFareHistory });
    this.controllers.push({ url: '/billsmall/block', controller: MyTFareHistory });
    this.controllers.push({ url: '/billsmall/history/detail', controller: MyTFareHistory });

    this.controllers.push({ url: '/billcontents/history', controller: MyTFareHistory });
    this.controllers.push({ url: '/billcontents/monthly', controller: MyTFareHistory });
    this.controllers.push({ url: '/billcontents/detail', controller: MyTFareHistory });

    // 납부내역
    this.controllers.push({ url: '/info/history', controller: MyTFarePaymentHistory });
    this.controllers.push({ url: '/info/history/detail', controller: MyTFarePaymentHistoryDetail });

    this.controllers.push({ url: '/info/bill-tax', controller: MyTFareBillHistory });
    this.controllers.push({ url: '/info/bill-cash', controller: MyTFareBillHistory });
    this.controllers.push({ url: '/info/overpay-refund', controller: MyTFareOverpayRefund });
    this.controllers.push({ url: '/info/overpay-refund/detail', controller: MyTFareOverpayRefund });

    // new url
    this.controllers.push({ url: '/submain', controller: MyTFareSubMain });
    this.controllers.push({ url: '/nonpayment', controller: MyTFareSubMainNonPayment });
    this.controllers.push({ url: '/bill/guide', controller: MyTFareBillGuide });
    this.controllers.push({ url: '/bill/guide/call-gift', controller: MyTFareBillGuideCallGift });
    this.controllers.push({ url: '/bill/guide/roaming', controller: MyTFareBillGuideRoaming });
    this.controllers.push({ url: '/bill/guide/donation', controller: MyTFareBillGuideDonation });
    this.controllers.push({ url: '/bill/set', controller: MyTFareBillSet });
    this.controllers.push({ url: '/bill/set/reissue', controller: MyTFareBillSetReissue });
    this.controllers.push({ url: '/billsetup/historyreturn', controller: MyTFareBillSetReturnHistory });
    this.controllers.push({ url: '/billsetup/change', controller: MyTFareBillSetChange });
    this.controllers.push({ url: '/hotbill', controller: MytFareHotbill });
  }
}

export default MytFareRouter;
