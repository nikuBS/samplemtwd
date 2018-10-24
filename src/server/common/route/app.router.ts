import express from 'express';
import { Router } from 'express';
import Controller from '../controllers/tw.view.controller';

export interface IRouterMap {
  url: string;
  controller: any;
}

class AppRouter {
  public router: Router;

  constructor(routerMaps: Array<IRouterMap>) {
    this.router = express.Router();

    routerMaps.map((routerMap: IRouterMap) => {
      this.router.get(routerMap.url, (req, res, next) => {
        const inst = new routerMap.controller();
        inst.initPage(req, res, next);
      });
      this.router.post(routerMap.url, (req, res, next) => {
        const inst = new routerMap.controller();
        inst.certPage(req, res, next);
      });
    });
  }
}

export default AppRouter;
