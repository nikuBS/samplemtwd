import TwRouter from '../../common/route/tw.router';
import BenefitIndex from './controllers/index/benefit.index.controller';
import { BenefitMyBenefitRainbowPoint } from './controllers/my-benefit/benefit.my-benefit.rainbow-point.controller';
import BenefitMyBenefitRainbowPointAdjustment from './controllers/my-benefit/benefit.my-benefit.rainbow-point.adjustment.controller';
import BenefitMyBenefitRainbowPointAdjustmentComplete from './controllers/my-benefit/benefit.my-benefit.rainbow-point.adjustment-complete.controller';
import BenefitMyBenefitRainbowPointTransfer from './controllers/my-benefit/benefit.my-benefit.rainbow-point.transfer.controller';
import BenefitMyBenefitRainbowPointTransferComplete from './controllers/my-benefit/benefit.my-benefit.rainbow-point.transfer-complete.controller';
import BenefitMyBenefit from './controllers/my-benefit/benefit.myt-benefit.controller';
import BenefitMilitary from './controllers/my-benefit/benefit.myt-benefit.military';
import BenefitCookiz from './controllers/my-benefit/benefit.myt-benefit.cookiz';
import BenefitSelectContractController from './controllers/program/benefit.select-contract.controller';
import BenefitTPlusSalesController from './controllers/program/benefit.t-plus-sales.controller';
import BenefitDisPgmInput from './controllers/program/benefit.dis-pgm.input.controller';
import BenefitDisPgmCancel from './controllers/program/benefit.dis-pgm.cancel.controller';
import BenefitSubmainCombinationPreview from './controllers/submain/benefit.submain.combination-preview.info.controller';
import BenefitSubmainFareInfo from './controllers/submain/benefit.submain.fare.info.controller';
import BenefitJoinTbCombination from './controllers/benefit.join.tb-combination.controller';
import BenefitTerminateTbCombination from './controllers/terminate/benefit.terminate.tb-combination.controller';
import BenefitTerminateAllFamily from './controllers/terminate/benefit.terminate.all-family.controller';
import BenefitTerminateAllFamilyFree from './controllers/terminate/benefit.terminate.all-family-free.controller';

class BenefitRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/submain', controller: BenefitIndex });
    this.controllers.push({ url: '/submain(/discount|/combinations|/long-term|/participation)?', controller: BenefitIndex });
    this.controllers.push({ url: '/submain/detail/select-contract', controller: BenefitSelectContractController });
    this.controllers.push({ url: '/submain/detail/dis-pgm/input', controller: BenefitDisPgmInput });
    this.controllers.push({ url: '/submain/detail/dis-pgm/cancel', controller: BenefitDisPgmCancel });
    this.controllers.push({ url: '/submain/detail/t-plus-sales', controller: BenefitTPlusSalesController });
    this.controllers.push({ url: '/submain/combination-preview/info', controller: BenefitSubmainCombinationPreview });
    this.controllers.push({ url: '/submain/fare/info(/restrict-law|/joinable-product)?', controller: BenefitSubmainFareInfo });
    this.controllers.push({ url: '/my', controller: BenefitMyBenefit });
    this.controllers.push({ url: '/my/military', controller: BenefitMilitary });
    this.controllers.push({ url: '/my/cookiz', controller: BenefitCookiz });
    this.controllers.push({ url: '/my/rainbowpoint', controller: BenefitMyBenefitRainbowPoint });
    this.controllers.push({ url: '/my/rainbowpoint/adjustment', controller: BenefitMyBenefitRainbowPointAdjustment });
    this.controllers.push({ url: '/my/rainbowpoint/adjustment/complete', controller: BenefitMyBenefitRainbowPointAdjustmentComplete });
    this.controllers.push({ url: '/my/rainbowpoint/transfer', controller: BenefitMyBenefitRainbowPointTransfer });
    this.controllers.push({ url: '/my/rainbowpoint/transfer/complete', controller: BenefitMyBenefitRainbowPointTransferComplete });
    this.controllers.push({ url: '/join/tb-combination', controller: BenefitJoinTbCombination });
    this.controllers.push({ url: '/terminate/tb-combination', controller: BenefitTerminateTbCombination });
    this.controllers.push({ url: '/terminate/all-family', controller: BenefitTerminateAllFamily });
    this.controllers.push({ url: '/terminate/all-family-free', controller: BenefitTerminateAllFamilyFree });
  }
}

export default BenefitRouter;
