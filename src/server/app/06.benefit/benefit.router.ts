import TwRouter from '../../common/route/tw.router';
import BenefitIndex from './controllers/index/benefit.index.controller';
import { BenefitMyBenefitRainbowPoint } from './controllers/my-benefit/benefit.my-benefit.rainbow-point.controller';
import BenefitMyBenefitRainbowPointAdjustment from './controllers/my-benefit/benefit.my-benefit.rainbow-point.adjustment.controller';
import BenefitMyBenefitRainbowPointTransfer from './controllers/my-benefit/benefit.my-benefit.rainbow-point.transfer.controller';
import BenefitMyBenefit from './controllers/my-benefit/benefit.myt-benefit.controller';
import BenefitMilitary from './controllers/my-benefit/benefit.myt-benefit.military';
import BenefitCookiz from './controllers/my-benefit/benefit.myt-benefit.cookiz';
import BenefitDisPgm from './controllers/program/benefit.dis-pgm';

class BenefitRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain });

    this.controllers.push({ url: '/submain', controller: BenefitIndex });
    this.controllers.push({ url: '/my-benefit/rainbow-point', controller: BenefitMyBenefitRainbowPoint });
    this.controllers.push({ url: '/my-benefit/rainbow-point/adjustment', controller: BenefitMyBenefitRainbowPointAdjustment });
    this.controllers.push({ url: '/my-benefit/rainbow-point/transfer', controller: BenefitMyBenefitRainbowPointTransfer });

    // new IA
    this.controllers.push({ url: '/submain/detail/dis-pgm/:prodId', controller: BenefitDisPgm });
    this.controllers.push({ url: '/my/military', controller: BenefitMilitary });
    this.controllers.push({ url: '/my/cookiz', controller: BenefitCookiz });
    this.controllers.push({ url: '/my', controller: BenefitMyBenefit });
  }
}

export default BenefitRouter;
