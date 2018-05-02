// Node Modules
import * as path from 'path';

// Express Modules
import express, { Application } from 'express';
import ejs from 'ejs';

// Application Modules
import AppRouter from './app/common/app.router';
import PersonalRoutertMap from './app/personal/routes/personal-router-map';
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

  config() {
    this.app.set('views', [
      path.join(__dirname, 'app/personal/views/containers'),
      path.join(__dirname, 'app/product/views/containers')
    ]);

    this.app.set('view engine', 'ejs');
    this.app.engine('html', ejs.renderFile);
    this.app.use(express.json());       // to support JSON-encoded bodies
    this.app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
    this.app.use(this.redisService.middleware);
    // this.app.use(express.static('public'));

    this.app.use('/personal', new AppRouter(PersonalRoutertMap.instance.controllers).router);
    // this.app.use('/user', new UserRouter().router);
    // this.app.use('/personal', new PersonalRouter().router);
  }
}

export = App.bootstrap().app;
