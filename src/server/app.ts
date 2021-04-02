// for APM
const os = require('os');
process.env.WHATAP_NAME = 'NodeAgent-{ip2}-{ip3}-{cluster}';
if ( process.env.NODE_ENV !== 'local' ) {
  // dev, stg, prd
  const WhatapAgent = require('whatap').NodeAgent;
}

// Node Modules
import * as path from 'path';

// Express Modules
import express, { Application, NextFunction } from 'express';
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
import StoreRouter from './common/route/store.router';
import ChatbotRouter from './app/98.chatbot/chatbot.router';
import TestRouter from './app/99.test/test.router';
import ShortcutRouter from './common/route/shortcut.router';

// Application Modules
import RedisService from './services/redis.service';
import LoggerService from './services/logger.service';
import VERSION from './config/version.config';
import ErrorService from './services/error.service';
import Axios from 'axios';
import { timer } from 'rxjs/Observable/timer';

//영문추가

import AppRouter_en from './common_en/route/app.router';
import CommonRouter_en from './app_en/00.common/common.router';
import MainRouter_en from './app_en/01.main/main.router';
import MyTDataRouter_en from './app_en/02.myt-data/myt-data.router';
import MyTFareRouter_en from './app_en/03.myt-fare/myt-fare.router';
import MyTJoinRouter_en from './app_en/04.myt-join/myt-join.router';
import ProductRouter_en from './app_en/05.product/product.router';
import CustomerRouter_en from './app_en/08.customer/customer.router';
import BypassRouter_en from './common_en/route/bypass.router';
import ApiRouter_en from './common_en/route/api.router';
import NativeRouter_en from './common_en/route/native.router';
import StoreRouter_en from './common_en/route/store.router';

import RedisService_en from './services_en/redis.service';
import LoggerService_en from './services_en/logger.service';
import VERSION_en from './config_en/version.config';
import ErrorService_en from './services_en/error.service';
import { Observable } from 'rxjs';
import { REDIS_KEY } from './types/redis.type';
import FormatHelper from './utils/format.helper';


module.exports = require('../../nodejs-exporter');

const manifest = require('./manifest.json');

class App {
  public app: Application = express();
  public redisService: RedisService;
  public redisService_en: RedisService_en;
  private logger = new LoggerService();
  private logger_en = new LoggerService_en();
  private errorService: ErrorService;
  private errorService_en: ErrorService_en;


  constructor() {
    this.redisService = RedisService.getInstance();
    this.redisService_en = RedisService_en.getInstance();
    this.errorService = new ErrorService();
    this.errorService_en = new ErrorService_en();
    this.config();
  }

  public static bootstrap(): App {
    return new App();
  }

  private config() {
    this.app.use(function (req, res, next) {

      const sanitize = (string) => {
        if ( typeof string === 'string' && string.includes('<script>') ) {
          return string.replace('<script>', '&lt;script&gt;');
        } else {
          return string;
        }
      };
      const queryKeys = Object.keys(req.query);
      const paramKeys = Object.keys(req.params);
      queryKeys.forEach(key => {
        req.query[key] = sanitize(req.query[key]);
      });
      paramKeys.forEach(key => {
        req.params[key] = sanitize(req.query[key]);
      });
      // res.setHeader("Content-Security-Policy", "script-src 'self' 'sha256-/R8iLbj/zzRkKsN1Dh/be9dTImUnl6khUlY3lP0rwTk=' 'unsafe-inline';");
      next();
    });
    this.app.set('view engine', 'ejs');
    this.app.engine('html', ejs.renderFile);
    this.app.use(express.json());       // to support JSON-encoded bodies
    this.app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
    this.app.use(cookie());
    this.app.use(this.redisService.getMiddleWare());
    this.app.use(this.redisService_en.getMiddleWare());
    this.app.use(UA.express()); // req.useragent
    this.app.use(morgan(this.accessLogFormat.bind(this)));
    // development env
    this.app.use(express.static(path.join(__dirname, '/public')));
    this.app.use('/mock', express.static(path.join(__dirname, '/mock/client')));

    this.exceptionHandler();
    this.checkTargetMiddleware();
    this.setViewPath();
    this.setRoutes();
    this.setApis();
    this.setBypass();
    this.setNative();
    this.setStore();
    this.setShortCut();
    this.setGlobalVariables();
    this.setClientMap();
    // if (!process.argv[2])
    this.setClientMap_en();
    this.setErrorHandler();
  }

  private setApis() {
    this.app.use('/api', new ApiRouter().router);
    this.app.use('/en/api', new ApiRouter_en().router);
  }

  private setBypass() {
    this.app.use('/bypass', new BypassRouter().router);
    this.app.use('/en/bypass', new BypassRouter_en().router);
  }

  private setNative() {
    this.app.use('/native', new NativeRouter().router);
    this.app.use('/en/native', new NativeRouter_en().router);
  }

  private setStore() {
    this.app.use('/store', new StoreRouter().router);
    this.app.use('/en/store', new StoreRouter_en().router);
  }


  private setGlobalVariables() {
    const env = environment[String(process.env.NODE_ENV)];

    Object.keys(env).map((key) => {
      this.app.locals[key] = env[key];
    });
  }

  private setClientMap() {
    const env = String(process.env.NODE_ENV);
    // const manifestFile = String(process.env.NODE_ENV) === 'local' ? 'manifest.json' : 'manifest.' + VERSION + '.json';
    const manifestFile = String(process.env.NODE_ENV) === 'prd' ? 'manifest.' + VERSION + '.json' : 'manifest.json';

    Axios.get(environment[env].CDN_ORIGIN + '/' + manifestFile)
      .then((res: any) => {
        this.logger.error(this, res.data);
        Object.keys(res.data).map((key) => {
          if ( key.indexOf('.') !== -1 ) {
            let appName = key.split('.')[0];
            if ( appName.indexOf('-') !== -1 ) {
              appName = appName.replace('-', '');
            }
            this.app.locals[appName] = res.data[key];
            this.logger.error(this, appName, res.data[key]);
          }
        });
      })
      .catch((err) => { // If it fails, re-try for every 5 seconds
        // this.logger.error(this, err.response.status, err.response.data);
        timer(3000).subscribe(() => {
          this.logger.error(this, 'Retry');
          this.setClientMap();
        });
      });

    // Object.keys(manifest).map((key) => {
    //   if ( key.indexOf('.') !== -1 ) {
    //     let appName = key.split('.')[0];
    //     if ( appName.indexOf('-') !== -1 ) {
    //       appName = appName.replace('-', '');
    //     }
    //     this.app.locals[appName] = manifest[key];
    //     this.logger.error(this, appName, manifest[key]);
    //   }
    // });
  }

  //영문
  private setClientMap_en() {
    const env = String(process.env.NODE_ENV);
    // const manifestFile = String(process.env.NODE_ENV) === 'local' ? 'manifest.json' : 'manifest.' + VERSION + '.json';
    const manifestFile = String(process.env.NODE_ENV) === 'prd' ? 'manifest_en.' + VERSION + '.json' : 'manifest_en.json';
    Axios.get(environment[env].CDN_ORIGIN + '/' + manifestFile)
      .then((res: any) => {
        this.logger.error(this, res.data);
        Object.keys(res.data).map((key) => {
          if ( key.indexOf('.') !== -1 ) {
            let appName = key.split('.')[0];
            if ( appName.indexOf('-') !== -1 ) {
              appName = appName.replace('-', '');
            }
            this.app.locals[appName] = res.data[key];
            this.logger.error(this, appName, res.data[key]);
          }
        });
      })
      .catch((err) => { // If it fails, re-try for every 5 seconds
        // this.logger.error(this, err.response.status, err.response.data);
        timer(3000).subscribe(() => {
          this.logger.error(this, manifestFile + ' > Retry');
          this.setClientMap_en();
        });
      });

    // Object.keys(manifest).map((key) => {
    //   if ( key.indexOf('.') !== -1 ) {
    //     let appName = key.split('.')[0];
    //     if ( appName.indexOf('-') !== -1 ) {
    //       appName = appName.replace('-', '');
    //     }
    //     this.app.locals[appName] = manifest[key];
    //     this.logger.error(this, appName, manifest[key]);
    //   }
    // });
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

    this.app.use('/chatbot', new AppRouter(ChatbotRouter.instance.controllers).router);

    this.app.use('/test', new AppRouter(TestRouter.instance.controllers).router);
    //영문추가
    this.app.use('/en/common', new AppRouter_en(CommonRouter_en.instance.controllers).router);
    this.app.use('/en/main', new AppRouter_en(MainRouter_en.instance.controllers).router);
    this.app.use('/en/myt-data', new AppRouter_en(MyTDataRouter_en.instance.controllers).router);
    this.app.use('/en/myt-fare', new AppRouter_en(MyTFareRouter_en.instance.controllers).router);
    this.app.use('/en/myt-join', new AppRouter_en(MyTJoinRouter_en.instance.controllers).router);
    this.app.use('/en/product', new AppRouter_en(ProductRouter_en.instance.controllers).router);
    this.app.use('/en/customer', new AppRouter_en(CustomerRouter_en.instance.controllers).router);
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

      path.join(__dirname, 'app/98.chatbot/views/containers'),

      path.join(__dirname, 'app/99.test/views/containers'),
      //영문추가
      path.join(__dirname, 'app_en/00.common/views/containers'),
      path.join(__dirname, 'app_en/01.main/views/containers'),
      path.join(__dirname, 'app_en/02.myt-data/views/containers'),
      path.join(__dirname, 'app_en/03.myt-fare/views/containers'),
      path.join(__dirname, 'app_en/04.myt-join/views/containers'),
      path.join(__dirname, 'app_en/05.product/views/containers'),
      path.join(__dirname, 'app_en/08.customer/views/containers'),
      path.join(__dirname, 'common_en/views/containers')

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
    const url = req.url;
    if ( req.accepts('html') ) {
      if ( url.indexOf('/en/') !== -1 ) { // 2020.11.02 김기남 url 중에 '/en/'이 포함되어 있다면 영문용 error page 로 렌더링
        return res.status(404).render('en.error.page-not-found.html', { svcInfo: null, code: res.statusCode });
      } else {
        return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
      }
    }
    next();
  }

  private handleInternalServerError(err, req, res, next) {
    const url = req.url;
    if ( req.accepts('html') ) {
      console.error(err.message);
      if ( url.indexOf('/en/') !== -1 ) { // 2020.11.02 김기남 url 중에 '/en/'이 포함되어 있다면 영문용 error page 로 렌더링
        return res.status(500).render('en.error.page-not-found.html', { svcInfo: null, code: res.statusCode });
      } else {
        return res.status(500).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
      }
    }
    next();
  }

  private accessLogFormat(tokens, req, res) {
    return [
      'ACC|' + tokens['remote-addr'](req),
      '"' + req.headers['x-forwarded-for'] + '"',
      '-', // tokens['remote-user'](req, res),
      '-',
      '[', tokens['date'](req, res, 'clf'), ']',
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

  /***
   * target parameter이 있을 경우 값이 실제 페이지 인지를 체크하는 middleware
   */
  private checkTargetMiddleware() {
    this.app.use(this.errorService.targetValidationCheck);
  }
}

export = App.bootstrap().app;
