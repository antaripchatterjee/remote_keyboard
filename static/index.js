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

    $("span.key:not(#key-mouse)").click((e, data = {}) => {
        let params = {
            enableEffect: true,
            primaryEvent: e.type,
            ...data,
        };
        const helperKeysCopy = helperKeys;
        const { enableEffect, primaryEvent } = params;
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
                const _keyCode = Number.parseInt(e.target.id.split("-")[1]);
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
            }); //.removeClass('hkey-clicked')
        }
    });

    $("div#log-input")
        .click((e) => {
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
                    });
                }
                kde.stopPropagation();
                return false;
            });
            e.stopPropagation();
        })
        .click();
    /*
    $('.mouse-touchpad#touchpad').on('dragover', (e) => {
        e.preventDefault();
    }).on('dragleave', e => {
        e.preventDefault();
        if(e.target.id === 'touchpad') {
            $('.mouse-pointer#pointer').css('opacity', 1)
        }
    }).on('dragenter', e => {
        e.preventDefault();
        if(e.target.id === 'touchpad') {
            $('.mouse-pointer#pointer').css('opacity', 0)
        }
    }).on('drop', e => {
        if(e.target.id === 'touchpad') {
            const maxLeft = Math.floor(e.target.offsetWidth - $('.mouse-pointer#pointer').outerWidth());
            const maxTop = Math.floor(e.target.offsetHeight - $('.mouse-pointer#pointer').outerHeight());
            $('.mouse-pointer#pointer')
                .css("top", `${Math.min(maxTop, Math.max(e.offsetY, 5))}px`)
                .css("left", `${Math.min(maxLeft, Math.max(e.offsetX, 5))}px`);
        }
    }).on('mousedown', e => {
        if(e.target.id === 'touchpad') {
            const maxLeft = Math.floor(e.target.offsetWidth - $('.mouse-pointer#pointer').outerWidth());
            const maxTop = Math.floor(e.target.offsetHeight - $('.mouse-pointer#pointer').outerHeight());
            $('.mouse-pointer#pointer')
                .css("top", `${Math.min(maxTop, Math.max(e.offsetY, 5))}px`)
                .css("left", `${Math.min(maxLeft, Math.max(e.offsetX, 5))}px`);
        }  
    });
    $('.mouse-pointer#pointer').on('dragstart', (e) => {
        $(e.currentTarget).css('opacity', 0);
    })
    .on('dragend', (e) => {
        $(e.currentTarget).css('opacity', 1)
    })
    */

    let lastX = null, lastY = null, lastMouseEventType = null;

    $('.mouse-touchpad#touchpad').on('touchstart', e => {
        e.preventDefault();
        const position = $(e.currentTarget).position();
        const fontSize = parseInt($('.mouse-pointer#pointer').css('font-size'), 10)
        const offset = {
            areaWidth: Math.floor(e.currentTarget.offsetWidth - fontSize),
            areaHeight: Math.floor(e.currentTarget.offsetHeight - fontSize)
        }
        const { targetTouches } = e.originalEvent;
        if(targetTouches.length == 1) {
            const {pageX, pageY} = targetTouches[0];
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
        const fontSize = parseInt($('.mouse-pointer#pointer').css('font-size'), 10)
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
        const eventType = targetTouches.length === 1 ? 'pointermove' : 'scrolleffect';
        if(eventType === (lastMouseEventType ?? eventType) && queueInsertPos < MOUSE_INPUT_QUEUE_SIZE) {
            mouseEventQueue[queueInsertPos++] = {
                deltaX,
                deltaY,
                ctrlKey: helperKeys.includes(17),
                shiftKey: helperKeys.includes(16),
                altKey: helperKeys.includes(18),
                metaKey: helperKeys.includes(91)
            };
        } else {
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
        lastMouseEventType = eventType;
    }).on('touchend touchcancel', e => {
        e.preventDefault();
        const position = $(e.currentTarget).position();
        const { targetTouches } = e.originalEvent;
        const fontSize = parseInt($('.mouse-pointer#pointer').css('font-size'), 10)
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
            }
            lastX = null;
            lastY = null;
            queueInsertPos = 0;
            mouseEventQueue.fill(null);
            lastMouseEventType = null;
        }
    }).on('mousedown', e => {
        console.log(e)
    })
});
