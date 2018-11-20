import TwRouter from '../../common/route/tw.router';
import MainHome from './controllers/main.home.controller';
import MainTNotify from './controllers/main.t-notify.controller';
import MainMenu from './controllers/main.menu.controller';
import MainSearch from './controllers/main.search.controller';
import MainMenuRefund from './controllers/menu/main.menu.refund.controller';
import MainMenuSettings from './controllers/menu/settings/main.menu.settings.controller';
import MainMenuSettingsNotifications from './controllers/menu/settings/main.menu.settings.notifications.controller';
import MainMenuSettingsPrivacy from './controllers/menu/settings/main.menu..settings.privacy.controller';
import MainMenuSettingsBusinessInfo from './controllers/menu/settings/main.menu.settings.business-info.controller';
import MainMenuSettingsTerms from './controllers/menu/settings/main.menu.settings.terms.controller';
import MainMenuSettingsLocation from './controllers/menu/settings/main.menu.settings.location.controller';
import MainMenuSettingsCertificates from './controllers/menu/settings/main.menu.settings.certificates.controller';

class MainRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/home', controller: MainHome });
    this.controllers.push({ url: '/t-notify', controller: MainTNotify });
    this.controllers.push({ url: '/menu', controller: MainMenu });
    this.controllers.push({ url: '/menu/settings', controller: MainMenuSettings });
    this.controllers.push({ url: '/menu/settings/notification', controller: MainMenuSettingsNotifications });
    this.controllers.push({ url: '/menu/settings/privacy', controller: MainMenuSettingsPrivacy });
    this.controllers.push({ url: '/menu/settings/business-info', controller: MainMenuSettingsBusinessInfo });
    this.controllers.push({ url: '/menu/settings/certificates', controller: MainMenuSettingsCertificates });
    this.controllers.push({ url: '/menu/settings/terms', controller: MainMenuSettingsTerms });
    this.controllers.push({ url: '/menu/settings/location', controller: MainMenuSettingsLocation });
    this.controllers.push({ url: '/menu/refund', controller: MainMenuRefund });
    this.controllers.push({ url: '/search', controller: MainSearch });
  }
}

export default MainRouter;
