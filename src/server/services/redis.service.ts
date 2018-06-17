import session from 'express-session';
import connect from 'connect-redis';
import redis from 'redis';
import environment from '../config/environment.config';

class RedisService {
  private env = environment[String(process.env.NODE_ENV)];
  private RedisStore = connect(session);
  private redisOption = Object.assign(this.env.REDIS, {
    prefix: 'session:'
  });
  private client;

  constructor() {
    // this.client = redis.createClient(this.env.REDIS);
  }

  public middleware = session({
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
