import TwRouter from '../../common/route/tw.router';
import AuthTidLogin from './controllers/tid/auth.tid.login.controller';
import AuthSignupGuide from './controllers/signup/auth.signup.guide.controller';
import AuthWithdrawalGuide from './controllers/withdrawal/auth.withdrawal.guide.controller';
import AuthManagement from './controllers/member/auth.member.management.controller';
import AuthLine from './controllers/line/auth.line.controller';
import AuthTidAccountInfo from './controllers/tid/auth.tid.account-info.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/line', controller: new AuthLine() });
    this.controllers.push({ url: '/member/management', controller: new AuthManagement() });
    this.controllers.push({ url: '/signup/guide', controller: new AuthSignupGuide() });
    this.controllers.push({ url: '/tid/login', controller: new AuthTidLogin() });
    this.controllers.push({ url: '/tid/account', controller: new AuthTidAccountInfo() });
    this.controllers.push({ url: '/withdrawal/guide', controller: new AuthWithdrawalGuide() });
  }
}

export default AuthRouter;
