import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../types/api-command.type';
import ApiService from '../../services/api.service';

abstract class TwViewController {
  private _apiService;

  constructor() {
    this._apiService = ApiService;
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any): void;

  get apiService(): any {
    return this._apiService;
  }

  public checkLogin(req: any, res: any, next: any) {
    const userId = req.query.userId;
    this.apiService.request(API_CMD.BFF_03_0001, { userId: userId }).subscribe((resp) => {
      this.render(req, res, next, resp.header);
    });
  }
}

export default TwViewController;
