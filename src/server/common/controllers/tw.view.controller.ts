import { API_CMD } from '../../types/api-command.type';
import ApiService from '../../services/api.service';

abstract class TwViewController {
  private _apiService;

  constructor() {
    this._apiService = ApiService;
  }

  abstract render(req: any, res: any, next: any): void;

  get apiService(): any {
    return this._apiService;
  }

  public checkLogin(req: any, res: any, next: any) {
    this.apiService.request(API_CMD.TEST_LOGIN, { userId: 'thanatosv' })
      .subscribe((resp) => {
        console.log(resp);
      });
    this.render(req, res, next);
  }
}

export default TwViewController;
