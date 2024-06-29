document.addEventListener('DOMContentLoaded', () => {
    const helperKeys = new Set();
    const helperKeyIds = Object.values(
        Object.fromEntries(document.querySelectorAll('span.key.key-helper').entries())
    ).map(helperKey => helperKey.id);
    let keyboardEventId = -1;
    let mouseEventId = -1;
    const MOUSE_INPUT_QUEUE_SIZE = 64;
    const MAX_SERVER_SIDE_QUEUE_SIZE = 1024;
    const mouseEventQueue = new Array(MOUSE_INPUT_QUEUE_SIZE).fill(null);
    let queueInsertPos = 0;
    let isKeydownAllowed = true;
    
    const logInput = document.querySelector('div#log-input');
    const rowWidth = logInput.parentElement.clientWidth;
    logInput.style.maxWidth = `${rowWidth}px`;
    const container = document.querySelector('div.container');

    document.querySelectorAll("span.key").forEach((element) => {
        element.addEventListener("after-click", (afterClickEvent) => {
            const { data, originalEvent: e } = afterClickEvent.detail;
            const target = e.target ?? afterClickEvent.target;
            const params = {
                enableEffect: true,
                primaryEvent: e.type,
                keyCode: Number.parseInt(target.id.split("-")[1]),
                ...data
            };
            const helperKeysCopy = [...helperKeys.values()];
            const { enableEffect, primaryEvent, keyCode: _keyCode } = params;
            if (!logInput.classList.contains("focus")) {
                logInput.classList.add("focus");
            }
    
            if (_keyCode === 16) {
                document.querySelectorAll("span.key.shift").forEach(element => {
                    element.classList.toggle("key-shift")
                });
            }
    
            let doLog = true;
            if (helperKeyIds.includes(target.id)) {
                doLog = false;
                if (primaryEvent === "click") {
                    target.classList.toggle("hkey-clicked");
                    if (target.classList.contains("hkey-clicked")) {
                        helperKeys.add(_keyCode);
                    } else {
                        helperKeys.delete(_keyCode);
                    }
                } else if (primaryEvent === "keydown") {
                    target.classList.add("hkey-clicked");
                } else if (primaryEvent === "keyup") {
                    target.classList.remove("hkey-clicked");
                }
            } else {
                if (enableEffect) {
                    target.classList.add("key-clicked");
                    setTimeout(() => target.classList.remove("key-clicked"), 20);
                }
                [17, 18, 91].forEach((keyCode) => {
                    document.querySelector(`span.key#key-${keyCode}`)
                        .classList.remove("hkey-clicked");
                    helperKeys.delete(keyCode);
                });
            }
    
            if (enableEffect && doLog) {
                const pressedKey = target.classList.contains("key-shift")
                    ? target.getAttribute("data-shift")
                    : target.getAttribute("data-key");
                let logKey = null;
                let isShortcutKey = false;
                if (helperKeysCopy.length === 0 ||
                    (helperKeysCopy.length === 1 && helperKeysCopy[0] === 16)) {
                    logKey = pressedKey;
                    isShortcutKey = e.target?.id === 'key-alt-ctrl-del' || e.target?.id === 'key-alt-tab';
                } else {
                    logKey = helperKeysCopy.map((keyCode) => {
                        return document.querySelector(`span#key-${keyCode}`).getAttribute("data-key")
                    }).join(" + ").toUpperCase() + ` + ${target.getAttribute("data-key")}`;
                    isShortcutKey = true;
                }
                const newChildren = document.createElement("span");
                newChildren.setAttribute("data-log-text", logKey);
                newChildren.classList.add("log-key");
                newChildren.classList.add(isShortcutKey ? "non-printable-shortcut"
                    : [...target.classList].some((c) =>{
                        return ["key-symbol", "key-letter", "key-number"].includes(c)
                    }) ? "printable" : "non-printable");
                const logInput = document.querySelector("div#log-input");
                logInput.appendChild(newChildren);
                logInput.scrollTop = logInput.scrollHeight;
    
                const interfaceKeyboard = new CustomEvent("interface-input", {
                    detail: {
                        interfaceType: "keyboard",
                        eventType: "keypress",
                        data: {
                            key: logKey,
                        },
                        identifier: (keyboardEventId =
                            (keyboardEventId + 1) % MOUSE_INPUT_QUEUE_SIZE),
                    },
                });
                document.dispatchEvent(interfaceKeyboard);
            }
            e.stopPropagation();
        });

        element.addEventListener('click', e => {
            const afterClickEvent = new CustomEvent('after-click', {
                detail: {
                    originalEvent: e
                }
            });
            e.target.dispatchEvent(afterClickEvent);
        })
    });

    const removeKeydown = (e) => {
        logInput.classList.remove('focus');
        isKeydownAllowed = false;
    };
    // $("div.keyboard").click((e) => removeKeydown(e));
    container.addEventListener('click', e => {
        removeKeydown(e);
        e.stopPropagation();
    });

    logInput.addEventListener('click', e => {
        e.stopPropagation();
        // removeKeydown(e);
        // $(e.target).addClass("focus");
        logInput.classList.add('focus');
        isKeydownAllowed = true;
    });

    document.addEventListener("keyup", (kue) => {
        kue.preventDefault();
        const charCode = kue.keyCode;
        if ([16, 17, 18, 91].includes(charCode)) {
            const keyboardBtn = document.getElementById(`key-${charCode}`);
            helperKeys.delete(charCode);
            const afterClickEvent = new CustomEvent('after-click', {
                detail: {
                    originalEvent: new PointerEvent('click', {
                        view: window,
                        cancelable: true,
                        bubbles: true
                    }),
                    data: {
                        primaryEvent: kue.type,
                        keyCode: charCode
                    }
                }
            });
            keyboardBtn.dispatchEvent(afterClickEvent);
        }
        kue.stopPropagation();
        return false;
    });

    document.addEventListener("keydown", (kde) => {
        kde.preventDefault();
        kde.stopPropagation();
        if(!isKeydownAllowed) return false;
        const charCode = kde.keyCode;
        if(charCode === 20) return false; // caps lock
        if (![16, 17, 18, 91].includes(charCode) || !helperKeys.has(charCode)) {
            if ([16, 17, 18, 91].includes(charCode)) {
                helperKeys.add(charCode);
            }
            const keyboardBtn = document.getElementById(`key-${charCode}`);
            const afterClickEvent = new CustomEvent('after-click', {
                detail: {
                    originalEvent: new PointerEvent('click', {
                        view: window,
                        cancelable: true,
                        bubbles: true
                    }),
                    data: {
                        primaryEvent: kde.type,
                        keyCode: charCode
                    }
                }
            });
            keyboardBtn.dispatchEvent(afterClickEvent);
        }
        return false;
    });
    
    let lastPageX = null, lastPageY = null, lastMouseEventType = 'touchend';
    let secondClickTs = NaN, clickCount = 0, startedTouches = [null, null], touchEndedId = -1;
    let mouseMoveTimeout = null, mouseLeftClickTimeout = null;
    if(window.matchMedia("(any-pointer: coarse)").matches) {
        // touch device only
        $('#touchpad').append(`<span class="fa fa-xl mouse-pointer"
            id="pointer" style="top: 5px; left: 5px;"></span>`)
    }

    function fireQueuedMouseEvents(eventType) {
        if(mouseEventQueue[0] !== null) {
            const interfaceMouse = new CustomEvent('interface-input', {
                detail: {
                    interfaceType: 'mouse',
                    eventType,
                    data: {
                        queue: mouseEventQueue.slice(0, queueInsertPos),
                        size: queueInsertPos
                    },
                    identifier: (mouseEventId = (mouseEventId + 1) % MAX_SERVER_SIDE_QUEUE_SIZE)
                }
            });
            document.dispatchEvent(interfaceMouse);
            queueInsertPos = 0;
            mouseEventQueue.fill(null);
            return true;
        }
        return false;
    }

    $('#btn-right').on('click', (e, c)=> {
        e.preventDefault();
        const data = c ?? {
            source: 'right-button'
        };
        if(data.source === 'right-button') {
            $('#btn-right').addClass('hkey-clicked');
            setTimeout(() => $('#btn-right').removeClass('hkey-clicked'), 20)
        }
        mouseEventQueue[queueInsertPos++] = {
            ctrlKey: helperKeys.includes(17),
            shiftKey: helperKeys.includes(16),
            altKey: helperKeys.includes(18),
            metaKey: helperKeys.includes(91),
            clickCount: 1,
            ...data
        }
        fireQueuedMouseEvents('rclick');
        lastMouseEventType = 'rclick';
    });

    $('#btn-left').on('click dblclick', (e, c) => {
        e.preventDefault();
        const data = c ?? {
            clickCount: e.type === 'click' ? 1 : 2, 
            source: 'left-button'
        };
        const eventType = e.type === 'click' ? 'lclick' : 'dblclick';
        if(data.source === 'left-button') {
            $('#btn-left').addClass('hkey-clicked');
            setTimeout(() => $('#btn-left').removeClass('hkey-clicked'), 20);
            if(eventType === 'lclick') {
                if(mouseLeftClickTimeout === null) {
                    mouseLeftClickTimeout = setTimeout((eventType, data) => {
                        mouseEventQueue[queueInsertPos++] = {
                            ctrlKey: helperKeys.includes(17),
                            shiftKey: helperKeys.includes(16),
                            altKey: helperKeys.includes(18),
                            metaKey: helperKeys.includes(91),
                            ...data
                        };
                        fireQueuedMouseEvents(eventType);
                        mouseLeftClickTimeout = null;
                    }, 200, eventType, data);
                }
            } else {
                if(mouseLeftClickTimeout) {
                    clearTimeout(mouseLeftClickTimeout);
                    mouseLeftClickTimeout = null;
                }
                mouseEventQueue[queueInsertPos++] = {
                    ctrlKey: helperKeys.includes(17),
                    shiftKey: helperKeys.includes(16),
                    altKey: helperKeys.includes(18),
                    metaKey: helperKeys.includes(91),
                    ...data
                };
                fireQueuedMouseEvents(eventType);
            }
        } else {
            mouseEventQueue[queueInsertPos++] = {
                ctrlKey: helperKeys.includes(17),
                shiftKey: helperKeys.includes(16),
                altKey: helperKeys.includes(18),
                metaKey: helperKeys.includes(91),
                ...data
            };
            fireQueuedMouseEvents(eventType);
        }
        lastMouseEventType = eventType;
    });

    $('#touchpad').on('click', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'hidden') {
            $(e.currentTarget).attr('data-pointer', 'visible')
        } else {
            if(Number.isNaN(secondClickTs) && clickCount === 0) {
                setTimeout(({firstClickTs}) => {
                    if((secondClickTs - firstClickTs > 300) || clickCount === 1) {
                        $('#btn-left').trigger('click', { clickCount, source: 'touchpad' })
                    } else {
                        $('#btn-left').trigger('dblclick', { clickCount, source: 'touchpad'  })
                    }
                    clickCount = 0;
                    secondClickTs = NaN;
                }, 200, {firstClickTs: e.timeStamp});
            } else if(clickCount === 1) {
                secondClickTs = e.timeStamp;
            }
            clickCount++;
        }
    }).on('contextmenu', e => {
        e.preventDefault();
        $(e.currentTarget).trigger('mouseleave');
    })
    .on('mouseleave', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'visible') {
            fireQueuedMouseEvents(lastMouseEventType);
            lastMouseEventType = 'mouseleave';
            $(e.currentTarget).attr('data-pointer', 'hidden').off('keyup');
        }
    }).on('mousemove', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'visible') {
            clearTimeout(mouseMoveTimeout);
            const eventType = 'mousemove';
            const { movementX, movementY } = e.originalEvent;
            if(eventType !== (lastMouseEventType ?? eventType) || queueInsertPos >= MOUSE_INPUT_QUEUE_SIZE) {
                fireQueuedMouseEvents(lastMouseEventType);
            }
            mouseEventQueue[queueInsertPos++] = {
                source: 'touchpad',
                deltaX: movementX,
                deltaY: movementY,
                deltaZ: 0,
                deltaMode: 0,
                ctrlKey: helperKeys.includes(17),
                shiftKey: helperKeys.includes(16),
                altKey: helperKeys.includes(18),
                metaKey: helperKeys.includes(91)
            };
            mouseMoveTimeout = setTimeout(eventType => {
                fireQueuedMouseEvents(eventType);
                mouseMoveTimeout = null;
            }, 200, eventType);
            lastMouseEventType = eventType;
        }
    }).on('wheel', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'visible') {
            const eventType = 'wheel';
            const { deltaX, deltaY, deltaZ, deltaMode } = e.originalEvent;
            if(lastMouseEventType !== eventType || queueInsertPos >= MOUSE_INPUT_QUEUE_SIZE) {
                fireQueuedMouseEvents(lastMouseEventType);
            }
            mouseEventQueue[queueInsertPos++] = {
                source: 'touchpad',
                deltaX,
                deltaY,
                deltaZ,
                deltaMode,
                ctrlKey: helperKeys.includes(17),
                shiftKey: helperKeys.includes(16),
                altKey: helperKeys.includes(18),
                metaKey: helperKeys.includes(91)
            }
            fireQueuedMouseEvents(eventType);
            lastMouseEventType = eventType;
        }
    }).on('touchstart', e => {
        e.preventDefault();
        if(startedTouches.findIndex(t => t === null) === -1) return false;
        const position = $(e.currentTarget).position();
        const fontSize = parseInt($('#pointer').css('font-size'), 10)
        const offset = {
            areaWidth: Math.floor(e.currentTarget.offsetWidth - fontSize),
            areaHeight: Math.floor(e.currentTarget.offsetHeight - fontSize)
        }
        const { targetTouches: _targetTouches } = e.originalEvent;
        const targetTouches = [..._targetTouches].filter(touch => touch.identifier in [0, 1]);
        
        if(targetTouches.length === 1) {
            const {pageX, pageY, identifier} = targetTouches[0];
            if(identifier === 0) {
                startedTouches[0] = {
                    touchCoordinate: { pageX, pageY },
                    timestamp: e.timeStamp
                }
            }
            const top = Math.max(Math.min(pageY - position.top, offset.areaHeight), 5);
            const left = Math.max(Math.min(pageX - position.left, offset.areaWidth), 5);
            $(e.currentTarget)
                .find('#pointer')
                .css('top', `${top}px`)
                .css('left', `${left}px`)
                .css('opacity', '1')
                .addClass('fa-mouse-pointer');
            lastPageX = pageX;
            lastPageY = pageY;
        } else {
            const {pageX, pageY, identifier} = targetTouches[1];
            if(e.timeStamp - startedTouches[0].timestamp <= 60 && identifier === 1) {
                startedTouches[1] = {
                    touchCoordinate: { pageX, pageY },
                    timestamp: e.timeStamp
                }
            } else {
                startedTouches[1] = false
            }
            $(e.currentTarget)
                .find('#pointer')
                .removeClass('fa-mouse-pointer')
                .css('opacity', '1')
                .addClass('fa-arrows-v');
        }
    }).on('touchmove', e => {
        e.preventDefault();
        const { targetTouches, changedTouches: _changedTouches } = e.originalEvent;
        const changedTouches = [..._changedTouches].filter(touch => touch.identifier in [0, 1])
        if(changedTouches.length === 0) return false;
        const position = $(e.currentTarget).position();
        const fontSize = parseInt($('#pointer').css('font-size'), 10)
        const offset = {
            areaWidth: Math.floor(e.currentTarget.offsetWidth - fontSize),
            areaHeight: Math.floor(e.currentTarget.offsetHeight - fontSize)
        }
        const {pageX, pageY} = targetTouches[0];
        const deltaX = pageX - lastPageX; lastPageX = pageX;
        const deltaY = pageY - lastPageY; lastPageY = pageY;
        if(targetTouches.length === 1) {
            // move mouse pointer
            const top = Math.max(Math.min(pageY - position.top, offset.areaHeight), 5);
            const left = Math.max(Math.min(pageX - position.left, offset.areaWidth), 5);
            $(e.currentTarget)
                .find('#pointer')
                .css('top', `${top}px`)
                .css('left', `${left}px`);
        }
        const eventType = targetTouches.length === 1 ? 'mousemove' : 'wheel';
        if(eventType !== (lastMouseEventType ?? eventType) || queueInsertPos >= MOUSE_INPUT_QUEUE_SIZE) {
            fireQueuedMouseEvents(lastMouseEventType)
        }
        mouseEventQueue[queueInsertPos++] = {
            source: 'touchpad',
            deltaX,
            deltaY,
            deltaZ: 0,
            deltaMode: 0,
            ctrlKey: helperKeys.includes(17),
            shiftKey: helperKeys.includes(16),
            altKey: helperKeys.includes(18),
            metaKey: helperKeys.includes(91)
        };
        lastMouseEventType = eventType;
    }).on('touchend touchcancel', e => {
        e.preventDefault();
        const position = $(e.currentTarget).position();
        const { targetTouches: _targetTouches, changedTouches: _changedTouches } = e.originalEvent;
        const targetTouches = [..._targetTouches].filter(touch => touch.identifier in [0, 1]);
        const fontSize = parseInt($('#pointer').css('font-size'), 10)
        const offset = {
            areaWidth: Math.floor(e.currentTarget.offsetWidth - fontSize),
            areaHeight: Math.floor(e.currentTarget.offsetHeight - fontSize)
        }

        if(targetTouches.length === 1) {
            const {pageX: _pageX, pageY: _pageY, identifier: _identifier} = targetTouches[0];
            const top = Math.max(Math.min(_pageY - position.top, offset.areaHeight), 5);
            const left = Math.max(Math.min(_pageX - position.left, offset.areaWidth), 5);
            $(e.currentTarget)
                .find('#pointer')
                .removeClass('fa-arrows-v')
                .addClass('fa-mouse-pointer')
                .css('top', `${top}px`)
                .css('left', `${left}px`)
                .css('opacity', '1');
            const touchendId = (_identifier + 1) % 2;
            const changedTouches = [..._changedTouches].filter(touch => touch.identifier === touchendId);
            const startedTouch = !!(startedTouches.at) ? startedTouches.at(touchendId)
                : startedTouches.splice()[touchEndedId];
            if(changedTouches.length === 1 && e.type === 'touchend' && !!startedTouch
                && e.timeStamp - startedTouch.timestamp <= 100) {
                const { pageX, pageY } = changedTouches[0];
                const { touchCoordinate } = startedTouch;
                const dx = touchCoordinate.pageX - pageX;
                const dy = touchCoordinate.pageY - pageY;
                const distance = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
                startedTouches[touchendId] = distance <= 30;
                touchEndedId = touchendId
            }
        } else if(targetTouches.length < 1) {
            $(e.currentTarget)
                .find('#pointer')
                .removeClass('fa-mouse-pointer')
                .removeClass('fa-arrows-v')
                .css('opacity', '0');
            const touchendId = (touchEndedId + 1) % 2;
            const changedTouches = [..._changedTouches].filter(touch => touch.identifier === touchendId);
            const startedTouch = !!(startedTouches.at) ? startedTouches.at(touchendId)
                : startedTouches.splice()[touchEndedId];
            if(changedTouches.length === 1 && e.type === 'touchend' && !!startedTouch
                && e.timeStamp - startedTouch.timestamp <= 100) {
                const { pageX, pageY } = changedTouches[0];
                const { touchCoordinate } = startedTouch;
                const dx = touchCoordinate.pageX - pageX;
                const dy = touchCoordinate.pageY - pageY;
                const distance = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
                startedTouches[touchendId] = distance <= 30;
                if(startedTouches.reduce((p, c) => p && !!c, true)) {
                    clickCount = -1;
                } else if(distance <= 30) {
                    clickCount++;
                } else {
                    clickCount = 0;
                }
            }
            if(clickCount === 0) {
                fireQueuedMouseEvents(lastMouseEventType);
                lastMouseEventType = 'touchend';
            } else if(clickCount === 1) {
                queueInsertPos = 0;
                mouseEventQueue.fill(null);
                setTimeout(() => {
                    const eventType = clickCount === 1 ? 'click' : 'dblclick';
                    $('#btn-left').trigger(eventType, {clickCount, source: 'touchpad'});
                    clickCount = 0;
                }, 200);
            } else if(clickCount === -1) {
                queueInsertPos = 0;
                mouseEventQueue.fill(null);
                $('#btn-right').trigger('click', { source: 'touchpad' });
                clickCount = 0;
            }
            startedTouches.fill(null);
            touchEndedId = -1;
            lastPageX = null;
            lastPageY = null;
        }
    })
});
