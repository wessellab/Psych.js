class ApiClient {

    constructor(subject_number, project_name, demographics, trialseq) {
        this.base_url = 'http://localhost:8888';
        this.save_route = '/wessellab.php';
        this.url = this.base_url + this.save_route;
        this.subject_number = subject_number;
        this.trialseq = trialseq;
        this.project_name = project_name;
        this.demographics = demographics;
    }

    save(is_training = false) {
        const data = {
            trialseq: this.trialseq.values,
            subject_number: this.subject_number,
            project_name: this.project_name,
            demographics: this.demographics,
            is_training
        }

        return $.ajax({
            type: 'POST',
            url: this.url,
            data
        })
    }

}

const anyKeysValid = (key, keyCodes) => {
    for(let i = 0; i < keyCodes.length; i++) {
        if(key === keyCodes[i]) return true
    }
    return false
}

class PsychTime {

    constructor() {
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

    checkOffsetFunctions(elapsed) {

        var availableFunctionsIndicies = [];
        for(let i = 0; i < this.offsetDelays.length; i++) {
            if(elapsed >= this.offsetDelays[i] && this.offsetFunctionsFlags[i]) {
                availableFunctionsIndicies.push(i);
                this.offsetFunctionsFlags[i] = false;
            }
        }
        return availableFunctionsIndicies;

    }

    waitUntil(time) {
        return new Promise((resolve) => {
            var i = setInterval(() => {

                // Get metrics
                const now = performance.now();
                const e = this.elapsed();

                // Check for offset functions
                let availableFunctions = this.checkOffsetFunctions(e);
                if(availableFunctions.length > 0) {
                    availableFunctions.forEach(fnIdx => {
                        this.offsetFunctions[fnIdx]();
                    })
                }

                // Main loop check
                if(this.flag || this.isReady(time, e) && Math.abs(time - e) < Math.abs(time - e - this.drift)) {
                    clearInterval(i);
                    resolve({
                        startTime: this.timestamp,
                        endTime: now,
                        keyCode: null,
                        keyPressed: false,
                        elapsed: e,
                        psychTime: new PsychTime()
                    });
                    return;
                } else {
                    if(this.isReady(time, e)) {
                        this.flag = true;
                    }
                    if(this.last_time) {
                        this.intervals += 1;
                        this.total_drifts += this.calcDrift(now);
                        this.drift = this.total_drifts / this.intervals;
                        this.last_time = now;
                    } else {
                        this.last_time = performance.now();
                    }
                }
            }, this.interval);
        })
    }

    isReady(time, elapsed) {
        return (elapsed + this.drift > time && elapsed < time || (elapsed + this.drift > time && elapsed > time)) ? true : false
    }

    waitForKey(keyCode = 32) {

        return new Promise((resolve) => {

            document.addEventListener('keydown', e => {

                if(e.keyCode === keyCode) {
                    const endTime = performance.now();
                    resolve({
                        startTime: this.timestamp,
                        endTime,
                        elapsed: this.elapsed(),
                        keyCode: e.keyCode,
                        keyPressed: true,
                        psychTime: new PsychTime()
                    });
                }

            }, { once: true });

        })

    }

    waitForKeys(keyCodes = [32]) {

        return new Promise((resolve) => {

            document.addEventListener('keydown', e => {

                if(anyKeysValid(e.keyCode, keyCodes)) {
                    const endTime = performance.now();
                    resolve({
                        startTime: this.timestamp,
                        endTime,
                        elapsed: this.elapsed(),
                        keyCode: e.keyCode,
                        keyPressed: true,
                        psychTime: new PsychTime()
                    });
                    return;
                }

            }, { once: true });

        })

    }

    waitForKeyWithTimeout(keyCode = 32, timeout = 1000) {

        return new Promise((resolve) => {

            Promise.any([
                this.waitForKey(keyCode),
                this.waitUntil(timeout)
            ])
            .then(res => {
                this.offsetDelays = [];
                this.offsetFunctions = [];
                this.offsetFunctionsFlags = [];
                resolve(res);
            })

        })

    }

    waitForKeysWithTimeout(keyCodes = [32], timeout = 1000) {

        return new Promise((resolve) => {

            Promise.any([
                this.waitForKeys(keyCodes),
                this.waitUntil(timeout)
            ])
            .then(res => {
                this.offsetDelays = [];
                this.offsetFunctions = [];
                this.offsetFunctionsFlags = [];
                resolve(res);
            })

        })

    }

    addOffsetFunction(delay, fn) {
        this.offsetDelays.push(delay);
        this.offsetFunctions.push(fn);
        this.offsetFunctionsFlags.push(true);
    }

    calcDrift(now) {
        return now - this.last_time - this.interval;
    }

    elapsed() {
        return performance.now() - this.timestamp;
    }

}

class Psych {

    static backgroundColor = 'black';
    static textColor = 'white';
    static browser = Psych.getBrowser();

    constructor(menuItems) {

        this.menuItems = menuItems;

    }

    // Init with settings
    static init(settings = {}) {

        const _settings = Object.assign({
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

    start() {

        Psych.demographics()
            .then(demographics => {
                this.demographics = demographics;
                this.menu();
            })
        
    }

    // Get menu html
    menu() {

        // Clear the DOM
        Psych.clear();

        // Get the root node
        var body = document.getElementById('root');

        // Create container element
        var container = document.createElement('div');
        container.className = 'container mt-5';
        container.id = 'menu-container';

        // Insert menu items
        for(let item of this.menuItems) {

            let i = this.createMenuItem(item);
            container.appendChild(i);

        }

        body.appendChild(container);

        // Place modal into the DOM
        Psych.insertModal();

    }

    // Create element
    static toElement(html) {
        return (new DOMParser()).parseFromString(html, 'text/html').body.childNodes[0]
    }

    // Insert modal into the DOM
    static insertModal() {

        let str = `
            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Read Carefully!</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div class="modal-body">
                        <p>We are about to begin the experiment.</p>
                        <p>The experiment will enter full screen mode. Do not, at any time, exit full screen mode, until the experiment is complete.</p>
                        <p>If you do not want to start yet, click "Cancel"</p>
                        <p>If you are ready, click "Begin"</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id='cancel-btn'>Cancel</button>
                        <button type="button" class="btn btn-primary" id='start-btn'>Begin</button>
                    </div>
                </div>
                </div>
            </div>
        `;
        let ele = Psych.toElement(str);
        document.getElementById('root').appendChild(ele);

    }

    // Create a menu item
    createMenuItem(item) {

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

        $(cardButton).on('click', e => {
            e.preventDefault(); // Prevent default

            // Show modal
            $('#exampleModal').modal('show');

            // Clicked start button
            $('#start-btn').on('click', e => {
                e.preventDefault();
                $('#exampleModal').modal('hide');

                // Clear screen
                Psych.clear();

                // Run function
                item.start(this.demographics)
                    .then(() => {
                        console.log('Going to main menu');

                        // Go back to main menu
                        this.menu();

                    })
                    .catch(err => {
                        console.log(err);
                    })
            })

            // Button to cancel start
            $('#cancel-btn').on('click', e => {
                $('#start-btn').off('click');
                $('#exampleModal').modal('hide');
            })

        })

        // Put it all together
        cardBody.appendChild(cardTitle);
        cardBody.appendChild(cardText);
        cardBody.appendChild(cardButton);
        container.appendChild(header);
        container.appendChild(cardBody);

        return container;

    }

    // Start everything with the demographic form
    static demographics() {

        return new Promise((resolve) => {

            $.get('https://psychjs.alecneuro.com/html/demographics.html')
                .then(data => {

                    // Insert the HTML
                    document.getElementById('root').innerHTML = data;

                    // Resolves promise, enters full screen
                    $('#form-submit').on('click', e => {
                        e.preventDefault();

                        const country = $('#country').val();
                        const gender = $('input[name=gender]:checked').val();
                        const ethnicity = $('input[name=ethnicity]:checked').val();
                        const race = $('input[name=race]:checked').val();
                        const handedness = $('input[name=handedness]:checked').val();
                        const age = $('#age').val();
                        const vision = $('input[name=vision]:checked').val();
                        const english = $('input[name=english]:checked').val();

                        // Check to make sure all fields are filled out
                        if(
                            !country || !gender ||
                            !ethnicity || !race ||
                            !handedness || !age ||
                            !vision || !english
                        ) {
                            console.log('Something is wrong');
                        } else {
                            Psych.clear();
                            resolve({ country, gender, ethnicity, race, handedness, age, vision, english });
                        }
                    })

                })
                .catch(err => {
                    console.log(err);
                })

        })

    }

    // Block Feedback
    static blockFeedback(items) {

        return new Promise((resolve) => {

            const body = document.getElementById('root');

            var div = Psych.fullScreenContainer();

            // Modify some settings in the div
            div.style.flexDirection = 'column';
            div.style.justifyContent = 'space-evenly';

            // Append a title item
            const header = Psych.text({ text: 'Block Feedback', tag: 'h2' });
            div.appendChild(header);

            // Loop through appending each item to container
            items.forEach(item => {
                let text = Psych.text({ text: item });
                div.appendChild(text);
            })

            // Further instructions at the bottom
            const footer = Psych.text({ text: 'Wait 3 seconds then press the space bar to continue...', tag: 'h2' });
            div.appendChild(footer);

            body.appendChild(div);

            setTimeout(() => {
                document.addEventListener('keydown', e => {
                    if(e.keyCode === 32) {
                        body.removeChild(div);
                        resolve();
                    }
                }, { once: true });
            }, 3000);

        })

    }

    // Fixation cross
    static fixation(color = 'black', lineWidth = '3px', size = '6vw') {

        const { width, height } = Psych.dims();

        const div = Psych.fullScreenContainer('transparent');

        var v = Psych.div({
            backgroundColor: color,
            height: size,
            width: lineWidth,
            locationX: width / 2,
            locationY: height / 2
        })

        var h = Psych.div({
            backgroundColor: color,
            height: lineWidth,
            width: size,
            locationX: width / 2,
            locationY: height / 2
        })

        div.appendChild(v);
        div.appendChild(h);

        return div;

    }

    // Present a welcome screen
    static welcome(options = {}) {

        const _options = Object.assign({
            text: 'Welcome! Press the space bar to begin.',
            color: Psych.textColor,
            fontSize: '3em',
            fontWeight: 'bolder'
        }, options);
    
        return new Promise((resolve) => {

            // Get body
            const body = document.getElementById('root');

            var div = Psych.fullScreenContainer();
            var text = Psych.text(_options);

            div.appendChild(text); // put in text
            body.appendChild(div); // add to DOM

            setTimeout(() => {
                document.addEventListener('keydown', e => {
                    if(e.keyCode === 32) {
                        body.removeChild(div);
                        resolve();
                    }
                }, { once: true });
            }, 3000);

        })

    }

    // Wait for a keypress
    static waitForKey(keyCode = 32) {

        return new Promise((resolve) => {

            document.addEventListener('keydown', e => {

                if(e.keyCode === keyCode) resolve();

            }, { once: true });

        })

    }

    // Wait for a keypress
    static waitForKeys(keyCodes = [32]) {

        return new Promise((resolve) => {

            document.addEventListener('keydown', e => {

                if(anyKeysValid(e.keyCode, keyCodes)) resolve(e.keyCode);

            }, { once: true });

        })

    }

    // Countdown
    static countdown(textColor = Psych.textColor, backgroundColor = Psych.backgroundColor, val = 3) {

        return new Promise((resolve) => {

            var div = Psych.fullScreenContainer(backgroundColor);
            var text = Psych.text({
                text: `Starting in ${val}...`,
                color: textColor,
                fontSize: '3em',
                fontWeight: 'bolder'
            });
            div.appendChild(text);
            document.getElementById('root').appendChild(div);

            var i = setInterval(() => {

                val -= 1;
                if(val === 0) {
                    document.getElementById('root').removeChild(div);
                    clearInterval(i);
                    resolve();
                } else {
                    text.innerText = `Starting in ${val}...`;
                }

            }, 1000);

        })

    }

    // Clear screen
    static clear() {
        document.getElementById('root').innerHTML = '';
        return new PsychTime();
    }

    // Text block
    static text(options = {}) {

        const _options = Object.assign({
            text: '',
            color: Psych.textColor,
            tag: 'p',
            letterSpacing: '1px',
            fontSize: '1.5em',
            margin: '0px',
            padding: '0px',
            fontWeight: 'normal'
        }, options);

        const text = document.createElement(_options.tag);
        text.innerText = _options.text
        text.style.color = _options.color;
        text.style.letterSpacing = _options.letterSpacing;
        text.style.fontSize = _options.fontSize;
        text.style.margin = _options.margin;
        text.style.padding = _options.padding;
        text.style.fontWeight = _options.fontWeight;
        return text
    }

    // Container div
    static fullScreenContainer(bgColor = Psych.backgroundColor) {
        const div = document.createElement('div');
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
        return div
    }

    // Get outwindow dimensions
    static dims() {
        const outwindow = document.getElementById('root');
        return {
            height: outwindow.clientHeight,
            width: outwindow.clientWidth
        }
    }

    // Create a standard div
    static div(options = {}) {

        // Get dims
        const dims = Psych.dims();

        const _options = Object.assign({
            left: `${dims.width / 2}px`,
            top: `${dims.height / 2}px`,
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
        if(_options.moveFromCenter) div.style.transform = 'translate(-50%, -50%)';
        return div;
    }

    // Div with text inside it
    static divWithText(textOptions, divOptions) {

        var text = Psych.text(textOptions);
        var div = Psych.div(divOptions);
        div.appendChild(text);
        div.style.display = 'none';
        return div

    }

    // Get canvas default options
    static getCanvasOptions(options) {

        // Get window dims
        const dims = Psych.dims();

        // Default options
        const _options = Object.assign({
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
    static createCanvas(options) {

        // Get dims
        const dims = Psych.dims();

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

        return { canvas, ctx };

    }

    // Create an arrow
    static createArrow(options) {

        // Create canvas options
        const _options = Psych.getCanvasOptions(options);

        // Create the canvas
        const { canvas, ctx } = Psych.createCanvas(_options);

        // Setup sizing
        const size = _options.size / 100; // scale down
        const handleLength = 50 * size;
        const handleHeight = 13 * size;
        const headLength = 50 * size;
        const headHeight = 40 * size;

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(-handleLength, -handleHeight);
        ctx.lineTo( 0, -handleHeight);
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
    static createTriangle(options) {

        // Create canvas options
        const _options = Psych.getCanvasOptions(options);

        // Create canvas
        var { canvas, ctx } = Psych.createCanvas(_options);

        // Get the triangle height
        const size = _options.size;
        var h = size * (Math.sqrt(3)/2);

        // Draw triangle
        ctx.beginPath();
        ctx.moveTo(0, -h / 2);
        ctx.lineTo( -size / 2, h / 2);
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
    static createSquare(options) {

        // Create canvas options
        const _options = Psych.getCanvasOptions(options);

        // Create the canvas
        var { canvas, ctx } = Psych.createCanvas(_options);

        // Draw square
        ctx.fillRect(0 - _options.size / 2, 0 - _options.size / 2, _options.size, _options.size);
        ctx.strokeRect(0 - _options.size / 2, 0 - _options.size / 2, _options.size, _options.size);

        return canvas

    }

    // Create a cricle
    static createCircle(options) {

        // Create canvas options
        const _options = Psych.getCanvasOptions(options);

        // Create the canvas
        var { canvas, ctx } = Psych.createCanvas(_options);

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
    static makeShape(shape, options) {

        switch(shape) {
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
    static getDims(div) {
        return {
            top: parseFloat(div.style.top),
            left: parseFloat(div.style.left),
            height: div.offsetHeight,
            width: div.offsetWidth
        }
    }

    // Update a divWithText item
    static update(item, textOptions, divOptions) {

        for(let [key, value] of Object.entries(textOptions)) {
            item.firstChild.style[key] = value;
        }

        for(let [key, value] of Object.entries(divOptions)) {
            item.style[key] = value;
        }

        return item

    }

    // Display elements onto screen
    static display(divs) {

        // Show all divs
        divs.forEach(div => { div.style.display = 'flex'; })

        return new PsychTime();

    }

    // Add objects to DOM
    static prepare(divs) {

        var root = document.getElementById('root');
        divs.forEach(div => root.appendChild(div));

    }

    // Hide elements on screen
    static hide(divs) {
        
        // Show all divs
        divs.forEach(div => { div.style.display = 'none'; })

        return new PsychTime();

    }

    // Wait a certain amount of time
    static wait(duration)  {
        return new Promise((resolve) => {
            setTimeout(() => { resolve(); }, duration);
        })
    }

    // Get browser type
    static getBrowser() {

        // Opera 8.0+
        var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        if(isOpera) return 'Opera';

        // Firefox 1.0+
        var isFirefox = typeof InstallTrigger !== 'undefined';
        if(isFirefox) return 'Firefox';

        // Safari 3.0+ "[object HTMLElementConstructor]" 
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
        if(isSafari) return 'Safari';

        // Internet Explorer 6-11
        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        if(isIE) return 'Internet Explorer';

        // Edge 20+
        var isEdge = !isIE && !!window.StyleMedia;
        if(isEdge) return 'Edge';

        // Chrome 1 - 79
        var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
        if(isChrome) return 'Chrome';

        // Edge (based on chromium) detection
        var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);
        if(isEdgeChromium) return 'Edge Chromium';

        // Blink engine detection
        var isBlink = (isChrome || isOpera) && !!window.CSS;
        if(isBlink) return 'Blink';

    }

    // Enter Full Screen
    static fullScreen() {

        return new Promise((resolve) => {

            // Enter full screen
            if(Psych.browser === 'Firefox') {
                document.documentElement.mozRequestFullScreen()
            } else {
                document.documentElement.webkitRequestFullScreen();
            }

            // Exit when it finishes
            var i = setInterval(() => {
                if(Psych.browser === 'Firefox' && document.mozFullScreen) {
                    clearInterval(i);
                    resolve();
                } else if (document.webkitIsFullScreen) {
                    clearInterval(i);
                    resolve();
                }
            }, 300);

        })

    }

    // Exit Full Screen
    static exitFullScreen() {

        return new Promise((resolve) => {
            
            // Exit full screen
            if(Psych.browser === 'Firefox') {
                document.mozCancelFullScreen();
            } else {
                document.webkitCancelFullScreen();
            }

            // Resolve when it finishes
            var i = setInterval(() => {
                if(Psych.browser === 'Firefox' && !document.mozFullScreen) {
                    clearInterval(i);
                    resolve();
                } else if (!document.webkitIsFullScreen) {
                    clearInterval(i);
                    resolve();
                }
            }, 300);

        })

    }

}

class Matrix {

    constructor(h, w, v = 0) {

        this.values = Matrix.full2d(h, w, v);
        
    }

    // Get a single cell
    get(row, col) {
        return this.values[row][col];
    }

    // Set a single cell
    set(row, col, val) {
        if(row >= this.values.length || col >= this.values[0].length) {
            throw new Error('Set index out of bounds.');
        } else {
            this.values[row][col] = val;
        }
    }

    // Set a row with a specific value
    setRow(row, val) {
        if(row >= this.values.length) {
            throw new Error('Set row index out of bounds.');
        } else {
            for(let i = 0; i < this.values[row].length; i++) {
                this.values[row][i] = val;
            }
        }
    }

    // Set a row with an existing array
    setRowFromArray(row, array) {

        // Check to make sure dimensions are equal
        if(this.values[row].length !== array.length) {
            throw new Error('Row assignment cannot be done because dimensions are not equal.');
        }

        // Set values
        this.values[row] = array;
    }

    // Set a column with a specific value
    setCol(col, val) {
        if(col >= this.values[0].length) {
            throw new Error('Set column index out of bounds.');
        } else {
            for(let i = 0; i < this.values.length; i++) {
                this.values[i][col] = val;
            }
        }
    }

    // Set a column from an existing array
    setColFromArray(col, array) {

        // Check to make sure dimensions are equal
        if(this.values.length !== array.length) {
            throw new Error('Column assignment cannot be done because dimensions are not equal.');
        }

        // Set values
        for(let i = 0; i < array.length; i++) {
            this.set(i, col, array[i]);
        }

    }

    // Return a single row from the trialseq
    getRow(row) {
        return this.values[row];
    }

    // Return a single column from the trialseq
    getCol(col) {
        return this.values.map(row => row[col]);
    }

    // Get column by criteria
    getColByCriteria(col, fn) {

        return this.getCol(col).filter(fn);

    }

    // Get all rows and columns by column criteria
    getRowsAndColumnsByCriteria(fn) {

        var rows = [];
        for(let i = 0; i < this.values.length; i++) {
            if(fn(this.getRow(i))) {
                rows.push(this.values[i]);
            }
        }
        return rows.length > 0 ? Matrix.initFromMatrix(rows) : null;

    }

    // Get multiple rows
    getRows(from, to) {
        var rows = [];
        for(let i = from; i < to; i++) {
            rows.push(this.values[i]);
        }
        return rows;
    }

    // Get the shape of the matrix
    shape() {
        return [this.values.length, this.values[0].length];
    }

    // Shuffle the trial sequence
    shuffle() {
        this.values = this.values.sort(() => Math.random() - 0.5)
    }

    // Create an array of zeros
    static zeros(len) {
        var a = new Array(len);
        for(let i = 0; i < len; ++i) a[i] = 0;
        return a;
    }

    // Create an array filled with a particular value
    static full(len, val) {
        var a = new Array(len);
        for(let i = 0; i < len; ++i) a[i] = val;
        return a;
    }

    // Create a 2d matrix of zeros
    static zeros2d(height, width) {

        var rows = [];
        for(let i = 0; i < height; i++) {

            // Init rows
            var row = [];

            // Append columns
            for(let ii = 0; ii < width; ii++) { row.push(0) }

            // Append to matrix
            rows.push(row);

        }

        return rows

    }

    // Create a 2d matrix with a specified value
    static full2d(height, width, val) {

        var rows = [];
        for(let i = 0; i < height; i++) {

            // Init rows
            var row = [];

            // Append columns
            for(let ii = 0; ii < width; ii++) { row.push(val) }

            // Append to matrix
            rows.push(row);

        }

        return rows

    }

    // Concat multiple Matrix instances together
    static append(matricies) {

        // If we only have 1 matrix then just return that
        if(matricies.length === 1) {
            return matricies[0];
        }

        // Validate array of inputs
        matricies.forEach(matrix => {

            // Check to make sure all array items are of the Matrix class
            if(matrix instanceof Matrix === false) {
                throw new Error('All array items must be an instance of Matrix class.');
            }

        })

        // Validate that all matricies have the same number of columns
        const [ , columns] = matricies[0].shape();
        matricies.forEach(matrix => {

            let [ , cols] = matrix.shape();
            if(columns !== cols) {
                throw new Error('Matrix columns are not equal.');
            }

        })

        // Merge raw values
        var rawArray = [];
        matricies.forEach(_m => { rawArray = [...rawArray, ..._m.values] });

        return Matrix.initFromMatrix(rawArray);

    }

    // Initialize an instance of this class from an existing matrix
    static initFromMatrix(matrix) {

        // Validate that it is a matrix
        if(matrix instanceof Array === false) {
            throw new Error('Cannot build from non-array type.');
        }

        // Validate that we have at least 1 row and at least 1 column
        if(matrix.length === 0 || matrix[0].length === 0) {
            throw new Error('Matrix must have at least 1 row and 1 column');
        }

        const rows = matrix.length;
        const columns = matrix[0].length;

        // Build new matrix
        var m = new Matrix(rows, columns);
        for(let r = 0; r < rows; r++) {
            // Validate that column dims are always equal
            if(matrix[r].length !== columns) {
                throw new Error('Matrix dimensions are not equivalent.');
            }
            m.setRowFromArray(r, matrix[r]);
        }

        return m;

    }

    // Create a range of numbers as an array by increment
    static range(from, to, step) {
        return [ ...Array(Math.floor((to - from) / step) + 1) ].map((_, i) => from + i * step);
    }

    // Calculate mean of an array
    static mean(arr) {
        return arr.reduce((acc, val) => acc + val, 0) / arr.length;
    }

    // Print the matrix as a table to the console
    print() {
        console.table(this.values);
    }

}