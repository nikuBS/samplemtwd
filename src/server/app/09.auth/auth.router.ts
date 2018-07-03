import TwRouter from '../../common/route/tw.router';
import AuthLogin from './controllers/auth.login.controller';
import AuthSignupGuide from './controllers/auth.signup.guide.controller';
import AuthWithdrawalGuide from './controllers/auth.withdrawal.guide.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/login', controller: new AuthLogin() });
    this.controllers.push({ url: '/signup/guide', controller: new AuthSignupGuide() });
    this.controllers.push({ url: '/withdrawal/guide', controller: new AuthWithdrawalGuide() });
  }
}

export default AuthRouter;
