import http from 'http';
import https from 'https';
import { Observable } from 'rxjs/Observable';
import environment from '../config/environment.config';
import { API_METHOD, API_PROTOCOL } from '../types/api-command.type';
import ParamsHelper from '../utils/params.helper';

class ApiService {
  static instance;

  constructor() {
    if ( ApiService.instance ) {
      return ApiService.instance;
    }

    ApiService.instance = this;
  }

  public request(command: any, params: any, ...args: any[]): Observable<any> {
    console.log('[API_REQ]', command, params);
    const apiServer = environment[String(process.env.NODE_ENV)][command.server];
    const options = this.getOption(command, apiServer, params, args);

    return Observable.create((observer) => {
      let req;
      if ( apiServer.protocol === API_PROTOCOL.HTTPS ) {
        req = https.request(options, this.apiCallback.bind(this, observer));
      } else if ( apiServer.protocol === API_PROTOCOL.HTTP ) {
        req = http.request(options, this.apiCallback.bind(this, observer));
      } else {
        console.warn('Wrong server info');
      }

      req.on('error', this.handleError.bind(this, observer));
      req.write(JSON.stringify(params));
      req.end();
    });
  }

  private getOption(command: any, apiServer: any, params: any, args: any[]): any {
    return {
      hostname: apiServer.url,
      port: apiServer.port,
      path: this.makePath(command.path, command.method, params, args),
      method: command.method,
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    };
  }

  private makePath(path: string, method: API_METHOD, params: any, args: any[]): string {
    if ( args.length > 0 ) {
      args.map((argument, index) => {
        path = path.replace(`{args[${index}]}`, argument);
      });
    }
    path = method === API_METHOD.GET ? path + ParamsHelper.setQueryParams(params) : path;
    return path;
  }

  private apiCallback(observer, resp) {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      console.log('[API_RESP]', data);
      let respData;
      try {
        respData = JSON.parse(data);
      } catch ( err ) {
        console.warn('JSON parse error');
        respData = data;
      }
      observer.next(respData);
      observer.complete();
    });
  }

  private handleError(observer, err) {
    console.error('[API_ERR]', err);
    observer.error(err);
  }
}

export default new ApiService();
