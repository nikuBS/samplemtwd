import TwRouter from '../../common_en/route/tw.router';
import MyTFareSubMain from './myt-fare.submain.controller';
import MyTFareBillGuide from './controllers/billguide/myt-fare.bill.guide.controllers';
import MytFareHotbill from './controllers/bill/myt-fare.bill.hotbill.controller';
//import MytFareMiri from './controllers/bill/myt-fare.bill.miri.controller';


class MytFareRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTFareSubMain });

    // new url
    this.controllers.push({ url: '/submain', controller: MyTFareSubMain });
    this.controllers.push({ url: '/billguide/guide', controller: MyTFareBillGuide });

    // 실시간 이용요금
    this.controllers.push({ url: '/bill/hotbill', controller: MytFareHotbill });
    //miri 요금
    //this.controllers.push({ url: '/bill/miri', controller: MytFareMiri });    
 
  }
}

export default MytFareRouter;
