import TwRouter from '../../common_en/route/tw.router';

import CustomerVideoGuide from './controllers/useguide/customer.videoguide.controller';
import CustomerMain from './controllers/main/customer.main.controller';
import CustomerFaq from './controllers/faq/customer.faq.controller';
import CustomerAgentsearch from './controllers/agentsearch/customer.agentsearch.controller';
import CustomerDocument from './controllers/document/customer.document.controller';
class CustomerRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/', controller: CustomerMain });
    this.controllers.push({ url: '/videoguide', controller: CustomerVideoGuide });
    this.controllers.push({ url: '/document', controller: CustomerDocument });
    this.controllers.push({ url: '/agentsearch', controller: CustomerAgentsearch });
    this.controllers.push({ url: '/faq', controller: CustomerFaq });
    }
}
export default CustomerRouter;
