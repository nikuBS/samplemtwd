import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class MyTFarePayment extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    res.render( 'payment/myt-fare.payment.html', {} );
  }

}

export default MyTFarePayment;
