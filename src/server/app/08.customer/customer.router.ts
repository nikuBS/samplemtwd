import TwRouter from '../../common/route/tw.router';
import CustomerDocument from '../904.customer/controllers/document/customer.document.controller';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';

import CustomerGuideSiteUse from './controllers/useguide/customer.useguide.site.controller';
import CustomerGuideServiceUse from './controllers/useguide/customer.useguide.service.controller';
import CustomerPraise from './controllers/praise/customer.praise.controller';
import CustomerDamageInfo from './controllers/damage-info/customer.damage-info.controller';
import CustomerDamageInfoGuide from './controllers/damage-info/customer.damage-info.guide.controller';
import CustomerDamageInfoGuideWebtoonView from './controllers/damage-info/customer.damage-info.guide.webtoon-view.controller';
import CustomerDamageInfoAdditions from './controllers/damage-info/customer.damage-info.additions.controller';
import CustomerDamageInfoRelated from './controllers/damage-info/customer.damage-info.related.controller';
import CustomerDamageInfoWarning from './controllers/damage-info/customer.damage-info.warning.controller';
import CustomerDamageInfoWarningView from './controllers/damage-info/customer.damage-info.warning.view.controller';
import CustomerDamageInfoContents from './controllers/damage-info/customer.damage-info.contents.controller';
import CustomerMain from './controllers/main/customer.main.controller';
import CustomerVoice from './controllers/voice/customer.voice.controller';
import CustomerEmail from './controllers/email/customer.email.controller';
import CustomerResearches from './controllers/researches/customer.researches.controller';
import CustomerFaq from './controllers/faq/customer.faq.controller';
import CustomerFaqSearch from './controllers/faq/customer.faq.search.controller';
import CustomerFaqCategory from './controllers/faq/customer.faq.category.controller';
import CustomerAgentsearch from './controllers/agentsearch/customer.agentsearch.controller';
import CustomerAgentsearchDetail from './controllers/agentsearch/customer.agentsearch.detail.controller';
import CustomerAgentsearchNear from './controllers/agentsearch/customer.agentsearch.near.controller';
import CustomerAgentsearchRepair from './controllers/agentsearch/customer.agentsearch.repair.controller';
import CustomerAgentsearchRepairDetail from './controllers/agentsearch/customer.agentsearch.repair-detail.controller';
import CustomerAgentsearchRepairManufacturer from './controllers/agentsearch/customer.agentsearch.repair-manufacturer.controllter';
import CustomerSvcInfoNotice from './controllers/svc-info/customer.svc-info.notice.controller';
import CustomerFaqDoLikeThis from './controllers/faq/customer.faq.do-like-this.controller';

class CustomerRouter extends TwRouter {
  constructor() {
    super();

    // old IA
    this.controllers.push({ url: '/', controller: CustomerMain });
    this.controllers.push({ url: '/document', controller: CustomerDocument });
    this.controllers.push({ url: '/helpline', controller: CustomerHelpline });
    this.controllers.push({ url: '/useguide/site-use', controller: CustomerGuideSiteUse });
    this.controllers.push({ url: '/researches(/:researchId)?', controller: CustomerResearches });

    // new IA
    this.controllers.push({ url: '/emailconsult(/:page)?', controller: CustomerEmail });
    this.controllers.push({ url: '/svc-info/service', controller: CustomerGuideServiceUse });
    this.controllers.push({ url: '/svc-info/service/detail', controller: CustomerGuideServiceUse });
    this.controllers.push({ url: '/svc-info/mcustomer', controller: CustomerGuideServiceUse });
    this.controllers.push({ url: '/svc-info/site', controller: CustomerGuideSiteUse });
    this.controllers.push({ url: '/svc-info/site/detail', controller: CustomerGuideSiteUse });
    this.controllers.push({ url: '/svc-info/voice(/:page)?', controller: CustomerVoice });
    this.controllers.push({ url: '/svc-info/notice', controller: CustomerSvcInfoNotice });
    this.controllers.push({ url: '/damage-info', controller: CustomerDamageInfo });
    this.controllers.push({ url: '/damage-info/guide', controller: CustomerDamageInfoGuide });
    this.controllers.push({ url: '/damage-info/guide/webtoon-view', controller: CustomerDamageInfoGuideWebtoonView });
    this.controllers.push({ url: '/damage-info/warning', controller: CustomerDamageInfoWarning });
    this.controllers.push({ url: '/damage-info/warning/view', controller: CustomerDamageInfoWarningView });
    this.controllers.push({ url: '/damage-info/additions', controller: CustomerDamageInfoAdditions });
    this.controllers.push({ url: '/damage-info/related', controller: CustomerDamageInfoRelated });
    this.controllers.push({ url: '/damage-info/contents/:pageNo', controller: CustomerDamageInfoContents });
    this.controllers.push({ url: '/agentsearch', controller: CustomerAgentsearch });
    this.controllers.push({ url: '/agentsearch/search', controller: CustomerAgentsearch });
    this.controllers.push({ url: '/agentsearch/detail', controller: CustomerAgentsearchDetail });
    this.controllers.push({ url: '/agentsearch/near', controller: CustomerAgentsearchNear });
    this.controllers.push({ url: '/agentsearch/repair', controller: CustomerAgentsearchRepair });
    this.controllers.push({ url: '/agentsearch/repair-detail', controller: CustomerAgentsearchRepairDetail });
    this.controllers.push({ url: '/agentsearch/repair-manufacturer', controller: CustomerAgentsearchRepairManufacturer });
    this.controllers.push({ url: '/faq', controller: CustomerFaq });
    this.controllers.push({ url: '/faq/search', controller: CustomerFaqSearch });
    this.controllers.push({ url: '/faq/category', controller: CustomerFaqCategory });
    this.controllers.push({ url: '/faq/do-like-this', controller: CustomerFaqDoLikeThis });
    this.controllers.push({ url: '/svc-info/praise', controller: CustomerPraise });
    this.controllers.push({ url: '/svc-info/researches(/:researchId)?', controller: CustomerResearches });
  }
}

export default CustomerRouter;
