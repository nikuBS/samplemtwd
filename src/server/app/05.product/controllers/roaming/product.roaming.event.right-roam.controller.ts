/**
 * MenuName: T로밍 > 이벤트 > 바른 로밍 (N_promotion_landing_page1)
 * @file product.roaming.event.right-roam.controller
 * @author Hyeryoun Lee
 * @since 2019. 7. 29.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class ProductRoamingEventRightRoam extends TwViewController {

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('roaming/product.roaming.event.right-roam.html', { svcInfo , pageInfo});
  }
}
