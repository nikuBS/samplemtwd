import TwRouter from '../../common/route/tw.router';
import ProductDetail from './controllers/product.detail.controller';
import ProductJoin from './controllers/join/product.join.controller';
import ProductJoinReservation from './controllers/join/product.join.reservation.controller';
import ProductSetting from './controllers/setting/product.setting.controller';
import ProductTerminate from './controllers/product.terminate.controller';
import ProductInfinityBenefitUsageHistory from './controllers/product.infinity-benefit-usage-history.controller';
import Product from './controllers/product.controller';
import ProductAddition from './controllers/addition/product.addition.controller';
import ProductPlans from './controllers/plan/product.plans.controller';
import ProductAdditions from './controllers/addition/product.additions.controller';
import ProductFindMyBestPlans from './controllers/product.find-my-best-plans.controller';
import ProductJoinDisPgm from './controllers/join/product.join.dis-pgm';
import ProductJoinDisPgmDetail from './controllers/join/product.join.dis-pgm.detail';
import ProductWire from './controllers/wire/product.wire.controller';
import ProductWires from './controllers/wire/product.wires.controller';
import ProductJoinRequireDocumentApply from './controllers/join/product.join.require-document.apply.controller';
import ProductJoinRequireDocumentHistory from './controllers/join/product.join.require-document.history.controller';
import ProductApps from './app/product.apps.controller';
import ProductJoinCombineLine from './controllers/join/product.join.combine-line.controller';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    // old IA
    this.controllers.push({ url: '/mobileplan', controller: Product });
    this.controllers.push({ url: '/addition', controller: ProductAddition });
    this.controllers.push({ url: '/mobileplan/list', controller: ProductPlans });
    this.controllers.push({ url: '/additions', controller: ProductAdditions });
    this.controllers.push({ url: '/wire(/service-area)?', controller: ProductWire });
    this.controllers.push({ url: '/internet|phone|tv', controller: ProductWires });
    this.controllers.push({ url: '/apps', controller: ProductApps });
    this.controllers.push({ url: '/detail/:prodId', controller: ProductDetail });
    this.controllers.push({ url: '/join/reservation', controller: ProductJoinReservation });
    this.controllers.push({ url: '/join/require-document/apply', controller: ProductJoinRequireDocumentApply });
    this.controllers.push({ url: '/join/require-document/history', controller: ProductJoinRequireDocumentHistory });
    this.controllers.push({ url: '/join/combine-line/:prodId', controller: ProductJoinCombineLine });
    this.controllers.push({ url: '/join/dis-program(/:prodId)', controller: ProductJoinDisPgm });
    this.controllers.push({ url: '/join/dis-program/detail(/:prodId)', controller: ProductJoinDisPgmDetail });
    this.controllers.push({ url: '/join/:prodId', controller: ProductJoin });
    this.controllers.push({ url: '/setting/:prodId', controller: ProductSetting });
    this.controllers.push({ url: '/terminate/:prodId', controller: ProductTerminate });
    this.controllers.push({ url: '/infinity-benefit-usage-history', controller: ProductInfinityBenefitUsageHistory });
    this.controllers.push({ url: '/find-my-best-plans', controller: ProductFindMyBestPlans });

    // new IA
  }
}

export default ProductRouter;
