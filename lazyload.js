/*!
 * Lazy Loading
 */
// Get all of the images that are marked up to lazy load
var images = document.querySelectorAll(".js-lazy-image");
var config = {
    // If the image gets within 50px in the Y axis, start the download.
    rootMargin: "50px 0px",
    threshold: 0.01
};

var imageCount = images.length;
var observer;

// If we don't have support for intersection observer, loads the images immediately
if (!("IntersectionObserver" in window)) {
    loadImagesImmediately(images);
} else {
    // It is supported, load the images
    observer = new IntersectionObserver(onIntersection, config);

    // foreach() is not supported in IE
    for (var i = 0; i < images.length; i++) {
        var image = images[i];
        if (image.classList.contains("js-lazy-image--handled")) {
            continue;
        }

        observer.observe(image);
    }
}

/**
 * Fetchs the image for the given URL
 * @param {string} url
 * @param {string} set
 */
function fetchImage(url, set) {
    return new Promise(function (resolve, reject) {
        var image = new Image();
        image.src = url;
        if (set) image.srcset = set;
        image.onload = resolve;
        image.onerror = reject;
    });
}

/**
 * Preloads the image
 * @param {object} image
 */
function preloadImage(image) {
    var src = image.dataset.src;
    var srcset = image.dataset.srcset;
    if (!src) {
        return;
    }
    if (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) {
        return fetchImage(src, srcset).then(function () {
            applyImage(image, src, srcset);
        });
    } else {
        applyImage(image, src, srcset);
    }
}

function loadImagesImmediately(images) {
    // foreach() is not supported in IE
    for (var i = 0; i < images.length; i++) {
        var image = images[i];
        preloadImage(image);
    }
}

/**
 * Disconnect the observer
 */
function disconnect() {
    if (!observer) {
        return;
    }

    observer.disconnect();
}

function onIntersection(entries) {
    // Disconnect if we've already loaded all of the images
    if (imageCount === 0) {
        observer.disconnect();
    }

    // Loop through the entries
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        // Are we in viewport?
        if (entry.intersectionRatio > 0) {
            imageCount--;

            // Stop watching and load the image
            observer.unobserve(entry.target);
            preloadImage(entry.target);
        }
    }
}

/**
 * Apply the image
 * @param {object} img
 * @param {string} src
 * @param {string} set
 */
function applyImage(img, src, set) {
    // Prevent this from being lazy loaded a second time.
    img.classList.add("js-lazy-image--handled");
    img.src = src;
    if (set) img.srcset = set;
    img.classList.add("fade-in");
}




