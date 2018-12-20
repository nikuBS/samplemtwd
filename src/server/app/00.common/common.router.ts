/**
 * FileName: common.router.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

import TwRouter from '../../common/route/tw.router';
import CommonError from './controllers/util/common.util.error.controller';
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
import CommonMemberLoginCustPwdFail from './controllers/member/common.member.login.cust-pwdfail.controller';
import CommonMemberLoginRoute from './controllers/member/common.member.login.route.controller';
import CommonMemberSloginIos from './controllers/member/common.member.slogin.ios.controller';
import CommonMemberSloginFail from './controllers/member/common.member.slogin.fail.controller';
import CommonMemberSloginAos from './controllers/member/common.member.slogin.aos.controller';
import CommonMemberLoginReactive from './controllers/member/common.member.login.reactive.controller';
import CommonMemberLoginCustPwd from './controllers/member/common.member.login.cust-pwd.controller';
import CommonMemberLoginExceedFail from './controllers/member/common.member.login.exceed-fail.controller';
import CommonMemberSignupGuide from './controllers/member/common.member.signup-guide.controller';
import CommonMemberManage from './controllers/member/common.member.manage.controller';
import CommonMemberTidPwd from './controllers/member/common.member.tid-pwd.controller';
import CommonShareLanding from './controllers/share/common.share.landing.controller';
import CommonShareBridge from './controllers/share/common.share.bridge.controller';
import CommonCertIpinRefund from './controllers/cert/common.cert.ipin.refund.controller';
import CommonCertResult from './controllers/cert/common.cert.result.controller';
import CommonCertNiceRefund from './controllers/cert/common.cert.nice.refund.controller';
import CommonTidCertPw from './controllers/tid/common.tid.cert-pw.controller';
import CommonShareAppInstallInfo from './controllers/share/common.share.app-install.info.controller';
import CommonMemberWithdrawalComplete from './controllers/member/common.member.withdrawal-complete';
import CommonMemberLogin from './controllers/member/common.member.login.controller';
import CommonSearchResult from './controllers/search/common.search.controller';
import CommonSearchMore from './controllers/search/common.search.more.controller';
import CommonSearch from './controllers/search/common.search.controller';
import CommonSearchInResult from './controllers/search/common.search.in_result.controller';
import CommonMemberInit from './controllers/member/common.member.init.controller';

export default class CommonRouter extends TwRouter {
  constructor() {
    super();
    // cert
    this.controllers.push({ url: '/cert/motp', controller: CommonCertMotp });
    this.controllers.push({ url: '/cert/motp/fail', controller: CommonCertMotpFail });
    this.controllers.push({ url: '/cert/public/export', controller: CommonCertPublicExport });
    this.controllers.push({ url: '/cert/nice', controller: CommonCertNice });
    this.controllers.push({ url: '/cert/nice/refund', controller: CommonCertNiceRefund });
    this.controllers.push({ url: '/cert/ipin', controller: CommonCertIpin });
    this.controllers.push({ url: '/cert/ipin/refund', controller: CommonCertIpinRefund });
    this.controllers.push({ url: '/cert/complete', controller: CommonCertComplete });
    this.controllers.push( {url: '/cert/result', controller: CommonCertResult, post: true});

    // member - login
    this.controllers.push({ url: '/member/init', controller: CommonMemberInit });
    this.controllers.push({ url: '/member/login', controller: CommonMemberLogin });
    this.controllers.push({ url: '/member/login/route', controller: CommonMemberLoginRoute });
    this.controllers.push({ url: '/member/login/fail', controller: CommonMemberLoginFail});
    this.controllers.push({ url: '/member/login/exceed-fail', controller: CommonMemberLoginExceedFail });
    this.controllers.push({ url: '/member/login/cust-pwd', controller: CommonMemberLoginCustPwd });
    this.controllers.push({ url: '/member/login/cust-pwdfail', controller: CommonMemberLoginCustPwdFail });
    this.controllers.push({ url: '/member/login/reactive', controller: CommonMemberLoginReactive });
    // member - slogin
    this.controllers.push({ url: '/member/slogin/aos', controller: CommonMemberSloginAos });
    this.controllers.push({ url: '/member/slogin/ios', controller: CommonMemberSloginIos });
    this.controllers.push({ url: '/member/slogin/fail', controller: CommonMemberSloginFail });
    // logout
    this.controllers.push({ url: '/member/logout/complete', controller: CommonMemberLogoutComplete });
    this.controllers.push({ url: '/member/logout/expire', controller: CommonMemberLogoutExpire });
    this.controllers.push({ url: '/member/logout/route', controller: CommonMemberLogoutRoute });
    // member - line
    this.controllers.push({ url: '/member/line', controller: CommonMemberLine });
    this.controllers.push({ url: '/member/line/edit', controller: CommonMemberLineEdit });
    this.controllers.push({ url: '/member/line/biz-register', controller: CommonMemberLineBizRegister });
    this.controllers.push({ url: '/member/line/empty', controller: CommonMemberLineEmpty });
    // member
    this.controllers.push({ url: '/member/manage', controller: CommonMemberManage });
    this.controllers.push({ url: '/member/tid-pwd', controller: CommonMemberTidPwd });
    this.controllers.push({ url: '/member/signup-guide', controller: CommonMemberSignupGuide });
    this.controllers.push({ url: '/member/withdrawal-complete', controller: CommonMemberWithdrawalComplete });

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
    this.controllers.push( {url: '/tid/cert-pw', controller: CommonTidCertPw });
    // error
    this.controllers.push({ url: '/error', controller: CommonError });
    // share
    this.controllers.push({ url: '/share/landing', controller: CommonShareLanding });
    this.controllers.push({ url: '/share/bridge', controller: CommonShareBridge });
    this.controllers.push({ url: '/share/app-install/info', controller: CommonShareAppInstallInfo });

    //search
    this.controllers.push({ url: '/search', controller: CommonSearch});
    this.controllers.push({ url: '/search/more', controller: CommonSearchMore });
    this.controllers.push({ url: '/search/in_result', controller: CommonSearchInResult });
  }
}
