import TwViewController from '../../../common/controllers/tw.view.controller';

class ProductMobileDetailController extends TwViewController {
  constructor() {
    super();
  }

  render(req: any, res: any, next: any) {
    res.render('product.mobile-detail.html', {
      user: req.params.id
    });
  }


}

export default ProductMobileDetailController;
