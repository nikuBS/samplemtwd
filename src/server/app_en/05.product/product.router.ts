import TwRouter from '../../common_en/route/tw.router';

import Callplan from './controllers/callplan/product.callplan.controller';
import MobilePlan from './controllers/mobileplan/product.mobileplan.controller';
import CallplanMiri from './controllers/callplan/product.callplan.miri.controller';


class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/mobileplan', controller: MobilePlan });
    this.controllers.push({ url: '/callplan', controller: Callplan });
    this.controllers.push({ url: '/callplan/miri', controller: CallplanMiri });

  }
}

export default ProductRouter;
