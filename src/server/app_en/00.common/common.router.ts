/**
 * @file common.router.ts
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.10.02
 */

import TwRouter from '../../common_en/route/tw.router';
import CommonMemberLine from './controllers/member/common.member.line.controller';
import CommonMemberLineEmpty from './controllers/member/common.member.line.empty.controller';
import CommonMemberLineRegister from './controllers/member/common.member.line.register.controller';
import CommonMemberLogoutComplete from './controllers/member/common.member.logout.complete.controller';
import CommonMemberLogoutExpire from './controllers/member/common.member.logout.expire.controller';
import CommonMemberLogoutRoute from './controllers/member/common.member.logout.route.controller';
import CommonTidLogin from './controllers/tid/common.tid.login.controller';
import CommonTidAccountInfo from './controllers/tid/common.tid.account-info.controller';
import CommonTidChangePw from './controllers/tid/common.tid.change-pw.controller';
import CommonTidFindId from './controllers/tid/common.tid.find-id.controller';
import CommonTidFindPw from './controllers/tid/common.tid.find-pw.controller';
import CommonTidLogout from './controllers/tid/common.tid.logout.controller';
import CommonTidSignUpLocal from './controllers/tid/common.tid.signup-local.controller';
import CommonTidSignUpForeigner from './controllers/tid/common.tid.signup-foreigner.controller';
import CommonTidRoute from './controllers/tid/common.tid.route';
import CommonMemberLoginFail from './controllers/member/common.member.login.fail.controller';
import CommonMemberLoginCustPwdFail from './controllers/member/common.member.login.cust-pwdfail.controller';
import CommonMemberLoginRoute from './controllers/member/common.member.login.route.controller';
import CommonMemberSloginIos from './controllers/member/common.member.slogin.ios.controller';
import CommonMemberSloginAos from './controllers/member/common.member.slogin.aos.controller';
import CommonMemberLoginReactive from './controllers/member/common.member.login.reactive.controller';
import CommonMemberLoginCustPwd from './controllers/member/common.member.login.cust-pwd.controller';
import CommonMemberLoginExceedFail from './controllers/member/common.member.login.exceed-fail.controller';
import CommonMemberTidPwd from './controllers/member/common.member.tid-pwd.controller';
import CommonTidCertPw from './controllers/tid/common.tid.cert-pw.controller';
import CommonMemberInit from './controllers/member/common.member.init.controller';
import CommonMemberLoginLost from './controllers/member/common.member.login.lost.controller';
import CommonMemberSignupRoute from './controllers/member/common.member.signup.route.controller';
import CommonMemberManage from './controllers/member/common.member.manage.controller';

export default class CommonRouter extends TwRouter {
  constructor() {
    super();

    // member - login
    this.controllers.push({ url: '/member/init', controller: CommonMemberInit });
    this.controllers.push({ url: '/member/signup/route', controller: CommonMemberSignupRoute });
    this.controllers.push({ url: '/member/login/route', controller: CommonMemberLoginRoute });
    this.controllers.push({ url: '/member/login/fail', controller: CommonMemberLoginFail});
    this.controllers.push({ url: '/member/login/exceed-fail', controller: CommonMemberLoginExceedFail });
    this.controllers.push({ url: '/member/login/cust-pwd', controller: CommonMemberLoginCustPwd });
    this.controllers.push({ url: '/member/login/cust-pwdfail', controller: CommonMemberLoginCustPwdFail });
    this.controllers.push({ url: '/member/login/reactive', controller: CommonMemberLoginReactive });
    this.controllers.push({ url: '/member/login/lost', controller: CommonMemberLoginLost });

    // member - slogin
    this.controllers.push({ url: '/member/slogin/aos', controller: CommonMemberSloginAos });
    this.controllers.push({ url: '/member/slogin/ios', controller: CommonMemberSloginIos });

    // logout
    this.controllers.push({ url: '/member/logout/complete', controller: CommonMemberLogoutComplete });
    this.controllers.push({ url: '/member/logout/expire', controller: CommonMemberLogoutExpire });
    this.controllers.push({ url: '/member/logout/route', controller: CommonMemberLogoutRoute });

    // member - line
    this.controllers.push({ url: '/member/line', controller: CommonMemberLine });
    this.controllers.push({ url: '/member/line/empty', controller: CommonMemberLineEmpty });
    this.controllers.push({ url: '/member/line/register', controller: CommonMemberLineRegister });

    // member
    this.controllers.push({ url: '/member/manage', controller: CommonMemberManage });
    this.controllers.push({ url: '/member/tid-pwd', controller: CommonMemberTidPwd });
 
    // tid
    this.controllers.push({ url: '/tid/login', controller: CommonTidLogin });
    this.controllers.push({ url: '/tid/account', controller: CommonTidAccountInfo });
    this.controllers.push({ url: '/tid/change-pw', controller: CommonTidChangePw });
    this.controllers.push({ url: '/tid/find-id', controller: CommonTidFindId });
    this.controllers.push({ url: '/tid/find-pw', controller: CommonTidFindPw });
    this.controllers.push({ url: '/tid/logout', controller: CommonTidLogout });
    this.controllers.push({ url: '/tid/signup-local', controller: CommonTidSignUpLocal });
    this.controllers.push({ url: '/tid/signup-foreigner', controller: CommonTidSignUpForeigner });
    this.controllers.push({ url: '/tid/route', controller: CommonTidRoute });
    this.controllers.push( {url: '/tid/cert-pw', controller: CommonTidCertPw });


  }
}
