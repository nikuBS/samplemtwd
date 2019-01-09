import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import RedisService from '../../services/redis.service';


class ShortcutRouter {
  public router: Router;
  private redisService: RedisService = RedisService.getInstance();
  private shortcutUrl = 'skt.sh';

  constructor() {
    this.router = express.Router();

    this.router.get('/', (req, res, next) => {
      const dns = req.headers.host;
      if ( dns === this.shortcutUrl ) {
        // TODO: redis 단축 도메인 경로로 redirect
        // this.redisService.getData(REDIS_SC_URL + dns).subscribe((resp) => {
        //     console.log(resp);
        // });
        res.send('short cut');
      } else {
        res.redirect('/main/home');
      }

    });
    this.router.get('/:args', (req, res, next) => {
      const dns = req.headers.host;
      if ( dns === this.shortcutUrl ) {
        // TODO: redis 단축 도메인 경로로 redirect
        res.send('short cut');
      } else {
        res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
      }

    });
    // this.router.get('/:args/:args', (req, res, next) => {
    //   res.json('2depth');
    // });
  }
}

export default ShortcutRouter;
