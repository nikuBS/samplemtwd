import ApiService from './api.service';
import { API_CMD } from '../types/api-command.type';

class LineService {
  private apiService = new ApiService();

  public getMobileLineList() {
    return this.apiService.request(API_CMD.BFF_03_0003, { svcCtg: 'M' });
  }
}

export default LineService;
