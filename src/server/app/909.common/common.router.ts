import TwRouter from '../../common/route/tw.router';
import CommonError from './controllers/common.error.controller';

class CommonRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/error', controller:  CommonError } );
  }
}

export default CommonRouter;