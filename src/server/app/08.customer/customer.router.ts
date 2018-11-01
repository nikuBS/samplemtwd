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
import CustomerPraise from './controllers/praise/customer.praise.controller';
// import CustomerGuideSeviceUse from './controllers/useguide/customer.useguide.service.controller';
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

class CustomerRouter extends TwRouter {
  constructor() {
    super();

    // old IA
    this.controllers.push({ url: '/', controller: CustomerMain} );
    this.controllers.push({ url: '/branch/search', controller: CustomerBranchSearch });
    this.controllers.push({ url: '/branch/detail', controller: CustomerBranchDetail });
    this.controllers.push({ url: '/branch/near', controller: CustomerBranchNear });
    this.controllers.push({ url: '/branch/repair', controller: CustomerBranchRepair });
    this.controllers.push({ url: '/branch/repair-detail', controller: CustomerBranchRepairDetail });
    this.controllers.push({ url: '/branch/repair-manufacturer', controller: CustomerBranchRepairManufacturer });
    this.controllers.push({ url: '/document', controller: CustomerDocument} );
    this.controllers.push({ url: '/helpline', controller: CustomerHelpline} );
    this.controllers.push({ url: '/praise', controller: CustomerPraise} );
    this.controllers.push({ url: '/useguide/site-use', controller: CustomerGuideSiteUse });
    this.controllers.push({ url: '/email(/:page)?', controller: CustomerEmail} );
    this.controllers.push({ url: '/email(/:main_category)?(/:sub_category)?', controller: CustomerEmail} );
    // this.controllers.push({ url: '/useguide/service', controller: CustomerGuideSeviceUse });
    this.controllers.push({ url: '/voice(/:page)?', controller: CustomerVoice} );
    // this.controllers.push({ url: '/notice(/:category)?', controller: CustomerNotice });
    // this.controllers.push({ url: '/protect', controller: CustomerProtect } );
    // this.controllers.push({ url: '/protect/guide(/:category)?', controller: CustomerProtectGuide } );
    // this.controllers.push({ url: '/protect/guide/:category/view/:idx', controller: CustomerProtectGuideView } );
    // this.controllers.push({ url: '/protect/additions', controller: CustomerProtectAdditions } );
    // this.controllers.push({ url: '/protect/related', controller: CustomerProtectRelated } );
    // this.controllers.push({ url: '/protect/warning', controller: CustomerProtectWarning } );
    // this.controllers.push({ url: '/protect/warning/view/:idx', controller: CustomerProtectWarningView } );

    // new IA
    this.controllers.push({ url: '/svc_info/cmis_0039', controller: CustomerNotice });
    this.controllers.push({ url: '/damage_info/cmis_0000', controller: CustomerProtect });
    this.controllers.push({ url: '/damage_info/cmis_0001', controller: CustomerProtect });
    this.controllers.push({ url: '/damage_info/cmis_0002', controller: CustomerProtectGuide });
    this.controllers.push({ url: '/damage_info/cmis_0003', controller: CustomerProtectGuide });
    this.controllers.push({ url: '/damage_info/cmis_0004', controller: CustomerProtectGuide });
    this.controllers.push({ url: '/damage_info/cmis_0006', controller: CustomerProtectGuideView });
    this.controllers.push({ url: '/damage_info/cmis_0007', controller: CustomerProtectWarning });
    this.controllers.push({ url: '/damage_info/cmis_0008', controller: CustomerProtectWarningView });
    this.controllers.push({ url: '/damage_info/cmis_0009', controller: CustomerProtectAdditions });
    this.controllers.push({ url: '/damage_info/cmis_0010', controller: CustomerProtectRelated });

  }
}

export default CustomerRouter;
