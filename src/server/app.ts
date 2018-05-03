// Node Modules
import * as path from 'path';

// Express Modules
import express, { Application } from 'express';
import ejs, { Data } from 'ejs';

// Route Modules
import AppRouter from './app/common/app.router';
import HomeRouter from './app/home/route/home.router';
import ProductRouter from './app/product/route/product.router';
import CustomerRouter from './app/customer/route/customer.router';
import DirectRouter from './app/direct/route/direct.router';
import EtcRouter from './app/etc/route/etc.router';
import EventRouter from './app/event/route/event.router';
import MembershipRouter from './app/membership/route/membership.router';
import MytRouter from './app/myt/routes/myt.router';
import RoamingRouter from './app/roaming/route/roaming.router';
import SearchRouter from './app/search/route/search.router';
import UserRouter from './app/user/route/user.router';

// Application Modules
import RedisService from './services/redis.service';
import BillRouter from './app/bill/routes/bill.router';
import DataRouter from './app/data/routes/data.router';

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
    // this.app.use(express.static('public'));

    this.setViews();
    this.setRoutes();
  }

  private setViews() {
    this.app.set('views', [
      path.join(__dirname, 'app/bill/views/containers'),
      path.join(__dirname, 'app/customer/views/containers'),
      path.join(__dirname, 'app/data/views/containers'),
      path.join(__dirname, 'app/direct/views/containers'),
      path.join(__dirname, 'app/etc/views/containers'),
      path.join(__dirname, 'app/event/views/containers'),
      path.join(__dirname, 'app/home/views/containers'),
      path.join(__dirname, 'app/membership/views/containers'),
      path.join(__dirname, 'app/myt/views/containers'),
      path.join(__dirname, 'app/product/views/containers'),
      path.join(__dirname, 'app/roaming/views/containers'),
      path.join(__dirname, 'app/search/views/containers'),
      path.join(__dirname, 'app/user/views/containers'),
    ]);
  }

  private setRoutes() {
    this.app.use('/bill', new AppRouter(BillRouter.instance.controllers).router);
    this.app.use('/customer', new AppRouter(CustomerRouter.instance.controllers).router);
    this.app.use('/data', new AppRouter(DataRouter.instance.controllers).router);
    this.app.use('/direct', new AppRouter(DirectRouter.instance.controllers).router);
    this.app.use('/etc', new AppRouter(EtcRouter.instance.controllers).router);
    this.app.use('/event', new AppRouter(EventRouter.instance.controllers).router);
    this.app.use('/home', new AppRouter(HomeRouter.instance.controllers).router);
    this.app.use('/membership', new AppRouter(MembershipRouter.instance.controllers).router);
    this.app.use('/myt', new AppRouter(MytRouter.instance.controllers).router);
    this.app.use('/product', new AppRouter(ProductRouter.instance.controllers).router);
    this.app.use('/roaming', new AppRouter(RoamingRouter.instance.controllers).router);
    this.app.use('/search', new AppRouter(SearchRouter.instance.controllers).router);
    this.app.use('/user', new AppRouter(UserRouter.instance.controllers).router);
  }
}

export = App.bootstrap().app;
