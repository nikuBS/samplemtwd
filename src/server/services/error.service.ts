import { Response } from 'express';
import { API_CODE } from '../types/api-command.type';
import FormatHelper from '../utils/format.helper';

interface ErrorOptions {
  title?: string;
  code?: any;
  msg?: any;
  isBackCheck?: boolean;
  svcInfo: any;
  pageInfo?: any;
}

class ErrorService {
  static instance;

  constructor() {
    if ( ErrorService.instance ) {
      return ErrorService.instance;
    }

    ErrorService.instance = this;
  }

  /**
   * @param res
   * @param options
   */
  public render(res: Response, options: ErrorOptions): any {
    return res.render('error.server-error.html', {
      title: options.title || 'Error',
      code: options.code || '',
      msg: this._replaceBreakLines(options.msg) || '',
      svcInfo: options.svcInfo || null,
      isBackCheck: options.isBackCheck || false,
      pageInfo: options.pageInfo
    });
  }

  /**
   * @param msg
   * @private
   */
  private _replaceBreakLines(msg: any): any {
    if (FormatHelper.isEmpty(msg)) {
      return '';
    }

    return msg.replace(/\\n/g, '<br>');
  }

  /**
   * @param apiArray
   */
  public apiError(apiArray: any): any {
    let errorResult: any = null;

    apiArray.forEach((api) => {
      if ( API_CODE.CODE_00 === api.code ) {
        return true;
      }

      errorResult = {
        code: api.code,
        msg: api.msg
      };

      return false;
    });

    return errorResult;
  }
}

export default ErrorService;
