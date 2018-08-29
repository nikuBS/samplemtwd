import LoginService from './login.service';
import RedisService from './redis.service';
import { AUTH_CERTIFICATION_SCOPE } from '../types/bff.type';
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

  public setCert(req, params): Observable<any> {
    return this.redisService.getData(REDIS_URL_META + params.url)
      .switchMap((resp) => this.setCertUrl(resp, params.url))
      .map((resp) => {
        return { code: API_CODE.CODE_00, result: resp };
      });
  }

  public getUrlMeta(req): Observable<any> {
    const path = req.baseUrl + req.path;
    return this.redisService.getData(REDIS_URL_META + path).map((resp) => {
      const params = {
        cert: this.checkCertUrl(resp, path),
        url: path,
        svcInfo: this.loginService.getSvcInfo(),
        urlMeta: resp
      };
      console.log(params);
      return params;
    });
  }


  private checkCertUrl(urlMeta, url): boolean {
    if ( !FormatHelper.isEmpty(urlMeta) && !FormatHelper.isEmpty(urlMeta.auth) && !FormatHelper.isEmpty(urlMeta.auth.cert) ) {
      const cert = urlMeta.auth.cert;
      switch ( cert.scope ) {
        case AUTH_CERTIFICATION_SCOPE.REQUEST:
          return this.checkRequest(urlMeta, url);
        case AUTH_CERTIFICATION_SCOPE.CHILD:
          return this.checkChild(urlMeta);
        case AUTH_CERTIFICATION_SCOPE.GROUP:
          return this.checkGroup(urlMeta);
        case AUTH_CERTIFICATION_SCOPE.PAGE:
          return this.checkPage(urlMeta);
        case AUTH_CERTIFICATION_SCOPE.SESSION:
          return this.checkSession(urlMeta);
        default:
          return false;
      }
    }
    return false;
  }

  private checkRequest(urlMeta, url): boolean {
    const userCert = this.loginService.getSelectedUserCert();
    if ( FormatHelper.isEmpty(userCert) ) {
      return true;
    } else {
      if ( userCert.request === url ) {
        this.setCertUrl(urlMeta, '');
        return false;
      } else {
        return true;
      }
    }
  }

  private checkChild(urlMeta): boolean {
    return false;
  }

  private checkGroup(urlMeta): boolean {
    return false;
  }

  private checkPage(urlMeta): boolean {
    return false;
  }

  private checkSession(urlMeta): boolean {
    return false;
  }

  private setCertUrl(urlMeta, url): Observable<any> {
    if ( !FormatHelper.isEmpty(urlMeta) && !FormatHelper.isEmpty(urlMeta.auth) && !FormatHelper.isEmpty(urlMeta.auth.cert) ) {
      const cert = urlMeta.auth.cert;
      switch ( cert.scope ) {
        case AUTH_CERTIFICATION_SCOPE.REQUEST:
          return this.setCertRequest(urlMeta, url);
        case AUTH_CERTIFICATION_SCOPE.CHILD:
          return this.setCertChild(urlMeta, url);
        case AUTH_CERTIFICATION_SCOPE.GROUP:
          return this.setCertGroup(urlMeta, url);
        case AUTH_CERTIFICATION_SCOPE.PAGE:
          return this.setCertPage(urlMeta, url);
        case AUTH_CERTIFICATION_SCOPE.SESSION:
          return this.setCertSession(urlMeta, url);
        default:
          return Observable.of();
      }
    }
    return Observable.of();
  }

  private setCertRequest(urlMeta, url): Observable<any> {
    const selectedUserCert = this.loginService.getSelectedUserCert()
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

  private setCertChild(urlMeta, url): Observable<any> {
    return Observable.of();
  }

  private setCertGroup(urlMeta, url): Observable<any> {
    return Observable.of();
  }

  private setCertPage(urlMeta, url): Observable<any> {
    return Observable.of();
  }

  private setCertSession(urlMeta, url): Observable<any> {
    return Observable.of();
  }

}

export default AuthService;
