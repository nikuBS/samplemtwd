/**
 * MyT > Benefit 페이징이 필요한 리스트에서 공통으로 사용
 * FileName: myt.benefit.point.page.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 27.
 */
Tw.MytBenefitPointPage = function (tmplId, pageSize) {
  this.templateId = tmplId;
  this.template = null;
  this.NUM_OF_PAGES = pageSize || 5;//페이지 번호 노출 최대수

  Handlebars.registerHelper('for', function (from, to, incr, block) {
    var accum = '';
    for ( var i = from; i <= to; i += incr )
      accum += block.fn(i);
    return accum;
  });
};
Tw.MytBenefitPointPage.prototype = {
  renderList: function (currentPage, totalPage, items, $listWrapper) {
    if ( !this.template ) {
      var source = $('#' + this.templateId).html();
      this.template = Handlebars.compile(source);
    }

    //페이지 설정
    var options = { items: items };
    if ( totalPage > 1 ) {
      var startPage, endPage;
      currentPage = parseInt(currentPage, 10);
      if ( currentPage - (this.NUM_OF_PAGES >> 1) <= 1 ) {//less than 5
        startPage = 1;
        endPage = Math.min(this.NUM_OF_PAGES, totalPage);
      } else if ( currentPage + (this.NUM_OF_PAGES >> 1) >= totalPage ) {//more than total-5
        endPage = totalPage;
        startPage = Math.max(totalPage - this.NUM_OF_PAGES + 1, 1);
      } else {
        startPage = Math.max(1, currentPage - (this.NUM_OF_PAGES >> 1));
        endPage = Math.min(totalPage, currentPage + (this.NUM_OF_PAGES >> 1));
      }

      options.page = {
        from: startPage,
        to: endPage,
        current: currentPage,
        prev: startPage <= 1,
        next: endPage >= totalPage
      };
    }

    //rendering
    var output = this.template(options);
    $listWrapper.append(output);
    $listWrapper.find('a[href="#' + currentPage + '"]').addClass('active');
  }
};
