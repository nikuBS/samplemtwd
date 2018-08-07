import TwRouter from '../../common/route/tw.router';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';
import CustomerNoticeController from './controllers/customer.notice.controller';
import CustomerPreventdamageMainController from './controllers/preventdamage/customer.preventdamage.main.controller';
import CustomerPreventdamageGuideController from './controllers/preventdamage/customer.preventdamage.guide.controller';
import CustomerPreventdamageGuideviewController from './controllers/preventdamage/customer.preventdamage.guideview.controller';
import CustomerPreventdamageUsefulserviceController from './controllers/preventdamage/customer.preventdamage.usefulservice.controller';
import CustomerPreventdamageRelatesiteController from './controllers/preventdamage/customer.preventdamage.relatesite.controller';
import CustomerPreventdamageLatestwarningController from './controllers/preventdamage/customer.preventdamage.latestwarning.controller';
import CustomerPreventdamageLatestwarningviewController from './controllers/preventdamage/customer.preventdamage.latestwarningview.controller';
import CustomerShopDetailController from './controllers/shop/customer.shop.detail.controller';
import CustomerShopNearController from './controllers/shop/customer.shop.near.controller';
import CustomerShopRepairController from './controllers/shop/customer.shop.repair.controller';
import CustomerShopRepairManufacturerController from './controllers/shop/customer.shop.repair-manufacturer.controller';
import CustomerShopSearchController from './controllers/shop/customer.shop.search.controller';
import CustomerVoiceController from './controllers/voice/customer.voice.controller';
import CustomerMainController from './controllers/main/customer.main.controller';
import CustomerResearches from './controllers/researches/customer.researches.controller';
import CustomerEmailController from './controllers/email/customer.email.controller';
import CustomerResearchResult from './controllers/researches/customer.researches.result.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new CustomerMainController() });
    this.controllers.push({ url: '/email(/:status)?(/:category)?', controller: new CustomerEmailController() });
    this.controllers.push({ url: '/notice', controller: new CustomerNoticeController() });
    this.controllers.push({ url: '/prevent-damage', controller: new CustomerPreventdamageMainController() });
    this.controllers.push({ url: '/prevent-damage/guide', controller: new CustomerPreventdamageGuideController() });
    this.controllers.push({ url: '/prevent-damage/guide/view', controller: new CustomerPreventdamageGuideviewController() });
    this.controllers.push({ url: '/prevent-damage/useful-service', controller: new CustomerPreventdamageUsefulserviceController() });
    this.controllers.push({ url: '/prevent-damage/relate-site', controller: new CustomerPreventdamageRelatesiteController() });
    this.controllers.push({ url: '/prevent-damage/latest-warning', controller: new CustomerPreventdamageLatestwarningController() });
    this.controllers.push({ url: '/prevent-damage/latest-warning/view', controller: new CustomerPreventdamageLatestwarningviewController() });
    this.controllers.push({ url: '/helpline', controller: new CustomerHelpline() });
    this.controllers.push({ url: '/shop/detail', controller: new CustomerShopDetailController });
    this.controllers.push({ url: '/shop/near', controller: new CustomerShopNearController });
    this.controllers.push({ url: '/shop/repair', controller: new CustomerShopRepairController });
    this.controllers.push({ url: '/shop/repair-manufacturer', controller: new CustomerShopRepairManufacturerController });
    this.controllers.push({ url: '/shop/search', controller: new CustomerShopSearchController() });
    this.controllers.push({ url: '/voice/:type', controller: new CustomerVoiceController() });
    this.controllers.push({ url: '/researches/result', controller: new CustomerResearchResult() });
    this.controllers.push({ url: '/researches(/:researchId)?', controller: new CustomerResearches() });
  }
}

export default CustomerRouter;
