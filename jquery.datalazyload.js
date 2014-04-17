(function(window, document, jQuery) {
    /*
     * 数据延迟加载jQuery插件
     * author: del1214@sina.com
     * last modify: 2014-04-15
     * options 可不传
     * callback 必须传
     */

    jQuery.fn.dataLazyLoad = function(options, callback) {
        // 默认参数
        var settings = {
            containerClass: 'lazyload-container', //自定义容器class
            loadedClass: 'lazyload-loaded',
            event: 'lazyload-scrollstop', //自定义事件名 不能定义成其他window事件名
            threshold: 0, //阀值
            removeEvent: true, //全部加载完成后是否解除事件绑定
            timeout: 400
        };
        // 将传入的参数整合到默认参数中
        if (typeof options === 'function') {
            callback = options;
            options = {};
        }
        jQuery.extend(settings, options);
        var container = jQuery(window), // 获得主窗体
            height = container.height(), //窗体高度
            elements = this.find('.' + settings.containerClass), //获得所有需要延迟加载的dom,this是jquery找到的dom
            containers = [],
            scrollTimer = null;
        // 取出所有延迟加载容器的偏移值，事件中不触发大量reflow
        for (var j = 0, len = elements.length; j < len; j++) {
            var offset = jQuery(elements[j]).offset();
            containers.push({
                element: elements[j],
                top: offset.top,
                left: offset.left
            });
        }

        // scroll 事件回调
        var scrollCallback = function(event) {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function() {
                container.trigger(settings.event);
            }, settings.timeout);
        };

        // 滚动停止事件回调
        var scrollStopCallback = function(event) {
            // 每次事件需取出屏幕位置
            var top = container.scrollTop(),
                bottom = height + top,
                hasLoading = false;
            for (var i = 0, len = containers.length; i < len; i++) {
                var item = jQuery(containers[i].element);
                // 有未被加载的就将hasLoading 置为true
                if (settings.removeEvent && !item.hasClass(settings.loadedClass)) {
                    hasLoading = true;
                }
                if (!item.hasClass(settings.loadedClass)) {
                    //在上下半屏内的可以加载
                    if ((containers[i].top >= (top - height/2 + settings.threshold)) && (containers[i].top <= (bottom + height/2 - settings.threshold))) {
                        item.addClass(settings.loadedClass);
                        //执行回调返回dom
                        callback.call(this, containers[i].element);
                    }
                }
            }
            // 不再有未被加载的就解除绑定事件
            if (settings.removeEvent && hasLoading === false) {
                container.unbind('resize', resizeCallback);
                container.unbind('scroll', scrollCallback);
                container.unbind(settings.event, scrollStopCallback);
            }
        };

        // resize回调
        var resizeCallback = function(event) {
            height = container.height();
            width = container.width();
        };
        // 绑定触发事件，一般为scroll
        container.on('resize', resizeCallback);
        container.on(settings.event, scrollStopCallback);
        container.on('scroll', scrollCallback);
        // 默认触发一次
        container.trigger(settings.event);
    };
})(window, document, jQuery);