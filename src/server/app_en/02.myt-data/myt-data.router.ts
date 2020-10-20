import TwRouter from '../../common_en/route/tw.router';
import MyTDataHotdata from './controllers/usage/myt-data.hotdata.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    
    this.controllers.push({ url: '/hotdata', controller: MyTDataHotdata });
  }
}

export default MytDataRouter;
