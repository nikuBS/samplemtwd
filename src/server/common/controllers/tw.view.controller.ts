import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD, API_CODE } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import { SvcInfoModel } from '../../models/svc-info.model';
import { URL } from '../../types/url.type';
import FormatHelper from '../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';


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

  protected get apiService(): any {
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

    this.loginService.setClientSession(req.session);

    if ( this.existId(tokenId, userId) ) {
      this.login(req, res, next, tokenId, userId);
    } else {
      if ( URL[path].login ) {
        this.goSessionLogin(req, res, next);
      } else {
        this.render(req, res, next);
      }
    }
  }

  private login(req, res, next, tokenId, userId) {
    if ( !FormatHelper.isEmpty(tokenId) ) {
      // TID login
      this.tidLogin(req, res, next, tokenId);
    } else {
      // TEST login
      this.testLogin(req, res, next, userId);
    }
  }

  private existId(tokenId: string, userId: string) {
    return !(FormatHelper.isEmpty(tokenId) && FormatHelper.isEmpty(userId));
  }

  private checkLogin(userId: string): boolean {
    return this.loginService.isLogin(userId);
  }

  private testLogin(req, res, next, userId) {
    this.goTestLogin(userId).subscribe((resp) => {
      this.render(req, res, next, new SvcInfoModel(resp), resp.noticeTpyCd);
    }, (error) => {
      // 로그인 실패
      console.log('error', error);
    });
  }

  private tidLogin(req, res, next, tokenId) {
    this.goTidLogin(tokenId, req.query.state).subscribe((resp) => {
      this.render(req, res, next, new SvcInfoModel(resp), resp.noticeTpyCd);
    }, (error) => {
      // 로그인 실패
      console.log('error', error);
    });
  }

  private goTestLogin(userId): Observable<any> {
    let loginData = null;
    return this._apiService.request(API_CMD.BFF_03_0001, { id: userId })
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          loginData = resp.result;
          return this._apiService.request(API_CMD.BFF_01_0005, {});
        } else {
          throw resp.code;
        }
      }).map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;
          Object.assign(result, loginData);
          return result;
        } else {
          throw resp.code;
        }
      });
  }

  private goTidLogin(tokenId, state): Observable<any> {
    let loginData = null;
    const params = {
      token: tokenId,
      state: state
    };
    return this._apiService.request(API_CMD.BFF_03_0008, params)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          loginData = resp.result;
          return this._apiService.request(API_CMD.BFF_01_0005, {});
        } else {
          throw resp.code;
        }
      }).map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;
          Object.assign(result, loginData);
          return result;
        } else {
          throw resp.code;
        }
      });
  }

  private goSessionLogin(req, res, next) {
    if ( this.checkLogin('') ) {
      this.render(req, res, next, this._loginService.getSvcInfo());
    } else {
      // 세션 만료
      res.send('session expiration');
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
