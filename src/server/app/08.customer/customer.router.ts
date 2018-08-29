import TwRouter from '../../common/route/tw.router';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';
import CustomerResearchResult from './controllers/researches/customer.researches.result.controller';
import CustomerResearches from './controllers/researches/customer.researches.controller';
import CustomerFaqInfoService from './controllers/faq/customer.faq.info.service.controller';
import CustomerFaqInfoSite from './controllers/faq/customer.faq.info.site.controller';
import CustomerMain from './controllers/main/customer.main.controller';
import CustomerEmail from './controllers/email/customer.email.controller';
import CustomerNotice from './controllers/notice/customer.notice.controller';
import CustomerPreventdamageMain from './controllers/preventdamage/customer.preventdamage.main.controller';
import CustomerPreventdamageGuide from './controllers/preventdamage/customer.preventdamage.guide.controller';
import CustomerPreventdamageGuideview from './controllers/preventdamage/customer.preventdamage.guideview.controller';
import CustomerPreventdamageUsefulservice from './controllers/preventdamage/customer.preventdamage.usefulservice.controller';
import CustomerPreventdamageRelatesite from './controllers/preventdamage/customer.preventdamage.relatesite.controller';
import CustomerPreventdamageLatestwarning from './controllers/preventdamage/customer.preventdamage.latestwarning.controller';
import CustomerPreventdamageLatestwarningview from './controllers/preventdamage/customer.preventdamage.latestwarningview.controller';
import CustomerShopDetail from './controllers/shop/customer.shop.detail.controller';
import CustomerShopNear from './controllers/shop/customer.shop.near.controller';
import CustomerShopRepairDetail from './controllers/shop/customer.shop.repair-detail.controller';
import CustomerShopRepair from './controllers/shop/customer.shop.repair.controller';
import CustomerShopRepairManufacturer from './controllers/shop/customer.shop.repair-manufacturer.controller';
import CustomerShopSearch from './controllers/shop/customer.shop.search.controller';
import CustomerVoice from './controllers/voice/customer.voice.controller';
import CustomerFaq from './controllers/faq/customer.faq.controller';
import CustomerFaqCategory from './controllers/faq/customer.faq.category.controller';
import CustomerFaqDoItLikeThis from './controllers/faq/customer.faq.do-it-like-this.controller';
import CustomerDocument from './controllers/document/customer.document.controller';
import CustomerEvent from './controllers/event/customer.event.controller';
import CustomerEventDetail from './controllers/event/customer.event.detail.controller';
import CustomerEventDetailWin from './controllers/event/customer.event.detail.win.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new CustomerMain() });
    this.controllers.push({ url: '/email(/:status)?(/:category)?', controller: new CustomerEmail() });
    this.controllers.push({ url: '/notice', controller: new CustomerNotice() });
    this.controllers.push({ url: '/prevent-damage', controller: new CustomerPreventdamageMain() });
    this.controllers.push({ url: '/prevent-damage/guide', controller: new CustomerPreventdamageGuide() });
    this.controllers.push({ url: '/prevent-damage/guide/view', controller: new CustomerPreventdamageGuideview() });
    this.controllers.push({ url: '/prevent-damage/useful-service', controller: new CustomerPreventdamageUsefulservice() });
    this.controllers.push({ url: '/prevent-damage/relate-site', controller: new CustomerPreventdamageRelatesite() });
    this.controllers.push({ url: '/prevent-damage/latest-warning', controller: new CustomerPreventdamageLatestwarning() });
    this.controllers.push({ url: '/prevent-damage/latest-warning/view', controller: new CustomerPreventdamageLatestwarningview() });
    this.controllers.push({ url: '/helpline', controller: new CustomerHelpline() });
    this.controllers.push({ url: '/shop/detail', controller: new CustomerShopDetail });
    this.controllers.push({ url: '/shop/near', controller: new CustomerShopNear });
    this.controllers.push({ url: '/shop/repair', controller: new CustomerShopRepair });
    this.controllers.push({ url: '/shop/repair-detail', controller: new CustomerShopRepairDetail });
    this.controllers.push({ url: '/shop/repair-manufacturer', controller: new CustomerShopRepairManufacturer });
    this.controllers.push({ url: '/shop/search', controller: new CustomerShopSearch() });
    this.controllers.push({ url: '/voice/:type', controller: new CustomerVoice() });
    this.controllers.push({ url: '/researches/result', controller: new CustomerResearchResult() });
    this.controllers.push({ url: '/researches(/:researchId)?', controller: new CustomerResearches() });
    this.controllers.push({ url: '/faq', controller: new CustomerFaq() });
    this.controllers.push({ url: '/faq/category', controller: new CustomerFaqCategory() });
    this.controllers.push({ url: '/faq/doitlikethis', controller: new CustomerFaqDoItLikeThis() });
    this.controllers.push({ url: '/faq/service-info', controller: new CustomerFaqInfoService() });
    this.controllers.push({ url: '/faq/service-info(/:serviceId)?', controller: new CustomerFaqInfoService() });
    this.controllers.push({ url: '/faq/site-info(/:serviceId)?', controller: new CustomerFaqInfoSite() });
    this.controllers.push({ url: '/faq/site-info/m-customer-center', controller: new CustomerFaqInfoSite() });
    this.controllers.push({ url: '/document', controller: new CustomerDocument() });
    this.controllers.push({ url: '/event', controller: new CustomerEvent() });
    this.controllers.push({ url: '/event/detail', controller: new CustomerEventDetail() });
    this.controllers.push({ url: '/event/detail/win', controller: new CustomerEventDetailWin() });
  }
}

export default CustomerRouter;
