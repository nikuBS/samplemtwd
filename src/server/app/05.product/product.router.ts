import TwRouter from '../../common/route/tw.router';
import ProductDetail from './controllers/product.detail.controller';
import ProductJoin from './controllers/product.join.controller';
import ProductAdditionsTerminate from './controllers/product.additions-terminate.controller';
import ProductAdditionsTerminateSuccess from './controllers/product.additions-terminate-success.controller';
import ProductSetting from './controllers/product.setting.controller';
import ProductDetailContents from './controllers/product.detail.contents.controller';
import ProductInfinityBenefitUsageHistory from './controllers/product.infinity-benefit-usage-history.controller';
import ProductCurrentSetting from './controllers/product.current-setting.controller';
import Product from './controllers/product.controller';
import ProductAddition from './controllers/product.addition.controller';
import ProductPlans from './controllers/product.plans.controller';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/', controller: new Product() });
    this.controllers.push({ url: '/addition', controller: new ProductAddition() });
    this.controllers.push({ url: '/plans', controller: new ProductPlans() });
    this.controllers.push({ url: '/detail/:prodId', controller: new ProductDetail() });
    this.controllers.push({ url: '/detail/contents/:prodId', controller: new ProductDetailContents() });
    this.controllers.push({ url: '/join/:prodId', controller: new ProductJoin() });
    this.controllers.push({ url: '/additions-terminate/:prodId', controller: new ProductAdditionsTerminate() });
    this.controllers.push({ url: '/additions-terminate/:prodId/success', controller: new ProductAdditionsTerminateSuccess() });
    this.controllers.push({ url: '/setting/:prodId', controller: new ProductSetting() });
    this.controllers.push({ url: '/current-setting/:prodId', controller: new ProductCurrentSetting() });
    this.controllers.push({ url: '/infinity-benefit-usage-history', controller: new ProductInfinityBenefitUsageHistory() });
  }
}

export default ProductRouter;
