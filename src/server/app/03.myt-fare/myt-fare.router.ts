import TwRouter from '../../common/route/tw.router';
import MytFareBillGuide from './controllers/bill/myt-fare.bill.guide.controllers';

class MytFareRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: new HomeMain() });
    this.controllers.push({ url: '/bill/guide', controller: new MytFareBillGuide() });
  }
}

export default MytFareRouter;
