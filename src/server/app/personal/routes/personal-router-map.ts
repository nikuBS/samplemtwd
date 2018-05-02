import { IRouterMap } from '../../common/app.router';
import HomeController from '../controllers/home.controller';
import UserController from '../controllers/user.controller';
import UserDetailController from '../controllers/user-detail.controller';

class PersonalRoutertMap {
  private static _instance: PersonalRoutertMap;
  private _controllers: Array<IRouterMap> = [];

  constructor() {
    this._controllers.push({ url: '/user/:id', controller: new UserDetailController() });
    this._controllers.push({ url: '/home', controller: new HomeController() });
    this._controllers.push({ url: '/user', controller: new UserController() });
  }

  static get instance(): any {
    return this._instance || (this._instance = new this());
  }

  get controllers(): Array<IRouterMap> {
    return this._controllers;
  }
}

export default PersonalRoutertMap;