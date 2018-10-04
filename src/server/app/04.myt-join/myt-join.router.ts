import TwRouter from '../../common/route/tw.router';
import MyTJoinProductFeePlan from './controllers/product/myt-join.product.fee-plan.controller';
import MyTJoinProductAdditions from './controllers/product/myt-join.product.additions.controller';
import MyTJoinProductCombinations from './controllers/product/myt-join.product.combinations.controller';
import MyTJoinProductFeeAlarm from './controllers/product/myt-join.product.fee-alarm.controller';
import MyTJoinProductFeeAlarmChange from './controllers/product/myt-join.product.fee-alarm.change.controller';
import MyTJoinProtectChange from './controllers/protect/myt-join.protect.change.controller';

class MyTJoinRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/product/fee-plan', controller: new MyTJoinProductFeePlan() });
    this.controllers.push({ url: '/product/additions', controller: new MyTJoinProductAdditions() });
    this.controllers.push({ url: '/product/combinations', controller: new MyTJoinProductCombinations() });
    this.controllers.push({ url: '/product/fee-alarm', controller: new MyTJoinProductFeeAlarm() });
    this.controllers.push({ url: '/product/fee-alarm/change', controller: new MyTJoinProductFeeAlarmChange() });

    this.controllers.push({ url: '/protect/change', controller: new MyTJoinProtectChange() });
  }
}

export default MyTJoinRouter;
