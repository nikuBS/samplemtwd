import TwRouter from '../../common/route/tw.router';
import MembershipJoinController from './controllers/join/membership.join.controller';
import MembershipBenefitBrandList from './controllers/benefit/membership.benefit.brand.list.controller';
import MembershipBenefitBrandMap from './controllers/benefit/membership.benefit.brand.map.controller';
import MembershipBenefitMovieculture from './controllers/benefit/membership.benefit.movieculture';
import MembershipBenefitTday from './controllers/benefit/membership.benefit.tday';
import MembershipInfoGrade from './controllers/info/membership.info.grade.controller';
import MembershipBenefitBrand from './controllers/benefit/membership.benefit.brand.controller';
import MembershipBenefitBrandBenefit from './controllers/benefit/membership.benefit.brand-benefit.controller';
import MembershipBenefitPlus from './controllers/benefit/membership.benefit.plus.controller';
import MembershipSubmain from './controllers/membership.submain.controller';
import MembershipMy from './controllers/my/membership.my.controller';
import MembershipMyUpdate from './controllers/my/membership.my.update.controller';
import MembershipMyHistory from './controllers/my/membership.my.history.controller';

class MembershipRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/join', controller: MembershipJoinController });
    this.controllers.push({ url: '/benefit/brand', controller: MembershipBenefitBrand });
    this.controllers.push({ url: '/benefit/brand-benefit', controller: MembershipBenefitBrandBenefit });
    this.controllers.push({ url: '/benefit/map', controller: MembershipBenefitBrandMap });
    this.controllers.push({ url: '/benefit/brand/list', controller: MembershipBenefitBrandList });
    this.controllers.push({ url: '/benefit/plus', controller: MembershipBenefitPlus });
    this.controllers.push({ url: '/benefit/t-day', controller: MembershipBenefitTday });
    this.controllers.push({ url: '/benefit/movieculture', controller: MembershipBenefitMovieculture });
    this.controllers.push({ url: '/membership_info/mbrs_0001', controller: MembershipInfoGrade });
    this.controllers.push({ url: '/submain', controller: MembershipSubmain });
    this.controllers.push({ url: '/my', controller: MembershipMy });
    this.controllers.push({ url: '/my/update', controller: MembershipMyUpdate });
    this.controllers.push({ url: '/my/history', controller: MembershipMyHistory });
  }
}

export default MembershipRouter;
