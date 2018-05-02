import Controller from '../../common/controllers/controller';

class UserController extends Controller{
  constructor() {
    super();
  }

  render(req: any, res: any, next: any) {
    res.render('user.html', {
      user: 'aaa'
    });
  }
}

export default UserController;