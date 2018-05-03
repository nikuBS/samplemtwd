import TxRouter from '../../common/route/tw.router';
import CheckCurrentBillController from './controllers/check/check.current.bill.controller';

class BillRouter extends TxRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/check/current', controller: new CheckCurrentBillController() });
  }
}

export default BillRouter;
