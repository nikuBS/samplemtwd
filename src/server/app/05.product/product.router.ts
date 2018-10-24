import TwRouter from '../../common/route/tw.router';
import ProductDetail from './controllers/product.detail.controller';
import ProductJoin from './controllers/product.join.controller';
import ProductSetting from './controllers/product.setting.controller';
import ProductTerminate from './controllers/product.terminate.controller';
import ProductDetailContents from './controllers/product.detail.contents.controller';
import ProductInfinityBenefitUsageHistory from './controllers/product.infinity-benefit-usage-history.controller';
import ProductCurrentSetting from './controllers/product.current-setting.controller';
import Product from './controllers/product.controller';
import ProductAddition from './controllers/product.addition.controller';
import ProductPlans from './controllers/product.plans.controller';
import ProductAdditions from './controllers/product.additions.controller';
import ProductFindMyBestPlans from './controllers/product.find-my-best-plans.controller';
import ProductSelContract from './controllers/product.sel-contract.input';
import ProductDisPgmJoin from './controllers/product.dis-pgm.join';
import ProductTPlusInput from './controllers/product.t-plus.input';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/', controller: Product });
    this.controllers.push({ url: '/addition', controller: ProductAddition });
    this.controllers.push({ url: '/plans', controller: ProductPlans });
    this.controllers.push({ url: '/additions', controller: ProductAdditions });
    this.controllers.push({ url: '/detail/:prodId', controller: ProductDetail });
    this.controllers.push({ url: '/detail/contents/:prodId', controller: ProductDetailContents });
    this.controllers.push({ url: '/join/:prodId', controller: ProductJoin });
    this.controllers.push({ url: '/setting/:prodId', controller: ProductSetting });
    this.controllers.push({ url: '/terminate/:prodId', controller: ProductTerminate });
    this.controllers.push({ url: '/current-setting/:prodId', controller: ProductCurrentSetting });
    this.controllers.push({ url: '/infinity-benefit-usage-history', controller: ProductInfinityBenefitUsageHistory });
    this.controllers.push({ url: '/find-my-best-plans', controller: ProductFindMyBestPlans });
    this.controllers.push({ url: '/sel-contract', controller: ProductSelContract });
    this.controllers.push({ url: '/dis-program-join', controller: ProductDisPgmJoin });
    this.controllers.push({ url: '/t-plus-input', controller: ProductTPlusInput });
  }
}

export default ProductRouter;
