import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../../services/api.service';

class MyTUsageTRoamingShare extends TwViewController {
    private apiService;

    constructor() {
        super();
        this.apiService = ApiService;
    }

    render(req: Request, res: Response, next: NextFunction) {
        const data = {};

        res.render('usage/myt.usage.troaming-share.html', data);
    }
}

export default MyTUsageTRoamingShare;
