import TwRouter from '../../common/route/tw.router';
import ProductDetail from './controllers/product.detail.controller';
import ProductJoin from './controllers/product.join.controller';
import ProductTerminate from './controllers/product.terminate.controller';
import ProductSetting from './controllers/product.setting.controller';
import ProductDetailContents from './controllers/product.detail.contents.controller';
import ProductBenefitUsageHistory from './controllers/product.benefit-usage-history.controller';
import ProductCurrentSetting from './controllers/product.current-setting.controller';
import Product from './controllers/product.controller';
import ProductAddition from './controllers/product.addition.controller';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/', controller: new Product() });
    this.controllers.push({ url: '/addition', controller: new ProductAddition() });
    this.controllers.push({ url: '/detail/:prodId', controller: new ProductDetail() });
    this.controllers.push({ url: '/detail/contents/:prodId', controller: new ProductDetailContents() });
    this.controllers.push({ url: '/join/:prodId', controller: new ProductJoin() });
    this.controllers.push({ url: '/terminate', controller: new ProductTerminate() });
    this.controllers.push({ url: '/setting', controller: new ProductSetting() });
    this.controllers.push({ url: '/current-setting', controller: new ProductCurrentSetting() });
    this.controllers.push({ url: '/benefit-usage-history', controller: new ProductBenefitUsageHistory() });
  }
}

export default ProductRouter;
