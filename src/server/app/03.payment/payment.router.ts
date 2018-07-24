import TwRouter from '../../common/route/tw.router';
import PaymentRealtimeController from './controllers/payment.realtime.controller';
import PaymentAutoController from './controllers/payment.auto.controller';
import PaymentPointController from './controllers/payment.point.controller';
import PaymentHistoryController from './controllers/payment.history.controller';
import PaymentHistoryRealtimeController from './controllers/payment.history.realtime.controller';
import PaymentHistoryAutoController from './controllers/payment.history.auto.controller';
import PaymentHistoryAutoUnitedWithdrawalController from './controllers/payment.history.auto.united-withdrawal.controller';
import PaymentHistoryPointReserveController from './controllers/payment.history.point.reserve.controller';
import PaymentHistoryPointAutoController from './controllers/payment.history.point.auto.controller';
import PaymentHistoryReceiptTaxController from './controllers/payment.history.receipt.tax.controller';
import PaymentHistoryReceiptCashController from './controllers/payment.history.receipt.cash.controller';
import PaymentHistoryExcessPayController from './controllers/payment.history.excess-pay.controller';
import PaymentHistoryExcessPayAccountController from './controllers/payment.history.excess-pay.account.controller';
import PaymentPrepayMicroController from './controllers/payment.prepay.micro.controller';
import PaymentPrepayContentsController from './controllers/payment.prepay.contents.controller';
import PaymentPrepayMicroHistoryController from './controllers/payment.prepay.micro.history.controller';
import PaymentPrepayContentsHistoryController from './controllers/payment.prepay.contents.history.controller';
import PaymentPrepayContentsAutoHistoryController from './controllers/payment.prepay.contents.auto.history.controller';
import PaymentPrepayMicroAutoHistoryController from './controllers/payment.prepay.micro.auto.history.controller';

class PaymentRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({url: '/realtime', controller: new PaymentRealtimeController()});
    this.controllers.push({url: '/auto', controller: new PaymentAutoController()});
    this.controllers.push({url: '/point', controller: new PaymentPointController()});
    this.controllers.push({url: '/history', controller: new PaymentHistoryController()});
    this.controllers.push({url: '/history/realtime', controller: new PaymentHistoryRealtimeController()});
    this.controllers.push({url: '/history/auto', controller: new PaymentHistoryAutoController()});
    this.controllers.push({url: '/history/auto/unitedwithdrawal', controller: new PaymentHistoryAutoUnitedWithdrawalController()});
    this.controllers.push({url: '/history/point/reserve', controller: new PaymentHistoryPointReserveController()});
    this.controllers.push({url: '/history/point/auto', controller: new PaymentHistoryPointAutoController()});
    this.controllers.push({url: '/history/receipt/tax', controller: new PaymentHistoryReceiptTaxController()});
    this.controllers.push({url: '/history/receipt/cash', controller: new PaymentHistoryReceiptCashController()});
    this.controllers.push({url: '/history/excesspay/', controller: new PaymentHistoryExcessPayController()});
    this.controllers.push({url: '/history/excesspay/account', controller: new PaymentHistoryExcessPayAccountController()});
    this.controllers.push({url: '/prepay/micro', controller: new PaymentPrepayMicroController()});
    this.controllers.push({url: '/prepay/contents', controller: new PaymentPrepayContentsController()});
    this.controllers.push({url: '/prepay/micro/history', controller: new PaymentPrepayMicroHistoryController()});
    this.controllers.push({url: '/prepay/contents/history', controller: new PaymentPrepayContentsHistoryController()});
    this.controllers.push({url: '/prepay/micro/auto/history', controller: new PaymentPrepayMicroAutoHistoryController()});
    this.controllers.push({url: '/prepay/contents/auto/history', controller: new PaymentPrepayContentsAutoHistoryController()});
  }
}

export default PaymentRouter;
