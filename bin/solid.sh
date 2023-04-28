#!/bin/bash

PORT=3000

if [ ! -d solid ]; then
    mkdir solid
fi

cd solid

if [ ! -d service/inbox ]; then
    mkdir -p service/inbox
fi

rm service/inbox/*

if [ ! -d repository/inbox ]; then
    mkdir -p repository/inbox
fi

rm repository/inbox/*

community-solid-server -p ${PORT} -c @css:config/file-no-setup.json
