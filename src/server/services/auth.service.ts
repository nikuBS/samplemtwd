import LoginService from './login.service';
import RedisService from './redis.service';
import FormatHelper from '../utils/format.helper';
import { REDIS_URL_META } from '../types/common.type';
import { Observable } from 'rxjs/Observable';
import LoggerService from './logger.service';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import { API_CODE } from '../types/api-command.type';

class AuthService {
  private loginService: LoginService = new LoginService();
  private redisService: RedisService = new RedisService();
  private logger: LoggerService = new LoggerService();

  constructor() {

  }

  public setCert(req, res, params): Observable<any> {
    this.loginService.setCurrentReq(req, res);
    return this.redisService.getData(REDIS_URL_META + params.url)
      .switchMap((resp) => this.setCertUrl(resp, params.url))
      .map((resp) => {
        return { code: API_CODE.CODE_00, result: resp };
      });
  }

  public getUrlMeta(req, res, method): Observable<any> {
    this.loginService.setCurrentReq(req, res);
    const path = req.baseUrl + req.path;
    return this.redisService.getData(REDIS_URL_META + method + '|' + path).map((resp) => {
      const params = {
        cert: this.checkCertUrl(resp, path),
        url: path,
        svcInfo: this.loginService.getSvcInfo(),
        urlMeta: resp
      };
      return params;
    });
  }

  private checkCertUrl(urlMeta, url): boolean {
    if ( !FormatHelper.isEmpty(urlMeta) && !FormatHelper.isEmpty(urlMeta.auth) && !FormatHelper.isEmpty(urlMeta.auth.cert) ) {
      const userCert = this.loginService.getSelectedUserCert();
      this.logger.debug(this, '[checkRequest]', url, userCert);
      if ( FormatHelper.isEmpty(userCert) ) {
        return true;
      } else {
        if ( userCert.request === url ) {
          this.setCertUrl(urlMeta, '').subscribe();
          return false;
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  }

  private setCertUrl(urlMeta, url): Observable<any> {
    this.logger.debug(this, '[setCertUrl]', url, urlMeta);
    const selectedUserCert = this.loginService.getSelectedUserCert();
    let changedUserCert = {};
    if ( FormatHelper.isEmpty(selectedUserCert) ) {
      changedUserCert = { request: url };
    } else {
      changedUserCert = Object.assign(selectedUserCert, {
        request: url
      });
    }
    return this.loginService.setUserCert(changedUserCert);
  }

}

export default AuthService;
