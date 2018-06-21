/**
 * FileName: recharge.gift.history.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.06.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import moment from 'moment';

class RechargeGiftHistory extends TwViewController {
  data: any;

  constructor() {
    super();
  }

  public getMobileLineList() {
    return this.apiService.request(API_CMD.BFF_03_0003, {svcCtg: 'M'});
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // TODO : 회선 정보 가져오기, 선물 내역, 조르기 내역 가져오기(client async)
    // TODO : 검색 설정에 따른 결과 가져오기(client async)
    // TODO : 조르기 내역 삭제(client async)
    // this.logger.info(this, moment().add(-3, 'months').format('YYYYMMDD'));


    // this.apiService.request(API_CMD.BFF_06_0018, {
    //   'fromDt': moment().format('YYYYMMDD'),
    //   'toDt': moment().add(-3, 'months').format('YYYYMMDD'),
    //   'giftType': 0
    // }).subscribe((response) => {
    //   // this.data = response.result;
    //   this.data = response.result.length ? response.result : MyTGiftHistoryData.result;

    const dateSpectrum = [
      moment().format('YYYYMMDD'),
      moment().add(-1, 'months').format('YYYYMMDD'),
      moment().add(-3, 'months').format('YYYYMMDD'),
      moment().add(-6, 'months').format('YYYYMMDD'),
      moment().add(-12, 'months').format('YYYYMMDD')
    ];

    // });
    this.getMobileLineList()
        .subscribe((response) => {

          // console.log('svcInfo' , svcInfo);
          res.render('gift/recharge.gift.history.html', {
            lineList: response.result,
            svcInfo: svcInfo,
            dateList: dateSpectrum
          });
        });

  }
}

export default RechargeGiftHistory;
