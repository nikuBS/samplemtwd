/**
 * @file chatbot.counsel.controller.ts
 * @author P069509
 * @since 2020.06.18
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class ChatbotCounselController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('chatbot.counsel.html', { svcInfo: svcInfo });
  }
}
