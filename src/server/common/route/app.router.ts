import express from 'express';
import { Router } from 'express';

export interface IRouterMap {
  url: string;
  controller: any;
  post?: boolean;
}

/**
 * @desc 페이지 라우터
 */
class AppRouter {
  public router: Router;

  constructor(routerMaps: Array<IRouterMap>) {
    this.router = express.Router();

    routerMaps.map((routerMap: IRouterMap) => {
      this.router.get(routerMap.url, (req, res, next) => {
        const inst = new routerMap.controller();
        inst.initPage(req, res, next);
      });
      if ( routerMap.post ) {
        this.router.post(routerMap.url, (req, res, next) => {
          const inst = new routerMap.controller();
          inst.initPage(req, res, next);
        });
      }

    });
  }
}

export default AppRouter;
