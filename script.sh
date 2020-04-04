#!/usr/bin/env bash

set -x

export OUTPUT=$(node test.js)

if [ "$OUTPUT" == "Dates not changed" ]
then
    export LAST_FOUND_DATES_TIMESTAMP=$(date +%s)
elif [ "$OUTPUT" == "No available dates" ]
then
    export LAST_NOT_FOUND_DATES_TIMESTAMP=$(date +%s)
elif [[ ! -z "$OUTPUT" ]]
then
    echo 'Setting Dates'
    export DATES=$OUTPUT
    export PREVIOUS_DATES=$OUTPUT
    export LAST_FOUND_DATES_TIMESTAMP=$(date +%s)
fi
