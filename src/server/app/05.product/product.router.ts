import TwRouter from '../../common/route/tw.router';
import ProductDetail from './controllers/product.detail.controller';
import ProductJoin from './controllers/join/product.join.controller';
import ProductJoinReservation from './controllers/join/product.join.reservation.controller';
import ProductSetting from './controllers/setting/product.setting.controller';
import ProductTerminate from './controllers/product.terminate.controller';
import Product from './controllers/product.controller';
import ProductAddition from './controllers/addition/product.addition.controller';
import ProductPlans from './controllers/plan/product.plans.controller';
import ProductAdditions from './controllers/addition/product.additions.controller';
import ProductFindMyBestPlans from './controllers/product.find-my-best-plans.controller';
import ProductWire from './controllers/wire/product.wire.controller';
import ProductWires from './controllers/wire/product.wires.controller';
import ProductJoinRequireDocumentApply from './controllers/join/product.join.require-document.apply.controller';
import ProductJoinRequireDocumentHistory from './controllers/join/product.join.require-document.history.controller';
import ProductApps from './app/product.apps.controller';
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

class ProductRouter extends TwRouter {
  constructor() {
    super();

    // old IA
    this.controllers.push({ url: '/detail/:prodId', controller: ProductDetail });
    this.controllers.push({ url: '/join/reservation', controller: ProductJoinReservation });
    this.controllers.push({ url: '/join/require-document/apply', controller: ProductJoinRequireDocumentApply });
    this.controllers.push({ url: '/join/require-document/history', controller: ProductJoinRequireDocumentHistory });
    this.controllers.push({ url: '/join/tplan/:prodId', controller: ProductJoinTplan });
    this.controllers.push({ url: '/join/combine-line/:prodId', controller: ProductJoinCombineLine });
    this.controllers.push({ url: '/join/share-line/:prodId', controller: ProductJoinShareLine });
    this.controllers.push({ url: '/join/data-together/:prodId', controller: ProductJoinDataTogether });
    this.controllers.push({ url: '/join/:prodId', controller: ProductJoin });
    this.controllers.push({ url: '/setting/combine-line/:prodId', controller: ProductSettingCombineLine });
    this.controllers.push({ url: '/setting/option/:prodId', controller: ProductSettingOption });
    this.controllers.push({ url: '/setting/tplan/:prodId', controller: ProductSettingTplan });
    this.controllers.push({ url: '/setting/ting/:prodId', controller: ProductSettingTing });
    this.controllers.push({ url: '/setting/0plan/:prodId', controller: ProductSetting0plan });
    this.controllers.push({ url: '/setting/number/:prodId', controller: ProductSettingNumber });
    this.controllers.push({ url: '/setting/number-friend/:prodId', controller: ProductSettingNumberFriend });
    this.controllers.push({ url: '/lookup/tplan(/:prodId)?', controller: ProductLookupTplan });
    this.controllers.push({ url: '/lookup/ting/:prodId', controller: ProductLookupTing });
    this.controllers.push({ url: '/terminate/:prodId', controller: ProductTerminate });
    this.controllers.push({ url: '/find-my-best-plans', controller: ProductFindMyBestPlans });

    // new IA
    this.controllers.push({ url: '/mobileplan(/club-t|/campuszone|/concierge)?', controller: Product });
    this.controllers.push({ url: '/mobileplan-add', controller: ProductAddition });
    this.controllers.push({ url: '/mobileplan/list', controller: ProductPlans });
    this.controllers.push({ url: '/mobileplan-add/list', controller: ProductAdditions });
    this.controllers.push({ url: '/mobileplan-add/setting/signature-line/:prodId', controller: ProductSettingSignatureLine });
    this.controllers.push({ url: '/mobileplan-add/join/signature-line/:prodId', controller: ProductJoinSignatureLine });
    this.controllers.push({ url: '/wireplan(/service-area|/portability)?', controller: ProductWire });
    this.controllers.push({ url: '/wireplan/internet|phone|tv', controller: ProductWires });
    this.controllers.push({ url: '/apps', controller: ProductApps });
    this.controllers.push({ url: '/mobileplan/setting/location/:prodId', controller: ProductSettingTargetDiscount });
  }
}

export default ProductRouter;
