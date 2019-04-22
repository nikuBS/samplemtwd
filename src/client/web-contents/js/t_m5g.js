(function ($, window, document) {
    var pluginName = 'circle_datepicker';
    var defaults = {
        start: 12,
        end: 12,
        step: 15,
        width: 230,
        height: 230,
        step_mins: 15,
        gradation: 4.9315   // 5로 설정하면 72칸으로 00시 00분에서 11시 50분까지 선택 가능. 4.9315로 설정시 73칸으로 00시 00분에서 12시 00분까지 선택 가능
    };

    function polar_to_cartesian (cx, cy, radius, angle) {
        var radians;
        radians = (angle - 90) * Math.PI / 180.0;
        return [Math.round((cx + (radius * Math.cos(radians))) * 100) / 100, Math.round((cy + (radius * Math.sin(radians))) * 100) / 100];
    }

    function svg_arc_path (x, y, radius, range) {
        var end_xy, start_xy, long;
        start_xy = polar_to_cartesian(x, y, radius, range[1]);
        end_xy = polar_to_cartesian(x, y, radius, range[0]);
        long = range[1] - range[0] >= 180 ? 1 : 0;
        return "M " + start_xy[0] + " " + start_xy[1] + " A " + radius + " " + radius + " 0 " + long + " 0 " + end_xy[0] + " " + end_xy[1];
    }

    function angle_from_point (width, height, x, y) {
        return -Math.atan2(width/2-x, height/2-y) * 180 / Math.PI;
    }

    function time_to_angle (time) {
        return (time - 6) * 360 / 12 - 180;
    }

    function timerange_to_angle (timeRange) {
        return [time_to_angle(timeRange[0]), time_to_angle(timeRange[1])];
    }

    function angle_to_time (angle, step_mins) {
        return 6 + Math.floor((180+angle)*12/360*(60/step_mins))/(60/step_mins);
    }


    CircleDatepicker = function (element, options) {
        this.$el = $(element);
        this.options = $.extend({}, defaults, options);
        this.$path = this.options.path_el ? $(this.options.path_el) : this.$el.find('.circle-datepicker__path');
        this.$end = this.options.end_el ? $(this.options.end_el) : this.$el.find('.circle-datepicker__end');
        this.$endBack = this.options.endBack_el ? $(this.options.endBack_el) : this.$el.find('.circle-datepicker__endBack');
        this.value = timerange_to_angle([this.options.start, this.options.end]);
        this.pressed = null;
        this.oldValues = [];
        this.angle;
        this.oldCircle = 0;
        this.init();
    };

    CircleDatepicker.prototype.init = function () {
        var _this = this;

        this.draw();

        //['path', 'start', 'end'].forEach(function(el){
        ['end'].forEach(function(el){
            $(_this['$'+el]).on('mousedown touchstart', function(e){
                this.elMouseDown(e, el);
                _this.startTrigger.bind(_this)();
            }.bind(_this));
        });

        $(document).on('mouseup touchend', function(){
            _this.pressed = null;
        });

        $(document).on('mousemove touchmove', _this.docMouseMove.bind(_this));


        this.$el.on('circledatepickerredraw',  function (e, options) {
            _this.value[0] = 0;
            _this.value[1] = options.pi;
            //_this.value[2] = options.pi / 5; // 2.5는 한칸당 5분 / 5는 한칸당 10분
            _this.value[2] = options.pi / _this.options.gradation; // 72칸이 아닌 73칸으로 만들기 위해

            _this.draw.bind(_this)();
            _this.trigger.bind(_this)();
        });
    };

    CircleDatepicker.prototype.elMouseDown = function (e, el) {
        var pageX, pageY;

        e.preventDefault();

        pageX = e.type === 'mousedown' ? e.pageX : e.originalEvent.changedTouches[0].pageX;
        pageY = e.type === 'mousedown' ? e.pageY : e.originalEvent.changedTouches[0].pageY;

        this.angle = angle_from_point(this.options.width, this.options.height, pageX - this.$el.offset().left, pageY - this.$el.offset().top);
        this.oldValues = [this.value[0], this.value[1]];
        this.pressed = el;
    };

    CircleDatepicker.prototype.docMouseMove = function (e) {
        var pageX, pageY, diff;

        if (this.pressed) {
            e.preventDefault();

            pageX = e.type === 'mousemove' ? e.pageX : e.originalEvent.changedTouches[0].pageX;
            pageY = e.type === 'mousemove' ? e.pageY : e.originalEvent.changedTouches[0].pageY;
            diff = this.angle - angle_from_point(this.options.width, this.options.height, pageX - this.$el.offset().left, pageY - this.$el.offset().top);

            if (this.pressed === 'path') {
                this.value = [this.oldValues[0] - diff, this.oldValues[1] - diff];
            } else if (this.pressed === 'start') {
                if (this.oldValues[0] - diff > this.oldValues[1]) {
                    diff = diff + 360;
                }
                this.value[0] = this.oldValues[0] - diff;
            } else if (this.pressed === 'end') {
                if (this.oldValues[1] - diff < this.oldValues[0]) {
                    diff = diff - 360;
                }
                this.value[1] = this.oldValues[1] - diff;
            }

            this.value[0] = this.value[0] % 360;
            this.value[1] = this.value[1] % 360;
            this.value[2] = this.value[1] % 360 / this.options.gradation;

            var _this = this;
            requestAnimationFrame(function () {
                _this.draw.bind(_this)();
                _this.trigger.bind(_this)();
                _this.oldCircle = _this.value[2];
            })
        }
    };

    CircleDatepicker.prototype.drawCircle = function (el, angle) {
        el.setAttribute('cx', polar_to_cartesian(150, 150, 115, angle)[0]);
        el.setAttribute('cy', polar_to_cartesian(150, 150, 115, angle)[1]);
    };

    CircleDatepicker.prototype.draw = function () {
        this.$path.get(0).setAttribute('d', svg_arc_path(150, 150, 115, this.value));
        this.drawCircle(this.$endBack.get(0), this.value[1]);
        this.drawCircle(this.$end.get(0), this.value[1]);
    };

    CircleDatepicker.prototype.startTrigger = function () {
        this.$el.trigger('circle-datepicker');
    };

    CircleDatepicker.prototype.trigger = function () {
        var direction;
        if (Math.round(this.oldCircle) === 0 && Math.round(this.value[2]) === 72) {
            direction = false;
        } else if (Math.round(this.oldCircle) === 72 && Math.round(this.value[2]) === 0) {
            direction = true;
        } else {
            direction = this.value[2] > this.oldCircle;
        }

        this.$el.trigger('change', [[angle_to_time(this.value[0], this.options.step_mins), angle_to_time(this.value[1], this.options.step_mins)]]);
        this.$el.trigger('timer', [[this.value[2], direction]]);
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_#{pluginName}")) {
                $.data(this, "plugin_#{pluginName}", new CircleDatepicker(this, options));
            }
        });
    }
})(jQuery, window, document);
