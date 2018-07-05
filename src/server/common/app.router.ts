import express from 'express';
import { Router } from 'express';
import Controller from './controllers/tw.view.controller';

export interface IRouterMap {
  url: string;
  controller: Controller;
}

class AppRouter {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public getRouter(routerMaps: Array<IRouterMap>) {
    routerMaps.map((routerMap: IRouterMap) => {
      this.router.get(routerMap.url, routerMap.controller.initPage.bind(routerMap.controller));
    });

    return this.router;
  }
}

export default AppRouter;
