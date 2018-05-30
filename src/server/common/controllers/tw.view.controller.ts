abstract class TwViewController {
  checkLogin(req: any, res: any, next: any) {
    this.render(req, res, next);
  }

  abstract render(req: any, res: any, next: any): void;
}

export default TwViewController;
