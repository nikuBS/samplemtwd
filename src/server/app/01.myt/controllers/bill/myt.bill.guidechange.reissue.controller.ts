/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.07.02
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class MyTBillReissue extends TwViewController {
    constructor() {
        super();
    }

    render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
        // home.main.sprint3 참조
        Observable.combineLatest(
            this.getReissueData()
        ).subscribe(([reissueData]) => {
            const data = {
                reissueData
            };
            res.render('bill/myt.bill.guidechange.reissue.html', data);
        });
    }

    private getReissueData(): Observable<any> {
        // const reissueData = {};
        return this.apiService.request(API_CMD.BFF_05_0028, {}).map((resp) => {
            // 바로 받은 response 값은 확인 후 사용하지 않고 필요한 내용 추출하여 사용 예정
            // return reissueData;
            return resp;
        });
    }

}

export default MyTBillReissue;
