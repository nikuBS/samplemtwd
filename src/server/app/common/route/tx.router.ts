import { IRouterMap } from '../../common/app.router';

class TxRouter {
  protected static _instance: TxRouter;
  protected _controllers: Array<IRouterMap> = [];

  constructor() {
  }

  static get instance(): any {
    return this._instance || (this._instance = new this());
  }

  get controllers(): Array<IRouterMap> {
    return this._controllers;
  }
}

export default TxRouter;