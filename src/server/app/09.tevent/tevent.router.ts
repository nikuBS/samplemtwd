/**
 * @file tevent.router.ts
 * @author
 * @since 2018.05
 */

import TwRouter from '../../common/route/tw.router';
import TeventIngList from './controllers/tevent.ing.list.controller';
import TeventLastList from './controllers/tevent.last.list.controller';
import TeventWinList from './controllers/tevent.win.list.controller';
import TeventDetail from './controllers/tevent.detail.controller';
import TeventWinDetail from './controllers/tevent.win.detail.controller';

class TeventRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/ing', controller: TeventIngList });
    this.controllers.push({ url: '/last', controller: TeventLastList });
    this.controllers.push({ url: '/win', controller: TeventWinList });
    this.controllers.push({ url: '/detail', controller: TeventDetail });
    this.controllers.push({ url: '/win/detail', controller: TeventWinDetail });
  }
}

export default TeventRouter;
