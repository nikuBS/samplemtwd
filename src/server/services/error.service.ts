import { Response } from 'express';
import { API_CODE } from '../types/api-command.type';
import { NODE_ERROR_MSG } from '../types/string.type';
import FormatHelper from '../utils/format.helper';
import BrowserHelper from '../utils/browser.helper';
import RedisService from '../services/redis.service';
import { REDIS_KEY } from '../types/redis.type';
import { TARGET_PARAM_VALIDATION_CHECK_URL } from '../types/url.type';
import TwRouter from '../common/route/tw.router';

interface ErrorOptions {
  title?: string;
  code?: any;
  msg?: any;
  subMsg?: any;
  isBackCheck?: boolean;
  isPopupCheck?: boolean;
  svcInfo: any;
  pageInfo?: any;
}

class ErrorService {
  static instance;
  private redisService: RedisService = RedisService.getInstance();

  constructor() {
    if ( ErrorService.instance ) {
      return ErrorService.instance;
    }

    ErrorService.instance = this;
  }

  /**
   * @param res
   * @param options
   */
  public render(res: Response, options: ErrorOptions): any {
    return res.render('error.server-error.html', {
      title: options.title || 'Error',
      code: options.code || '',
      msg: this._replaceBreakLines(options.msg) || '',
      subMsg: this._replaceBreakLines(options.subMsg) || '',
      svcInfo: options.svcInfo || null,
      isBackCheck: options.isBackCheck || false,
      isPopupCheck: !!options.isPopupCheck || false,
      pageInfo: options.pageInfo
    });
  }

  /**
   * @param msg
   * @private
   */
  private _replaceBreakLines(msg: any): any {
    if (FormatHelper.isEmpty(msg)) {
      return '';
    }

    return msg.replace(/\\n/g, '<br>');
  }

  /**
   * @param apiArray
   */
  public apiError(apiArray: any): any {
    let errorResult: any = null;

    apiArray.forEach((api) => {
      if ( API_CODE.CODE_00 === api.code || !FormatHelper.isEmpty(errorResult) ) {
        return true;
      }

      errorResult = {
        code: api.code,
        msg: api.msg
      };
    });

    return errorResult;
  }

  /**
   * Web 접속 시 target Parameter의 유효성을 체크하는 middlewware
   * @param req
   */
  public targetValidationCheck(req: any, res: any, next: any) {
    let target = decodeURIComponent(req.query.target || '');
    const path = req.path || '';
    const domain = req.protocol + '://' + req.headers.host;
    const regExp = new RegExp('_type_(.)+_state_');

    if (BrowserHelper.isApp(req)) {
      next();
      return;
    }

    // 요청 type이 html이고, target parameter이 존재하고, check URL인 경우만 유효성을 체크한다..
    if (req.accepts(['html', 'json']) === 'html' && !FormatHelper.isEmpty(target)) {

      // 유효성 체크 대상 path가 아닐 경우는 skip
      if (TARGET_PARAM_VALIDATION_CHECK_URL.some(url => (path === url)) === false) {
        next();
        return;
      }

      // "_type_xxxxxxxx_state"의 앞까지만 target로 인식
      const redisService = ErrorService.instance.redisService;
      if (target.search(regExp) !== -1) {
        target = target.substring(0, target.search(regExp));
      }

      // target에서 parameter 부분 제거
      if (target.indexOf('?') !== -1) {
        target = target.substring(0, target.indexOf('?'));
      }

      // 유효성 체크 대상인 경우는 redis에서 target parameter의 정보 확인
      redisService.getData(REDIS_KEY.URL_META + target.replace(domain, '')).subscribe((resp) => {
        if (resp.code !== API_CODE.REDIS_SUCCESS ) {
          res.render('error.server-error.html', {
                svcInfo: null, 
                code: API_CODE.NODE_1006, 
                isBackCheck: false,
                msg: NODE_ERROR_MSG[API_CODE.NODE_1006]
          });
        } else {
          next();
          return;
        }
      });
    } else {
      next();
      return;
    }
  }
}

export default ErrorService;
