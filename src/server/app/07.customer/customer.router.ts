import TwRouter from '../../common/route/tw.router';
import CustomerDocument from '../904.customer/controllers/document/customer.document.controller';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/document', controller: new CustomerDocument() });
    this.controllers.push({ url: '/helpline', controller: new CustomerHelpline() });
    // this.controllers.push({ url: '/', controller: new HomeMain() });
  }
}

export default CustomerRouter;
