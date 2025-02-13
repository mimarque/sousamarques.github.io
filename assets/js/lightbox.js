// Global variables to store the starting touch coordinates.
var xDown = null;
var yDown = null;

// When the touch starts, record the initial touch coordinates.
function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

// When the touch ends, compare the final coordinates with the initial ones.
function handleTouchEnd(evt) {
    if (!xDown || !yDown) {
        return;
    }
    
    var xUp = evt.changedTouches[0].clientX;
    var yUp = evt.changedTouches[0].clientY;
    
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;
    
    // Check that the swipe is mostly horizontal.
    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // If swipe distance is significant (you can set a threshold if needed)
        if (xDiff > 0) {
            // Swipe left: go to next image.
            simulateNext();
        } else {
            // Swipe right: go to previous image.
            simulatePrev();
        }
    }
    
    // Reset the initial values.
    xDown = null;
    yDown = null;
}

// Functions to simulate clicks on the next and previous buttons.
function simulateNext() {
    var nextButton = document.getElementById('next');
    if (nextButton) {
        nextButton.click();
    }
}
function simulatePrev() {
    var prevButton = document.getElementById('prev');
    if (prevButton) {
        prevButton.click();
    }
}

// Function to check if URL is a YouTube link; returns the video ID if true, else false.
function is_youtubelink(url) {
    var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    return (url.match(p)) ? RegExp.$1 : false;
}

// Function to check if URL points to an image file (now includes webp).
function is_imagelink(url) {
    var p = /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif|webp))/i;
    return (url.match(p)) ? true : false;
}

// Function to check if URL is a Vimeo link and set up the element for a Vimeo lightbox.
function is_vimeolink(url, el) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
            if (xmlhttp.status === 200) {
                var response = JSON.parse(xmlhttp.responseText);
                var id = response.video_id;
                console.log("Vimeo video ID: " + id);
                el.classList.add('lightbox-vimeo');
                el.setAttribute('data-id', id);
                el.addEventListener("click", function(event) {
                    event.preventDefault();
                    document.getElementById('lightbox').innerHTML =
                        '<a id="close"></a>' +
                        '<a id="next">&rsaquo;</a>' +
                        '<a id="prev">&lsaquo;</a>' +
                        '<div class="videoWrapperContainer"><div class="videoWrapper">' +
                        '<iframe src="https://player.vimeo.com/video/' + el.getAttribute('data-id') +
                        '/?autoplay=1&byline=0&title=0&portrait=0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>' +
                        '</div></div>';
                    document.getElementById('lightbox').style.display = 'block';
                    setGallery(this);
                });
            } else if (xmlhttp.status === 400) {
                alert('There was an error 400');
            } else {
                alert('Something else other than 200 was returned');
            }
        }
    };
    xmlhttp.open("GET", 'https://vimeo.com/api/oembed.json?url=' + url, true);
    xmlhttp.send();
}

// Function to set up the gallery navigation within the same grid container.
// Instead of looking for a parent "ul, p", we now look for the closest grid-container with class "gallery".
function setGallery(el) {
    // Remove any previously added "gallery" classes from gallery links in the whole document.
    var allGalleryLinks = document.querySelectorAll("a.gallery");
    allGalleryLinks.forEach(link => link.classList.remove('gallery'));

    // Find the nearest grid-container with class "gallery" that contains this element.
    var container = el.closest("grid-container.gallery");
    if (container) {
        // Select all links with class "gallery_linker" inside this container.
        var link_elements = container.querySelectorAll("a.gallery_linker");
        // Remove "current" from all links.
        link_elements.forEach(link => link.classList.remove('current'));
        // Mark the clicked element as current.
        link_elements.forEach(link => {
            if (el.getAttribute('href') === link.getAttribute('href')) {
                link.classList.add('current');
            }
        });
        // If more than one image, add "gallery" class to all for grouping.
        if (link_elements.length > 1) {
            document.getElementById('lightbox').classList.add('gallery');
            link_elements.forEach(link => link.classList.add('gallery'));
        }
        
        // Determine current index.
        var gallery_elements = Array.from(container.querySelectorAll('a.gallery'));
        var currentIndex = gallery_elements.findIndex(link => link.classList.contains('current'));
        if (currentIndex === -1) return;

        // Determine next and previous indices (with wrap-around).
        var nextIndex = (currentIndex + 1) % gallery_elements.length;
        var prevIndex = (currentIndex - 1 + gallery_elements.length) % gallery_elements.length;

        // Attach click events to next and prev buttons (if not already attached).
        var nextButton = document.getElementById('next');
        var prevButton = document.getElementById('prev');
        if (nextButton && prevButton) {
            // Remove existing listeners by cloning (simple trick).
            var newNext = nextButton.cloneNode(true);
            nextButton.parentNode.replaceChild(newNext, nextButton);
            newNext.addEventListener("click", function() {
                gallery_elements[nextIndex].click();
            });
            var newPrev = prevButton.cloneNode(true);
            prevButton.parentNode.replaceChild(newPrev, prevButton);
            newPrev.addEventListener("click", function() {
                gallery_elements[prevIndex].click();
            });
        }
    }
}

// Global keydown event listener for side navigation and escape key.
document.addEventListener("keydown", function(e) {
    var lightbox = document.getElementById('lightbox');
    // Only process if the lightbox is visible.
    if (lightbox && lightbox.style.display === 'block') {
        if (e.key === "Escape") {
            lightbox.innerHTML = '';
            lightbox.style.display = 'none';
            return;
        }
        // Get all gallery elements inside the lightbox container.
        var galleryElements = document.querySelectorAll('a.gallery');
        if (galleryElements.length > 1) {
            // Find the current element.
            var currentIndex = -1;
            galleryElements.forEach((el, idx) => {
                if (el.classList.contains('current')) {
                    currentIndex = idx;
                }
            });
            if (currentIndex === -1) return;
            if (e.key === "ArrowRight") {
                var nextIndex = (currentIndex + 1) % galleryElements.length;
                galleryElements[nextIndex].click();
            } else if (e.key === "ArrowLeft") {
                var prevIndex = (currentIndex - 1 + galleryElements.length) % galleryElements.length;
                galleryElements[prevIndex].click();
            }
        }
    }
});

// DOMContentLoaded: initialize lightbox container and attach event listeners.
document.addEventListener("DOMContentLoaded", function() {

    // Create lightbox div and append it to the document body.
    var lightboxDiv = document.createElement("div");
    lightboxDiv.setAttribute('id', "lightbox");
    lightboxDiv.style.display = "none"; // start hidden
    document.body.appendChild(lightboxDiv);

    // Process all anchor links with class "gallery_linker".
    var links = document.querySelectorAll('a.gallery_linker');
    links.forEach(link => {
        var url = link.getAttribute('href');
        if (url) {
            // If URL contains 'vimeo', set up Vimeo lightbox (if desired).
            if (url.indexOf('vimeo') !== -1 && !link.classList.contains('no-lightbox')) {
                is_vimeolink(url, link);
            }
            // If URL is a YouTube link.
            if (is_youtubelink(url) && !link.classList.contains('no-lightbox')) {
                link.classList.add('lightbox-youtube');
                link.setAttribute('data-id', is_youtubelink(url));
            }
            // If URL is an image link.
            if (is_imagelink(url) && !link.classList.contains('no-lightbox')) {
                link.classList.add('lightbox-image');
                // Extract filename without extension for the title.
                var filename = url.split('/').pop();
                var name = filename.split(".")[0];
                link.setAttribute('title', name);
            }
        }
    });

    // Lightbox dismissal: click on the lightbox (except on next/prev) closes it.
    document.getElementById('lightbox').addEventListener("click", function(event) {
        if (event.target.id !== 'next' && event.target.id !== 'prev') {
            this.innerHTML = '';
            this.style.display = 'none';
        }
    });

    // Add click listener for YouTube lightbox links.
    var ytLinks = document.querySelectorAll('a.lightbox-youtube');
    ytLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            document.getElementById('lightbox').innerHTML =
                '<a id="close"></a>' +
                '<a id="next">&rsaquo;</a>' +
                '<a id="prev">&lsaquo;</a>' +
                '<div class="videoWrapperContainer"><div class="videoWrapper">' +
                '<iframe src="https://www.youtube.com/embed/' + this.getAttribute('data-id') + '?autoplay=1&showinfo=0&rel=0"></iframe>' +
                '</div></div>';
            document.getElementById('lightbox').style.display = 'block';
            setGallery(this);
        });
    });

    // Add click listener for image lightbox links.
    var imgLinks = document.querySelectorAll('a.lightbox-image');
    imgLinks.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            document.getElementById('lightbox').innerHTML =
                '<a id="close"></a>' +
                '<a id="next">&rsaquo;</a>' +
                '<a id="prev">&lsaquo;</a>' +
                '<div class="img" style="background: url(\'' + this.getAttribute('href') + '\') center center / contain no-repeat;" title="' + this.getAttribute('title') + '">' +
                '<img src="' + this.getAttribute('href') + '" alt="' + this.getAttribute('title') + '" />' +
                '</div>' +
                '<span>' + this.getAttribute('title') + '</span>';
            document.getElementById('lightbox').style.display = 'block';
            setGallery(this);
        });
    });

    var lightboxElement = document.getElementById('lightbox');
    if (lightboxElement) {
        lightboxElement.addEventListener('touchstart', handleTouchStart, false);
        lightboxElement.addEventListener('touchend', handleTouchEnd, false);
    }
});
