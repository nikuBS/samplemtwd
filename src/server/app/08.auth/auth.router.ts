import TwRouter from '../../common/route/tw.router';
import AuthCertMotp from './controllers/cert/auth.cert.motp.controller';
import AuthCertMotpFail from './controllers/cert/auth.cert.motp-fail.controller';
import AuthCertPublicExport from './controllers/cert/auth.cert.public-export.controller';
import AuthLine from './controllers/line/auth.line.controller';
import AuthLineEdit from './controllers/line/auth.line.edit.controller';
import AuthLineCopRegister from './controllers/line/auth.line.cop-register.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    // cert
    this.controllers.push({ url: '/cert/motp', controller: new AuthCertMotp() });
    this.controllers.push({ url: '/cert/motp/fail', controller: new AuthCertMotpFail() });
    this.controllers.push({ url: '/cert/public/export', controller: new AuthCertPublicExport() });
    // line
    this.controllers.push({ url: '/line', controller: new AuthLine() });
    this.controllers.push({ url: '/line/edit', controller: new AuthLineEdit() });
    this.controllers.push({ url: '/line/register/corporation', controller: new AuthLineCopRegister() });

  }
}

export default AuthRouter;
