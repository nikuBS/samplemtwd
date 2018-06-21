import TwRouter from '../../common/route/tw.router';
import PaymentRealtimeController from './controllers/payment.realtime.controller';
import PaymentAutoController from './controllers/payment.auto.controller';
import PaymentPointController from './controllers/payment.point.controller';

class PaymentRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/realtime', controller: new PaymentRealtimeController() });
    this.controllers.push({ url: '/auto', controller: new PaymentAutoController() });
    this.controllers.push({ url: '/point', controller: new PaymentPointController() });
  }
}

export default PaymentRouter;
