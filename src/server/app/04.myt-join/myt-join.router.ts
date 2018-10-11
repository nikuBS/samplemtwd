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
    this.controllers.push({ url: '/', controller: new MyTJoinSubmainController() });
    this.controllers.push({ url: '/product/fee-plan', controller: new MyTJoinProductFeePlan() });
    this.controllers.push({ url: '/product/additions', controller: new MyTJoinProductAdditions() });
    this.controllers.push({ url: '/product/combinations', controller: new MyTJoinProductCombinations() });
    this.controllers.push({ url: '/product/fee-alarm', controller: new MyTJoinProductFeeAlarm() });
    this.controllers.push({ url: '/product/fee-alarm/terminate', controller: new MyTJoinProductFeeAlarmTerminate() });
    this.controllers.push({ url: '/protect/change', controller: new MyTJoinProtectChange() });
    this.controllers.push({ url: '/info/discount', controller: new MytJoinInfoDiscount() });
    this.controllers.push({ url: '/info/discount/month', controller: new MyTJoinInfoDiscountMonth() });

    // 인터넷/집전화/IPTV 신청내역 등
    this.controllers.push({ url: '/wire', controller: new MyTJoinWire() });
    this.controllers.push({ url: '/wire/as', controller: new MyTJoinWireAS() });
    this.controllers.push({ url: '/wire/as/detail', controller: new MyTJoinWireASDetail() });
    this.controllers.push({ url: '/wire/discount-refund', controller: new MyTJoinWireDiscountRefund() });
    this.controllers.push({ url: '/wire/gifts', controller: new MyTJoinWireGifts() });
    this.controllers.push({ url: '/wire/history', controller: new MyTJoinWireHistory() });
    this.controllers.push({ url: '/wire/detail', controller: new MyTJoinWireHistoryDetail() });
    this.controllers.push({ url: '/wire/inetphone-num/change', controller: new MyTJoinWireInetPhoneNumChange() });

  }
}

export default MyTJoinRouter;
