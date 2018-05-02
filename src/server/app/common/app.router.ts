import express from 'express';
import { Router } from 'express';
import Controller from './controllers/controller';

export interface IRouterMap {
  url: string;
  controller: Controller;
}

class AppRouter {
  public router: Router;

  constructor(routerMaps: Array<IRouterMap>) {
    this.router = express.Router();

    // this.router.get('/', function(req, res, next) {
    //   res.render('html', data);
    // });

    routerMaps.map((routerMap: IRouterMap) => {
      this.router.get(routerMap.url, routerMap.controller.render.bind(routerMap.controller));
    });
  }
}

export default AppRouter;