import TwRouter from '../../common/route/tw.router';
import AuthLogin from './controllers/auth.login.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/login', controller: new AuthLogin() });
  }
}

export default AuthRouter;
