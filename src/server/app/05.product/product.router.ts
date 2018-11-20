import TwRouter from '../../common/route/tw.router';
import ProductDetail from './controllers/product.detail.controller';
import ProductJoinReservation from './controllers/join/product.join.reservation.controller';
import ProductAdditionsTerminate from './controllers/terminate/product.terminate.additions.controller';
import Product from './controllers/mobileplan/product.mobileplan.controller';
import ProductAddition from './controllers/mobileplan-add/product.mobileplan-add.controller';
import ProductPlans from './controllers/mobileplan/product.mobileplan.list.controller';
import ProductAdditions from './controllers/mobileplan-add/product.mobileplan-add.list.controller';
import ProductFindMyBestPlans from './controllers/product.find-my-best-plans.controller';
import ProductWire from './controllers/wireplan/product.wireplan.controller';
import ProductWires from './controllers/wireplan/product.wireplan.list.controller';
import ProductJoinRequireDocumentApply from './controllers/join/product.join.require-document.apply.controller';
import ProductJoinRequireDocumentHistory from './controllers/join/product.join.require-document.history.controller';
import ProductApps from './controllers/apps/product.apps.controller';
import ProductJoinCombineLine from './controllers/join/product.join.combine-line.controller';
import ProductSettingCombineLine from './controllers/setting/product.setting.combine-line.controller';
import ProductSettingOption from './controllers/setting/product.setting.option.controller';
import ProductJoinTplan from './controllers/join/product.join.tplan.controller';
import ProductSettingTplan from './controllers/setting/product.setting.tplan.controller';
import ProductLookupTplan from './controllers/lookup/product.lookup.tplan.controller';
import ProductJoinShareLine from './controllers/join/product.join.share-line.controller';
import ProductSetting0plan from './controllers/setting/product.setting.0plan.controller';
import ProductJoinDataTogether from './controllers/join/product.join.data-together.controller';
import ProductSettingTing from './controllers/setting/product.setting.ting.controllter';
import ProductLookupTing from './controllers/lookup/product.lookup.ting.controller';
import ProductSettingSignatureLine from './controllers/setting/product.setting.signature-line.controller';
import ProductJoinSignatureLine from './controllers/join/product.join.signature-line.controller';
import ProductSettingNumber from './controllers/setting/product.setting.number.controller';
import ProductSettingNumberFriend from './controllers/setting/product.setting.number-friend.controller';
import ProductSettingTargetDiscount from './controllers/setting/product.setting.target-discount.controller';
import ProductJoinRemotePwd from './controllers/join/product.join.remote-pwd.controller';
import ProductJoinMobileplan from './controllers/join/product.join.mobileplan.controller';
import ProductJoinMobileplanAdd from './controllers/join/product.join.mobileplan-add.controller';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/mobileplan(/club-t|/campuszone|/concierge)?', controller: Product });
    this.controllers.push({ url: '/mobileplan/list', controller: ProductPlans });
    this.controllers.push({ url: '/mobileplan/join/tplan/:prodId', controller: ProductJoinTplan });
    this.controllers.push({ url: '/mobileplan/join/share-line/:prodId', controller: ProductJoinShareLine });
    this.controllers.push({ url: '/mobileplan/join/data-together/:prodId', controller: ProductJoinDataTogether });
    this.controllers.push({ url: '/mobileplan/join/:prodId', controller: ProductJoinMobileplan });
    this.controllers.push({ url: '/mobileplan/setting/tplan/:prodId', controller: ProductSettingTplan });
    this.controllers.push({ url: '/mobileplan/setting/location/:prodId', controller: ProductSettingTargetDiscount });
    this.controllers.push({ url: '/mobileplan/setting/0plan/:prodId', controller: ProductSetting0plan });
    this.controllers.push({ url: '/mobileplan/setting/option/:prodId', controller: ProductSettingOption });
    this.controllers.push({ url: '/mobileplan/setting/ting/:prodId', controller: ProductSettingTing });
    this.controllers.push({ url: '/mobileplan/setting/number/:prodId', controller: ProductSettingNumber });
    this.controllers.push({ url: '/mobileplan/setting/number-friend/:prodId', controller: ProductSettingNumberFriend });
    this.controllers.push({ url: '/mobileplan/setting/location/:prodId', controller: ProductSettingTargetDiscount });
    this.controllers.push({ url: '/mobileplan/lookup/tplan(/:prodId)?', controller: ProductLookupTplan });
    this.controllers.push({ url: '/mobileplan/lookup/ting/:prodId', controller: ProductLookupTing });
    this.controllers.push({ url: '/mobileplan/find', controller: ProductFindMyBestPlans });

    this.controllers.push({ url: '/mobileplan-add', controller: ProductAddition });
    this.controllers.push({ url: '/mobileplan-add/list', controller: ProductAdditions });
    this.controllers.push({ url: '/mobileplan-add/join/signature-line/:prodId', controller: ProductJoinSignatureLine });
    this.controllers.push({ url: '/mobileplan-add/join/remote-pwd/:prodId', controller: ProductJoinRemotePwd });
    this.controllers.push({ url: '/mobileplan-add/join/combine-line/:prodId', controller: ProductJoinCombineLine });
    this.controllers.push({ url: '/mobileplan-add/join/:prodId', controller: ProductJoinMobileplanAdd });
    this.controllers.push({ url: '/mobileplan-add/setting/signature-line/:prodId', controller: ProductSettingSignatureLine });
    this.controllers.push({ url: '/mobileplan-add/setting/combine-line/:prodId', controller: ProductSettingCombineLine });
    this.controllers.push({ url: '/mobileplan-add/terminate/:prodId', controller: ProductAdditionsTerminate });

    this.controllers.push({ url: '/wireplan(/service-area|/portability)?', controller: ProductWire });
    this.controllers.push({ url: '/wireplan(/service-area)?', controller: ProductWire });
    this.controllers.push({ url: '/wireplan/internet|phone|tv', controller: ProductWires });
    this.controllers.push({ url: '/wireplan/join/require-document/apply', controller: ProductJoinRequireDocumentApply });
    this.controllers.push({ url: '/wireplan/join/require-document/history', controller: ProductJoinRequireDocumentHistory });

    this.controllers.push({ url: '/apps', controller: ProductApps });
    this.controllers.push({ url: '/apps(/:appId)?', controller: ProductApps });

    this.controllers.push({ url: '(/mobileplan|/mobileplan-add|/wireplan|/roaming)/detail/:prodId', controller: ProductDetail });
    this.controllers.push({ url: '(/mobileplan|/mobileplan-add|/wireplan)/join/reservation', controller: ProductJoinReservation });
  }
}

export default ProductRouter;
