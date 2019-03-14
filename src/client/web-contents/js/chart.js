$.fn.chart2 = function(o){
  /*
    target : 대상
    type : 차트 유형 (circle, bar1, bar2, bar3, bar4)
    legend : 범례
    data_arry : 데이터
    unlimited : 데이터에 무제한이 있는지 여부
    max : 최대값r
    prdname : 상품명 // circle 타입에서 사용
    link : dt영역 링크 여부
  */
  var d = {target:null,type:null,tit:null,legend:null,average:null,average_place:'left',unit:null,data_arry:null,unlimited:false,prdname:null,link:null}
  var max = 0, // 최대값
    max2 = 0, // 최대값2
    text_pattern = [], // 노출 텍스트
    text2_pattern = [], // 노출 텍스트2
    style_pattern = [], // 높이 설정
    style2_pattern = [], // 높이 설정2
    throw_arry = [], // 평균값 연산시 사용하는 배열
    throw2_arry = [], // 평균값 연산시 사용하는 배열2
    class_pattern = ['patten1', 'red', 'blue']; // 서클 타입에서 사용되는 class명
  $.extend(d,o);
  if(d.target == null) return;
  $(d.target).addClass(d.type);

  if(d.type == 'bar1'){ // bar1
    $(d.target).append($('<ul>'));
    for(var i=0; i < d.data_arry.length; i++){
      d.unlimited = false;
      style_pattern = [];
      max = 0;


      if(typeof d.data_arry[i].v == 'number'){
        text_pattern.push(d.data_arry[i].v + d.data_arry[i].u);
        max = (max > d.data_arry[i].v) ? max : d.data_arry[i].v;
      }else{
        text_pattern.push(d.data_arry[i].v);
        d.unlimited = true;
      }
      if(typeof d.data_arry[i].v2 == 'number'){
        text2_pattern.push(d.data_arry[i].v2 + d.data_arry[i].u);
        max = (max > d.data_arry[i].v2) ? max : d.data_arry[i].v2;
      }else{
        text2_pattern.push(d.data_arry[i].v2);
        d.unlimited = true;
      }

      if(d.unlimited){
        if(typeof d.data_arry[i].v == 'number'){
          style_pattern.push((d.data_arry[i].v/max) * 50);
        }else{
          style_pattern.push(100);
        }
        if(typeof d.data_arry[i].v2 == 'number'){
          style_pattern.push((d.data_arry[i].v2/max) * 50);
        }else{
          style_pattern.push(100);
        }
      }else{
        style_pattern.push((d.data_arry[i].v/max) * 100);
        style_pattern.push((d.data_arry[i].v2/max) * 100);
      }


      $(d.target).find('ul')
        .append(
          $('<li>')
            .append(
              $('<dl>')
                .append(
                  $('<dt>').text(d.prdname[i])
                )
                .append(
                  $('<dd>').addClass('first')
                    .append(
                      $('<span>').addClass('shapes').css('height', style_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('blind').text(d.prdname[i] + ' : ' + d.legend[0])
                    )
                    .append(
                      $('<span>').addClass('data').text(text_pattern[i]).css('bottom', style_pattern[0])
                    )
                )
                .append(
                  $('<dd>').addClass('second')
                    .append(
                      $('<span>').addClass('shapes').css('height', style_pattern[1])
                    )
                    .append(
                      $('<span>').addClass('blind').text(d.prdname[i] + ' : ' + d.legend[1])
                    )
                    .append(
                      $('<span>').addClass('data').text(text2_pattern[i]).css('bottom', style_pattern[1])
                    )
                )
            )
        )
    }
    $(d.target)
      .append(
        $('<div>').addClass('legend')
          .append(
            $('<span>').addClass('category0')
              .append(
                $('<span>').text(d.legend[0])
              )
          )
          .append(
            $('<span>').addClass('category1')
              .append(
                $('<span>').text(d.legend[1])
              )
          )
      )
  }
  if(d.type == 'bar2'){ // bar2
    $(d.target).append($('<div>').addClass('data-arry').append($('<div>').addClass('data-belt').append($('<ul>').addClass('data-ul'))));
    for(var i=0; i < d.data_arry.length; i++){
      throw_arry.push(d.data_arry[i].v);
    }
    average(throw_arry, d.unit);
    if(d.legend){// 범례
      $(d.target).append($('<div>').addClass('legend'));
      for(var i=0; i < d.legend.length; i++){
        $(d.target).find('.legend')
          .append(
            $('<span>').addClass('category' + i)
            .append(
              $('<span>').text(d.legend[i])
            )
          )
      }
    }

    if(d.average && d.average_place == 'left'){ // 평균
      $(d.target).find('.data-arry').append($('<span>').addClass('dash').append($('<span>').css('bottom', style_pattern[0]+'%')));
      $(d.target).find('.data-ul')
        .append(
          $('<li>').addClass('average').data('value', average)
            .append(
              $('<dl>')
                .append(
                  $('<dt>').text('평균')
                )
                .append(
                  $('<dd>')
                    .append(
                      $('<span>').addClass('v').css('bottom', style_pattern[0]+'%').text(text_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar').css('height', style_pattern[0]+'%')
                    )
                )
            )
        )
    }

    for(var i=0; i < d.data_arry.length; i++){
      $(d.target).find('.data-ul')
        .append(
          $('<li>')
          .append(
            $('<dl>')
              .append($('<dt>')
                .text(d.data_arry[i].t)
              )
              .append(
                $('<dd>')
                  .append(
                    $('<span>').addClass('v').css('bottom', style_pattern[i+1]+'%').text(text_pattern[i+1])
                  )
                .append(
                  $('<span>').addClass('bar').css('height', style_pattern[i+1]+'%')
                )
              )
          )
        )
    }

    if(d.average && d.average_place == 'right'){ // 평균
      $(d.target).find('.data-arry').append($('<span>').addClass('dash').append($('<span>').css('bottom', style_pattern[0]+'%')));
      $(d.target).find('.data-ul')
        .append(
          $('<li>').addClass('average').data('value', average)
            .append(
              $('<dl>')
                .append(
                  $('<dt>').text('평균')
                )
                .append(
                  $('<dd>')
                    .append(
                      $('<span>').addClass('v').css('bottom', style_pattern[0]+'%').text(text_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar').css('height', style_pattern[0]+'%')
                    )
                )
            )
        );
        setTimeout(function () {
          $(d.target).find('.data-belt').scrollLeft($(d.target).find('.data-belt').width());
        }, 500);
    }

    $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
    if($(d.target).find('.data-ul > li').length > 4){
      $(d.target).addClass('over');
      $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
      $(d.target).find('.data-ul').css('width', (25 * $(d.target).find('.data-ul > li').length) + 1 + '%');
    }
    if(d.link){
      $(d.target).find('.data-ul > li:not(".average")').each(function(i){
        var temp = $(this).find('dt').text();
        if(d.data_arry[i].class !== undefined){
          $(this).find('dt').empty().append($('<button>').text(temp).attr('type','button').addClass(d.data_arry[i].class));
        }else{
          $(this).find('dt').empty().append($('<button>').text(temp).attr('type','button').addClass('link' + i));
        }
      })
    }
  }
  if(d.type == 'bar3'){ // bar3 - bar2와 차이점은 범례1개 추가된것밖에 없음
    $(d.target).append($('<div>').addClass('data-arry').append($('<div>').addClass('data-belt').append($('<ul>').addClass('data-ul'))));
    for(var i=0; i < d.data_arry.length; i++){
      throw_arry.push(d.data_arry[i].v);
    }
    average(throw_arry, d.unit);
    if(d.legend){// 범례
      $(d.target).append($('<div>').addClass('legend'));
      for(var i=0; i < d.legend.length; i++){
        $(d.target).find('.legend')
          .append(
            $('<span>').addClass('category' + i)
            .append(
              $('<span>').text(d.legend[i])
            )
          )
      }
    }

    if(d.average){ // 평균
      $(d.target).find('.data-arry').append($('<span>').addClass('dash').append($('<span>').css('bottom', style_pattern[0]+'%')));
      $(d.target).find('.data-ul')
        .append(
          $('<li>').addClass('average').data('value', average)
            .append(
              $('<dl>')
                .append(
                  $('<dt>').text('평균')
                )
                .append(
                  $('<dd>')
                    .append(
                      $('<span>').addClass('blind').text(d.legend[0])
                    )
                    .append(
                      $('<span>').addClass('v').css('bottom', style_pattern[0]+'%').text(text_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar').css('height', style_pattern[0]+'%')
                    )
                )
            )
        )
    }

    for(var i=0; i < d.data_arry.length; i++){
      $(d.target).find('.data-ul')
        .append(
          $('<li>')
          .append(
            $('<dl>')
              .append($('<dt>')
                .text(d.data_arry[i].t)
              )
              .append(
                $('<dd>')
                  .append(
                    $('<span>').addClass('blind').text(d.legend[0])
                  )
                  .append(
                    $('<span>').addClass('v').css('bottom', style_pattern[i+1]+'%').text(text_pattern[i+1])
                  )
                .append(
                  $('<span>').addClass('bar').css('height', style_pattern[i+1]+'%')
                )
              )
          )
        )
    }

    $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
    if($(d.target).find('.data-ul > li').length > 4){
      $(d.target).addClass('over');
      $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
      $(d.target).find('.data-ul').css('width', (25 * $(d.target).find('.data-ul > li').length) + 1 + '%');
    }
    if(d.link){
      $(d.target).find('.data-ul > li:not(".average")').each(function(i){
        var temp = $(this).find('dt').text();
        if(d.data_arry[i].class !== undefined){
          $(this).find('dt').empty().append($('<button>').text(temp).attr('type','button').addClass(d.data_arry[i].class));
        }else{
          $(this).find('dt').empty().append($('<button>').text(temp).attr('type','button').addClass('link' + i));
        }
      })
    }
  }
  if(d.type == 'bar4'){ // bar4
    $(d.target).append($('<div>').addClass('data-arry').append($('<div>').addClass('data-belt').append($('<ul>').addClass('data-ul'))));
    for(var i=0; i < d.data_arry.length; i++){
      throw_arry.push(d.data_arry[i].v);
      throw2_arry.push(d.data_arry[i].v2);
    }
    average2(throw_arry, throw2_arry, d.unit);

    if(d.legend){// 범례
      $(d.target).append($('<div>').addClass('legend'));
      for(var i=0; i < d.legend.length; i++){
        $(d.target).find('.legend')
          .append(
            $('<span>').addClass('category' + i)
            .append(
              $('<span>').text(d.legend[i])
            )
          )
      }
    }

    if(d.average && d.average_place == 'left'){ // 평균
      var style2_pattern_average_height = (style2_pattern[0] > 110)? 110 : style2_pattern[0];
      $(d.target).find('.data-arry').append($('<span>').addClass('dash').append($('<span>').css('bottom', style_pattern[0]+'%')));
      $(d.target).find('.data-ul')
        .append(
          $('<li>').addClass('average').data('value', average)
            .append(
              $('<dl>')
                .append(
                  $('<dt>').text('평균')
                )
                .append(
                  $('<dd>')
                    .append(
                      $('<span>').addClass('blind').text(d.legend[0])
                    )
                    .append(
                      $('<span>').addClass('v').css('bottom', style_pattern[0]+'%').text(text_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar').css('height', style_pattern[0]+'%')
                    )
                    .append(
                      $('<span>').addClass('blind').text(d.legend[1])
                    )
                    .append(
                      $('<span>').addClass('blind').text(text2_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar2').css('height', style2_pattern_average_height+'%')
                    )
                )
            )
        )
    }

    for(var i=0; i < d.data_arry.length; i++){
      var style2_pattern_height = (style2_pattern[i+1] > 110)? 110 : style2_pattern[i+1];
      $(d.target).find('.data-ul')
        .append(
          $('<li>')
          .append(
            $('<dl>')
              .append($('<dt>')
                .text(d.data_arry[i].t)
              )
              .append(
                $('<dd>').addClass('first')
                  .append(
                    $('<span>').addClass('blind').text(d.legend[0])
                  )
                  .append(
                    $('<span>').addClass('v').css('bottom', style_pattern[i+1]+'%').text(text_pattern[i+1])
                  )
                  .append(
                    $('<span>').addClass('bar').css('height', style_pattern[i+1]+'%')
                  )
                  .append(
                    $('<span>').addClass('blind').text(d.legend[1])
                  )
                  .append(
                    $('<span>').addClass('blind').text(text2_pattern[i+1])
                  )
                  .append(
                    $('<span>').addClass('bar2').css('height', style2_pattern_height+'%')
                  )
              )
          )
        )
    }

    if(d.average && d.average_place == 'right'){ // 평균
      var style2_pattern_average_height = (style2_pattern[0] > 110)? 110 : style2_pattern[0];
      $(d.target).find('.data-arry').append($('<span>').addClass('dash').append($('<span>').css('bottom', style_pattern[0]+'%')));
      $(d.target).find('.data-ul')
        .append(
          $('<li>').addClass('average').data('value', average)
            .append(
              $('<dl>')
                .append(
                  $('<dt>').text('평균')
                )
                .append(
                  $('<dd>')
                    .append(
                      $('<span>').addClass('blind').text(d.legend[0])
                    )
                    .append(
                      $('<span>').addClass('v').css('bottom', style_pattern[0]+'%').text(text_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar').css('height', style_pattern[0]+'%')
                    )
                    .append(
                      $('<span>').addClass('blind').text(d.legend[1])
                    )
                    .append(
                      $('<span>').addClass('blind').text(text2_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar2').css('height', style2_pattern_average_height+'%')
                    )
                )
            )
        )
        setTimeout(function () {
          $(d.target).find('.data-belt').scrollLeft($(d.target).find('.data-belt').width());
        }, 500);
    }

    $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
    if($(d.target).find('.data-ul > li').length > 4){
      $(d.target).addClass('over');
      $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
      $(d.target).find('.data-ul').css('width', (25 * $(d.target).find('.data-ul > li').length) + 1 + '%');
    }
    if(d.link){
      $(d.target).find('.data-ul > li:not(".average")').each(function(i){
        var temp = $(this).find('dt').text();
        if(d.data_arry[i].class !== undefined){
          $(this).find('dt').empty().append($('<button>').text(temp).attr('type','button').addClass(d.data_arry[i].class));
        }else{
          $(this).find('dt').empty().append($('<button>').text(temp).attr('type','button').addClass('link' + i));
        }
      })
    }
  }

  if(d.type == 'circle'){ // circle - min 50% ~ max 100%
    for(var i=0; i < d.data_arry.length; i++){
      if(typeof d.data_arry[i].v == 'number'){
        max = (max > d.data_arry[i].v) ? max : d.data_arry[i].v;
        text_pattern.push(d.data_arry[i].v + d.unit)
      }else if(d.data_arry[i].v == 0){
        text_pattern.push(d.data_arry[i].v);
      }else if(d.data_arry[i].v == '무제한'){
        text_pattern.push(d.data_arry[i].v);
        d.unlimited = true;
      }
    }

    //@190314 - DV001-16238: 그래프 크기 보완
    var _gap = 1.5;
    var _max = d.data_arry[1].v/d.data_arry[0].v;
    if(_max>1 && _max<_gap){
      d.data_arry[1].v = (d.data_arry[1].v * _gap);
    }
    //@190314 - DV001-16238: 그래프 크기 보완

    for(var i=0; i < d.data_arry.length; i++){
      if(d.unlimited){
        if(d.data_arry[i].v == 0){
          style_pattern.push(50);
          class_pattern[0] = 'gray';
          class_pattern[1] = '';
          $(d.target).addClass('removelegend');
        }else if(d.data_arry[i].v == '무제한'){
          style_pattern.push(100);
        }else{
          style_pattern.push((((d.data_arry[i].v/max) * 100) / 4) + 50);
        }
      }else{
        if(d.data_arry[i].v == 0){
          style_pattern.push(50);
          class_pattern[0] = 'gray';
          class_pattern[1] = '';
          $(d.target).addClass('removelegend');
        }else{
          style_pattern.push((((d.data_arry[i].v/max) * 100) / 2) + 50);
        }
      }
    }
    for(var i=0; i < style_pattern.length; i++){
      style_pattern[i] = Math.floor(style_pattern[i])
    }
    $(d.target)
      .append(
        $('<div>').addClass('circle-belt')
          .append(
            $('<dl>').addClass('as-is') // as is
              .append(
                $('<dt>').text(d.prdname[0])
              )
              .append(
                $('<dd>').addClass('circle')
                  .append(
                    $('<span>').addClass('shapes').addClass(class_pattern[0]).css('width', style_pattern[0] + '%').css('height', style_pattern[0] + '%')
                  )
                  .append(
                    $('<span>').addClass('data').text(text_pattern[0])
                    .prepend(
                      $('<span>').addClass('blind').text(d.data_arry[0].t)
                    )
                  )
                  .append(
                    $('<span>').addClass('shapes').addClass(class_pattern[1]).css('width', style_pattern[1] + '%').css('height', style_pattern[1] + '%')
                  )
                  .append(
                    $('<span>').addClass('blind').text(d.data_arry[0].t + text_pattern[1])
                  )
              )
              .append(
                $('<dd>').addClass('legend')
                .append(
                  $('<span>').addClass('first')
                  .append(
                    $('<span>').text(d.data_arry[0].t)
                  )
                  .append(
                    $('<strong>').text(text_pattern[0])
                  )
                )
                .append(
                  $('<span>').addClass('second')
                  .append(
                    $('<span>').text(d.data_arry[1].t)
                  )
                  .append(
                    $('<strong>').text(text_pattern[1])
                  )
                )
              )
          )
          .append(
            $('<dl>').addClass('to-be') // to be
              .append(
                $('<dt>').text(d.prdname[1])
              )
              .append(
                $('<dd>').addClass('circle')
                .append(
                  $('<span>').addClass('shapes').addClass(class_pattern[2]).css('width', style_pattern[2] + '%').css('height', style_pattern[2] + '%')
                )
                .append(
                  $('<span>').addClass('data').text(text_pattern[2])
                  .prepend(
                    $('<span>').addClass('blind').text(d.data_arry[2].t)
                  )
                )
              )
          )
      )
  }


  function average(arry, type){
    var sum = 0,
      average = 0;
      max = 0;
    if(type == 'gb'){ // gb
      for(var i=0; i<arry.length; i++){
        sum += arry[i];
        max = (max > arry[i]) ? max : arry[i];
      }
      average = (sum / arry.length).toFixed(2);
    }else if(type == 'time'){ // time
      for(var i=0; i<arry.length; i++){
        sum += operation_minutes(arry[i])
        max = (max > operation_minutes(arry[i])) ? max : operation_minutes(arry[i]);
      }
      average = (sum / arry.length).toFixed(0);
    }else if(type == '원'){ // 원
      for(var i=0; i<arry.length; i++){
        sum += arry[i];
        max = (max > arry[i]) ? max : arry[i];
      }
      average = (sum / arry.length).toFixed(0);
    }else{ // 기타
      for(var i=0; i<arry.length; i++){
        sum += arry[i];
        max = (max > arry[i]) ? max : arry[i];
      }
      average = (sum / arry.length).toFixed(0);
    }
    if(type == 'gb'){ // gb
      for(var i=0; i<arry.length; i++){
        text_pattern.push(arry[i] + 'GB');
        style_pattern.push((arry[i]/max*100).toFixed(0));
      }
      text_pattern.unshift(average + 'GB');
      style_pattern.unshift((average/max*100).toFixed(0));
    }else if(type == 'time'){ // time
      for(var i=0; i<arry.length; i++){
        text_pattern.push(operation_time(operation_minutes(arry[i])));
        style_pattern.push(((operation_minutes(arry[i]))/max*100).toFixed(0));
      }
      text_pattern.unshift(operation_time(average));
      style_pattern.unshift(((average)/max*100).toFixed(0));
    }else if(type == '원'){ // 원
      for(var i=0; i<arry.length; i++){
        text_pattern.push(add_comma(arry[i]) + '원');
        style_pattern.push((arry[i]/max*100).toFixed(0));
      }
      text_pattern.unshift(add_comma(average) + '원');
      style_pattern.unshift((average/max*100).toFixed(0));
    }else{ // 기타
      for(var i=0; i<arry.length; i++){
        text_pattern.push(add_comma(arry[i]) + type);
        style_pattern.push((arry[i]/max*100).toFixed(0));
      }
      text_pattern.unshift(add_comma(average) + type);
      style_pattern.unshift((average/max*100).toFixed(0));
    }
  }

  function average2(arry, arry2, type){
    var sum = 0,
      sum2 =0,
      average = 0,
      average2 = 0,
      max = 0;
      max2 = 0;

    if(type == 'gb'){ // gb
      for(var i=0; i<arry.length; i++){
        sum += arry[i];
        sum2 += arry2[i];
        max = (max > arry[i]) ? max : arry[i];
        max2 = (max2 > arry2[i]) ? max2 : arry2[i];
      }
      average = (sum / arry.length).toFixed(2);
      average2 = (sum2 / arry2.length).toFixed(2);
    }else if(type == 'time'){ // time
      for(var i=0; i<arry.length; i++){
        sum += operation_minutes(arry[i]);
        sum2 += operation_minutes(arry2[i]);
        max = (max > operation_minutes(arry[i])) ? max : operation_minutes(arry[i]);
        max2 = (max2 > operation_minutes(arry2[i])) ? max2 : operation_minutes(arry2[i]);
      }
      average = (sum / arry.length).toFixed(0);
      average2 = (sum2 / arry2.length).toFixed(0);
    }else if(type == '원'){ // 원
      for(var i=0; i<arry.length; i++){
        sum += arry[i];
        sum2 += arry2[i];
        max = (max > arry[i]) ? max : arry[i];
        max2 = (max2 > arry2[i]) ? max2 : arry2[i];
      }
      average = (sum / arry.length).toFixed(0);
      average2 = (sum2 / arry2.length).toFixed(0);
    }else{ // 기타
      for(var i=0; i<arry.length; i++){
        sum += arry[i];
        sum2 += arry2[i];
        max = (max > arry[i]) ? max : arry[i];
        max2 = (max2 > arry2[i]) ? max2 : arry2[i];
      }
      average = (sum / arry.length).toFixed(0);
      average2 = (sum2 / arry2.length).toFixed(0);
    }

    if(type == 'gb'){ // gb
      for(var i=0; i<arry.length; i++){
        text_pattern.push(arry[i] + 'GB');
        text2_pattern.push(arry2[i] + 'GB');
        style_pattern.push((arry[i]/max*100).toFixed(0));
        style2_pattern.push((arry2[i]/max*100).toFixed(0));
      }
      text_pattern.unshift(average + 'GB');
      text2_pattern.unshift(average2 + 'GB');
      style_pattern.unshift((average/max*100).toFixed(0));
      style2_pattern.unshift((average2/max*100).toFixed(0));
    }else if(type == 'time'){ // time
      for(var i=0; i<arry.length; i++){
        text_pattern.push(operation_time(operation_minutes(arry[i])));
        text2_pattern.push(operation_time(operation_minutes(arry2[i])));
        style_pattern.push(((operation_minutes(arry[i]))/max*100).toFixed(0));
        style2_pattern.push(((operation_minutes(arry2[i]))/max*100).toFixed(0));
      }
      text_pattern.unshift(operation_time(average));
      text2_pattern.unshift(operation_time(average2));
      style_pattern.unshift(((average)/max*100).toFixed(0));
      style2_pattern.unshift(((average2)/max*100).toFixed(0));
    }else if(type == '원'){ // 원
      for(var i=0; i<arry.length; i++){
        text_pattern.push(add_comma(arry[i]) + '원');
        text2_pattern.push(add_comma(arry2[i]) + '원');
        style_pattern.push((arry[i]/max*100).toFixed(0));
        style2_pattern.push((arry2[i]/max*100).toFixed(0));
      }
      text_pattern.unshift(add_comma(average) + '원');
      text2_pattern.unshift(add_comma(average2) + '원');
      style_pattern.unshift((average/max*100).toFixed(0));
      style2_pattern.unshift((average2/max*100).toFixed(0));
    }else{ // 기타
      for(var i=0; i<arry.length; i++){
        text_pattern.push(add_comma(arry[i]) + type);
        text2_pattern.push(add_comma(arry2[i]) + type);
        style_pattern.push((arry[i]/max*100).toFixed(0));
        style2_pattern.push((arry2[i]/max*100).toFixed(0));
      }
      text_pattern.unshift(add_comma(average) + type);
      text2_pattern.unshift(add_comma(average2) + type);
      style_pattern.unshift((average/max*100).toFixed(0));
      style2_pattern.unshift((average2/max*100).toFixed(0));
    }
  }

  function operation_minutes(num){
    return (num.split(':')[0]*1*60)+num.split(':')[1]*1;
  }
  function operation_time(num){
    var min = Math.floor(num/60),
        sec = num%60;
    if(min == 0){
      return sec+'초';
    }else{
      return min+'분 '+sec+'초';
    }
  }
  function add_comma(num) {
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
  }
}

$.fn.chart = function(option){
  var chart_data = {caption:'표제목',tf_txt:'평균값',td_txt:'각항목값',da_arr:[]};
  $.extend(chart_data,option.data);
  var container = document.getElementsByClassName(option.container)[0],
      chart_length = chart_data.da_arr.length,
      max = [];
  for(var i = 0; i < chart_length; ++i){
    if(option.unit == 'time'){
      max[i] = operation_minutes(chart_data.da_arr[i].data[0]);
    }else{
      max[i] = chart_data.da_arr[i].data;
    }
  }

  for(var i = max.length - 1; i >= 0; i--) {
    if(max[i] == '무제한'){
      max.splice(i, 1);
    }
  }
  
  max.sort(function(a,b){
    return b - a;
  });
  max = max[0];
  if(option.type == 'bar'){
    var chart_ul = make_tag('ul','chart_ul',container);
    for(var i = -1; i < chart_length; ++i){
      var el = make_tag('li','graph-list',chart_ul);
      el.style.width = 100/(chart_length+1)+'%';
      var el_dl = make_tag('dl','chart-dl',el),
          el_dt = make_tag('dt','graph-tit',el_dl),
          el_dd = make_tag('dd','chart-dd',el_dl),
          box = make_tag('span','box',el_dd),
          bar = make_tag('span','bar',box),
          txt = make_tag('span','txt',box);
      var count,count_txt,average_count,average_txt;
      if(i == -1){
        if(option.unit == 'time'){
          average_txt = operation_time(sum_aver(chart_data.da_arr));
          average_count = sum_aver(chart_data.da_arr);
        }else{
          average_txt = sum_aver(chart_data.da_arr,option.decimal)+option.unit;
          average_count = sum_aver(chart_data.da_arr,option.decimal);
        }
        el_dt.innerHTML = '평균';
        txt.innerHTML = average_txt;
        txt.style.bottom = (average_count/max)*100+5+'%';
        bar.style.height = (average_count/max)*100+'%';
        bar.setAttribute('class','bar point');
      }else{
        if(option.unit == 'time'){
          count_txt = operation_time(operation_minutes(chart_data.da_arr[i].data[0]));
          count = operation_minutes(chart_data.da_arr[i].data[0]);
        }else{
          count_txt = chart_data.da_arr[i].data+option.unit;
          count = chart_data.da_arr[i].data;
        }
        el_dt.innerHTML = chart_data.da_arr[i].na;
        txt.innerHTML = count_txt;
        if(count_txt == '0GB' || count_txt == '0초'){
          txt.setAttribute('class', 'txt blind');
        }
        txt.style.bottom = (count/max)*100+5+'%';
        bar.style.height = (count/max)*100+'%';
      }
    }
    var line_box = make_tag('span','line-box',container),
        line = make_tag('span','line',line_box);
    line.style.bottom = (average_count/max)*100+'%';
  }else if(option.type == 'bar2'){
    var scroll_gap = 0;
    var chart_left = make_tag('div','chart-left',container),
        chart_right = make_tag('div','chart-right',container),
        chart_list_box = make_tag('div','chart-list-box',chart_left),
        chart_average_box = make_tag('div','chart-average-box',chart_right),
        chart_ul = make_tag('ul','chart-ul',chart_list_box);
    for(var i = chart_length-1; i >= 0; --i){
      var el = make_tag('li','graph-list',chart_ul);
      var el_dl = make_tag('dl','chart-dl',el),
          el_dt = make_tag('dt','graph-tit',el_dl),
          link_bt = make_tag('button','link-bt',el_dt),
          el_dd = make_tag('dd','chart-dd',el_dl),
          box = make_tag('span','box',el_dd),
          bar = make_tag('span','bar',box),
          txt = make_tag('span','txt',box);
      if(option.sale){
        var bar1 = make_tag('span','bar',box);
        sale = chart_data.da_arr[i].sale;
        bar1.style.height = (sale/max)*100+'%';
        bar1.setAttribute('class','bar pos-second point1');
      }else{
        chart_left.setAttribute('class','chart-left none-sale');
        chart_right.setAttribute('class','chart-right none-sale');
      }
      link_bt.setAttribute('class',chart_data.da_arr[i].class);
      count_txt = add_comma(chart_data.da_arr[i].data)+option.unit;
      count = chart_data.da_arr[i].data;
      link_bt.innerHTML = chart_data.da_arr[i].na;
      txt.innerHTML = count_txt;
      if(count_txt == '0원'){
        txt.setAttribute('class', 'txt blind');
      }
      txt.style.bottom = (count/max)*100+5+'%';
      bar.style.height = (count/max)*100+'%';   
    }
    scroll_gap = el.clientWidth;
    var average_txt = sum_aver(chart_data.da_arr,option.decimal)+option.unit,
        average_count = sum_aver(chart_data.da_arr,0),
        sale_count = sum_aver(chart_data.da_arr,0,true);
    var re_dl = make_tag('dl','chart-dl',chart_average_box),
        re_dt = make_tag('dt','graph-tit',re_dl),
        re_dd = make_tag('dd','chart-dd',re_dl),
        re_box = make_tag('span','box',re_dd),
        re_bar = make_tag('span','bar',re_box),
        re_txt = make_tag('span','txt',re_box);
        re_dt.innerHTML = '평균';
    if(option.sale){
      var re_bar1 = make_tag('span','bar',re_box);
      re_bar1.style.height = (sale_count/max)*100+'%';
      re_bar1.setAttribute('class','bar pos-second point1');
    }
    re_txt.innerHTML = average_txt;
    re_txt.style.bottom = (average_count/max)*100+5+'%';
    re_bar.style.height = (average_count/max)*100+'%';
    re_bar.setAttribute('class','bar point2');

    var rec_box = make_tag('div','rec-box',chart_left),
        rec_ul = make_tag('ul','rec-ul',rec_box),
        arrow_box = make_tag('ul','arrow-box',container);
    for(var i = 0; i < 2; ++i){
      var rec_li = make_tag('li','rec-li',rec_ul),
          arrow_li = make_tag('li','arrow-li',arrow_box);
      if(i == 0){
        if(option.legend == undefined || option.legend[0] == undefined){
          make_rec('','청구',rec_li);
        }else{
          make_rec('',option.legend[0],rec_li);
        }
        arrow_bt = make_tag('button','arrow-prev',arrow_li);
        arrow_bt.innerHTML = 'Prev';
        arrow_bt.addEventListener('click',function(){
          scroll_move($(container).find($('.chart-list-box')),scroll_gap,true);
        });
      }else{
        if(option.sale){
          if(option.legend == undefined || option.legend[1] == undefined){
            make_rec('point1','할인',rec_li);
          }else{
            make_rec('point1',option.legend[1],rec_li);
          }
        }
        arrow_bt = make_tag('button','arrow-next',arrow_li);
        arrow_bt.innerHTML = 'Next';
        arrow_bt.addEventListener('click',function(){
          scroll_move($(container).find($('.chart-list-box')),scroll_gap,false);
        });
      }
    }
  }else if(option.type == 'bar3'){
    var chart_ul = make_tag('ul','chart_ul',container);
    for(var i = 0; i <= chart_length -1; ++i){/* da_arr.length */
      /* html append */
      var el = make_tag('li','graph-list',chart_ul);
      el.style.width = 100/(chart_length)+'%';
      /* make dl,dt,dd,span,span,span */
      var el_dl = make_tag('dl','chart-dl',el),
        el_dt = make_tag('dt','graph-tit',el_dl).innerHTML = chart_data.da_arr[i].na,
        el_dd = make_tag('dd','chart-dd',el_dl),
        box = make_tag('span','box',el_dd);
      for(var j=0; j < option.legend.length; j++){
        bar = make_tag('span','bar',box);
        txt = make_tag('span','txt',box).innerHTML = chart_data.da_arr[i].data[j];
      }
      /* data set */
      el_dt.innerHTML = chart_data.da_arr[i].na;
      for(var j=0; j < option.legend.length; j++){
        if(chart_data.da_arr[i].data[j] == '무제한'){
          $(el_dd).find('.txt').eq(j).html(chart_data.da_arr[i].data[j]);
        }else if(option.unit[i] == '원'){
          $(el_dd).find('.txt').eq(j).html(add_comma(chart_data.da_arr[i].data[j]) + option.unit[i]);
        }else{
          $(el_dd).find('.txt').eq(j).html(chart_data.da_arr[i].data[j] + option.unit[i]);
        }
      }
      /* style set */
      if(chart_data.da_arr[i].data[0] == '무제한' && chart_data.da_arr[i].data[1] == '무제한'){
        $(el_dd).find('.bar').eq(0).css('height', '100%').next().css('bottom', '105%');
        $(el_dd).find('.bar').eq(1).css('height', '100%').next().css('bottom', '105%');
      }else if(chart_data.da_arr[i].data[0] == '무제한'){
        $(el_dd).find('.bar').eq(0).css('height', '100%').next().css('bottom', '105%');
        $(el_dd).find('.bar').eq(1).css('height', '50%').next().css('bottom', '55%');
      }else if(chart_data.da_arr[i].data[1] == '무제한'){
        $(el_dd).find('.bar').eq(0).css('height', '50%').next().css('bottom', '55%');
        $(el_dd).find('.bar').eq(1).css('height', '100%').next().css('bottom', '105%');
      }else{
        if(chart_data.da_arr[i].data[0] > chart_data.da_arr[i].data[1]){
          $(el_dd).find('.bar').eq(0).css('height', '100%').next().css('bottom', '105%');
          $(el_dd).find('.bar').eq(1).css('height', (chart_data.da_arr[i].data[1] / chart_data.da_arr[i].data[0] * 100) + '%').next().css('bottom', ((chart_data.da_arr[i].data[1] / chart_data.da_arr[i].data[0] * 100) + 5) + '%');
        }else{
          $(el_dd).find('.bar').eq(0).css('height', (chart_data.da_arr[i].data[0] / chart_data.da_arr[i].data[1] * 100) + '%').next().css('bottom', ((chart_data.da_arr[i].data[0] / chart_data.da_arr[i].data[1] * 100) + 5) + '%');
          $(el_dd).find('.bar').eq(1).css('height', '100%').next().css('bottom', '105%');
        }
      }
    }
    /* 중앙선 */
    var line_box = make_tag('span','line-box',container),
        line = make_tag('span','line',line_box);
        line.style.bottom = 100+'%';
    /* 범례 */
    var chart_left = make_tag('div','chart-left',container);
    var rec_box = make_tag('div','rec-box',chart_left),
        rec_ul = make_tag('ul','rec-ul',rec_box);
    for(var i=0; i < option.legend.length; i++){ /* legend.length */
      var rec_li = make_tag('li','rec-li',rec_ul);
      make_rec('',option.legend[i],rec_li);
    }
  }if(option.type == 'bar4'){
    var chart_ul = make_tag('ul','chart_ul',container);
    var flag = false;
    for(var i = 0; i < chart_length; ++i){
      if(chart_data.da_arr[i].data[0] == '무제한'){
        flag = true;
      }
    }

    for(var i = 0; i < chart_length; ++i){
      var el = make_tag('li','graph-list',chart_ul);
      el.style.width = 100/(chart_length)+'%';
      var el_dl = make_tag('dl','chart-dl',el),
          el_dt = make_tag('dt','graph-tit',el_dl),
          el_dd = make_tag('dd','chart-dd',el_dl),
          box = make_tag('span','box',el_dd),
          bar = make_tag('span','bar',box),
          txt = make_tag('span','txt',box);
      var count,count_txt,average_count,average_txt;
      if(option.unit == 'time'){
        count_txt = operation_time(operation_minutes(chart_data.da_arr[i].data[0]));
        count = operation_minutes(chart_data.da_arr[i].data[0]);
      }else{
        if(chart_data.da_arr[i].data == '무제한'){
          count_txt = chart_data.da_arr[i].data;
        }else{
          count_txt = chart_data.da_arr[i].data+option.unit;
        }
        count = chart_data.da_arr[i].data;
      }
      el_dt.innerHTML = chart_data.da_arr[i].na;
      txt.innerHTML = count_txt;
      if(count_txt == '0GB' || count_txt == '0초'){
        txt.setAttribute('class', 'txt blind');
      }
      if(chart_data.da_arr[i].data[0] == '무제한'){
        txt.style.bottom = 105+'%';
        bar.style.height = 100+'%';
      }else{
        if(flag){
          txt.style.bottom = ((count/max)*100/2)+5+'%';
          bar.style.height = ((count/max)*100/2)+'%';
        }else{
          txt.style.bottom = (count/max)*100+5+'%';
          bar.style.height = (count/max)*100+'%';
        }
      }
      if(i == 0){
        var line_box = make_tag('span','line-box',container),
        line = make_tag('span','line',line_box);
        if(flag){
          line.style.bottom = ((count/max)*100/2)+'%';
        }else{
          line.style.bottom = (count/max)*100+'%';
        }
      }
    }
  }

  function scroll_move(ta,num,dir){
    var sc = ta.scrollLeft(),
        spd = dir ? -num : num;
    //sc = sc*(sc%num);
    ta.stop().animate({
      scrollLeft:sc + spd
    },{
      queue:false,
      duration:300
    });
  }
  function make_tag(tag,name,parent){
    var _tag = document.createElement(tag);
    parent.appendChild(_tag);
    _tag.setAttribute('class',name);
    return _tag;
  }
  function make_rec(cl,txt,container){
    var bar = make_tag('span','bar',container),
        sp = make_tag('span','txt',container);
    bar.setAttribute('class','bar '+cl);
    sp.innerHTML = txt;
  }
  function sum_aver(arr,decimal,sale){//각 배열합 평균
    var num = 0,
      total = arr.length;
    for(var i = 0; i < total; ++i){
      if(sale){
        num += arr[i].sale*1;
      }else{
        if(option.unit == 'time'){
          num += operation_minutes(arr[i].data[0]);
        }else{
          num += arr[i].data*1;
        }
      }
    }
    if(decimal == 'won'){
      return add_comma(Math.round((num/total)));
    }else if(typeof decimal == Number){
      return Math.round((num/total)*Math.pow(10,decimal))/Math.pow(10,decimal);
    }else{
      return Math.round((num/total));
    }
  }
  function operation_minutes(num){
    return (num.split(':')[0]*1*60)+num.split(':')[1]*1;
  }
  function operation_time(num){
    var min = Math.floor(num/60),
        sec = num%60;
    if(min == 0){
      return sec+'초';
    }else{
      return min+'분 '+sec+'초';
    }
  }
  function add_comma(num) {
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
  }
}