/**
 * FileName: recharge.gift.history.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.02
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../types/api-command.type';


class PaymentHistoryController extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const dummy = {
      'code': '00',
      'msg': 'success',
      'result': {
        'custTel': '01011112222',
        'custName': '김모씨',
        'MCG_OUT': {
          'REC_CNT': '00001',
          'REC_CNT1': '00002',
          'REC_CNT2': '00001',
          'REC_CNT3': '00002',
          'REP_YN': 'Y',
          'AUTO_TRNSF_YN': 'Y',
          'MT_YN': 'N',
          'record': [
            {
              'OP_DT': '20180409',
              'PAY_AMT': '000000000026790',
              'INV_DT': '20170831',
              'INV_AMT': '000000000026790',
              'PAY_MTHD_CD': '20',
              'SVC_CNT': '001'
            },
            {
              'OP_DT': '20180315',
              'PAY_AMT': '000000000027380',
              'INV_DT': '20170731',
              'INV_AMT': '000000000027380',
              'PAY_MTHD_CD': '20',
              'SVC_CNT': '001'
            }
          ],
          'record2': [
            {
              'SVC_MGMT_NUM': '7221434806',
              'SVC_CD': 'C',
              'BAMT_CL_CD': 'A01',
              'OP_DT1': '20171120',
              'SVC_BAMT': '000000000102810',
              'EFF_STA_DT': '20180611',
              'RFND_BANK_CD': '004',
              'RFND_BANK_NM': '국민은행',
              'RFND_BANK_NUM': '2743************',
              'RFND_DPSTR_NM': '김화진'
            }
          ],
          'record3': [
            {
              'RFND_REQ_DT': '20171120',
              'OVR_PAY': '000000000102810',
              'RFND_OBJ_AMT': '000000000102810',
              'SUM_AMT': '000000000102810',
              'EFF_STA_DT': '20171120',
              'BANK_CD': '004',
              'RFND_BANK_NM': '국민은행',
              'RFND_BANK_NUM': '김모씨',
              'MSG': '결과메시지~~'
            },
            {
              'RFND_REQ_DT': '20171120',
              'OVR_PAY': '000000000102810',
              'RFND_OBJ_AMT': '000000000102810',
              'SUM_AMT': '000000000102810',
              'EFF_STA_DT': '20171120',
              'BANK_CD': '004',
              'RFND_BANK_NM': '국민은행',
              'RFND_BANK_NUM': '김모씨',
              'MSG': '결과메시지~~'
            }
          ]
        }
      }
    };

    console.log(dummy);

    res.render('payment.history.html', {});
  }

}


export default PaymentHistoryController;
