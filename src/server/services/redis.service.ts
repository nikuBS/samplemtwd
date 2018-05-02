import session from 'express-session';
import connect from 'connect-redis';

// redis server info
// temporary repo : https://www.redislabs.com
const RedisStore = connect(session);
const redisOption = {
  host: 'redis-10428.c1.asia-northeast1-1.gce.cloud.redislabs.com',
  port: 10428,
  prefix: 'session:',
  pass: 'sH7JUTF7AKwRiNOs9rPxD6rS53HvW9GC'
};

class RedisService {
  public middleware = session({
    store: new RedisStore(redisOption),
    cookie: { maxAge: 5 * 60 * 1000 }, // 5min
    secret: 'sktechx',
    saveUninitialized: true, // don't create session until something stored,
    resave: true // don't save session if unmodified
  });
}

export default RedisService;
