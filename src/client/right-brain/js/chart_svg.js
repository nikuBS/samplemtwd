$.fn.chart = function(option){
  var chart_data = {caption:'표제목',tf_txt:'평균값',td_txt:'각항목값',da_arr:[]};
  $.extend(chart_data,option.data);
  var ani_arr = [],
      ani_arr1 = [],//bar타입만 사용
      co_pattern = [],
      target = [],
      pa_idx = 0,
      pat = [],
      max = [],
      target_num = 0,
      inter = null,
      target_ani = [];
  
  var chart_length = chart_data.da_arr.length;
  
  var container = document.getElementsByClassName(option.container)[0],
      xmlns = 'http://www.w3.org/2000/svg',
      fs = parseInt(window.getComputedStyle(document.getElementsByTagName('html')[0]).getPropertyValue('font-size')),
      ww = container.clientWidth,    
      _gap = 50,
      graph_unit = option.h*.25,
      pding = parseInt(window.getComputedStyle(document.getElementsByClassName(option.container)[0]).getPropertyValue("padding-left"))*2,
      chart_gap = Math.floor((ww-pding)/(chart_data.da_arr.length)),
      svg = container.getElementsByTagName('svg')[0];
  svg.setAttribute('aria-hidden',true);
  svg.setAttribute('width',ww-pding);
  svg.setAttribute('height',option.h);
  
  for(var i = 0; i < chart_length; ++i){//애니메이션 초기값 설정
    if(option.type == 'basic' || option.type == 'basic_1'){
      ani_arr[i] = unit_count(option.max*.5);
      max[i] = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal});
    }else if(option.type == 'bar'){
      var pattern_legnth = chart_data.co_p.length;
      ani_arr1[i] = unit_count(option.max*.5);
      ani_arr[i] = unit_count(option.max*.5);
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
    co_pattern[i] = chart_data.co_p[i];
  }
  max.sort(function(a,b){return a<b;});
  option.max = max[0];
  option.min = max[max.length-1];
  
  guide_line();
  make_svg();
  
  create_tag(chart_data,chart_length);
  function make_svg(){
    var ani_idx = 0;
    switch(option.type){
      case 'circle':
        break;
      case 'bar':
        for(var i = 0; i < chart_length; ++i){
          var _sum1 = sum(chart_data.da_arr[i].data,true),
              _sum3 = sum(chart_data.da_arr[i].sale_data,true);
          for(var j = 0; j<pattern_legnth; ++j){
            var num_gap = 0,
              target = null,
              num_txt = '0',
              txt_co = '';
            if(j == 0){
              num_gap = -15;
              num_txt = _sum1;
              txt_co = chart_data.txt_co;
            }else{
              num_gap = 15;
              if(_sum3 != 0) num_txt = '- '+_sum3;
              txt_co = chart_data.sale_co;
            }
            target_ani[ani_idx] = make_obj({
              'tag':'line',
              'p':svg,
              'obj':{
                'stroke':chart_data.co_p[j],
                'stroke-linecap':'round',
                'stroke-width':8,
                'x1':chart_gap*i+_gap+num_gap,
                'y1':unit_count(option.max),
                'x2':chart_gap*i+_gap+num_gap,
                'y2':unit_count(option.max)
              }
            });
            if(num_txt == '0'){
              target_ani[ani_idx].style.display = 'none';
            }
            ani_idx++;
            target_ani[ani_idx] = make_obj({
              'tag':'text',
              'p':svg,
              'obj':{
                'x':chart_gap*i+_gap+num_gap,
                'y':unit_count(option.max)+_gap*.3,
                'fill':chart_data.txt_co,
                'text-anchor':'middle'
              },
              'style':{
                'font-size':rem(9,true)
              },
              'txt':0
            });
            ani_idx++;
            make_obj({
              'tag':'text',
              'p':svg,
              'obj':{
                'x':chart_gap*i+_gap,
                'y':unit_count(option.max)+_gap*.3,
                'fill':chart_data.txt_co,
                'text-anchor':'middle'
              },
              'style':{
                'font-size':rem(13,true)
              },
              'txt':chart_data.da_arr[i].na
            });
          }
        }
        break;
      case 'bar_1':
        for(var i = 0; i < chart_length; ++i){
          var _sum = sum_data1(chart_data.da_arr[i].data),
              _sum1 = sum(chart_data.da_arr[i].data,true);
          target_ani[ani_idx] = make_obj({
            'tag':'line',
            'p':svg,
            'obj':{
              'stroke':chart_data.co_p[0],
              'stroke-linecap':'round',
              'stroke-width':8,
              'x1':chart_gap*i+_gap,
              'y1':unit_count(option.max),
              'x2':chart_gap*i+_gap,
              'y2':unit_count(option.max)
            }
          });
          if(_sum1 == '0'){
            target_ani[ani_idx].style.display = 'none';
          }
          ani_idx++;
          target_ani[ani_idx] = make_obj({
            'tag':'text',
            'p':svg,
            'obj':{
              'x':chart_gap*i+_gap,
              'y':unit_count(option.max)-15,
              'fill':'#000',
              'text-anchor':'middle'
            },
            'style':{
              'font-size':rem(9,true)
            },
            'txt':_sum1+' 원'
          });
          ani_idx++;
          make_obj({
            'tag':'text',
            'p':svg,
            'obj':{
              'x':chart_gap*i+_gap,
              'y':unit_count(option.max)+20,
              'fill':chart_data.txt_co,
              'text-anchor':'middle'
            },
            'style':{
              'font-size':rem(13,true)
            },
            'txt':chart_data.da_arr[i].na
          });
        }
        
        break;
      case 'basic':
        
      default:
        for(var i = 0; i < chart_length; ++i){
          var _sum = sum_aver(chart_data.da_arr[i].data,{'decimal':option.decimal});
          make_obj({
            'tag':'path',
            'p':svg,
            'obj':{
              'd':'M'+(chart_gap*i+_gap)+' '+unit_count(0)+' L'+(chart_gap*i+_gap)+' '+unit_count(option.max)+' Z',
              'stroke':'#ddd',
              'stroke-width':'1'
            },
            'style':{},
            'txt':''
          });
          if(i != chart_length-1){
            target_ani[ani_idx] = make_obj({
              'tag':'path',
              'p':svg,
              'obj':{
                'd':'M'+(chart_gap*i+_gap)+' '+ani_arr[i]+' L'+(chart_gap*(i+1)+_gap)+' '+ani_arr[i+1]+' Z',
                'stroke':chart_data.line_co,
                'stroke-width':'1'
              },
              'txt':'',
              'target':true
            });
            ani_idx++;
          }
          target_ani[ani_idx] = make_obj({
            'tag':'circle',
            'p':svg,
            'obj':{
              'fill':'#fff',
              'stroke':chart_data.line_co,
              'stroke-width':'1',
              'cx':chart_gap*i+_gap,
              'cy':ani_arr[i],
              'r':'5'
            },
            'txt':'',
            'target':true
          });
          ani_idx++;
          make_obj({
            'tag':'text',
            'p':svg,
            'obj':{
              'x':chart_gap*i+_gap,
              'y':unit_count(0)-_gap*.2,
              'fill':chart_data.txt_co,
              'text-anchor':'middle'
            },
            'style':{
              'font-size':rem(10,true)
            },
            'txt':option.type  == 'basic_1' ? operation_time(_sum) : _sum 
          });
          make_obj({
            'tag':'text',
            'p':svg,
            'obj':{
              'x':chart_gap*i+_gap,
              'y':unit_count(option.max)+_gap*.3,
              'fill':chart_data.txt_co,
              'text-anchor':'middle'
            },
            'style':{
              'font-size':rem(13,true)
            },
            'txt':chart_data.da_arr[i].na
          });
        }
        break;
    }
    inter = setInterval(ani,10);
    setInterval(function(){clearInterval(inter);},1000);
  }
  function ani(){
    switch(option.type){
      case 'circle':
        break;
      case 'bar':
        for(var i = 0; i < target_ani.length; ++i){
          var j = Math.floor(i/4);
          var _sum = sum_data1(chart_data.da_arr[j].data),
              _sum1 = sum(chart_data.da_arr[j].data,true),
              _sum2 = sum_data1(chart_data.da_arr[j].sale_data),
              _sum3 = sum(chart_data.da_arr[j].sale_data,true);
          ani_arr[j] += (unit_count(_sum)-ani_arr[j])*option.spd;
          ani_arr1[j] += (unit_count(_sum2)-ani_arr1[j])*option.spd;
          if(target_ani[i].nodeName == 'line'){
            if(i%4 < 2){
              target_ani[i].setAttribute('y2',ani_arr[j]);
            }else{
              target_ani[i].setAttribute('y2',ani_arr1[j]);
            }
          }else if(target_ani[i].nodeName == 'text'){
            if(i%4 < 2){
              target_ani[i].setAttribute('y',ani_arr[j]-10);
              target_ani[i].innerHTML = _sum1;
            }else{
              target_ani[i].setAttribute('y',ani_arr1[j]-10);
              target_ani[i].innerHTML = _sum3;
            }
          }
        }
        break;
      case 'bar_1':
        for(var i = 0; i < target_ani.length; ++i){
          var j = Math.floor(i/2);
          var _sum = sum_data1(chart_data.da_arr[j].data);
          ani_arr[j] += (unit_count(_sum)-ani_arr[j])*option.spd;
          if(target_ani[i].nodeName == 'line'){
            target_ani[i].setAttribute('y2',ani_arr[j]);
          }else if(target_ani[i].nodeName == 'text'){
            target_ani[i].setAttribute('y',ani_arr[j]-10);
          }
        }
        break;
      case 'basic':
        
      default:
        for(var i = 0; i < target_ani.length; ++i){
          var j = Math.floor(i/2);
          var _sum = sum_aver(chart_data.da_arr[j].data,{'decimal':option.decimal});
          ani_arr[j] += (unit_count(option.max-_sum)-ani_arr[j])*option.spd;
          if(target_ani[i].nodeName == 'path'){
            target_ani[i].setAttribute('d','M'+(chart_gap*j+_gap)+' '+ani_arr[j]+' L'+(chart_gap*(j+1)+_gap)+' '+ani_arr[j+1]+' Z');
          }else if(target_ani[i].nodeName == 'circle'){
            target_ani[i].setAttribute('cy',ani_arr[j]);
          }
        }
        break;
    }
  }
  function make_obj(option){
    var t = document.createElementNS(xmlns, option.tag);
    if((typeof option.obj.fill == 'string' && option.obj.fill.indexOf('img/') > 0) || (typeof option.obj.stroke == 'string' && option.obj.stroke.indexOf('img/') > 0)){
      var id = ran_id_create();
      var def = document.createElementNS(xmlns, 'defs');
      option.p.appendChild(def);
      var pattern = document.createElementNS(xmlns, 'pattern');
      pattern.setAttribute('x',0);
      pattern.setAttribute('y',0);
      pattern.setAttribute('width',8);
      pattern.setAttribute('height',8);
      pattern.setAttribute('patternUnits','userSpaceOnUse');
      pattern.setAttribute('id',id);
      def.appendChild(pattern);
      var im = document.createElementNS(xmlns, 'image');
      pattern.appendChild(im);
      im.setAttribute('x',0);
      im.setAttribute('y',0);
      im.setAttribute('width',8);
      im.setAttribute('height',8);
      if(option.obj.fill){
        im.setAttribute('href',option.obj.fill);
        option.obj.fill = 'url(#'+id+')';
      }else{
        im.setAttribute('href',option.obj.stroke);
        option.obj.stroke = 'url(#'+id+')';
      }
    }
    for(var i in option.obj){
      t.setAttribute(i,option.obj[i]);
    }
    for(var i in option.style){
      t.style[i] = option.style[i];
    }
    if(option.txt) t.innerHTML = option.txt;
    if(option.target){
      target[target_num] = option.p.appendChild(t);
      target_num++;
    }else{
      option.p.appendChild(t);
    }
    return t;
  }
  
  function guide_line(){
    if(option.type == 'basic' || option.type == 'basic_1'){
      make_obj({
        'tag':'path',
        'p':svg,
        'obj':{
          'd':'M0 '+(option.h-20)+' L'+(ww-pding)+' '+(option.h-20)+' Z',
          'stroke':'#eee',
          'stroke-width':'1'
        },
        'style':{},
        'txt':''
      });
      make_obj({
        'tag':'path',
        'p':svg,
        'obj':{
          'd':'M0 '+unit_count((option.max-option.min)*.5)+' L'+(ww-pding)+' '+unit_count((option.max-option.min)*.5)+' Z',
          'stroke-dasharray':'5,10',
          'stroke':'#bbb',
          'stroke-width':'1'
        },
        'style':{},
        'txt':''
      });
      make_obj({
        'tag':'text',
        'p':svg,
        'obj':{
          'x':0,
          'y':option.h-rem(12),
          'fill':chart_data.txt_co,
          'text-anchor':'start'
        },
        'style':{
          'font-size':rem(12,true)
        },
        'txt':'--- 3개월 평균'
      });
      make_obj({
        'tag':'text',
        'p':svg,
        'obj':{
          'x':ww-pding,
          'y':option.h-rem(12),
          'fill':chart_data.txt_co,
          'text-anchor':'end'
        },
        'style':{
          'font-size':rem(12,true)
        },
        'txt':option.x_name
      });
    }else if(option.type == 'bar'){
      make_obj({
        'tag':'path',
        'p':svg,
        'obj':{
          'd':'M0 '+(option.h-20)+' L'+(ww-pding)+' '+(option.h-20)+' Z',
          'stroke':'#eee',
          'stroke-width':'1'
        },
        'style':{},
        'txt':''
      });
      for(var i = 0; i < pattern_legnth; ++i){
        make_obj({
          'tag':'circle',
          'p':svg,
          'obj':{
            'fill':chart_data.co_p[i],
            'cx':70*i+5,
            'cy':option.h-5,
            'r':'5'
          },
          'txt':'',
          'target':true
        });
        var tt = i == 0 ? '사용' : '할인';
        make_obj({
          'tag':'text',
          'p':svg,
          'obj':{
            'x':70*i+15,
            'y':option.h-rem(12),
            'fill':chart_data.txt_co,
            'text-anchor':'start'
          },
          'style':{
            'font-size':rem(12,true)
          },
          'txt':tt
        });
      }
      make_obj({
        'tag':'text',
        'p':svg,
        'obj':{
          'x':ww-pding,
          'y':option.h-rem(12),
          'fill':chart_data.txt_co,
          'text-anchor':'end'
        },
        'style':{
          'font-size':rem(12,true)
        },
        'txt':option.x_name
      });
    }else if(option.type == 'circle'){
      
    }
  }
  function rem(num,rem){
    if(rem){
      return num/fs+'rem';
    }else{
      return num/fs;
    }
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
  function sum_data1(arr){
    var num = 0,
      total = arr.length;
    for(var i = 0; i < total; ++i){
      num += arr[i];
    }
    return Math.round((1-(num/option.max))*option.max);
  }
  function sum_aver_total(arr){//각 배열합 평균 합
    var total = arr.length,
      total_num = 0;
    for(var i = 0; i < total; ++i){
      total_num += sum_aver(arr[i].data,{'decimal':option.decimal});
    }
    return total_num;
  }
  function operation_minutes(num){
    return (num.split(':')[0]*1*60)+num.split(':')[1]*1;
  }
  function operation_time(num){
    var min = Math.floor(num/60),
        sec = num%60;
    return min+'분 '+sec+'초';
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
  
  function ran_id_create(){
    var d = new Date().getTime(),
        ranid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){
          var r = (d+Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x7|0x8)).toString(16);
        });
    return ranid;
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