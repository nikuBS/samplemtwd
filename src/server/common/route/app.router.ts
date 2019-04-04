/**
 * @file app.router.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.05
 */

import express from 'express';
import { Router } from 'express';

export interface IRouterMap {
  url: string;
  controller: any;
  post?: boolean;
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
