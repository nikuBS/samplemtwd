import TwRouter from '../../common/route/tw.router';
import MembershipBenefitFranchiseeList from './controllers/benefit/membership.benefit.franchisee.list';
import MembershipBenefitFranchiseeMap from './controllers/benefit/membership.benefit.franchisee.map';
import MembershipBenefitMovieculture from './controllers/benefit/membership.benefit.movieculture';
import MembershipInfoGrade from './controllers/info/membership.info.grade.controller';

class MembershipRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/membership_benefit/mbrs_0001', controller: MembershipBenefitFranchiseeList });
    this.controllers.push({ url: '/membership_benefit/mbrs_0002', controller: MembershipBenefitFranchiseeMap });
    this.controllers.push({ url: '/membership_benefit/mbrs_0003', controller: MembershipBenefitMovieculture });
    this.controllers.push({ url: '/membership_info/mbrs_0001', controller: MembershipInfoGrade });
  }
}

export default MembershipRouter;
