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
import CommonError from './controllers/common.error.controller';
import CommonBiometricsTerms from './controllers/biometrics/common.biometrics.terms.controller';
import CommonBiometricsCert from './controllers/biometrics/common.biometircs.cert.controller';
import CommonBiometricsMenu from './controllers/biometrics/common.biometrics.menu.cotroller';
import CommonBiometricsRegister from './controllers/biometrics/common.biometrics.register.controller';

export default class CommonRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/settings/menu', controller: new CommonSettingsMenu() });
    this.controllers.push({ url: '/settings/notifications', controller: new CommonSettingsNotifications() });
    this.controllers.push({ url: '/settings/privacy', controller: new CommonSettingsPrivacy() });
    this.controllers.push({ url: '/settings/business-info', controller: new CommonSettingsBusinessInfo() });
    this.controllers.push({ url: '/settings/certificates', controller: new CommonSettingsCertificates() });
    this.controllers.push({ url: '/settings/terms', controller: new CommonSettingsTerms() });

    this.controllers.push({ url: '/biometrics/menu', controller: new CommonBiometricsMenu() });
    this.controllers.push({ url: '/biometrics/terms', controller: new CommonBiometricsTerms() });
    this.controllers.push({ url: '/biometrics/cert', controller: new CommonBiometricsCert() });
    this.controllers.push({ url: '/biometrics/register', controller: new CommonBiometricsRegister() });

    this.controllers.push({ url: '/error', controller: new CommonError() });
  }
}
