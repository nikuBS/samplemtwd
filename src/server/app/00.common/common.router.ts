/**
 * FileName: common.router.ts
 * Commonor: Hakjoon Sim (hakjoon.sim@sk.com)
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
import CommonCertMotp from './controllers/cert/common.cert.motp.controller';
import CommonCertMotpFail from './controllers/cert/common.cert.motp-fail.controller';
import CommonCertPublicExport from './controllers/cert/common.cert.public-export.controller';
import CommonCertNice from './controllers/cert/common.cert.nice.controller';
import CommonCertIpin from './controllers/cert/common.cert.ipin.controller';
import CommonCertComplete from './controllers/cert/common.cert.complete.controller';
import CommonLine from './controllers/line/common.line.controller';
import CommonLineEdit from './controllers/line/common.line.edit.controller';
import CommonLineCopRegister from './controllers/line/common.line.cop-register.controller';
import CommonLineEmptyRegister from './controllers/line/common.line.empty-register.controller';
import CommonMemberManagement from './controllers/member/common.member.management.controller';
import CommonLoginFindIdPwd from './controllers/login/common.login.find-id-pwd.controller';
import CommonLogoutComplete from './controllers/logout/common.logout.complete.controller';
import CommonLogoutExpire from './controllers/logout/common.logout.expire.controller';
import CommonLogoutRoute from './controllers/logout/common.logout.route.controller';
import CommonTidLogin from './controllers/tid/common.tid.login.controller';
import CommonTidAccountInfo from './controllers/tid/common.tid.account-info.controller';
import CommonTidChangePw from './controllers/tid/common.tid.change-pw.controller';
import CommonTidFindId from './controllers/tid/common.tid.find-id.controller';
import CommonTidFindPw from './controllers/tid/common.tid.find-pw.controller';
import CommonTidLogout from './controllers/tid/common.tid.logout.controller';
import CommonTidSignUpLocal from './controllers/tid/common.tid.signup-local.controller';
import CommonTidSignUpForeigner from './controllers/tid/common.tid.signup-foreigner.controller';
import CommonTidGuide from './controllers/tid/common.tid.guide.controller';
import CommonTidRoute from './controllers/tid/common.tid.route';
import CommonLoginFail from './controllers/login/common.login.fail.controller';
import CommonLoginCustomerPwdFail from './controllers/login/common.login.customer-pwd-fail.controller';
import CommonLoginRoute from './controllers/login/common.login.route.controller';
import CommonLoginEasyIos from './controllers/login/common.login.easy-ios.controller';
import CommonLoginEasyFail from './controllers/login/common.login.easy-fail.controller';
import CommonLoginEasyAos from './controllers/login/common.login.easy-aos.controller';
import CommonLoginDormancy from './controllers/login/common.login.dormancy.controller';
import CommonLoginCustomerPwd from './controllers/login/common.login.customer-pwd.controller';
import CommonLoginExceedFail from './controllers/login/common.login.exceed-fail.controller';
import CommonSignupGuide from './controllers/signup/common.signup.guide.controller';

export default class CommonRouter extends TwRouter {
  constructor() {
    super();
    // settings
    this.controllers.push({ url: '/settings/menu', controller: CommonSettingsMenu });
    this.controllers.push({ url: '/settings/notifications', controller: CommonSettingsNotifications });
    this.controllers.push({ url: '/settings/privacy', controller: CommonSettingsPrivacy });
    this.controllers.push({ url: '/settings/business-info', controller: CommonSettingsBusinessInfo });
    this.controllers.push({ url: '/settings/certificates', controller: CommonSettingsCertificates });
    this.controllers.push({ url: '/settings/terms', controller: CommonSettingsTerms });
    this.controllers.push({ url: '/settings/location', controller: CommonSettingsLocation });
    // biometrics
    this.controllers.push({ url: '/biometrics/menu', controller: CommonBiometricsMenu });
    this.controllers.push({ url: '/biometrics/terms', controller: CommonBiometricsTerms });
    this.controllers.push({ url: '/biometrics/cert', controller: CommonBiometricsCert });
    this.controllers.push({ url: '/biometrics/register', controller: CommonBiometricsRegister });
    // cert
    this.controllers.push({ url: '/cert/motp', controller: CommonCertMotp });
    this.controllers.push({ url: '/cert/motp/fail', controller: CommonCertMotpFail });
    this.controllers.push({ url: '/cert/public/export', controller: CommonCertPublicExport });
    this.controllers.push({ url: '/cert/nice', controller: CommonCertNice });
    this.controllers.push({ url: '/cert/ipin', controller: CommonCertIpin });
    this.controllers.push({ url: '/cert/complete', controller: CommonCertComplete });
    // line
    this.controllers.push({ url: '/line', controller: CommonLine });
    this.controllers.push({ url: '/line/edit', controller: CommonLineEdit });
    this.controllers.push({ url: '/line/register/corporation', controller: CommonLineCopRegister });
    this.controllers.push({ url: '/line/register/empty', controller: CommonLineEmptyRegister });
    // login
    this.controllers.push({ url: '/login/exceed-fail', controller: CommonLoginExceedFail } );
    this.controllers.push({ url: '/login/fail', controller: CommonLoginFail } );
    this.controllers.push({ url: '/login/dormancy', controller: CommonLoginDormancy } );
    this.controllers.push({ url: '/login/find-id-pwd', controller: CommonLoginFindIdPwd });
    this.controllers.push({ url: '/login/customer-pwd', controller: CommonLoginCustomerPwd } );
    this.controllers.push({ url: '/login/customer-pwd-fail', controller: CommonLoginCustomerPwdFail } );
    this.controllers.push({ url: '/login/route', controller: CommonLoginRoute } );
    this.controllers.push({ url: '/login/easy-aos', controller: CommonLoginEasyAos } );
    this.controllers.push({ url: '/login/easy-ios', controller: CommonLoginEasyIos } );
    this.controllers.push({ url: '/login/easy-fail', controller: CommonLoginEasyFail } );
    // logout
    this.controllers.push({ url: '/logout/complete', controller: CommonLogoutComplete } );
    this.controllers.push({ url: '/logout/expire', controller: CommonLogoutExpire } );
    this.controllers.push({ url: '/logout/route', controller: CommonLogoutRoute } );
    // member
    this.controllers.push({ url: '/member/management', controller: CommonMemberManagement } );
    // signup
    this.controllers.push({ url: '/signup/guide', controller: CommonSignupGuide } );
    // tid
    this.controllers.push({ url: '/tid/login', controller: CommonTidLogin } );
    this.controllers.push({ url: '/tid/account', controller: CommonTidAccountInfo } );
    this.controllers.push({ url: '/tid/change-pw', controller: CommonTidChangePw } );
    this.controllers.push({ url: '/tid/find-id', controller: CommonTidFindId } );
    this.controllers.push({ url: '/tid/find-pw', controller: CommonTidFindPw } );
    this.controllers.push({ url: '/tid/logout', controller: CommonTidLogout } );
    this.controllers.push({ url: '/tid/signup-local', controller: CommonTidSignUpLocal } );
    this.controllers.push({ url: '/tid/signup-foreigner', controller: CommonTidSignUpForeigner } );
    this.controllers.push({ url: '/tid/guide', controller: CommonTidGuide } );
    this.controllers.push({ url: '/tid/route', controller: CommonTidRoute } );
    // error
    this.controllers.push({ url: '/error', controller: CommonError });
  }
}
