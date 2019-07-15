import session from 'express-session';
import connect from 'connect-redis';
import Redis from 'ioredis';
import EnvHelper from '../utils/env.helper';
import { COOKIE_KEY } from '../types/common.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../utils/format.helper';
import { NODE_API_ERROR } from '../types/string.type';
import { API_CODE } from '../types/api-command.type';
import LoggerService from './logger.service';
import CryptoHelper from '../utils/crypto.helper';

/**
 * redis 세션정보 저장 및 redis store 이용을 위한 service
 */
class RedisService {
  private static instance: RedisService;
  private envRedis;
  private envTosRedis;
  private RedisStore;
  private redisOption;
  private middleWare;
  private client;
  private tosClient;
  private logger = new LoggerService();

  private constructor() {
    this.envRedis = EnvHelper.getEnvironment('REDIS');
    this.envTosRedis = EnvHelper.getEnvironment('REDIS_TOS');
    this.RedisStore = connect(session);

    let redisKey = String(process.env.REDIS_PWD_KEY);
    if (redisKey === 'undefined') { // Will be removed
      redisKey = EnvHelper.getEnvironment('REDIS_PWD_KEY');
    }
    const password = CryptoHelper.decryptRedisPwd(this.envRedis.password,
        redisKey, CryptoHelper.ALGORITHM.AES256CBCHMACSHA256);

    this.redisOption = Object.assign(this.envRedis, {
      prefix: 'session:',
      password: password
    });

    let redisConf: any = {
      port: this.envRedis.port,
      host: this.envRedis.host,
      password: password
    };

    let redisTosConf: any = {
      port: this.envTosRedis.port,
      host: this.envTosRedis.host,
      password: password
    };

    const redisSentinel = EnvHelper.getEnvironment('REDIS_SENTINEL'),
      redisSentinelTos = EnvHelper.getEnvironment('REDIS_SENTINEL_TOS');

    if (!FormatHelper.isEmpty(redisSentinel)) {
      redisConf = Object.assign(redisConf, {
        sentinels: [{
          host: redisSentinel.host,
          port: redisSentinel.port
        }],
        name: redisSentinel.name
      });
    }

    if (!FormatHelper.isEmpty(redisSentinelTos)) {
      redisTosConf = Object.assign(redisTosConf, {
        sentinels: [{
          host: redisSentinelTos.host,
          port: redisSentinelTos.port
        }],
        name: redisSentinelTos.name
      });
    }

    this.client = new Redis(redisConf);
    this.tosClient = new Redis(redisTosConf);
  }

  /**
   * redis instance 조회
   */
  static getInstance() {
    if ( !RedisService.instance ) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * redis 설정 조회
   */
  public getMiddleWare() {
    this.middleWare = session({
      key: COOKIE_KEY.TWM,
      store: new this.RedisStore(this.redisOption),
      cookie: { maxAge: 60 * 60 * 1000, httpOnly: false }, // 1hours
      secret: 'sktechx',
      saveUninitialized: false, // don't create session until something stored,
      resave: false, // don't save session if unmodified
      rolling: true,
    });
    return this.middleWare;
  }

  /**
   * 데이터 저장
   * @param key
   * @param value
   */
  public setData(key, value) {
    this.client.set(key, value);
  }

  /**
   * tos redis 에 데이터 저장
   * @param key
   * @param value
   */
  public setDataTos(key, value) {
    this.tosClient.set(key, value);
  }

  /**
   * redis string data 조회
   * @param key
   */
  public getString(key): Observable<any> {
    return this.getRedisString(key, this.client);
  }

  /**
   * redis json data 조회
   * @param key
   */
  public getData(key): Observable<any> {
    return this.getRedisData(key, this.client);
  }

  /**
   * tos redis string data 조회
   * @param key
   */
  public getStringTos(key): Observable<any> {
    return this.getRedisString(key, this.tosClient);
  }

  /**
   * tos redis json data 조회
   * @param key
   */
  public getDataTos(key): Observable<any> {
    return this.getRedisData(key, this.tosClient);
  }

  /**
   * string data 조회
   * @param key
   * @param client
   */
  private getRedisString(key, client): Observable<any> {
    this.logger.info(this, '[Get String]', key);
    return Observable.create((observer) => {
      client.get(key, (err, reply) => {
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

        this.logger.info(this, '[Get String]', key, resp);
        observer.next(resp);
        observer.complete();
      });
    });
  }

  /**
   * json data 조회
   * @param key
   * @param client
   */
  private getRedisData(key, client): Observable<any> {
    this.logger.info(this, '[Get Data]', key);
    return Observable.create((observer) => {
      client.get(key, (err, reply) => {
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
        this.logger.info(this, '[Get Data]', key, resp);
        observer.next(resp);
        observer.complete();
      });
    });
  }

  // for OP002-2289 test
  /**
   * json data 조회
   * @param key
   * @param client
   */
  public getRedisKey(key): Observable<any> {
    this.logger.info(this, '[Get keys]', key);
    return Observable.create((observer) => {
      this.client.keys(key, (err, reply) => {
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
            resp.result = reply; 
          } catch ( e ) {
            resp.code = API_CODE.REDIS_ERROR;
            resp.msg = NODE_API_ERROR[API_CODE.REDIS_ERROR];
          }
        }
        this.logger.info(this, '[Get Keys]', key, resp);
        observer.next(resp);
        observer.complete();
      });
    });
  }
}

export default RedisService;
