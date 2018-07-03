import TwRouter from '../../common/route/tw.router';
import AuthTidLogin from './controllers/auth.tid-login.controller';
import AuthSignupGuide from './controllers/auth.signup.guide.controller';
import AuthWithdrawalGuide from './controllers/auth.withdrawal.guide.controller';
import AuthManagement from './controllers/auth.management.controller';
import AuthLine from './controllers/auth.line.controller';
import AuthTidAccountInfo from './controllers/auth.tid-account-info.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/tid/login', controller: new AuthTidLogin() });
    this.controllers.push({ url: '/tid/account', controller: new AuthTidAccountInfo() });
    this.controllers.push({ url: '/signup/guide', controller: new AuthSignupGuide() });
    this.controllers.push({ url: '/withdrawal/guide', controller: new AuthWithdrawalGuide() });
    this.controllers.push({ url: '/management', controller: new AuthManagement() });
    this.controllers.push({ url: '/line', controller: new AuthLine() });
  }
}

export default AuthRouter;
