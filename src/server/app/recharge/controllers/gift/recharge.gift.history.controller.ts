import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../../types/api-command.type';

// import moment from 'moment';

class RechargeGiftHistory extends TwViewController {
  private dummyData = {
    'code': '00',
    'msg': 'success',
    'result': [
      {
        'opDtm': '20170701',
        'dataQty': '1024',
        'custName': '김*진',
        'svcNum': '01062**50**',
        'giftType': '1',
        'regularGiftType': 'G1'
      }
    ]
  };

  constructor() {
    super();
  }

  public getMobileLineList() {
    return this.apiService.request(API_CMD.BFF_03_0003, {svcCtg: 'M'});
  }

  // private getMonthRangeFormat() {
  //   return
  // }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // TODO : 회선 정보 가져오기, 선물 내역, 조르기 내역 가져오기(client async)
    // TODO : 검색 설정에 따른 결과 가져오기(client async)
    // TODO : 조르기 내역 삭제(client async)
    // this.logger.info(this, moment().add(-3, 'months').format('YYYYMMDD'));


    // this.apiService.request(API_CMD.BFF_06_0018, {
    //   'fromDt': '20180414',
    //   'toDt': '20180614',
    //   'giftType': 0
    // }).subscribe((response) => {
    //
    //
    // });


    this.getMobileLineList()
        .subscribe((response) => {
          res.render('gift/gift.history.html', {lineList: response.result, svcInfo: svcInfo, dummy : this.dummyData.result});
        });
  }
}

export default RechargeGiftHistory;
