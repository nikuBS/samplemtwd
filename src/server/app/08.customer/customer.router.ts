import CustomerNotice from './controllers/customer.notice.controller';
import CustomerPreventDamage from './controllers/customer.prevent-damage.controller';
import CustomerPreventDamageGuide from './controllers/customer.prevent-damage.guide.controller';
import CustomerPreventDamageGuideView from './controllers/customer.prevent-damage.guide.view.controller';
import CustomerPreventDamageUsefulService from './controllers/customer.prevent-damage.useful-service.controller';
import CustomerPreventDamageRelateSite from './controllers/customer.prevent-damage.relate-site.controller';

import TwRouter from '../../common/route/tw.router';
import CustomerMainController from './controllers/customer.main.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new CustomerMainController() });
    this.controllers.push({ url: '/notice', controller: new CustomerNotice() });
    this.controllers.push({ url: '/prevent-damage', controller: new CustomerPreventDamage() });
    this.controllers.push({ url: '/prevent-damage/guide', controller: new CustomerPreventDamageGuide() });
    this.controllers.push({ url: '/prevent-damage/guide/view', controller: new CustomerPreventDamageGuideView() });
    this.controllers.push({ url: '/prevent-damage/useful-service', controller: new CustomerPreventDamageUsefulService() });
    this.controllers.push({ url: '/prevent-damage/relate-site', controller: new CustomerPreventDamageRelateSite() });
  }
}

export default CustomerRouter;
