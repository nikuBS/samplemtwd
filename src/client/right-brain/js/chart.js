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
    for(var i = 0; i <= chart_length; ++i){
      var el = make_tag('li','graph-list',chart_ul);
      el.style.width = 100/(chart_length+1)+'%';
      var el_dl = make_tag('dl','chart-dl',el),
          el_dt = make_tag('dt','graph-tit',el_dl),
          el_dd = make_tag('dd','chart-dd',el_dl),
          box = make_tag('span','box',el_dd),
          bar = make_tag('span','bar',box),
          txt = make_tag('span','txt',box);
      var count,count_txt,average_count,average_txt;
      if(i == chart_length){
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