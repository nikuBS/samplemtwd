import TwRouter from '../../common/route/tw.router';
import BenefitMembershipJoin from './controllers/membership/benefit.membership.join';
import BenefitIndex from './controllers/index/benefit.index.controller';
import BenefitMyBenefitRainbowPoint from './controllers/my-benefit/benefit.my-benefit.rainbow-point.controller';

class BenefitRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain });

    this.controllers.push({ url: '/membership/join', controller: BenefitMembershipJoin });
    this.controllers.push({ url: '/index', controller: BenefitIndex });
    this.controllers.push({ url: '/my-benefit/rainbow-point', controller: BenefitMyBenefitRainbowPoint });
  }
}

export default BenefitRouter;
