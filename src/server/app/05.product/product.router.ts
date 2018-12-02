import TwRouter from '../../common/route/tw.router';

import ProductCommonCallplan from './controllers/common/product.common.callplan.controller';
import ProductApps from './controllers/apps/product.apps.controller';

import Product from './controllers/mobileplan/product.mobileplan.controller';
import ProductPlans from './controllers/mobileplan/product.mobileplan.list.controller';
import ProductMobileplanFind from './controllers/mobileplan/product.mobileplan.find.controller';
import ProductMobileplanJoin from './controllers/mobileplan/join/product.mobileplan.join.controller';
import ProductMobileplanJoinTplan from './controllers/mobileplan/join/product.mobileplan.join.tplan.controller';
import ProductMobileplanJoinShareLine from './controllers/mobileplan/join/product.mobileplan.join.share-line.controller';
import ProductMobileplanJoinDataTogether from './controllers/mobileplan/join/product.mobileplan.join.data-together.controller';
import ProductMobileplanSettingOption from './controllers/mobileplan/setting/product.mobileplan.setting.option.controller';
import ProductMobileplanSettingTplan from './controllers/mobileplan/setting/product.mobileplan.setting.tplan.controller';
import ProductMobileplanSetting0plan from './controllers/mobileplan/setting/product.mobileplan.setting.0plan.controller';
import ProductMobileplanSettingTing from './controllers/mobileplan/setting/product.mobileplan.setting.ting.controllter';
import ProductMobileplanSettingNumber from './controllers/mobileplan/setting/product.mobileplan.setting.number.controller';
import ProductMobileplanSettingNumberFriend from './controllers/mobileplan/setting/product.mobileplan.setting.number-friend.controller';
import ProductMobileplanSettingBandYT from './controllers/mobileplan/setting/product.mobileplan.setting.bandYT.controller';
import ProductMobileplanLookupTplan from './controllers/mobileplan/lookup/product.mobileplan.lookup.tplan.controller';
import ProductMobileplanLookupTing from './controllers/mobileplan/lookup/product.mobileplan.lookup.ting.controller';
import ProductMobileplanSettingCouple from './controllers/mobileplan/lookup/product.mobileplan.lookup.couple.controller';

import ProductAddition from './controllers/mobileplan-add/product.mobileplan-add.controller';
import ProductAdditions from './controllers/mobileplan-add/product.mobileplan-add.list.controller';
import ProductMobileplanAddTerminate from './controllers/mobileplan-add/product.mobileplan-add.terminate.controller';
import ProductMobileplanAddJoin from './controllers/mobileplan-add/join/product.mobileplan-add.join.controller';
import ProductMobileplanAddJoinCombineLine from './controllers/mobileplan-add/join/product.mobileplan-add.join.combine-line.controller';
import ProductMobileplanAddJoinSignatureLine from './controllers/mobileplan-add/join/product.mobileplan-add.join.signature-line.controller';
import ProductMobileplanAddJoinRemotePwd from './controllers/mobileplan-add/join/product.mobileplan-add.join.remote-pwd.controller';
import ProductMobileplanAddJoinPayment from './controllers/mobileplan-add/join/product.mobileplan-add.join.payment.controller';
import ProductMobileplanAddSettingCombineLine from './controllers/mobileplan-add/setting/product.mobileplan-add.setting.combine-line.controller';
import ProductMobileplanAddSettingSignatureLine from './controllers/mobileplan-add/setting/product.mobileplan-add.setting.signature-line.controller';

import ProductWire from './controllers/wireplan/product.wireplan.controller';
import ProductWires from './controllers/wireplan/product.wireplan.list.controller';
import ProductWireplanJoinReservation from './controllers/wireplan/join/product.wireplan.join.reservation.controller';
import ProductWireplanJoinRequireDocumentApply from './controllers/wireplan/join/product.wireplan.join.require-document.apply.controller';
import ProductWireplanJoinRequireDocumentHistory from './controllers/wireplan/join/product.wireplan.join.require-document.history.controller';

import ProductMobileplanSettingLocation from './controllers/mobileplan/setting/product.mobileplan.setting.location.controller';

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
import ProductRoamingFiInquireAuth from './controllers/roaming/product.roaming.fi.inquire-auth.controller';
import ProductRoamingFiInquireEdit from './controllers/roaming/product.roaming.fi.inquire-edit.controller';
import ProductRoamingFiReservation1step from './controllers/roaming/product.roaming.fi.reservation1step.controller';
import ProductRoamingFiReservation2step from './controllers/roaming/product.roaming.fi.reservation2step.controller';
import ProductRoamingFiReservation3step from './controllers/roaming/product.roaming.fi.reservation3step.controller';
import ProductRoamingInfoCenter from './controllers/roaming/product.roaming.info.center.controller';
import ProductWireplanJoin from './controllers/wireplan/join/product.wireplan.join.controller';
import ProductWireplanTerminate from './controllers/wireplan/product.wireplan.terminate.controller';
import ProductAppsDetail from './controllers/apps/product.apps.detail.controller';
import ProductRoamingJoinRoamingSetup from './controllers/roaming/join/product.roaming.join.roaming-setup.controller';
import ProductMobileplanComparePlans from './controllers/mobileplan/product.mobileplan.compare-plans';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/mobileplan(/club-t|/campuszone|/concierge)?', controller: Product });
    this.controllers.push({ url: '/mobileplan/list', controller: ProductPlans });
    this.controllers.push({ url: '/mobileplan/join/tplan', controller: ProductMobileplanJoinTplan });
    this.controllers.push({ url: '/mobileplan/join/share-line', controller: ProductMobileplanJoinShareLine });
    this.controllers.push({ url: '/mobileplan/join/data-together', controller: ProductMobileplanJoinDataTogether });
    this.controllers.push({ url: '/mobileplan/join', controller: ProductMobileplanJoin });
    this.controllers.push({ url: '/mobileplan/setting/tplan', controller: ProductMobileplanSettingTplan });
    this.controllers.push({ url: '/mobileplan/setting/0plan', controller: ProductMobileplanSetting0plan });
    this.controllers.push({ url: '/mobileplan/setting/option', controller: ProductMobileplanSettingOption });
    this.controllers.push({ url: '/mobileplan/setting/ting', controller: ProductMobileplanSettingTing });
    this.controllers.push({ url: '/mobileplan/setting/number', controller: ProductMobileplanSettingNumber });
    this.controllers.push({ url: '/mobileplan/setting/number-friend', controller: ProductMobileplanSettingNumberFriend });
    this.controllers.push({ url: '/mobileplan/setting/location', controller: ProductMobileplanSettingLocation });
    this.controllers.push({ url: '/mobileplan/setting/no-limit', controller: ProductMobileplanSettingBandYT});
    this.controllers.push({ url: '/mobileplan/lookup/couple', controller: ProductMobileplanSettingCouple});
    this.controllers.push({ url: '/mobileplan/lookup/tplan', controller: ProductMobileplanLookupTplan });
    this.controllers.push({ url: '/mobileplan/lookup/ting', controller: ProductMobileplanLookupTing });
    this.controllers.push({ url: '/mobileplan/find', controller: ProductMobileplanFind });
    this.controllers.push({ url: '/mobileplan/compare-plans', controller: ProductMobileplanComparePlans });

    this.controllers.push({ url: '/mobileplan-add', controller: ProductAddition });
    this.controllers.push({ url: '/mobileplan-add/list', controller: ProductAdditions });
    this.controllers.push({ url: '/mobileplan-add/join/signature-line', controller: ProductMobileplanAddJoinSignatureLine });
    this.controllers.push({ url: '/mobileplan-add/join/remote-pwd', controller: ProductMobileplanAddJoinRemotePwd });
    this.controllers.push({ url: '/mobileplan-add/join/combine-line', controller: ProductMobileplanAddJoinCombineLine });
    this.controllers.push({ url: '/mobileplan-add/join/payment', controller: ProductMobileplanAddJoinPayment });
    this.controllers.push({ url: '/mobileplan-add/join', controller: ProductMobileplanAddJoin });
    this.controllers.push({ url: '/mobileplan-add/setting/signature-line', controller: ProductMobileplanAddSettingSignatureLine });
    this.controllers.push({ url: '/mobileplan-add/setting/combine-line', controller: ProductMobileplanAddSettingCombineLine });
    this.controllers.push({ url: '/mobileplan-add/terminate', controller: ProductMobileplanAddTerminate });

    this.controllers.push({ url: '/wireplan(/service-area|/portability)?', controller: ProductWire });
    this.controllers.push({ url: '/wireplan(/service-area)?', controller: ProductWire });
    this.controllers.push({ url: '/wireplan/internet|phone|tv', controller: ProductWires });
    this.controllers.push({ url: '/wireplan/join/reservation', controller: ProductWireplanJoinReservation });
    this.controllers.push({ url: '/wireplan/join/require-document/apply', controller: ProductWireplanJoinRequireDocumentApply });
    this.controllers.push({ url: '/wireplan/join/require-document/history', controller: ProductWireplanJoinRequireDocumentHistory });
    this.controllers.push({ url: '/wireplan/join', controller: ProductWireplanJoin });
    this.controllers.push({ url: '/wireplan/terminate', controller: ProductWireplanTerminate });

    this.controllers.push({ url: '/apps', controller: ProductApps });
    this.controllers.push({ url: '/apps/:appId', controller: ProductAppsDetail });

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
    this.controllers.push({ url: '/roaming/fi/inquire-auth', controller: ProductRoamingFiInquireAuth });
    this.controllers.push({ url: '/roaming/fi/inquire-edit', controller: ProductRoamingFiInquireEdit });
    this.controllers.push({ url: '/roaming/coupon', controller: ProductRoamingCoupon });
    this.controllers.push({ url: '/roaming/fi/reservation1step', controller: ProductRoamingFiReservation1step });
    this.controllers.push({ url: '/roaming/fi/reservation2step', controller: ProductRoamingFiReservation2step });
    this.controllers.push({ url: '/roaming/fi/reservation3step', controller: ProductRoamingFiReservation3step });
    this.controllers.push({ url: '/roaming/info/center', controller: ProductRoamingInfoCenter });
    this.controllers.push({ url: '/roaming/join/roaming-setup', controller: ProductRoamingJoinRoamingSetup });
    this.controllers.push({ url: '/roaming', controller: ProductRoaming });
    this.controllers.push({ url: '/roaming/my-use', controller: ProductRoamingMyUse });

    this.controllers.push({ url: '/callplan/:prodId', controller: ProductCommonCallplan });
  }
}

export default ProductRouter;
