'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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
        this.offsetDelays = [];
        this.offsetFunctions = [];
        this.offsetFunctionsFlags = [];
    }

    _createClass(PsychTime, [{
        key: 'checkOffsetFunctions',
        value: function checkOffsetFunctions(elapsed) {

            var availableFunctionsIndicies = [];
            for (var i = 0; i < this.offsetDelays.length; i++) {
                if (elapsed >= this.offsetDelays[i] && this.offsetFunctionsFlags[i]) {
                    availableFunctionsIndicies.push(i);
                    this.offsetFunctionsFlags[i] = false;
                }
            }
            return availableFunctionsIndicies;
        }
    }, {
        key: 'waitUntil',
        value: function waitUntil(time) {
            var _this = this;

            return new Promise(function (resolve) {
                var i = setInterval(function () {

                    // Get metrics
                    var now = performance.now();
                    var e = _this.elapsed();

                    // Check for offset functions
                    var availableFunctions = _this.checkOffsetFunctions(e);
                    if (availableFunctions.length > 0) {
                        availableFunctions.forEach(function (fnIdx) {
                            _this.offsetFunctions[fnIdx]();
                        });
                    }

                    // Main loop check
                    if (_this.flag || _this.isReady(time, e) && Math.abs(time - e) < Math.abs(time - e - _this.drift)) {
                        clearInterval(i);
                        resolve({
                            startTime: _this.timestamp,
                            endTime: now,
                            keyCode: null,
                            keyPressed: false,
                            elapsed: e,
                            psychTime: new PsychTime()
                        });
                        return;
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

                document.addEventListener('keydown', function (e) {

                    if (e.keyCode === keyCode) {
                        var endTime = performance.now();
                        resolve({
                            startTime: _this2.timestamp,
                            endTime: endTime,
                            elapsed: _this2.elapsed(),
                            keyCode: e.keyCode,
                            keyPressed: true,
                            psychTime: new PsychTime()
                        });
                    }
                }, { once: true });
            });
        }
    }, {
        key: 'waitForKeys',
        value: function waitForKeys() {
            var _this3 = this;

            var keyCodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [32];


            return new Promise(function (resolve) {

                document.addEventListener('keydown', function (e) {

                    if (anyKeysValid(e.keyCode, keyCodes)) {
                        var endTime = performance.now();
                        resolve({
                            startTime: _this3.timestamp,
                            endTime: endTime,
                            elapsed: _this3.elapsed(),
                            keyCode: e.keyCode,
                            keyPressed: true,
                            psychTime: new PsychTime()
                        });
                        return;
                    }
                }, { once: true });
            });
        }
    }, {
        key: 'waitForKeyWithTimeout',
        value: function waitForKeyWithTimeout() {
            var _this4 = this;

            var keyCode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;
            var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;


            return new Promise(function (resolve) {

                Promise.any([_this4.waitForKey(keyCode), _this4.waitUntil(timeout)]).then(function (res) {
                    _this4.offsetDelays = [];
                    _this4.offsetFunctions = [];
                    _this4.offsetFunctionsFlags = [];
                    resolve(res);
                });
            });
        }
    }, {
        key: 'waitForKeysWithTimeout',
        value: function waitForKeysWithTimeout() {
            var _this5 = this;

            var keyCodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [32];
            var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;


            return new Promise(function (resolve) {

                Promise.any([_this5.waitForKeys(keyCodes), _this5.waitUntil(timeout)]).then(function (res) {
                    _this5.offsetDelays = [];
                    _this5.offsetFunctions = [];
                    _this5.offsetFunctionsFlags = [];
                    resolve(res);
                });
            });
        }
    }, {
        key: 'addOffsetFunction',
        value: function addOffsetFunction(delay, fn) {
            this.offsetDelays.push(delay);
            this.offsetFunctions.push(fn);
            this.offsetFunctionsFlags.push(true);
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
    function Psych(menuItems) {
        _classCallCheck(this, Psych);

        this.menuItems = menuItems;
    }

    // Init with settings


    _createClass(Psych, [{
        key: 'start',
        value: function start() {
            var _this6 = this;

            Psych.demographics().then(function (demographics) {
                _this6.demographics = demographics;
                _this6.menu();
            });
        }

        // Get menu html

    }, {
        key: 'menu',
        value: function menu() {

            // Clear the DOM
            Psych.clear();

            // Get the root node
            var body = document.getElementById('root');

            // Create container element
            var container = document.createElement('div');
            container.className = 'container mt-5';
            container.id = 'menu-container';

            // Insert menu items
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.menuItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var item = _step.value;


                    var i = this.createMenuItem(item);
                    container.appendChild(i);
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

            body.appendChild(container);

            // Place modal into the DOM
            Psych.insertModal();
        }

        // Create element

    }, {
        key: 'createMenuItem',


        // Create a menu item
        value: function createMenuItem(item) {
            var _this7 = this;

            // Container
            var container = document.createElement('div');
            container.className = 'card mt-5 mb-5';
            container.id = 'card';

            // Header
            var header = document.createElement('h5');
            header.className = 'card-header';
            header.id = 'card-header';
            header.innerText = item.header;

            // Card body
            var cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Card title
            var cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.id = 'card-title';
            cardTitle.innerText = item.title;

            // Card text
            var cardText = document.createElement('p');
            cardText.className = 'card-text';
            cardText.id = 'card-text';
            cardText.innerText = item.text;

            // Card button
            var cardButton = document.createElement('button');
            cardButton.className = 'btn btn-primary';
            cardButton.id = 'go-somewhere';
            cardButton.innerText = 'Start';

            $(cardButton).on('click', function (e) {
                e.preventDefault(); // Prevent default

                // Show modal
                $('#exampleModal').modal('show');

                // Clicked start button
                $('#start-btn').on('click', function (e) {
                    e.preventDefault();
                    $('#exampleModal').modal('hide');

                    // Clear screen
                    Psych.clear();

                    // Run function
                    item.start(_this7.demographics).then(function () {
                        console.log('Going to main menu');

                        // Go back to main menu
                        _this7.menu();
                    }).catch(function (err) {
                        console.log(err);
                    });
                });

                // Button to cancel start
                $('#cancel-btn').on('click', function (e) {
                    $('#start-btn').off('click');
                    $('#exampleModal').modal('hide');
                });
            });

            // Put it all together
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);
            cardBody.appendChild(cardButton);
            container.appendChild(header);
            container.appendChild(cardBody);

            return container;
        }

        // Start everything with the demographic form

    }], [{
        key: 'init',
        value: function init() {
            var settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


            var _settings = Object.assign({
                backgroundColor: 'white',
                textColor: 'black'
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
    }, {
        key: 'toElement',
        value: function toElement(html) {
            return new DOMParser().parseFromString(html, 'text/html').body.childNodes[0];
        }

        // Insert modal into the DOM

    }, {
        key: 'insertModal',
        value: function insertModal() {

            var str = '\n            <!-- Modal -->\n            <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">\n                <div class="modal-dialog" role="document">\n                <div class="modal-content">\n                    <div class="modal-header">\n                    <h5 class="modal-title" id="exampleModalLabel">Read Carefully!</h5>\n                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                        <span aria-hidden="true">&times;</span>\n                    </button>\n                    </div>\n                    <div class="modal-body">\n                        <p>We are about to begin the experiment.</p>\n                        <p>The experiment will enter full screen mode. Do not, at any time, exit full screen mode, until the experiment is complete.</p>\n                        <p>If you do not want to start yet, click "Cancel"</p>\n                        <p>If you are ready, click "Begin"</p>\n                    </div>\n                    <div class="modal-footer">\n                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id=\'cancel-btn\'>Cancel</button>\n                        <button type="button" class="btn btn-primary" id=\'start-btn\'>Begin</button>\n                    </div>\n                </div>\n                </div>\n            </div>\n        ';
            var ele = Psych.toElement(str);
            document.getElementById('root').appendChild(ele);
        }
    }, {
        key: 'demographics',
        value: function demographics() {

            return new Promise(function (resolve) {

                $.get('https://psychjs.alecneuro.com/html/demographics.html').then(function (data) {

                    // Insert the HTML
                    document.getElementById('root').innerHTML = data;

                    // Resolves promise, enters full screen
                    $('#form-submit').on('click', function (e) {
                        e.preventDefault();

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

                var body = document.getElementById('root');

                var div = Psych.fullScreenContainer();

                // Modify some settings in the div
                div.style.display = 'flex';
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
                var footer = Psych.text({ text: 'Wait 3 seconds then press the space bar to continue...', tag: 'h2' });
                div.appendChild(footer);

                body.appendChild(div);

                setTimeout(function () {
                    document.addEventListener('keydown', function (e) {
                        if (e.keyCode === 32) {
                            body.removeChild(div);
                            resolve();
                        }
                    }, { once: true });
                }, 3000);
            });
        }

        // Fixation cross

    }, {
        key: 'fixation',
        value: function fixation() {
            var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'black';
            var lineWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '3px';
            var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '6vw';

            var _Psych$dims = Psych.dims(),
                width = _Psych$dims.width,
                height = _Psych$dims.height;

            var div = Psych.fullScreenContainer('transparent');

            var v = Psych.div({
                backgroundColor: color,
                height: size,
                width: lineWidth,
                locationX: width / 2,
                locationY: height / 2,
                display: 'inline-block'
            });

            var h = Psych.div({
                backgroundColor: color,
                height: lineWidth,
                width: size,
                locationX: width / 2,
                locationY: height / 2,
                display: 'inline-block'
            });

            div.appendChild(v);
            div.appendChild(h);

            return div;
        }

        // Present a welcome screen

    }, {
        key: 'welcome',
        value: function welcome() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var waitDuration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 3000;


            var _options = Object.assign({
                text: 'Welcome! Press the space bar to begin.',
                color: Psych.textColor,
                fontSize: '3em',
                fontWeight: 'bolder'
            }, options);

            return new Promise(function (resolve) {

                // Get body
                var body = document.getElementById('root');

                var div = Psych.fullScreenContainer();
                div.style.display = 'flex';
                var text = Psych.text(_options);

                div.appendChild(text); // put in text
                body.appendChild(div); // add to DOM

                var setListener = function setListener() {
                    document.addEventListener('keydown', function (e) {
                        if (e.keyCode === 32) {
                            body.removeChild(div);
                            resolve();
                        } else {
                            setListener();
                        }
                    }, { once: true });
                };

                setTimeout(function () {
                    return setListener();
                }, waitDuration);
            });
        }

        // Wait for a keypress

    }, {
        key: 'waitForKey',
        value: function waitForKey() {
            var keyCode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 32;


            return new Promise(function (resolve) {

                var addListener = function addListener() {
                    document.addEventListener('keydown', function (e) {
                        if (e.keyCode === keyCode) {
                            resolve();
                        } else {
                            addListener();
                        }
                    }, { once: true });
                };

                addListener();
            });
        }

        // Wait for a keypress

    }, {
        key: 'waitForKeys',
        value: function waitForKeys() {
            var keyCodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [32];


            return new Promise(function (resolve) {

                var addListener = function addListener() {
                    document.addEventListener('keydown', function (e) {

                        if (anyKeysValid(e.keyCode, keyCodes)) {
                            resolve(e.keyCode);
                        } else {
                            addListener();
                        }
                    }, { once: true });
                };

                addListener();
            });
        }

        // Countdown

    }, {
        key: 'countdown',
        value: function countdown() {
            var textColor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Psych.textColor;
            var backgroundColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Psych.backgroundColor;
            var val = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;


            return new Promise(function (resolve) {

                var div = Psych.fullScreenContainer(backgroundColor);
                div.style.display = 'flex';
                var text = Psych.text({
                    text: 'Starting in ' + val + '...',
                    color: textColor,
                    fontSize: '3em',
                    fontWeight: 'bolder'
                });
                div.appendChild(text);
                document.getElementById('root').appendChild(div);

                var i = setInterval(function () {

                    val -= 1;
                    if (val === 0) {
                        document.getElementById('root').removeChild(div);
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
            return new PsychTime();
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
            var bgColor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Psych.backgroundColor;

            var div = document.createElement('div');
            div.style.background = bgColor;
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
            div.style.display = 'none';
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
                display: 'none',
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
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            div.style.display = _options.display;
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
                left: dims.width / 2,
                rotate: 0
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

            // Rotation around center axis
            ctx.rotate(options.rotate * Math.PI / 180);

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
            var handleLength = 50 * size;
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
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {

                for (var _iterator2 = Object.entries(textOptions)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2),
                        key = _step2$value[0],
                        value = _step2$value[1];

                    item.firstChild.style[key] = value;
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

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = Object.entries(divOptions)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var _step3$value = _slicedToArray(_step3.value, 2),
                        key = _step3$value[0],
                        value = _step3$value[1];

                    item.style[key] = value;
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
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
                    if (Psych.browser === 'Firefox' && !document.mozFullScreen) {
                        clearInterval(i);
                        resolve();
                    } else if (!document.webkitIsFullScreen) {
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

        this.values = Matrix.full2d(h, w, v);
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

        // Set a row with an existing array

    }, {
        key: 'setRowFromArray',
        value: function setRowFromArray(row, array) {

            // Check to make sure dimensions are equal
            if (this.values[row].length !== array.length) {
                throw new Error('Row assignment cannot be done because dimensions are not equal.');
            }

            // Set values
            this.values[row] = array;
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

        // Set a column from an existing array

    }, {
        key: 'setColFromArray',
        value: function setColFromArray(col, array) {

            // Check to make sure dimensions are equal
            if (this.values.length !== array.length) {
                throw new Error('Column assignment cannot be done because dimensions are not equal.');
            }

            // Set values
            for (var i = 0; i < array.length; i++) {
                this.set(i, col, array[i]);
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

        // Get column by criteria

    }, {
        key: 'getColByCriteria',
        value: function getColByCriteria(col, fn) {

            return this.getCol(col).filter(fn);
        }

        // Get all rows and columns by column criteria

    }, {
        key: 'getRowsAndColumnsByCriteria',
        value: function getRowsAndColumnsByCriteria(fn) {

            var rows = [];
            for (var i = 0; i < this.values.length; i++) {
                if (fn(this.getRow(i))) {
                    rows.push(this.values[i]);
                }
            }
            return rows.length > 0 ? Matrix.initFromMatrix(rows) : null;
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

        // Shuffle an array (not in place)

    }, {
        key: 'print',


        // Print the matrix as a table to the console
        value: function print() {
            console.table(this.values);
        }
    }], [{
        key: 'shuffleArray',
        value: function shuffleArray(arr) {
            var j, x, i;
            for (i = arr.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = arr[i];
                arr[i] = arr[j];
                arr[j] = x;
            }
            return arr;
        }

        // Create an array of zeros

    }, {
        key: 'zeros',
        value: function zeros(len) {
            var a = new Array(len);
            for (var i = 0; i < len; ++i) {
                a[i] = 0;
            }return a;
        }

        // Create an array filled with a particular value

    }, {
        key: 'full',
        value: function full(len, val) {
            var a = new Array(len);
            for (var i = 0; i < len; ++i) {
                a[i] = val;
            }return a;
        }

        // Create a 2d matrix of zeros

    }, {
        key: 'zeros2d',
        value: function zeros2d(height, width) {

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
        key: 'full2d',
        value: function full2d(height, width, val) {

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

        // Concat multiple Matrix instances together

    }, {
        key: 'append',
        value: function append(matricies) {

            // If we only have 1 matrix then just return that
            if (matricies.length === 1) {
                return matricies[0];
            }

            // Validate array of inputs
            matricies.forEach(function (matrix) {

                // Check to make sure all array items are of the Matrix class
                if (matrix instanceof Matrix === false) {
                    throw new Error('All array items must be an instance of Matrix class.');
                }
            });

            // Validate that all matricies have the same number of columns

            var _matricies$0$shape = matricies[0].shape(),
                _matricies$0$shape2 = _slicedToArray(_matricies$0$shape, 2),
                columns = _matricies$0$shape2[1];

            matricies.forEach(function (matrix) {
                var _matrix$shape = matrix.shape(),
                    _matrix$shape2 = _slicedToArray(_matrix$shape, 2),
                    cols = _matrix$shape2[1];

                if (columns !== cols) {
                    throw new Error('Matrix columns are not equal.');
                }
            });

            // Merge raw values
            var rawArray = [];
            matricies.forEach(function (_m) {
                rawArray = [].concat(_toConsumableArray(rawArray), _toConsumableArray(_m.values));
            });

            return Matrix.initFromMatrix(rawArray);
        }

        // Initialize an instance of this class from an existing matrix

    }, {
        key: 'initFromMatrix',
        value: function initFromMatrix(matrix) {

            // Validate that it is a matrix
            if (matrix instanceof Array === false) {
                throw new Error('Cannot build from non-array type.');
            }

            // Validate that we have at least 1 row and at least 1 column
            if (matrix.length === 0 || matrix[0].length === 0) {
                throw new Error('Matrix must have at least 1 row and 1 column');
            }

            var rows = matrix.length;
            var columns = matrix[0].length;

            // Build new matrix
            var m = new Matrix(rows, columns);
            for (var r = 0; r < rows; r++) {
                // Validate that column dims are always equal
                if (matrix[r].length !== columns) {
                    throw new Error('Matrix dimensions are not equivalent.');
                }
                m.setRowFromArray(r, matrix[r]);
            }

            return m;
        }

        // Create a range of numbers as an array by increment

    }, {
        key: 'range',
        value: function range(from, to, step) {
            return [].concat(_toConsumableArray(Array(Math.floor((to - from) / step) + 1))).map(function (_, i) {
                return from + i * step;
            });
        }

        // Calculate mean of an array

    }, {
        key: 'mean',
        value: function mean(arr) {
            return arr.reduce(function (acc, val) {
                return acc + val;
            }, 0) / arr.length;
        }
    }, {
        key: 'sum',
        value: function sum(arr) {
            return arr.reduce(function (acc, val) {
                return acc + val;
            }, 0);
        }
    }]);

    return Matrix;
}();