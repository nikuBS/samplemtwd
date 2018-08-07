import session from 'express-session';
import connect from 'connect-redis';
import redis from 'redis';
import EnvHelper from '../utils/env.helper';
import { COOKIE_KEY } from '../types/common.type';
import { Observable } from 'rxjs/Observable';

class RedisService {
  private envRedis = EnvHelper.getEnvironment('REDIS');
  private RedisStore = connect(session);
  private redisOption = Object.assign(this.envRedis, {
    prefix: 'session:'
  });
  private client;

  constructor() {
  }

  public middleware = session({
    key: COOKIE_KEY.TWM,
    store: new this.RedisStore(this.redisOption),
    cookie: { maxAge: 60 * 60 * 1000 }, // 1hours
    secret: 'sktechx',
    saveUninitialized: false, // don't create session until something stored,
    resave: false, // don't save session if unmodified
  });

  public setData(key, value) {
    this.client.set(key, value);
  }

  public getData(key): Observable<any> {
    this.client = redis.createClient(this.envRedis);
    return Observable.create((observer) => {
      this.client.get(key, (err, reply) => {
        const result = JSON.parse(reply);
        this.client.end();
        observer.next(result);
        observer.complete();
      });
    });
  }

}

export default RedisService;
