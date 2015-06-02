#! /bin/bash

meteor test-packages \
  "$(pwd)/packages/rest" \
  "$(pwd)/packages/json-routes" \
  "$(pwd)/packages/rest-bearer-token-parser" \
  "$(pwd)/packages/authenticate-user-by-token" \
  "$(pwd)/packages/rest-accounts-password"