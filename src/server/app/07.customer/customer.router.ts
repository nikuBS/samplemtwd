import TwRouter from '../../common/route/tw.router';
import CustomerDocument from '../904.customer/controllers/document/customer.document.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/document', controller: new CustomerDocument() });
    // this.controllers.push({ url: '/', controller: new HomeMain() });
  }
}

export default CustomerRouter;
