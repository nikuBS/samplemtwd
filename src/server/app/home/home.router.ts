import HomeMainController from './controllers/home.main.controller';
import TxRouter from '../../common/route/tw.router';

class HomeRouter extends TxRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/', controller: new HomeMainController() });
  }
}

export default HomeRouter;
