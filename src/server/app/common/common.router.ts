import TwRouter from '../../common/route/tw.router';
import CommonErrorController from './controllers/common.error.controller';

class CommonRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/error', controller: new CommonErrorController() });
  }
}

export default CommonRouter;