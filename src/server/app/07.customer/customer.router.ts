import TwRouter from '../../common/route/tw.router';
import CustomerDocument from '../904.customer/controllers/document/customer.document.controller';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';

import CustomerGuideSiteUse from './controllers/useguide/customer.useguide.site.controller';
// import CustomerGuideSeviceUse from './controllers/useguide/customer.useguide.service.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/document', controller: CustomerDocument} );
    this.controllers.push({ url: '/helpline', controller: CustomerHelpline} );
    // this.controllers.push({ url: '/', controller: HomeMain() });
    this.controllers.push({ url: '/useguide/site-use', controller: CustomerGuideSiteUse });
    // this.controllers.push({ url: '/useguide/service', controller: CustomerGuideSeviceUse });
  }
}

export default CustomerRouter;
