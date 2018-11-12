import TwRouter from '../../common/route/tw.router';
import CustomerBranchSearch from './controllers/branch/customer.branch.search.controller';
import CustomerBranchDetail from './controllers/branch/customer.branch.detail.controller';
import CustomerBranchNear from './controllers/branch/customer.branch.near.controller';
import CustomerBranchRepair from './controllers/branch/customer.branch.repair.controller';
import CustomerBranchRepairDetail from './controllers/branch/customer.branch.repair-detail.controller';
import CustomerBranchRepairManufacturer from './controllers/branch/customer.branch.repair-manufacturer.controllter';
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

class CustomerRouter extends TwRouter {
  constructor() {
    super();

    // old IA
    this.controllers.push({ url: '/', controller: CustomerMain });
    this.controllers.push({ url: '/branch/search', controller: CustomerBranchSearch });
    this.controllers.push({ url: '/branch/detail', controller: CustomerBranchDetail });
    this.controllers.push({ url: '/branch/near', controller: CustomerBranchNear });
    this.controllers.push({ url: '/branch/repair', controller: CustomerBranchRepair });
    this.controllers.push({ url: '/branch/repair-detail', controller: CustomerBranchRepairDetail });
    this.controllers.push({ url: '/branch/repair-manufacturer', controller: CustomerBranchRepairManufacturer });
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
    this.controllers.push({ url: '/notice(/:category)?', controller: CustomerNotice });
    this.controllers.push({ url: '/damage-info', controller: CustomerProtect });
    this.controllers.push({ url: '/damage-info/guide(/:category)?', controller: CustomerProtectGuide });
    this.controllers.push({ url: '/damage-info/guide/webtoon/view/:idx', controller: CustomerProtectGuideView });
    this.controllers.push({ url: '/damage-info/warning', controller: CustomerProtectWarning });
    this.controllers.push({ url: '/damage-info/warning/view/:idx', controller: CustomerProtectWarningView });
    this.controllers.push({ url: '/damage-info/additions', controller: CustomerProtectAdditions });
    this.controllers.push({ url: '/damage-info/related', controller: CustomerProtectRelated });
  }
}

export default CustomerRouter;
