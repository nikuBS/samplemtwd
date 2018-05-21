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

  public request(command: any, params: any): Observable<any> {
    console.log('[API_REQ]', command, params);
    const apiServer = environment[String(process.env.NODE_ENV)][command.server];
    const options = this.getOption(command, params, apiServer);

    return Observable.create((observer) => {
      let req;
      if ( apiServer.protocol === API_PROTOCOL.HTTPS ) {
        req = https.request(options, this.apiCallback.bind(this, observer));
      } else if ( apiServer.protocol === API_PROTOCOL.HTTP ) {
        req = http.request(options, this.apiCallback.bind(this, observer));
      } else {
        console.log('Wrong server info');
      }

      req.on('error', this.handleError.bind(this, observer));
      req.write(JSON.stringify(params));
      req.end();
    });
  }

  private getOption(command: any, params: any, apiServer: any): any {
    const path = command.method === API_METHOD.GET ?
      command.path + ParamsHelper.setQueryParams(params) : command.path;
    return {
      hostname: apiServer.url,
      port: apiServer.port,
      path: path,
      method: command.method,
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    };
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
        console.log('JSON parse error');
        respData = data;
      }
      observer.next(respData);
      observer.complete();


    });
  }

  private handleError(observer, err) {
    console.log('[API_ERR]', err);
    observer.error(err);

  }
}

export default new ApiService();
