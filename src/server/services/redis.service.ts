import session from 'express-session';
import connect from 'connect-redis';
import redis from 'redis';
import EnvHelper from '../utils/env.helper';
import { COOKIE_KEY } from '../types/common.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../utils/format.helper';
import { REDIS_CODE } from '../types/redis.type';

class RedisService {
  private static instance: RedisService;
  private envRedis;
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

    this.client = redis.createClient(this.envRedis.port, this.envRedis.host);
  }

  static getInstance() {
    if ( !RedisService.instance ) {
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

  public getString(key): Observable<any> {
    return Observable.create((observer) => {
      this.client.get(key, (err, reply) => {
        const resp = {
          code: REDIS_CODE.CODE_SUCCESS,
          result: null
        };

        if ( FormatHelper.isEmpty(reply) ) {
          resp.code = REDIS_CODE.CODE_EMPTY;
        } else {
          resp.result = reply;
        }

        observer.next(resp);
        observer.complete();
      });
    });
  }

  public getData(key): Observable<any> {
    return Observable.create((observer) => {
      this.client.get(key, (err, reply) => {
        const resp = {
          code: REDIS_CODE.CODE_SUCCESS,
          result: null
        };

        if ( FormatHelper.isEmpty(reply) ) {
          resp.code = REDIS_CODE.CODE_EMPTY;
        } else {
          try {
            resp.result = JSON.parse(reply);
          } catch ( e ) {
            resp.code = REDIS_CODE.CODE_ERROR;
          }
        }

        observer.next(resp);
        observer.complete();
      });
    });
  }

}

export default RedisService;
