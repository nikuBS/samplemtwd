import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD, API_CODE, API_LOGIN_ERROR, API_SVC_PWD_ERROR } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import ErrorService from '../../services/error.service';
import { URL } from '../../types/url.old.type';
import FormatHelper from '../../utils/format.helper';
import { CHANNEL_TYPE, COOKIE_KEY } from '../../types/common.type';
import BrowserHelper from '../../utils/browser.helper';
import { Observable } from 'rxjs/Observable';
import RedisService from '../../services/redis.service';
import { REDIS_URL_META } from '../../types/common.type';
import { LOGIN_TYPE, SVC_ATTR, LINE_NAME } from '../../types/bff.old.type';


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
    this._redisService = new RedisService();
    this._error = new ErrorService();
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any): void;

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

  public certPage(req: any, res: any, next: any): void {
    this.logger.debug(this, '[CertPage]', req.body)
    if ( !FormatHelper.isEmpty(req.body.enc_data) ) {
      this.confirmIpinCert(req, res, next, req.body.enc_data);
    } else if ( !FormatHelper.isEmpty(req.body.EncodeData) ) {
      this.confirmNiceCert(req, res, next, req.body.EncodeData);
    } else {
      this.initPage(req, res, next);
    }
  }

  private confirmIpinCert(req, res, next, encData) {
    this.apiService.request(API_CMD.BFF_01_0023, {
      enc_data: encData
    }).subscribe((resp) => {
      this.handleCertResult(req, res, next, resp.code);
    });
  }

  private confirmNiceCert(req, res, next, encData) {
    this.apiService.request(API_CMD.BFF_01_0025, {
      encodeData: encData
    }).subscribe((resp) => {
      this.handleCertResult(req, res, next, resp.code);
    });
  }

  private handleCertResult(req, res, next, respCode) {
    if ( respCode === API_CODE.CODE_00 ) {
      // TODO save cert
      this.initPage(req, res, next);
    } else {
      // TODO go error page
    }
  }

  public initPage(req: any, res: any, next: any): void {
    const path = req.baseUrl + (req.path !== '/' ? req.path : '');
    const tokenId = req.query.id_token;
    const userId = req.query.userId;
    this._type = req.query.type;

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
        res.redirect('/auth/logout/expire');
      } else {
        this._logger.info(this, '[Session empty]');
        this.renderPage(req, res, next, path);
      }
    }
  }

  private setChannel(req, res): Observable<any> {
    const channel = BrowserHelper.isApp(req) ? CHANNEL_TYPE.MOBILE_APP : CHANNEL_TYPE.MOBILE_WEB;
    this.logger.info(this, '[set cookie]', channel);
    return this._loginService.setChannel(channel);
  }

  private getAuth(req, res, next, path, svcInfo, allSvc, childInfo) {
    const isLogin = !FormatHelper.isEmpty(svcInfo);
    this._redisService.getData(REDIS_URL_META + path).subscribe((resp) => {
      const urlMeta = resp;
      this.logger.info(this, urlMeta);
      if ( FormatHelper.isEmpty(urlMeta) ) {
        // TODO do not register
        if ( isLogin ) {
          this.render(req, res, next, svcInfo, allSvc, childInfo);
        } else {
          if ( URL[path].login ) {
            res.send('need login');
          } else {
            this.render(req, res, next, svcInfo, allSvc, childInfo);
          }
        }
      } else {
        if ( isLogin ) {
          const urlAuth = urlMeta.auth.grades;
          const svcGr = svcInfo.svcGr;
          if ( svcInfo.totalSvcCnt === '0' ) {
            this.errorEmptyLine(req, res, next, svcInfo);
          } else if ( svcInfo.totalSvcCnt !== '0' && svcInfo.expsSvcCnt === '0' ) {
            this.errorNoRegister(req, res, next, svcInfo);
          } else if ( urlAuth.indexOf(svcGr) !== -1 ) {
            const params = Object.assign(svcInfo, {
              urlAuth
            });
            this.render(req, res, next, params, allSvc, childInfo);
          } else if ( this._type === 'dev' ) {
            this.render(req, res, next, svcInfo, allSvc, childInfo);
          } else {
            const loginType = svcInfo.loginType;
            if ( loginType === LOGIN_TYPE.EASY ) {
              res.redirect('/auth/login/easy-fail');
            } else {
              this.errorAuth(req, res, next, svcInfo);

            }
          }
        } else {
          if ( urlMeta.auth.loginYn === 'Y' ) {
            res.send('need login');
          } else {
            this.render(req, res, next, svcInfo, allSvc, childInfo);
          }
        }
      }

    });
  }

  private errorAuth(req, res, next, svcInfo) {
    const data = {
      showSvc: svcInfo.svcAttrCd.indexOf(LINE_NAME.INTERNET_PHONE_IPTV) === -1 ? svcInfo.svcNum : svcInfo.addr,
      showAttr: SVC_ATTR[svcInfo.svcAttrCd]
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
      res.redirect('/auth/login/customer-pwd');
    } else if ( errorCode === API_LOGIN_ERROR.ICAS3235 ) {   // 휴면계정
      res.redirect('/auth/login/dormancy');
    } else if ( errorCode === API_LOGIN_ERROR.ATH1003 ) {
      res.redirect('/auth/login/exceed-fail');
    } else {
      res.redirect('/auth/login/fail?errorCode=' + errorCode);
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

