import session from 'express-session';
import connect from 'connect-redis';
import environment from '../config/environment.config';

const env = environment[String(process.env.NODE_ENV)];

// redis dev server info
const RedisStore = connect(session);
const redisOption = Object.assign(env.REDIS, {
  prefix: 'session:'
});

class RedisService {
  public middleware = session({
    store: new RedisStore(redisOption),
    cookie: { maxAge: 5 * 60 * 1000 }, // 5min
    secret: 'sktechx',
    saveUninitialized: true, // don't create session until something stored,
    resave: false, // don't save session if unmodified
  });
}

export default RedisService;
