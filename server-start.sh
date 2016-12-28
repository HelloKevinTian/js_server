#!/bin/bash

cd ./game-server && ./pomelo start -e production -D
echo 'server starting... you will be see some process about node in few seconds,'
echo 'just like this:/usr/local/bin/node ... js_server/game-server/app.js env=production id=connector-server-1 host=127.0.0.1 port=3150 ...'
sleep 5
ps x | grep node
echo '============   game-server start ok   ============'