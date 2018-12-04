import TwRouter from '../../common/route/tw.router';
import BenefitIndex from './controllers/index/benefit.index.controller';
import { BenefitMyBenefitRainbowPoint } from './controllers/my-benefit/benefit.my-benefit.rainbow-point.controller';
import BenefitMyBenefitRainbowPointAdjustment from './controllers/my-benefit/benefit.my-benefit.rainbow-point.adjustment.controller';
import BenefitMyBenefitRainbowPointTransfer from './controllers/my-benefit/benefit.my-benefit.rainbow-point.transfer.controller';
import BenefitMyBenefit from './controllers/my-benefit/benefit.myt-benefit.controller';
import BenefitMilitary from './controllers/my-benefit/benefit.myt-benefit.military';
import BenefitCookiz from './controllers/my-benefit/benefit.myt-benefit.cookiz';
import BenefitDisPgm from './controllers/program/benefit.dis-pgm';
import BenefitTerminateTbCombination from './controllers/benefit.terminate.tb-combination.controller';
import BenefitSubmainCombinationPreview from './controllers/submain/benefit.submain.combination-preview.info.controller';

class BenefitRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain });

    this.controllers.push({ url: '/submain', controller: BenefitIndex });
    this.controllers.push({ url: '/my-benefit/military', controller: BenefitMilitary });
    this.controllers.push({ url: '/my-benefit/cookiz', controller: BenefitCookiz });
    this.controllers.push({ url: '/my-benefit', controller: BenefitMyBenefit });

    // new IA
    this.controllers.push({ url: '/submain/detail/dis-pgm', controller: BenefitDisPgm });
    this.controllers.push({ url: '/submain/combination-preview/info', controller: BenefitSubmainCombinationPreview });
    this.controllers.push({ url: '/my', controller: BenefitMyBenefit });
    this.controllers.push({ url: '/my/military', controller: BenefitMilitary });
    this.controllers.push({ url: '/my/cookiz', controller: BenefitCookiz });
    this.controllers.push({ url: '/my', controller: BenefitMyBenefit });
    this.controllers.push({ url: '/my/rainbowpoint', controller: BenefitMyBenefitRainbowPoint });
    this.controllers.push({ url: '/my/rainbowpoint/adjustment', controller: BenefitMyBenefitRainbowPointAdjustment });
    this.controllers.push({ url: '/my/rainbowpoint/transfer', controller: BenefitMyBenefitRainbowPointTransfer });
    this.controllers.push({ url: '/terminate/tb-combination', controller: BenefitTerminateTbCombination });
  }
}

export default BenefitRouter;
