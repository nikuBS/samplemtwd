/**
 * FileName: common.router.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

import TwRouter from '../../common/route/tw.router';
import CommonError from './controllers/util/common.util.error.controller';
import MainMenuSettingsBiometricsTerms from '../01.main/controllers/menu/settings/main.menu.settings.biometrics.terms.controller';
import MainMenuSettingsBiometricsCert from '../01.main/controllers/menu/settings/main.menu.settings.biometircs.cert.controller';
import MainMenuSettingsBiometrics from '../01.main/controllers/menu/settings/main.menu.settings.biometrics.cotroller';
import MainMenuSettingsBiometricsRegister from '../01.main/controllers/menu/settings/main.menu.settings.bometrics.register.controller';
import CommonCertMotp from './controllers/cert/common.cert.motp.controller';
import CommonCertMotpFail from './controllers/cert/common.cert.motp-fail.controller';
import CommonCertPublicExport from './controllers/cert/common.cert.public-export.controller';
import CommonCertNice from './controllers/cert/common.cert.nice.controller';
import CommonCertIpin from './controllers/cert/common.cert.ipin.controller';
import CommonCertComplete from './controllers/cert/common.cert.complete.controller';
import CommonMemberLine from './controllers/member/common.member.line.controller';
import CommonMemberLineEdit from './controllers/member/common.member.line.edit.controller';
import CommonMemberLineBizRegister from './controllers/member/common.member.line.biz-register.controller';
import CommonMemberLineEmpty from './controllers/member/common.member.line.empty.controller';
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
import CommonTidGuide from './controllers/tid/common.tid.guide.controller';
import CommonTidRoute from './controllers/tid/common.tid.route';
import CommonMemberLoginFail from './controllers/member/common.member.login.fail.controller';
import CommonLoginCustomerPwdFail from './controllers/login/common.login.customer-pwd-fail.controller';
import CommonMemberLoginRoute from './controllers/member/common.member.login.route.controller';
import CommonMemberSloginIos from './controllers/member/common.member.slogin.ios.controller';
import CommonMemberSloginFail from './controllers/member/common.member.slogin.fail.controller';
import CommonMemberSloginAos from './controllers/member/common.member.slogin.aos.controller';
import CommonLoginDormancy from './controllers/login/common.login.dormancy.controller';
import CommonLoginCustomerPwd from './controllers/login/common.login.customer-pwd.controller';
import CommonMemberLoginExceedFail from './controllers/member/common.member.login.exceed-fail.controller';
import CommonSignupGuide from './controllers/signup/common.signup.guide.controller';
import CommonMemberManage from './controllers/member/common.member.manage.controller';
import CommonMemberTidPwd from './controllers/member/common.member.tid-pwd.controller';
import CommonShareLanding from './controllers/share/common.share.landing.controller';
import CommonShareBridge from './controllers/share/common.share.bridge.controller';

export default class CommonRouter extends TwRouter {
  constructor() {
    super();
    // cert
    this.controllers.push({ url: '/cert/motp', controller: CommonCertMotp });
    this.controllers.push({ url: '/cert/motp/fail', controller: CommonCertMotpFail });
    this.controllers.push({ url: '/cert/public/export', controller: CommonCertPublicExport });
    this.controllers.push({ url: '/cert/nice', controller: CommonCertNice });
    this.controllers.push({ url: '/cert/ipin', controller: CommonCertIpin });
    this.controllers.push({ url: '/cert/complete', controller: CommonCertComplete });

    this.controllers.push({ url: '/login/dormancy', controller: CommonLoginDormancy });
    this.controllers.push({ url: '/login/customer-pwd', controller: CommonLoginCustomerPwd });
    this.controllers.push({ url: '/login/customer-pwd-fail', controller: CommonLoginCustomerPwdFail });

    // member - login
    this.controllers.push({ url: '/member/login/route', controller: CommonMemberLoginRoute });
    this.controllers.push({ url: '/member/login/fail', controller: CommonMemberLoginFail});
    this.controllers.push({ url: '/member/login/exceed-fail', controller: CommonMemberLoginExceedFail });
    // member - slogin
    this.controllers.push({ url: '/member/slogin/aos', controller: CommonMemberSloginAos });
    this.controllers.push({ url: '/member/slogin/ios', controller: CommonMemberSloginIos });
    this.controllers.push({ url: '/member/slogin/fail', controller: CommonMemberSloginFail });
    // logout
    this.controllers.push({ url: '/member/logout/complete', controller: CommonMemberLogoutComplete });
    this.controllers.push({ url: '/member/logout/expire', controller: CommonMemberLogoutExpire });
    this.controllers.push({ url: '/memberlogout/route', controller: CommonMemberLogoutRoute });
    // member - line
    this.controllers.push({ url: '/member/line', controller: CommonMemberLine });
    this.controllers.push({ url: '/member/line/edit', controller: CommonMemberLineEdit });
    this.controllers.push({ url: '/member/line/biz-register', controller: CommonMemberLineBizRegister });
    this.controllers.push({ url: '/member/line/empty', controller: CommonMemberLineEmpty });
    // member
    this.controllers.push({ url: '/member/manage', controller: CommonMemberManage });
    this.controllers.push({ url: '/member/tid-pwd', controller: CommonMemberTidPwd });

    // signup
    this.controllers.push({ url: '/signup/guide', controller: CommonSignupGuide });
    // tid
    this.controllers.push({ url: '/tid/login', controller: CommonTidLogin });
    this.controllers.push({ url: '/tid/account', controller: CommonTidAccountInfo });
    this.controllers.push({ url: '/tid/change-pw', controller: CommonTidChangePw });
    this.controllers.push({ url: '/tid/find-id', controller: CommonTidFindId });
    this.controllers.push({ url: '/tid/find-pw', controller: CommonTidFindPw });
    this.controllers.push({ url: '/tid/logout', controller: CommonTidLogout });
    this.controllers.push({ url: '/tid/signup-local', controller: CommonTidSignUpLocal });
    this.controllers.push({ url: '/tid/signup-foreigner', controller: CommonTidSignUpForeigner });
    this.controllers.push({ url: '/tid/guide', controller: CommonTidGuide });
    this.controllers.push({ url: '/tid/route', controller: CommonTidRoute });
    // error
    this.controllers.push({ url: '/error', controller: CommonError });
    // share
    this.controllers.push({ url: '/share/landing', controller: CommonShareLanding });
    this.controllers.push({ url: '/share/bridge', controller: CommonShareBridge });
  }
}
