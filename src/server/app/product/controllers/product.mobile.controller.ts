import Controller from '../../common/controllers/controller';
import ProductMobileModel from '../models/product.mobile.model';
import { Request, Response, NextFunction } from 'express';

class ProductMobileController extends Controller{
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    res.render('product.mobile.html', new ProductMobileModel());
    // res.render(__dirname + '../views/containers/product.mobile.html');
  }
}

export default ProductMobileController;