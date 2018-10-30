import TwRouter from '../../common/route/tw.router';
import BenefitMembershipJoin from './controllers/membership/benefit.membership.join';
import BenefitIndex from './controllers/index/benefit.index.controller';
import BenefitMyBenefitRainbowPoint from './controllers/my-benefit/benefit.my-benefit.rainbow-point.controller';
import BenefitMembershipPartnerMovieCulture from './controllers/membership/benefit.membership.partner.movieculture';
import BenefitMembershipPartnerShopList from './controllers/membership/benefit.membership.partner.shoplist';
import BenefitMembershipPartnerShopMap from './controllers/membership/benefit.membership.partner.shopmap';

class BenefitRouter extends TwRouter {
  constructor() {
    super();
    // this.controllers.push({ url: '/', controller: HomeMain });

    this.controllers.push({ url: '/membership/join', controller: BenefitMembershipJoin });
    this.controllers.push({ url: '/index', controller: BenefitIndex });
    this.controllers.push({ url: '/my-benefit/rainbow-point', controller: BenefitMyBenefitRainbowPoint });
    this.controllers.push({ url: '/membership/partner/movieculture', controller: BenefitMembershipPartnerMovieCulture });
    this.controllers.push({ url: '/membership/partner/shoplist', controller: BenefitMembershipPartnerShopList });
    this.controllers.push({ url: '/membership/partner/shopmap', controller: BenefitMembershipPartnerShopMap });
  }
}

export default BenefitRouter;
