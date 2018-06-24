(function ($) {

    $.widget('ng.gallery', {
        options: {
            json_option_file_url: 'http://www.nilsole.net/json.json',
            language: 'en'
        },

        status: {
            currently_active: null,
            currently_switching: null,
            next_active: null,
            global_eventswitch_status: 0,
            global_callback_counter: 0,
            img_loaded_counter: 0,
            xtcore_loaded: 0
        },

        varstack: {
            milestone_queue: [ ],
            globaloption_div_innerwidth: 0
        },

        replaceTag: function (tag) {
            var self = this, o = this.options, el = this.element;
            var tagsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            };
            return tagsToReplace[tag] || tag;
        },

        safe_tags_replace: function (str) {
            var self = this, o = this.options, el = this.element;
            str = String(str);
            return str.replace(/[&<>"]/g, self.replaceTag);
        },

        kill: function (msg) {
            var self = this, o = this.options, el = this.element;
            self.options = { };
            $(el).find('*[data-dw-status!="error"]').remove();
            $(el).append($('<span></span>', { 'data-dw-status': 'error', html: '<br data-dw-status="error">' + self.safe_tags_replace(msg) }));
        },

        getMultilingualOption: function (data) {
            var self = this, o = this.options, el = this.element;
            if (typeof data !== 'object' || (!data[o.language] && !data['multi']))
                return '';
            return (data[o.language]) ? data[o.language] : data['multi'];
        },

        createLayerCarousel: function () {
            var self = this, o = this.options, el = this.element;
            var intro = o.intro;
            var $div_wrapper = $('<div></div>');
            var $ul_wrapper = $('<ul></ul>');
            if (intro.mode === 'panorama') {
                var $li_wrapper = $('<li></li>', { 'class': 'carouselLayer', 'data-dw-id': '-1', 'data-dw-nr': '0' });
                var $img_wrapper = $('<div></div>', { 'class': 'teaserImg' });
                var $img = $('<img>', {'class': 'imgPanorama', alt: self.getMultilingualOption(intro.title), src: self.safe_tags_replace(self.getMultilingualOption(intro.preview_picture))});
                $ul_wrapper.append($li_wrapper.append($img_wrapper.append($img)));
            }
            else if (intro.mode === 'default') {
                for (var i = 0; i < intro.elements.length; i++) {
                    var ce = intro.elements[i];
                    var $li_wrapper = $('<li></li>', { 'class': 'carouselLayer', 'data-dw-id': '-1', 'data-dw-nr': i.toString(), 'data-dw-type': self.safe_tags_replace(ce.type) });
                    var $img_wrapper = $('<div></div>', { 'class': 'teaserImg' });
                    if (ce.type === 'image')
                        var $img = $('<img>', {'class': 'imgDefault', alt: self.getMultilingualOption(ce.title), src: self.safe_tags_replace(self.getMultilingualOption(ce.url))});
                    else
                        var $img = $('<span></span>');
                    var $teaser_wrapper = $('<div></div>', {'class': 'teaserContentWrap'});
                    var $topic_header = $('<div></div>', {'class': 'topicHeader', html: self.safe_tags_replace(self.getMultilingualOption(ce.topic_header_text))});
                    var $img_headline = $('<div></div>', {'class': 'imageHeadline', html: self.safe_tags_replace(self.getMultilingualOption(ce.title))});
                    var $img_description = $('<div></div>', {'class': 'imageDescription', html: self.safe_tags_replace(self.getMultilingualOption(ce.description))});
                    $teaser_wrapper.append($topic_header).append($img_headline).append($img_description);
                    if (intro.elements.length > 1) {
                        var $gallery_navigation = $('<div></div>', {'class': 'myGalleryNavigation'});
                        var $numbers_row = $('<ul></ul>', {'class': 'numbersInRow'});
                        var start = i - 1;
                        if ((i - 4) <= 0)
                            start = 0;
                        else if (i > intro.elements.length - 5)
                            start = intro.elements.length - 5;
                        for (var y = start; y < (6 + start) && y < intro.elements.length; y++) {
                            var class_name = 'inactive';
                            if (y === i)
                                class_name = 'active';
                            var $li_row = $('<li></li>', {'class': class_name, text: self.safe_tags_replace(y + 1) });
                            $gallery_navigation.append($numbers_row.append($li_row));
                        }
                        var $gostart_slideshow = $('<div></div>', {'class': 'goStartSlideshow'});
                        var $goend_slideshow = $('<div></div>', {'class': 'goEndSlideshow'});
                        var $gonext_slideshow = $('<div></div>', {'class': 'goNextSlideshow'});
                        var $goback_slideshow = $('<div></div>', {'class': 'goBackSlideshow'});
                        $teaser_wrapper.append($gallery_navigation).append($gostart_slideshow).append($goend_slideshow).append($gonext_slideshow).append($goback_slideshow);
                    }
                    $ul_wrapper.append($li_wrapper.append($img_wrapper.append($img)).append($teaser_wrapper));
                }
            }
            for (var z = 0; z < o.events.length; z++) {
                for (var i = 0; i < o.events[z].elements.length; i++) {
                    var ce = o.events[z].elements[i];
                    var $li_wrapper = $('<li></li>', { 'class': 'carouselLayer', 'data-dw-id': z.toString(), 'data-dw-nr': i.toString(), 'data-dw-type': self.safe_tags_replace(ce.type) });
                    var $img_wrapper = $('<div></div>', { 'class': 'teaserImg' });
                    if (ce.type === 'image')
                        var $img = $('<img>', {'class': 'imgDefault', alt: self.getMultilingualOption(ce.title), src: self.safe_tags_replace(self.getMultilingualOption(ce.url))});
                    else
                        var $img = $('<span></span>');
                    var $teaser_wrapper = $('<div></div>', {'class': 'teaserContentWrap'});
                    var $topic_header = $('<div></div>', {'class': 'topicHeader', html: self.safe_tags_replace(self.getMultilingualOption(ce.topic_header_text))});
                    var $img_headline = $('<div></div>', {'class': 'imageHeadline', html: self.safe_tags_replace(self.getMultilingualOption(ce.title))});
                    var $img_description = $('<div></div>', {'class': 'imageDescription', html: self.safe_tags_replace(self.getMultilingualOption(ce.description))});
                    $teaser_wrapper.append($topic_header).append($img_headline).append($img_description);
                    if (o.events[z].elements.length > 1) {
                        var $gallery_navigation = $('<div></div>', {'class': 'myGalleryNavigation'});
                        var $numbers_row = $('<ul></ul>', {'class': 'numbersInRow'});
                        var start = i - 1;
                        if ((i - 4) <= 0)
                            start = 0;
                        else if (i > o.events[z].elements.length - 5)
                            start = o.events[z].elements.length - 5;
                        for (var y = start; y < (6 + start) && y < o.events[z].elements.length; y++) {
                            var class_name = 'inactive';
                            if (y === i)
                                class_name = 'active';
                            var $li_row = $('<li></li>', {'class': class_name, text: self.safe_tags_replace(y + 1) });
                            $gallery_navigation.append($numbers_row.append($li_row));
                        }
                        var $gostart_slideshow = $('<div></div>', {'class': 'goStartSlideshow'});
                        var $goend_slideshow = $('<div></div>', {'class': 'goEndSlideshow'});
                        var $gonext_slideshow = $('<div></div>', {'class': 'goNextSlideshow'});
                        var $goback_slideshow = $('<div></div>', {'class': 'goBackSlideshow'});
                        $teaser_wrapper.append($gallery_navigation).append($gostart_slideshow).append($goend_slideshow).append($gonext_slideshow).append($goback_slideshow);
                    }
                    if (o.events[z].resources.length > 0) {
                        for (var x = 0; x < o.events[z].resources.length; x++) {
                            var res_ce = o.events[z].resources[x];
                            var $resource_a_wrapper = $('<a></a>', { href: '#', 'class': 'ressource' });
                            if (res_ce.type === 'external') {
                                $resource_a_wrapper.attr('href', self.getMultilingualOption(res_ce.url));
                                $resource_a_wrapper.attr('target', '_blank');
                            }
                            var $resource_div_wrapper = $('<div></div>', {'class': 'imageRessource ' + self.safe_tags_replace(res_ce.type), 'data-dw-id': x.toString() });
                            var $resource_icon = $('<span></span>', {'class': 'icon'});
                            var $resource_header = $('<span></span>', {'class': 'header'});

                            if(res_ce.hasOwnProperty('header_text')){
                                $resource_header.text(self.getMultilingualOption(res_ce['header_text']));
                            } else {
                                switch (res_ce.type) {
                                    case 'audio':
                                        $resource_header.text('Audio abspielen');
                                        break;
                                    case 'video':
                                        $resource_header.text('Video abspielen');
                                        break;
                                    case 'external':
                                        $resource_header.text('Mehr zum Thema');
                                        break;
                                }
                            }

                            var $resource_title = $('<span></span>', {'class': 'title', text: self.getMultilingualOption(res_ce.title)});
                            $teaser_wrapper.append($resource_a_wrapper.append($resource_div_wrapper.append($resource_icon).append($resource_header).append($resource_title)));
                        }
                    }
                    $ul_wrapper.append($li_wrapper.append($img_wrapper.append($img)).append($teaser_wrapper));
                }
            }
            return $div_wrapper.append($ul_wrapper);
        },

        createEventbarForeground: function () {
            var self = this, o = this.options, el = this.element;
            var $foreground_wrapper = $('<div></div>', {id: 'event_caroussell_foreground'});
            for (var i = 0; i < 5; i++) {
                $foreground_wrapper.append($('<a></a>', {href: '#'}).append($('<div></div>', { 'data-dw-position': i.toString() })))
            }
            return $foreground_wrapper;
        },

        createEventbarBackground: function () {
            var self = this, o = this.options, el = this.element;
            var $background_wrapper = $('<div></div>', {id: 'event_caroussell_background'});
            var $div_background_scrollbar = $('<div></div>', {id: 'scrollbar'});
            var $div_intro = $('<div></div>', {'data-dw-id': '-1', 'data-dw-status': 'inactive', 'data-dw-type': 'intro', css: { left: 0 }}).append($('<div></div>', {'class': 'event_caroussell_member_text'}).append($('<span></span>', {'class': 'event_caroussell_member_headline', html: self.safe_tags_replace(self.getMultilingualOption(o.intro.title))})).append($('<span></span>', {'class': 'event_caroussell_member_text', html: self.safe_tags_replace(self.getMultilingualOption(o.intro.teaser_text))})));
            $background_wrapper.append($div_background_scrollbar).append($div_intro);
            for (var i = 0; i < o.events.length; i++) {
                var ce = o.events[i];
                var $cel = $('<div></div>', {'data-dw-id': i.toString(), 'data-dw-status': 'inactive', css: { left: ((i + 1) * 299).toString() + 'px' }}).append($('<div></div>', {'class': 'event_caroussell_member_pic'}).append($('<img>', {src: self.getMultilingualOption(ce.preview_picture)}))).append($('<div></div>', {'class': 'event_caroussell_member_text'}).append($('<span></span>', {'class': 'event_caroussell_member_headline', html: self.safe_tags_replace(self.getMultilingualOption(ce.title))})).append($('<span></span>', {'class': 'event_caroussell_member_text', html: self.safe_tags_replace(self.getMultilingualOption(ce.teaser_text))})));
                if(i===(o.events.length-1)) {
                    $cel.css('border-right','0' );
                }
                $background_wrapper.append($cel);
            }
            return $background_wrapper;
        },

        createTimeline: function () {
            var self = this, o = this.options, el = this.element;
            if (o.scale === 'off')
                return $('<span></span>');
            return $('<div></div>', {id: 'mytimeline'}).append($('<div></div>', {id: 'positioner'}));
        },

        getAVIframe: function (type, file_url, preview_url, mode) {
            var self = this, o = this.options, el = this.element;
            if (type !== 'audio' && type != 'video')
                return false;
            var $iframe = $('<iframe></iframe>', {border: '0', frameborder: '0', scrolling: 'no'});
            if (type === 'video')
                $iframe.attr('src', 'http://player.dw.de/index.php?p=ondemand&w=700&state=' + mode + '&logo=0&f=' + file_url + '&i=' + preview_url);
            else
                $iframe.attr('src', 'http://player.dw-world.de/index.php?p=audio&w=700&state=' + mode + '&logo=0&f=' + file_url + '&i=' + preview_url);
            return $iframe;
        },

        calculateScale: function () {
            var self = this, o = this.options, el = this.element;
            if (o.scale === 'off')
                return false;
            var Scalemilestone = function (timestamp, metric_pos, name, event_id) {
                var self = this, o = this.options, el = this.element;
                self.timestamp = timestamp;
                self.metric_position = metric_pos;
                self.name = name;
                self.event_id = event_id;
                self.real_date = new Date(timestamp);
            };
            var gcd = function (a, b) {
                if (!b) {
                    return a;
                }
                return gcd(b, a % b);
            };
            var array_sum = function (array, pos) {
                var mysum = 0;
                for (var i = pos; i >= 0; i--) {
                    mysum += array[i];
                }
                return mysum;
            };
            var time_units = {
                hour: 1000 * 3600,
                day: 1000 * 3600 * 24,
                month: 1000 * 3600 * 24 * 31.5,
                year: 1000 * 3600 * 24 * 366,
                decade: 1000 * 3600 * 24 * 366 * 10,
                century: 1000 * 3600 * 24 * 366 * 10 * 10,
                chiliad: 1000 * 3600 * 24 * 366 * 10 * 10 * 10
            };
            var increase_hours = function (date_object) {
                var hours = date_object.getHours();
                if (hours === 23) {
                    date_object.setDate(date_object.getDate() + 1);
                    date_object.setHours(0);
                }
                else
                    date_object.setHours(hours + 1);
                return date_object;
            };
            var increase_days = function (date_object) {
                date_object.setDate(date_object.getDate() + 1);
                return date_object;
            };
            var increase_months = function (date_object) {
                var months = date_object.getMonth();
                if (months === 11) {
                    date_object.setFullYear(date_object.getFullYear() + 1);
                    date_object.setMonth(0);
                }
                else
                    date_object.setMonth(months + 1);
                return date_object;
            };
            var increase_years = function (years) {
                return (years + 1);
            };
            var increase_year_to_decade = function (years) {
                return (years + 10 - (years % 10));
            };
            var increase_year_to_century = function (years) {
                return (years + 100 - (years % 100));
            };
            var increase_year_to_chiliad = function (years) {
                return (years + 1000 - (years % 1000));
            };
            var find_closest_upper_time_mark = function (timestamp_orig, scale_unit) {
                var timestamp = new Date();
                timestamp.setTime(timestamp_orig);
                switch (scale_unit) {
                    case 'hour':
                        timestamp = increase_hours(timestamp);
                        var hours = timestamp.getHours();
                        var minutes = timestamp.getMinutes();
                        if (hours === 0)
                            var name = ['0:00', timestamp.getDate() + '.' + timestamp.getMonth() + '.' + timestamp.getFullYear()];
                        else
                            var name = [hours.toString() + ':00', ''];
                        return new Scalemilestone(new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), hours, 0, 0).getTime(), undefined, name);
                        break;
                    case 'day':
                        timestamp = increase_days(timestamp);
                        var date = timestamp.getDate();
                        var name = [date.toString(), (timestamp.getMonth() + 1) + '/' + timestamp.getFullYear()];
                        return new Scalemilestone(new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate(), 0, 0, 0).getTime(), undefined, name);
                        break;
                    case 'month':
                        timestamp = increase_months(timestamp);
                        var month = timestamp.getMonth();
                        var name = [(month + 1).toString(), timestamp.getFullYear().toString()];
                        return new Scalemilestone(new Date(timestamp.getFullYear(), month, 1, 0, 0, 0).getTime(), undefined, name);
                        break;
                    case 'year':
                        timestamp = new Date(increase_years(timestamp.getFullYear()), 0, 1, 0, 0, 0);
                        var name = [timestamp.getFullYear().toString(),''];
                        return new Scalemilestone(new Date(timestamp.getFullYear(), 0, 1, 0, 0, 0).getTime(), undefined, name);
                        break;
                    case 'decade':
                        timestamp = new Date(increase_year_to_decade(timestamp.getFullYear()), 0, 1, 0, 0, 0);
                        var year = timestamp.getFullYear();
                        var name = [year.toString(), ''];
                        return new Scalemilestone(new Date(year, 0, 1, 0, 0, 0).getTime(), undefined, name);
                        break;
                    case 'century':
                        timestamp = new Date(increase_year_to_century(timestamp.getFullYear()), 0, 1, 0, 0, 0);
                        var year = timestamp.getFullYear();
                        var name = [year.toString(), ''];
                        return new Scalemilestone(new Date(year, 0, 1, 0, 0, 0).getTime(), undefined, name);
                        break;
                    case 'chiliad':
                        timestamp = new Date(increase_year_to_chiliad(timestamp.getFullYear()), 0, 1, 0, 0, 0);
                        var year = timestamp.getFullYear();
                        var name = [year.toString(), ''];
                        return new Scalemilestone(new Date(year, 0, 1, 0, 0, 0).getTime(), undefined, name);
                        break;
                }
            };
            var range = parseInt(o.events[o.events.length - 1].timestamp) - parseInt(o.events[0].timestamp);
            if (self.options.scale === 'auto') {
                var order = ['hour', 'day', 'month', 'year', 'decade', 'century', 'chiliad'];
                for (var i = 0; i < order.length; i++) {
                    if ((range / time_units[order[i]]) < 3)
                        break;
                    self.options.scale = order[i];
                }
            }
            for (i = 0; i < o.events.length; i++) {
                var current_event = o.events[i];
                var current_event_timestamp = parseInt(current_event.timestamp);
                self.varstack.milestone_queue[self.varstack.milestone_queue.length] = new Scalemilestone(current_event_timestamp, undefined, ['', ''], i);
                if (i === 0)
                    current_event_timestamp -= (60 * 1000) + time_units[self.options.scale];
                if (i === o.events.length - 1)
                    break;
                while (current_event_timestamp < parseInt(o.events[i + 1].timestamp)) {
                    var new_milestone = find_closest_upper_time_mark(current_event_timestamp, self.options.scale);
                    if (new_milestone.timestamp > parseInt(o.events[i + 1].timestamp)) {
                        break;
                    }
                    self.varstack.milestone_queue[self.varstack.milestone_queue.length] = new_milestone;
                    current_event_timestamp = new_milestone.timestamp;
                }
            }
            var array_distances = [0];
            for (var i = 1; i < self.varstack.milestone_queue.length; i++) {
                var current_element = self.varstack.milestone_queue[i];
                var distance = current_element.timestamp - self.varstack.milestone_queue[i - 1].timestamp;
                array_distances[array_distances.length] = distance;
            }
            var current_value = array_distances[array_distances.length - 1];
            for (i = array_distances.length - 2; i > 0; i--) {
                current_value = gcd(array_distances[i], current_value);
            }
            self.varstack.milestone_queue[0].metric_position = 0;
            for (var i = 1; i < self.varstack.milestone_queue.length; i++) {
                var current_element = self.varstack.milestone_queue[i];
                current_element.metric_position = array_sum(array_distances, i) / current_value;
            }
        },

        initializeTimeline: function () {
            var self = this, o = this.options, el = this.element;
            if (o.scale === 'off')
                return false;
            var config_width_timeline = parseInt(self.options.scale_width);
            var left_padding = parseInt(self.options.padding_left);
            var right_padding = parseInt(self.options.padding_right);
            var eventmarker_width = 13;
            var eventmarker_height = 15;
            var breite_timeline = config_width_timeline - left_padding - right_padding;
            var width_milestone_unit = self.varstack.milestone_queue[self.varstack.milestone_queue.length - 1].metric_position / breite_timeline;
            var getMetricPositionByEventId = function (id) {
                for (var i = 0; i < self.varstack.milestone_queue.length; i++) {
                    if (self.varstack.milestone_queue[i].event_id === id)
                        return self.varstack.milestone_queue[i].metric_position;
                }
                return false;
            };
            var createEvent = function (i) {
                return $('<a></a>', {
                    href: '#',
                    title: new Date(parseInt(o.events[i].timestamp)),
                    css: {
                        display: 'block',
                        'text-decoration': 'none'
                    },
                    html: $("<div></div>", {
                        'data-dw-id': i.toString(),
                        'data-dw-status': 'inactive',
                        css: {
                            left: (Math.floor(getMetricPositionByEventId(i) / width_milestone_unit) + left_padding - Math.floor(eventmarker_width) / 2) + 'px',
                            width: eventmarker_width + 'px',
                            height: eventmarker_height + 'px'
                        }
                    })
                });
            };
            if (left_padding >= 50 && right_padding >= 50) {
                var $limiter = $('<div></div>', { 'class': 'limiter' });
                var $limiter2 = $('<div></div>', { 'class': 'limiter' });
                $('div#mytimeline').append($limiter.css('left', '0px'));
                $('div#mytimeline').append($limiter2.css('left', (config_width_timeline - 50).toString() + 'px'));
            }
            $.each(o.events, function (i) {
                $('div#mytimeline').append(createEvent(i));
            });
            $.each(self.varstack.milestone_queue, function (key, value) {
                if (typeof value.event_id === 'undefined') {
                    $(el).find('div#mytimeline').append(
                        $('<div></div>', { 'class': 'TimeMarker', css: { left: left_padding + Math.floor(value.metric_position / width_milestone_unit) + 'px' }, html: $('<span></span>',{ 'class':'upper', html: self.safe_tags_replace(value.name[1])+ '&nbsp;' }).append($('<span></span>',{ 'class':'lower', html: self.safe_tags_replace(value.name[0])}))})
                    );
                }
            });
        },

        elementsEqual: function (el1, el2) {
            if (typeof el1 !== typeof  el2 || (el1 === null && el2 !== null) || (el2 === null && el1 !== null))
                return false;
            else {
                if (typeof el1 === 'object' && el1 !== null) {
                    if (el1.length !== el2.length)
                        return false;
                    for (var i = el1.length; i--; i >= 0) {
                        if (el1[i] !== el2[i])
                            return false;
                    }
                }
                else
                    return (el1 === el2);
            }
            return true;
        },

        avloader: function ($jquery_object, layer_object, callback, show_loader_element, callback_options) {
            var self = this, o = this.options, el = this.element;
            var callback_func = function (callback, show_loader_element) {
                callback(
                    callback_options, function () {
                        show_loader_element.find('#avloader_div').remove();
                    }
                );
            };
            if (layer_object[0] === '-1')
                var ce = o.intro;
            else
                var ce = o.events[parseInt(layer_object[0])];
            ce = ce.elements[parseInt(layer_object[1])];
            $jquery_object.find('div.teaserImg').html(self.getAVIframe(ce.type, self.getMultilingualOption(ce.url), self.getMultilingualOption(ce.preview_url), 'pause'));
            if (typeof callback !== 'undefined') {
                if (typeof show_loader_element !== 'undefined') {
                    show_loader_element.append($('<div></div>', {id: 'avloader_div', css: { width: '940px', height: '394px', 'background-color': '#000000', position: 'absolute', top: 0, left: 0, 'background-image': 'url("dist/images/large-loading-black.gif")', 'background-repeat': 'no-repeat', 'background-position': 'center center'} }));
                }
                $jquery_object.find('div.teaserImg iframe')
                    .on('load', function () {
                        callback_func(callback, show_loader_element);
                    });
            }
        },

        avstopper: function ($jquery_object) {
            $jquery_object.find('div.teaserImg iframe').remove();
        },

        showLayer: function (layer_object) {
            var self = this, o = this.options, el = this.element;
            if (self.status.currently_switching === null && !self.elementsEqual(layer_object, self.status.currently_active)) {
                self.status.currently_switching = layer_object;
                if (self.status.currently_active !== null) {
                    var $ca_element = $(el).find('li.carouselLayer[data-dw-id="' + self.status.currently_active[0] + '"][data-dw-nr="' + self.status.currently_active[1] + '"]');
                    $ca_element.css('z-index', 1);
                    if ($ca_element.attr('data-dw-type') === 'audio' || $ca_element.attr('data-dw-type') === 'video')
                        self.avstopper($ca_element);
                    self.ressource_hide_helperfunc();

                    if(self.status.currently_active[0] === layer_object[0] && self.status.currently_active[1] !== layer_object[1] ){
                        self.xtcore_trigger_elementclick ( self.status.currently_active[0], layer_object[1] );
                    }

                }
                var $upcoming_element = $(el).find('li[data-dw-id="' + layer_object[0] + '"][data-dw-nr="' + layer_object[1] + '"]');
                var do_next = function (argarray, my_callback) {
                    var $upcoming_element = argarray[0];
                    var $ca_element = argarray[1];
                    $upcoming_element.css('z-index', 2).css('opacity', 1).fadeIn(parseInt(o.effect_duration), function () {
                        if (self.status.currently_active !== null)
                            $ca_element.css('display', 'none').css('opacity', 0).css('z-index', 0);
                        self.status.currently_active = layer_object;
                        self.status.currently_switching = null;
                        if (self.status.next_active !== null && !self.elementsEqual(self.status.next_active, self.status.currently_active)) {
                            var na_old = self.status.next_active;
                            self.status.next_active = null;
                            self.showLayer(na_old);
                        }
                        my_callback();
                        self.callback_counter_increase();
                    });
                };
                if ($upcoming_element.attr('data-dw-type') === 'audio' || $upcoming_element.attr('data-dw-type') === 'video') {
                    self.avloader($upcoming_element, layer_object, do_next, $ca_element, [$upcoming_element, $ca_element]);
                }
                else
                    do_next([$upcoming_element, $ca_element], function () {
                    });
            }
            else {
                if (!self.elementsEqual(layer_object, self.status.currently_switching) && !(self.status.currently_switching === null && self.elementsEqual(layer_object, self.status.currently_active)))
                    self.status.next_active = layer_object;
            }
        },

        scrollTo_heplerfunc: function ($jqueryObject, callback) {
            var self = this, o = this.options, el = this.element;
            if (typeof callback === 'undefined')
                callback = function () {
                };
            var $scroll_object = $(el).find('div#event_caroussell_background');
            $scroll_object.scrollTo($jqueryObject, {duration: parseInt(o.effect_duration), axis: 'x', offset: -($jqueryObject.outerWidth() + 21), onAfter: callback  });
        },

        ressource_hide_helperfunc: function () {
            var self = this, o = this.options, el = this.element;
            var $active_element = $(el).find('li div.teaserContentWrap a.ressource div.imageRessource[data-dw-status="active"]');
            if ($active_element.length === 0)
                return false;
            self.ie_css_refresh($active_element.attr('data-dw-status', 'inactive'));
            var $ce = $(el).find('ul li[data-dw-id="' + self.status.currently_active[0] + '"][data-dw-nr="' + self.status.currently_active[1] + '"]');
            $ce.find('div.teaserImg *').remove();
            if ($ce.attr('data-dw-type') !== 'audio' && $ce.attr('data-dw-type') !== 'video') {
                if (self.status.currently_active[0] === '-1') {
                    var img_src = self.getMultilingualOption(o.intro.elements[self.status.currently_active[1]].url);
                    var img_alt = self.getMultilingualOption(o.intro.elements[self.status.currently_active[1]].title);
                }
                else {
                    var img_src = self.getMultilingualOption(o.events[self.status.currently_active[0]].elements[self.status.currently_active[1]].url);
                    var img_alt = self.getMultilingualOption(o.events[self.status.currently_active[0]].elements[self.status.currently_active[1]].title);
                }
                $ce.find('div.teaserImg').html($('<img>', {'class': 'imgDefault', src: self.safe_tags_replace(img_src), alt: img_alt}));
            }
        },

        ressource_show_helperfunc: function (id) {
            var self = this, o = this.options, el = this.element;
            var $active_element = $(el).find('li div.teaserContentWrap a.ressource div.imageRessource[data-dw-status="active"]');
            if ($active_element.length === 1 && parseInt($active_element.attr('data-dw-id')) === id)
                return false;
            var $container = $(el).find('ul li[data-dw-id="' + self.status.currently_active[0] + '"][data-dw-nr="' + self.status.currently_active[1] + '"] div.teaserImg');
            if ($active_element.length === 1) {
                self.ie_css_refresh($active_element.attr('data-dw-status', 'inactive'));
            }
            $container.find('*').remove();
            self.ie_css_refresh($(el).find('ul li[data-dw-id="' + self.status.currently_active[0] + '"][data-dw-nr="' + self.status.currently_active[1] + '"] div.teaserContentWrap a.ressource div.imageRessource[data-dw-id="' + id + '"]').attr('data-dw-status', 'active'));
            var cr = o.events[parseInt(self.status.currently_active[0])].resources[id];
            $container.html(self.getAVIframe(cr.type, self.getMultilingualOption(cr.url), self.getMultilingualOption(cr.preview_url), 'play'));
        },

        initializeFunctionality: function () {
            var self = this, o = this.options, el = this.element;
            var $meinediv = $(el).find('div#event_caroussell_background div[data-dw-status]').last();
            self.varstack.globaloption_div_innerwidth = $meinediv.outerWidth() + $meinediv.offset().left + 1;
            $(el).find('li ul.numbersInRow li').on('click', function () {
                self.showLayer([$(this).parents('li[data-dw-id]').attr('data-dw-id'), (parseInt($(this).text()) - 1).toString()]);
            });
            $(el).find('li div.goStartSlideshow').on('click', function () {
                self.showLayer([$(this).parents('li[data-dw-id]').attr('data-dw-id'), '0']);
            });
            $(el).find('li div.goEndSlideshow').on('click', function () {
                self.showLayer([$(this).parents('li[data-dw-id]').attr('data-dw-id'), $(el).find('div ul li.carouselLayer[data-dw-id="' + $(this).parents('li[data-dw-id]').attr('data-dw-id') + '"]').last().attr('data-dw-nr')]);
            });
            $(el).find('li div.goNextSlideshow').on('click', function () {
                var $ce = $(this).parents('li[data-dw-id]');
                var last_nr = parseInt($(el).find('div ul li.carouselLayer[data-dw-id="' + $(this).parents('li[data-dw-id]').attr('data-dw-id') + '"]').last().attr('data-dw-nr'));
                var cur_nr = parseInt($ce.attr('data-dw-nr'));
                var next_nr = cur_nr + 1;
                if (next_nr > last_nr)
                    next_nr = 0;
                self.showLayer([$(this).parents('li[data-dw-id]').attr('data-dw-id'), next_nr.toString()]);
            });
            $(el).find('li div.goBackSlideshow').on('click', function () {
                var $ce = $(this).parents('li[data-dw-id]');
                var last_nr = parseInt($(el).find('div ul li.carouselLayer[data-dw-id="' + $(this).parents('li[data-dw-id]').attr('data-dw-id') + '"]').last().attr('data-dw-nr'));
                var cur_nr = parseInt($ce.attr('data-dw-nr'));
                var prev_nr = cur_nr - 1;
                if (prev_nr < 0)
                    prev_nr = last_nr;
                self.showLayer([$(this).parents('li[data-dw-id]').attr('data-dw-id'), prev_nr.toString()]);
            });
            if (o.scale !== 'off') {
                $(el).find('div#mytimeline').on('click', 'a', function () {
                    self.eventSwitch_helperfunc($(this).find('div:first'));
                });
            }
            $(el).find('div#event_caroussell_foreground').on('click', 'a', function () {
                self.clickOnEventbar_helperfunc(parseInt($(this).find('div:first').attr('data-dw-position')));
            });
            $(el).find('li a.ressource').on('click', 'div.imageRessource:not(.external)', function () {
                self.ressource_show_helperfunc(parseInt($(this).attr('data-dw-id')));
            });
            $(el).find( 'a[href="#"]' ).on('click', function(e) {
                e.preventDefault(); });
            self.eventSwitch_helperfunc($(el).find('div#event_caroussell_background div[data-dw-id=\"-1\"]'));
        },

        ie_css_refresh: function ($jQueryobject, callback) {
            $jQueryobject.get(0).className = $jQueryobject.get(0).className;
            if (typeof callback !== 'undefined')
                callback();
        },

        eventSwitch_setStatus_helperfunc: function (id, status, callback) {
            var self = this, o = this.options, el = this.element;
            self.ie_css_refresh($(el).find('div#event_caroussell_background div[data-dw-id="' + id + '"]').attr('data-dw-status', status),
                function (callback) {
                    if (o.scale !== 'off') {
                        if (id !== -1)
                            self.ie_css_refresh($(el).find('div#mytimeline div[data-dw-id="' + id + '"]').attr('data-dw-status', status), callback);
                    }
                }
            );
        },

        eventSwitch_helperfunc: function ($jqueryObject) {
            var self = this, o = this.options, el = this.element;
            var current_active_id;
            var $active_element = $(el).find('div#event_caroussell_background div[data-dw-status="active"]');
            if ($active_element.length > 0)
                current_active_id = parseInt($active_element.attr('data-dw-id'));
            var next_active_id = parseInt($jqueryObject.attr('data-dw-id'));
            if (current_active_id === next_active_id)
                return false;
            if (self.status.global_eventswitch_status === 1) {
                return false;
            }
            self.status.global_eventswitch_status = 1;
            self.status.global_callback_counter = 0;
            self.ressource_hide_helperfunc();
            var status;
            jQuery.each(o.events, function (i) {
                if ((i === (next_active_id - 2) && next_active_id === (o.events.length - 1)) || i === (next_active_id - 1))
                    status = 'left';
                else {
                    if (i === (next_active_id + 1) || (next_active_id === -1 && i === 1))
                        status = 'right';
                    else {
                        if (i === next_active_id)
                            status = 'active';
                        else
                            status = 'inactive';
                    }
                }
                self.eventSwitch_setStatus_helperfunc(i, status);
            });
            if (next_active_id === -1)
                self.eventSwitch_setStatus_helperfunc(next_active_id, 'active');
            else {
                if (current_active_id === -1)
                    self.eventSwitch_setStatus_helperfunc(current_active_id, 'inactive');
            }
            if (o.scale !== 'off') {
                self.updateTimelinePositioner();
                $(el).find('div#mytimeline').smoothDivScroll('scrollToElement', 'data-dw-id', next_active_id.toString());
            }
            var calculateScrollDiff = function () {
                var cutoff_outer_edges = function (value) {
                    if (value === -1) return 0;
                    if (value === (o.events.length - 1)) return (value - 1);
                    return value;
                };
                var current_point = cutoff_outer_edges(current_active_id);
                var next_point = cutoff_outer_edges(next_active_id);
                return (next_point - current_point);
            };
            var dir;
            if (typeof current_active_id === 'undefined') current_active_id = -1;
            var scroll_diff = calculateScrollDiff();
            if (scroll_diff < 0) dir = 'left';
            if (scroll_diff > 0) dir = 'right';
            scroll_diff = Math.abs(scroll_diff);

            self.xtcore_trigger_eventclick(next_active_id);

            self.updateEventbarScrollbar_helperfunc(dir, scroll_diff);
            self.scrollTo_heplerfunc($(el).find('div#event_caroussell_background div[data-dw-id="' + next_active_id + '"]'), function () {
                self.callback_counter_increase();
            });
            self.adaptForegroundEventbar_helperfunc(next_active_id);
            self.showLayer([next_active_id.toString(), '0']);
        },

        callback_counter_increase: function () {
            var self = this, o = this.options, el = this.element;
            if (self.status.global_eventswitch_status === 0)
                return false;
            self.status.global_callback_counter++;
            if (o.scale === 'off')
                var limit = 4;
            else
                var limit = 5;
            if (self.status.global_callback_counter === limit) {
                self.status.global_eventswitch_status = 0;
                self.status.global_callback_counter = 0;
            }
            return true;
        },

        updateEventbarScrollbar_helperfunc: function (dir, units) {
            var self = this, o = this.options, el = this.element;
            var $meinediv = $(el).find('div#event_caroussell_background div[data-dw-status]').last();
            var div_width = $(el).find('div#event_caroussell_background').outerWidth();
            var scrollbar_width = Math.ceil(div_width * div_width / self.varstack.globaloption_div_innerwidth);
            var unit_length = Math.ceil(self.varstack.globaloption_div_innerwidth - scrollbar_width) / (o.events.length - 2) + 2;
            var $scrollbar = $(el).find('div#event_caroussell_background div#scrollbar').css('width', scrollbar_width.toString() + 'px');
            if (typeof dir === 'undefined' || typeof units === 'undefined') {
                self.callback_counter_increase();
                return false;
            }
            var scrollbar_offset_current = $scrollbar.css('left');
            scrollbar_offset_current = parseInt(scrollbar_offset_current.substring(0, scrollbar_offset_current.length - 2));
            var new_value_left = scrollbar_offset_current;
            switch (dir) {
                case 'left':
                    new_value_left -= unit_length * units;
                    break;
                case 'right':
                    new_value_left += unit_length * units;
                    break;
            }
            if (new_value_left < 0)
                new_value_left = 0;
            if ((new_value_left + scrollbar_width) > self.varstack.globaloption_div_innerwidth)
                new_value_left = (self.varstack.globaloption_div_innerwidth - scrollbar_width);
            $scrollbar.animate({ left: new_value_left.toString() + 'px' }, parseInt(o.effect_duration), 'swing', function () {
                self.callback_counter_increase();
            });
        },

        updateTimelinePositioner: function () {
            var self = this, o = this.options, el = this.element;
            var $getleft = $(el).find('div#mytimeline div[data-dw-status="left"]').first();
            var $getactive = $(el).find('div#mytimeline div[data-dw-status="active"]');
            var $getright_first = $(el).find('div#mytimeline div[data-dw-status="right"]').first();
            var $getright_last = $(el).find('div#mytimeline div[data-dw-status="right"]').last();
            var offsetleft;
            var $element;
            if ($getleft.length === 1)
                $element = $getleft;
            else {
                if ($getactive.length === 1)
                    $element = $getactive;
                else
                    $element = $getright_first;
            }
            offsetleft = $element.css('left');
            offsetleft = parseInt(offsetleft.substr(0, offsetleft.length - 2));
            var offsetright;
            var $element2;
            if ($getright_last.length === 1)
                $element2 = $getright_last;
            else
                $element2 = $getactive;
            offsetright = $element2.css('left');
            offsetright = parseInt(offsetright.substr(0, offsetright.length - 2));
            var width_right = parseInt($element2.outerWidth());
            $(el).find('div#mytimeline div#positioner').animate({width: (offsetright - offsetleft + width_right).toString() + 'px', left: offsetleft.toString() + 'px' }, parseInt(o.effect_duration), "swing", function () {
                self.callback_counter_increase();
            });
        },

        adaptForegroundEventbar_helperfunc: function (next_active_id) {
            var self = this, o = this.options, el = this.element;
            switch (next_active_id) {
                case -1:
                case 0:
                    self.ie_css_refresh($(el).find('div#event_caroussell_foreground a div[data-dw-position="0"]').attr('data-dw-status', 'hidden'), function () {
                        self.ie_css_refresh($(el).find('div#event_caroussell_foreground a div[data-dw-position="4"]').attr('data-dw-status', 'inactive_large'), function () {
                            self.callback_counter_increase();
                        });
                    });
                    break;
                case o.events.length - 1:
                case o.events.length - 2:
                    self.ie_css_refresh($(el).find('div#event_caroussell_foreground a div[data-dw-position="0"]').attr('data-dw-status', 'inactive_large'), function () {
                        self.ie_css_refresh($(el).find('div#event_caroussell_foreground a div[data-dw-position="4"]').attr('data-dw-status', 'hidden'), function () {
                            self.callback_counter_increase();
                        });
                    });
                    break;
                default:
                    self.ie_css_refresh($(el).find('div#event_caroussell_foreground a div[data-dw-position="0"]').attr('data-dw-status', 'inactive_small'), function () {
                        self.ie_css_refresh($(el).find('div#event_caroussell_foreground a div[data-dw-position="4"]').attr('data-dw-status', 'inactive_small'), function () {
                            self.callback_counter_increase();
                        });
                    });
            }
            return true;
        },

        clickOnEventbar_helperfunc: function (nr) {
            var self = this, o = this.options, el = this.element;
            if (self.varstack.global_eventswitch_status === 1) {
                return false;
            }
            var $active_element = $(el).find('div#event_caroussell_background div[data-dw-status="active"]');
            if ($active_element.length === 0)
                return false;
            var current_active_id = parseInt($active_element.attr('data-dw-id'));
            var next_id = current_active_id;
            switch (current_active_id) {
                case -1:
                    next_id += (nr - 1);
                    break;
                case o.events.length - 1:
                    next_id += (nr - 3);
                    break;
                default:
                    next_id += (nr - 2);
            }
            var $next_element = $(el).find('div#event_caroussell_background div[data-dw-id="' + next_id + '"]');
            if ($next_element.length === 0)
                return false;
            return self.eventSwitch_helperfunc($next_element);
        },

        _create: function () {
            var self = this, o = this.options, el = this.element;
            this.option('json_option_file_url', o.json_option_file_url);
            if (typeof o.json_option_file_url !== 'string' || o.json_option_file_url === '') {
                self.kill('Fatal plugin error. JSON loading failed; ');
                return false;
            }
            else {
                if ($('html').is('.ie6, .ie7, .ie8'))
                    var appendix = '';
                else
                    var appendix = (new Date().getTime() + Math.random()).toString();
                $.getJSON(o.json_option_file_url + '?dw' + appendix,function (data) {
                    if (typeof data === 'object') {
                        self.options = { language: o.language };
                        self.option(data);
                        o = self.options;

                        self.xtcore_init();

                        $("<style>" +
                            " div#event_caroussell_background div#scrollbar { background-color: " + self.safe_tags_replace(o.color_upper_scrollbar) + "; }" +
                            " div#mytimeline div#positioner { background-color:" + self.safe_tags_replace(o.color_bottom_scrollbar) + "; }" +
                            " div#mytimeline div[data-dw-status=\"inactive\"] { background-image: url('" + self.safe_tags_replace(o.eventmarker_bg_inactive).replace_all("\\", "\\\\").replace_all("'", "\\'") + "'); }" +
                            " div#mytimeline div[data-dw-status=\"active\"] { background-image: url('" + self.safe_tags_replace(o.eventmarker_bg_active).replace_all("\\", "\\\\").replace_all("'", "\\'") + "'); }" +
                            " div#mytimeline div[data-dw-status=\"left\"], div#mytimeline div[data-dw-status=\"right\"] { background-image: url('" + self.safe_tags_replace(o.eventmarker_bg_neighbour).replace_all("\\", "\\\\").replace_all("'", "\\'") + "'); }" +
                            " </style>").appendTo("head");
                        document.title = self.getMultilingualOption(o.title);
                        $(el).append($('<div></div>', {id: 'img_preload', css: { 'z-index': 99, 'background-color': '#FFFFFF', 'background-image': 'url("dist/images/large-loading-white.gif")', 'background-repeat': 'no-repeat', 'background-position': 'center center', position: 'absolute', top: 0, left: 0, width: '940px', height: '524px' }})).append(self.createLayerCarousel()).append(self.createEventbarForeground()).append(self.createEventbarBackground()).append(self.createTimeline());
                        self.calculateScale();
                        self.initializeTimeline();
                        self.startTimeline();
                        var load_timeout = setTimeout(function(){ /*alert('now reloading!');*/ window.location.href = window.location; },20000);
                        var $pics = $('img');
                        $pics.on('load',function () {
                            if ($pics.length <= self.status.img_loaded_counter){
                                return false;
                            }

                            self.status.img_loaded_counter++;
                            if ($pics.length === self.status.img_loaded_counter) {
                                clearTimeout(load_timeout);
                                $('div#img_preload').remove();
                                self.initializeFunctionality();
                            }
                        }).each(function () {
                                if (this.complete){
                                    $(this).load();
                                }
                            });
                    }
                    else
                        self.kill('Fatal plugin error. JSON parsing and/or option setting failed; ');
                }).fail(function () {
                        self.kill('Fatal plugin error. JSON loading failed; ');
                    });
            }
        },

        isValidUrl: function (url) {
            var regexp_domain_whitelist = ['nilsole\\.net|localhost'];
            if (typeof url !== 'string' || (url !== '' && url.match(new RegExp('^data:.+|https{0,1}:\\/\\/[a-zA-Z0-9\.\-]*(' + regexp_domain_whitelist + ')\\/(.*)$', 'g')) === null))
                return false;
            return true;
        },

        startTimeline: function () {
            var my_self = this, my_o = this.options, my_el = this.element;
            if (my_o.scale === 'off')
                return false;
            $(my_el).find('div#mytimeline').smoothDivScroll({
                dwScrollableAreaWidth: parseInt(my_o.scale_width),
                autoScrollingMode: '',
                touchScrolling: true,
                hotSpotScrolling: true,
                hotSpotMouseDownSpeedBooster: 1,
                mousewheelScrolling: 'vertical',
                visibleHotSpotBackgrounds: 'always'
            });
        },

        _setOption: function (key, value) {
            var self = this, o = this.options, el = this.element;
            var restricted_url_otpions = ['json_option_file_url', 'eventmarker_bg_active', 'eventmarker_bg_inactive', 'eventmarker_bg_neighbour'];
            var detect = self.inArray(key, restricted_url_otpions);
            if (detect === true && this.isValidUrl(value) === false) {
                o[key] = null;
                self.kill('Fatal plugin error. Option key ' + key + ' corrupted; ');
                return false;
            }
            if (detect === false) {
                if (key === 'intro') {
                    var check = self.getMultilingualOption(value.preview_picture);
                    if (check !== '' && this.isValidUrl(check) === false) {
                        o[key] = null;
                        self.kill('Fatal plugin error. Option key ' + key + ' corrupted; ');
                        return false;
                    }
                    for (var i = 0; i < value.elements.length; i++) {
                        var check1 = self.getMultilingualOption(value.elements[i].url);
                        var check2 = self.getMultilingualOption(value.elements[i].preview_url);
                        if ((check1 !== '' && value.elements[i].type !== 'video' && this.isValidUrl(check1) === false) || (check2 !== '' && this.isValidUrl(check2) === false)) {
                            o[key] = null;
                            self.kill('Fatal plugin error. Option key ' + key + ' corrupted; ');
                            return false;
                        }
                    }
                }
                if (key === 'events') {
                    for (i = 0; i < value.length; i++) {
                        var check = self.getMultilingualOption(value[i].preview_picture);
                        if (check !== '' && this.isValidUrl(check) === false) {
                            o[key] = null;
                            self.kill('Fatal plugin error. Option key ' + key + ' corrupted; ');
                            return false;
                        }
                        for (var y = 0; y < value[i].elements.length; y++) {
                            var check1 = self.getMultilingualOption(value[i].elements[y].url);
                            var check2 = self.getMultilingualOption(value[i].elements[y].preview_url);
                            if ((check1 !== '' && value[i].elements[y].type !== 'video' && this.isValidUrl(check1) === false) || (check2 !== '' && this.isValidUrl(check2) === false)) {
                                o[key] = null;
                                self.kill('Fatal plugin error. Option key ' + key + ' corrupted; ');
                                return false;
                            }
                            for (var z = 0; z < value[i].resources.length; z++) {
                                var check1 = self.getMultilingualOption(value[i].resources[z].url);
                                var check2 = self.getMultilingualOption(value[i].resources[z].preview_url);
                                if ((check1 !== '' && value[i].resources[z].type === 'audio' && this.isValidUrl(check1) === false) || (check2 !== '' && this.isValidUrl(check2) === false)) {
                                    o[key] = null;
                                    self.kill('Fatal plugin error. Option key ' + key + ' corrupted; ');
                                    return false;
                                }
                            }
                        }
                    }
                }
            }
            this._super(key, value);
            return true;
        },

        inArray: function (needle, haystack) {
            var length = haystack.length;
            for (var i = 0; i < length; i++) {
                if (haystack[i] === needle) return true;
            }
            return false;
        },

        xtcore_helper_tmpl_repl: function (input_str, repl_var, repl_val) {
            repl_var = '{{'+repl_var+'}}';
            return input_str.replace_all(repl_var,repl_val);
        },

        xtcore_exe_script: function () {
            var self = this, o = this.options, el = this.element;
            if(!parent.document) {
                window.xtnv = document;
            } else {
                window.xtnv = parent.document;
            }
            window.xtsd = "http://logi242";
            window.xtsite = o.xtcore_metrics.init_vars.xtsite ;
            window.xtdmc= ".dw.de";
            window.xtn2 = self.getMultilingualOption( o.xtcore_metrics.language_ids );
            window.xtpage = o.xtcore_metrics.init_vars.xtpage ;
            window.xtdi = "";
            window.xt_multc = self.xtcore_helper_tmpl_repl(self.xtcore_helper_tmpl_repl(o.xtcore_metrics.init_vars.xtmultc,'LANGUAGE_ID',xtn2),'ENCODED_PROJECT_URL',encodeURIComponent ( window.location.href.toString().replace_all ( '#','') )  );
            window.xt_an = "";
            window.xt_ac = "";
            if (window.xtparam!=null){window.xtparam+="&ac="+window.xt_ac+"&an="+window.xt_an+window.xt_multc;}
            else{window.xtparam="&ac="+window.xt_ac+"&an="+window.xt_an+window.xt_multc;}
            $.getScript(o.xtcore_metrics.main_script_url , function(){
                self.status.xtcore_loaded = 1;
            });
        },
        xtcore_trigger_eventclick: function (event_id) {
            var self = this, o = this.options, el = this.element;
            if(self.status.xtcore_loaded === 0 || o.xtcore_metrics.eventclick_enabled === "false"){
                return false;
            }
            if(event_id === -1){
                var event_obj = o.intro;
            } else {
                var event_obj = o.events[event_id];
            }
            var xt_med_firstarg = o.xtcore_metrics.xt_med_args_eventclick[0];
            var xt_med_secondarg = self.xtcore_helper_tmpl_repl(o.xtcore_metrics.xt_med_args_eventclick[1],'LANGUAGE_ID',self.getMultilingualOption( o.xtcore_metrics.language_ids ) );
            var xt_med_thirdarg = self.xtcore_helper_tmpl_repl(o.xtcore_metrics.xt_med_args_eventclick[2],'EVENT_XTNAME', encodeURIComponent ( event_obj.xtcore_options.event_name ) );
            window.xt_med(xt_med_firstarg,xt_med_secondarg,xt_med_thirdarg);
        },
        xtcore_trigger_elementclick: function (event_id, element_id) {
            var self = this, o = this.options, el = this.element;
            if(self.status.xtcore_loaded === 0 || o.xtcore_metrics.elementclick_enabled === "false"){
                return false;
            }
            if(event_id === -1){
                var event_obj = o.intro;
            } else {
                var event_obj = o.events[event_id];
            }
            var xt_med_firstarg = o.xtcore_metrics.xt_med_args_elementclick[0];
            var xt_med_secondarg = self.xtcore_helper_tmpl_repl(o.xtcore_metrics.xt_med_args_elementclick[1],'LANGUAGE_ID',self.getMultilingualOption( o.xtcore_metrics.language_ids ) );
            var xt_med_thirdarg = self.xtcore_helper_tmpl_repl( self.xtcore_helper_tmpl_repl(o.xtcore_metrics.xt_med_args_elementclick[2],'EVENT_XTNAME',encodeURIComponent ( event_obj.xtcore_options.event_name ) ) , 'ELEMENT_XTNAME', encodeURIComponent ( event_obj.elements[element_id].xtcore_options.element_name ) );
            window.xt_med(xt_med_firstarg,xt_med_secondarg,xt_med_thirdarg);
        },
        xtcore_init: function() {
            var self = this, o = this.options, el = this.element;
            if(!o.xtcore_metrics){
                return false;
            }
            if(o.xtcore_metrics.enabled == 'false'){
                return false;
            }
            self.xtcore_exe_script();
        }
    });
})(jQuery);
