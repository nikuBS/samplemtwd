import TwRouter from '../../common/route/tw.router';
import AuthCertMotp from './controllers/cert/auth.cert.motp.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    // cert
    this.controllers.push({ url: '/cert/motp', controller: new AuthCertMotp() });
  }
}

export default AuthRouter;
