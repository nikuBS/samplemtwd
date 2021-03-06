import { IRouterMap } from './app.router';

/**
 * 라우터 상위 클래스
 */
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
