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
import MyTRefill from './controllers/refillrecharge/refill/refill.controller';
import MyTRefillHistory from './controllers/refillrecharge/refill/refill.history.controller';
import MyTGift from './controllers/refillrecharge/gift/gift.controller';
import MyTGiftMembersProcess from './controllers/refillrecharge/gift/gift.members.controller';
import MyTGiftFamilyProcess from './controllers/refillrecharge/gift/gift.family.controller';
import MyTGiftComplete from './controllers/refillrecharge/gift/gift.complete.controller';
import MyTGiftHistory from './controllers/refillrecharge/gift/gift.history.controller';
import MyTRefillSelect from './controllers/refillrecharge/refill/refill.select.controller';
import MyTRefillComplete from './controllers/refillrecharge/refill/refill.complete.controller';
import MyTGiftRequestProcess from './controllers/refillrecharge/gift/gift.request.controller';

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

    this.controllers.push({ url: '/refill', controller: new MyTRefill() });
    this.controllers.push({ url: '/refill/history', controller: new MyTRefillHistory() });
    this.controllers.push({ url: '/refill/select', controller: new MyTRefillSelect() });
    this.controllers.push({ url: '/refill/complete', controller: new MyTRefillComplete() });
    this.controllers.push({ url: '/gift', controller: new MyTGift() });
    this.controllers.push({ url: '/gift/process/family', controller: new MyTGiftFamilyProcess() });
    this.controllers.push({ url: '/gift/process/members', controller: new MyTGiftMembersProcess() });
    this.controllers.push({ url: '/gift/process/request', controller: new MyTGiftRequestProcess() });
    this.controllers.push({ url: '/gift/complete', controller: new MyTGiftComplete() });
    this.controllers.push({ url: '/gift/history', controller: new MyTGiftHistory() });
  }
}

export default MytRouter;
