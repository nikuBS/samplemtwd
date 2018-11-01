/**
 * FileName: common.router.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

import TwRouter from '../../common/route/tw.router';
import CommonSettingsMenu from './controllers/settings/common.settings.menu.controller';
import CommonSettingsNotifications from './controllers/settings/common.settings.notifications.controller';
import CommonSettingsPrivacy from './controllers/settings/common.settings.privacy.controller';
import CommonSettingsBusinessInfo from './controllers/settings/common.settings.business-info.controller';
import CommonSettingsCertificates from './controllers/settings/common.settings.certificates.controller';
import CommonSettingsTerms from './controllers/settings/common.settings.terms.controller';
import CommonSettingsLocation from './controllers/settings/common.settings.location.controller';
import CommonError from './controllers/common.error.controller';
import CommonBiometricsTerms from './controllers/biometrics/common.biometrics.terms.controller';
import CommonBiometricsCert from './controllers/biometrics/common.biometircs.cert.controller';
import CommonBiometricsMenu from './controllers/biometrics/common.biometrics.menu.cotroller';
import CommonBiometricsRegister from './controllers/biometrics/common.biometrics.register.controller';
import AuthCertMotp from './controllers/cert/auth.cert.motp.controller';
import AuthCertMotpFail from './controllers/cert/auth.cert.motp-fail.controller';
import AuthCertPublicExport from './controllers/cert/auth.cert.public-export.controller';
import AuthCertNice from './controllers/cert/auth.cert.nice.controller';
import AuthCertIpin from './controllers/cert/auth.cert.ipin.controller';
import AuthCertComplete from './controllers/cert/auth.cert.complete.controller';
import AuthLine from './controllers/line/auth.line.controller';
import AuthLineEdit from './controllers/line/auth.line.edit.controller';
import AuthLineCopRegister from './controllers/line/auth.line.cop-register.controller';
import AuthLineEmptyRegister from './controllers/line/auth.line.empty-register.controller';
import AuthMemberManagement from './controllers/member/auth.member.management.controller';
import AuthLoginFindIdPwd from './controllers/login/auth.login.find-id-pwd.controller';

export default class CommonRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/settings/menu', controller: CommonSettingsMenu });
    this.controllers.push({ url: '/settings/notifications', controller: CommonSettingsNotifications });
    this.controllers.push({ url: '/settings/privacy', controller: CommonSettingsPrivacy });
    this.controllers.push({ url: '/settings/business-info', controller: CommonSettingsBusinessInfo });
    this.controllers.push({ url: '/settings/certificates', controller: CommonSettingsCertificates });
    this.controllers.push({ url: '/settings/terms', controller: CommonSettingsTerms });
    this.controllers.push({ url: '/settings/location', controller: CommonSettingsLocation });

    this.controllers.push({ url: '/biometrics/menu', controller: CommonBiometricsMenu });
    this.controllers.push({ url: '/biometrics/terms', controller: CommonBiometricsTerms });
    this.controllers.push({ url: '/biometrics/cert', controller: CommonBiometricsCert });
    this.controllers.push({ url: '/biometrics/register', controller: CommonBiometricsRegister });

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
    // login
    this.controllers.push({ url: '/login/find-id-pwd', controller: AuthLoginFindIdPwd });
    // member
    this.controllers.push({ url: '/member/management', controller: AuthMemberManagement } );

    this.controllers.push({ url: '/error', controller: CommonError });
  }
}
