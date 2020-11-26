'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApiClient = function () {
    function ApiClient(subject_number, project_name, demographics, trialseq) {
        _classCallCheck(this, ApiClient);

        this.base_url = 'http://localhost:8888';
        this.save_route = '/wessellab.php';
        this.url = this.base_url + this.save_route;
        this.subject_number = subject_number;
        this.trialseq = trialseq;
        this.project_name = project_name;
        this.demographics = demographics;
    }

    _createClass(ApiClient, [{
        key: 'save',
        value: function save() {
            var is_training = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            var data = {
                trialseq: this.trialseq.values,
                subject_number: this.subject_number,
                project_name: this.project_name,
                demographics: this.demographics,
                is_training: is_training
            };

            return $.ajax({
                type: 'POST',
                url: this.url,
                data: data
            });
        }
    }]);

    return ApiClient;
}();

var anyKeysValid = function anyKeysValid(key, keyCodes) {
    for (var i = 0; i < keyCodes.length; i++) {
        if (key === keyCodes[i]) return true;
    }
    return false;
};

var PsychTime = function () {
    function PsychTime() {
        _classCallCheck(this, PsychTime);

        this.timestamp = performance.now();
        this.interval = 1;
        this.intervals = 0;
        this.drift = 0;
        this.total_drifts = 0;
        this.last_time = null;
        this.flag = false;
    }

    _createClass(PsychTime, [{
        key: 'waitUntil',
        value: function waitUntil(time) {
            var _this = this;

            return new Promise(function (resolve) {
                var i = setInterval(function () {
                    var now = performance.now();
                    var e = _this.elapsed();
                    if (_this.flag || _this.isReady(time, e) && Math.abs(time - e) < Math.abs(time - e - _this.drift)) {
                        clearInterval(i);
                        resolve();
                    } else {
                        if (_this.isReady(time, e)) {
                            _this.flag = true;
                        }
                        if (_this.last_time) {
                            _this.intervals += 1;
                            _this.total_drifts += _this.calcDrift(now);
                            _this.drift = _this.total_drifts / _this.intervals;
                            _this.last_time = now;
                        } else {
                            _this.last_time = performance.now();
                        }
                    }
                }, _this.interval);
            });
        }
    }, {
        key: 'isReady',
        value: function isReady(time, elapsed) {
            return elapsed + this.drift > time && elapsed < time || elapsed + this.drift > time && elapsed > time ? true : false;
        }
    }, {
        key: 'waitForKey',
        value: function waitForKey() {
            var _this2 = this;

            var keyCode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;


            return new Promise(function (resolve) {

                $(document).bind('keydown', function (e) {
                    if (e.keyCode === keyCode) {
                        var endTime = performance.now();
                        resolve({
                            startTime: _this2.timestamp,
                            endTime: endTime,
                            elapsed: _this2.elapsed(),
                            keyCode: e.keyCode
                        });
                    }
                });
            });
        }
    }, {
        key: 'waitForKeys',
        value: function waitForKeys() {
            var _this3 = this;

            var keyCodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [32];


            return new Promise(function (resolve) {

                $(document).bind('keydown', function (e) {
                    if (anyKeysValid(e.keyCode, keyCodes)) {
                        var endTime = performance.now();
                        resolve({
                            startTime: _this3.timestamp,
                            endTime: endTime,
                            elapsed: _this3.elapsed(),
                            keyCode: e.keyCode
                        });
                    }
                });
            });
        }
    }, {
        key: 'calcDrift',
        value: function calcDrift(now) {
            return now - this.last_time - this.interval;
        }
    }, {
        key: 'elapsed',
        value: function elapsed() {
            return performance.now() - this.timestamp;
        }
    }]);

    return PsychTime;
}();

var Psych = function () {
    function Psych() {
        _classCallCheck(this, Psych);
    }

    _createClass(Psych, null, [{
        key: 'init',


        // Init with settings
        value: function init() {
            var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            var _settings = Object.assign({
                backgroundColor: 'black',
                textColor: 'white'
            }, settings);

            // Display settings
            Psych.backgroundColor = _settings.backgroundColor;
            Psych.textColor = _settings.textColor;

            // Prepare the body div
            var body = document.getElementById('root');
            body.style.height = '100vh';
            body.style.width = '100vw';
            body.style.position = 'relative';
            body.style.overflow = 'hidden';
            body.style.backgroundColor = _settings.backgroundColor;
        }

        // Start everything with the demographic form

    }, {
        key: 'demographics',
        value: function demographics() {

            return new Promise(function (resolve) {

                $.get('http://localhost:5051/demographics').then(function (data) {

                    // Insert the HTML
                    document.getElementById('root').innerHTML = data;

                    // Button to cancel start
                    $('#cancel-btn').on('click', function (e) {
                        e.preventDefault();
                        $('#exampleModal').modal('hide');
                    });

                    // Button to open warning modal before experiment begins
                    $('#form-submit').on('click', function (e) {
                        e.preventDefault();
                        $('#exampleModal').modal('show');
                    });

                    // Resolves promise, enters full screen
                    $('#start-btn').on('click', function () {
                        var country = $('#country').val();
                        var gender = $('input[name=gender]:checked').val();
                        var ethnicity = $('input[name=ethnicity]:checked').val();
                        var race = $('input[name=race]:checked').val();
                        var handedness = $('input[name=handedness]:checked').val();
                        var age = $('#age').val();
                        var vision = $('input[name=vision]:checked').val();
                        var english = $('input[name=english]:checked').val();

                        // Check to make sure all fields are filled out
                        if (!country || !gender || !ethnicity || !race || !handedness || !age || !vision || !english) {
                            console.log('Something is wrong');
                        } else {
                            Psych.clear();
                            resolve({ country: country, gender: gender, ethnicity: ethnicity, race: race, handedness: handedness, age: age, vision: vision, english: english });
                        }
                    });
                }).catch(function (err) {
                    console.log(err);
                });
            });
        }

        // Block Feedback

    }, {
        key: 'blockFeedback',
        value: function blockFeedback(items) {

            return new Promise(function (resolve) {

                Psych.clear();
                var body = document.getElementById('root');

                var div = Psych.fullScreenContainer();

                // Modify some settings in the div
                div.style.flexDirection = 'column';
                div.style.justifyContent = 'space-evenly';

                // Append a title item
                var header = Psych.text({ text: 'Block Feedback', tag: 'h2' });
                div.appendChild(header);

                // Loop through appending each item to container
                items.forEach(function (item) {
                    var text = Psych.text({ text: item });
                    div.appendChild(text);
                });

                // Further instructions at the bottom
                var footer = Psych.text({ text: 'Press the space bar to continue...', tag: 'h2' });
                div.appendChild(footer);

                body.appendChild(div);

                $(document).bind('keypress', function (e) {
                    Psych.clear();
                    if (e.keyCode === 32) resolve();
                });
            });
        }

        // Fixation cross

    }, {
        key: 'fixation',
        value: function fixation(duration) {
            var lineWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '3px';
            var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '6vw';


            return new Promise(function (resolve) {
                var _Psych$dims = Psych.dims(),
                    width = _Psych$dims.width,
                    height = _Psych$dims.height;

                var v = Psych.div({
                    backgroundColor: 'black',
                    height: size,
                    width: lineWidth,
                    locationX: width / 2,
                    locationY: height / 2
                });

                var h = Psych.div({
                    backgroundColor: 'black',
                    height: lineWidth,
                    width: size,
                    locationX: width / 2,
                    locationY: height / 2
                });

                var body = document.getElementById('root');
                body.appendChild(v);
                body.appendChild(h);

                setTimeout(function () {
                    Psych.clear();
                    resolve();
                }, duration);
            });
        }

        // Present a welcome screen

    }, {
        key: 'welcome',
        value: function welcome() {
            var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Welcome! Press the space bar to begin.';


            return new Promise(function (resolve) {
                // Get body
                var body = document.getElementById('root');

                Psych.clear();
                var div = Psych.fullScreenContainer();
                var text = Psych.text({ text: t });

                div.appendChild(text); // put in text
                body.appendChild(div); // add to DOM

                $(document).bind('keypress', function (e) {
                    Psych.clear();
                    if (e.keyCode === 32) resolve();
                });
            });
        }

        // Wait for a keypress

    }, {
        key: 'waitForKey',
        value: function waitForKey() {
            var keyCode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;


            return new Promise(function (resolve) {

                $(document).bind('keydown', function (e) {
                    if (e.keyCode === keyCode) resolve();
                });
            });
        }

        // Wait for a keypress

    }, {
        key: 'waitForKeys',
        value: function waitForKeys() {
            var keyCodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [32];


            return new Promise(function (resolve) {

                $(document).bind('keydown', function (e) {
                    if (anyKeysValid(e.keyCode, keyCodes)) resolve(e.keyCode);
                });
            });
        }

        // Countdown

    }, {
        key: 'countdown',
        value: function countdown() {
            var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;


            return new Promise(function (resolve) {

                Psych.clear();
                var div = Psych.fullScreenContainer();
                var text = Psych.text('Starting in ' + val + '...');
                div.appendChild(text);
                document.getElementById('root').appendChild(div);

                var i = setInterval(function () {

                    val -= 1;
                    if (val === 0) {
                        Psych.clear();
                        clearInterval(i);
                        resolve();
                    } else {
                        text.innerText = 'Starting in ' + val + '...';
                    }
                }, 1000);
            });
        }

        // Clear screen

    }, {
        key: 'clear',
        value: function clear() {
            document.getElementById('root').innerHTML = '';
        }

        // Text block

    }, {
        key: 'text',
        value: function text() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            var _options = Object.assign({
                text: '',
                color: Psych.textColor,
                tag: 'p',
                letterSpacing: '1px',
                fontSize: '1.5em',
                margin: '0px',
                padding: '0px',
                fontWeight: 'normal'
            }, options);

            var text = document.createElement(_options.tag);
            text.innerText = _options.text;
            text.style.color = _options.color;
            text.style.letterSpacing = _options.letterSpacing;
            text.style.fontSize = _options.fontSize;
            text.style.margin = _options.margin;
            text.style.padding = _options.padding;
            text.style.fontWeight = _options.fontWeight;
            return text;
        }

        // Container div

    }, {
        key: 'fullScreenContainer',
        value: function fullScreenContainer() {
            var div = document.createElement('div');
            div.style.background = Psych.backgroundColor;
            div.style.zIndex = '999999999';
            div.style.height = '100vh';
            div.style.width = '100vw';
            div.style.position = 'absolute';
            div.style.top = '0px';
            div.style.left = '0px';
            div.style.right = '0px';
            div.style.bottom = '0px';
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            return div;
        }

        // Get outwindow dimensions

    }, {
        key: 'dims',
        value: function dims() {
            var outwindow = document.getElementById('root');
            return {
                height: outwindow.clientHeight,
                width: outwindow.clientWidth
            };
        }

        // Create a standard div

    }, {
        key: 'div',
        value: function div() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            // Get dims
            var dims = Psych.dims();

            var _options = Object.assign({
                left: dims.width / 2 + 'px',
                top: dims.height / 2 + 'px',
                backgroundColor: 'white',
                borderRadius: '0px',
                height: '5px',
                width: '5px',
                padding: '0px',
                moveFromCenter: true
            }, options);

            var div = document.createElement('div');
            div.style.left = _options.left;
            div.style.top = _options.top;
            div.style.backgroundColor = _options.backgroundColor;
            div.style.borderRadius = _options.borderRadius;
            div.style.height = _options.height;
            div.style.width = _options.width;
            div.style.padding = _options.padding;
            div.style.position = 'absolute';
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            if (_options.moveFromCenter) div.style.transform = 'translate(-50%, -50%)';
            return div;
        }

        // Div with text inside it

    }, {
        key: 'divWithText',
        value: function divWithText(textOptions, divOptions) {

            var text = Psych.text(textOptions);
            var div = Psych.div(divOptions);
            div.appendChild(text);
            div.style.display = 'none';
            return div;
        }

        // Get canvas default options

    }, {
        key: 'getCanvasOptions',
        value: function getCanvasOptions(options) {

            // Get window dims
            var dims = Psych.dims();

            // Default options
            var _options = Object.assign({
                lineWidth: 0,
                size: 100,
                fillStyle: 'black',
                strokeStyle: 'black',
                top: dims.height / 2,
                left: dims.width / 2
            }, options);

            return _options;
        }

        // Create a canvas object

    }, {
        key: 'createCanvas',
        value: function createCanvas(options) {

            // Get dims
            var dims = Psych.dims();

            // Create canvas
            var canvas = document.createElement('canvas');
            canvas.height = dims.height;
            canvas.width = dims.width;
            canvas.style.position = 'absolute';
            canvas.style.display = 'none';

            // Get the context
            var ctx = canvas.getContext('2d');

            // Translate
            ctx.translate(options.left, options.top);

            // the outline
            ctx.lineWidth = options.lineWidth;
            ctx.strokeStyle = options.strokeStyle;
            ctx.stroke();

            // the fill color
            ctx.fillStyle = options.fillStyle;
            ctx.fill();

            return { canvas: canvas, ctx: ctx };
        }

        // Create an arrow

    }, {
        key: 'createArrow',
        value: function createArrow(options) {

            // Create canvas options
            var _options = Psych.getCanvasOptions(options);

            // Create the canvas

            var _Psych$createCanvas = Psych.createCanvas(_options),
                canvas = _Psych$createCanvas.canvas,
                ctx = _Psych$createCanvas.ctx;

            // Setup sizing


            var size = _options.size / 100; // scale down
            var handleLength = 80 * size;
            var handleHeight = 13 * size;
            var headLength = 50 * size;
            var headHeight = 40 * size;

            // Draw arrow
            ctx.beginPath();
            ctx.moveTo(-handleLength, -handleHeight);
            ctx.lineTo(0, -handleHeight);
            ctx.lineTo(0, -headHeight);
            ctx.lineTo(headLength, 0);
            ctx.lineTo(0, headHeight);
            ctx.lineTo(0, handleHeight);
            ctx.lineTo(-handleLength, handleHeight);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            return canvas;
        }

        // Create a triangle object

    }, {
        key: 'createTriangle',
        value: function createTriangle(options) {

            // Create canvas options
            var _options = Psych.getCanvasOptions(options);

            // Create canvas

            var _Psych$createCanvas2 = Psych.createCanvas(_options),
                canvas = _Psych$createCanvas2.canvas,
                ctx = _Psych$createCanvas2.ctx;

            // Get the triangle height


            var size = _options.size;
            var h = size * (Math.sqrt(3) / 2);

            // Draw triangle
            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-size / 2, h / 2);
            ctx.lineTo(size / 2, h / 2);
            ctx.lineTo(0, -h / 2);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            // the outline again to close the path
            ctx.lineWidth = _options.lineWidth;
            ctx.strokeStyle = _options.strokeStyle;
            ctx.stroke();

            return canvas;
        }

        // Create a square

    }, {
        key: 'createSquare',
        value: function createSquare(options) {

            // Create canvas options
            var _options = Psych.getCanvasOptions(options);

            // Create the canvas

            var _Psych$createCanvas3 = Psych.createCanvas(_options),
                canvas = _Psych$createCanvas3.canvas,
                ctx = _Psych$createCanvas3.ctx;

            // Draw square


            ctx.fillRect(0 - _options.size / 2, 0 - _options.size / 2, _options.size, _options.size);
            ctx.strokeRect(0 - _options.size / 2, 0 - _options.size / 2, _options.size, _options.size);

            return canvas;
        }

        // Create a cricle

    }, {
        key: 'createCircle',
        value: function createCircle(options) {

            // Create canvas options
            var _options = Psych.getCanvasOptions(options);

            // Create the canvas

            var _Psych$createCanvas4 = Psych.createCanvas(_options),
                canvas = _Psych$createCanvas4.canvas,
                ctx = _Psych$createCanvas4.ctx;

            // Draw circle


            ctx.beginPath();
            ctx.arc(0, 0, _options.size, 0, 2 * Math.PI);
            ctx.stroke();

            // For some reason we need to fill the circle again here
            ctx.fillStyle = _options.fillStyle;
            ctx.fill();

            return canvas;
        }

        // Wrapper for creating shapes

    }, {
        key: 'makeShape',
        value: function makeShape(shape, options) {

            switch (shape) {
                case 'triangle':
                    return Psych.createTriangle(options);
                case 'square':
                    return Psych.createSquare(options);
                case 'arrow':
                    return Psych.createArrow(options);
                case 'circle':
                    return Psych.createCircle(options);
                default:
                    throw new Error('Not a valid shape. Valid shapes include the following: triangle, square, circle, arrow.');
            }
        }

        // Get the dimensions of a container

    }, {
        key: 'getDims',
        value: function getDims(div) {
            return {
                top: parseFloat(div.style.top),
                left: parseFloat(div.style.left),
                height: div.offsetHeight,
                width: div.offsetWidth
            };
        }

        // Update a divWithText item

    }, {
        key: 'update',
        value: function update(item, textOptions, divOptions) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {

                for (var _iterator = Object.entries(textOptions)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2),
                        key = _step$value[0],
                        value = _step$value[1];

                    item.firstChild.style[key] = value;
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.entries(divOptions)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2),
                        key = _step2$value[0],
                        value = _step2$value[1];

                    item.style[key] = value;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return item;
        }

        // Display elements onto screen

    }, {
        key: 'display',
        value: function display(divs) {

            // Show all divs
            divs.forEach(function (div) {
                div.style.display = 'flex';
            });

            return new PsychTime();
        }

        // Add objects to DOM

    }, {
        key: 'prepare',
        value: function prepare(divs) {

            var root = document.getElementById('root');
            divs.forEach(function (div) {
                return root.appendChild(div);
            });
        }

        // Hide elements on screen

    }, {
        key: 'hide',
        value: function hide(divs) {

            // Show all divs
            divs.forEach(function (div) {
                div.style.display = 'none';
            });

            return new PsychTime();
        }

        // Wait a certain amount of time

    }, {
        key: 'wait',
        value: function wait(duration) {
            return new Promise(function (resolve) {
                setTimeout(function () {
                    resolve();
                }, duration);
            });
        }

        // Get browser type

    }, {
        key: 'getBrowser',
        value: function getBrowser() {

            // Opera 8.0+
            var isOpera = !!window.opr && !!opr.addons || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
            if (isOpera) return 'Opera';

            // Firefox 1.0+
            var isFirefox = typeof InstallTrigger !== 'undefined';
            if (isFirefox) return 'Firefox';

            // Safari 3.0+ "[object HTMLElementConstructor]" 
            var isSafari = /constructor/i.test(window.HTMLElement) || function (p) {
                return p.toString() === "[object SafariRemoteNotification]";
            }(!window['safari'] || typeof safari !== 'undefined' && safari.pushNotification);
            if (isSafari) return 'Safari';

            // Internet Explorer 6-11
            var isIE = /*@cc_on!@*/false || !!document.documentMode;
            if (isIE) return 'Internet Explorer';

            // Edge 20+
            var isEdge = !isIE && !!window.StyleMedia;
            if (isEdge) return 'Edge';

            // Chrome 1 - 79
            var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
            if (isChrome) return 'Chrome';

            // Edge (based on chromium) detection
            var isEdgeChromium = isChrome && navigator.userAgent.indexOf("Edg") != -1;
            if (isEdgeChromium) return 'Edge Chromium';

            // Blink engine detection
            var isBlink = (isChrome || isOpera) && !!window.CSS;
            if (isBlink) return 'Blink';
        }

        // Enter Full Screen

    }, {
        key: 'fullScreen',
        value: function fullScreen() {

            return new Promise(function (resolve) {

                // Enter full screen
                if (Psych.browser === 'Firefox') {
                    document.documentElement.mozRequestFullScreen();
                } else {
                    document.documentElement.webkitRequestFullScreen();
                }

                // Exit when it finishes
                var i = setInterval(function () {
                    if (Psych.browser === 'Firefox' && document.mozFullScreen) {
                        clearInterval(i);
                        resolve();
                    } else if (document.webkitIsFullScreen) {
                        clearInterval(i);
                        resolve();
                    }
                }, 300);
            });
        }

        // Exit Full Screen

    }, {
        key: 'exitFullScreen',
        value: function exitFullScreen() {

            return new Promise(function (resolve) {

                // Exit full screen
                if (Psych.browser === 'Firefox') {
                    document.mozCancelFullScreen();
                } else {
                    document.webkitCancelFullScreen();
                }

                // Resolve when it finishes
                var i = setInterval(function () {
                    if (Psych.browser === 'Firefox' && document.mozFullScreen) {
                        clearInterval(i);
                        resolve();
                    } else if (document.webkitIsFullScreen) {
                        clearInterval(i);
                        resolve();
                    }
                }, 300);
            });
        }
    }]);

    return Psych;
}();

Psych.backgroundColor = 'black';
Psych.textColor = 'white';
Psych.browser = Psych.getBrowser();

var Matrix = function () {
    function Matrix(h, w) {
        var v = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        _classCallCheck(this, Matrix);

        this.values = Matrix.full(h, w, v);
    }

    // Get a single cell


    _createClass(Matrix, [{
        key: 'get',
        value: function get(row, col) {
            return this.values[row][col];
        }

        // Set a single cell

    }, {
        key: 'set',
        value: function set(row, col, val) {
            if (row >= this.values.length || col >= this.values[0].length) {
                throw new Error('Set index out of bounds.');
            } else {
                this.values[row][col] = val;
            }
        }

        // Set a row with a specific value

    }, {
        key: 'setRow',
        value: function setRow(row, val) {
            if (row >= this.values.length) {
                throw new Error('Set row index out of bounds.');
            } else {
                for (var i = 0; i < this.values[row].length; i++) {
                    this.values[row][i] = val;
                }
            }
        }

        // Set a column with a specific value

    }, {
        key: 'setCol',
        value: function setCol(col, val) {
            if (col >= this.values[0].length) {
                throw new Error('Set column index out of bounds.');
            } else {
                for (var i = 0; i < this.values.length; i++) {
                    this.values[i][col] = val;
                }
            }
        }

        // Return a single row from the trialseq

    }, {
        key: 'getRow',
        value: function getRow(row) {
            return this.values[row];
        }

        // Return a single column from the trialseq

    }, {
        key: 'getCol',
        value: function getCol(col) {
            return this.values.map(function (row) {
                return row[col];
            });
        }

        // Get multiple rows

    }, {
        key: 'getRows',
        value: function getRows(from, to) {
            var rows = [];
            for (var i = from; i < to; i++) {
                rows.push(this.values[i]);
            }
            return rows;
        }

        // Get the shape of the matrix

    }, {
        key: 'shape',
        value: function shape() {
            return [this.values.length, this.values[0].length];
        }

        // Shuffle the trial sequence

    }, {
        key: 'shuffle',
        value: function shuffle() {
            this.values = this.values.sort(function () {
                return Math.random() - 0.5;
            });
        }

        // Create a 2d matrix of zeros

    }], [{
        key: 'zeros',
        value: function zeros(height, width) {

            var rows = [];
            for (var i = 0; i < height; i++) {

                // Init rows
                var row = [];

                // Append columns
                for (var ii = 0; ii < width; ii++) {
                    row.push(0);
                }

                // Append to matrix
                rows.push(row);
            }

            return rows;
        }

        // Create a 2d matrix with a specified value

    }, {
        key: 'full',
        value: function full(height, width, val) {

            var rows = [];
            for (var i = 0; i < height; i++) {

                // Init rows
                var row = [];

                // Append columns
                for (var ii = 0; ii < width; ii++) {
                    row.push(val);
                }

                // Append to matrix
                rows.push(row);
            }

            return rows;
        }
    }]);

    return Matrix;
}();