/**
 * @file customer.faq.do-like-this.controller.ts
 * @author Hakjoon sim (hakjoon.sim@sk.com)
 * @since 2018.12.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';

class CustomerFaqDoLikeThis extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {
    const id = req.query.id;
    this.getContent(res, svcInfo, pageInfo, id).subscribe(
      (content) => {
        if (!FormatHelper.isEmpty(content)) {
          res.render('faq/customer.faq.do-like-this.html', {
            svcInfo, pageInfo, content
          });
        }
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          pageInfo,
          svcInfo
        });
      }
    );
  }

  private getContent(res: Response, svcInfo: any, pageInfo: any, id: string): Observable<any> {
    // return this.apiService.request(API_CMD.BFF_08_0053, { mtwdBltn1CntsId: id }).map((resp) => {
    return this.apiService.request(API_CMD.BFF_08_0064, {}, null, [id]).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        this.apiService.request(API_CMD.BFF_08_0065, {}, null, [id]);
        // return resp.result.cntsCtt;
        // return resp.result.icntsCtt;
        return EnvHelper.replaceCdnUrl(resp.result.icntsCtt);


        /*
        return EnvHelper.replaceCdnUrl(`<div class="idpt-container">

        <!-- 타이틀 영역 -->
        <div class="idpt-cont-box howdo howdo-bg01">
            <h2 class="howdo-title">마음껏 데이터를<br>쓰고 싶다면</h2>
        </div>
        <!--// 타이틀 영역 -->

  <hr class="idpt-seperator no-border" aria-hidden="true">

  <div class="idpt-cont-box howdo">
            <h3 class="howdo-title">band데이터 요금제로<br>데이터 걱정 끝</h3>
    <p class="idpt-mt20">
      <span class="txt-gray">band데이터 요금제는</span>
      <span class="txt-black idpt-bold">집전화 · 이동전화 무제한<br> + 데이터 무제한</span>
      <span class="txt-gray">(기본 11GB + 매일 2GB 소진 시 속도제어)</span><br>
      <span class="txt-black idpt-bold">+ 최신 콘텐츠</span><span class="txt-gray">까지 이용하실 수 있는 요금제입니다.</span>
    </p>

    <div class="idpt-img-box idpt-mt60">
      <img src="<%= CDN %>/img/how_do/howdo_cont01_1.jpg" alt="band 데이터 요금제 이미지">
    </div>
    <p class="txt-gray align-center idpt-mt40">band데이터 퍼펙트, 퍼펙트S는 데이터 추가 사용요금 걱정 없이 데이터를 자유롭게 사용하실 수 있습니다.</p>

            <div class="idpt-btn-wrap idpt-mt30">
                <a href="#none" class="idpt-btn-cs btn-full btn-blue-nostyle">자세히 보기 </a>
            </div>
        </div>


  <div class="idpt-cont-box nopadding-bottom">

    <p class="cs-title">연관 상품</p>
    <ul class="idpt-oneline-list idpt-mt40">
      <li class="right-arrow">band데이터 3.5G</li>
      <li class="right-arrow no-border">T 시그니쳐 Classic</li>
    </ul>

  </div>

  <hr class="idpt-seperator no-border" aria-hidden="true">
  <div class="idpt-cont-box howdo">
            <h3 class="howdo-title">안심하고 쓸 수 있는<br>LTE안심옵션 요금제</h3>
    <p class="idpt-mt20">
      <span class="txt-gray">기본 데이터를 모두 사용하고도</span>
      <span class="txt-black idpt-bold">SNS · 웹서핑 · 메일 서비스를 사용</span>
      <span class="txt-gray">할 수 있습니다.</span>
    </p>

    <div class="idpt-img-box idpt-mt60">
      <img src="<%= CDN %>/img/how_do/howdo_cont01_2.jpg" alt="LTE 안심옵션 요금제 이미지">
    </div>
    <p class="txt-gray align-center idpt-mt40">기본데이터를 모두 사용한 후에는 데이터 속도가 조절되므로 대용량 서비스를 이용할 때 불편하실 수 있습니다.</p>

            <div class="idpt-btn-wrap idpt-mt30">
                <a href="#none" class="idpt-btn-cs btn-full btn-blue-nostyle">자세히 보기 </a>
            </div>
        </div>


  <div class="idpt-cont-box nopadding-bottom">

    <p class="cs-title">연관 상품</p>
    <ul class="idpt-oneline-list idpt-mt40">
      <li class="right-arrow no-border">안심데이터 100(500M)</li>
    </ul>

  </div>

    </div>`);
    */
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo,
        svcInfo
      });

      return null;
    });
  }
}

export default CustomerFaqDoLikeThis;
