/**
 * @file 소개페이지
 * @author anklebreaker
 * @since 2019-04-05
 */

/**
 * @class
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.CommonUtilIntro = function (rootEl) {
  this.$container = rootEl;
  /**
   * @member {Object}
   * @desc 동영상 관리자
   */
  this.videoManager = (function () {
    var $videos = rootEl.find('video');
    var currentVideos = [];

    var _calculateOffset = function () {
      var headerHeight = $('.h-belt').height();

      return function (element) {
        var $element = $(element);
        return {
          top: $element.offset().top,
          bottom: $element.offset().top + $element.height() - headerHeight
        };
      };
    }();

    /**
     * @function
     * @desc 현재 재생중인 video
     * @param {Number} top 현재 스크롤 y
     * @returns {Array} 재생중 비디오 element array
     */
    function _getCurrentVideos(top) {
      var bottom = top + $(window).height();
      return $videos.filter(function () {
        return bottom >= this.dataset.top && top <= this.dataset.bottom;
      });
    }

    /**
     * @function
     * @desc 현재 화면에서 비디오 재생 가능여부 체크
     * @returns {Boolean}
     */
    function _canPlay() {
      currentVideos = _getCurrentVideos(window.scrollY);
      return currentVideos.length > 0;
    }

    /**
     * @function
     * @desc 현재 재생중인 비디오인지 체크
     * @param {HTMLVideoElement} video 비디오 element
     * @returns {Boolean}
     */
    function _isCurrentVideo(video) {
      for (var i = 0, len = currentVideos.length; i < len; i++) {
        if (currentVideos[i] === video) {
          return true;
        }
      }
      return false;
    }

    /**
     * @function
     * @desc 재생 중 비디오 정지
     */
    function _pause() {
      $videos.filter(function () {
        return !_isCurrentVideo(this) && !this.paused;
      }).each(function () {
        this.currentTime = 0;
        this.pause();
      });
    }

    /**
     * @function
     * @desc 현재 화면에 보이는 비디오 재
     */
    function _play() {
      _pause();
      for (var i = 0, len = currentVideos.length; i < len; i++) {
        if (currentVideos[i].paused) {
          currentVideos[i].play();
        }
      }
    }

    /**
     * @desc 각 비디오의 offset 계산
     */
    $videos.each(function () {
      var offset = _calculateOffset(this);
      this.dataset.top = offset.top;
      this.dataset.bottom = offset.bottom;
    });

    return {
      play: _play,
      pause: _pause,
      canPlay: _canPlay
    };
  })();

  /**
   * @desc event binding
   */
  if (!Tw.BrowserHelper.isApp()) {
    this.$container.on('click', '.bt-down', function () {
      var offsetAppDownload = $(document).height();
      return function () {
        window.scrollTo(0, offsetAppDownload);
      };
    }());
  }

  this.$container.on('click', '.icon-gnb-close', function () {
    history.back();
  });

  $(window).on('scroll', function () {
    if (this.videoManager.canPlay()) {
      this.videoManager.play();
    } else {
      this.videoManager.pause();
    }
  }.bind(this));

};
