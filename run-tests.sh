#! /bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

jshint $DIR

result=$?
if [[ $result != 0 ]]
  # Exit if the linter didn't pass
  then exit $result
fi

meteor test-packages \
  "$DIR/packages/rest" \
  "$DIR/packages/json-routes" \
  "$DIR/packages/rest-bearer-token-parser" \
  "$DIR/packages/authenticate-user-by-token" \
  "$DIR/packages/rest-accounts-password" \
  "$DIR/packages/rest-json-error-handler"
