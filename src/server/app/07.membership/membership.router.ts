/**
 * @file membership.router.ts
 * @author
 * @since 2018.05
 */

import TwRouter from '../../common/route/tw.router';
import MembershipJoinController from './controllers/join/membership.join.controller';
import MembershipBenefitBrandList from './controllers/benefit/membership.benefit.brand.list.controller';
import MembershipBenefitBrandMap from './controllers/benefit/membership.benefit.brand.map.controller';
import MembershipBenefitMovieculture from './controllers/benefit/membership.benefit.movieculture';
import MembershipInfoGrade from './controllers/info/membership.info.grade.controller';
import MembershipBenefitBrand from './controllers/benefit/membership.benefit.brand.controller';
import MembershipBenefitBrandBenefit from './controllers/benefit/membership.benefit.brand-benefit.controller';
import MembershipSubmain from './controllers/membership.submain.controller';
import MembershipMy from './controllers/my/membership.my.controller';
import MembershipMyUpdate from './controllers/my/membership.my.update.controller';
import MembershipMyHistory from './controllers/my/membership.my.history.controller';
import MembershipMyCancel from './controllers/my/membership.my.cancel.controller';
import MembershipMyReissue from './controllers/my/membership.my.reissue.controller';
import MembershipJoinComplete from './controllers/join/membership.join.complete';

class MembershipRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/join', controller: MembershipJoinController });
    this.controllers.push({ url: '/benefit/brand', controller: MembershipBenefitBrand });
    this.controllers.push({ url: '/benefit/brand-benefit', controller: MembershipBenefitBrandBenefit });
    this.controllers.push({ url: '/benefit/map', controller: MembershipBenefitBrandMap });
    this.controllers.push({ url: '/benefit/brand/list', controller: MembershipBenefitBrandList });
    this.controllers.push({ url: '/benefit/movieculture', controller: MembershipBenefitMovieculture });
    this.controllers.push({ url: '/membership_info/mbrs_0001', controller: MembershipInfoGrade });
    this.controllers.push({ url: '/submain', controller: MembershipSubmain });
    this.controllers.push({ url: '/my', controller: MembershipMy });
    this.controllers.push({ url: '/my/update', controller: MembershipMyUpdate });
    this.controllers.push({ url: '/my/history', controller: MembershipMyHistory });
    this.controllers.push({ url: '/my/cancel', controller: MembershipMyCancel });
    this.controllers.push({ url: '/my/reissue', controller: MembershipMyReissue });
    this.controllers.push({ url: '/join/complete', controller: MembershipJoinComplete });

    // 미사용 url
    // this.controllers.push({ url: '/benefit/t-day', controller: MembershipBenefitTday });
    // this.controllers.push({ url: '/benefit/plus', controller: MembershipBenefitPlus });
  }
}

export default MembershipRouter;
