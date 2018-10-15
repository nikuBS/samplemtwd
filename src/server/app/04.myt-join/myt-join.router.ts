import TwRouter from '../../common/route/tw.router';
import MyTJoinSubmainController from './myt-join.submain.controller';
import MyTJoinProductFeePlan from './controllers/product/myt-join.product.fee-plan.controller';
import MyTJoinProductAdditions from './controllers/product/myt-join.product.additions.controller';
import MyTJoinProductCombinations from './controllers/product/myt-join.product.combinations.controller';
import MyTJoinProductFeeAlarm from './controllers/product/myt-join.product.fee-alarm.controller';
import MyTJoinProductFeeAlarmTerminate from './controllers/product/myt-join.product.fee-alarm.terminate.controller';
import MyTJoinProtectChange from './controllers/protect/myt-join.protect.change.controller';
import MytJoinInfoDiscount from './controllers/info/myt-join.info.discount.controller';
import MyTJoinInfoDiscountMonth from './controllers/info/myt-join.info.discount.month.controller';
import MyTJoinInfoNoAgreement from './controllers/info/myt-join.info.no-agreement.controller';
import MyTJoinInfoContract from './controllers/info/myt-join.info.contract.controller';
import MytJoinWireFreeCallCheck from './controllers/wire/myt-join.wire.freeCallCheck.controller';

class MyTJoinRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: new MyTJoinSubmainController() });
    this.controllers.push({ url: '/product/fee-plan', controller: new MyTJoinProductFeePlan() });
    this.controllers.push({ url: '/product/additions', controller: new MyTJoinProductAdditions() });
    this.controllers.push({ url: '/product/combinations', controller: new MyTJoinProductCombinations() });
    this.controllers.push({ url: '/product/fee-alarm', controller: new MyTJoinProductFeeAlarm() });
    this.controllers.push({ url: '/product/fee-alarm/terminate', controller: new MyTJoinProductFeeAlarmTerminate() });
    this.controllers.push({ url: '/protect/change', controller: new MyTJoinProtectChange() });
    this.controllers.push({ url: '/info/discount', controller: new MytJoinInfoDiscount() });
    this.controllers.push({ url: '/info/discount/month', controller: new MyTJoinInfoDiscountMonth() });
    this.controllers.push({ url: '/info/no-agreement', controller: new MyTJoinInfoNoAgreement() });
    this.controllers.push({ url: '/info/contract', controller: new MyTJoinInfoContract() });

    this.controllers.push({ url: '/myt/join/wire/freeCallCheck', controller: new MytJoinWireFreeCallCheck() });
    this.controllers.push({ url: '/myt/join/wire/modify/address', controller: new MyTJoinJoinInfoNoAgreement() });
    this.controllers.push({ url: '/myt/join/wire/modify/product', controller: new MyTJoinJoinInfoNoAgreement() });
    this.controllers.push({ url: '/myt/join/wire/set/wire-cancel-service', controller: new MyTJoinJoinInfoNoAgreement() });
  }
}

export default MyTJoinRouter;
