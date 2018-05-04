abstract class TwViewController {
  constructor() {
  }

  abstract render(req: any, res: any, next: any): void;
}

export default TwViewController;
