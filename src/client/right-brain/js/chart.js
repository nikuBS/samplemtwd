$.fn.chart = function(option){
  var chart_data = {caption:'표제목',tf_txt:'평균값',td_txt:'각항목값',da_arr:[]};
  $.extend(chart_data,option.data);
  var container = document.getElementsByClassName(option.container)[0],
      chart_length = chart_data.da_arr.length,
      max = [];
  var chart_ul = make_tag('ul','chart_ul',container);
  
  for(var i = 0; i < chart_length; ++i){
    if(option.unit == 'time'){
      max[i] = operation_minutes(chart_data.da_arr[i].data[0]);
    }else{
      max[i] = chart_data.da_arr[i].data;
    }
  }
  
  max.sort(function(a,b){
    return b - a;
  });
  max = max[0];
  for(var i = 0; i <= chart_length; ++i){
    var el = make_tag('li','chart_li',chart_ul);
    el.setAttribute('class','graph_list');
    el.style.width = 100/(chart_length+1)+'%';
    var el_dl = make_tag('dl','chart_dl',el),
        el_dt = make_tag('dt','chart_dt',el_dl),
        el_dd = make_tag('dd','chart_dd',el_dl),
        box = make_tag('span','span_bar_box',el_dd),
        bar = make_tag('span','span_bar',box),
        txt = make_tag('span','span_txt',box);
    el_dt.setAttribute('class','graph_tit');
    box.setAttribute('class','box');
    txt.setAttribute('class','txt');
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
      bar.setAttribute('class','bar');
    }
  }
  var line_box = make_tag('span','line_box',container),
      line = make_tag('span','line',line_box);
  line_box.setAttribute('class','line-box');
  line.setAttribute('class','line');
  line.style.bottom = (average_count/max)*100+'%';
  
  function make_tag(tag,name,parent){
    name = document.createElement(tag);
    parent.appendChild(name);
    return name;
  }
  function sum_aver(arr,decimal){//각 배열합 평균
    var num = 0,
      total = arr.length;
    for(var i = 0; i < total; ++i){
      if(option.unit == 'time'){
        num += operation_minutes(arr[i].data[0]);
      }else{
        num += arr[i].data*1;
      }
    }
    if(decimal){
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
}