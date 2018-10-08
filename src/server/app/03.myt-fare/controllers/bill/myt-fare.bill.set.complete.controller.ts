import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class MyTFareBillSetComplete extends TwViewController {

  constructor() {
    super();
  }


  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const data = {
      type : req.query.type
    };
    res.render( 'bill/myt-fare.bill.set.complete.html', {data : data} );
  }
}

export default MyTFareBillSetComplete;
