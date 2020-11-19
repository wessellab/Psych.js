# Psych Base Class

This class is the initializer for this package, creates & controls UI components, and can perform a less accurate form of "waiting for keypress" or "wait for duration".

### `Psych.init(settings)`

This method must be called before you begin your experiment in order to configure the UI components correctly. If you do not call this method, you may notice some very strange behavior in your components.

You can also feed this method some settings like this...

```
Psych.init({
    backgroundColor: 'green',
    textColor: 'white'
})
```

This will set a default background and text color for your UI and its components.

Calling this method without passing any settings will result in a background color of black, and text color of white.

### `await Psych.demographics()`

This method will fetch the HTML form for getting demographic information and insert it into the DOM.

Basically just call this and when the user presses "submit" on the form, this function will return the demographic data.

```
(async () => {
    
    const demographics = await Psych.demographics()
    
    // demographics is now an object containing everything we want to know about them.
    
})()
```

### `await Psych.blockFeedback(items)`

This method will clear the DOM and present, at full screen, your block feedback items.

`items` is an array of strings that you want to display during your block feedback.

This function will not move on until the user has pressed the space bar.

```
(async () => {
    
    const item1 = 'Mean RT: 320ms';
    const item2 = 'Go RT: 300ms';
    const item3 = 'Successful Stops: 42%';
    
    await Psych.blockFeedback([
        item1,
        item2,
        item3
    ])
    
    // user has now pressed the space bar
    
})()
```

### `await Psych.fixation(duration, lineWidth = '3px', size = '6vw')`

Displays a fixation cross at the center of the screen. This method will clear the DOM when it is complete.

It should be noted that this function uses the "setTimeout" function witch is notoriously inaccurate. For a more accurate timing of this function, build custom with the `PsychTime` class.

`lineWidth` and `size` are also default params that you don't need to specify. Also, '6vw' means 6 viewport widths, but this will also take pixels.

```
(async () => {
    
    await Psych.fixation(1000);
    
    // it has been 1000ms at this point in the code
    
})()
```

### `await Psych.welcome(t = 'Welcome! Press the space bar to begin.')`

Presents a welcome screen. This code will not move on until the spacebar has been pressed.

Also feel free to change the default text.

```
(async () => {
    
    await Psych.welcome('My custom welcome text is neat!');
    
    // user has now pressed space bar
    
})()
```

### `await Psych.waitForKey(keyCode = 32)`

Check for Key Codes using [this tool](https://codepen.io/chriscoyier/pen/mPgoYJ).

Waits for a key to be pressed and moves on in the code when it is.

I do not recommend using this function for any sort of accurate timing. This should only be used in utility cases, not in cases where timing is important. For more accurate timing, use `PsychTime`

The default keyCode to wait for is 32, which is the keyCode for the spacebar. You can pass any value in to replace that though.

```
(async () => {
    
    await Psych.waitForKey();
    
    // user has now pressed space bar
    
})()
```

### `await Psych.waitForKeys(keyCodes = [32])`

Check for Key Codes using [this tool](https://codepen.io/chriscoyier/pen/mPgoYJ).

Same as `Psych.waitForKey` except it can check for multiple keys at the same time.

```
(async () => {
    
    const keyCode = await Psych.waitForKey([81, 80]);
    
    // keyCode is either 'q' or 'p'
    
})()
```

### `await Psych.countdown(val = 3)`

Display a countdown timer on the entire screen.

This will clear the DOM when complete.

Default countdown starts at 3.

```
(async () => {
    
    await Psych.countdown(5);
    
    // 5 seconds have passed
    
})()
```

### `Psych.clear()`

Clear the DOM.

This means that if you have called `Psych.prepare()` on any of your UI components, it will be wiped from the screen and you will have to call `Psych.prepare()` on them again to insert them back into the DOM.

```
(async () => {
    
    Psych.clear();
    
    // No items exist in the DOM anymore
    
})()
```

### `Psych.text(options)`

Create a text block which can be inserted into the DOM.

I recommend using `Psych.divWithText()` instead because that will create the text and its container for you.

```
(async () => {
    
    const text = Psych.text({
        text: 'Hello there',
        color: 'black',
        tag: 'p',
        letterSpacing: '1px',
        fontSize: '1.5em',
        margin: '0px',
        padding: '0px',
        fontWeight: 'normal'
    });
    
    // you can now insert text into the DOM
    
    Psych.prepare([text]);
    
    // text is now in the DOM but the user cannot see it
    
    Psych.display([text]);
    
    // user can now see your text
    
})()
```



### `Psych.dims()`

Returns the height and width of the web page.

```
(async () => {
    
    const dims = Psych.dims();
    
    // dims.height = 632
    // dims.width = 1200
    
})()
```

### `Psych.divWithText(textOptions, divOptions)`

Creates a piece of text with a container that can be inserted into the DOM.

```
(async () => {
    
    const text = Psych.divWithText({
        text: 'Hello there',
        color: 'black',
        tag: 'p',
        letterSpacing: '1px',
        fontSize: '1.5em',
        margin: '0px',
        padding: '0px',
        fontWeight: 'normal'
    }, {
        left: `${dims.width / 2}px`,
        top: `${dims.height / 2}px`,
        backgroundColor: 'white',
        borderRadius: '0px',
        height: '5px',
        width: '5px',
        padding: '0px',
        moveFromCenter: true
    });
    
    // you can now insert text into the DOM
    
    Psych.prepare([text]);
    
    // text is now in the DOM but the user cannot see it
    
    Psych.display([text]);
    
    // user can now see your text
    
    Psych.hide([text]);
    
    // user can no longer see your text, but it still exists inside the DOM.
    
})()
```

In this example I pass all the possible options into textOptions and divOptions, but all the options that I pass are also the default parameters, with the exception of `text` in textOptions. By default, it is actually an empty string.

##### textOptions
- text: String to be displayed
- color: Text color
- tag: HTML tag to be used as element.
- letterSpacing: Spacing between letters in text.
- fontSize: Size of text
- margin: Distance between text container and outer container.
- padding: Distance between text container and inner container.
- fontWeight: 'lighter' | 'bolder' | 'normal'

##### divOptions
- left: Location in pixels relative to the left. 0px is as far left as you can go.
- top: Location in pixels relative to the top of the screen. 0px is as far up as you can go.
- backgroundColor: Color of the background container.
- borderRadius: How rounded the corners of the container are in pixels.
- height: Height of the container.
- width: Width of the container.
- padding: Distance between the outer text container and the inner div container.
- moveFromCenter: Boolean indicating that the `top` and `left` fields should move relative to the center of the container. If set to `false` then it will move relative to the top-left of the container.

### `Psych.makeShape(shape, options)`

Create a shape object that can be inserted into the DOM.

```
(async () => {

    const dims = Psych.dims();
    
    const triangle = Psych.makeShape('triangle', {
        lineWidth: 0,
        size: 100,
        fillStyle: 'black',
        strokeStyle: 'black',
        top: dims.height / 2,
        left: dims.width / 2
    });
    
    // you can now insert triangle into the DOM
    
    Psych.prepare([triangle]);
    
    // text is now in the DOM but the user cannot see it
    
    Psych.display([triangle]);
    
    // user can now see your triangle
    
})()
```

- shape: 'triangle' | 'square' | 'arrow' | 'circle'

##### options
- lineWidth: Thickness of shape outline
- size: Size of shape
- fillStyle: Shape fill color
- strokeStyle: Shape outline color
- top: Position relative to top
- left: Position relative to left

### `Psych.getDims(div)`

Get the dimensions and location of a particular element that you have created.

```
(async () => {
    
    const triangle = Psych.makeShape('arrow', {
        top: 100,
        left: 50,
        size: 100
    });
    
    const triangle_dims = Psych.getDims(triangle);
    
    // triangle dims now has properties: top, left, height, width
    
})()
```

### `Psych.update(item, textOptions, divOptions)`

Update an item that you get from `Psych.divWithText`

- item: Item you want to update
- textOptions: Same object you feed into `divWithText`
- divOptions: Same object you feed into `divWithText`

### `Psych.prepare(divs)`

Inserts items into the DOM.

Divs is an array.

See `Psych.divWithText()` for usage.

### `Psych.display(divs)`

Display all the divs to the user.

Divs is an array.

See `Psych.divWithText()` for usage.

### `Psych.hide(divs)`

Hide all divs from the user. Divs will still be inside the DOM.

Divs is an array.

See `Psych.divWithText()` for usage.

### `await Psych.wait(duration)`

Amount of time to wait in miliseconds.

For extremely precise wait timing, use `PsychTime`.

```
(async () => {
    
    await Psych.wait(1000);
    
    // 1 second has passed
    
})()
```

### `Psych.getBrowser()`

Get the current browser.

```
(async () => {
    
    const browser = Psych.getBrowser();
    
    // browser = 'Chrome'
    
})()
```

### `await Psych.fullScreen()`

Enter full screen mode.

Sometimes this can be tricky because it needs to be initiated by a user action.

### `await Psych.exitFullScreen()`

Exit full screen mode.