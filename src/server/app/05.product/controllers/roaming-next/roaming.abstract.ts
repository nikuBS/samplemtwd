/**
 * @desc 로밍 컨트롤러 추상 클래스.
 * @since 2020-09-24
 * @author 황장호
 *
 * 특정 시간(기본값 5초)안에 render 시작하지 않으면 오류로 간주한다.
 * BE 응답이 느린 경우를 대응하기 보다, 프로그래밍 오류로 render를 타지 못한 케이스를 방지하는 것이 목표.
 *
 * 기본적으로 완벽한 코드를 작성했다면 불필요한 클래스이므로 추후 삭제하여도 무방하다.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Response} from 'express';

export abstract class RoamingController extends TwViewController {
  protected setDeadline(res: Response, milliseconds: number = 5000) {
    const timerHandle = setTimeout(() => {
      // HTTP 응답 헤더가 발송되기 전까지의 시간만 체크하므로, 고객의 인터넷 속도가 느리더라도 무관하다.
      if (!res.headersSent) {
        res.sendStatus(500);
      }
    }, milliseconds);
    // Express Response 의 `locals` 공간에 deadline 이름으로 Timer handle을 넣어둔다.
    // 여기서 넣어둔 timerHandle은 아래 `releaseDeadline`에서 참조하게 된다.
    res.locals.deadline = timerHandle;
  }

  protected renderDeadline(res: Response, template: string, context: Object) {
    this.releaseDeadline(res);
    res.render(template, context);
  }

  protected releaseDeadline(res: Response) {
    // 만약 Response.locals에 deadline이 걸려 있었다면 이를 해제한다.
    if (res.locals.deadline) {
      // 정상 render의 경우 불필요한 timerHandle이 누적되지 않게 한다.
      clearTimeout(res.locals.deadline);
    }
  }
}
