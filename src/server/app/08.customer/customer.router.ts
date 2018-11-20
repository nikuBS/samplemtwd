import TwRouter from '../../common/route/tw.router';
import CustomerDocument from '../904.customer/controllers/document/customer.document.controller';
import CustomerHelpline from './controllers/helpline/customer.helpline.controller';

import CustomerGuideSiteUse from './controllers/useguide/customer.useguide.site.controller';
import CustomerGuideServiceUse from './controllers/useguide/customer.useguide.service.controller';
import CustomerPraise from './controllers/praise/customer.praise.controller';
import CustomerNotice from './controllers/notice/customer.notice.controller';
import CustomerProtect from './controllers/protect/customer.protect.controller';
import CustomerProtectGuide from './controllers/protect/customer.protect.guide.controller';
import CustomerProtectGuideView from './controllers/protect/customer.protect.guide-view.controller';
import CustomerProtectAdditions from './controllers/protect/customer.protect.additions.controller';
import CustomerProtectRelated from './controllers/protect/customer.protect.related.controller';
import CustomerProtectWarning from './controllers/protect/customer.protect.warning.controller';
import CustomerProtectWarningView from './controllers/protect/customer.protect.warning-view.controller';
import CustomerMain from './controllers/main/customer.main.controller';
import CustomerVoice from './controllers/voice/customer.voice.controller';
import CustomerEmail from './controllers/email/customer.email.controller';
import CustomerResearches from './controllers/researches/customer.researches.controller';
import CustomerFaq from '../904.customer/controllers/faq/customer.faq.controller';
import CustomerFaqSearch from './controllers/faq/customer.faq.search.controller';
import CustomerAgentsearch from './controllers/agentsearch/customer.agentsearch.controller';
import CustomerAgentsearchDetail from './controllers/agentsearch/customer.agentsearch.detail.controller';
import CustomerAgentsearchNear from './controllers/agentsearch/customer.agentsearch.near.controller';
import CustomerAgentsearchRepair from './controllers/agentsearch/customer.agentsearch.repair.controller';
import CustomerAgentsearchRepairDetail from './controllers/agentsearch/customer.agentsearch.repair-detail.controller';
import CustomerAgentsearchRepairManufacturer from './controllers/agentsearch/customer.agentsearch.repair-manufacturer.controllter';

class CustomerRouter extends TwRouter {
  constructor() {
    super();

    // old IA
    this.controllers.push({ url: '/', controller: CustomerMain });
    this.controllers.push({ url: '/document', controller: CustomerDocument });
    this.controllers.push({ url: '/faq', controller: CustomerFaq });
    this.controllers.push({ url: '/faq/search', controller: CustomerFaqSearch });
    this.controllers.push({ url: '/helpline', controller: CustomerHelpline });
    this.controllers.push({ url: '/praise', controller: CustomerPraise });
    this.controllers.push({ url: '/useguide/site-use', controller: CustomerGuideSiteUse });
    this.controllers.push({ url: '/researches(/:researchId)?', controller: CustomerResearches });
    this.controllers.push({ url: '/email(/:page)?', controller: CustomerEmail });
    this.controllers.push({ url: '/svc-info/service', controller: CustomerGuideServiceUse });
    this.controllers.push({ url: '/svc-info/service/detail', controller: CustomerGuideServiceUse });
    this.controllers.push({ url: '/svc-info/mcustomer', controller: CustomerGuideServiceUse });
    this.controllers.push({ url: '/svc-info/site', controller: CustomerGuideSiteUse });
    this.controllers.push({ url: '/svc-info/site/detail', controller: CustomerGuideSiteUse });
    this.controllers.push({ url: '/voice(/:page)?', controller: CustomerVoice });

    // new IA
    this.controllers.push({ url: '/svc-info/notice(/:category)?', controller: CustomerNotice });
    this.controllers.push({ url: '/damage-info', controller: CustomerProtect });
    this.controllers.push({ url: '/damage-info/guide(/:category)?', controller: CustomerProtectGuide });
    this.controllers.push({ url: '/damage-info/guide/webtoon/view/:idx', controller: CustomerProtectGuideView });
    this.controllers.push({ url: '/damage-info/warning', controller: CustomerProtectWarning });
    this.controllers.push({ url: '/damage-info/warning/view/:idx', controller: CustomerProtectWarningView });
    this.controllers.push({ url: '/damage-info/additions', controller: CustomerProtectAdditions });
    this.controllers.push({ url: '/damage-info/related', controller: CustomerProtectRelated });
    this.controllers.push({ url: '/agentsearch', controller: CustomerAgentsearch });
    this.controllers.push({ url: '/agentsearch/detail', controller: CustomerAgentsearchDetail });
    this.controllers.push({ url: '/agentsearch/near', controller: CustomerAgentsearchNear });
    this.controllers.push({ url: '/agentsearch/repair', controller: CustomerAgentsearchRepair });
    this.controllers.push({ url: '/agentsearch/repair-detail', controller: CustomerAgentsearchRepairDetail });
    this.controllers.push({ url: '/agentsearch/repair-manufacturer', controller: CustomerAgentsearchRepairManufacturer });

  }
}

export default CustomerRouter;
