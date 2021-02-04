/**
 * MenuName: 나의 요금 > 서브메인 (서비스 공통)
 * @file myt-fare.submain.common.service.ts
 * @author 양정규
 * @since 2020.12.30
 *
 */
import ApiService from '../../../../services/api.service';
import LoggerService from '../../../../services/logger.service';
import {Request, Response} from 'express';
import ErrorService from '../../../../services/error.service';

interface Info {
  pageInfo: any;
  childInfo: any;
  allSvc: any;
  svcInfo: any;
  reqQuery: any;
}
export default abstract class MytFareSubmainCommonService {
  private readonly _apiService: ApiService;
  private readonly _logger: LoggerService;
  private readonly _error: ErrorService;
  private _info;

  constructor(req: Request, res: Response, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    this._apiService = new ApiService();
    this._apiService.setCurrentReq(req, res);
    this._apiService.setTimeout(7000);
    this._logger = new LoggerService();
    this._error = new ErrorService();
    this.info = {
      svcInfo,
      reqQuery: req.query,
      allSvc,
      childInfo,
      pageInfo
    };
  }

  protected get info(): Info {
    return this._info;
  }

  protected set info(value: Info) {
    this._info = value;
  }

  protected get apiService(): ApiService {
    return this._apiService;
  }

  protected get logger(): LoggerService {
    return this._logger;
  }

  protected get error(): ErrorService {
    return this._error;
  }

}
