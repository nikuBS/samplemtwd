import { IRouterMap } from '../../common/app.router';
import ProductMobileController from '../../product/controllers/product.mobile.controller';
import ProductInternelController from '../../product/controllers/product.internel.controller';
import ProductMobileDetailController from '../../product/controllers/product.mobile-detail.controller';

class ProductRouter {
  private static _instance: ProductRouter;
  private _controllers: Array<IRouterMap> = [];

  constructor() {
    this._controllers.push({ url: '/mobile/:id', controller: new ProductMobileDetailController() });
    this._controllers.push({ url: '/mobile', controller: new ProductMobileController() });
    this._controllers.push({ url: '/internet/home', controller: new ProductInternelController() });
  }

  static get instance(): any {
    return this._instance || (this._instance = new this());
  }

  get controllers(): Array<IRouterMap> {
    return this._controllers;
  }
}

export default ProductRouter;