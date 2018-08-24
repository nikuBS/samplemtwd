import express from 'express';
import { Router } from 'express';
import Controller from './controllers/tw.view.controller';

export interface IRouterMap {
  url: string;
  controller: Controller;
}

class AppRouter {
  public router: Router;

  constructor(routerMaps: Array<IRouterMap>) {
    this.router = express.Router();

    routerMaps.map((routerMap: IRouterMap) => {
      this.router.get(routerMap.url, routerMap.controller.initPage.bind(routerMap.controller));
      this.router.post(routerMap.url, routerMap.controller.certPage.bind(routerMap.controller));
    });
  }
}

export default AppRouter;
