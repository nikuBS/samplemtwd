import TwViewController from '../../../common/controllers/tw.view.controller';
import ProductMobileModel from '../models/product.mobile.model';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';

class ProductMobile extends TwViewController {
  constructor() {
    super();
  }

  render(req, res: Response, next: NextFunction) {
    res.render('product.mobile.html', new ProductMobileModel());
  }
}

export default ProductMobile;
