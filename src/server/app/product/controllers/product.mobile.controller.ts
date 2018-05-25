import TwViewController from '../../../common/controllers/tw.view.controller';
import ProductMobileModel from '../models/product.mobile.model';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../services/api.service';
import { API_CMD } from '../../../types/api-command.type';

class ProductMobileController extends TwViewController {
  constructor(private apiService = ApiService) {
    super();
  }

  render(req: { useragent }, res: Response, next: NextFunction) {
    console.log(req.useragent);
    this.apiService.request(API_CMD.FAKE_POST, {
      title: 'foo',
      body: 'bar',
      userId: 1
    }).subscribe((resp) => {
      console.log('subscribe', resp);
    });
    res.render('product.mobile.html', new ProductMobileModel());
  }
}

export default ProductMobileController;
