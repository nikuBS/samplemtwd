import { IRouterMap } from '../../common/app.router';

class SearchRouter {
  private static _instance: SearchRouter;
  private _controllers: Array<IRouterMap> = [];

  constructor() {
    // this._controllers.push({ url: '/', controller: new HomeMainController() });
  }

  static get instance(): any {
    return this._instance || (this._instance = new this());
  }

  get controllers(): Array<IRouterMap> {
    return this._controllers;
  }
}

export default SearchRouter;