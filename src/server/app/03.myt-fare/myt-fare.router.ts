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
import MyTFareBillSmallHistory from './controllers/billsmall/myt-fare.bill.small.history.controller';
import MyTFareBillSmallMonthly from './controllers/billsmall/myt-fare.bill.small.monthly.controller';
import MyTFareBillSmallBlock from './controllers/billsmall/myt-fare.bill.small.block.controller';
import MyTFareBillContentsHistory from './controllers/billcontents/myt-fare.bill.contents.history.controller';
import MyTFareBillContentsMonthly from './controllers/billcontents/myt-fare.bill.contents.monthly.controller';
import MyTFareInfoHistory from './controllers/info/myt-fare.info.history.controller';
import MyTFareInfoHistoryDetail from './controllers/info/myt-fare.info.history.detail.controller';
import MyTFareInfoBillCash from './controllers/info/myt-fare.info.bill-cash.controller';
import MyTFareInfoBillTax from './controllers/info/myt-fare.info.bill-tax.controller';
import MyTFareInfoBillTaxSendFax from './controllers/info/myt-fare.info.bill-tax.send-fax.controller';
import MyTFareInfoBillTaxSendEmail from './controllers/info/myt-fare.info.bill-tax.send-email.controller';
import MyTFareInfoOverpayAccount from './controllers/info/myt-fare.info.overpay-account.controller';
import MyTFareInfoOverpayRefund from './controllers/info/myt-fare.info.overpay-refund.controller';
import MyTFareInfoOverpayRefundDetail from './controllers/info/myt-fare.info.overpay-refund.detail.controller';
import MyTFareInfoCancelDraw from './controllers/info/myt-fare.info.cancel-draw.controller';
import MyTFareBillAccount from './controllers/bill/myt-fare.bill.account.controller';
import MyTFareBillCard from './controllers/bill/myt-fare.bill.card.controller';
import MyTFareBillPoint from './controllers/bill/myt-fare.bill.point.controller';
import MyTFareBillSms from './controllers/bill/myt-fare.bill.sms.controller';
import MyTFareBillCashbag from './controllers/bill/myt-fare.bill.cashbag.controller';
import MyTFareBillTPoint from './controllers/bill/myt-fare.bill.tpoint.controller';
import MyTFareBillRainbow from './controllers/bill/myt-fare.bill.rainbow.controller';
import MyTFareBillOption from './controllers/bill/myt-fare.bill.option.controller';
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
import MyTFareBillGuideChild from './controllers/billguide/myt-fare.bill.guide.child.controllers';
import MyTFareBillOptionCancel from './controllers/bill/myt-fare.bill.option.cancel.controller';
import MyTFareBillOptionCancelComplete from './controllers/bill/myt-fare.bill.option.cancel-complete.controller';
import MyTFareBillOptionSms from './controllers/bill/myt-fare.bill.option.sms.controller';
import MyTFareBillOptionRegister from './controllers/bill/myt-fare.bill.option.register.controller';
import MyTFareBillOptionChangeAddress from './controllers/bill/myt-fare.bill.option.change-address.controller';
import MyTFareBillSkpayManage from './controllers/bill/myt-fare.bill.skpay.manage.controller';
import MyTFareBillSkpayResult from './controllers/bill/myt-fare.bill.skpay.result.controller';
import MyTFareBillSkpay from './controllers/bill/myt-fare.bill.skpay.controller';
import MyTFareBillSkpayAgree from './controllers/bill/myt-fare.bill.skpay.agree.controller';
import MyTFareBillSmallPrepay from './controllers/billsmall/myt-fare.bill.small.prepay.controller';
import MyTFareBillContentsPrepay from './controllers/billcontents/myt-fare.bill.contents.prepay.controller';
import MyTFareBillSmallSKpay from './controllers/billsmall/myt-fare.bill.small.skpay.controller';
import MyTFareBillContentsSKpay from './controllers/billcontents/myt-fare.bill.contents.skpay.controller';
import MyTFareBillSkpayResultPrepay from './controllers/bill/myt-fare.bill.skpay.result.prepay.controller';
import MyTFareBillPrepayAccount from './controllers/bill/myt-fare.bill.prepay-account.controller';

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
    this.controllers.push({ url: '/bill/option/change-address', controller: MyTFareBillOptionChangeAddress });
    this.controllers.push({ url: '/bill/option/register', controller: MyTFareBillOptionRegister });
    this.controllers.push({ url: '/bill/option/cancel', controller: MyTFareBillOptionCancel });
    this.controllers.push({ url: '/bill/option/sms', controller: MyTFareBillOptionSms });
    this.controllers.push({ url: '/bill/option/cancel-complete', controller: MyTFareBillOptionCancelComplete });
    this.controllers.push({ url: '/bill/pay-complete', controller: MyTFareBillPayComplete });
    this.controllers.push({ url: '/bill/point-complete', controller: MyTFareBillPointComplete });

    // 소액결제
    this.controllers.push({ url: '/bill/small', controller: MyTFareBillSmall });
    this.controllers.push({ url: '/bill/small/prepay', controller: MyTFareBillSmallPrepay });
    this.controllers.push({ url: '/bill/small/auto', controller: MyTFareBillSmallAuto });
    this.controllers.push({ url: '/bill/small/auto/info', controller: MyTFareBillSmallAutoInfo });
    this.controllers.push({ url: '/bill/small/auto/change', controller: MyTFareBillSmallAutoChange });
    this.controllers.push({ url: '/bill/small/skpay', controller: MyTFareBillSmallSKpay });
    this.controllers.push({ url: '/bill(/:page)?/prepay-account', controller: MyTFareBillPrepayAccount });

    // 콘텐츠이용내역
    this.controllers.push({ url: '/bill/contents', controller: MyTFareBillContents });
    this.controllers.push({ url: '/bill/contents/prepay', controller: MyTFareBillContentsPrepay });
    this.controllers.push({ url: '/bill/contents/auto', controller: MyTFareBillContentsAuto });
    this.controllers.push({ url: '/bill/contents/auto/info', controller: MyTFareBillContentsAutoInfo });
    this.controllers.push({ url: '/bill/contents/auto/change', controller: MyTFareBillContentsAutoChange });
    this.controllers.push({ url: '/bill/contents/skpay', controller: MyTFareBillContentsSKpay });

    // 소액결제, 컨텐츠 이용료 상세내역
    this.controllers.push({ url: '/bill/small/history', controller: MyTFareBillSmallHistory });
    this.controllers.push({ url: '/bill/small/monthly', controller: MyTFareBillSmallMonthly });
    this.controllers.push({ url: '/bill/small/block', controller: MyTFareBillSmallBlock });

    this.controllers.push({ url: '/bill/contents/history', controller: MyTFareBillContentsHistory });
    this.controllers.push({ url: '/bill/contents/monthly', controller: MyTFareBillContentsMonthly });

    // 납부내역
    this.controllers.push({ url: '/info/history', controller: MyTFareInfoHistory });
    this.controllers.push({ url: '/info/history/detail', controller: MyTFareInfoHistoryDetail });

    this.controllers.push({ url: '/info/bill-tax', controller: MyTFareInfoBillTax });
    this.controllers.push({ url: '/info/bill-tax/send-fax', controller: MyTFareInfoBillTaxSendFax });
    this.controllers.push({ url: '/info/bill-tax/send-email', controller: MyTFareInfoBillTaxSendEmail });
    this.controllers.push({ url: '/info/bill-cash', controller: MyTFareInfoBillCash });
    this.controllers.push({ url: '/info/overpay-account', controller: MyTFareInfoOverpayAccount });
    this.controllers.push({ url: '/info/overpay-refund', controller: MyTFareInfoOverpayRefund });
    this.controllers.push({ url: '/info/overpay-refund/detail', controller: MyTFareInfoOverpayRefundDetail });
    this.controllers.push({ url: '/info/cancel-draw', controller: MyTFareInfoCancelDraw });

    // new url
    this.controllers.push({ url: '/submain', controller: MyTFareSubMain });
    this.controllers.push({ url: '/unbill', controller: MyTFareSubMainNonBill });
    this.controllers.push({ url: '/billguide/guide', controller: MyTFareBillGuide });
    this.controllers.push({ url: '/billguide/child', controller: MyTFareBillGuideChild });
    this.controllers.push({ url: '/billguide/callgift', controller: MyTFareBillGuideCallGift });
    this.controllers.push({ url: '/billguide/roaming', controller: MyTFareBillGuideRoaming });
    this.controllers.push({ url: '/billguide/donation', controller: MyTFareBillGuideDonation });
    this.controllers.push({ url: '/billsetup', controller: MyTFareBillSet });
    this.controllers.push({ url: '/billsetup/reissue', controller: MyTFareBillSetReissue });
    this.controllers.push({ url: '/billsetup/historyreturn', controller: MyTFareBillSetReturnHistory });
    this.controllers.push({ url: '/billsetup/change', controller: MyTFareBillSetChange });

    // 실시간 이용요금
    this.controllers.push({ url: '/bill/hotbill', controller: MytFareHotbill });
    this.controllers.push({ url: '/bill/hotbill/child', controller: MytFareHotbill });
    this.controllers.push({ url: '/bill/hotbill/prev', controller: MytFareHotbill });

    // 간편결제 SK PAY
    this.controllers.push({ url: '/bill/skpay', controller: MyTFareBillSkpay });
    this.controllers.push({ url: '/bill/skpay/agree', controller: MyTFareBillSkpayAgree });
    this.controllers.push({ url: '/bill/skpay/manage', controller: MyTFareBillSkpayManage });
    this.controllers.push({ url: '/bill/skpay/result', controller: MyTFareBillSkpayResult, post: true });
    this.controllers.push({ url: '/bill/skpay/result/prepay', controller: MyTFareBillSkpayResultPrepay, post: true });
  }
}

export default MytFareRouter;
