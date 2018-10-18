import TwRouter from '../../common/route/tw.router';
import AuthCertMotp from './controllers/cert/auth.cert.motp.controller';
import AuthCertMotpFail from './controllers/cert/auth.cert.motp-fail.controller';
import AuthCertPublicExport from './controllers/cert/auth.cert.public-export.controller';
import AuthLine from './controllers/line/auth.line.controller';
import AuthLineEdit from './controllers/line/auth.line.edit.controller';
import AuthLineCopRegister from './controllers/line/auth.line.cop-register.controller';
import AuthLineEmptyRegister from './controllers/line/auth.line.empty-register.controller';
import AuthCertNice from './controllers/cert/auth.cert.nice.controller';
import AuthCertIpin from './controllers/cert/auth.cert.ipin.controller';
import AuthCertComplete from './controllers/cert/auth.cert.complete.controller';

class AuthRouter extends TwRouter {
  constructor() {
    super();
    // cert
    this.controllers.push({ url: '/cert/motp', controller: AuthCertMotp });
    this.controllers.push({ url: '/cert/motp/fail', controller: AuthCertMotpFail });
    this.controllers.push({ url: '/cert/public/export', controller: AuthCertPublicExport });
    this.controllers.push({ url: '/cert/nice', controller: AuthCertNice });
    this.controllers.push({ url: '/cert/ipin', controller: AuthCertIpin });
    this.controllers.push({ url: '/cert/complete', controller: AuthCertComplete });
    // line
    this.controllers.push({ url: '/line', controller: AuthLine });
    this.controllers.push({ url: '/line/edit', controller: AuthLineEdit });
    this.controllers.push({ url: '/line/register/corporation', controller: AuthLineCopRegister });
    this.controllers.push({ url: '/line/register/empty', controller: AuthLineEmptyRegister });

  }
}

export default AuthRouter;
