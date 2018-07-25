import CustomerNotice from './controllers/customer.notice.controller';
import CustomerPreventdamageMain from './controllers/preventdamage/customer.preventdamage.main.controller';
import CustomerPreventdamageGuide from './controllers/preventdamage/customer.preventdamage.guide.controller';
import CustomerPreventdamageGuideview from './controllers/preventdamage/customer.preventdamage.guideview.controller';
import CustomerPreventdamageUsefulservice from './controllers/preventdamage/customer.preventdamage.usefulservice.controller';
import CustomerPreventdamageRelatesite from './controllers/preventdamage/customer.preventdamage.relatesite.controller';

import TwRouter from '../../common/route/tw.router';
import CustomerMainController from './controllers/customer.main.controller';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';

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
    this.controllers.push({ url: '/helpline', controller: new CustomerHelpline() });
  }
}

export default CustomerRouter;
