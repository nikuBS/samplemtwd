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

  constructor() {
  }

  public middleware = session({
    key: COOKIE_KEY.TWM,
    store: new this.RedisStore(this.redisOption),
    cookie: { maxAge: 60 * 60 * 1000 }, // 1hours
    secret: 'sktechx',
    saveUninitialized: false, // don't create session until something stored,
    resave: false, // don't save session if unmodified
    rolling: true
  });

  public setData(key, value) {
    const client = redis.createClient(this.envRedis);

    client.set(key, value);
    client.end(true);
  }

  public getData(key): Observable<any> {
    const client = redis.createClient(this.envRedis);

    return Observable.create((observer) => {
      client.get(key, (err, reply) => {
        let result;

        try {
          result = JSON.parse(reply);
        } catch ( e ) {
          result = null;
        }

        client.end(true);
        observer.next(result);
        observer.complete();
      });
    });
  }

}

export default RedisService;
