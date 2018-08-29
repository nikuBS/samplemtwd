import ProductMobile from './controllers/product.mobile.controller';
import ProductInternel from './controllers/product.internel.controller';
import ProductMobileDetail from './controllers/product.mobile-detail.controller';
import TwRouter from '../../common/route/tw.router';

class ProductRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/mobile/:id', controller: new ProductMobileDetail() });
    this.controllers.push({ url: '/mobile', controller: new ProductMobile() });
    this.controllers.push({ url: '/internet/home', controller: new ProductInternel() });
  }
}

export default ProductRouter;
