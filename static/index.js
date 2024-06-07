$("#root").ready(() => {
    const rowWidth = $("div#log-input").parent().css("width");
    let helperKeys = [];

    // $("div#log-input").parent().css("width", rowWidth);
    // const keypressAudioData =
    //     "SUQzBAAAAAAASFRQRTEAAAAcAAADU291bmRKYXkuY29tIFNvdW5kIEVmZmVjdHMAVFNTRQAAAA4AAANMYXZmNTkuMi4xMDAAAAAAAAAAAAAAAP/7lAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEluZm8AAAAPAAAABAAAB4AAZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmZmczMzMzMzMzMzMzMzMzMzMzMzMzMzMzMzMz/////////////////////////////////AAAAAExhdmM1OS4xLgAAAAAAAAAAAAAAACQEgAAAAAAAAAeALJcLggAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7lGQAAAAAAGkFAAAIAAANIKAAAReuBOJ42wAB768dqw9AAAAAAACAwIPAxQB/8LQMP44guHWDAIAgBl3TSAwsAqAxjA7AxRhQ5oWBqgZIBZAZRAkAY2yC/EAw2MZgi5fAw0gMA24lfAyBDsAwjhnAwzBD/sy7gYpwlgYRgdAYpArARBSAoDcDBGAH/t4ZYD4wBgeDJiCAAQGBPP/7cQeAwAcBwAgJAAAKA4Os2If//+0kiCCYDfE6GZGDgCxQj///Zv8+WR9ClAGACD7Pl8oE4LkJ0cf//////////4uM+gAAAQAAAAQIAAIAB4aBx54keaT6iJhgTszhhQKiACnXQQWBuDgG2HAOFfTe7gaQcBng4G/UhfgDwof2+AIEFJgsrAkEBu8NV/7v4uNIOnH2I/Ebl3//xxiAZ0g4YzIAeGQ//f+OsiYX3JQqH0TcZtL////NGM3ZN1Im5XQVlsltdiiDAYEIqMSCQbNJnB/VatiagxiHLUPpbDgelxUzC//7lGQRAAORKNPuNeAESibLDcEgAIyFc139goAZJ5iqv54gAhkFAzrlFjTbJ0NJePWqyH52imCE5PhvuR5yH1IsK6KcJ0KxCQBYLxPx8R2WD/vox3H/7/q+fvwIIDuJghWHg++ccKnA0d+g/55X/f8oidH0Db/j//RloomEWTaCwAaxDTuRw2DHCB6gMiCLA/i7wYGO6dBoeMrzun13D0KQN3eD/yP/v//Su/3si++J7m7hLiukxcB4sO/Up3qiImamFMgQZJdyAUBX8Oaj81MRheLdnWhTuUVhtUGhhjHqJFGPq8rAM7ixnKW6GfQXEbxY6TOPdUdnIp8zLN89nKYt1LqzZW/6uiO8/V3ZV//KqSrRG/fZVV3O7LR2UhlrFtwEzw8PEwZkAAnAKMVdmTD8NsXOKsjiSglSMcW2AUxSGksUrHxolrM1boexlIUZHy6aPoif+/u9ZishyiBOBwmZOFjSn////3e6f0oVerrNyFQAAJJdwHu/+QXmOxVMFv/7lGQJgAMsJdF9MYAARCK6v6YIAIwIu1e49YARK5IpNwZgAImo1xWqh0gdoj2tUqWFaVyHEq5w/PUQqgBoTcbA8m4vQnz7tj6buL4Tr/pal29/phqYHtESwVGux71uc4WNM6wVxeyTX2JyHIOOPsLEzS0raLGXd3aIZTAkFuW4JPrPu17ZLzbmkWsVhIQTM7/lYqHdDyMCARGiZhUEzArmYBK3fdGuOAIOyHPIcLH29/06fsE21z+WI23bDbbfNQhIop2WSS0CPtEMinDq3/puVtixn1aDyOgD5YTDBwD173nTcENU1Qvg0H0zQMVSs3pyh+ycdQk9fX7VOPPMv9rkro5zMfU3dKCMDtuSrBdDvRHpseUE45TP/922w222ydAIBKlut0uAAm8HOfnM5eaS7s1gWxDnkgU06EZxF/ZOT9JJb9tyJ3yd7fZ/+AE1TCDUW3iMYKFhUCTKhr5WLCW3t7DAK7UBQYAEIQhCEIQghCEIV4s+hPn0a0J6rTlLaf/7lEQND/KuIMbHBeAAXKQoyOE8AAAAAaQAAAAgAAA0gAAABAUnJ0uMpfhCgcwhxCkKjf/wnyuVz7fgq1DUNQ1Wq169fPgaBoGj0FQVBXLA0DIKgqCoKg0DQd+CvyoKuAAIAApjGM//MGAq1rWtde3zBTpomidLKwkqBTALQEIMIlyHK5XK1DVa91CYlcnk6W0go9I9I9JOTRQ1XPrYKrBUFTvklgqCoKgtLA0DQa/WCrwVBV2DQNA1lgaDikxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqg==";
    // const btnAudios = new Array(5).fill(
    //     new Audio(`data:audio/mp3;base64,${keypressAudioData}`),
    //     0,
    //     5
    // );

    let audioIndex = 0;

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }
    $("div.switch").click((swe) => {
        swe.preventDefault();
        const target = $(swe.target).hasClass("slider")
            ? $(swe.target).parent()
            : $(swe.target);
        ($(target).toggleClass("on").hasClass("on") &&
            $(target).find("input").attr("checked", true)) ||
            $(target).find("input").attr("checked", false);
        swe.stopPropagation();
        return false;
    });

    $("span.key#key-mouse")
        .on("mousewheel", (mwe) => {
            mwe.preventDefault();
            const { relX, relY } = {
                relX: mwe.offsetX - 21,
                relY: 21 - mwe.offsetY,
            };
            const dW = Math.abs(relX);
            const dH = Math.abs(relY);
            const mouseScroll = {
                event: "mouse_scroll",
                moveX: relX,
                moveY: relY,
                angle: toDegrees(Math.atan(dH / dW)).toFixed(3),
                quardinate:
                    relX >= 0 && relY >= 0
                        ? 1
                        : relX < 0 && relY >= 0
                            ? 2
                            : relX < 0 && relY < 0
                                ? 3
                                : 4,
                wheelDirection:
                    mwe.originalEvent.wheelDelta > 0 || mwe.originalEvent.detail < 0
                        ? "up"
                        : "down",
                wheelDelta: mwe.originalEvent.wheelDelta,
            };
            console.log(mouseScroll);
            return false;
        })
        .on("mousedown", (mde) => { })
        .on("mouseup", (mue) => {
            const mouseMove = {
                event: "mouse_click",
                moveX: mue.offsetX - 21,
                moveY: 21 - mue.offsetY,
                speed: Math.sqrt(
                    Math.pow(mue.offsetX - 21, 2) + Math.pow(mue.offsetY - 21, 2)
                ),
            };
            console.log(mouseMove);
        });

    $("span.key:not(#key-mouse)").click((e, data = {}) => {
        let params = {
            enableEffect: true,
            primaryEvent: e.type,
            ...data,
        };
        const helperKeysCopy = helperKeys;
        const { enableEffect, primaryEvent } = params;
        let doLog = true;
        // try {
            // if (enableEffect && $("input#enable-audio").attr("checked")) {
            //     audioIndex %= btnAudios.length;
            //     const btnAudio = btnAudios[audioIndex++];
            //     btnAudio.play();
            // }
        // } catch (e) {
        // } finally {
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
                                .toUpperCase() + ` + ${$(e.target).data("key")}`.toLowerCase();
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
                }
            }
        // }
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
});
