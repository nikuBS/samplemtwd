abstract class Controller {
  constructor() {
  }

  abstract render(req: any, res: any, next: any): void;
}

export default Controller;