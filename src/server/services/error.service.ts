import { Response } from 'express';
import { API_CODE } from '../types/api-command.type';

class ErrorService {
  static instance;

  constructor() {
    if (ErrorService.instance) {
      return ErrorService.instance;
    }

    ErrorService.instance = this;
  }

  /**
   * @param res
   * @param options
   */
  public render(res: Response, options) {
    return res.render('error.server-error.html', {
      title: options.title || 'Error',
      code: options.code || '',
      msg: options.msg || '',
      svcInfo: options.svcInfo
    });
  }

  /**
   * @param apiArray
   */
  public apiError(apiArray: any): any {
    let errorResult: any = null;

    apiArray.forEach((api) => {
      if (API_CODE.CODE_00 === api.code) {
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
