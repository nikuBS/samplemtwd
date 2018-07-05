/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.07.02
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class MyTBillReissue extends TwViewController {
    constructor() {
        super();
    }

    render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

        this.renderView(res, 'bill/myt.bill.guidechange.reissue.html', {});
    }

    public renderView(res: Response, view: string, data: any): any {
        // TODO error check
        res.render(view, data);
    }

}

export default MyTBillReissue;
