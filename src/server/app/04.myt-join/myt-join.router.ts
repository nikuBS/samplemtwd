import TwRouter from '../../common/route/tw.router';
import MyTJoinSubmainController from './myt-join.submain.controller';
import MyTJoinProductFeePlan from './controllers/product/myt-join.product.fee-plan.controller';
import MyTJoinMyPlanAdd from './controllers/myplanadd/myt-join.myplanadd.controller';
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
import MyTJoinMgmtNumChgAlarm from './controllers/management/myt-join.mgmt.numchg-alarm.controller';
import MyTJoinMgmtNumChgAlarmExt from './controllers/management/myt-join.mgmt.numchg-alarm.ext.controller';
import MyTJoinMgmtNumChg from './controllers/management/myt-join.mgmt.numchg.controller';
import MyTJoinSuspendStatus from './controllers/suspend/myt-join.suspend.status.controller';

class MyTJoinRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/', controller: MyTJoinSubmainController });
    this.controllers.push({ url: '/product/fee-plan', controller: MyTJoinProductFeePlan });

    this.controllers.push({ url: '/product/combinations(/:combination)?', controller: MyTJoinProductCombinations });
    this.controllers.push({ url: '/product/fee-alarm', controller: MyTJoinProductFeeAlarm });
    this.controllers.push({ url: '/product/fee-alarm/terminate', controller: MyTJoinProductFeeAlarmTerminate });
    this.controllers.push({ url: '/protect/change', controller: MyTJoinProtectChange });
    this.controllers.push({ url: '/info/discount', controller: MytJoinInfoDiscount });
    this.controllers.push({ url: '/info/discount/month', controller: MyTJoinInfoDiscountMonth });
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
    this.controllers.push({ url: '/wire/set/wire-cancel-service', controller: MyTJoinWireSetWireCancelService });
    this.controllers.push({ url: '/suspend', controller: MyTJoinSuspend });
    this.controllers.push({ url: '/mgmt/numchg', controller: MyTJoinMgmtNumChg });
    this.controllers.push({ url: '/mgmt/numchg/alarm', controller: MyTJoinMgmtNumChgAlarm });
    this.controllers.push({ url: '/mgmt/numchg/alarm/ext', controller: MyTJoinMgmtNumChgAlarmExt });

    // new url
    this.controllers.push({ url: '/submain', controller: MyTJoinSubmainController });
    this.controllers.push({ url: '/custpassword', controller: MyTJoinProtectChange });
    this.controllers.push({ url: '/myplancombine/infodiscount', controller: MytJoinInfoDiscount });
    this.controllers.push({ url: '/myplancombine/infodiscount/month', controller: MyTJoinInfoDiscountMonth });
    this.controllers.push({ url: '/myplancombine/noagreement', controller: MyTJoinInfoNoAgreement });
    this.controllers.push({ url: '/myinfo/contract', controller: MyTJoinInfoContract });
    this.controllers.push({ url: '/wire/wiredo/sms', controller: MyTJoinInfoSms });
    this.controllers.push({ url: '/submain/wire', controller: MyTJoinWire });
    this.controllers.push({ url: '/submain/wire/as', controller: MyTJoinWireAS });
    this.controllers.push({ url: '/submain/wire/asdetail', controller: MyTJoinWireASDetail });
    this.controllers.push({ url: '/submain/wire/discountrefund', controller: MyTJoinWireDiscountRefund });
    this.controllers.push({ url: '/submain/wire/gifts', controller: MyTJoinWireGifts });
    this.controllers.push({ url: '/submain/wire/history', controller: MyTJoinWireHistory });
    this.controllers.push({ url: '/submain/wire/historydetail', controller: MyTJoinWireHistoryDetail });
    this.controllers.push({ url: '/submain/wire/inetphone', controller: MyTJoinWireInetPhoneNumChange });
    this.controllers.push({ url: '/submain/wire/freecallcheck', controller: MyTJoinWireFreeCallCheck });
    this.controllers.push({ url: '/submain/wire/modifyaddress', controller: MyTJoinWireModifyAddress });
    this.controllers.push({ url: '/submain/wire/modifyproduct', controller: MyTJoinWireModifyProduct });
    this.controllers.push({ url: '/submain/wire/modifyperiod', controller: MyTJoinWireModifyPeriod });
    this.controllers.push({ url: '/submain/wire/cancelsvc', controller: MyTJoinWireSetWireCancelService });
    this.controllers.push({ url: '/submain/wire/wirestopgo', controller: MyTJoinWireSetPause });
    this.controllers.push({ url: '/submain/wire/changeowner', controller: MyTJoinWireGuideChangeOwnership });
    this.controllers.push({ url: '/submain/suspend', controller: MyTJoinSuspend });
    this.controllers.push({ url: '/submain/suspend/status', controller: MyTJoinSuspendStatus });
    this.controllers.push({ url: '/submain/numchange', controller: MyTJoinMgmtNumChg });
    this.controllers.push({ url: '/submain/phone/alarm', controller: MyTJoinMgmtNumChgAlarm });
    this.controllers.push({ url: '/submain/phone/extalarm', controller: MyTJoinMgmtNumChgAlarmExt });
    this.controllers.push({ url: '/myplanadd', controller: MyTJoinMyPlanAdd });
  }
}

export default MyTJoinRouter;
