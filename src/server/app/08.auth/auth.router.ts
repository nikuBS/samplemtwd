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
    this.controllers.push({ url: '/cert/motp', controller: new AuthCertMotp() });
    this.controllers.push({ url: '/cert/motp/fail', controller: new AuthCertMotpFail() });
    this.controllers.push({ url: '/cert/public/export', controller: new AuthCertPublicExport() });
    this.controllers.push({ url: '/cert/nice', controller: new AuthCertNice() });
    this.controllers.push({ url: '/cert/ipin', controller: new AuthCertIpin() });
    this.controllers.push({ url: '/cert/complete', controller: new AuthCertComplete() });
    // line
    this.controllers.push({ url: '/line', controller: new AuthLine() });
    this.controllers.push({ url: '/line/edit', controller: new AuthLineEdit() });
    this.controllers.push({ url: '/line/register/corporation', controller: new AuthLineCopRegister() });
    this.controllers.push({ url: '/line/register/empty', controller: new AuthLineEmptyRegister() });

  }
}

export default AuthRouter;
