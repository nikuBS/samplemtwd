import TwRouter from '../../common/route/tw.router';
import AuthCertMotp from './controllers/cert/auth.cert.motp.controller';
import AuthCertMotpFail from './controllers/cert/auth.cert.motp-fail.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    // cert
    this.controllers.push({ url: '/cert/motp', controller: new AuthCertMotp() });
    this.controllers.push({ url: '/cert/motp/fail', controller: new AuthCertMotpFail() });

  }
}

export default AuthRouter;
