import session from 'express-session';
import connect from 'connect-redis';
import redis from 'redis';
import EnvHelper from '../utils/env.helper';
import { COOKIE_KEY } from '../types/common.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../utils/format.helper';
import { NODE_API_ERROR } from '../types/string.type';
import { API_CODE } from '../types/api-command.type';
import LoggerService from './logger.service';

class RedisService {
  private static instance: RedisService;
  private envRedis;
  private RedisStore;
  private redisOption;
  private middleWare;
  private client;
  private logger = new LoggerService();

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
      cookie: { maxAge: 60 * 60 * 1000, httpOnly: false }, // 1hours
      secret: 'sktechx',
      saveUninitialized: true, // don't create session until something stored,
      resave: false, // don't save session if unmodified
      rolling: true,
    });
    return this.middleWare;
  }

  public setData(key, value) {
    this.client.set(key, value);
  }

  public getString(key): Observable<any> {
    this.logger.info(this, '[Get String]', key);
    return Observable.create((observer) => {
      this.client.get(key, (err, reply) => {
        const resp = {
          code: API_CODE.REDIS_SUCCESS,
          msg: 'success',
          result: null
        };

        if ( FormatHelper.isEmpty(reply) ) {
          resp.code = API_CODE.REDIS_EMPTY;
          resp.msg = NODE_API_ERROR[API_CODE.REDIS_EMPTY];
        } else {
          resp.result = reply;
        }

        observer.next(resp);
        observer.complete();
      });
    });
  }

  public getData(key): Observable<any> {
    this.logger.info(this, '[Get Data]', key);
    return Observable.create((observer) => {
      this.client.get(key, (err, reply) => {
        const resp = {
          code: API_CODE.REDIS_SUCCESS,
          msg: 'success',
          result: null
        };

        if ( FormatHelper.isEmpty(reply) ) {
          resp.code = API_CODE.REDIS_EMPTY;
          resp.msg = NODE_API_ERROR[API_CODE.REDIS_EMPTY];
        } else {
          try {
            resp.result = JSON.parse(reply);
          } catch ( e ) {
            resp.code = API_CODE.REDIS_ERROR;
            resp.msg = NODE_API_ERROR[API_CODE.REDIS_ERROR];
          }
        }
        observer.next(resp);
        observer.complete();
      });
    });
  }

}

export default RedisService;
