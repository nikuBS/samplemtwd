import TxRouter from '../../common/route/tx.router';

class DirectRouter extends TxRouter {
  constructor() {
    super();
    // this._controllers.push({ url: '/', controller: new HomeMainController() });
  }
}

export default DirectRouter;