import TwRouter from '../../common/route/tw.router';
import BenefitMembershipJoin from './controllers/membership/benefit.membership.join';
import BenefitIndex from './controllers/index/benefit.index.controller';

class BenefitRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain });

    this.controllers.push({ url: '/join', controller: BenefitMembershipJoin });
    this.controllers.push({ url: '/index', controller: BenefitIndex });
  }
}

export default BenefitRouter;
