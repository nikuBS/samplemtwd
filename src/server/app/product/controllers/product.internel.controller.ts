import Controller from '../../common/controllers/controller';

class ProductInternelController extends Controller{
  constructor() {
    super();
  }

  render(req: any, res: any, next: any) {
    res.render('product.internet.html', {
      user: 'aaa'
    });
  }
}

export default ProductInternelController;