import TwRouter from '../../common/route/tw.router';
import PaymentRealtimeController from './controllers/payment.realtime.controller';
import PaymentAutoController from './controllers/payment.auto.controller';
import PaymentPointController from './controllers/payment.point.controller';

class PaymentRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/payment/realtime', controller: new PaymentRealtimeController() });
    this.controllers.push({ url: '/payment/auto', controller: new PaymentAutoController() });
    this.controllers.push({ url: '/payment/point', controller: new PaymentPointController() });
  }
}

export default PaymentRouter;
