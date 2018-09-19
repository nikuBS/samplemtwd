import TwRouter from '../../common/route/tw.router';
import MyTJoinProductFeePlan from './controllers/product/myt-join.product.fee-plan.controller';
import MyTJoinProductAdditions from './controllers/product/myt-join.product.additions.controller';
import MyTJoinProductCombinations from './controllers/product/myt-join.product.combinations.controller';

class MyTJoinRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/product/fee-plan', controller: new MyTJoinProductFeePlan() });
    this.controllers.push({ url: '/product/additions', controller: new MyTJoinProductAdditions() });
    this.controllers.push({ url: '/product/combinations', controller: new MyTJoinProductCombinations() });
  }
}

export default MyTJoinRouter;
