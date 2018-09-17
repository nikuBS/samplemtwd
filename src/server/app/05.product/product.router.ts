import TwRouter from '../../common/route/tw.router';
import ProductDetail from './controllers/product.detail.controller';
import ProductJoin from './controllers/product.join.controller';
import ProductTerminate from './controllers/product.terminate.controller';
import ProductSetting from './controllers/product.setting.controller';

class ProductRouter extends TwRouter {
  constructor() {
    super();

    this.controllers.push({ url: '/detail/:prodId', controller: new ProductDetail() });
    this.controllers.push({ url: '/join', controller: new ProductJoin() });
    this.controllers.push({ url: '/terminate', controller: new ProductTerminate() });
    this.controllers.push({ url: '/setting', controller: new ProductSetting() });
  }
}

export default ProductRouter;
