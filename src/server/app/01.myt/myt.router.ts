import TwRouter from '../../common/route/tw.router';
import MyTUsage from './controllers/usage/myt.usage.controller';
import MyTUsageDataShare from './controllers/usage/myt.usage.data-share.controller';
import MyTUsageChildren from './controllers/usage/myt.usage.children.controller';
import MyTUsageChange from './controllers/usage/myt.usage.change.controller';
import MyTUsageTDataShare from './controllers/usage/myt.usage.tdata-share.controller';
import MyTUsageTDataShareInfo from './controllers/usage/myt.usage.tdata-share-info.controller';
import MyTUsageTDataShareClose from './controllers/usage/myt.usage.tdata-share-close.controller';
import MyTUsageTRoamingShare from './controllers/usage/myt.usage.troaming-share.controller';
import MyTUsageTing from './controllers/usage/myt.usage.ting.controller';
import MyTUsage24hours50discount from './controllers/usage/myt.usage.24hours-50discount.controller';
import MyTUsageDataLimit from './controllers/usage/myt.usage.data-limit.controller';
import MyTHotBill from './controllers/bill/myt.bill.hotbill.controller';
import MyTReissue from './controllers/bill/myt.bill.guidechange.reissue.controller';
import MyTReissueComplete from './controllers/bill/myt.bill.guidechange.reissue-complete.controller';
import MyTReturnHistory from './controllers/bill/myt.bill.guidechange.returnhistory.controller';
import MyTBillBillguide from './controllers/bill/myt.bill.billguide.controller';
import MyTHotBillChild from './controllers/bill/myt.bill.hotbill.child.controller';
import MytBillGuidechange from './controllers/bill/myt.bill.guidechange.controller';
import MyTBillGuidechangeChange from './controllers/bill/myt.bill.guidechange.change.controller';
import MyTBillGuideChangeComplete from './controllers/bill/myt.bill.guidechange.change-complete.controller';
import MyTBillGuidechangeUpdate from './controllers/bill/myt.bill.guidechange.update.controller';
import MyTBillGuidechangeUpdateComplete from './controllers/bill/myt.bill.guidechange.update-complete.controller';

class MytRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new MyTUsage() });
    this.controllers.push({ url: '/usage/change', controller: new MyTUsageChange() });
    this.controllers.push({ url: '/usage/children', controller: new MyTUsageChildren() });
    this.controllers.push({ url: '/usage/datalimit', controller: new MyTUsageDataLimit() });
    this.controllers.push({ url: '/usage/datashare', controller: new MyTUsageDataShare() });
    this.controllers.push({ url: '/usage/tdatashare', controller: new MyTUsageTDataShare() });
    this.controllers.push({ url: '/usage/tdatashare/info', controller: new MyTUsageTDataShareInfo() });
    this.controllers.push({ url: '/usage/tdatashare/close', controller: new MyTUsageTDataShareClose() });
    this.controllers.push({ url: '/usage/troaming', controller: new MyTUsageTRoamingShare() });
    this.controllers.push({ url: '/usage/ting', controller: new MyTUsageTing() });
    this.controllers.push({ url: '/usage/24hourdiscount', controller: new MyTUsage24hours50discount() });
    this.controllers.push({ url: '/bill/hotbill', controller: new MyTHotBill() });
    this.controllers.push({ url: '/bill/guidechange/reissue', controller: new MyTReissue() });
    this.controllers.push({ url: '/bill/guidechange/reissue/complete', controller: new MyTReissueComplete() });
    this.controllers.push({ url: '/bill/billguide/returnhistory', controller: new MyTReturnHistory() });
    this.controllers.push({ url: '/bill/billguide', controller: new MyTBillBillguide() });
    this.controllers.push({ url: '/bill/hotbill/child', controller: new MyTHotBillChild() });
    this.controllers.push({ url: '/bill/guidechange', controller: new MytBillGuidechange() });
    this.controllers.push({ url: '/bill/guidechange/change', controller: new MyTBillGuidechangeChange() });
    this.controllers.push({ url: '/bill/guidechange/change-complete', controller: new MyTBillGuideChangeComplete() });
    this.controllers.push({ url: '/bill/guidechange/update', controller: new MyTBillGuidechangeUpdate() });
    this.controllers.push({ url: '/bill/guidechange/update-complete', controller: new MyTBillGuidechangeUpdateComplete() });
  }
}

export default MytRouter;
