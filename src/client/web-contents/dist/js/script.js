var skt_landing = {},
  frontend_fn = {
  },
  component_list = [],
  widget_list = [],
  resize_fn = [], //resize시 사용
  scroll_fn = [], //scroll시 사용
  wheel_fn = [] //wheel시 사용
$(document).on('ready', function () {
});

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
  var d = {target:null,type:null,tit:null,legend:null,average:null,unit:null,data_arry:null,unlimited:false,prdname:null,link:null}
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

    $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
    if($(d.target).find('.data-ul > li').length > 4){
      $(d.target).addClass('over');
      $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
      $(d.target).find('.data-ul').css('width', (21.5 * $(d.target).find('.data-ul > li').length) + 1 + '%');
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
      $(d.target).find('.data-ul').css('width', (21.5 * $(d.target).find('.data-ul > li').length) + 1 + '%');
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
                    .append(
                      $('<span>').addClass('blind').text(d.legend[1])
                    )
                    .append(
                      $('<span>').addClass('blind').text(text2_pattern[0])
                    )
                    .append(
                      $('<span>').addClass('bar2').css('height', style2_pattern[0]+'%')
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
                    $('<span>').addClass('bar2').css('height', style2_pattern[i+1]+'%')
                  )
              )
          )
        )
    }

    $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
    if($(d.target).find('.data-ul > li').length > 4){
      $(d.target).addClass('over');
      $(d.target).find('.data-ul > li').css('width', (100 / $(d.target).find('.data-ul > li').length) + '%');
      $(d.target).find('.data-ul').css('width', (21.5 * $(d.target).find('.data-ul > li').length) + 1 + '%');
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
$(document).on('ready', function () {
  $('html').addClass('device_'+skt_landing.util.win_info.get_device());
  skt_landing.action.top_btn();
  skt_landing.action.keyboard();
  if($('body').hasClass('bg-productdetail')){
    skt_landing.action.prd_header();
  }
  if($('.home-slider').length > 0){
    skt_landing.action.home_slider();
  }
  if($('#common-menu').length > 0){
    skt_landing.action.gnb();
  }
  skt_landing.action.header_shadow(); // header shadow effect (page)
  skt_landing.action.header_shadow_popup(); // header shadow effect (popup)
});
$(window).on('resize', function () {

}).on('scroll', function () {
  for (var fn in scroll_fn) {
    eval(scroll_fn[fn]);
  }
}).on('orientationchange', function () {
  for (var fn in resize_fn) {
    eval(resize_fn[fn]);
  }
}).on('mousewheel DOMMouseScroll', function (e) {

});
skt_landing.util = {
  win_info: {
    get_winW: function () {
      return $(window).width();
    },
    get_winH: function () {
      return $(window).height();
    },
    get_scrollT: function () {
      return $(window).scrollTop();
    },
    set_scrollT: function (num, ani, delay, callback_fn) {
      if (ani) {
        $('body').stop().animate({
          'scrollTop': num
        }, {
          'queue': false,
          'duration': delay,
          'complete': callback_fn
        });
      } else {
        $('body').scrollTop(num);
      }
    },
    get_device: function () {
      var browser_name = undefined;
      var userAgent = navigator.userAgent.toLowerCase();
      switch (true) {
        case /iphone/.test(userAgent):
          browser_name = 'ios';
          break;
        case /android/.test(userAgent):
          browser_name = 'android';
          break;
        case /naver/.test(userAgent):
          browser_name = 'naver';
          break;
        case /msie 6/.test(userAgent):
          browser_name = 'ie6';
          break;
        case /msie 7/.test(userAgent):
          browser_name = 'ie7';
          break;
        case /msie 8/.test(userAgent):
          browser_name = 'ie8';
          break;
        case /msie 9/.test(userAgent):
          browser_name = 'ie9';
          break;
        case /msie 10/.test(userAgent):
          browser_name = 'ie10';
          break;
        case /edge/.test(userAgent):
          browser_name = 'edge';
          break;
        case /chrome/.test(userAgent):
          browser_name = 'chrome';
          break;
        case /safari/.test(userAgent):
          browser_name = 'safari';
          break;
        case /firefox/.test(userAgent):
          browser_name = 'firefox';
          break;
        case /opera/.test(userAgent):
          browser_name = 'opera';
          break;
        case /mac/.test(userAgent):
          browser_name = 'mac';
          break;
        default:
          browser_name = 'unknown';
      }
      return browser_name;
    }
  },
  get_zindex:function(){
    return parseInt($('.tw-popup').last().css('z-index'));
  },
  set_zindex:function(inc){
    if($('.tw-popup').length > 1){
      inc = inc ? inc : 100;
      var prevTarget = $('.tw-popup').last().prev(),
          currentTarget = $('.tw-popup').last();
      currentTarget.css('z-index',parseInt(prevTarget.css('z-index'))+inc);
    }
  }
};
skt_landing.action = {
  scroll_gap: [],
  fix_scroll: function () {
    var popups = $('.wrap > .popup,.wrap > .popup-page'),
        fix_target = $('.wrap > .popup,.wrap > .popup-page').length > 1 ? popups.eq(popups.length-2).find('.container-wrap') : $('#contents'),
        scroll_value = $('.wrap > .popup,.wrap > .popup-page').length > 1 ? fix_target.scrollTop() : $(window).scrollTop();
    this.scroll_gap.push(scroll_value);
    fix_target.css({
      'position':'fixed',
      'transform': 'translate(0 ,-' + this.scroll_gap[this.scroll_gap.length -1] + 'px)',
      'width':'100%',
      'z-index': -1,
      'overflow-y':'visible'
    }).find('input').attr('tabindex',-1);
    if($('.container-wrap').length == 1){
      $('body,html').css('height','100%');
       $('.wrap').css({
        'height':'100%',
        'padding':0
      });
    }
    if($('.footer-wrap.fixed').length > 0){
      var page_height = parseInt($('.container-wrap:last').closest('.popup-page').css('padding-top'));
      $('.container-wrap:last').find('.footer-wrap.fixed').css({
        'transform': 'translate(0 ,' + (this.scroll_gap[this.scroll_gap.length -1] - page_height)  + 'px)'
      });
    }
    $('.skip_navi, .container-wrap:last, .header-wrap:last, .gnb-wrap').attr({
      'aria-hidden':true,
      'tabindex':-1
    });
  },
  auto_scroll: function () {
    var popups = $('.wrap > .popup,.wrap > .popup-page'),
        fix_target = $('.wrap > .popup,.wrap > .popup-page').length > 0 ? popups.eq(popups.length-1).find('.container-wrap') : $('#contents');
    fix_target.css({
      'position':'',
      'transform': '',
      'z-index':'',
      'overflow-y':''
    }).find('input').attr('tabindex','');
    if($('.container-wrap').length == 1){
      $('body,html').css('height','');
      $('.wrap').css({
        'height':'',
        'padding':''
      });
    }
    if($('.footer-wrap.fixed').length > 0){
      $('.container-wrap:last').find('.footer-wrap.fixed').css({
        'transform': ''
      });
    }
    $('.skip_navi, .container-wrap:last, .header-wrap:last, .gnb-wrap').attr({
      'aria-hidden':false,
      'tabindex':''
    });
    if($('.wrap > .popup,.wrap > .popup-page').length > 0){
      fix_target.scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }else{
      $(window).scrollTop(this.scroll_gap[this.scroll_gap.length -1]);
    }
    this.scroll_gap.pop();
  },
  setFocus: function(target, idx){  // target : selector(string) | jquery selector
    var target = $(target),
        idx = idx ? idx : 0;
    target.eq(idx).attr('tabindex',0).focus(); // focus
  },
  top_btn: function () {
    $('.bt-top button').on('touchstart click', function () {
      if ($(this).parents().hasClass('popup-page')) {
        $('.container-wrap').stop().animate({
          'scrollTop': 0
        }, {
            queue: false,
            duration: 500
        });
      } else {
        $('html').stop().animate({
          'scrollTop': 0
        }, {
            queue: false,
            duration: 500
        });
      }
    });
  },
  ran_id_create:function(){
    var d = new Date().getTime(),
        ranid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
          var r = (d+Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
    return ranid;
  },
  loading: {
    svg_id:'',
    on: function(obj){
      var ta = obj.ta,
          co = obj.co,
          size = obj.size,
          tit_id = skt_landing.action.ran_id_create(),
          loading_box = $('<div class="loading tw-loading" role="region" aria-labelledby="'+tit_id+'"></div>'),
          loading_ico = $('<div class="loading_ico"></div>'),
          loading_txt = $('<em id="'+tit_id+'">로딩중입니다.</em>'),
          svg_id = '',
          svg_color = '',
          svg = '';
      svg_id = skt_landing.action.loading.svg_id = skt_landing.action.ran_id_create();
      if(co == 'white'){
        svg_color = 'rgba(255,255,255,1)';
        loading_txt.addClass('white');
      }else if(co == 'blue'){
        svg_color = 'rgba(50,94,193,1)';
        loading_txt.addClass('blue');
      }else{
        svg_color = 'rgba(117,117,117,1)';
        loading_txt.addClass('grey');
      }
      svg = '<svg id="'+svg_id+'" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><circle id="actor_12" cx="65" cy="25" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_11" cx="75" cy="36" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_10" cx="79" cy="50" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_9" cx="75" cy="64" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_8" cx="65" cy="75" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_7" cx="50" cy="79" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_6" cx="35" cy="75" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_5" cx="25" cy="64" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_4" cx="21" cy="50" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_3" cx="25" cy="36" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_2" cx="35" cy="25" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle><circle id="actor_1" cx="50" cy="21" r="4" opacity="1" fill="'+svg_color+'" fill-opacity="1" stroke="rgba(166,3,17,1)" stroke-width="0" stroke-opacity="1" stroke-dasharray=""></circle></svg>';
      loading_box
        .css({
          width : $(ta).outerWidth(true),
          height : $(ta).outerHeight(true),
          left : $(ta).offset().left,
          top : $(ta).offset().top,
          'z-index' : 1000
        })
        .attr('id', 'loading' + Math.floor(Math.random()*1000))
        .appendTo($('body').find('.wrap:eq(0)'))
      $(ta).data('mate', loading_box.attr('id'))
      loading_ico.appendTo(loading_box);
      loading_ico.append(svg);
      if(!ta || ta == '.wrap'){
        skt_landing.action.fix_scroll();
      }
      if(size){
        loading_box.addClass('full');
        loading_ico.append(loading_txt);
      }
      skt_landing.action.loading.ani();
    },
    off: function(obj){
      var ta = obj.ta;
      $('#'+$(ta).data('mate')).empty().remove();
    },
    allOff : function(){
      $('.tw-loading').empty().remove();
    },
    ani: function(){
      var actors = {},
          node = document.getElementById(skt_landing.action.loading.svg_id).getElementsByTagName("circle");
      actors.actor_1 = {node: node[11],type: "circle",cx: 50,cy: 21,dx: 8,dy: 32,opacity: 1};
      actors.actor_2 = {node: node[10],type: "circle",cx: 35,cy: 25,dx: 8,dy: 32,opacity: 1};
      actors.actor_3 = {node: node[9],type: "circle",cx: 25,cy: 36,dx: 8,dy: 32,opacity: 1};
      actors.actor_4 = {node: node[8],type: "circle",cx: 21,cy: 50,dx: 8,dy: 32,opacity: 1};
      actors.actor_5 = {node: node[7],type: "circle",cx: 25,cy: 64,dx: 8,dy: 32,opacity: 1};
      actors.actor_6 = {node: node[6],type: "circle",cx: 35,cy: 75,dx: 8,dy: 32,opacity: 1};
      actors.actor_7 = {node: node[5],type: "circle",cx: 50,cy: 79,dx: 8,dy: 32,opacity: 1};
      actors.actor_8 = {node: node[4],type: "circle",cx: 65,cy: 75,dx: 8,dy: 32,opacity: 1};
      actors.actor_9 = {node: node[3],type: "circle",cx: 75,cy: 64,dx: 8,dy: 32,opacity: 1};
      actors.actor_10 = {node: node[2],type: "circle",cx: 79,cy: 50,dx: 8,dy: 32,opacity: 1};
      actors.actor_11 = {node: node[1],type: "circle",cx: 75,cy: 36,dx: 8,dy: 32,opacity: 1};
      actors.actor_12 = {node: node[0],type: "circle",cx: 65,cy: 25,dx: 8,dy: 32,opacity: 1};
      var tricks = {};
      tricks.trick_1 = (function (t, i) {
        i = (function (n) {
          return .5 > n ? 2 * n * n : -1 + (4 - 2 * n) * n
        })(i) % 1, i = 0 > i ? 1 + i : i;
        var _ = t.node;
        0.2 >= i ? _.setAttribute("opacity", i * (t.opacity / 0.2)) : i >= 0.8 ? _.setAttribute("opacity", t.opacity - (i - 0.8) * (t.opacity / (1 - 0.8))) : _.setAttribute("opacity", t.opacity)
      });
      var scenarios = {};
      scenarios.scenario_1 = {
        actors: ["actor_1", "actor_12", "actor_11", "actor_10", "actor_9", "actor_8", "actor_7", "actor_6", "actor_5", "actor_4", "actor_3", "actor_2", "actor_1"],
        tricks: [{
          trick: "trick_1",
          start: 0,
          end: 1.00
              }],
        startAfter: 600,
        duration: 2000,
        actorDelay: 100,
        repeat: 0,
        repeatDelay: 0
      };
      var _reqAnimFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame,
        fnTick = function (t) {
          var r, a, i, e, n, o, s, c, m, f, d, k, w;
          for (c in actors) actors[c]._tMatrix = [1, 0, 0, 1, 0, 0];
          for (s in scenarios)
            for (o = scenarios[s], m = t - o.startAfter, r = 0, a = o.actors.length; a > r; r++) {
              if (i = actors[o.actors[r]], i && i.node && i._tMatrix)
                for (f = 0, m >= 0 && (d = o.duration + o.repeatDelay, o.repeat > 0 && m > d * o.repeat && (f = 1), f += m % d / o.duration), e = 0, n = o.tricks.length; n > e; e++) k = o.tricks[e], w = (f - k.start) * (1 / (k.end - k.start)), tricks[k.trick] && tricks[k.trick](i, Math.max(0, Math.min(1, w)));
              m -= o.actorDelay
            }
          for (c in actors) i = actors[c], i && i.node && i._tMatrix && i.node.setAttribute("transform", "matrix(" + i._tMatrix.join() + ")");
          _reqAnimFrame(fnTick)
        };
      _reqAnimFrame(fnTick);
      }
  },
  popup: { //popup 
    open: function (popup_info,callback_open) {
      var _this = this;
      popup_info.hbs = popup_info.hbs ? popup_info.hbs : 'popup';
      $.get(popup_info.url+popup_info.hbs+'.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        if($('.wrap > .popup,.wrap > .popup-page').length == 0){
          skt_landing.action.fix_scroll();
        }
        $('.wrap').append(html);
        skt_landing.util.set_zindex();
      }).done(function () {
        if(callback_open){
          callback_open();
        }
        var popups = $('.wrap > .popup,.wrap > .popup-page'),
            createdTarget = popups.last();
        if(popup_info.hbs == 'dropdown'){
          createdTarget.addClass('dropdown');
          createdTarget.find('.popup-contents').css('max-height',$(window).height()*0.65);
        }
        /*
        createdTarget.find('.popup-blind').on('click',function(e){
          e.stopPropagation();
        });
        */
        _this.scroll_chk();
        skt_landing.action.header_shadow_popup();
        if(createdTarget.hasClass('popup-page')){
          skt_landing.widgets.widget_init('.popup-page:last');
        }else{
          skt_landing.widgets.widget_init('.popup:last');
        }
        if(popup_info.layer){
          var win_h = skt_landing.util.win_info.get_winH(),
              layer = $('.popup .popup-page.layer'),
              layer_h = layer.height();
          layer.css({
            'height':layer_h,
            'bottom':0
          });
        }
      });
    },
    close_layer : function(callback){
      var layer = $('.popup .popup-page.layer');
      layer.css('bottom','-100%');
      setTimeout(function(){
        layer.closest('.popup').empty().remove();
        if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
          skt_landing.action.auto_scroll();
        }
        if(callback){
          callback();
        }
      },500);
    },
    close: function (target) {
      if(target){
        $(target).closest('.popup,.popup-page').empty().remove();
      }else{
        var popups = $('.wrap > .popup,.wrap > .popup-page');
        popups.eq(popups.length-1).empty().remove();
      }
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      }
    },
    allClose : function (){
      var popups = $('.wrap > .popup,.wrap > .popup-page');
      popups.empty().remove();
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      }
    },
    scroll_chk: function () {
      var pop_h = $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-contents').height();
      if (pop_h > 290) {
        $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').addClass('scrolling');
        $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info .popup-contents').on('scroll',function(){
          var scrTop = $(this).scrollTop();
          if(scrTop == 0){
            $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').removeClass('scrolling-shadow');
          }else if(scrTop != 0 && !$('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').hasClass('scrolling-shadow')){
            $('.wrap > .popup,.wrap > .popup-page').last().find('.popup-info').addClass('scrolling-shadow');
          }
        });
      }
    },
    toast: function (popup_info) {
      var wrap = $('.toast-popup');
      if(wrap.length > 0){
        popup_info.wrap = false;
      }else{
        popup_info.wrap = true;
      }
      $.get(popup_info.url+'toast.hbs', function (text) {
        var tmpl = Handlebars.compile(text);
        var html = tmpl(popup_info);
        if(popup_info.wrap){
          $('body').append(html);
        }else{
          $('.toast-popup').append(html);
        }
      }).done(function () {
        var wrap = $('.toast-popup'),
            layer = wrap.find('.toast-layer').last(),
            layerH = layer.outerHeight(),
            transitionTime = parseFloat(layer.css('transition').split(' ')[1])*1500;
        layer.addClass('on')
        setTimeout(function(){
          layer.removeClass('on');
          setTimeout(function(){
            layer.remove();
          }, transitionTime);
        },popup_info.second * 1000);
      });
    }
  },
  keyboard : function(){ /* input에 focus시 하단 fixed 영역 해제 */
    var selector = '.popup-page textarea, .popup-page input[type=text], .popup-page input[type=date], .popup-page input[type=datetime-local], .popup-page input[type=email], .popup-page input[type=month], .popup-page input[type=number], .popup-page input[type=password], .popup-page input[type=search], .popup-page input[type=tel], .popup-page input[type=time], .popup-page input[type=url], .popup-page input[type=week]';
    $(document).on('focus',selector, function(){
      $(this).closest('.popup-page').addClass('focusin')
    })
    $(document).on('focusout',selector, function(){
      $(this).closest('.popup-page').removeClass('focusin')
    })
  },
  prd_header : function(){ // 상품상세 원장 헤더 색상 제어
    $('#header').removeClass('bg-type');
    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
        $('#header').removeClass('bg-type');
      }else{
        $('#header').addClass('bg-type');
        
      }
    })
  },
  home_slider : function(){ // home 전체 슬라이더
    var homeIndex = 0;
    $('.home-slider .home-slider-belt').each(function(){
      t = $(this).slick({
          dots: false,
          infinite: false,
          speed: 300,
          slidesToShow: 1,
          adaptiveHeight: true,
          nextArrow:'.ico-home-tab-store',
          prevArrow:'.ico-home-tab-my',
          touchMove : true,
          touchThreshold : 4 /* 50% 이동해야지 넘어감 (1/touchThreshold) * the width */
      })
      .on('beforeChange', function(slick, currentSlide){
      })
      .on('afterChange', function(slick, currentSlide){
          if(homeIndex !== $('.home-slider .home-slider-belt').slick('getSlick').currentSlide){
            homeIndex = $('.home-slider .home-slider-belt').slick('getSlick').currentSlide;
            $("html, body").stop().animate({scrollTop:0}, 1, function(){});
            $('.home-tab-belt .tab').eq(homeIndex).find('button, a').addClass('on').closest('.tab').siblings().find('button, a').removeClass('on');
          }
      })
    })
    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
          $('body').removeClass('fly');
      }else{
          $('body').addClass('fly');
      }
      if(skt_landing.util.win_info.get_scrollT() > 39){
          $('.home-tab-belt').addClass('fixed');
      }else{
          $('.home-tab-belt').removeClass('fixed');
      }
    })
    $('.home-tab-belt button, a').on('click', function(){
        if(!$(this).hasClass('on')){
          $('.home-slider .home-slider-belt').slick('slickGoTo', $(this).closest('.tab').index());
          $(this).addClass('on').closest('.tab').siblings().find('button').removeClass('on');
        }
    })
  },
  header_shadow : function(){
    $(window).bind('scroll', function(){
      if(skt_landing.util.win_info.get_scrollT() == 0){
          $('body').removeClass('scroll');
      }else{
          $('body').addClass('scroll');
      }
    })
  },
  header_shadow_popup : function(){
    $('.popup-page').each(function(){
      if($(this).data('scroll') == undefined){
        $(this).data('scroll', true);
        $(this).find('.container-wrap').on('scroll', function(){
          if($(this).scrollTop() > 0){
            $(this).closest('.popup-page').addClass('scroll')
          }else{
            $(this).closest('.popup-page').removeClass('scroll')
          }
        })
      }
    })
  },
  gnb : function(){
    $('.icon-gnb-menu').bind('click', function(){
      skt_landing.action.fix_scroll();
      $('#common-menu').addClass('on');
    })
    $('#common-menu .c-close').bind('click', function(){
      $('#common-menu').removeClass('on');
      if($('.wrap > .popup,.wrap > .popup-page').length == 0 && !$('#common-menu').hasClass('on')){
        skt_landing.action.auto_scroll();
      }
    })
    $('.section-cont').scroll(function(){
      if ($(this).scrollTop() > 0) {
        $('#common-menu').addClass('scroll');
        $('.userinfo').find('.bt').prop('disabled', true);
      }else {
        $('#common-menu').removeClass('scroll');
        $('.userinfo').find('.bt').prop('disabled', false);
      }
    });
    $('.bt-depth1 .more').on('click', function(e){
        if($(this).parent().next().is('.depth2')){
          $(this).parent().parent().toggleClass('open');
        }
    });
  }
};
skt_landing.dev = {
  sortableInit: function(selector, options){
    if(!options){
      options = selector;
      selector = null;
    }
    var $target = $(selector)[0] == $( "#sortable-enabled" )[0] ? $(selector) : $( "#sortable-enabled" );
    var defaults = {
      axis: 'y'
    };
    options = $.extend(defaults, options);
    $target.sortable(options).disableSelection();
   $target.on('touchstart touchend touchmove','.ui-state-default .bt-active button',function(e){
     e.stopPropagation();
   });
   $target.parent().on('click', '.connectedSortable .bt-active button', function(){
     if($(this).closest('.connectedSortable').hasClass('enabled')){
       $('#sortable-disabled').prepend($(this).closest('.ui-state-default'));
       $(this).text('추가');
     }else{
       $(this).closest('.ui-state-default').appendTo('#sortable-enabled');
       $(this).text('삭제');
     }
   });
   $target.on('touchstart touchend touchmove','.bt-sort',function(e){
     e.stopPropagation();
   });
   $target.parent().on('click', '.connectedSortable .bt-sort', function(){
     var parent_cont = $(this).closest('.ui-state-default');
     if($(this).hasClass('up')){
       parent_cont.insertBefore(parent_cont.prev());
     }else{
       parent_cont.insertAfter(parent_cont.next());
     }
   });
  }
}
$(document).on('ready', function () {
  skt_landing.widgets.widget_init();
});
skt_landing.widgets = {
  widget_init: function(ta){ // string : selector
    /* 위젯 구간 */
    widget_list = {};
    var widget_ta = ta ? $(ta+' .widget') : $('.widget');
    widget_ta.each(function (idx) {
      var com = $.trim($(this).find('>.widget-box').attr('class').replace(/widget-box /, ''));
      widget_list['widget_' + com] = skt_landing.widgets['widget_' + com];
    });
    for (var com_name in widget_list) {
      try {
        widget_list[com_name](widget_ta);
      }
      catch(err) {
        console.log('error : ' + com_name); // .widget > .widget-box 구조를 절대적 .widget-box에는 정해진 clsss명만 올수있음 
      }
    }
    skt_landing.widgets.widget_deltype();
    
    /* 컴포넌트 실행 */
    component_list = {};
    var component_ta = ta ? $(ta+' .component') : $('.component');
    component_ta.each(function (idx) {
      var com = $.trim($(this).find('.component-box').attr('class').replace(/component-box /, ''));
      component_list['component_' + com] = skt_landing.widgets['component_' + com];
    });
    for (var com_name in component_list) {
      try {
        component_list[com_name](component_ta);
      }
      catch(err) {
        console.log('error : ' + com_name); // .widget > .widget-box 구조를 절대적 .widget-box에는 정해진 clsss명만 올수있음
      }
    }
  },
  widget_tube: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.tube') : $('.widget-box.tube');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var tube_box = $(this).find('.tube-list'),
          tube_list = tube_box.find('> li');
      var listClass = ['one','two','three','four','five'],
          classValue = null,
          classNum = 0;
      for(var i=0, leng=listClass.length; i<leng; ++i){
        if(tube_box.attr('class').indexOf(listClass[i]) > 0){
          classValue = listClass[i];
          classNum = i+1;
          break;
        }
      }
      if(!tube_list.hasClass('refil-tube')){
        if(typeof classValue != 'string'){
          tube_box.addClass('five');
          classValue = 'five';
          classNum = 5;
        }
        tube_list.first().addClass('top-left');
        tube_list.last().addClass('bottom-right');
        tube_list.eq(tube_list.length < classNum ? tube_list.length-1 : classNum-1).addClass('top-right');
        tube_list.filter(function(index){
          var val = 0;
          if(tube_list.length == classNum){val = 0;}
          else if(tube_list.length > classNum && tube_list.length % classNum == 0){val = parseInt(tube_list.length / classNum) * classNum - classNum;}
          else{val = parseInt(tube_list.length / classNum) * classNum;}
          return index === val;
        }).addClass('bottom-left');

      }

      var _this = $(this);
      if(_this.find('input:checked').length > 0){
        setRadioState(_this.find('input:checked').last());
      }
      _this.find('input').on('change',function(){
        setRadioState($(this));
      }).on('focusin',function(){
        $(this).closest('li').addClass('focus');
      }).on('focusout',function(){
        $(this).closest('li').removeClass('focus');
      });
      _this.find('li').on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
    function setRadioState(target){
      var target = $(target),
          label = target.closest('li').not('.disabled');
      if(target.closest('li').hasClass('disabled')) return ;
      target.closest('li').siblings('.disabled').attr('aria-disabled',true);
      label.siblings().removeClass('checked').attr('aria-checked',false);
      label.siblings().find('input').attr('checked',false).prop('checked',false);
      label.addClass('checked').attr('aria-checked',true);
      target.attr('checked',true).prop('checked',true);
    }
  },
  widget_deltype: function(){
    $('.input').each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var bt = $(this).find('.cancel'),
          field = bt.prev();
      if(field.val() == '' || field.attr('readonly')){
        bt.hide();
      }else{
        bt.show();
      }
      bt.on('click',function(){
        field.val('').focus();
        bt.hide();
      });
      field.on('change keyup',function(){
        if($(this).val() == ''){
          bt.hide();
        }else{
          bt.show();
        }
      });
    });
  },
  widget_step: function () {
    $('.step-list li').each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      if(!$(this).hasClass('on')){
        $(this).attr('aria-hidden', true);
      }
    });
  },
  widget_radio: function (ta) {
    var input = ta ? $(ta).find('.radiobox :radio') : $('.radiobox :radio');
    input.each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var box = $(this).closest('.radiobox');
      if($(this).closest('.radio-slide').length > 0){
        var radioSlide = $(this).closest('.radio-slide'),
            radioItems = radioSlide.find('.radiobox'),
            itemsW = 0;
        for(var i=0, leng=radioItems.length; i<leng; ++i){
          itemsW += radioItems.eq(i).outerWidth(true);
        }
        radioSlide.find('.select-list').css('width',itemsW + 1);
      }

      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked',true) : box.removeClass('checked').attr('aria-checked',false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled',true) : box.removeClass('disabled');
      
      $(this).on('change', function () {
        if ($(this).prop('disabled')) return;
        var nameGroup = $('[name=' + $(this).attr('name') + ']').not(this);
        nameGroup.closest('li').removeClass('checked').attr('aria-checked',false);
        nameGroup.attr('checked', false).prop('checked',false);
        $(this).closest('li').addClass('checked').attr('aria-checked',true);
        $(this).attr('checked', 'checked').prop('checked',true);
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });

      box.on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
  },
  widget_check: function (ta) {
    var input = ta ? $(ta).find('.checkbox :checkbox') : $('.checkbox :checkbox');
    input.each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var box = $(this).closest('.checkbox');
      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked',true) : box.removeClass('checked').attr('aria-checked',false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled',true) : box.removeClass('disabled');
      $(this).on('click', function () {
        if ($(this).prop('checked')) {
          box.addClass('checked').attr('aria-checked',true);
          $(this).attr('checked', true);
        } else {
          box.removeClass('checked').attr('aria-checked',false);
          $(this).attr('checked', false);
        }
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });
      box.on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('click');
      });
    });
  },
  widget_file: function(ta){
    var input = ta ? $(ta).find('.widget-box.file') : $('.widget-box.file');
    input.each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var file = $(this).find('.file'),
          vfile = $(this).find('.fileview');
      if(vfile){
        file.on('change',function(){
          vfile.val($(this).val());
        });
      }
    });
  },
  widget_tfCombined: function (ta) {
    var box = ta ? $(ta).find('.txfield-combined') : $('.txfield-combined');
   
      box.each(function(){
        if($(this).data('event') == undefined){
          $(this).data('event', 'bind')
        }else{
          return;
        }
        var _this = $(this);
        var count = 0;
        _this.find('.input-focus').on('focus',function(e){
          count ++;
          _this.addClass('focus');
          if(count > 0){
            _this.find('.inner-tx').addClass('once');
          }
        }).on('blur',function(){
          _this.removeClass('focus');
        });
      });
/* 정체 불명 
      box.find('.combined-cell').each(function(num){
        var _this = $(this);
        var _this_w = _this.width();
        var _dt_w = _this.find('dt').width();
        $('.combined-cell').eq(num).find('dt').width(_dt_w);
        $('.combined-cell').eq(num).find('dd').width(_this_w-_dt_w);
      });
*/
  },
  widget_slider1: function (ta) {
    var widget = ta ? $(ta).find('.slider1') : $('.slider1');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this).find('.slider');
      _this.slick({
        dots: true,
        arrows: true,
        infinite: false,
        speed : 300,
        // useTransform : false,
        // mobileFirst : true,
        // useCSS : false,
        // useTransform : false,
        centerMode: false,
        focusOnSelect: false,
        touchMove : true,
        customPaging: function(slider, i) {
          return $('<span />').text(i + 1);
        },
      });
      var $slick = _this.slick('getSlick');
      var $slides = $slick.$slides;
      var slideIndex = $slick.slickCurrentSlide();
      $slides.on('click', function () {
        var $this = $(this);
        slideIndex = $slides.index($this);
        $slides.removeClass('slick-current slick-active');
        $this.addClass('slick-current slick-active');
      });
      _this.on('beforeChange', function (e) {
        setTimeout(function () {
          $slides.eq($slick.slickCurrentSlide()).triggerHandler('click');
        }, 0);
      });
      if($('.home-slider').length > 0){
        _this.on({
          'mousedown' : function(){
            $('.home-slider .home-slider-belt')[0].slick.setOption({
              swipe: false
            })
          },
          'touchstart' : function(){
            $('.home-slider .home-slider-belt')[0].slick.setOption({
              swipe: false
            })
          },
          'mouseup' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'edge' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'setPosition' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'beforeChange' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'afterChange' : function(){
            setTimeout(function(){
              $('.home-slider .home-slider-belt')[0].slick.setOption({
                swipe: true
              })
            },200)
          },
          'mousemove' : function(){
          },
          'swipe' : function(){
          }
        })
      }
    });
  },
  widget_slider2: function (ta) {
    var widget = ta ? $(ta).find('.slider2') : $('.slider2');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this).find('.slider');
      _this.slick({
        dots: false,
        arrows: false,
        infinite: true,
        speed : 700,
        centerMode: false,
        focusOnSelect: false,
        vertical:true,
        verticalSwiping:true,
        autoplay:true,
        autoplaySpeed:5000
      });

      var $slick = _this.slick('getSlick');
      var $slides = $slick.$slides;
      var slideIndex = $slick.slickCurrentSlide();
      $slides.on('click', function () {
        var $this = $(this);
        slideIndex = $slides.index($this);
        $slides.removeClass('slick-current slick-active');
        $this.addClass('slick-current slick-active');
      });
      _this.on('beforeChange', function (e) {
        setTimeout(function () {
          $slides.eq(slideIndex).triggerHandler('click');
        }, 0);
      });
    });
  },
  widget_accordion: function (ta) {
    var widget = ta ? $(ta).find('.widget-box.accordion') : $('.widget-box.accordion');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this);
      if(_this.find('> .acco-cover > .bt-whole').length < 1){
        _this.find('.acco-cover').addClass('on');
      }
      var accoList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      var accoList_leng = accoList.length;
      if($(this).find('> .acco-cover > .acco-style').hasClass('none-event')) return ; // 이벤트를 적용하지 않을 경우

      var setOnList = _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box');
      for(var i=0, leng=setOnList.length; i<leng; ++i){
        if(setOnList.eq(i).find('> .acco-tit button').length < 1 && _this.find('.acco-cover.disabled').length < 1){
          // 열고닫는 버튼이 없고 diabled 클래스도 없는 경우
          setOnList.eq(i).addClass('on');
        }
        if(setOnList.eq(i).find('> .acco-tit').length < 1 && setOnList.eq(i).find('> .acco-cont').length > 0){
          // 제목이 없고 내용만 있는 경우
          setOnList.eq(i).addClass('imp-view');
        }
      }
      // _this.find('.acco-cover:not(".focuson")')/*.addClass('toggle')*/.find('.acco-box.on').removeClass('on');  // 2018-07-19 default : 모두 닫힘, toggle 여부에 따라 다름
      _this.find('> .acco-cover > .bt-whole button').on('click',function(event){
        if(!$(this).closest('.acco-cover').hasClass('on')){
          $(this).attr('aria-pressed', 'true');
          //$('.popup .popup-page.layer').animate({scrollTop:acco_top}, '200');
          event.stopPropagation();
        }else{
          $(this).attr('aria-pressed', 'false');
        }
        $(this).closest('.acco-cover').toggleClass('on');
      });
      _this.find('> .acco-cover > .acco-style > .acco-list > .acco-box:not(".none-event") > .acco-tit button:not(".btn-tip")').on('click', function (event) {
        
        if(_this.find('> .acco-cover').hasClass('toggle')){
          $(this).closest('.acco-box').siblings().removeClass('on');
          $(this).closest('.acco-box').siblings().find('> .acco-tit button').attr('aria-pressed',false);
        }
        $(this).closest('.acco-box').toggleClass('on');

        if($(this).closest('.acco-box').hasClass('on')){
          $(this).attr('aria-pressed', 'true');
          event.stopPropagation();
        }else{
          $(this).attr('aria-pressed', 'false');
        };
      });
    })
  },
  widget_accordion2: function(ta){
    var widget = ta ? $(ta).find('.widget-box.accordion2') : $('.widget-box.accordion2');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this),
          box = _this.find('> .acco-style > .acco-box'),
          list = box.find('> .acco-list'),
          btn = list.find('> .acco-title button');
      for(var i=0,leng=list.length; i<leng;++i){
        setState(btn.eq(i), list.eq(i).hasClass('on'));
      }
      box.on('click','> .acco-list > .acco-title button',function(){
        if(!$(this).hasClass('none-event')){
          setState($(this), !$(this).closest('.acco-list').hasClass('on'));
        }
      });
      function setState(button, state){
        var button = $(button);
        if(state){
          button.closest('.acco-list').addClass('on');
        }else{
          button.closest('.acco-list').removeClass('on');
        }
        if(box.hasClass('toggle') && state){
          button.closest('.acco-list').siblings().find('> .acco-title button').attr('aria-pressed', false);
          button.closest('.acco-list').siblings().removeClass('on');
        }
        button.attr('aria-pressed', state);
      }
    });
  },
  widget_switch: function (ta) {
    var widget = ta ? $(ta).find('.switch .btn-switch input') : $('.switch .btn-switch input');
    $(widget).each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      checkSwitch(this, !$(this).closest('.btn-switch').hasClass('on'));
      $(this).on('change', function () {
        checkSwitch(this);
      }).on('focusin',function(){
        $(this).closest('.btn-switch').addClass('focus');
      }).on('focusout',function(){
        $(this).closest('.btn-switch').removeClass('focus');
      });
      $(this).closest('.switch-style').on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
    function checkSwitch(target, state){
      var target = $(target),
          state = typeof state == 'boolean' ? state : target.closest('.btn-switch').hasClass('on');
      if(target.attr('disabled')){
        target.closest('.switch-style').attr('aria-disabled', true);
        target.closest('.btn-switch').addClass('disabled');
        return ;
      }else{
        target.closest('.switch-style').attr('aria-disabled', false);
        target.closest('.btn-switch').removeClass('disabled');
      }
      if (state) {
        target.closest('.btn-switch').removeClass('on');
        target.closest('.switch-style').attr('aria-checked',false);
        target.attr('checked',false);
      } else {
        target.closest('.btn-switch').addClass('on');
        target.closest('.switch-style').attr('aria-checked',true);
        target.attr('checked',true);
      }

    }
  },
  widget_switch2: function (ta) {
    var widget = ta ? $(ta).find('.switch2 .btn-switch input') : $('.switch2 .btn-switch input');
    $(widget).each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var box = $(this).closest('li');
      $(this).is(':checked') ? box.addClass('checked').attr('aria-checked',true) : box.removeClass('checked').attr('aria-checked',false);
      $(this).is(':disabled') ? box.addClass('disabled').attr('aria-disabled',true) : box.removeClass('disabled');
      $(this).on('change', function () {
        if ($(this).prop('disabled')) return;
        var nameGroup = $('[name=' + $(this).attr('name') + ']').not(this);
        nameGroup.closest('li').removeClass('checked').attr('aria-checked',false);
        nameGroup.attr('checked', false).prop('checked',false);
        $(this).closest('li').addClass('checked').attr('aria-checked',true);
        $(this).attr('checked', 'checked').prop('checked',true);
      }).on('focusin', function () {
        box.addClass('focus');
      }).on('focusout', function () {
        box.removeClass('focus');
      });

      box.on('click',function(e){
        if(e.target.tagName.toLowerCase() == 'input' && e.target != e.currentTarget) return ;
        $(this).find('input').trigger('change');
      });
    });
  },
  widget_toggle: function(ta){
    var widget = ta ? $(ta).find('.bt-toggle') : $('.bt-toggle');
    widget.each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      $(this).on('click', function(){
        var _this = $(this);
        var toggler = _this.closest('.toggle').find('.toggler');
        if (toggler.is(':hidden')) {
          toggler.slideDown();
          _this.attr('aria-pressed', 'true');
          _this.addClass('open');
        } else {
          toggler.slideUp();
          _this.attr('aria-pressed', 'false');
          _this.removeClass('open');
        }
      })
    })
  },
  component_tabs: function (ta) {
    var tabArr = ta ? $(ta).find('.tabs .tab-area') : $('.tabs .tab-area');
    tabArr.each(function () {
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this),
          tabList = _this.find('.tab-linker'),
          tabCont = _this.find('.tab-contents');
      initLinkSlide(tabList);
      tabListOnChk();

      tabList.find('button:not(".tip-view"), a:not(".tip-view")').on('click',function(){
        if($(this).hasClass('disabled')){ // .disabled시 비활성화
          return false;
        }
        $(this).closest('li').attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        tabListOnChk();
        initLinkSlide(tabList);
      });

      function tabListOnChk(){
        var tabListIdx = tabList.find('li[aria-selected="true"]').index();
        if(tabListIdx != -1){
          tabCont.children('ul').children('li').eq(tabListIdx).attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
        }
      }
      function initLinkSlide(tabList){
        var items = tabList.find('li');
        var itemsW = parseInt(items.closest('ul').css('padding-left'))*2;
        for(var i=0,leng=items.length; i<leng; ++i){
          itemsW += Math.ceil(items.eq(i).outerWidth(true));
        }
        if(skt_landing.util.win_info.get_winW() > itemsW){
          items.closest('ul').css('width','100%');
        }else{
          items.closest('ul').css('width',itemsW);
        }
      }
    });
  },
  widget_toggle01: function(ta) {
    var widget = ta ? $(ta).find('.toggle01') : $('.toggle01');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this);
      var _item = _this.find('> .representcharge-list > li');
      widget.on('click','> .representcharge-list > li > .representcharge-info',function(){
        if ( $(this).attr('aria-pressed') === 'true' ) {
          $(this).closest('li').removeClass('current');
          $(this).attr('aria-pressed','false');
        } else {
          $(this).closest('li').addClass('current');
          $(this).attr('aria-pressed','true');
        }
      });
    });
  },
  widget_toggle02: function(ta) {
    var widget = ta ? $(ta).find('.toggle02') : $('.toggle02');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var _this = $(this);
      var _list = _this.find('> .suggest-tag-list');
      var _btn  = _this.find('.suggest-tag-morewrap button, .suggest-tag-morewrap a');
      var _ul = _this.find('ul:eq(0)');
      if(_list.height() >= _ul.height()){
        _btn.remove();
      }else{
        widget.on('click','> .suggest-tag-morewrap button, .suggest-tag-morewrap a',function(){
          if ( _btn.attr('aria-pressed') === 'true' ) {
            $(_list).removeClass('openlist-wrap');
            $(_btn).removeClass('openbtn');
            $(_btn).attr('aria-pressed', 'false');
          } else {
            $(_list).addClass('openlist-wrap');
            $(_btn).addClass('openbtn');
            $(_btn).attr('aria-pressed', 'true');
          }
        });
      }
    });
  },
  widget_horizontal: function(ta){
    var widget = $(ta).find('.horizontal');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var belt = $(this).find('.horizontal-list'),
          slide = $(this).find('.horizontal-slide'),
          items = belt.find('> li'),
          itemsW = 0;
      for(var i=0; items.length > i; ++i){
        itemsW += Math.ceil(items.eq(i).outerWidth(true));
      }
      belt.css('width', itemsW + 3);
      /*
      if(itemsW <= slide.width()){
        belt.css('width','100%');
      }else if(itemsW > slide.width()){
        belt.css('width', itemsW + 1);
      }
      */
    });
  },
  widget_donutchart: function(ta){
    var widget = ta ? $(ta).find('.widget-box.donutchart') : $('.widget-box.donutchart');
    $(widget).each(function(){
      if($(this).data('event') == undefined){
        $(this).data('event', 'bind')
      }else{
        return;
      }
      var time = 1500,
      now = 0,
      interval = 10,
      max = 100,
      loop = 100,
      reverceTic = 1,
      _this = this;
      $(_this).find('.donut-chart .c100').each(function(){
        $(this)
            .data('reverce', false)
            .data('now', 0)
            .data('unit', (max - $(this).data('percent') + loop) / (time / interval))
            .data('reverse', 0)
      })
      var t = setInterval(function(){
        $(_this).find('.donut-chart .c100').each(function(){
            if(!$(this).data('reverse')){
               $(this).data('now', Math.ceil($(this).data('unit') * now / 10));
            }else{
              $(this).data('reverse', $(this).data('reverse') + 1)
              $(this).data('now', max - Math.floor($(this).data('unit') * $(this).data('reverse')));
            }
            $(this).attr('class','').addClass('c100').addClass('p'+$(this).data('now'));
            if($(this).data('now') >= max){ // reverse flag
              $(this).data('now', max)
              $(this).data('reverse', true)
            }
        })
        now += interval;
        if(now >= time){
          $(_this).find('.donut-chart .c100').each(function(){
            $(this).attr('class','').addClass('c100').addClass('p'+$(this).data('percent'));
          })
          clearInterval(t);
        }
      }, interval)
    });
  }
}
