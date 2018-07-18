import session from 'express-session';
import connect from 'connect-redis';
import redis from 'redis';
import EnvHelper from '../utils/env.helper';

class RedisService {
  private envRedis = EnvHelper.getEnvironment('REDIS');
  private RedisStore = connect(session);
  private redisOption = Object.assign(this.envRedis, {
    prefix: 'session:'
  });
  private client;

  constructor() {
    // this.client = redis.createClient(this.env.REDIS);
  }

  public middleware = session({
    key: 'twm',
    store: new this.RedisStore(this.redisOption),
    cookie: { maxAge: 60 * 60 * 1000 }, // 1hours
    secret: 'sktechx',
    saveUninitialized: true, // don't create session until something stored,
    resave: false, // don't save session if unmodified
  });

  public setRedis(key, value) {
    this.client.set(key, value);
  }

  public getRedis(key) {
    this.client.get(key, (err, reply) => {
      console.log('redis', reply);
    });
  }

}

export default RedisService;
