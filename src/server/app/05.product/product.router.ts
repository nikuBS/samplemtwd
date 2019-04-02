import TwRouter from '../../common/route/tw.router';

import ProductCommonCallplan from './controllers/common/product.common.callplan.controller';
import ProductCommonCallplanPreview from './controllers/common/product.common.callplan-preview.controller';
import ProductCommonLineChange from './controllers/common/product.common.line-change.controller';

import ProductApps from './controllers/apps/product.apps.controller';
import ProductAppsDetail from './controllers/apps/product.apps.detail.controller';

import Product from './controllers/mobileplan/product.mobileplan.controller';
import ProductPlans from './controllers/mobileplan/product.mobileplan.list.controller';
import ProductMobileplanFind from './controllers/mobileplan/product.mobileplan.find.controller';
import ProductMobileplanJoin from './controllers/mobileplan/join/product.mobileplan.join.controller';
import ProductMobileplanJoinTplan from './controllers/mobileplan/join/product.mobileplan.join.tplan.controller';
import ProductMobileplanJoinShareLine from './controllers/mobileplan/join/product.mobileplan.join.share-line.controller';
import ProductMobileplanJoinDataTogether from './controllers/mobileplan/join/product.mobileplan.join.data-together.controller';
import ProductMobileplanJoin0planSm from './controllers/mobileplan/join/product.mobileplan.join.0plan-sm.controller';
import ProductMobileplanSettingOption from './controllers/mobileplan/setting/product.mobileplan.setting.option.controller';
import ProductMobileplanSettingTplan from './controllers/mobileplan/setting/product.mobileplan.setting.tplan.controller';
import ProductMobileplanSetting0plan from './controllers/mobileplan/setting/product.mobileplan.setting.0plan.controller';
import ProductMobileplanSettingTing from './controllers/mobileplan/setting/product.mobileplan.setting.ting.controllter';
import ProductMobileplanSettingNumber from './controllers/mobileplan/setting/product.mobileplan.setting.number.controller';
import ProductMobileplanSettingNumberFriend from './controllers/mobileplan/setting/product.mobileplan.setting.number-friend.controller';
import ProductMobileplanSettingBandYT from './controllers/mobileplan/setting/product.mobileplan.setting.bandYT.controller';
import ProductMobileplanSettingCouple from './controllers/mobileplan/lookup/product.mobileplan.lookup.couple.controller';
import ProductMobileplanSettingLocation from './controllers/mobileplan/setting/product.mobileplan.setting.location.controller';
import ProductMobileplanSetting0planSm from './controllers/mobileplan/setting/product.mobileplan.setting.0plan-sm.controller';
import ProductMobileplanLookupTplan from './controllers/mobileplan/lookup/product.mobileplan.lookup.tplan.controller';
import ProductMobileplanLookupTing from './controllers/mobileplan/lookup/product.mobileplan.lookup.ting.controller';

import ProductAddition from './controllers/mobileplan-add/product.mobileplan-add.controller';
import ProductAdditions from './controllers/mobileplan-add/product.mobileplan-add.list.controller';
import ProductMobileplanAddTerminate from './controllers/mobileplan-add/product.mobileplan-add.terminate.controller';
import ProductMobileplanAddJoin from './controllers/mobileplan-add/join/product.mobileplan-add.join.controller';
import ProductMobileplanAddJoinCombineLine from './controllers/mobileplan-add/join/product.mobileplan-add.join.combine-line.controller';
import ProductMobileplanAddJoinSignatureLine from './controllers/mobileplan-add/join/product.mobileplan-add.join.signature-line.controller';
import ProductMobileplanAddJoinRemotePwd from './controllers/mobileplan-add/join/product.mobileplan-add.join.remote-pwd.controller';
import ProductMobileplanAddJoinPayment from './controllers/mobileplan-add/join/product.mobileplan-add.join.payment.controller';
import ProductMobileplanAddJoinTFamily from './controllers/mobileplan-add/join/product.mobileplan-add.join.t-family.controller';
import ProductMobileplanAddJoin5gxWatchTab from './controllers/mobileplan-add/join/product.mobileplan-add.join.5gx-watchtab.controller';
import ProductMobileplanAddJoin5gxVRpack from './controllers/mobileplan-add/join/product.mobileplan-add.join.5gx-vrpack.controller';
import ProductMobileplanAddSettingCombineLine from './controllers/mobileplan-add/setting/product.mobileplan-add.setting.combine-line.controller';
import ProductMobileplanAddSettingSignatureLine from './controllers/mobileplan-add/setting/product.mobileplan-add.setting.signature-line.controller';
import ProductMobileplanAddLookupPayment from './controllers/mobileplan-add/lookup/product.mobileplan-add.lookup.payment.controller';

import ProductWire from './controllers/wireplan/product.wireplan.controller';
import ProductWires from './controllers/wireplan/product.wireplan.list.controller';
import ProductWireplanJoinReservation from './controllers/wireplan/join/product.wireplan.join.reservation.controller';
import ProductWireplanJoinRequireDocumentApply from './controllers/wireplan/join/product.wireplan.join.require-document.apply.controller';
import ProductWireplanJoinRequireDocumentHistory from './controllers/wireplan/join/product.wireplan.join.require-document.history.controller';
import ProductWireplanJoin from './controllers/wireplan/join/product.wireplan.join.controller';
import ProductWireplanJoinBasicInfo from './controllers/wireplan/join/product.wireplan.join.basic-info.controller';
import ProductWireplanJoinLettering from './controllers/wireplan/join/product.wireplan.join.lettering.controller';
import ProductWireplanJoinShowSender from './controllers/wireplan/join/product.wireplan.join.show-sender.controller';
import ProductWireplanSettingBasicInfo from './controllers/wireplan/setting/product.wireplan.setting.basic-info.controller';
import ProductWireplanSettingLettering from './controllers/wireplan/setting/product.wireplan.setting.lettering.controller';
import ProductWireplanSettingShowSender from './controllers/wireplan/setting/product.wireplan.setting.show-sender.controller';
import ProductWireplanTerminate from './controllers/wireplan/product.wireplan.terminate.controller';
import ProductWireplanReservationCancel from './controllers/wireplan/product.wireplan.reservation-cancel.controller';

import ProductRoaming from './controllers/roaming/product.roaming.controller';
import ProductRoamingMyUse from './controllers/roaming/product.roaming.my-use.controller';
import ProductRoamingSearchBefore from './controllers/roaming/product.roaming.do.search-before.controller';
import ProductRoamingSearchAfter from './controllers/roaming/product.roaming.do.search-after.controller';
import ProductRoamingSearchResult from './controllers/roaming/product.roaming.search-result.controller';
import ProductRoamingGuide from './controllers/roaming/product.roaming.info.guide.controller';
import ProductRoamingLteGuide from './controllers/roaming/product.roaming.info.lte.controller';
import ProductRoamingSecureTroaming from './controllers/roaming/product.roaming.info.secure-troaming.controller';
import ProductRoamingDataRoaming from './controllers/roaming/product.roaming.info.data-roaming.controller';
import ProductRoamingFee from './controllers/roaming/product.roaming.fee.controller';
import ProductRoamingPlanAdd from './controllers/roaming/product.roaming.planadd.controller';
import ProductRoamingCoupon from './controllers/roaming/product.roaming.coupon.controller';
import ProductRoamingFiGuide from './controllers/roaming/product.roaming.fi.guide.controller';
import ProductRoamingFiInquire from './controllers/roaming/product.roaming.fi.inquire.controller';
import ProductRoamingFiReservation from './controllers/roaming/product.roaming.fi.reservation.controller';
import ProductRoamingFiReservationComplete from './controllers/roaming/product.roaming.fi.reservation-complete.controller';
import ProductRoamingInfoCenter from './controllers/roaming/product.roaming.info.center.controller';
import ProductRoamingJoinRoamingSetup from './controllers/roaming/join/product.roaming.join.roaming-setup.controller';
import ProductRoamingJoinRoamingBeginSetup from './controllers/roaming/join/product.roaming.join.roaming-begin-setup.controller';
import ProductRoamingJoinRoamingAuto from './controllers/roaming/join/product.roaming.join.roaming-auto.controller';
import ProductRoamingSettingRoamingAuto from './controllers/roaming/setting/product.roaming.setting.roaming-auto.controller';
import ProductRoamingSettingRoamingSetup from './controllers/roaming/setting/product.roaming.setting.roaming-setup.controller';
import ProductRoamingSettingRoamingBeginSetup from './controllers/roaming/setting/product.roaming.setting.roaming-begin-setup.controller';
import ProductRoamingLookup from './controllers/roaming/product.roaming.lookup.controller';
import ProductRoamingJoinConfirmInfo from './controllers/roaming/join/product.roaming.join.confirm-info.controller';
import ProductRoamingJoinRoamingAlarm from './controllers/roaming/join/product.roaming.join.roaming-alarm.controller';
import ProductRoamingSettingRoamingAlarm from './controllers/roaming/setting/product.roaming.setting.roaming-alarm.controller';
import ProductRoamingSettingRoamingCombine from './controllers/roaming/setting/product.roaming.setting.roaming-combine.controller';
import ProductRoamingJoinRoamingCombine from './controllers/roaming/join/product.roaming.join.roaming-combine.controller';
import ProductRoamingTerminate from './controllers/roaming/product.roaming.terminate.controller';
import ProductRoamingInfoPhBook from './controllers/roaming/product.roaming.info.ph-book.controller';
import ProductCommonCallplanBackup from './controllers/common/product.common.callplan-backup.controller';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/mobileplan', controller: Product });
    this.controllers.push({ url: '/mobileplan/list', controller: ProductPlans });
    this.controllers.push({ url: '/mobileplan/join/tplan', controller: ProductMobileplanJoinTplan });
    this.controllers.push({ url: '/mobileplan/join/0plan-sm', controller: ProductMobileplanJoin0planSm });
    this.controllers.push({ url: '/mobileplan/join/share-line', controller: ProductMobileplanJoinShareLine });
    this.controllers.push({ url: '/mobileplan/join/data-together', controller: ProductMobileplanJoinDataTogether });
    this.controllers.push({ url: '/mobileplan/join', controller: ProductMobileplanJoin });
    this.controllers.push({ url: '/mobileplan/setting/tplan', controller: ProductMobileplanSettingTplan });
    this.controllers.push({ url: '/mobileplan/setting/0plan', controller: ProductMobileplanSetting0plan });
    this.controllers.push({ url: '/mobileplan/setting/0plan-sm', controller: ProductMobileplanSetting0planSm });
    this.controllers.push({ url: '/mobileplan/setting/option', controller: ProductMobileplanSettingOption });
    this.controllers.push({ url: '/mobileplan/setting/ting', controller: ProductMobileplanSettingTing });
    this.controllers.push({ url: '/mobileplan/setting/number', controller: ProductMobileplanSettingNumber });
    this.controllers.push({ url: '/mobileplan/setting/number-friend', controller: ProductMobileplanSettingNumberFriend });
    this.controllers.push({ url: '/mobileplan/setting/location', controller: ProductMobileplanSettingLocation });
    this.controllers.push({ url: '/mobileplan/setting/location-only', controller: ProductMobileplanSettingLocation });
    this.controllers.push({ url: '/mobileplan/setting/no-limit', controller: ProductMobileplanSettingBandYT });
    this.controllers.push({ url: '/mobileplan/lookup/couple', controller: ProductMobileplanSettingCouple });
    this.controllers.push({ url: '/mobileplan/lookup/tplan', controller: ProductMobileplanLookupTplan });
    this.controllers.push({ url: '/mobileplan/lookup/ting', controller: ProductMobileplanLookupTing });
    this.controllers.push({ url: '/mobileplan/find', controller: ProductMobileplanFind });

    this.controllers.push({ url: '/mobileplan-add', controller: ProductAddition });
    this.controllers.push({ url: '/mobileplan-add/list', controller: ProductAdditions });
    this.controllers.push({ url: '/mobileplan-add/join/signature-line', controller: ProductMobileplanAddJoinSignatureLine });
    this.controllers.push({ url: '/mobileplan-add/join/remote-pwd', controller: ProductMobileplanAddJoinRemotePwd });
    this.controllers.push({ url: '/mobileplan-add/join/combine-line', controller: ProductMobileplanAddJoinCombineLine });
    this.controllers.push({ url: '/mobileplan-add/join/payment', controller: ProductMobileplanAddJoinPayment });
    this.controllers.push({ url: '/mobileplan-add/join/t-family', controller: ProductMobileplanAddJoinTFamily });
    this.controllers.push({ url: '/mobileplan-add/join/5gx-watchtab', controller: ProductMobileplanAddJoin5gxWatchTab });
    this.controllers.push({ url: '/mobileplan-add/join/5gx-vrpack', controller: ProductMobileplanAddJoin5gxVRpack });
    this.controllers.push({ url: '/mobileplan-add/join', controller: ProductMobileplanAddJoin });
    this.controllers.push({ url: '/mobileplan-add/setting/signature-line', controller: ProductMobileplanAddSettingSignatureLine });
    this.controllers.push({ url: '/mobileplan-add/setting/combine-line', controller: ProductMobileplanAddSettingCombineLine });
    this.controllers.push({ url: '/mobileplan-add/lookup/payment', controller: ProductMobileplanAddLookupPayment });
    this.controllers.push({ url: '/mobileplan-add/terminate', controller: ProductMobileplanAddTerminate });

    this.controllers.push({ url: '/wireplan(/service-area|/portability)?', controller: ProductWire });
    this.controllers.push({ url: '/wireplan(/service-area)?', controller: ProductWire });
    this.controllers.push({ url: '/wireplan/internet|phone|tv', controller: ProductWires });
    this.controllers.push({ url: '/wireplan/join/reservation', controller: ProductWireplanJoinReservation });
    this.controllers.push({ url: '/wireplan/join/require-document/apply', controller: ProductWireplanJoinRequireDocumentApply });
    this.controllers.push({ url: '/wireplan/join/require-document/history', controller: ProductWireplanJoinRequireDocumentHistory });
    this.controllers.push({ url: '/wireplan/join/basic-info', controller: ProductWireplanJoinBasicInfo });
    this.controllers.push({ url: '/wireplan/join/lettering', controller: ProductWireplanJoinLettering });
    this.controllers.push({ url: '/wireplan/join/show-sender', controller: ProductWireplanJoinShowSender });
    this.controllers.push({ url: '/wireplan/join', controller: ProductWireplanJoin });
    this.controllers.push({ url: '/wireplan/setting/basic-info', controller: ProductWireplanSettingBasicInfo });
    this.controllers.push({ url: '/wireplan/setting/lettering', controller: ProductWireplanSettingLettering });
    this.controllers.push({ url: '/wireplan/setting/show-sender', controller: ProductWireplanSettingShowSender });
    this.controllers.push({ url: '/wireplan/terminate', controller: ProductWireplanTerminate });
    this.controllers.push({ url: '/wireplan/reservation-cancel', controller: ProductWireplanReservationCancel });

    this.controllers.push({ url: '/apps', controller: ProductApps });
    this.controllers.push({ url: '/apps/app', controller: ProductAppsDetail });

    this.controllers.push({ url: '/roaming/do/search-before', controller: ProductRoamingSearchBefore });
    this.controllers.push({ url: '/roaming/do/search-after', controller: ProductRoamingSearchAfter });
    this.controllers.push({ url: '/roaming/search-result', controller: ProductRoamingSearchResult });
    this.controllers.push({ url: '/roaming/info/guide', controller: ProductRoamingGuide });
    this.controllers.push({ url: '/roaming/info/lte', controller: ProductRoamingLteGuide });
    this.controllers.push({ url: '/roaming/info/secure-troaming', controller: ProductRoamingSecureTroaming });
    this.controllers.push({ url: '/roaming/info/data-roaming', controller: ProductRoamingDataRoaming });
    this.controllers.push({ url: '/roaming/fee', controller: ProductRoamingFee });
    this.controllers.push({ url: '/roaming/planadd', controller: ProductRoamingPlanAdd });
    this.controllers.push({ url: '/roaming/fi/guide', controller: ProductRoamingFiGuide });
    this.controllers.push({ url: '/roaming/fi/inquire', controller: ProductRoamingFiInquire });
    this.controllers.push({ url: '/roaming/coupon', controller: ProductRoamingCoupon });
    this.controllers.push({ url: '/roaming/fi/reservation', controller: ProductRoamingFiReservation });
    this.controllers.push({ url: '/roaming/fi/reservation-complete', controller: ProductRoamingFiReservationComplete });
    this.controllers.push({ url: '/roaming/info/center', controller: ProductRoamingInfoCenter });
    this.controllers.push({ url: '/roaming/join/roaming-setup', controller: ProductRoamingJoinRoamingSetup });
    this.controllers.push({ url: '/roaming/join/roaming-begin-setup', controller: ProductRoamingJoinRoamingBeginSetup });
    this.controllers.push({ url: '/roaming/join/roaming-auto', controller: ProductRoamingJoinRoamingAuto });
    this.controllers.push({ url: '/roaming/join/confirm-info', controller: ProductRoamingJoinConfirmInfo });
    this.controllers.push({ url: '/roaming/join/roaming-alarm', controller: ProductRoamingJoinRoamingAlarm });
    this.controllers.push({ url: '/roaming/join/roaming-combine', controller: ProductRoamingJoinRoamingCombine });
    this.controllers.push({ url: '/roaming/setting/roaming-setup', controller: ProductRoamingSettingRoamingSetup });
    this.controllers.push({ url: '/roaming/setting/roaming-begin-setup', controller: ProductRoamingSettingRoamingBeginSetup });
    this.controllers.push({ url: '/roaming/setting/roaming-auto', controller: ProductRoamingSettingRoamingAuto });
    this.controllers.push({ url: '/roaming/setting/roaming-alarm', controller: ProductRoamingSettingRoamingAlarm });
    this.controllers.push({ url: '/roaming/setting/roaming-combine', controller: ProductRoamingSettingRoamingCombine });
    this.controllers.push({ url: '/roaming', controller: ProductRoaming });
    this.controllers.push({ url: '/roaming/my-use', controller: ProductRoamingMyUse });
    this.controllers.push({ url: '/roaming/lookup', controller: ProductRoamingLookup });

    this.controllers.push({ url: '/callplan', controller: ProductCommonCallplan });
    this.controllers.push({ url: '/callplan/:prodId', controller: ProductCommonCallplanBackup });
    this.controllers.push({ url: '/callplan-preview', controller: ProductCommonCallplanPreview });
    this.controllers.push({ url: '/line-change', controller: ProductCommonLineChange });

    this.controllers.push({ url: '/roaming/terminate', controller: ProductRoamingTerminate });
    this.controllers.push({ url: '/roaming/info/ph-book', controller: ProductRoamingInfoPhBook });
  }
}

export default ProductRouter;
