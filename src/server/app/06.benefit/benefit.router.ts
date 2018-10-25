import TwRouter from '../../common/route/tw.router';
import BenefitMembershipJoin from './controllers/membership/benefit.membership.join';

class BenefitRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain });

    this.controllers.push({ url: '/join', controller: BenefitMembershipJoin });
  }
}

export default BenefitRouter;
