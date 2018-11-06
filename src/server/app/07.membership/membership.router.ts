import TwRouter from '../../common/route/tw.router';
import MembershipBenefitFranchiseeList from './controllers/benefit/membership.benefit.franchisee.list';
import MembershipBenefitBrandMap from './controllers/benefit/membership.benefit.brand.map.controller';
import MembershipBenefitMovieculture from './controllers/benefit/membership.benefit.movieculture';
import MembershipInfoGrade from './controllers/info/membership.info.grade.controller';
import MembershipBenefitBrand from './controllers/benefit/membership.benefit.brand.controller';
import MembershipBenefitBrandBenefit from './controllers/benefit/membership.benefit.brand-benefit.controller';

class MembershipRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/membership_benefit/mbrs_0001', controller: MembershipBenefitBrand });
    this.controllers.push({ url: '/membership_benefit/mbrs_0002', controller: MembershipBenefitBrandBenefit });
    this.controllers.push({ url: '/membership_benefit/mbrs_0006', controller: MembershipBenefitFranchiseeList });
    this.controllers.push({ url: '/membership_benefit/mbrs_0004', controller: MembershipBenefitBrandMap });
    this.controllers.push({ url: '/membership_benefit/mbrs_0003', controller: MembershipBenefitMovieculture });
    this.controllers.push({ url: '/membership_info/mbrs_0001', controller: MembershipInfoGrade });
  }
}

export default MembershipRouter;
