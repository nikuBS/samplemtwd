import TwRouter from '../../common/route/tw.router';
import MyTUsage from './controllers/myt.usage.controller';
import MyTUsageDataShare from './controllers/myt.usage.data.share.controller';
import MyTUsageChildren from './controllers/myt.usage.children.controller';
import MyTUsageChange from './controllers/myt.usage.change.controller';
import MyTUsageTDataShare from './controllers/myt.usage.tdata.share.controller';
import MyTUsageTDataShareInfo from './controllers/myt.usage.tdata.share.info.controller';
import MyTUsageTDataShareClose from './controllers/myt.usage.tdata.share.close.controller';
import MyTUsageTRoamingShare from './controllers/myt.usage.troaming.share.controller';
import MyTUsageTing from './controllers/myt.usage.ting.controller';
import MyTUsage24hour50discount from './controllers/myt.usage.24hour.50discount.controller';

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
