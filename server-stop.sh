#!/bin/bash
cd ./game-server && kill -9 $(ps -x|grep -E 'node'|grep -E 'production'|grep -v grep|awk '{print $1}' )
echo 'server stoping... you will be not see any process about node in few seconds'
sleep 5
ps -x | grep node
echo '============   game-server stop ok    ============'