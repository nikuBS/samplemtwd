// for APM
const WhatapAgent = require('whatap').NodeAgent;

// Node Modules
import * as path from 'path';

// Express Modules
import express, { Application } from 'express';
import UA from 'express-useragent';
import ejs from 'ejs';
import cookie from 'cookie-parser';

import environment from './config/environment.config';

const manifest = require('./config/manifest.json');

// Route Modules
import AppRouter from './common/app.router';
import { default as OldMytRouter } from './app/901.myt/myt.router';
import { default as OldRechargeRouter } from './app/902.recharge/recharge.router';
import { default as OldPaymentRouter } from './app/903.payment/payment.router';
import { default as OldCustomerRouter } from './app/904.customer/customer.router';
import { default as OldAuthRouter } from './app/905.auth/auth.router';
import { default as OldCommonRouter } from './app/909.common/common.router';
import CommonRouter from './app/00.common/common.router';
import HomeRouter from './app/01.home/home.router';
import MyTDataRouter from './app/02.myt-data/myt-data.router';
import MyTFareRouter from './app/03.myt-fare/myt-fare.router';
import MyTJoinRouter from './app/04.myt-join/myt-join.router';
import ProductRouter from './app/05.product/product.router';
import BenefitRouter from './app/06.benefit/benefit.router';
import CustomerRouter from './app/07.customer/customer.router';
import AuthRouter from './app/08.auth/auth.router';
import BypassRouter from './common/bypass.router';
import ApiRouter from './common/api.router';
import NativeRouter from './common/native.router';

// Application Modules
import RedisService from './services/redis.service';

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
    // this.app.use((req, res, next) => {
    //   res.status(404).render('error.page-not-found.html', { svcInfo: null });
    // });

    this.setViewPath();
    this.setRoutes();
    this.setApis();
    this.setBypass();
    this.setNative();
    this.setGlobalVariables();
    this.setClientMap();
  }

  private setApis() {
    this.app.use('/api', new ApiRouter().router);
  }

  private setBypass() {
    this.app.use('/bypass', new BypassRouter().router);
  }

  private setNative() {
    this.app.use('/native', new NativeRouter().router);
  }

  private setGlobalVariables() {
    const env = environment[String(process.env.NODE_ENV)];

    Object.keys(env).map((key) => {
      this.app.locals[key] = env[key];
    });
  }

  private setClientMap() {
    Object.keys(manifest).map((key) => {
      if ( key.indexOf('.') !== -1 ) {
        let appName = key.split('.')[0];
        if ( appName.indexOf('-') !== -1 ) {
          appName = appName.replace('-', '');
        }
        this.app.locals[appName] = manifest[key];
      }
    });
  }

  private setRoutes() {
    this.app.use('/myt', new AppRouter(OldMytRouter.instance.controllers).router);
    this.app.use('/recharge', new AppRouter(OldRechargeRouter.instance.controllers).router);
    this.app.use('/payment', new AppRouter(OldPaymentRouter.instance.controllers).router);
    this.app.use('/customer', new AppRouter(OldCustomerRouter.instance.controllers).router);
    this.app.use('/auth', new AppRouter(OldAuthRouter.instance.controllers).router);

    this.app.use('/common', new AppRouter(CommonRouter.instance.controllers).router);
    this.app.use('/home', new AppRouter(HomeRouter.instance.controllers).router);
    this.app.use('/myt/data', new AppRouter(MyTDataRouter.instance.controllers).router);
    this.app.use('/myt/fare', new AppRouter(MyTFareRouter.instance.controllers).router);
    this.app.use('/myt/join', new AppRouter(MyTJoinRouter.instance.controllers).router);
    this.app.use('/product', new AppRouter(ProductRouter.instance.controllers).router);
    this.app.use('/benefit', new AppRouter(BenefitRouter.instance.controllers).router);
    this.app.use('/customer', new AppRouter(CustomerRouter.instance.controllers).router);
    this.app.use('/auth', new AppRouter(AuthRouter.instance.controllers).router);

  }

  private setViewPath() {
    this.app.set('views', [
      path.join(__dirname, 'app/00.common/views/containers'),
      path.join(__dirname, 'app/01.home/views/containers'),
      path.join(__dirname, 'app/02.myt-data/views/containers'),
      path.join(__dirname, 'app/03.myt-fare/views/containers'),
      path.join(__dirname, 'app/04.myt-join/views/containers'),
      path.join(__dirname, 'app/05.product/views/containers'),
      path.join(__dirname, 'app/06.benefit/views/containers'),
      path.join(__dirname, 'app/07.customer/views/containers'),
      path.join(__dirname, 'app/08.auth/views/containers'),

      path.join(__dirname, 'app/901.myt/views/containers'),
      path.join(__dirname, 'app/902.recharge/views/containers'),
      path.join(__dirname, 'app/903.payment/views/containers'),
      path.join(__dirname, 'app/904.customer/views/containers'),
      path.join(__dirname, 'app/905.auth/views/containers'),
      path.join(__dirname, 'common/views/containers')

    ]);
  }
}

export = App.bootstrap().app;
