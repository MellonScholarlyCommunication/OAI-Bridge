#!/bin/bash

PORT=3000

if [ ! -d solid ]; then
    mkdir solid
fi

cd solid

if [ ! -d ces/inbox ]; then
    mkdir -p ces/inbox
else
    rm ces/inbox/*
fi

if [ ! -d ces-relay/inbox ]; then
    mkdir -p ces-relay/inbox
else
    rm ces-relay/inbox/*
fi

if [ ! -d repository/inbox ]; then
    mkdir -p repository/inbox
else
    rm repository/inbox/*
fi

community-solid-server -p ${PORT} -c @css:config/file-no-setup.json
