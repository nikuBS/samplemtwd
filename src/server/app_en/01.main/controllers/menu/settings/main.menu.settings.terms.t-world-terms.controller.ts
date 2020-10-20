import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common_en/controllers/tw.view.controller';


export default class MainMenuSettingsTworldTerms extends TwViewController {
    constructor() {
        super();
    }

    render(req: Request, res: Response, next: NextFunction, svcInfo: any,
        allSvc: any, childInfo: any, pageInfo: any) {
        res.render(`menu/settings/en.main.menu.settings.terms.t-world-terms.html`, {svcInfo, pageInfo});
    }
}
