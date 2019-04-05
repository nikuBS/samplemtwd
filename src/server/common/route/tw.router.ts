import { IRouterMap } from './app.router';

class TwRouter {
  private static _instance: TwRouter;
  private _controllers: Array<IRouterMap> = [];

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
