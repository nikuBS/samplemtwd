import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD, API_CODE, API_LOGIN_ERROR, API_SVC_PWD_ERROR } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import ErrorService from '../../services/error.service';
import FormatHelper from '../../utils/format.helper';
import { CHANNEL_TYPE, COOKIE_KEY } from '../../types/common.type';
import BrowserHelper from '../../utils/browser.helper';
import { Observable } from 'rxjs/Observable';
import RedisService from '../../services/redis.service';
import { REDIS_CODE, REDIS_URL_META } from '../../types/redis.type';
import { LOGIN_TYPE, SVC_ATTR_NAME, LINE_NAME } from '../../types/bff.type';
import { UrlMetaModel } from '../../models/url-meta.model';


abstract class TwViewController {
  private readonly _apiService: ApiService;
  private readonly _loginService: LoginService;
  private readonly _logger: LoggerService;
  private readonly _redisService: RedisService;
  private readonly _error: ErrorService;
  private _type: string = '';

  constructor() {
    this._apiService = new ApiService();
    this._loginService = new LoginService();
    this._logger = new LoggerService();
    this._redisService = RedisService.getInstance();
    this._error = new ErrorService();
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any): void;

  protected get apiService(): ApiService {
    return this._apiService;
  }

  protected get loginService(): LoginService {
    return this._loginService;
  }

  protected get redisService(): RedisService {
    return this._redisService;
  }

  protected get logger(): LoggerService {
    return this._logger;
  }

  protected get error(): ErrorService {
    return this._error;
  }

  public initPage(req: any, res: any, next: any): void {
    const path = req.baseUrl + (req.path !== '/' ? req.path : '');
    const tokenId = req.query.id_token;
    const userId = req.query.userId;
    this._type = req.query.type;
    this._logger.debug(this, '[Request Header]', req.headers);

    this._apiService.setCurrentReq(req, res);
    this._loginService.setCurrentReq(req, res);

    this.setChannel(req, res).subscribe((resp) => {
      if ( this.checkLogin(req.session) ) {
        this.sessionLogin(req, res, next, path);
      } else {
        if ( this.existId(tokenId, userId) ) {
          this.login(req, res, next, path, tokenId, userId);
        } else {
          this.sessionCheck(req, res, next, path);
        }
      }
    });
  }

  private existId(tokenId: string, userId: string) {
    return !(FormatHelper.isEmpty(tokenId) && FormatHelper.isEmpty(userId));
  }

  private checkLogin(session): boolean {
    return this._loginService.isLogin(session);
  }

  private login(req, res, next, path, tokenId, userId) {
    if ( !FormatHelper.isEmpty(tokenId) ) {
      this.apiService.requestLoginTid(tokenId, req.query.stateVal).subscribe((resp) => {
        this.renderPage(req, res, next, path);
      }, (error) => {
        this.failLogin(req, res, next, error.code);
      });
    } else {
      if ( /\/test/i.test(req.baseUrl) && /\/home/i.test(req.path) ) {
        this.apiService.requestLoginLoadTest(userId).subscribe((resp) => {
          this.renderPage(req, res, next, path); // noticeTpyCd
        }, (error) => {
          this.failLogin(req, res, next, error.code);
        });
      } else {
        this.apiService.requestLoginTest(userId).subscribe((resp) => {
          this.renderPage(req, res, next, path); // noticeTpyCd
        }, (error) => {
          this.failLogin(req, res, next, error.code);
        });
      }
    }
  }

  private sessionLogin(req, res, next, path) {
    this._logger.info(this, '[Session Login]', this._loginService.getSvcInfo());
    this.renderPage(req, res, next, path);
  }

  private sessionCheck(req, res, next, path) {
    if ( this._loginService.isNewSession() ) {
      this.renderPage(req, res, next, path);
    } else {
      const loginYn = req.cookies[COOKIE_KEY.TWM_LOGIN];
      if ( !FormatHelper.isEmpty(loginYn) && loginYn === 'Y' ) {
        this._logger.info(this, '[Session expired]');
        res.clearCookie(COOKIE_KEY.TWM_LOGIN);
        res.redirect('/common/member/logout/expire');
      } else {
        this._logger.info(this, '[Session empty]');
        this.renderPage(req, res, next, path);
      }
    }
  }

  private setChannel(req, res): Observable<any> {
    // const channel = BrowserHelper.isApp(req) ? CHANNEL_TYPE.MOBILE_APP : CHANNEL_TYPE.MOBILE_WEB;
    const channel = CHANNEL_TYPE.MOBILE_APP;
    this.logger.info(this, '[set cookie]', channel);
    return this._loginService.setChannel(channel);
  }

  private getAuth(req, res, next, path, svcInfo, allSvc, childInfo) {
    const isLogin = !FormatHelper.isEmpty(svcInfo);
    this._redisService.getData(REDIS_URL_META + path).subscribe((resp) => {
      this.logger.info(this, '[URL META]', path, resp);
      const urlMeta = new UrlMetaModel(resp.result || {});
      if ( resp.code === REDIS_CODE.CODE_SUCCESS ) {
        if ( isLogin ) {
          urlMeta.masking = this.loginService.getMaskingCert(svcInfo.svcMgmtNum);
          if ( urlMeta.auth.accessTypes.indexOf(svcInfo.loginType) !== -1 ) {
            const urlAuth = urlMeta.auth.grades;
            const svcGr = svcInfo.svcGr;
            if ( urlAuth.indexOf(svcGr) !== -1 ) {
              this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
            } else {
              // TODO: 접근권한 없음
              this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
            }
          } else {
            this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
            // 현재 로그인 방법으론 이용할 수 없음
            // if ( svcInfo.loginType === LOGIN_TYPE.EASY ) {
              // res.redirect('/common/member/slogin/fail');
            // } else {
              // TODO: ERROR 케이스 (일반로그인에서 권한이 없는 케이스)
              // res.redirect('/common/member/slogin/fail');
              // this.errorAuth(req, res, next, svcInfo);
            // }
          }
        } else {
          console.log('not login');
          if ( !FormatHelper.isEmpty(urlMeta.auth.accessTypes) ) {
            if ( urlMeta.auth.accessTypes.indexOf(LOGIN_TYPE.NONE) !== -1 ) {
              this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
            } else {
              // login page
              // TODO: APP 고려해야함 (뒤로가기도 이슈있음)
              res.redirect('/common/tid/login?target=' + path);
            }
          } else {
            // TODO: admin 정보 입력 오류
            this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
          }
        }
      } else {
        // TODO: 등록되지 않은 메뉴 (로그인, 인증등에서 쓰이는 URL도 있음)
        this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
      }

      // if ( svcInfo.totalSvcCnt === '0' ) {
      //   this.errorEmptyLine(req, res, next, svcInfo);
      // } else if ( svcInfo.totalSvcCnt !== '0' && svcInfo.expsSvcCnt === '0' ) {
      //   this.errorNoRegister(req, res, next, svcInfo);
      // } else if ( urlAuth.indexOf(svcGr) !== -1 ) {
      //   this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
      // } else {
      //   const loginType = svcInfo.loginType;
      //   if ( loginType === LOGIN_TYPE.EASY ) {
      //     res.redirect('/common/member/slogin/fail');
      //   } else {
      //     this.errorAuth(req, res, next, svcInfo);
      //   }
      // }
    });
  }

  private errorAuth(req, res, next, svcInfo) {
    const data = {
      showSvc: svcInfo.svcAttrCd.indexOf(LINE_NAME.INTERNET_PHONE_IPTV) === -1 ? svcInfo.svcNum : svcInfo.addr,
      showAttr: SVC_ATTR_NAME[svcInfo.svcAttrCd]
    };

    res.render('error.no-auth.html', { svcInfo, data });
  }

  private errorNoRegister(req, res, next, svcInfo) {
    res.render('error.no-register.html', { svcInfo });
  }

  private errorEmptyLine(req, res, next, svcInfo) {
    res.render('error.empty-line.html', { svcInfo });
  }

  private renderPage(req, res, next, path) {
    // TODO noticeTpyCd
    const svcInfo = this._loginService.getSvcInfo();
    const allSvc = this._loginService.getAllSvcInfo();
    const childInfo = this._loginService.getChildInfo();
    this.getAuth(req, res, next, path, svcInfo, allSvc, childInfo);
  }

  private failLogin(req, res, next, errorCode) {
    if ( errorCode === API_LOGIN_ERROR.ICAS3228 ) {    // 고객보호비밀번호
      res.redirect('/common/login/customer-pwd');
    } else if ( errorCode === API_LOGIN_ERROR.ICAS3235 ) {   // 휴면계정
      res.redirect('/common/login/dormancy');
    } else if ( errorCode === API_LOGIN_ERROR.ATH1003 ) {
      res.redirect('/common/member/login/exceed-fail');
    } else {
      res.redirect('/common/member/login/fail?errorCode=' + errorCode);
    }
  }

  private checkError(error: string, errorMessage: string) {
    return !FormatHelper.isEmpty(error);

  }

  private renderError(req: Request, res: Response, next: NextFunction, message: any) {
    res.send(message);
  }
}

export default TwViewController;

