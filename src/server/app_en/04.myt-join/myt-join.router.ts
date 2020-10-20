import TwRouter from '../../common_en/route/tw.router';
import MyTJoinSubmainController from './myt-join.submain.controller';
import MyTJoinCustpassword from './controllers/submain/myt-join.custpassword.controller';

class MyTJoinRouter extends TwRouter {
  constructor() {
    super();
    
    this.controllers.push({ url: '/submain', controller: MyTJoinSubmainController });
    this.controllers.push({ url: '/custpassword', controller: MyTJoinCustpassword });
  }
}

export default MyTJoinRouter;
