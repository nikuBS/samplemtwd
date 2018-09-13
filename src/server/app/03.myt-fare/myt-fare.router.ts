import TwRouter from '../../common/route/tw.router';
import MytFareBillGuide from './controllers/bill/myt-fare.bill.guide.controllers';
import MyTFareBillSet from './controllers/bill/myt-fare.bill.set.controller';

class MytFareRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: new HomeMain() });
    this.controllers.push({ url: '/bill/guide', controller: new MytFareBillGuide() });
    this.controllers.push({ url: '/bill/set', controller: new MyTFareBillSet() });
  }
}

export default MytFareRouter;
