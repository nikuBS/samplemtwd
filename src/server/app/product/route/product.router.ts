import ProductMobileController from '../../product/controllers/product.mobile.controller';
import ProductInternelController from '../../product/controllers/product.internel.controller';
import ProductMobileDetailController from '../../product/controllers/product.mobile-detail.controller';
import TxRouter from '../../common/route/tx.router';

class ProductRouter extends TxRouter {
  constructor() {
    super();
    this._controllers.push({ url: '/mobile/:id', controller: new ProductMobileDetailController() });
    this._controllers.push({ url: '/mobile', controller: new ProductMobileController() });
    this._controllers.push({ url: '/internet/home', controller: new ProductInternelController() });
  }
}

export default ProductRouter;