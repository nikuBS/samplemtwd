/**
 * 로밍 컨트롤러 추상 클래스.
 *
 * 특정 시간(기본값 5초)안에 render 시작하지 않으면 오류로 간주한다.
 * BE 응답이 느린 경우를 대응하기 보다, 프로그래밍 오류로 render를 타지 못한 케이스를 방지하는 것이 목표.
 */
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
      // 정상 render의 경우 불필요한 timerHandle 이 누적되지 않게 한다.
      clearTimeout(res.locals.deadline);
    }
  }
}
