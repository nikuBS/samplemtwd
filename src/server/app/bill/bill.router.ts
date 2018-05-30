import TwRouter from '../../common/route/tw.router';
import CheckCurrentBillController from './controllers/check/check.current.bill.controller';

class BillRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/check/current', controller: new CheckCurrentBillController() });
  }
}

export default BillRouter;
