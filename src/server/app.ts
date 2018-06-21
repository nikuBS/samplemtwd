// Node Modules
import * as path from 'path';

// Express Modules
import express, { Application } from 'express';
import UA from 'express-useragent';
import proxy from 'http-proxy-middleware';
import ejs from 'ejs';
import cookie from 'cookie-parser';

import environment from './config/environment.config';

// Route Modules
import AppRouter from './common/app.router';
import FareRouter from './app/fare/fare.router';
import CustomerRouter from './app/customer/customer.router';
import RechargeRouter from './app/recharge/recharge.router';
import DirectRouter from './app/direct/direct.router';
import EtcRouter from './app/etc/etc.router';
import EventRouter from './app/event/event.router';
import HomeRouter from './app/home/home.router';
import MembershipRouter from './app/membership/membership.router';
import MytRouter from './app/myt/myt.router';
import ProductRouter from './app/product/product.router';
import RoamingRouter from './app/roaming/roaming.router';
import SearchRouter from './app/search/search.router';
import UserRouter from './app/user/user.router';

// Application Modules
import RedisService from './services/redis.service';
import ApiRouter from './common/api.router';

class App {
  public app: Application = express();
  public redisService = new RedisService();

  constructor() {
    this.config();
  }

  public static bootstrap(): App {
    return new App();
  }

  private config() {
    this.app.set('view engine', 'ejs');
    this.app.engine('html', ejs.renderFile);
    this.app.use(express.json());       // to support JSON-encoded bodies
    this.app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
    this.app.use(this.redisService.middleware);
    this.app.use(UA.express()); // req.useragent
    this.app.use(cookie());
    // development env
    this.app.use(express.static(path.join(__dirname, '/public/cdn')));
    this.app.use('/mock', express.static(path.join(__dirname, '/mock/client')));

    this.setViewPath();
    this.setRoutes();
    this.setApis();
    this.setGlobalVariables();
  }

  private setApis() {
    this.app.use('/api', new ApiRouter().router);
  }

  private setGlobalVariables() {
    const env = environment[String(process.env.NODE_ENV)];

    Object.keys(env).map((key) => {
      this.app.locals[key] = env[key];
    });
  }

  private setRoutes() {
    this.app.use('/customer', new AppRouter(CustomerRouter.instance.controllers).router);
    this.app.use('/direct', new AppRouter(DirectRouter.instance.controllers).router);
    this.app.use('/etc', new AppRouter(EtcRouter.instance.controllers).router);
    this.app.use('/event', new AppRouter(EventRouter.instance.controllers).router);
    this.app.use('/fare', new AppRouter(FareRouter.instance.controllers).router);
    this.app.use('/home', new AppRouter(HomeRouter.instance.controllers).router);
    this.app.use('/membership', new AppRouter(MembershipRouter.instance.controllers).router);
    this.app.use('/myt', new AppRouter(MytRouter.instance.controllers).router);
    this.app.use('/product', new AppRouter(ProductRouter.instance.controllers).router);
    this.app.use('/recharge', new AppRouter(RechargeRouter.instance.controllers).router);
    this.app.use('/roaming', new AppRouter(RoamingRouter.instance.controllers).router);
    this.app.use('/search', new AppRouter(SearchRouter.instance.controllers).router);
    this.app.use('/user', new AppRouter(UserRouter.instance.controllers).router);
  }

  private setViewPath() {
    this.app.set('views', [
      path.join(__dirname, 'app/customer/views/containers'),
      path.join(__dirname, 'app/direct/views/containers'),
      path.join(__dirname, 'app/etc/views/containers'),
      path.join(__dirname, 'app/event/views/containers'),
      path.join(__dirname, 'app/fare/views/containers'),
      path.join(__dirname, 'app/home/views/containers'),
      path.join(__dirname, 'app/membership/views/containers'),
      path.join(__dirname, 'app/myt/views/containers'),
      path.join(__dirname, 'app/product/views/containers'),
      path.join(__dirname, 'app/recharge/views/containers'),
      path.join(__dirname, 'app/roaming/views/containers'),
      path.join(__dirname, 'app/search/views/containers'),
      path.join(__dirname, 'app/user/views/containers'),
    ]);
  }
}

export = App.bootstrap().app;
