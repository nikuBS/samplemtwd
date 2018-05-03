import { IRouterMap } from '../app.router';

class TwRouter {
  protected static _instance: TwRouter;
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

export default TwRouter;
