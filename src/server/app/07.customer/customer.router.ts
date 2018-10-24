import TwRouter from '../../common/route/tw.router';
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

class CustomerRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain() });
    this.controllers.push({ url: '/document', controller: CustomerDocument} );
    this.controllers.push({ url: '/helpline', controller: CustomerHelpline} );
    this.controllers.push({ url: '/praise', controller: CustomerPraise} );
    this.controllers.push({ url: '/useguide/site-use', controller: CustomerGuideSiteUse });
    // this.controllers.push({ url: '/useguide/service', controller: CustomerGuideSeviceUse });

    this.controllers.push({ url: '/notice(/:category)?', controller: CustomerNotice });
    this.controllers.push({ url: '/protect', controller: CustomerProtect } );
    this.controllers.push({ url: '/protect/guide(/:category)?', controller: CustomerProtectGuide } );
    this.controllers.push({ url: '/protect/guide/:category/view/:idx', controller: CustomerProtectGuideView } );
    this.controllers.push({ url: '/protect/additions', controller: CustomerProtectAdditions } );
    this.controllers.push({ url: '/protect/related', controller: CustomerProtectRelated } );
    this.controllers.push({ url: '/protect/warning', controller: CustomerProtectWarning } );
    this.controllers.push({ url: '/protect/warning/view/:idx', controller: CustomerProtectWarningView } );
  }
}

export default CustomerRouter;
