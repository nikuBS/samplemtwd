import TwRouter from '../../common/route/tw.router';
import PaymentRealtime from './controllers/payment.realtime.controller';
import PaymentAuto from './controllers/payment.auto.controller';
import PaymentPoint from './controllers/payment.point.controller';
import PaymentHistory from './controllers/payment.history.controller';
import PaymentHistoryRealtime from './controllers/payment.history.realtime.controller';
import PaymentHistoryAuto from './controllers/payment.history.auto.controller';
import PaymentHistoryAutoUnitedWithdrawal from './controllers/payment.history.auto.united-withdrawal.controller';
import PaymentHistoryPointReserve from './controllers/payment.history.point.reserve.controller';
import PaymentHistoryPointAuto from './controllers/payment.history.point.auto.controller';
import PaymentHistoryReceiptTax from './controllers/payment.history.receipt.tax.controller';
import PaymentHistoryReceiptCash from './controllers/payment.history.receipt.cash.controller';
import PaymentHistoryExcessPay from './controllers/payment.history.excess-pay.controller';
import PaymentHistoryExcessPayAccount from './controllers/payment.history.excess-pay.account.controller';
import PaymentPrepayMicro from './controllers/payment.prepay.micro.controller';
import PaymentPrepayContents from './controllers/payment.prepay.contents.controller';
import PaymentPrepayMicroPay from './controllers/payment.prepay.micro.pay.controller';
import PaymentPrepayContentsPay from './controllers/payment.prepay.contents.pay.controller';
import PaymentPrepayMicroHistory from './controllers/payment.prepay.micro.history.controller';
import PaymentPrepayContentsHistory from './controllers/payment.prepay.contents.history.controller';
import PaymentPrepayContentsAutoHistory from './controllers/payment.prepay.contents.auto.history.controller';
import PaymentPrepayMicroAutoHistory from './controllers/payment.prepay.micro.auto.history.controller';
import PaymentPrepayMicroAuto from './controllers/payment.prepay.micro.auto.controller';
import PaymentPrepayContentsAuto from './controllers/payment.prepay.contents.auto.controller';
import PaymentPrepayMicroAutoChange from './controllers/payment.prepay.micro.auto.change.controller';
import PaymentPrepayContentsAutoChange from './controllers/payment.prepay.contents.auto.change.controller';

class PaymentRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({url: '/realtime', controller: new PaymentRealtime()});
    this.controllers.push({url: '/auto', controller: new PaymentAuto()});
    this.controllers.push({url: '/point', controller: new PaymentPoint()});
    this.controllers.push({url: '/history', controller: new PaymentHistory()});
    this.controllers.push({url: '/history/realtime', controller: new PaymentHistoryRealtime()});
    this.controllers.push({url: '/history/auto', controller: new PaymentHistoryAuto()});
    this.controllers.push({url: '/history/auto/unitedwithdrawal', controller: new PaymentHistoryAutoUnitedWithdrawal()});
    this.controllers.push({url: '/history/point/reserve', controller: new PaymentHistoryPointReserve()});
    this.controllers.push({url: '/history/point/auto', controller: new PaymentHistoryPointAuto()});
    this.controllers.push({url: '/history/receipt/tax', controller: new PaymentHistoryReceiptTax()});
    this.controllers.push({url: '/history/receipt/cash', controller: new PaymentHistoryReceiptCash()});
    this.controllers.push({url: '/history/excesspay/', controller: new PaymentHistoryExcessPay()});
    this.controllers.push({url: '/history/excesspay/account', controller: new PaymentHistoryExcessPayAccount()});
    this.controllers.push({url: '/prepay/micro', controller: new PaymentPrepayMicro()});
    this.controllers.push({url: '/prepay/contents', controller: new PaymentPrepayContents()});
    this.controllers.push({url: '/prepay/micro/pay', controller: new PaymentPrepayMicroPay()});
    this.controllers.push({url: '/prepay/contents/pay', controller: new PaymentPrepayContentsPay()});
    this.controllers.push({url: '/prepay/micro/history', controller: new PaymentPrepayMicroHistory()});
    this.controllers.push({url: '/prepay/contents/history', controller: new PaymentPrepayContentsHistory()});
    this.controllers.push({url: '/prepay/micro/auto', controller: new PaymentPrepayMicroAuto()});
    this.controllers.push({url: '/prepay/contents/auto', controller: new PaymentPrepayContentsAuto()});
    this.controllers.push({url: '/prepay/micro/auto/change', controller: new PaymentPrepayMicroAutoChange()});
    this.controllers.push({url: '/prepay/contents/auto/change', controller: new PaymentPrepayContentsAutoChange()});
    this.controllers.push({url: '/prepay/micro/auto/history', controller: new PaymentPrepayMicroAutoHistory()});
    this.controllers.push({url: '/prepay/contents/auto/history', controller: new PaymentPrepayContentsAutoHistory()});
  }
}

export default PaymentRouter;
