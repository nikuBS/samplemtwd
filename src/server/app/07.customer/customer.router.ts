import TwRouter from '../../common/route/tw.router';
import CustomerDocument from '../904.customer/controllers/document/customer.document.controller';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/document', controller: CustomerDocument} );
    this.controllers.push({ url: '/helpline', controller: CustomerHelpline} );
  }
}

export default CustomerRouter;
