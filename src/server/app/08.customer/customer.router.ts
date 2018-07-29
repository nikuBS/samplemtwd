import TwRouter from '../../common/route/tw.router';
import CustomerMainController from './controllers/customer.main.controller';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';
import CustomerNoticeController from './controllers/customer.notice.controller';
import CustomerPreventdamageMainController from './controllers/preventdamage/customer.preventdamage.main.controller';
import CustomerPreventdamageGuideController from './controllers/preventdamage/customer.preventdamage.guide.controller';
import CustomerPreventdamageGuideviewController from './controllers/preventdamage/customer.preventdamage.guideview.controller';
import CustomerPreventdamageUsefulserviceController from './controllers/preventdamage/customer.preventdamage.usefulservice.controller';
import CustomerPreventdamageRelatesiteController from './controllers/preventdamage/customer.preventdamage.relatesite.controller';
import CustomerPreventdamageLatestwarningController from './controllers/preventdamage/customer.preventdamage.latestwarning.controller';
import CustomerPreventdamageLatestwarningviewController from './controllers/preventdamage/customer.preventdamage.latestwarningview.controller';
import CustomerShopSearch from './controllers/shop/customer.shop.search.controller';
import CustomerVoiceController from './controllers/voice/customer.voice.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new CustomerMainController() });
    this.controllers.push({ url: '/notice', controller: new CustomerNoticeController() });
    this.controllers.push({ url: '/prevent-damage', controller: new CustomerPreventdamageMainController() });
    this.controllers.push({ url: '/prevent-damage/guide', controller: new CustomerPreventdamageGuideController() });
    this.controllers.push({ url: '/prevent-damage/guide/view', controller: new CustomerPreventdamageGuideviewController() });
    this.controllers.push({ url: '/prevent-damage/useful-service', controller: new CustomerPreventdamageUsefulserviceController() });
    this.controllers.push({ url: '/prevent-damage/relate-site', controller: new CustomerPreventdamageRelatesiteController() });
    this.controllers.push({ url: '/prevent-damage/latest-warning', controller: new CustomerPreventdamageLatestwarningController() });
    this.controllers.push({ url: '/prevent-damage/latest-warning/view', controller: new CustomerPreventdamageLatestwarningviewController() });
    this.controllers.push({ url: '/helpline', controller: new CustomerHelpline() });
    this.controllers.push({ url: '/shop/search', controller: new CustomerShopSearch() });
    this.controllers.push({ url: '/voice/:type', controller: new CustomerVoiceController() });
  }
}

export default CustomerRouter;
