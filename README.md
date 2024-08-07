# Remote Keyboard

An old project I worked on for having a good understanding on JQuery and of course for fun 😁.

![This code will 100% help you](readme_images/image.png)

## How does it look like?

![Screenshot](readme_images/screenshot.jpg)

## How do I run?

Execute `run.sh` after cloning the repo. You must have `python3` installed in your system to start a local server. I used `bash` as shell script interpreter.

```bash
cd remote_keyboard
sudo chmod u+x run.sh
./run.sh
```

Or,

```bash
cd remote_keyboard
python3 -m http.server 8080 # for windows user, use python command
python3 -m webbrowser -t "http://localhost:8080/index.html" # for windows user, use python command
```

However you can also run the `index.html` as a standalone file in your browser.

## Supported events
### Keyboard
* Key press

### Mouse
* Mouse move
* Mouse wheel
* Right click
* Left click
* Double click

## CHANGE LOG

1. Decided to improve it further, so implemented mouse/touchpad feature.
2. Removed audio effect to improve latency problem between key strokes.
3. Added custom event listener `interface-input` to handle events received from keyboard, mouse and screen(for touch devices).
4. Discontinued using of JQuery and rewritten entire code using vanilla JS.
5. Implemented dark and light theme along with system theme detection feature. 
