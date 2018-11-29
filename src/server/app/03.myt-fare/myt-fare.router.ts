import TwRouter from '../../common/route/tw.router';
import MyTFareSubMain from './myt-fare.submain.controller';
import MyTFareBillGuide from './controllers/billguide/myt-fare.bill.guide.controllers';
import MyTFareBillSet from './controllers/bill/myt-fare.bill.set.controller';
import MyTFareBillSetReissue from './controllers/bill/myt-fare.bill.set.reissue.controller';
import MyTFareBillSetReturnHistory from './controllers/bill/myt-fare.bill.set.return-history.controller';
import MytFareHotbill from './controllers/bill/myt-fare.bill.hotbill.controller';
import MyTFareBillSetChange from './controllers/bill/myt-fare.bill.set.change.controller';
import MyTFareBillGuideCallGift from './controllers/billguide/myt-fare.bill.guide.call-gift.controllers';
import MyTFareBillGuideRoaming from './controllers/billguide/myt-fare.bill.guide.roaming.controllers';
import MyTFareBillGuideDonation from './controllers/billguide/myt-fare.bill.guide.donation.controllers';
import MyTFareSubMainNonBill from './controllers/submain/myt-fare.submain.non-paymt';
import MyTFareHistory from './controllers/history/myt-fare.history.controller';
import MyTFareBillContentsHistory from './controllers/billcontents/myt-fare.bill.contents.history.controller';
import MyTFareBillContentsHistortDetail from './controllers/billcontents/myt-fare.bill.contents.history.detail.controller';
import MyTFareInfoHistory from './controllers/info/myt-fare.info.history.controller';
import MyTFareInfoHistoryDetail from './controllers/info/myt-fare.info.history.detail.controller';
import MyTFareInfoBillCash from './controllers/info/myt-fare.info.bill-cash.controller';
import MyTFareInfoBillTax from './controllers/info/myt-fare.info.bill-tax.controller';
import MyTFareInfoOverpayRefund from './controllers/info/myt-fare.info.overpay-refund.controller';
import MyTFareBillAccount from './controllers/bill/myt-fare.bill.account.controller';
import MyTFareBillCard from './controllers/bill/myt-fare.bill.card.controller';
import MyTFareBillPoint from './controllers/bill/myt-fare.bill.point.controller';
import MyTFareBillSms from './controllers/bill/myt-fare.bill.sms.controller';
import MyTFareBillCashbag from './controllers/bill/myt-fare.bill.cashbag.controller';
import MyTFareBillTPoint from './controllers/bill/myt-fare.bill.tpoint.controller';
import MyTFareBillRainbow from './controllers/bill/myt-fare.bill.rainbow.controller';
import MyTFareBillOption from './controllers/bill/myt-fare.bill.option.controller';
import MyTFareBillAutoRegister from './controllers/bill/myt-fare.bill.auto.register.controller';
import MyTFareBillSmall from './controllers/billsmall/myt-fare.bill.small.controller';
import MyTFareBillSmallAuto from './controllers/billsmall/myt-fare.bill.small.auto.controller';
import MyTFareBillSmallAutoInfo from './controllers/billsmall/myt-fare.bill.small.auto.info.controller';
import MyTFareBillSmallAutoChange from './controllers/billsmall/myt-fare.bill.small.auto.change.controller';
import MyTFareBillContents from './controllers/billcontents/myt-fare.bill.contents.controller';
import MyTFareBillContentsAuto from './controllers/billcontents/myt-fare.bill.contents.auto.controller';
import MyTFareBillContentsAutoInfo from './controllers/billcontents/myt-fare.bill.contents.auto.info.controller';
import MyTFareBillContentsAutoChange from './controllers/billcontents/myt-fare.bill.contents.auto.change.controller';
import MyTFareBillPayComplete from './controllers/bill/myt-fare.bill.pay-complete.controller';
import MyTFareBillPointComplete from './controllers/bill/myt-fare.bill.point-complete.controller';

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
    this.controllers.push({ url: '/bill/option', controller: MyTFareBillOption });
    this.controllers.push({ url: '/bill/auto/register', controller: MyTFareBillAutoRegister });
    this.controllers.push({ url: '/bill/pay-complete', controller: MyTFareBillPayComplete });
    this.controllers.push({ url: '/bill/point-complete', controller: MyTFareBillPointComplete });

    // 소액결제
    this.controllers.push({ url: '/bill/small', controller: MyTFareBillSmall });
    this.controllers.push({ url: '/bill/small/auto', controller: MyTFareBillSmallAuto });
    this.controllers.push({ url: '/bill/small/auto/info', controller: MyTFareBillSmallAutoInfo });
    this.controllers.push({ url: '/bill/small/auto/change', controller: MyTFareBillSmallAutoChange });

    // 콘텐츠이용내역
    this.controllers.push({ url: '/bill/contents', controller: MyTFareBillContents });
    this.controllers.push({ url: '/bill/contents/auto', controller: MyTFareBillContentsAuto });
    this.controllers.push({ url: '/bill/contents/auto/info', controller: MyTFareBillContentsAutoInfo });
    this.controllers.push({ url: '/bill/contents/auto/change', controller: MyTFareBillContentsAutoChange });

    // 실시간 이용요금
    this.controllers.push({ url: '/bill/hotbill', controller: MytFareHotbill });

    // 소액결제, 컨텐츠 이용료 상세내역
    this.controllers.push({ url: '/bill/small/history', controller: MyTFareHistory });
    this.controllers.push({ url: '/bill/small/monthly', controller: MyTFareHistory });
    this.controllers.push({ url: '/bill/small/block', controller: MyTFareHistory });
    this.controllers.push({ url: '/bill/small/history/detail', controller: MyTFareHistory });

    this.controllers.push({ url: '/bill/contents/history', controller: MyTFareBillContentsHistory });
    this.controllers.push({ url: '/bill/contents/monthly', controller: MyTFareHistory });
    this.controllers.push({ url: '/bill/contents/history/detail', controller: MyTFareBillContentsHistortDetail });

    // 납부내역
    this.controllers.push({ url: '/info/history', controller: MyTFareInfoHistory });
    this.controllers.push({ url: '/info/history/detail', controller: MyTFareInfoHistoryDetail });

    this.controllers.push({ url: '/info/bill-tax', controller: MyTFareInfoBillTax });
    this.controllers.push({ url: '/info/bill-cash', controller: MyTFareInfoBillCash });
    this.controllers.push({ url: '/info/overpay-refund', controller: MyTFareInfoOverpayRefund });
    this.controllers.push({ url: '/info/overpay-refund/detail', controller: MyTFareInfoOverpayRefund });

    // new url
    this.controllers.push({ url: '/submain(/usagefee)?', controller: MyTFareSubMain });
    this.controllers.push({ url: '/unbill', controller: MyTFareSubMainNonBill });
    this.controllers.push({ url: '/billguide/guide', controller: MyTFareBillGuide });
    this.controllers.push({ url: '/billguide/callgift', controller: MyTFareBillGuideCallGift });
    this.controllers.push({ url: '/billguide/roaming', controller: MyTFareBillGuideRoaming });
    this.controllers.push({ url: '/billguide/donation', controller: MyTFareBillGuideDonation });
    this.controllers.push({ url: '/billsetup', controller: MyTFareBillSet });
    this.controllers.push({ url: '/billsetup/reissue', controller: MyTFareBillSetReissue });
    this.controllers.push({ url: '/billsetup/historyreturn', controller: MyTFareBillSetReturnHistory });
    this.controllers.push({ url: '/billsetup/change', controller: MyTFareBillSetChange });
    this.controllers.push({ url: '/hotbill', controller: MytFareHotbill });
    this.controllers.push({ url: '/hotbill/child', controller: MytFareHotbill });
    this.controllers.push({ url: '/hotbill/prev', controller: MytFareHotbill });
  }
}

export default MytFareRouter;
