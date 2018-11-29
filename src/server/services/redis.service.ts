import session from 'express-session';
import connect from 'connect-redis';
import redis from 'redis';
import EnvHelper from '../utils/env.helper';
import { COOKIE_KEY } from '../types/common.type';
import { Observable } from 'rxjs/Observable';

class RedisService {
  private static instance: RedisService;
  private envRedis: EnvHelper;
  private RedisStore;
  private redisOption;
  private middleWare;
  private client;

  private constructor() {
    this.envRedis = EnvHelper.getEnvironment('REDIS');
    this.RedisStore = connect(session);
    this.redisOption = Object.assign(this.envRedis, {
      prefix: 'session:'
    });

    this.client = redis.createClient(this.envRedis);
  }

  static getInstance() {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public getMiddleWare() {
    this.middleWare = session({
      key: COOKIE_KEY.TWM,
      store: new this.RedisStore(this.redisOption),
      cookie: { maxAge: 60 * 60 * 1000 }, // 1hours
      secret: 'sktechx',
      saveUninitialized: false, // don't create session until something stored,
      resave: false, // don't save session if unmodified
      rolling: true
    });
    return this.middleWare;
  }

  public setData(key, value) {
    this.client.set(key, value);
  }

  public getData(key): Observable<any> {
    return Observable.create((observer) => {
      this.client.get(key, (err, reply) => {
        let result;

        try {
          result = JSON.parse(reply);
        } catch ( e ) {
          result = null;
        }

        observer.next(result);
        observer.complete();
      });
    });
  }

}

export default RedisService;
