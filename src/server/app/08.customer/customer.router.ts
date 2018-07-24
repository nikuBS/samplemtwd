import TwRouter from '../../common/route/tw.router';
import CustomerMainController from './controllers/customer.main.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new CustomerMainController() });
  }
}

export default CustomerRouter;
