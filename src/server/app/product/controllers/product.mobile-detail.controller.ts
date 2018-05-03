import Controller from '../../common/controllers/controller';

class ProductMobileDetailController extends Controller{
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