/**
 * FileName: myt-fare.payment.card.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class MytFarePaymentCard extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    res.render( 'payment/myt-fare.payment.card.html', {} );
  }

}

export default MytFarePaymentCard;
