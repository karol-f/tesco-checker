#!/usr/bin/env bash

set -x

rm -f dates*.png
export DATES=
export NEED_TO_RECHECK=
echo "PREVIOUS_DATES $PREVIOUS_DATES"
echo "LAST_FOUND_DATES_TIMESTAMP $LAST_FOUND_DATES_TIMESTAMP"
echo "LAST_NOT_FOUND_DATES_TIMESTAMP $LAST_NOT_FOUND_DATES_TIMESTAMP"

export TEST_OUTPUT=$(node test.js)

if [ "$TEST_OUTPUT" == "Dates not changed" ] ; then
    export LAST_FOUND_DATES_TIMESTAMP=$(date +%s)
elif [ "$TEST_OUTPUT" == "No available dates" ] ; then
    export LAST_NOT_FOUND_DATES_TIMESTAMP=$(date +%s)
elif [[ ! -z "$TEST_OUTPUT" ]] ; then
    echo '### Dates found, need to recheck ###'
    export NEED_TO_RECHECK=true
fi

if [ "$NEED_TO_RECHECK" = true ] ; then
  rm -f dates*.png
  export DATES=

  export TEST_OUTPUT=$(node test.js)

  if [ "$TEST_OUTPUT" == "Dates not changed" ] ; then
    export LAST_FOUND_DATES_TIMESTAMP=$(date +%s)
  elif [ "$TEST_OUTPUT" == "No available dates" ] ; then
      export LAST_NOT_FOUND_DATES_TIMESTAMP=$(date +%s)
  elif [[ ! -z "$TEST_OUTPUT" ]] ; then
      echo '### Setting Dates ###'
      export DATES=$TEST_OUTPUT
      export PREVIOUS_DATES=$(node mergeDatesWithPrevious.js)
      export LAST_FOUND_DATES_TIMESTAMP=$(date +%s)
  fi
fi

