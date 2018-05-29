import TwRouter from '../../common/route/tw.router';
import MyTUsage from './controllers/myt.usage.controller';
import MyTUsageDataShare from './controllers/myt.usage.data.share.controller';
import MyTUsageChildren from './controllers/myt.usage.children.controller';
import MyTUsageChange from './controllers/myt.usage.change.controller';

class MytRouter extends TwRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new MyTUsage() });
    this._controllers.push({ url: '/usage/change', controller: new MyTUsageChange() });
    this._controllers.push({ url: '/usage/children', controller: new MyTUsageChildren() });
    this._controllers.push({ url: '/usage/datashare', controller: new MyTUsageDataShare() });
  }
}

export default MytRouter;
