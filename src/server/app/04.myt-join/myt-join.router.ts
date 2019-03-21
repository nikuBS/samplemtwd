import TwRouter from '../../common/route/tw.router';
import MyTJoinSubmainController from './myt-join.submain.controller';
import MyTJoinMyplan from './controllers/myplan/myt-join.myplan.controller';
import MyTJoinMyPlanAdd from './controllers/myplanadd/myt-join.myplanadd.controller';
import MyTJoinMyPlanCombine from './controllers/myplancombine/myt-join.myplancombine.controller';
import MyTJoinMyplanAlarm from './controllers/myplan/myt-join.myplan.alarm.controller';
import MyTJoinMyplanAlarmterminate from './controllers/myplan/myt-join.myplan.alarmterminate.controller';
import MyTJoinCustpassword from './controllers/submain/myt-join.custpassword.controller';
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
import MyTJoinWireModifyPeriodComplete from './controllers/wire/myt-join.wire.modify.period-complete.controller';
import MyTJoinWireSetWireCancelService from './controllers/wire/myt-join.wire.set.wire-cancel-service.controller';
import MyTJoinWireSetPause from './controllers/wire/myt-join.wire.set.pause.controller';
import MyTJoinWireSetPauseComplete from './controllers/wire/myt-join.wire.set.pause-complete.controller';
import MyTJoinWireGuideChangeOwnership from './controllers/wire/myt-join.wire.guide.change-ownership.controller';
import MyTJoinWire from './controllers/wire/myt-join.wire.controller';
import MyTJoinWireAS from './controllers/wire/myt-join.wire.as.controller';
import MyTJoinWireASDetail from './controllers/wire/myt-join.wire.as.detail.controller';
import MyTJoinWireDiscountRefund from './controllers/wire/myt-join.wire.discount-refund.controller';
import MyTJoinWireGifts from './controllers/wire/myt-join.wire.gifts.controller';
import MyTJoinWireHistory from './controllers/wire/myt-join.wire.history.controller';
import MyTJoinWireHistoryDetail from './controllers/wire/myt-join.wire.history.detail.controller';
import MyTJoinWireInetPhoneNumChange from './controllers/wire/myt-join.wire.netphone.change.controller';
import MyTJoinPhoneNumChgAlarm from './controllers/submain/myt-join.submain.phone.alarm.controller';
import MyTJoinPhoneNumChgAlarmExt from './controllers/submain/myt-join.submain.phone.extalarm.controller';
import MyTJoinNumChange from './controllers/submain/myt-join.submain.numchange.controller';
import MyTJoinSuspendStatus from './controllers/suspend/myt-join.suspend.status.controller';
import MyTJoinMyPlanCombineShare from './controllers/myplancombine/myt-join.myplancombine.share.controller';
import MyTJoinSuspendComplete from './controllers/suspend/myt-join.suspend.complete';

class MyTJoinRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/info/discount/month', controller: MyTJoinInfoDiscountMonth });

    // new url
    this.controllers.push({ url: '/submain', controller: MyTJoinSubmainController });
    this.controllers.push({ url: '/custpassword', controller: MyTJoinCustpassword });
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
    this.controllers.push({ url: '/submain/wire/modifyperiod/complete', controller: MyTJoinWireModifyPeriodComplete });
    this.controllers.push({ url: '/submain/wire/cancelsvc', controller: MyTJoinWireSetWireCancelService });
    this.controllers.push({ url: '/submain/wire/cancelsvc/complete', controller: MyTJoinWireSetWireCancelService });
    this.controllers.push({ url: '/submain/wire/wirestopgo', controller: MyTJoinWireSetPause });
    this.controllers.push({ url: '/submain/wire/wirestopgo/complete', controller: MyTJoinWireSetPauseComplete });
    this.controllers.push({ url: '/submain/wire/changeowner', controller: MyTJoinWireGuideChangeOwnership });
    this.controllers.push({ url: '/submain/suspend', controller: MyTJoinSuspend });
    this.controllers.push({ url: '/submain/suspend/status', controller: MyTJoinSuspendStatus });
    this.controllers.push({ url: '/submain/suspend/complete', controller: MyTJoinSuspendComplete });
    this.controllers.push({ url: '/myplan', controller: MyTJoinMyplan });
    this.controllers.push({ url: '/myplan/alarm', controller: MyTJoinMyplanAlarm });
    this.controllers.push({ url: '/myplan/alarmterminate', controller: MyTJoinMyplanAlarmterminate });
    this.controllers.push({ url: '/submain/numchange', controller: MyTJoinNumChange });
    this.controllers.push({ url: '/submain/numchange/complete', controller: MyTJoinNumChange });
    this.controllers.push({ url: '/submain/phone/alarm', controller: MyTJoinPhoneNumChgAlarm });
    this.controllers.push({ url: '/submain/phone/alarm/complete', controller: MyTJoinPhoneNumChgAlarm });
    this.controllers.push({ url: '/submain/phone/extalarm', controller: MyTJoinPhoneNumChgAlarmExt });
    this.controllers.push({ url: '/submain/phone/extalarm/complete', controller: MyTJoinPhoneNumChgAlarmExt });
    this.controllers.push({ url: '/additions', controller: MyTJoinMyPlanAdd });
    this.controllers.push({ url: '/combinations/share', controller: MyTJoinMyPlanCombineShare });
    this.controllers.push({ url: '/combinations(/:combination)?', controller: MyTJoinMyPlanCombine });
  }
}

export default MyTJoinRouter;
