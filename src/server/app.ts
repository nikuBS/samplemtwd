// for APM
const os = require('os');
process.env.WHATAP_NAME = os.hostname();
const WhatapAgent = require('whatap').NodeAgent;

// Node Modules
import * as path from 'path';

// Express Modules
import express, { Application } from 'express';
import UA from 'express-useragent';
import ejs from 'ejs';
import cookie from 'cookie-parser';
import morgan from 'morgan';
import environment from './config/environment.config';

// Route Modules
import AppRouter from './common/route/app.router';
import CommonRouter from './app/00.common/common.router';
import MainRouter from './app/01.main/main.router';
import MyTDataRouter from './app/02.myt-data/myt-data.router';
import MyTFareRouter from './app/03.myt-fare/myt-fare.router';
import MyTJoinRouter from './app/04.myt-join/myt-join.router';
import ProductRouter from './app/05.product/product.router';
import BenefitRouter from './app/06.benefit/benefit.router';
import MembershipRouter from './app/07.membership/membership.router';
import CustomerRouter from './app/08.customer/customer.router';
import TeventRouter from './app/09.tevent/tevent.router';
import BypassRouter from './common/route/bypass.router';
import ApiRouter from './common/route/api.router';
import NativeRouter from './common/route/native.router';
import NativeExRouter from './common/route/native-ex.router';
import TestRouter from './app/99.test/test.router';

// Application Modules
import RedisService from './services/redis.service';
import LoggerService from './services/logger.service';
import ApiService from './services/api.service';
import { API_CMD } from './types/api-command.type';
import VERSION from './config/version.config';
import ShortcutRouter from './common/route/shortcut.router';
const manifest = require('./config/manifest.json');

class App {
  public app: Application = express();
  public redisService: RedisService;
  private apiService = new ApiService();
  private logger = new LoggerService();


  constructor() {
    this.redisService = RedisService.getInstance();
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
    this.app.use(cookie());
    this.app.use(this.redisService.getMiddleWare());
    this.app.use(UA.express()); // req.useragent
    this.app.use(morgan(this.accessLogFormat.bind(this)));
    // development env
    // this.app.use(express.static(path.join(__dirname, '/public/cdn')));
    this.app.use('/mock', express.static(path.join(__dirname, '/mock/client')));

    this.exceptionHandler();
    this.setViewPath();
    this.setRoutes();
    this.setApis();
    this.setBypass();
    this.setNative();
    this.setShortCut();
    this.setGlobalVariables();
    this.setClientMap();
    this.setErrorHandler();
  }

  private setApis() {
    this.app.use('/api', new ApiRouter().router);
  }

  private setBypass() {
    this.app.use('/bypass', new BypassRouter().router);
  }

  private setNative() {
    this.app.use('/native', new NativeRouter().router);
    this.app.use('/native-ex', new NativeExRouter().router);

  }

  private setGlobalVariables() {
    const env = environment[String(process.env.NODE_ENV)];

    Object.keys(env).map((key) => {
      this.app.locals[key] = env[key];
    });
  }

  private setClientMap() {
    const version = String(process.env.NODE_ENV) === 'local' ? 'dev' : VERSION;

    Object.keys(manifest).map((key) => {
      if ( key.indexOf('.') !== -1 ) {
        let appName = key.split('.')[0];
        if ( appName.indexOf('-') !== -1 ) {
          appName = appName.replace('-', '');
        }
        this.app.locals[appName] = manifest[key];
        this.logger.error(this, appName, manifest[key]);
      }
    });
  }

  private setErrorHandler() {
    this.app.use(this.handleNotFoundError);
    this.app.use(this.handleInternalServerError);
  }

  private setRoutes() {
    this.app.use('/common', new AppRouter(CommonRouter.instance.controllers).router);
    this.app.use('/main', new AppRouter(MainRouter.instance.controllers).router);
    this.app.use('/myt-data', new AppRouter(MyTDataRouter.instance.controllers).router);
    this.app.use('/myt-fare', new AppRouter(MyTFareRouter.instance.controllers).router);
    this.app.use('/myt-join', new AppRouter(MyTJoinRouter.instance.controllers).router);
    this.app.use('/product', new AppRouter(ProductRouter.instance.controllers).router);
    this.app.use('/benefit', new AppRouter(BenefitRouter.instance.controllers).router);
    this.app.use('/membership', new AppRouter(MembershipRouter.instance.controllers).router);
    this.app.use('/customer', new AppRouter(CustomerRouter.instance.controllers).router);
    this.app.use('/tevent', new AppRouter(TeventRouter.instance.controllers).router);

    this.app.use('/test', new AppRouter(TestRouter.instance.controllers).router);
  }

  private setShortCut() {
    this.app.use('/', new ShortcutRouter().router);
  }

  private setViewPath() {
    this.app.set('views', [
      path.join(__dirname, 'app/00.common/views/containers'),
      path.join(__dirname, 'app/01.main/views/containers'),
      path.join(__dirname, 'app/02.myt-data/views/containers'),
      path.join(__dirname, 'app/03.myt-fare/views/containers'),
      path.join(__dirname, 'app/04.myt-join/views/containers'),
      path.join(__dirname, 'app/05.product/views/containers'),
      path.join(__dirname, 'app/06.benefit/views/containers'),
      path.join(__dirname, 'app/07.membership/views/containers'),
      path.join(__dirname, 'app/08.customer/views/containers'),
      path.join(__dirname, 'app/09.tevent/views/containers'),
      path.join(__dirname, 'app/08.auth/views/containers'),
      path.join(__dirname, 'common/views/containers'),

      path.join(__dirname, 'app/99.test/views/containers')

    ]);
  }

  private exceptionHandler() {
    process
      .on('unhandledRejection', (reason, p) => {
        // console.log(reason, 'Unhandled Rejection at Promise', p);
      })
      .on('uncaughtException', (err) => {
        // console.log(err, 'Uncaught Exception thrown');
      });

  }


  private handleNotFoundError(req, res, next) {
    if ( req.accepts('html') ) {
      return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }
    next();
  }

  private handleInternalServerError(err, req, res, next) {
    if ( req.accepts('html') ) {
      return res.status(500).send(err.message);
      // return res.status(500).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }
    next();
  }

  private accessLogFormat(tokens, req, res) {
    return [
      'ACC|' + tokens['remote-addr'](req),
      '"' + req.headers['x-forwarded-for'] + '"',
      '-', // tokens['remote-user'](req, res),
      '-',
      tokens['date'](req, res, 'clf'),
      tokens.status(req, res) + '_code',
      tokens['res'](req, res, 'content-length') + '_bytes',
      (tokens['response-time'](req, res, 3) * 1000) + '_usecs',
      '"' + tokens.method(req, res),
      tokens.url(req, res),
      'HTTP/' + tokens['http-version'](req) + '"',
      '"' + tokens['referrer'](req) + '"',
      '"' + tokens['user-agent'](req) + '"'
    ].join(' ');
  }
}

export = App.bootstrap().app;
