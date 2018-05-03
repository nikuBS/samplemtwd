import { IRouterMap } from '../../common/app.router';
import HomeMainController from '../controllers/home.main.controller';

class HomeRouter {
  private static _instance: HomeRouter;
  private _controllers: Array<IRouterMap> = [];

  constructor() {
    this._controllers.push({ url: '/', controller: new HomeMainController() });
  }

  static get instance(): any {
    return this._instance || (this._instance = new this());
  }

  get controllers(): Array<IRouterMap> {
    return this._controllers;
  }
}

export default HomeRouter;