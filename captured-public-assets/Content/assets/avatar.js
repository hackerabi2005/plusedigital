



    (function (w, d) {


        function LetterAvatar(name, size) {

            name = name || '';
            size = size || 60;

            var colours = [
                    "#fb498c", "#d9cc42", "#3484d2", "#afcf31", "#61bd0f", "#540299", "#f0c319", "#e19805", "#629cef", "#5dc85b", "#66ce92", "#dbb06a", "#145385",
					"#78d7c3", "#bd5900", "#234f99", "#23aa8f", "#d5b01c", "#d35400", "#13715f", "#0f037c", "#01ba44", "#c63bd7", "#aa6ae0", "#ff9c00", "#b80045"
            ],

                nameSplit = String(name).toUpperCase().split(' '),
                initials, charIndex, colourIndex, canvas, context, dataURI;


            if (nameSplit.length == 1) {
                initials = nameSplit[0] ? nameSplit[0].charAt(0) : '?';
            } else {
                initials = nameSplit[0].charAt(0) + nameSplit[1].charAt(0);
            }

            if (w.devicePixelRatio) {
                size = (size * w.devicePixelRatio);
            }

            charIndex = (initials == '?' ? 72 : initials.charCodeAt(0)) - 64;
            colourIndex = charIndex % 20;
            canvas = d.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            context = canvas.getContext("2d");

            context.fillStyle = colours[colourIndex - 1];
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.font = Math.round(canvas.width / 2) + "px Arial";
            context.textAlign = "center";
            context.fillStyle = "#FFF";
            context.fillText(initials, size / 2, size / 1.5);

            dataURI = canvas.toDataURL();
            canvas = null;

            return dataURI;
        }

        LetterAvatar.transform = function () {

            Array.prototype.forEach.call(d.querySelectorAll('img[avatar]'), function (img, name) {
                name = img.getAttribute('avatar');
                img.src = LetterAvatar(name, img.getAttribute('width'));
                img.removeAttribute('avatar');
                img.setAttribute('alt', name);
            });
        };


        // AMD support
        if (typeof define === 'function' && define.amd) {

            define(function () { return LetterAvatar; });

            // CommonJS and Node.js module support.
        } else if (typeof exports !== 'undefined') {

            // Support Node.js specific `module.exports` (which can be a function)
            if (typeof module != 'undefined' && module.exports) {
                exports = module.exports = LetterAvatar;
            }

            // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
            exports.LetterAvatar = LetterAvatar;

        } else {

            window.LetterAvatar = LetterAvatar;

            d.addEventListener('DOMContentLoaded', function (event) {
                LetterAvatar.transform();
            });
        }

    })(window, document);


       

           

      


