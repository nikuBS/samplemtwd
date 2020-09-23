import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Response} from 'express';

export abstract class RoamingController extends TwViewController {
  protected setDeadline(res: Response, milliseconds: number = 5000) {
    const timerHandle = setTimeout(() => {
      if (!res.headersSent) {
        res.sendStatus(500);
      }
    }, milliseconds);
    res.locals.deadline = timerHandle;
  }

  protected renderDeadline(res: Response, template: string, context: Object) {
    this.releaseDeadline(res);
    res.render(template, context);
  }

  protected releaseDeadline(res: Response) {
    if (res.locals.deadline) {
      clearTimeout(res.locals.deadline);
    }
  }
}
