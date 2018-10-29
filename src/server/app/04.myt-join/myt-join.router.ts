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
import MyTJoinInfoSms from './controllers/info/myt-join.info.sms.controller';
import MyTJoinSuspend from './controllers/suspend/myt-join.suspend.controller';
import MyTJoinWireFreeCallCheck from './controllers/wire/myt-join.wire.freeCallCheck.controller';
import MyTJoinWireModifyAddress from './controllers/wire/myt-join.wire.modify.address.controller';
import MyTJoinWireModifyProduct from './controllers/wire/myt-join.wire.modify.product.controller';
import MyTJoinWireModifyPeriod from './controllers/wire/myt-join.wire.modify.period.controller';
import MyTJoinWireSetWireCancelService from './controllers/wire/myt-join.wire.set.wire-cancel-service.controller';
import MyTJoinWireSetPause from './controllers/wire/myt-join.wire.set.pause.controller';
import MyTJoinWireGuideChangeOwnership from './controllers/wire/myt-join.wire.guide.change-ownership.controller';
import MyTJoinWire from './controllers/wire/myt-join.wire.controller';
import MyTJoinWireAS from './controllers/wire/myt-join.wire.as.controller';
import MyTJoinWireASDetail from './controllers/wire/myt-join.wire.as.detail.controller';
import MyTJoinWireDiscountRefund from './controllers/wire/myt-join.wire.discount-refund.controller';
import MyTJoinWireGifts from './controllers/wire/myt-join.wire.gifts.controller';
import MyTJoinWireHistory from './controllers/wire/myt-join.wire.history.controller';
import MyTJoinWireHistoryDetail from './controllers/wire/myt-join.wire.history.detail.controller';
import MyTJoinWireInetPhoneNumChange from './controllers/wire/myt-join.wire.netphone.change.controller';

class MyTJoinRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTJoinSubmainController });
    this.controllers.push({ url: '/product/fee-plan', controller: MyTJoinProductFeePlan });
    this.controllers.push({ url: '/product/additions', controller: MyTJoinProductAdditions });
    this.controllers.push({ url: '/product/combinations(/:combination)?', controller: MyTJoinProductCombinations });
    this.controllers.push({ url: '/product/fee-alarm', controller: MyTJoinProductFeeAlarm });
    this.controllers.push({ url: '/product/fee-alarm/terminate', controller: MyTJoinProductFeeAlarmTerminate });
    this.controllers.push({ url: '/protect/change', controller: MyTJoinProtectChange });
    this.controllers.push({ url: '/info/discount', controller: MytJoinInfoDiscount });
    this.controllers.push({ url: '/info/discount/month', controller: MyTJoinInfoDiscountMonth });
    this.controllers.push({ url: '/info/no-agreement', controller: MyTJoinInfoNoAgreement });
    this.controllers.push({ url: '/info/contract', controller: MyTJoinInfoContract });
    this.controllers.push({ url: '/info/sms', controller: MyTJoinInfoSms });
    this.controllers.push({ url: '/wire', controller: MyTJoinWire });
    this.controllers.push({ url: '/wire/as', controller: MyTJoinWireAS });
    this.controllers.push({ url: '/wire/as/detail', controller: MyTJoinWireASDetail });
    this.controllers.push({ url: '/wire/discount-refund', controller: MyTJoinWireDiscountRefund });
    this.controllers.push({ url: '/wire/gifts', controller: MyTJoinWireGifts });
    this.controllers.push({ url: '/wire/history', controller: MyTJoinWireHistory });
    this.controllers.push({ url: '/wire/detail', controller: MyTJoinWireHistoryDetail });
    this.controllers.push({ url: '/wire/inetphone-num/change', controller: MyTJoinWireInetPhoneNumChange });
    this.controllers.push({ url: '/wire/freeCallCheck', controller: MyTJoinWireFreeCallCheck });
    this.controllers.push({ url: '/wire/modify/address', controller: MyTJoinWireModifyAddress });
    this.controllers.push({ url: '/wire/modify/product', controller: MyTJoinWireModifyProduct });
    this.controllers.push({ url: '/wire/modify/period', controller: MyTJoinWireModifyPeriod });
    this.controllers.push({ url: '/wire/set/wire-cancel-service', controller: MyTJoinWireSetWireCancelService });
    this.controllers.push({ url: '/wire/set/pause', controller: MyTJoinWireSetPause });
    this.controllers.push({ url: '/wire/guide/change-ownership', controller: MyTJoinWireGuideChangeOwnership });
    this.controllers.push({ url: '/suspend', controller: MyTJoinSuspend });
  }
}

export default MyTJoinRouter;
