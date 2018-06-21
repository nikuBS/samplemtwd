// Node Modules
import * as path from 'path';

// Express Modules
import express, { Application } from 'express';
import UA from 'express-useragent';
import ejs from 'ejs';
import cookie from 'cookie-parser';

import environment from './config/environment.config';

// Route Modules
import AppRouter from './common/app.router';
import HomeRouter from './app/00.home/home.router';
import MytRouter from './app/01.myt/myt.router';
import RechargeRouter from './app/02.recharge/recharge.router';
import PaymentRouter from './app/03.payment/payment.router';
import ManagementRouter from './app/04.management/management.router';
import MembershipRouter from './app/05.membership/membership.router';
import ProductRouter from './app/06.product/product.router';
import DirectRouter from './app/07.direct/direct.router';
import CustomerRouter from './app/08.customer/customer.router';
import SearchRouter from './app/search/search.router';


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
    this.app.use('/home', new AppRouter(HomeRouter.instance.controllers).router);
    this.app.use('/myt', new AppRouter(MytRouter.instance.controllers).router);
    this.app.use('/recharge', new AppRouter(RechargeRouter.instance.controllers).router);
    this.app.use('/payment', new AppRouter(PaymentRouter.instance.controllers).router);
    this.app.use('/management', new AppRouter(ManagementRouter.instance.controllers).router);
    this.app.use('/membership', new AppRouter(MembershipRouter.instance.controllers).router);
    this.app.use('/product', new AppRouter(ProductRouter.instance.controllers).router);
    this.app.use('/direct', new AppRouter(DirectRouter.instance.controllers).router);
    this.app.use('/customer', new AppRouter(CustomerRouter.instance.controllers).router);
    this.app.use('/search', new AppRouter(SearchRouter.instance.controllers).router);
  }

  private setViewPath() {
    this.app.set('views', [
      path.join(__dirname, 'app/00.home/views/containers'),
      path.join(__dirname, 'app/01.myt/views/containers'),
      path.join(__dirname, 'app/02.recharge/views/containers'),
      path.join(__dirname, 'app/03.payment/views/containers'),
      path.join(__dirname, 'app/04.management/views/containers'),
      path.join(__dirname, 'app/05.membership/views/containers'),
      path.join(__dirname, 'app/06.product/views/containers'),
      path.join(__dirname, 'app/07.direct/views/containers'),
      path.join(__dirname, 'app/08.customer/views/containers'),
      path.join(__dirname, 'app/search/views/containers'),

    ]);
  }
}

export = App.bootstrap().app;
