import TwRouter from '../../common/route/tw.router';
import MyTUsage from './controllers/usage/myt.usage.controller';
import MyTUsageDataShare from './controllers/usage/myt.usage.data.share.controller';
import MyTUsageChildren from './controllers/usage/myt.usage.children.controller';
import MyTUsageChange from './controllers/usage/myt.usage.change.controller';
import MyTUsageTDataShare from './controllers/usage/myt.usage.tdata.share.controller';
import MyTUsageTDataShareInfo from './controllers/usage/myt.usage.tdata.share.info.controller';
import MyTUsageTDataShareClose from './controllers/usage/myt.usage.tdata.share.close.controller';
import MyTUsageTRoamingShare from './controllers/usage/myt.usage.troaming.share.controller';
import MyTUsageTing from './controllers/usage/myt.usage.ting.controller';
import MyTUsage24hour50discount from './controllers/usage/myt.usage.24hour.50discount.controller';

class MytRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new MyTUsage() });
    this._controllers.push({ url: '/usage/change', controller: new MyTUsageChange() });
    this._controllers.push({ url: '/usage/children', controller: new MyTUsageChildren() });
    this._controllers.push({ url: '/usage/datashare', controller: new MyTUsageDataShare() });
    this._controllers.push({ url: '/usage/tdatashare', controller: new MyTUsageTDataShare() });
    this._controllers.push({ url: '/usage/tdatashare/info', controller: new MyTUsageTDataShareInfo() });
    this._controllers.push({ url: '/usage/tdatashare/close', controller: new MyTUsageTDataShareClose() });
    this._controllers.push({ url: '/usage/troaming', controller: new MyTUsageTRoamingShare() });
    this._controllers.push({ url: '/usage/ting', controller: new MyTUsageTing() });
    this._controllers.push({ url: '/usage/24hourdiscount', controller: new MyTUsage24hour50discount() });
  }
}

export default MytRouter;
