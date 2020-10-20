import TwRouter from '../../common_en/route/tw.router';
import MainHome from './controllers/main.home.controller';
import MainMenuSettings from './controllers/menu/settings/main.menu.settings.controller';
import MainMenuSettingsTerms from './controllers/menu/settings/main.menu.settings.terms.controller';
import MainMenuSettingsTworldTerms from './controllers/menu/settings/main.menu.settings.terms.t-world-terms.controller';

class MainRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/home', controller: MainHome });
    this.controllers.push({ url: '/menu/settings', controller: MainMenuSettings });
    this.controllers.push({ url: '/menu/settings/terms', controller: MainMenuSettingsTerms });
    this.controllers.push({ url: '/menu/settings/terms/t-world-terms', controller: MainMenuSettingsTworldTerms });
  }
}

export default MainRouter;
