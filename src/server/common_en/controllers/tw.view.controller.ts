import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services_en/api.service';
import LoginService from '../../services_en/login.service';
import { API_CMD, API_CODE, API_LOGIN_ERROR, API_SVC_PWD_ERROR } from '../../types_en/api-command.type';
import LoggerService from '../../services_en/logger.service';
import ErrorService from '../../services_en/error.service';
import FormatHelper from '../../utils_en/format.helper';
import { CHANNEL_TYPE, COOKIE_KEY } from '../../types_en/common.type';
import BrowserHelper from '../../utils_en/browser.helper';
import { Observable } from 'rxjs/Observable';
import RedisService from '../../services_en/redis.service';
import { LOGIN_TYPE, SVC_ATTR_NAME, LINE_NAME } from '../../types_en/bff.type';
import { UrlMetaModel } from '../../models_en/url-meta.model';
import { REDIS_KEY } from '../../types_en/redis.type';
import DateHelper from '../../utils_en/date.helper';
import ParamsHelper from '../../utils_en/params.helper';
import CommonHelper from '../../utils_en/common.helper';


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

  protected get noUrlMeta(): boolean {
    return false;
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
          res.redirect('/en/common/tid/login?target=' + this.getTargetUrl(path, req.query));
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
      !/\/en\/common\/tid/i.test(path) && !/\/en\/common\/member\/login/i.test(path) && !/\/en\/common\/member\/signup/i.test(path) &&
      !/\/en\/common\/member\/logout/i.test(path) && !/\/en\/common\/member\/slogin/i.test(path) &&
      !/\/en\/common\/member\/withdrawal-complete/i.test(path) && !/\/en\/common\/member\/init/i.test(path);
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
      const roamMcc = req.cookies['ROAMING_MCC'];
      this.apiService.setCurrentReq(req, res);
      this.apiService.requestLoginTid(tokenId, state, roamMcc).subscribe((resp) => {

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
      res.redirect('/en/common/member/logout/expire?target=' + this.getTargetUrl(path, req.query));
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
   * redis에서 개인화 문자 진입 아이콘 노출 여부 체크
   * @return {Observable}
   */
  protected getPersonSmsDisableTimeCheck(): Observable<any> {
    const DEFAULT_PARAM = {
      property: REDIS_KEY.PERSON_SMS_DISABLE_TIME
    };
    return this._apiService.request(API_CMD.BFF_01_0069, DEFAULT_PARAM).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const today = new Date().getTime();
        const resTime = resp.result.split('~');
        const startTime = DateHelper.convDateFormat(resTime[0]).getTime();
        const endTime = DateHelper.convDateFormat(resTime[1]).getTime();
        this.logger.info(this, '[Person sms startTime // endTime]', startTime, endTime);
        /**
         * 버튼 비노출 시점에 포함되지 않으면 버튼 노출
         * true: 노출, false: 비노출
         */
        return !(today >= startTime && today <= endTime);
      } else {
        return null;
      }
    });
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
    // 이준엽임시
    // path = path.replace('/en/','/');
      this._redisService.getData(REDIS_KEY.URL_META + path).subscribe((resp) => {
      this.logger.info(this, '[EN/URL META]', path, resp);
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
            res.status(404).render('en.error.page-not-found.html', { svcInfo: null, code: res.statusCode });
            return;
          }
          if ( isLogin ) {

            // tslint:disable-next-line: no-shadowed-variable
            this.getPersonSmsDisableTimeCheck().subscribe((resp) => {

                svcInfo.personSmsDisableTimeCheck = resp;
                console.log('>>[EN/TEST] tw.View.Controller.svcInfo ', svcInfo);
                urlMeta.masking = this.loginService.getMaskingCert(req, svcInfo.svcMgmtNum);
                if ( loginType.indexOf(svcInfo.loginType) !== -1 ) {
                  const urlAuth = urlMeta.auth.grades;
                  const svcGr = svcInfo.svcGr;
                  // admin 정보 입력 오류 (접근권한이 입력되지 않음)
                  if ( urlAuth === '' ) {
                    res.status(404).render('en.error.page-not-found.html', { svcInfo: null, code: res.statusCode });
                    return;
                  }
                  // 영문임시 회선미보유 등록회선없음처리 컨트롤단에서 처리 redis 권한적용후 주석제거.
                  // if ( svcInfo.totalSvcCnt === '0' || svcInfo.expsSvcCnt === '0' ) {
                  //   if ( urlAuth.indexOf('N') !== -1 ) {
                  //     // 준회원 접근 가능한 화면
                  //     this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
                  //   } else {
                  //     // 등록된 회선 없음 + 준회원 접근 안되는 화면
                  //     this.errorNoRegister(req, res, next);
                  //   }
                  // } else 
                  if ( urlAuth.indexOf(svcGr) !== -1 ) {
                    this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
  
                  // 영문임시 관리자 권한 설정후 주석 제거. 2020.10.06 영문 실시간요금 PPS인 경우 controller에서 에러 처리.
                  } else if ( path.indexOf('/myt-fare/bill/hotbill') !== -1 && 'P'.indexOf(svcGr) !== -1  ) {
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
                    res.render('en.error.slogin-fail.html', { target: req.baseUrl + req.url });
                  } else {
                    // ERROR 케이스 (일반로그인에서 권한이 없는 케이스)
                    this.errorAuth(req, res, next);
                  }
                }
            });
           
          } else {
            if ( urlMeta.auth.accessTypes.indexOf(LOGIN_TYPE.NONE) !== -1 ) {
              this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
            } else {
              // login page
              res.render('en.error.login-block.html', { target: req.baseUrl + req.url });
            }
          }
        });
      } else {
        // 등록되지 않은 메뉴
        this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
        return;

        if ( String(process.env.NODE_ENV) === 'prd' || this.noUrlMeta) {
          this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
        } else {
          if ( /\/en\/product\/callplan/.test(path) ) {
            this.render(req, res, next, svcInfo, allSvc, childInfo, urlMeta);
          } else {
            res.status(404).render('en.error.page-not-found.html', { svcInfo: null, code: res.statusCode });
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
    res.render('en.error.no-auth.html');
  }

  /**
   * 회선 없음 오류 페이지
   * @param req
   * @param res
   * @param next
   */
  private errorNoRegister(req, res, next) {
    res.render('en.error.no-register.html');
  }

  /**
   * 페이지 렌더링을 위한 처리 시작
   * @param req
   * @param res
   * @param next
   * @param path
   */
  private renderPage(req, res, next, path) {
    if (this.checkLogin(req)) {

      Observable.combineLatest([
        this.apiService.request(API_CMD.BFF_03_0029, {svcCtg: LINE_NAME.MOBILE  }),
        this.apiService.request(API_CMD.BFF_05_0224, {})
      ]).subscribe(([LineInfo, prodNmInfo]) => {

        let caseType = '00';
        const svcInfo = this.loginService.getSvcInfo(req);
        const allSvc = this.apiService.getAllSvcInfo(req);
        if ( prodNmInfo.code === API_CODE.CODE_00 ) {
          let prodNm = '';
          if ( prodNmInfo.result.basPricList.length !== 0 ) {
            prodNm = prodNmInfo.result.basPricList[0].prodNm;
          } else {
            prodNm = svcInfo.prodNm;
          }

          Object.assign(svcInfo,  {
            prodNmEn: prodNm
          });
        }
        
        let lineCount = 0;
       if ( LineInfo.code === API_CODE.CODE_00 ) { 
          lineCount = ((LineInfo.result) ? LineInfo.result.mCnt : 0);
       }

        if (allSvc) {
          
          if (!allSvc.m || FormatHelper.isEmpty(allSvc.m) ) {
              Object.assign(svcInfo,  {
                  mbrChlId: allSvc.mbrChlId,
                  userId: allSvc.userId,
                  xtUserId: allSvc.xtUserId,
                  totalSvcCnt: (lineCount + '') || '0',
                  expsSvcCnt: '0',
                  nonSvcCnt: (lineCount + '') || '0'
              });          
          } else {
              Object.assign(svcInfo,  {
                mbrChlId: allSvc.mbrChlId,
                userId: allSvc.userId,
                xtUserId: allSvc.xtUserId,
                totalSvcCnt: (allSvc.m.length + lineCount + '') || '0',
                expsSvcCnt: (allSvc.m.length + '') || '0',
                nonSvcCnt: (lineCount + '') || '0'
            });    
          }
        } else {
            Object.assign(svcInfo,  {
              totalSvcCnt: '0',
              expsSvcCnt: '0',
              nonSvcCnt: (lineCount + '') || '0'
          });    
        } 
          if (svcInfo.loginType === 'E') {
          caseType = '01'; // 간편로그인
 
          Object.assign(svcInfo,  {
              caseType: caseType,
              totalSvcCnt: '1',
              expsSvcCnt: '1',
              nonSvcCnt: '0'
          });          
              
        } else {  

          if (svcInfo.expsSvcCnt === '0' && svcInfo.nonSvcCnt === '0' ) {
            caseType = '02';
          } // 회선없음

          if (svcInfo.expsSvcCnt === '0' && svcInfo.nonSvcCnt !== '0' ) {
            caseType = '03';
          } // 회선등록처리 필요


          Object.assign(svcInfo,  {
              caseType: caseType
          });                    
        }
        
        this.getAuth(req, res, next, path, svcInfo, allSvc, null);
        return;

      });
    } else {
      this.getAuth(req, res, next, path, null, null, null);
      return;
    }
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
      res.redirect('/en/common/member/login/cust-pwd?target=' + target);
    } else if ( errorCode === API_LOGIN_ERROR.ICAS3235 ) {   // 휴면계정
      res.redirect('/en/common/member/login/reactive?target=' + target);
    } else if ( errorCode === API_LOGIN_ERROR.ATH1003 ) {
      res.redirect('/en/common/member/login/exceed-fail');
    } else if ( errorCode === API_LOGIN_ERROR.ATH3236 ) {
      res.redirect('/en/common/member/login/lost?target=' + target);
    } else {
      res.redirect('/en/common/member/login/fail?errorCode=' + errorCode);
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
                const blockUrl = findBlock.url || '/en/common/util/service-block';
                res.redirect(blockUrl + '?fromDtm=' + findBlock.fromDtm + '&toDtm=' + findBlock.toDtm);
                return true;
              }
            });
        } else {
          const blockUrl = findBlock.url || '/en/common/util/service-block';
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

