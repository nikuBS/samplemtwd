/**
 * FileName: common.util.intro.js
 */

Tw.CommonUtilIntro = function (rootEl) {
  this.$container = rootEl;
  this.videoManager = (function () {
    var $videos = rootEl.find('video');
    var currentVideo = null;

    var _calculateOffset = function () {
      var windowHeight = $(window).height();
      var headerHeight = $('.h-belt').height();

      return function (element) {
        var $element = $(element);
        var gap = windowHeight - $element.height();

        return {
          top: $element.offset().top - (gap > headerHeight ? gap + headerHeight : headerHeight),
          bottom: $element.offset().top + $element.height() - headerHeight - gap
        };
      };
    }();

    function _getCurrentVideo(y) {
      return $videos.filter(function () {
        return y >= this.dataset.top && y <= this.dataset.bottom;
      })[0];
    }

    function _canPlay() {
      currentVideo = _getCurrentVideo(window.scrollY);
      return currentVideo && currentVideo.paused;
    }

    function _pause() {
      $videos.filter(function () {
        return this !== currentVideo && !this.paused;
      }).each(function () {
        this.pause();
      });
    }

    function _play() {
      _pause();
      currentVideo.play();
    }

    // calculate video offest
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

  // event binding
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
