import Controller from '../../common/controllers/controller';

class UserDetailController extends Controller{
  constructor() {
    super();
  }

  render(req: any, res: any, next: any) {
    res.render('user-detail.html', {
      user: req.params.id
    });
  }


}

export default UserDetailController;