import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD, API_CODE, API_LOGIN_ERROR, API_SVC_PWD_ERROR } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import { URL } from '../../types/url.type';
import FormatHelper from '../../utils/format.helper';
import { COOKIE_KEY } from '../../types/common.type';
import BrowserHelper from '../../utils/browser.helper';
import { Observable } from 'rxjs/Observable';
import { CHANNEL_TYPE } from '../../types/common.type';


abstract class TwViewController {
  private _apiService: ApiService;
  private _loginService: LoginService;
  private _logger: LoggerService;

  constructor() {
    this._apiService = new ApiService();
    this._loginService = new LoginService();
    this._logger = new LoggerService();
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void;

  protected get apiService(): ApiService {
    return this._apiService;
  }

  protected get loginService(): LoginService {
    return this._loginService;
  }

  protected get logger(): LoggerService {
    return this._logger;
  }

  public initPage(req: any, res: any, next: any): void {
    const path = req.baseUrl + (req.path !== '/' ? req.path : '');
    const tokenId = req.query.id_token;
    const userId = req.query.userId;

    this._loginService.setCurrentReq(req, res);
    this.setChannel(req, res)
      .subscribe((resp) => {
        if ( this.checkLogin(req.session) ) {
          this.sessionLogin(req, res, next);
        } else {
          if ( this.existId(tokenId, userId) ) {
            this.login(req, res, next, tokenId, userId);
          } else {
            this.routePage(req, res, next, path);
          }
        }
      });
  }

  private login(req, res, next, tokenId, userId) {
    if ( !FormatHelper.isEmpty(tokenId) ) {
      // TID login
      this.apiService.requestLoginTid(tokenId, req.query.stateVal).subscribe((resp) => {
        this.render(req, res, next, this._loginService.getSvcInfo(), resp.noticeTpyCd);
      }, (error) => {
        // 로그인 실패
        if ( error.code === API_LOGIN_ERROR.ICAS3228 ) {
          // 고객보호비밀번호
          res.redirect('/auth/login/customer-pwd');
        } else if ( error.code === API_LOGIN_ERROR.ICAS3235 ) {
          // 휴면계정
          res.redirect('/auth/login/dormancy');
        } else if ( error.code === API_LOGIN_ERROR.ATH1003 ) {
          res.redirect('/auth/login/exceed-fail');
        } else {
          res.redirect('/auth/login/fail?errorCode=' + error.code);
        }
      });
    } else {
      // TEST login
      this.apiService.requestLoginTest(userId).subscribe((resp) => {
        this.render(req, res, next, this._loginService.getSvcInfo(), resp.noticeTpyCd);
      }, (error) => {
        // 로그인 실패
        if ( error.code === API_LOGIN_ERROR.ICAS3228 ) {
          // 고객보호비밀번호
          res.redirect('/auth/login/customer-pwd');
        } else if ( error.code === API_LOGIN_ERROR.ICAS3235 ) {
          // 휴면계정
          res.redirect('/auth/login/dormancy');
        } else if ( error.code === API_LOGIN_ERROR.ATH1003 ) {
          res.redirect('/auth/login/exceed-fail');
        } else {
          res.redirect('/auth/login/fail?errorCode=' + error.code);
        }
      });
    }
  }

  private existId(tokenId: string, userId: string) {
    return !(FormatHelper.isEmpty(tokenId) && FormatHelper.isEmpty(userId));
  }

  private checkLogin(session): boolean {
    return this._loginService.isLogin(session);
  }

  private sessionLogin(req, res, next) {
    this._logger.info(this, '[Session Login]', this._loginService.getSvcInfo());
    this.render(req, res, next, this._loginService.getSvcInfo());
  }

  private routePage(req, res, next, path) {
    if ( this._loginService.isNewSession() ) {
      if ( URL[path].login ) {
        res.send('need login');
      } else {
        this.render(req, res, next);
      }
    } else {
      const loginYn = req.cookies[COOKIE_KEY.TWM_LOGIN];
      if ( !FormatHelper.isEmpty(loginYn) && loginYn === 'Y' ) {
        this._logger.info(this, '[Session expired]');
        res.clearCookie(COOKIE_KEY.TWM_LOGIN);
        res.redirect('/auth/logout/expire');
      } else {
        this._logger.info(this, '[Session empty]');
        if ( URL[path].login ) {
          res.send('need login');
        } else {
          this.render(req, res, next);
        }
      }
    }
  }

  private setChannel(req, res): Observable<any> {
    const channel = BrowserHelper.isApp(req) ? CHANNEL_TYPE.MOBILE_APP : CHANNEL_TYPE.MOBILE_WEB;
    this.logger.info(this, '[set cookie]', channel);
    return this._loginService.setChannel(channel);
  }

  private checkError(error: string, errorMessage: string) {
    return !FormatHelper.isEmpty(error);

  }

  private renderError(req: Request, res: Response, next: NextFunction, message: any) {
    res.send(message);
  }
}

export default TwViewController;
