import TwRouter from '../../common/route/tw.router';
import AuthTidLogin from './controllers/tid/auth.tid.login.controller';
import AuthSignupGuide from './controllers/signup/auth.signup.guide.controller';
import AuthMemberManagement from './controllers/member/auth.member.management.controller';
import AuthWithdrawalGuide from './controllers/withdrawal/auth.withdrawal.guide.controller';
import AuthWithdrawalSurvey from './controllers/withdrawal/auth.withdrawal.survey.controller';
import AuthLine from './controllers/line/auth.line.controller';
import AuthTidAccountInfo from './controllers/tid/auth.tid.account-info.controller';
import AuthTidGuide from './controllers/tid/auth.tid.guide.controller';
import AuthLineEdit from './controllers/line/auth.line.edit.controller';
import AuthLineRegisterGuide from './controllers/line/auth.line.register-guide.controller';
import AuthLineCopRegister from './controllers/line/auth.line.cop-register.controller';
import AuthLineEmptyRegister from './controllers/line/auth.line.empty-register.controller';
import AuthTidChangePw from './controllers/tid/auth.tid.change-pw.controller';
import AuthTidFindId from './controllers/tid/auth.tid.find-id.controller';
import AuthTidFindPw from './controllers/tid/auth.tid.find-pw.controller';
import AuthTidLogout from './controllers/tid/auth.tid.logout.controller';
import AuthTidSignUp from './controllers/tid/auth.tid.signup.controller';
import AuthLogoutComplete from './controllers/logout/auth.logout.complete.controller';
import AuthLogoutExpire from './controllers/logout/auth.logout.expire.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    // line
    this.controllers.push({ url: '/line', controller: new AuthLine() });
    this.controllers.push({ url: '/line/edit', controller: new AuthLineEdit() });
    this.controllers.push({ url: '/line/register/guide', controller: new AuthLineRegisterGuide() });
    this.controllers.push({ url: '/line/register/corporation', controller: new AuthLineCopRegister() });
    this.controllers.push({ url: '/line/register/empty', controller: new AuthLineEmptyRegister() });
    // login
    this.controllers.push({ url: '/login/fail', controller: new AuthLineEmptyRegister() });
    // logout
    this.controllers.push({ url: '/logout/complete', controller: new AuthLogoutComplete() });
    this.controllers.push({ url: '/logout/expire', controller: new AuthLogoutExpire() });
    // member
    this.controllers.push({ url: '/member/management', controller: new AuthMemberManagement() });
    // signup
    this.controllers.push({ url: '/signup/guide', controller: new AuthSignupGuide() });
    // tid
    this.controllers.push({ url: '/tid/login', controller: new AuthTidLogin() });
    this.controllers.push({ url: '/tid/account', controller: new AuthTidAccountInfo() });
    this.controllers.push({ url: '/tid/change/pw', controller: new AuthTidChangePw() });
    this.controllers.push({ url: '/tid/find/id', controller: new AuthTidFindId() });
    this.controllers.push({ url: '/tid/find/pw', controller: new AuthTidFindPw() });
    this.controllers.push({ url: '/tid/logout', controller: new AuthTidLogout() });
    this.controllers.push({ url: '/tid/signup', controller: new AuthTidSignUp() });
    this.controllers.push({ url: '/tid/guide', controller: new AuthTidGuide() });
    // withdrawal
    this.controllers.push({ url: '/withdrawal/guide', controller: new AuthWithdrawalGuide() });
    this.controllers.push({ url: '/withdrawal/survey', controller: new AuthWithdrawalSurvey() });
  }
}

export default AuthRouter;
