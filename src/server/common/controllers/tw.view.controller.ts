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
import { LOGIN_TYPE, SVC_ATTR_NAME, LINE_NAME } from '../../types/bff.type';
import { UrlMetaModel } from '../../models/url-meta.model';
import { REDIS_KEY } from '../../types/redis.type';
import DateHelper from '../../utils/date.helper';
import ParamsHelper from '../../utils/params.helper';

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

    this._apiService.setCurrentReq(req, res);

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('expires', '0');
    res.set('pragma', 'no-cache');

    this.setChannel(req, res).subscribe((resp) => {
      if ( this.checkLogin(req) ) {
        this.sessionLogin(req, res, next, path);
      } else {
        if ( this.existId(tokenId, userId) ) {
          this.login(req, res, next, path, tokenId, userId);
        } else if ( this.checkSSOLogin(req, path) ) {
          res.redirect('/common/tid/login');
        } else {
          this.sessionCheck(req, res, next, path);
        }
      }
    });
  }

  private checkLogin(req): boolean {
    return this._loginService.isLogin(req);
  }

  private existId(tokenId: string, userId: string) {
    return !(FormatHelper.isEmpty(tokenId) && FormatHelper.isEmpty(userId));
  }

  private checkSSOLogin(req, path): boolean {
    const ssoCookie = req.cookies[COOKIE_KEY.TID_SSO];
    return !BrowserHelper.isApp(req) && !FormatHelper.isEmpty(ssoCookie) &&
      !/\/common\/tid/i.test(path) && !/\/common\/member\/login/i.test(path) && !/\/common\/member\/signup/i.test(path) &&
      !/\/common\/member\/logout/i.test(path) && !/\/common\/member\/slogin/i.test(path) &&
      !/\/common\/member\/withdrawal-complete/i.test(path) && !/\/common\/member\/init/i.test(path);
  }

  private login(req, res, next, path, tokenId, userId) {
    if ( !FormatHelper.isEmpty(tokenId) ) {
      const state = req.query.stateVal || req.query.state;
      this.apiService.requestLoginTid(tokenId, state).subscribe((resp) => {
        this.renderPage(req, res, next, path);
      }, (error) => {
        this.failLogin(req, res, next, path, error.code);
      });
    } else {
      if ( /\/test/i.test(req.baseUrl) && /\/login/i.test(req.path) ) {
        this.apiService.requestLoginLoadTest(userId).subscribe((resp) => {
          this.renderPage(req, res, next, path); // noticeTpyCd
        }, (error) => {
          this.failLogin(req, res, next, path, error.code);
        });
      } else {
        this.apiService.requestLoginTest(userId).subscribe((resp) => {
          this.renderPage(req, res, next, path); // noticeTpyCd
        }, (error) => {
          this.failLogin(req, res, next, path, error.code);
        });
      }
    }
  }

  private sessionLogin(req, res, next, path) {
    this._logger.info(this, '[Session Login]');
    this.renderPage(req, res, next, path);
  }

  private sessionCheck(req, res, next, path) {
    const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
    if ( !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
      this._logger.info(this, '[Session expired]');
      res.clearCookie(COOKIE_KEY.TWM_LOGIN);
      res.redirect('/common/member/logout/expire?target=' + req.baseUrl + req.url);
    } else {
      this._logger.info(this, '[Session empty]');
      this.renderPage(req, res, next, path);
    }
  }

  private setChannel(req, res): Observable<any> {
    const channel = BrowserHelper.isApp(req) ? CHANNEL_TYPE.MOBILE_APP : CHANNEL_TYPE.MOBILE_WEB;
    this.logger.info(this, '[set cookie]', channel);
    return this._loginService.setChannel(req, channel);
  }

  private getAuth(req, res, next, path, svcInfo, allSvc, childInfo) {
    const isLogin = !FormatHelper.isEmpty(svcInfo);
    this.loginService.setCookie(res, COOKIE_KEY.LAYER_CHECK, this.loginService.getNoticeType(req));
    this.loginService.setNoticeType(req, '').subscribe();
    this._redisService.getData(REDIS_KEY.URL_META + path).subscribe((resp) => {
      this.logger.info(this, '[URL META]', path, resp);
      const urlMeta = new UrlMetaModel(resp.result || {});
      urlMeta.isApp = BrowserHelper.isApp(req);
      urlMeta.fullUrl = this.loginService.getProtocol(req) + this.loginService.getDns(req) + this.loginService.getFullPath(req);

      if ( resp.code === API_CODE.REDIS_SUCCESS ) {
        const loginType = urlMeta.auth.accessTypes;

        this.checkServiceBlock(urlMeta, svcInfo, res).subscribe((serviceBlock) => {
          if ( serviceBlock ) {
            return;
          }

          if ( loginType === '' ) {
            // admin 정보 입력 오류 (accessType이 비어있음)
            res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
            return;
          }
          if ( isLogin ) {
            urlMeta.masking = this.loginService.getMaskingCert(req, svcInfo.svcMgmtNum);
            if ( loginType.indexOf(svcInfo.loginType) !== -1 ) {
              const urlAuth = urlMeta.auth.grades;
              const svcGr = svcInfo.svcGr;
              // admin 정보 입력 오류 (접근권한이 입력되지 않음)
              if ( urlAuth === '' ) {
                res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
                return;
              }
              if ( svcInfo.totalSvcCnt === '0' || svcInfo.expsSvcCnt === '0' ) {
                if ( urlAuth.indexOf('N') !== -1 ) {
                  // 준회원 접근 가능한 화면
                  this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
                } else {
                  // 등록된 회선 없음 + 준회원 접근 안되는 화면
                  this.errorNoRegister(req, res, next);
                }
              } else if ( urlAuth.indexOf(svcGr) !== -1 ) {
                this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
              } else {
                // 접근권한 없음
                this.errorAuth(req, res, next);
              }
            } else if ( loginType.indexOf(LOGIN_TYPE.NONE) !== -1 ) {
              this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
            } else {
              // 현재 로그인 방법으론 이용할 수 없음
              if ( svcInfo.loginType === LOGIN_TYPE.EASY ) {
                res.render('error.slogin-fail.html', { target: req.baseUrl + req.url });
              } else {
                // ERROR 케이스 (일반로그인에서 권한이 없는 케이스)
                this.errorAuth(req, res, next);
              }
            }
          } else {
            if ( urlMeta.auth.accessTypes.indexOf(LOGIN_TYPE.NONE) !== -1 ) {
              this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
            } else {
              // login page
              res.render('error.login-block.html', { target: req.baseUrl + req.url });
            }
          }
        });
      } else {
        // 등록되지 않은 메뉴
        if ( String(process.env.NODE_ENV) === 'prd' ) {
          this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
        } else {
          if ( /\/product\/callplan/.test(path) ) {
            this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
          } else {
            res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
            return;
          }
        }

      }
    });
  }

  private errorAuth(req, res, next) {
    res.render('error.no-auth.html');
  }

  private errorNoRegister(req, res, next) {
    res.render('error.no-register.html');
  }

  private renderPage(req, res, next, path) {
    const svcInfo = this._loginService.getSvcInfo(req);
    const allSvc = this._loginService.getAllSvcInfo(req);
    const childInfo = this._loginService.getChildInfo(req);
    this.getAuth(req, res, next, path, svcInfo, allSvc, childInfo);
  }

  private failLogin(req, res, next, path, errorCode) {
    const target = this.getTargetUrl(path, req.query);
    if ( errorCode === API_LOGIN_ERROR.ICAS3228 ) {    // 고객보호비밀번호
      res.redirect('/common/member/login/cust-pwd?target=' + target);
    } else if ( errorCode === API_LOGIN_ERROR.ICAS3235 ) {   // 휴면계정
      res.redirect('/common/member/login/reactive?target=' + target);
    } else if ( errorCode === API_LOGIN_ERROR.ATH1003 ) {
      res.redirect('/common/member/login/exceed-fail');
    } else if ( errorCode === API_LOGIN_ERROR.ATH3236 ) {
      res.redirect('/common/member/login/lost?target=' + target);
    } else {
      res.redirect('/common/member/login/fail?errorCode=' + errorCode);
    }
  }

  private getTargetUrl(url, query) {
    delete query.id_token;
    delete query.stateVal;
    delete query.state;
    delete query.token_type;
    delete query.sso_session_id;

    return url + ParamsHelper.setQueryParams(query);
  }

  private checkServiceBlock(urlMeta: any, svcInfo: any, res): Observable<boolean> {
    if ( !FormatHelper.isEmpty(urlMeta.block) && urlMeta.block.length > 0 ) {
      const blockList = urlMeta.block;
      const today = new Date().getTime();
      const findBlock = blockList.find((block) => {
        const startTime = DateHelper.convDateFormat(block.fromDtm).getTime();
        const endTime = DateHelper.convDateFormat(block.toDtm).getTime();
        return today > startTime && today < endTime;
      });
      if ( !FormatHelper.isEmpty(findBlock) ) {
        if ( !FormatHelper.isEmpty(svcInfo) ) {
          const userId = svcInfo.userId;
          return this.redisService.getString(REDIS_KEY.EX_USER + userId)
            .map((resp) => {
              if ( resp.code === API_CODE.REDIS_SUCCESS ) {
                return false;
              } else {
                const blockUrl = findBlock.url || '/common/util/service-block';
                res.redirect(blockUrl + '?fromDtm=' + findBlock.fromDtm + '&toDtm=' + findBlock.toDtm);
                return true;
              }
            });
        } else {
          const blockUrl = findBlock.url || '/common/util/service-block';
          res.redirect(blockUrl + '?fromDtm=' + findBlock.fromDtm + '&toDtm=' + findBlock.toDtm);
          return Observable.of(true);
        }
      } else {
        return Observable.of(false);
      }
    } else {
      return Observable.of(false);
    }
  }
}

export default TwViewController;

