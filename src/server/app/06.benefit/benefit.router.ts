import TwRouter from '../../common/route/tw.router';
import BenefitMembershipJoin from './controllers/membership/benefit.membership.join';
import BenefitIndex from './controllers/index/benefit.index.controller';
import { BenefitMyBenefitRainbowPoint } from './controllers/my-benefit/benefit.my-benefit.rainbow-point.controller';
import BenefitMyBenefitRainbowPointAdjustment from './controllers/my-benefit/benefit.my-benefit.rainbow-point.adjustment.controller';
import BenefitMyBenefitRainbowPointTransfer from './controllers/my-benefit/benefit.my-benefit.rainbow-point.transfer.controller';
import BenefitMembershipPartnerMovieCulture from './controllers/membership/benefit.membership.partner.movieculture';
import BenefitMembershipPartnerShopList from './controllers/membership/benefit.membership.partner.shoplist';
import BenefitMembershipPartnerShopMap from './controllers/membership/benefit.membership.partner.shopmap';
import BenefitMyBenefit from './controllers/my-benefit/benefit.myt-benefit.controller';

class BenefitRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain });

    this.controllers.push({ url: '/membership/join', controller: BenefitMembershipJoin });
    this.controllers.push({ url: '/index', controller: BenefitIndex });
    this.controllers.push({ url: '/my-benefit/rainbow-point', controller: BenefitMyBenefitRainbowPoint });
    this.controllers.push({ url: '/my-benefit/rainbow-point/adjustment', controller: BenefitMyBenefitRainbowPointAdjustment });
    this.controllers.push({ url: '/my-benefit/rainbow-point/transfer', controller: BenefitMyBenefitRainbowPointTransfer });
    this.controllers.push({ url: '/membership/partner/movieculture', controller: BenefitMembershipPartnerMovieCulture });
    this.controllers.push({ url: '/membership/partner/shoplist', controller: BenefitMembershipPartnerShopList });
    this.controllers.push({ url: '/membership/partner/shopmap', controller: BenefitMembershipPartnerShopMap });
    this.controllers.push({ url: '/my-benefit', controller: BenefitMyBenefit });
  }
}

export default BenefitRouter;
