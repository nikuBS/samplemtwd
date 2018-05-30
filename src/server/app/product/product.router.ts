import ProductMobileController from './controllers/product.mobile.controller';
import ProductInternelController from './controllers/product.internel.controller';
import ProductMobileDetailController from './controllers/product.mobile-detail.controller';
import TwRouter from '../../common/route/tw.router';

class ProductRouter extends TwRouter {
  constructor() {
    super();
    this.controllers.push({ url: '/mobile/:id', controller: new ProductMobileDetailController() });
    this.controllers.push({ url: '/mobile', controller: new ProductMobileController() });
    this.controllers.push({ url: '/internet/home', controller: new ProductInternelController() });
  }
}

export default ProductRouter;
