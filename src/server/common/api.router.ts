import express, { NextFunction, Request, Response, Router } from 'express';

class ApiRouter {
  public router: Router;

  constructor() {
    this.router = express.Router();
    this.setApi();
  }

  private setApi() {
    this.router.get('/environment', this.getEnvironment.bind(this));
  }

  private getEnvironment(req: Request, res: Response, next: NextFunction) {
    const resp = {
      environment: process.env.NODE_ENV
    };
    res.json(resp);
  }
}

export default ApiRouter;
