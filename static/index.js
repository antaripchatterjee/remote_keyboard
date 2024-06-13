$("#root").ready(() => {
    let helperKeys = [];
    let keyboardEventId = -1;
    let mouseEventId = -1;
    const MOUSE_INPUT_QUEUE_SIZE = 64;
    const MAX_SERVER_SIDE_QUEUE_SIZE = 1024;
    const mouseEventQueue = new Array(MOUSE_INPUT_QUEUE_SIZE).fill(null);
    let queueInsertPos = 0;

    const rowWidth = $("div#log-input").parent().css("width");
    $("div#log-input").parent().css("width", rowWidth);
    
    document.addEventListener('interface-input', async (e) => {
        console.log(e)

    })

    $("span.key").click((e, data = {}) => {
        let params = {
            enableEffect: true,
            primaryEvent: e.type,
            keyCode: Number.parseInt(e.target.id.split("-")[1]),
            ...data,
        };
        const helperKeysCopy = helperKeys;
        const { enableEffect, primaryEvent, keyCode: _keyCode } = params;
        if(primaryEvent === 'click' && _keyCode === 27) {
            if($('#touchpad').attr('data-pointer') === 'visible') {
                return false;
            }
        }
        let doLog = true;
        if (!$("div#log-input").hasClass("focus")) {
            $("div#log-input").addClass("focus");
        }

        if (e.target.id === "key-16") {
            $("span.key.shift").toggleClass("key-shift");
        }
        if (["key-16", "key-17", "key-18", "key-91"].includes(e.target.id)) {
            doLog = false;
            if (primaryEvent === "click") {
                $(e.target).toggleClass("hkey-clicked");
                // const _keyCode = Number.parseInt(e.target.id.split("-")[1]);
                if ($(e.target).hasClass("hkey-clicked")) {
                    helperKeys.push(_keyCode);
                    // console.log('After adding helper keys in click', helperKeys)
                } else {
                    helperKeys = helperKeys.filter((keyCode) => keyCode !== _keyCode);
                    // console.log('After removing helper keys in click', helperKeys)
                }
            } else if (primaryEvent === "keydown") {
                $(e.target).addClass("hkey-clicked");
            } else if (primaryEvent === "keyup") {
                $(e.target).removeClass("hkey-clicked");
            }
        } else {
            if (enableEffect) {
                $(e.target).addClass("key-clicked");
                setTimeout(() => $(e.target).removeClass("key-clicked"), 50);
            }
            $([17, 18, 91].map((e) => `span.key#key-${e}`).join(", ")).removeClass(
                "hkey-clicked"
            );
            helperKeys = helperKeys.filter(
                (keyCode) => ![17, 18, 19].includes(keyCode)
            );
        }
        if (enableEffect) {
            if (doLog) {
                const pressedKey = $(e.target).hasClass("key-shift")
                    ? $(e.target).data("shift")
                    : $(e.target).data("key");
                let logKey = null;
                let isShortcutKey = false;
                if (
                    helperKeysCopy.length === 0 ||
                    (helperKeysCopy.length === 1 && helperKeysCopy[0] === 16)
                ) {
                    logKey = pressedKey;
                } else {
                    logKey =
                        helperKeysCopy
                            .map((keyId) => $(`span#key-${keyId}`).data("key"))
                            .join(" + ")
                            .toUpperCase() + ` + ${$(e.target).data("key")}`;
                    isShortcutKey = true;
                }
                const new_children = $(document.createElement("span"))
                    .attr({ "data-log-text": logKey })
                    .addClass("log-key")
                    .addClass(() =>
                        isShortcutKey
                            ? "non-printable-shortcut"
                            : [...e.target.classList].filter((c) =>
                                ["key-symbol", "key-letter", "key-number"].includes(c)
                            ).length > 0
                                ? "printable"
                                : "non-printable"
                    );
                $("div#log-input")
                    .append(new_children)
                    .scrollTop($("div#log-input").prop("scrollHeight"));
                const interfaceKeyboard = new CustomEvent('interface-input', {
                    detail: {
                        interfaceType: 'keyboard',
                        eventType: 'keypress',
                        data: {
                            key: logKey
                        },
                        identifier: (keyboardEventId = ((keyboardEventId + 1) % MOUSE_INPUT_QUEUE_SIZE))
                    }
                });
                document.dispatchEvent(interfaceKeyboard)
            }
        }
        e.stopPropagation();
    });

    const removeKeydown = (e) => {
        $("div#log-input").removeClass("focus");
        $(document).off("keydown");
    };
    $("div.keyboard").click((e) => removeKeydown(e));

    $(document).on("keyup", (kue) => {
        if ([16, 17, 18, 91].includes(kue.keyCode)) {
            keyboardBtn = document.querySelector(`span#key-${kue.keyCode}`);
            helperKeys = helperKeys.filter((keyCode) => keyCode !== kue.keyCode);
            // console.log('After removing helper keys in keyup', helperKeys)
            $(keyboardBtn).trigger("click", {
                enableEffect: false,
                primaryEvent: kue.type,
                keyCode: kue.keyCode
            }); //.removeClass('hkey-clicked')
        }
    });

    $("div#log-input").click((e) => {
        removeKeydown(e);
        $(e.target).addClass("focus");
        $(document).on("keydown", (kde) => {
            kde.preventDefault();
            if (
                ![16, 17, 18, 91].includes(kde.keyCode) ||
                !helperKeys.includes(kde.keyCode)
            ) {
                keyboardBtn = document.querySelector(`span#key-${kde.keyCode}`);
                if ([16, 17, 18, 91].includes(kde.keyCode)) {
                    helperKeys.push(kde.keyCode);
                    // console.log('After adding helper keys in keydown', helperKeys)
                }
                $(keyboardBtn).trigger("click", {
                    primaryEvent: kde.type,
                    keyCode: kde.keyCode
                });
            }
            kde.stopPropagation();
            return false;
        });
        e.stopPropagation();
    }).trigger('click');
    
    let lastX = null, lastY = null, lastMouseEventType = null;
    let startedTouch = null, secondClickTs = NaN, clickCount = 0;
    if(window.matchMedia("(any-pointer: coarse)").matches) {
        // touch device only
        $('#touchpad').append(`
            <span class="fa fa-xl mouse-pointer"
                id="pointer" style="top: 5px; left: 5px;"></span>    
        `)
    }

    function fireWhenMouseLeaves() {
        if(mouseEventQueue[0] !== null) {
            const interfaceMouse = new CustomEvent('interface-input', {
                detail: {
                    interfaceType: 'mouse',
                    eventType: lastMouseEventType,
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
            lastMouseEventType = null;
        }
    }

    $('#btn-left').on('click dblclick', (e, c) => {
        e.preventDefault();
        const data = c ?? { clickCount: e.type === 'click' ? 1 : 2}
        mouseEventQueue[queueInsertPos++] = {
            source: 'left-button',
            ctrlKey: helperKeys.includes(17),
            shiftKey: helperKeys.includes(16),
            altKey: helperKeys.includes(18),
            metaKey: helperKeys.includes(91),
            ...data
        }
        const interfaceMouse = new CustomEvent('interface-input', {
            detail: {
                interfaceType: 'mouse',
                eventType: e.type,
                data: {
                    queue: mouseEventQueue.slice(0, queueInsertPos),
                    size: queueInsertPos
                },
                identifier: (mouseEventId = (mouseEventId + 1) % MAX_SERVER_SIDE_QUEUE_SIZE)
            }
        });
        queueInsertPos = 0;
        mouseEventQueue.fill(null);
        document.dispatchEvent(interfaceMouse);
    });

    $('#touchpad').on('click', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'hidden') {
            $(e.currentTarget)
                .attr('data-pointer', 'visible')
                .on('keyup', e => {
                    if(e.keyCode === 27) {
                        fireWhenMouseLeaves();
                        $(e.currentTarget)
                            .attr('data-pointer', 'hidden')
                            .off('keyup');
                    }
                })
        } else {
            if(Number.isNaN(secondClickTs) && clickCount === 0) {
                setTimeout(({firstClickTs}) => {
                    if((secondClickTs - firstClickTs > 200) || clickCount === 1) {
                        $('#btn-left').trigger('click', { clickCount })
                    } else {
                        $('#btn-left').trigger('dblclick', { clickCount })
                    }
                    clickCount = 0;
                    secondClickTs = NaN;
                }, 200, {firstClickTs: e.timeStamp});
            } else if(clickCount === 1) {
                secondClickTs = e.timeStamp;
            }
            clickCount++;
        }
    }).on('mouseleave', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'visible') {
            fireWhenMouseLeaves();
            $(e.currentTarget)
                .attr('data-pointer', 'hidden')
                .off('keyup');
        }
    }).on('mousemove', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'visible') {
            const eventType = 'mousemove';
            const { movementX, movementY } = e.originalEvent;
            if(eventType !== (lastMouseEventType ?? eventType) || queueInsertPos >= MOUSE_INPUT_QUEUE_SIZE) {
                const interfaceMouse = new CustomEvent('interface-input', {
                    detail: {
                        interfaceType: 'mouse',
                        eventType: lastMouseEventType,
                        data: {
                            queue: mouseEventQueue.slice(0, queueInsertPos),
                            size: queueInsertPos
                        },
                        identifier: (mouseEventId = (mouseEventId + 1) % MAX_SERVER_SIDE_QUEUE_SIZE)
                    }
                });
                queueInsertPos = 0;
                mouseEventQueue.fill(null);
                document.dispatchEvent(interfaceMouse);
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
            lastMouseEventType = eventType;
        }
    }).on('wheel', e => {
        e.preventDefault();
        if($(e.currentTarget).attr('data-pointer') === 'visible') {
            const { deltaX, deltaY, deltaZ, deltaMode } = e.originalEvent;
            const interfaceMouse = new CustomEvent('interface-input', {
                detail: {
                    interfaceType: 'mouse',
                    eventType: 'wheel',
                    data: {
                        queue: [
                            {
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
                        ],
                        size: 1
                    },
                    identifier: (mouseEventId = (mouseEventId + 1) % MAX_SERVER_SIDE_QUEUE_SIZE)
                }
            });
            document.dispatchEvent(interfaceMouse);
        }
    }).on('touchstart', e => {
        e.preventDefault();
        console.log(e)
        const position = $(e.currentTarget).position();
        const fontSize = parseInt($('#pointer').css('font-size'), 10)
        const offset = {
            areaWidth: Math.floor(e.currentTarget.offsetWidth - fontSize),
            areaHeight: Math.floor(e.currentTarget.offsetHeight - fontSize)
        }
        const { targetTouches } = e.originalEvent;
        if(targetTouches.length == 1) {
            const {pageX, pageY, identifier} = targetTouches[0];
            if(identifier === 0) {
                startedTouch = {
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
            lastX = pageX;
            lastY = pageY;
        } else {
            $(e.currentTarget)
                .find('#pointer')
                .removeClass('fa-mouse-pointer')
                .css('opacity', '1')
                .addClass('fa-arrows-v');
        }
    }).on('touchmove', e => {
        e.preventDefault();
        const position = $(e.currentTarget).position();
        const fontSize = parseInt($('#pointer').css('font-size'), 10)
        const offset = {
            areaWidth: Math.floor(e.currentTarget.offsetWidth - fontSize),
            areaHeight: Math.floor(e.currentTarget.offsetHeight - fontSize)
        }
        const { targetTouches } = e.originalEvent;
        const {pageX, pageY} = targetTouches[0];
        const deltaX = pageX - lastX; lastX = pageX;
        const deltaY = pageY - lastY; lastY = pageY;
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
            const interfaceMouse = new CustomEvent('interface-input', {
                detail: {
                    interfaceType: 'mouse',
                    eventType: lastMouseEventType,
                    data: {
                        queue: mouseEventQueue.slice(0, queueInsertPos),
                        size: queueInsertPos
                    },
                    identifier: (mouseEventId = (mouseEventId + 1) % MAX_SERVER_SIDE_QUEUE_SIZE)
                }
            });
            queueInsertPos = 0;
            mouseEventQueue.fill(null);
            document.dispatchEvent(interfaceMouse);
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
        console.log(e);
        const position = $(e.currentTarget).position();
        const { targetTouches, changedTouches } = e.originalEvent;
        const fontSize = parseInt($('#pointer').css('font-size'), 10)
        const offset = {
            areaWidth: Math.floor(e.currentTarget.offsetWidth - fontSize),
            areaHeight: Math.floor(e.currentTarget.offsetHeight - fontSize)
        }
        if(targetTouches.length == 1) {
            const {pageX, pageY} = targetTouches[0];
            const top = Math.max(Math.min(pageY - position.top, offset.areaHeight), 5);
            const left = Math.max(Math.min(pageX - position.left, offset.areaWidth), 5);
            $(e.currentTarget)
                .find('#pointer')
                .removeClass('fa-arrows-v')
                .addClass('fa-mouse-pointer')
                .css('top', `${top}px`)
                .css('left', `${left}px`)
                .css('opacity', '1');
        } else if(targetTouches.length < 1) {
            $(e.currentTarget)
                .find('#pointer')
                .removeClass('fa-mouse-pointer')
                .removeClass('fa-arrows-v')
                .css('opacity', '0');
            const {identifier, pageX, pageY} = changedTouches[0];
            if(e.type === 'touchend' && startedTouch !== null && identifier === 0
                && e.timeStamp - startedTouch.timestamp <= 100) {
                const { touchCoordinate } = startedTouch;
                const dx = touchCoordinate.pageX - pageX;
                const dy = touchCoordinate.pageY - pageY;
                const distance = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
                if(distance <= 30) {
                    clickCount++;
                } else {
                    clickCount = 0;
                }
            }
            if(mouseEventQueue[0] !== null && clickCount === 0) {
                const interfaceMouse = new CustomEvent('interface-input', {
                    detail: {
                        interfaceType: 'mouse',
                        eventType: lastMouseEventType,
                        data: {
                            queue: mouseEventQueue.slice(0, queueInsertPos),
                            size: queueInsertPos
                        },
                        identifier: (mouseEventId = (mouseEventId + 1) % MAX_SERVER_SIDE_QUEUE_SIZE)
                    }
                });
                document.dispatchEvent(interfaceMouse);
            } else if(clickCount === 1) {
                setTimeout(() =>{
                    if(clickCount === 1) {
                        $('#btn-left').trigger('click', {clickCount})
                    } else {
                        $('#btn-left').trigger('dblclick', {clickCount})
                    }
                    clickCount = 0;
                }, 200);
            }
            lastX = null;
            lastY = null;
            queueInsertPos = 0;
            mouseEventQueue.fill(null);
            lastMouseEventType = null;
        }
    })
});
