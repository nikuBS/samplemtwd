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
import CommonHelper from '../../utils/common.helper';


/**
 * @desc controller 상위 class
 */
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

  /**
   * controller 초기화
   * @param req
   * @param res
   * @param next
   */
  public initPage(req: any, res: any, next: any): void {
    const path = req.baseUrl + (req.path !== '/' ? req.path : '');
    const tokenId = req.query.id_token;
    const userId = req.query.userId;
    this._type = req.query.type;

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('expires', '0');
    res.set('pragma', 'no-cache');

    this.setChannel(req, res).subscribe((resp) => {
      this._apiService.setCurrentReq(req, res);
      
      if ( this.checkLogin(req) ) {
        this.sessionLogin(req, res, next, path);
      } else {
        if ( this.existId(tokenId, userId) ) {
          this.login(req, res, next, path, tokenId, userId);
        } else if ( this.checkSSOLogin(req, path) ) {
          res.redirect('/common/tid/login?target=' + this.getTargetUrl(path, req.query));
        } else {
          this.sessionCheck(req, res, next, path);
        }
      }
    });
  }

  /**
   * 로그인 확인
   * @param req
   */
  private checkLogin(req): boolean {
    return this._loginService.isLogin(req);
  }

  /**
   * query parameter에 ID존재하는지 확인
   * @param tokenId
   * @param userId
   */
  private existId(tokenId: string, userId: string) {
    return !(FormatHelper.isEmpty(tokenId) && FormatHelper.isEmpty(userId));
  }

  /**
   * SSO 로그인 쿠키 확인
   * @param req
   * @param path
   */
  private checkSSOLogin(req, path): boolean {
    const ssoCookie = req.cookies[COOKIE_KEY.TID_SSO];
    return !BrowserHelper.isApp(req) && !FormatHelper.isEmpty(ssoCookie) &&
      !/\/common\/tid/i.test(path) && !/\/common\/member\/login/i.test(path) && !/\/common\/member\/signup/i.test(path) &&
      !/\/common\/member\/logout/i.test(path) && !/\/common\/member\/slogin/i.test(path) &&
      !/\/common\/member\/withdrawal-complete/i.test(path) && !/\/common\/member\/init/i.test(path);
  }

  /**
   * 로그인 요청
   * @param req
   * @param res
   * @param next
   * @param path
   * @param tokenId
   * @param userId
   */
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

  /**
   * 세션 정보를 통한 로그인 처리
   * @param req
   * @param res
   * @param next
   * @param path
   */
  private sessionLogin(req, res, next, path) {
    this._logger.info(this, '[Session Login]');
    this.renderPage(req, res, next, path);
  }

  /**
   * 세션 쿠키를 통한 로그인 확인
   * @param req
   * @param res
   * @param next
   * @param path
   */
  private sessionCheck(req, res, next, path) {
    const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
    if ( !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
      this._logger.info(this, '[Session expired]');
      res.clearCookie(COOKIE_KEY.TWM_LOGIN);
      CommonHelper.clearCookieWithPreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
      res.redirect('/common/member/logout/expire?target=' + this.getTargetUrl(path, req.query));
    } else {
      this._logger.info(this, '[Session empty]');
      this.renderPage(req, res, next, path);
    }
  }

  /**
   * 채널 정보 쿠키 저장
   * @param req
   * @param res
   */
  private setChannel(req, res): Observable<any> {
    const channel = BrowserHelper.isApp(req) ? CHANNEL_TYPE.MOBILE_APP : CHANNEL_TYPE.MOBILE_WEB;
    this.logger.info(this, '[set cookie]', channel);
    return this._loginService.setChannel(req, channel);
  }

  /**
   * 화면 권한 처리
   * @param req
   * @param res
   * @param next
   * @param path
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   */
  private getAuth(req, res, next, path, svcInfo, allSvc, childInfo) {
    const isLogin = !FormatHelper.isEmpty(svcInfo);
    this.loginService.setCookie(res, COOKIE_KEY.LAYER_CHECK, this.loginService.getNoticeType(req));
    this.loginService.setNoticeType(req, '').subscribe();

    // native에서 해당 값을 cookie에 set 하지 않기 때문에 로그인 완료시 cookie에 값을 설정한다.
    if ( isLogin && FormatHelper.isEmpty(req.cookies[COOKIE_KEY.TWM_LOGIN])) {
      res.cookie(COOKIE_KEY.TWM_LOGIN, 'Y');
    }

    // 19.05.28 
    // APP 을 통한 로그인 시 XTLID, XTLOGINID, XTSVCGR, XTLOGINTYPE 쿠키가 생성되지 않는 (사라지는?) 문제를 해결하기 위해
    // request 에 해당 쿠키가 존재하지 않는 경우 새로 발급하도록 처리
    this.checkXtCookie(req, res);

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

  /**
   * 화면 권한 오류 페이지
   * @param req
   * @param res
   * @param next
   */
  private errorAuth(req, res, next) {
    res.render('error.no-auth.html');
  }

  /**
   * 회선 없음 오류 페이지
   * @param req
   * @param res
   * @param next
   */
  private errorNoRegister(req, res, next) {
    res.render('error.no-register.html');
  }

  /**
   * 페이지 렌더링을 위한 처리 시작
   * @param req
   * @param res
   * @param next
   * @param path
   */
  private renderPage(req, res, next, path) {
    const svcInfo = this._loginService.getSvcInfo(req);
    const allSvc = this._loginService.getAllSvcInfo(req);
    const childInfo = this._loginService.getChildInfo(req);
    this.getAuth(req, res, next, path, svcInfo, allSvc, childInfo);
  }

  /**
   * 로그인 실패 처리
   * @param req
   * @param res
   * @param next
   * @param path
   * @param errorCode
   */
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

  /**
   * 로그인 후 이동 URL 구성
   * @param url
   * @param query
   */
  private getTargetUrl(url, query) {
    delete query.id_token;
    delete query.stateVal;
    delete query.state;
    delete query.token_type;
    delete query.sso_session_id;

    return url + ParamsHelper.setQueryParams(query);
  }

  /**
   * 차단 정보 확인
   * @param urlMeta
   * @param svcInfo
   * @param res
   */
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

  /**
   * 통계 수집을 위한 XTRACTOR Cookie 발급여부 체크
   * @param req
   * @param res
   */
  private checkXtCookie(req, res) {
    if ( !FormatHelper.isEmpty(req.session) && !FormatHelper.isEmpty(req.session.svcInfo) ) {

      if ( !FormatHelper.isEmpty(req.session.svcInfo.loginType) ) {
        // XTLOGINTYPE 쿠키 존재 여부 체크 및 미존재시 새로 발급
        // if (FormatHelper.isEmpty(req.cookies[COOKIE_KEY.XTLOGINTYPE])) {
          // this.logger.debug(this, '[checkXtCookie] XTLOGINTYPE Cookie does not exist');

          // TID 를 통한 로그인 시 XTLOGINTYPE 쿠키는 A 로 발급하고 간편로그인인 경우 XTLOGINTYPE 쿠키를 Z 로 발급
          if ( req.session.svcInfo.loginType === LOGIN_TYPE.TID ) {
            this.loginService.setCookie(res, COOKIE_KEY.XTLOGINTYPE, 'A');
          } else if ( req.session.svcInfo.loginType === LOGIN_TYPE.EASY ) {
            this.loginService.setCookie(res, COOKIE_KEY.XTLOGINTYPE, 'Z');
          }
        // }
      }

      if ( !FormatHelper.isEmpty(req.session.svcInfo.xtInfo) ) {
        // XTLID 쿠키 존재 여부 체크 및 미존재시 새로 발급
        // if (FormatHelper.isEmpty(req.cookies[COOKIE_KEY.XTLID])) {
          // this.logger.debug(this, '[checkXtCookie] XTLID Cookie does not exist');
          this.loginService.setCookie(res, COOKIE_KEY.XTLID, req.session.svcInfo.xtInfo.XTLID);            
        // }

        // if (FormatHelper.isEmpty(req.cookies[COOKIE_KEY.XTUID])) {
          // this.logger.debug(this, '[checkXtCookie] XTUID Cookie does not exist');
          this.loginService.setCookie(res, COOKIE_KEY.XTUID, req.session.svcInfo.xtInfo.XTUID);            
        // }

        // XTLOGINID 쿠키 존재 여부 체크 및 미존재시 새로 발급
        // if (FormatHelper.isEmpty(req.cookies[COOKIE_KEY.XTLOGINID])) {
          // this.logger.debug(this, '[checkXtCookie] XTLOGINID Cookie does not exist');
          this.loginService.setCookie(res, COOKIE_KEY.XTLOGINID, req.session.svcInfo.xtInfo.XTLOGINID);            
        // }

        // XTSVCGR 쿠키 존재 여부 체크 및 미존재시 새로 발급
        // if (FormatHelper.isEmpty(req.cookies[COOKIE_KEY.XTSVCGR])) {
          // this.logger.debug(this, '[checkXtCookie] XTSVCGR Cookie does not exist');
          this.loginService.setCookie(res, COOKIE_KEY.XTSVCGR, req.session.svcInfo.xtInfo.XTSVCGR);            
        // }
      }
    }
  }
}

export default TwViewController;

