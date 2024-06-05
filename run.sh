#!/usr/bin/bash

PYTHON3_INTP=$(which python3)

[[ ! -z $PYTHON3_INTP ]] && \
    $PYTHON3_INTP -m webbrowser -t http://localhost:8080/index.html && \
    $PYTHON3_INTP -m http.server 8080
    