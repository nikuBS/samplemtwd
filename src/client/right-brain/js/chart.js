$.fn.chart = function(option){
  var chart_data = {caption:'표제목',tf_txt:'평균값',td_txt:'각항목값',da_arr:[]};
  $.extend(chart_data,option.data);
  var ani_arr = [],
      ani_arr1 = [],//bar타입만 사용
      co_pattern = [],
      pa_idx = 0,
      pat = [],
      max = [],
      inter = null;
  var container = document.getElementsByClassName(option.container)[0],
    ww = container.clientWidth,
    pding = parseInt(window.getComputedStyle(document.getElementsByClassName(option.container)[0]).getPropertyValue("padding-left"))*2,
    _gap = 50,
    graph_unit = option.h*.25,
    chart_gap = Math.floor((ww-pding)/(chart_data.da_arr.length)),
    canvas = container.getElementsByTagName('canvas')[0],
    can = canvas.getContext('2d');
  canvas.width = ww-pding;
  canvas.height = option.h;
  canvas.style.letterSpacing = '.03rem';
  canvas.setAttribute('aria-hidden',true);
  var chart_length = chart_data.da_arr.length;
  for(var i = 0; i < chart_length; ++i){//애니메이션 초기값 설정
    if(option.type == 'basic' || option.type == 'basic_1'){
      ani_arr[i] = unit_count(option.max*.5);
      //ani_arr[i] = unit_count(option.max);
      max[i] = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal});
    }else if(option.type == 'bar'){
      var pattern_legnth = chart_data.co_p.length;
      ani_arr1[i] = unit_count(option.max*.5);
      ani_arr[i] = unit_count(option.max*.5);
      //ani_arr[i] = unit_count(option.max);
      max[i] = sum(chart_data.da_arr[i].data);
    }else if(option.type == 'bar_1'){
      ani_arr[i] = unit_count(option.max*.5);
      max[i] = sum(chart_data.da_arr[i].data);
    }else{
      var total = sum_aver_total(chart_data.da_arr),
        _sum = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal}),
        per = Math.PI*2*_sum/total;
      if(i == 0){
        ani_arr[i] = {start:0,end:per,progress:0};
      }else{
        ani_arr[i] = {start:ani_arr[i-1].end,end:ani_arr[i-1].end+per,progress:ani_arr[i-1].end};
      }
    }
  }
  for(var i = 0; i<pattern_legnth; ++i){
    if(chart_data.co_p[i].indexOf('img') > 0){
      co_pattern[i] = new Image();
      co_pattern[i].src = chart_data.co_p[i];
      pa_idx++;
      co_pattern[i].addEventListener('load',function(){
        co_pattern[pa_idx] = can.createPattern(co_pattern[pa_idx],'repeat');
      });
    }else{
      co_pattern[i] = chart_data.co_p[i];
    }
  }
  inter = setInterval(ani,10);
  max.sort(function(a,b){return a<b;});
  option.max = max[0];
  option.min = max[max.length-1];
  create_tag(chart_data,chart_length);
  function ani(){
    can.fillStyle = '#fff';
    can.fillRect(0,0,ww,option.h);
    guide_line();
    can.setLineDash([]);
    switch(option.type){
      case 'circle':
        var total = sum_aver_total(chart_data.da_arr);
        for(var i = 0; i < chart_length; ++i){
          var _sum = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal});
          ani_arr[i].progress += (ani_arr[i].end-ani_arr[i].progress)*option.spd;
          can.beginPath();
          can.fillStyle = co_pattern[i];
          can.moveTo((ww-pding)*.5,option.h*.5);
          can.arc((ww-pding)*.5,option.h*.5,option.h*.3,ani_arr[i].start,ani_arr[i].progress,false);
          can.fill();
          can.closePath();
          can.beginPath();
          can.fillStyle = chart_data.da_arr[i].co;
          can.textAlign = 'center';
          can.textBaseline = 'middle'; 
          can.font = '1.25rem Arial';
          can.fillText(_sum,Math.cos(ani_arr[i].progress)*(option.h*.4)+(ww-pding)*.5,Math.sin(ani_arr[i].progress)*(option.h*.4)+option.h*.5-20);
          can.font = '1rem Arial';
          can.fillText(chart_data.da_arr[i].na,Math.cos(ani_arr[i].progress)*(option.h*.4)+(ww-pding)*.5,Math.sin(ani_arr[i].progress)*(option.h*.4)+option.h*.5);
        }
        break;
      case 'bar':
        for(var i = 0; i < chart_length; ++i){
          var _sum = sum_data1(chart_data.da_arr[i].data),
              _sum1 = sum(chart_data.da_arr[i].data,true),
              _sum2 = sum_data1(chart_data.da_arr[i].sale_data),
              _sum3 = sum(chart_data.da_arr[i].sale_data,true);
          ani_arr[i] += (unit_count(_sum)-ani_arr[i])*option.spd;
          ani_arr1[i] += (unit_count(_sum2)-ani_arr1[i])*option.spd;
          for(var j = 0; j<pattern_legnth; ++j){
            var num_gap = 0,
              target = null,
              num_txt = '0',
              txt_co = '';
            if(j == 0){
              num_gap = -15;
              target = ani_arr[i];
              num_txt = _sum1;
              txt_co = chart_data.txt_co;
            }else{
              num_gap = 15;
              target = ani_arr1[i];
              if(_sum3 != 0) num_txt = '- '+_sum3;
              txt_co = chart_data.sale_co;
            }
            if(num_txt != '0'){
              can.beginPath();
              can.strokeStyle = co_pattern[j];
              can.lineWidth = 8;
              can.lineCap = 'round';
              can.moveTo(chart_gap*i+_gap+num_gap,unit_count(option.max));
              can.lineTo(chart_gap*i+_gap+num_gap,target);
              can.stroke();
            }
            can.font = '0.5625rem Arial';
            can.fillStyle = txt_co;
            can.textBaseline = 'middle';
            can.textAlign = 'center';
            can.fillText(num_txt,chart_gap*i+_gap+num_gap,target-15);     
          }
          can.beginPath();
          can.fillStyle = chart_data.txt_co;
          can.font = '0.8125rem Arial';
          can.fillText(chart_data.da_arr[i].na,chart_gap*i+_gap,unit_count(option.max)+_gap*.25);
        }
        break;
      case 'bar_1':
        for(var i = 0; i < chart_length; ++i){
          var _sum = sum_data1(chart_data.da_arr[i].data),
              _sum1 = sum(chart_data.da_arr[i].data,true);
          ani_arr[i] += (unit_count(_sum)-ani_arr[i])*option.spd;
          
          if(_sum1 != '0'){
            can.beginPath();
            can.strokeStyle = chart_data.co_p[0];
            can.lineWidth = 8;
            can.lineCap = 'round';
            can.moveTo(chart_gap*i+_gap,unit_count(option.max));
            can.lineTo(chart_gap*i+_gap,ani_arr[i]);
            can.stroke();
          }
          can.font = '0.5625rem Arial';
          can.fillStyle = '#000';
          can.textBaseline = 'middle';
          can.textAlign = 'center';
          can.fillText(_sum1+' 원',chart_gap*i+_gap,ani_arr[i]-15);     
          
          can.beginPath();
          can.fillStyle = chart_data.txt_co;
          can.font = '0.8125rem Arial';
          can.fillText(chart_data.da_arr[i].na,chart_gap*i+_gap,unit_count(option.max)+15);
        }
        break;
      case 'basic':
        
      default:
        for(var i = 0; i < chart_length; ++i){
          var _sum = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal});
          ani_arr[i] += (unit_count(option.max-_sum)-ani_arr[i])*option.spd;
          
          can.beginPath();
          can.strokeStyle = '#ddd';
          can.moveTo(chart_gap*i+_gap,unit_count(0));
          can.lineTo(chart_gap*i+_gap,unit_count(option.max));
          can.stroke();
          can.closePath();
          
          can.beginPath();
          can.fillStyle = '#fff';
          can.strokeStyle = chart_data.line_co;
          can.moveTo(chart_gap*i+_gap,ani_arr[i]);
          can.lineTo(chart_gap*(i+1)+_gap,ani_arr[i+1]);
          can.stroke();
          can.closePath();
          can.beginPath();
          can.arc(chart_gap*i+_gap,ani_arr[i],5,0,Math.PI*2,true);
          can.fill();
          can.stroke();
          
          can.fillStyle = chart_data.txt_co;
          can.beginPath();
          can.textAlign = 'center';
          can.textBaseline = 'middle';
          can.font = '0.625rem Arial';
          if(option.type == 'basic_1'){
            can.fillText(operation_time(_sum),chart_gap*i+_gap,unit_count(0)-_gap*.25);
          }else{
            can.fillText(_sum,chart_gap*i+_gap,unit_count(0)-_gap*.25);
          }
          can.font = '0.8125rem Arial';
          can.fillText(chart_data.da_arr[i].na,chart_gap*i+_gap,unit_count(option.max)+_gap*.25);
        }
        break;
    }
    setTimeout(function(){
      clearInterval(inter);
      switch(option.type){
        case 'circle':
          for(var i = 0; i < chart_length; ++i){
            can.beginPath();
            can.fillStyle = pat[i];
            can.moveTo((ww-pding)*.5,option.h*.5);
            can.arc((ww-pding)*.5,option.h*.5,option.h*.3,ani_arr[i].start,ani_arr[i].end,false);
            can.fill();
            can.closePath();
          }
          break;
        case 'bar':
          /*
          for(var i = 0; i < chart_length; ++i){
            var _sum = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal});
            can.beginPath();
            can.strokeStyle = co_pattern[i];
            can.lineWidth = 25;
            can.moveTo(chart_gap*i+chart_gap+_gap*.5,option.h-_gap*.5-1);
            can.lineTo(chart_gap*i+chart_gap+_gap*.5,unit_count(option.max-_sum));
            can.stroke();
            can.closePath();
          }
          */
          break;
        case 'basic':
          
        default:
          /*for(var i = 0; i < chart_length; ++i){
            var _sum = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal});
            can.beginPath();
            can.strokeStyle = '#000';
            can.strokeStyle = chart_data.da_arr[i].co;
            can.arc(chart_gap*i+chart_gap+_gap*.5,unit_count(option.max-_sum),5,0,Math.PI*2,true);
            can.fillStyle = chart_data.da_arr[i].co;
            can.fill();
            can.beginPath();
            can.moveTo(chart_gap*i+chart_gap+_gap*.5,option.h-_gap*.5);
            can.lineTo(chart_gap*i+chart_gap+_gap*.5,unit_count(option.max-_sum));
            can.strokeStyle = chart_data.da_arr[i].co;
            can.stroke();
            can.closePath();
          }*/
          break;
      }
    },1000);
  }
  function sum(arr,won){//각 배열합
    var num = 0,
      total = arr.length;
    for(var i = 0; i < total; ++i){
      if(option.type == 'basic_1'){
        num += operation_minutes(arr[i]);
      }else{
        num += arr[i];
      }
    }
    if(won){
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }else{
      return num;
    }
  }
  function sum_aver(arr,obj){//각 배열합 평균
    var num = 0,
      total = arr.length,
      _obj = obj;
    for(var i = 0; i < total; ++i){
      if(option.type == 'basic_1'){
        num += operation_minutes(arr[i]);
      }else{
        num += arr[i];
      }
    }
    if(_obj.decimal){
      return Math.round((num/total)*Math.pow(10,_obj.decimal))/Math.pow(10,_obj.decimal);
    }else{
      return Math.round((num/total));
    }
  }
  function sum_aver_total(arr){//각 배열합 평균 합
    var total = arr.length,
      total_num = 0;
    for(var i = 0; i < total; ++i){
      total_num += sum_aver(arr[i].data,{'decimal':option.decimal});
    }
    return total_num;
  }
  function sum_data1(arr){
    var num = 0,
      total = arr.length;
    for(var i = 0; i < total; ++i){
      num += arr[i];
    }
    return Math.round((1-(num/option.max))*option.max);
  }
  /*function total_Average(decimal){
    var total = chart_data.da_arr.length;
    return Math.round((sum_aver_total(chart_data.da_arrchart_data.da_arr)/total)*Math.pow(10,decimal))/Math.pow(10,decimal);
  }*/
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
  function unit_count(num){
    var num1 = 0,
        count = 0;
    if(option.h < 200){
      num1 = .5;
    }else if(option.h < 250){
      num1 = .6;
    }else{
      num1 = .65;
    }
    if(option.type == 'bar_1'){
      count = (option.h*(num1+.15))*(num/option.max)+graph_unit*(1.1-num1); 
    }else{
      count = (option.h*num1)*(num/option.max)+graph_unit*.5;    
    }
    return count;
  }
  function guide_line(){
    can.fillStyle = chart_data.txt_co;    
    can.font = '1rem Arial';
    if(option.type == 'basic' || option.type == 'basic_1'){
      can.beginPath();
      can.strokeStyle = '#eee';
      can.moveTo(0,option.h-20);
      can.lineTo(ww-pding,option.h-20);
      can.stroke();
      can.closePath();
      for(var i = 0; i < option.guide_num; ++i){
        can.beginPath();
        can.strokeStyle ='#bbb';
        can.setLineDash([4, 4]);
        can.moveTo(0,unit_count((option.max-option.min)*.5));
        can.lineTo(ww-pding,unit_count((option.max-option.min)*.5));
        //can.moveTo(0,Math.round(option.h/(option.guide_num+1))*(i+1)*.75);
        //can.lineTo(ww-pding,Math.round(option.h/(option.guide_num+1))*(i+1)*.75);
        
        
        //can.moveTo(chart_gap*i+_gap+num_gap,unit_count(option.min));
        //can.lineTo(chart_gap*i+_gap+num_gap,target);
        
        can.stroke();
        can.closePath();
      }
      /*
      //y_name 생략
      can.textAlign = 'left';
      can.textBaseline = 'top';
      can.font = '0.875rem Arial';
      can.fillText(option.y_name,0,0);
      can.fillStyle = '#000';
      can.textAlign = 'right';
      can.font = 'bold 1.25rem Arial';
      if(option.type == 'basic_1'){
        can.fillText(operation_time(total_Average(option.decimal)),ww-pding-1,0);
      }else{
        can.fillText(total_Average(option.decimal),ww-pding-1,0);
      }
      */
      
      can.fillStyle = chart_data.txt_co;
      can.font = '0.75rem Arial';
      can.textBaseline = 'bottom';
      can.textAlign = 'left';
      can.fillText('--- 3개월 평균',0,option.h);
      can.textAlign = 'right';
      can.fillText(option.x_name,ww-pding-1,option.h);
      
    }else if(option.type == 'bar'){
      can.beginPath();
      can.lineWidth = 1;
      can.strokeStyle = '#eee';
      can.moveTo(0,option.h*.9);
      can.lineTo(ww-pding,option.h*.9);
      can.stroke();
      can.closePath();
      
      for(var i = 0; i < pattern_legnth; ++i){
        can.beginPath();
        can.fillStyle = co_pattern[i];
        can.arc(70*i+5,option.h-7,5,0,Math.PI*2,true);
        can.fill();
        can.closePath();
        can.textBaseline = 'bottom';
        can.textAlign = 'left';
        if(i == 0){
          var bar_txt = '사용';
        }else{
          var bar_txt = '할인';
        }
        can.fillStyle = chart_data.txt_co;
        can.font = '0.75rem Arial';
        can.fillText(bar_txt,70*i+15,option.h);
      }
      
      can.fillStyle = chart_data.txt_co;
      can.font = '0.75rem Arial';
      can.textBaseline = 'bottom';
      can.textAlign = 'right';
      can.fillText(option.x_name,ww-pding-1,option.h);
    }else if(option.type == 'circle'){
      var total = sum_aver_total(chart_data.da_arr);
      can.textAlign = 'right';
      can.textBaseline = 'middle'; 
      can.fillText('총 '+total+'건',ww-pding-_gap*.35,unit_count(option.max));
    }
  }
  function create_tag(chart_data,chart_length){
    var table_container = document.getElementsByClassName(option.container)[0];
    if(table_container.getElementsByTagName('table')[0]){
      table_container.removeChild(table_container.getElementsByTagName('table')[0]);
    }
    var t_table = document.createElement('table'),
      t_caption = document.createElement('caption'),
      t_thead = document.createElement('thead'),
      t_tfoot = document.createElement('tfoot'),
      t_tbody = document.createElement('tbody');
    document.getElementsByClassName(option.container)[0].appendChild(t_table);
    t_table.appendChild(t_caption);
    t_table.appendChild(t_thead);
    t_table.appendChild(t_tfoot);
    t_table.appendChild(t_tbody);
    t_table.setAttribute('class','blind');
    t_caption.innerHTML = chart_data.caption;
    var tth = t_thead.appendChild(document.createElement('tr')),
      ttf = t_tfoot.appendChild(document.createElement('tr')),
      ttb = t_tbody.appendChild(document.createElement('tr'));
    for(var i = 0; i < chart_length+1; ++i){
      var th = tth.appendChild(document.createElement('th'));
      if(i == 0){
        var tf = ttf.appendChild(document.createElement('th')),
        td = ttb.appendChild(document.createElement('th'));
      }else{
        var tf = ttf.appendChild(document.createElement('td')),
        td = ttb.appendChild(document.createElement('td'));
      }

      if(i == 0){
        th.innerHTML = '';
        tf.innerHTML = chart_data.tf_txt;
        tf.setAttribute('scope','row');
        td.innerHTML = chart_data.td_txt;
        td.setAttribute('scope','row');
      }else{
        th.innerHTML = chart_data.da_arr[i-1].na;
        th.setAttribute('scope','col');
        tf.innerHTML = sum_aver(chart_data.da_arr[i-1].data,{'decimal':option.decimal});
        td.innerHTML = chart_data.da_arr[i-1].data;
      }
    }
  }
}