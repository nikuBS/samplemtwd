import TwRouter from '../../common/route/tw.router';
import AuthLogin from './controllers/auth.login.controller';
import AuthSignupGuide from './controllers/auth.signup.guide.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/login', controller: new AuthLogin() });
    this.controllers.push({ url: '/signup/guide', controller: new AuthSignupGuide() });
  }
}

export default AuthRouter;
