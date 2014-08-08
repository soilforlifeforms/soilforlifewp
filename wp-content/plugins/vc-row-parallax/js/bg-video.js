/**
 * These are in charge of initializing YouTube
 */


function _vcRowGetAllElementsWithAttribute( attribute ) {
    var matchingElements = [];
    var allElements = document.getElementsByTagName('*');
    for (var i = 0, n = allElements.length; i < n; i++) {
        if (allElements[i].getAttribute(attribute)) {
            // Element exists with attribute. Add to array.
            matchingElements.push(allElements[i]);
        }
    }
    return matchingElements;
}


function _vcRowOnPlayerReady(event) {
    var player = event.target;
    player.playVideo();
    if ( player.isMute ) {
        player.mute();
    }

    player.loopInterval = setInterval(function() {
        if ( typeof player.loopTimeout !== 'undefined' ) {
            clearTimeout( player.loopTimeout );
        }

        var loopAdjustment = 0;
        if ( typeof jQuery(player.a).parent().attr('data-loop-adjustment') !== 'undefined' &&
             jQuery(player.a).parent().attr('data-loop-adjustment') !== '' &&
             jQuery(player.a).parent().attr('data-loop-adjustment') !== '0' ) {
            loopAdjustment = parseInt( jQuery(player.a).parent().attr('data-loop-adjustment') );
        }


        player.loopTimeout = setTimeout(function() {
            player.seekTo(0);
        }, player.getDuration() * 1000 - player.getCurrentTime() * 1000 - 60 - loopAdjustment );
    }, 400);
}

function _vcRowOnPlayerStateChange(event) {
    if ( event.data === YT.PlayerState.ENDED ) {
        if ( typeof event.target.loopTimeout !== 'undefined' ) {
            clearTimeout( event.target.loopTimeout );
        }
        event.target.seekTo(0);
    }
}

function resizeVideo( $wrapper ) {
    var $videoContainer = $wrapper.parent();

    if ( $videoContainer.find('iframe').width() === null ) {
        setTimeout( function() {
            resizeVideo( $wrapper );
        }, 500);
        return;
    }

    var $videoWrapper = $wrapper;

    $videoWrapper.css({
        width: 'auto',
        height: 'auto',
        left: 'auto',
        top: 'auto'
    });

    $videoWrapper.css('position', 'absolute');

    var vidWidth = $videoContainer.find('iframe').width();
    var vidHeight = $videoContainer.find('iframe').height();
    var containerWidth = $videoContainer.width();
    var containerHeight = $videoContainer.height();

    var widthRatio = vidWidth / containerWidth,
    heightRatio = vidHeight / containerHeight;

    var newImageProperties;
    if (widthRatio < heightRatio) {
        newImageProperties = {
            width: containerWidth,
            height: vidHeight / widthRatio
        };
        newImageProperties.top = - (newImageProperties.height - containerHeight) / 2;
    } else {
        newImageProperties = {
            width: vidWidth / heightRatio,
            height: containerHeight
        };
        newImageProperties.left = - (newImageProperties.width - containerWidth) / 2;
    }

    var height = '100%';
    var marginTop = '0';
    if ( typeof $videoWrapper.attr('data-height-correction') !== 'undefined' &&
         $videoWrapper.attr('data-height-correction') !== '' &&
         $videoWrapper.attr('data-height-correction') !== '0' ) {
        height = ( 100 + parseFloat( $videoWrapper.attr('data-height-correction') ) ) + '%' ;
        marginTop = ( -parseFloat( $videoWrapper.attr('data-height-correction') ) / 4 ) + '%' ;
    }

    var width = '100%';
    var marginLeft = '0';
    if ( typeof $videoWrapper.attr('data-width-correction') !== 'undefined' &&
         $videoWrapper.attr('data-width-correction') !== '' &&
         $videoWrapper.attr('data-width-correction') !== '0' ) {
        width = ( 100 + parseFloat( $videoWrapper.attr('data-width-correction') ) ) + '%' ;
        marginLeft = ( -parseFloat( $videoWrapper.attr('data-width-correction') ) / 4 ) + '%' ;
    }


    $videoWrapper.css(newImageProperties);
    $videoContainer.find('iframe').css({
        'width': width,
        'height': height,
        'marginLeft': marginLeft,
        'marginTop': marginTop
    });
}



var tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    var videos = _vcRowGetAllElementsWithAttribute('data-youtube-video-id');

    for ( var i = 0; i < videos.length; i++ ) {
        var videoID = videos[i].getAttribute('data-youtube-video-id');
        var elemID = videos[i].childNodes[0].getAttribute('id');
        var mute = videos[i].getAttribute('data-mute');

        var player = new YT.Player(elemID, {
            height: 'auto',
            width: 'auto',
            videoId: videoID,
            playerVars: {
                autohide: 1,
                autoplay: 1,
                fs: 0,
                showinfo: 0,
                loop: 1,
                modestBranding: 1,
                start: 0,
                controls: 0,
                rel: 0,
                disablekb: 1,
                iv_load_policy: 3
            },
            events: {
                'onReady': _vcRowOnPlayerReady,
                'onStateChange': _vcRowOnPlayerStateChange,
            }
        });
        player.isMute = mute === 'true';
    }
}



/**
 * Set up both YouTube and Vimeo videos
 */


jQuery(document).ready(function($) {
    var $videoContainer = $('[data-youtube-video-id], [data-vimeo-video-id]').parent();
    $videoContainer.css('overflow', 'hidden');

    $('[data-youtube-video-id], [data-vimeo-video-id]').each(function() {
        var $this = $(this);
        setTimeout( function() {
            resizeVideo( $this );
        }, 100);
    });

    $(window).resize(function() {
        $('[data-youtube-video-id], [data-vimeo-video-id]').each(function() {
            var $this = $(this);
            setTimeout( function() {
                resizeVideo( $this );
            }, 2);
        });
    });
});

