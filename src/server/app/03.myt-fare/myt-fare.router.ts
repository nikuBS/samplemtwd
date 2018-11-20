import TwRouter from '../../common/route/tw.router';
import MyTFareSubMain from './myt-fare.submain.controller';
import MyTFareBillGuide from './controllers/bill/myt-fare.bill.guide.controllers';
import MyTFareBillSet from './controllers/bill/myt-fare.bill.set.controller';
import MyTFareBillSetReissue from './controllers/bill/myt-fare.bill.set.reissue.controller';
import MyTFareBillSetReturnHistory from './controllers/bill/myt-fare.bill.set.return-history.controller';
import MyTFareBillauto from './controllers/billauto/myt-fare.billauto.controller';
import MytFareHotbill from './controllers/bill/myt-fare.bill.hotbill.controller';
import MyTFareBillSetChange from './controllers/bill/myt-fare.bill.set.change.controller';
import MyTFareBillGuideCallGift from './controllers/bill/myt-fare.bill.guide.call-gift.controllers';
import MyTFareBillGuideRoaming from './controllers/bill/myt-fare.bill.guide.roaming.controllers';
import MyTFareBillGuideDonation from './controllers/bill/myt-fare.bill.guide.donation.controllers';
import MyTFareSubMainNonBill from './controllers/submain/myt-fare.submain.non-paymt';
import MyTFareHistory from './controllers/history/myt-fare.history.controller';
import MyTFarePaymentHistory from './controllers/history/myt-fare.payment.history.controller';
import MyTFarePaymentHistoryDetail from './controllers/history/myt-fare.payment.history.detail.controller';
import MyTFareBillHistory from './controllers/history/myt-fare.bill-history.controller';
import MyTFareOverpayRefund from './controllers/history/myt-fare.overpay-refund.controller';
import MyTFareBillAccount from './controllers/bill/myt-fare.bill.account.controller';
import MyTFareBillCard from './controllers/bill/myt-fare.bill.card.controller';
import MyTFareBillPoint from './controllers/bill/myt-fare.bill.point.controller';
import MyTFareBillSms from './controllers/bill/myt-fare.bill.sms.controller';
import MyTFareBillCashbag from './controllers/bill/myt-fare.bill.cashbag.controller';
import MyTFareBillTPoint from './controllers/bill/myt-fare.bill.tpoint.controller';
import MyTFareBillRainbow from './controllers/bill/myt-fare.bill.rainbow.controller';
import MyTFareBillsmall from './controllers/billsmall/myt-fare.billsmall.controller';
import MyTFareBillsmallAuto from './controllers/billsmall/myt-fare.billsmall.auto.controller';
import MyTFareBillsmallAutoInfo from './controllers/billsmall/myt-fare.billsmall.auto.info.controller';
import MyTFareBillsmallAutoChange from './controllers/billsmall/myt-fare.billsmall.auto.change.controller';
import MyTFareBillcontents from './controllers/billcontents/myt-fare.billcontents.controller';
import MyTFareBillcontentsAuto from './controllers/billcontents/myt-fare.billcontents.auto.controller';
import MyTFareBillcontentsAutoInfo from './controllers/billcontents/myt-fare.billcontents.auto.info.controller';
import MyTFareBillcontentsAutoChange from './controllers/billcontents/myt-fare.billcontents.auto.change.controller';
import MyTFareBillautoRegister from './controllers/billauto/myt-fare.billauto.register.controller';

class MytFareRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTFareSubMain });
    this.controllers.push({ url: '/nonbill', controller: MyTFareSubMainNonBill });

    // 요금납부
    this.controllers.push({ url: '/bill/account', controller: MyTFareBillAccount });
    this.controllers.push({ url: '/bill/card', controller: MyTFareBillCard });
    this.controllers.push({ url: '/bill/point', controller: MyTFareBillPoint });
    this.controllers.push({ url: '/bill/sms', controller: MyTFareBillSms });
    this.controllers.push({ url: '/bill/cashbag', controller: MyTFareBillCashbag });
    this.controllers.push({ url: '/bill/tpoint', controller: MyTFareBillTPoint });
    this.controllers.push({ url: '/bill/rainbow', controller: MyTFareBillRainbow });

    // 자동납부
    this.controllers.push({ url: '/billauto', controller: MyTFareBillauto });
    this.controllers.push({ url: '/billauto/register', controller: MyTFareBillautoRegister });

    // 소액결제
    this.controllers.push({ url: '/billsmall', controller: MyTFareBillsmall });
    this.controllers.push({ url: '/billsmall/auto', controller: MyTFareBillsmallAuto });
    this.controllers.push({ url: '/billsmall/auto/info', controller: MyTFareBillsmallAutoInfo });
    this.controllers.push({ url: '/billsmall/auto/change', controller: MyTFareBillsmallAutoChange });

    // 콘텐츠이용내역
    this.controllers.push({ url: '/billcontents', controller: MyTFareBillcontents });
    this.controllers.push({ url: '/billcontents/auto', controller: MyTFareBillcontentsAuto });
    this.controllers.push({ url: '/billcontents/auto/info', controller: MyTFareBillcontentsAutoInfo });
    this.controllers.push({ url: '/billcontents/auto/change', controller: MyTFareBillcontentsAutoChange });

    //
    this.controllers.push({ url: '/bill/guide', controller: MyTFareBillGuide });
    this.controllers.push({ url: '/bill/guide/call-gift', controller: MyTFareBillGuideCallGift });
    this.controllers.push({ url: '/bill/guide/roaming', controller: MyTFareBillGuideRoaming });
    this.controllers.push({ url: '/bill/guide/donation', controller: MyTFareBillGuideDonation });
    this.controllers.push({ url: '/bill/hotbill', controller: MytFareHotbill });

    // 소액결제, 컨텐츠 이용료 상세내역
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
    this.controllers.push({ url: '/submain(/usagefee)', controller: MyTFareSubMain });
    this.controllers.push({ url: '/unbill', controller: MyTFareSubMainNonBill });
    this.controllers.push({ url: '/bill/guide', controller: MyTFareBillGuide });
    this.controllers.push({ url: '/bill/guide/call-gift', controller: MyTFareBillGuideCallGift });
    this.controllers.push({ url: '/bill/guide/roaming', controller: MyTFareBillGuideRoaming });
    this.controllers.push({ url: '/bill/guide/donation', controller: MyTFareBillGuideDonation });
    this.controllers.push({ url: '/billsetup', controller: MyTFareBillSet });
    this.controllers.push({ url: '/billsetup/reissue', controller: MyTFareBillSetReissue });
    this.controllers.push({ url: '/billsetup/historyreturn', controller: MyTFareBillSetReturnHistory });
    this.controllers.push({ url: '/billsetup/change', controller: MyTFareBillSetChange });
    this.controllers.push({ url: '/hotbill', controller: MytFareHotbill });
  }
}

export default MytFareRouter;
