/**
 * FileName: common.router.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.02
 */

import TwRouter from '../../common/route/tw.router';
import CommonSettingsMenu from './controllers/settings/common.settings.menu.controller';
import CommonSettingsPrivacy from './controllers/settings/common.settings.privacy.controller';
import CommonError from './controllers/common.error.controller';

export default class CommonRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/settings/menu', controller: new CommonSettingsMenu() });
    this.controllers.push({ url: '/settings/privacy', controller: new CommonSettingsPrivacy() });

    this.controllers.push({ url: '/error', controller: new CommonError() });
  }
}
