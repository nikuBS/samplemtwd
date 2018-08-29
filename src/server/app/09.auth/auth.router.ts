import TwRouter from '../../common/route/tw.router';
import AuthTidLogin from './controllers/tid/auth.tid.login.controller';
import AuthLoginFail from './controllers/login/auth.login.fail.controller';
import AuthLoginDormancy from './controllers/login/auth.login.dormancy.controller';
import AuthLoginFindIdPwd from './controllers/login/auth.login.find-id-pwd.controller';
import AuthLoginCustomerPwd from './controllers/login/auth.login.customer-pwd.controller';
import AuthLoginCustomerPwdFail from './controllers/login/auth.login.customer-pwd-fail.controller';
import AuthSignupGuide from './controllers/signup/auth.signup.guide.controller';
import AuthMemberManagement from './controllers/member/auth.member.management.controller';
import AuthWithdrawalGuide from './controllers/withdrawal/auth.withdrawal.guide.controller';
import AuthWithdrawalSurvey from './controllers/withdrawal/auth.withdrawal.survey.controller';
import AuthWithdrawalComplete from './controllers/withdrawal/auth.withdrawal.complete.controller';
import AuthLine from './controllers/line/auth.line.controller';
import AuthTidAccountInfo from './controllers/tid/auth.tid.account-info.controller';
import AuthTidGuide from './controllers/tid/auth.tid.guide.controller';
import AuthLineEdit from './controllers/line/auth.line.edit.controller';
import AuthLineCopRegister from './controllers/line/auth.line.cop-register.controller';
import AuthLineEmptyRegister from './controllers/line/auth.line.empty-register.controller';
import AuthTidChangePw from './controllers/tid/auth.tid.change-pw.controller';
import AuthTidFindId from './controllers/tid/auth.tid.find-id.controller';
import AuthTidFindPw from './controllers/tid/auth.tid.find-pw.controller';
import AuthTidLogout from './controllers/tid/auth.tid.logout.controller';
import AuthTidSignUpLocal from './controllers/tid/auth.tid.signup-local.controller';
import AuthTidSignUpForeigner from './controllers/tid/auth.tid.signup-foreigner.controller';
import AuthLogoutComplete from './controllers/logout/auth.logout.complete.controller';
import AuthLogoutExpire from './controllers/logout/auth.logout.expire.controller';
import AuthLoginRoute from './controllers/login/auth.login.route.controller';
import AuthLoginExceedFail from './controllers/login/auth.login.exceed-fail.controller';
import AuthLogoutRoute from './controllers/logout/auth.logout.route.controller';
import AuthTidRoute from './controllers/tid/auth.tid.route';
import AuthLoginEasyAos from './controllers/login/auth.login.easy-aos.controller';
import AuthLoginEasyIos from './controllers/login/auth.login.easy-ios.controller';
import AuthLoginEasyFail from './controllers/login/auth.login.easy-fail.controller';
import AuthCertNice from './controllers/cert/auth.cert.nice.controller';
import AuthCertIpin from './controllers/cert/auth.cert.ipin.controller';
import AuthCertMotp from './controllers/cert/auth.cert.motp.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    // line
    this.controllers.push({ url: '/line', controller: new AuthLine() });
    this.controllers.push({ url: '/line/edit', controller: new AuthLineEdit() });
    this.controllers.push({ url: '/line/register/corporation', controller: new AuthLineCopRegister() });
    this.controllers.push({ url: '/line/register/empty', controller: new AuthLineEmptyRegister() });
    // login
    this.controllers.push({ url: '/login/exceed-fail', controller: new AuthLoginExceedFail() });
    this.controllers.push({ url: '/login/fail', controller: new AuthLoginFail() });
    this.controllers.push({ url: '/login/dormancy', controller: new AuthLoginDormancy() });
    this.controllers.push({ url: '/login/find-id-pwd', controller: new AuthLoginFindIdPwd() });
    this.controllers.push({ url: '/login/customer-pwd', controller: new AuthLoginCustomerPwd() });
    this.controllers.push({ url: '/login/customer-pwd-fail', controller: new AuthLoginCustomerPwdFail() });
    this.controllers.push({ url: '/login/route', controller: new AuthLoginRoute() });
    this.controllers.push({ url: '/login/easy-aos', controller: new AuthLoginEasyAos() });
    this.controllers.push({ url: '/login/easy-ios', controller: new AuthLoginEasyIos() });
    this.controllers.push({ url: '/login/easy-fail', controller: new AuthLoginEasyFail() });

    // logout
    this.controllers.push({ url: '/logout/complete', controller: new AuthLogoutComplete() });
    this.controllers.push({ url: '/logout/expire', controller: new AuthLogoutExpire() });
    this.controllers.push({ url: '/logout/route', controller: new AuthLogoutRoute() });
    // member
    this.controllers.push({ url: '/member/management', controller: new AuthMemberManagement() });
    // signup
    this.controllers.push({ url: '/signup/guide', controller: new AuthSignupGuide() });
    // tid
    this.controllers.push({ url: '/tid/login', controller: new AuthTidLogin() });
    this.controllers.push({ url: '/tid/account', controller: new AuthTidAccountInfo() });
    this.controllers.push({ url: '/tid/change-pw', controller: new AuthTidChangePw() });
    this.controllers.push({ url: '/tid/find-id', controller: new AuthTidFindId() });
    this.controllers.push({ url: '/tid/find-pw', controller: new AuthTidFindPw() });
    this.controllers.push({ url: '/tid/logout', controller: new AuthTidLogout() });
    this.controllers.push({ url: '/tid/signup-local', controller: new AuthTidSignUpLocal() });
    this.controllers.push({ url: '/tid/signup-foreigner', controller: new AuthTidSignUpForeigner() });
    this.controllers.push({ url: '/tid/guide', controller: new AuthTidGuide() });
    this.controllers.push({ url: '/tid/route', controller: new AuthTidRoute() });
    // withdrawal
    this.controllers.push({ url: '/withdrawal/guide', controller: new AuthWithdrawalGuide() });
    this.controllers.push({ url: '/withdrawal/survey', controller: new AuthWithdrawalSurvey() });
    this.controllers.push({ url: '/withdrawal/complete', controller: new AuthWithdrawalComplete() });
    // cert
    this.controllers.push({ url: '/cert/motp', controller: new AuthCertMotp() });
    this.controllers.push({ url: '/cert/nice', controller: new AuthCertNice() });
    this.controllers.push({ url: '/cert/ipin', controller: new AuthCertIpin() });
  }
}

export default AuthRouter;
