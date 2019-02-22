import TwRouter from '../../common/route/tw.router';
import MyTDataSubMain from './myt-data.submain.controller';
import MyTDataHotdata from './controllers/usage/myt-data.hotdata.controller';
import MyTDataUsageChild from './controllers/usage/myt-data.usage.child.controller';
import MyTDataUsageChildRecharge from './controllers/usage/myt-data.usage.child.recharge.controller';
import MyTDataUsageChildRechargeComplete from './controllers/usage/myt-data.usage.child.recharge-complete.controller';
import MyTDataUsageTotalSharingData from './controllers/usage/myt-data.usage.total-sharing-data.controller';
import MyTDataUsageCancelTshare from './controllers/usage/myt-data.usage.cancel-tshare.controller';
import MyTDataUsageCancelTshareComplete from './controllers/usage/myt-data.usage.cancel-tshare-complete.controller';
import MyTDataRechargeCoupon from './controllers/recharge/myt-data.recharge.coupon.controller';
import MyTDataRechargeCouponUse from './controllers/recharge/myt-data.recharge.coupon.use.controller';
import MyTDataTing from './controllers/ting/myt-data.ting.controller';
import MyTDataGift from './controllers/gift/myt-data.gift.controller';
import MyTDataLimit from './controllers/limit/myt-data.limit.controller';
import MyTDataCookiz from './controllers/cookiz/myt-data.cookiz.controller';
import MyTDataHistory from './controllers/history/myt-data.history.controller';
import MyTDataFamily from './controllers/familydata/myt-data.familydata.controller';
import MyTDataFamilyShare from './controllers/familydata/myt-data.familydata.share.controller';
import MyTDataPrepaidHistory from './controllers/prepaid/myt-data.prepaid.history.controller';
import MyTDataPrepaidVoice from './controllers/prepaid/myt-data.prepaid.voice.controller';
import MyTDataPrepaidData from './controllers/prepaid/myt-data.prepaid.data.controller';
import MyTDataPrepaidAlarm from './controllers/prepaid/myt-data.prepaid.alarm.controller';
import MyTDataRechargeCouponComplete from './controllers/recharge/myt-data.recharge.coupon.complete.controller';
import MyTDataPrepaidDataAuto from './controllers/prepaid/myt-data.prepaid.data-auto.controller';
import MyTDataPrepaidDataComplete from './controllers/prepaid/myt-data.prepaid.data-complete.controller';
import MyTDataPrepaidVoiceAuto from './controllers/prepaid/myt-data.prepaid.voice-auto.controller';
import MyTDataPrepaidVoiceComplete from './controllers/prepaid/myt-data.prepaid.voice-complete.controller';
import MyTDataFamilyHistory from './controllers/familydata/myt-data.familydata.history.controller';
import MyTDataPrepaidAlarmComplete from './controllers/prepaid/myt-data.prepaid.alarm-complete.controller';
import MyTDataPrepaidVoiceInfo from './controllers/prepaid/myt-data.prepaid.voice-info.controller';

class MytDataRouter extends TwRouter {
  constructor() {
    super();
    // new url
    this.controllers.push({ url: '/', controller: MyTDataSubMain });
    this.controllers.push({ url: '/giftdata(/:page)?', controller: MyTDataGift });
    this.controllers.push({ url: '/recharge/ting(/:page)?', controller: MyTDataTing });
    this.controllers.push({ url: '/recharge/limit(/:page)?', controller: MyTDataLimit });
    this.controllers.push({ url: '/recharge/cookiz(/:page)?', controller: MyTDataCookiz });
    this.controllers.push({ url: '/recharge/coupon', controller: MyTDataRechargeCoupon });
    this.controllers.push({ url: '/recharge/coupon/use', controller: MyTDataRechargeCouponUse });
    this.controllers.push({ url: '/recharge/coupon/complete', controller: MyTDataRechargeCouponComplete });
    this.controllers.push({ url: '/familydata', controller: MyTDataFamily });
    this.controllers.push({ url: '/familydata/share', controller: MyTDataFamilyShare });
    this.controllers.push({ url: '/familydata/history', controller: MyTDataFamilyHistory });
    this.controllers.push({ url: '/history', controller: MyTDataHistory });
    this.controllers.push({ url: '/submain', controller: MyTDataSubMain });
    this.controllers.push({ url: '/submain/child-hotdata', controller: MyTDataUsageChild });
    this.controllers.push({ url: '/submain/child-hotdata/recharge', controller: MyTDataUsageChildRecharge });
    this.controllers.push({ url: '/submain/child-hotdata/recharge/complete', controller: MyTDataUsageChildRechargeComplete });
    this.controllers.push({ url: '/hotdata', controller: MyTDataHotdata });
    this.controllers.push({ url: '/hotdata/total-sharing', controller: MyTDataUsageTotalSharingData });
    this.controllers.push({ url: '/hotdata/cancel-tshare', controller: MyTDataUsageCancelTshare });
    this.controllers.push({ url: '/hotdata/cancel-tshare/complete', controller: MyTDataUsageCancelTshareComplete });
    this.controllers.push({ url: '/recharge/prepaid/history', controller: MyTDataPrepaidHistory });
    this.controllers.push({ url: '/recharge/prepaid/voice', controller: MyTDataPrepaidVoice });
    this.controllers.push({ url: '/recharge/prepaid/voice-info', controller: MyTDataPrepaidVoiceInfo });
    this.controllers.push({ url: '/recharge/prepaid/voice-auto', controller: MyTDataPrepaidVoiceAuto });
    this.controllers.push({ url: '/recharge/prepaid/voice-complete', controller: MyTDataPrepaidVoiceComplete });
    this.controllers.push({ url: '/recharge/prepaid/data', controller: MyTDataPrepaidData });
    this.controllers.push({ url: '/recharge/prepaid/data-auto', controller: MyTDataPrepaidDataAuto });
    this.controllers.push({ url: '/recharge/prepaid/data-complete', controller: MyTDataPrepaidDataComplete });
    this.controllers.push({ url: '/recharge/prepaid/alarm', controller: MyTDataPrepaidAlarm });
    this.controllers.push({ url: '/recharge/prepaid/alarm-complete', controller: MyTDataPrepaidAlarmComplete });
  }
}

export default MytDataRouter;
