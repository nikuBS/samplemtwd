import TwRouter from '../../common/route/tw.router';
import MembershipJoin from './controllers/join/membership.join';
import MembershipBenefitBrandList from './controllers/benefit/membership.benefit.brand.list.controller';
import MembershipBenefitBrandMap from './controllers/benefit/membership.benefit.brand.map.controller';
import MembershipBenefitMovieculture from './controllers/benefit/membership.benefit.movieculture';
import MembershipInfoGrade from './controllers/info/membership.info.grade.controller';
import MembershipBenefitBrand from './controllers/benefit/membership.benefit.brand.controller';
import MembershipBenefitBrandBenefit from './controllers/benefit/membership.benefit.brand-benefit.controller';
import MembershipBenefitPlus from './controllers/benefit/membership.benefit.plus.controller';

class MembershipRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/membership/join', controller: MembershipJoin });
    this.controllers.push({ url: '/membership_benefit/mbrs_0001', controller: MembershipBenefitBrand });
    this.controllers.push({ url: '/membership_benefit/mbrs_0002', controller: MembershipBenefitBrandBenefit });
    this.controllers.push({ url: '/membership_benefit/mbrs_0004', controller: MembershipBenefitBrandMap });
    this.controllers.push({ url: '/membership_benefit/mbrs_0005', controller: MembershipBenefitBrandList });
    this.controllers.push({ url: '/membership_benefit/mbrs_0007', controller: MembershipBenefitPlus });
    this.controllers.push({ url: '/membership_benefit/mbrs_0010', controller: MembershipBenefitMovieculture });
    this.controllers.push({ url: '/membership_info/mbrs_0001', controller: MembershipInfoGrade });
  }
}

export default MembershipRouter;
