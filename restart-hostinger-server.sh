#!/bin/bash

# Connect to Hostinger and restart the Node server
HOST="u875570433@89.117.27.154"
PORT="65002"

echo "Connecting to Hostinger..."
ssh -p $PORT $HOST << 'REMOTE'
echo "Killing all Node processes..."
killall -9 node 2>/dev/null || true

echo "Waiting 3 seconds..."
sleep 3

echo "Starting Node server..."
cd /home/u875570433/domains/api.nekxuz.in/nodejs/
nohup /opt/alt/alt-nodejs22/root/usr/bin/node server.js > ~/server.log 2>&1 &

echo "Waiting 5 seconds for startup..."
sleep 5

echo "Checking if server is running..."
ps aux | grep "node server.js" | grep -v grep

echo "Testing API..."
curl -s "http://localhost:3002/api/orders?email=infodevayushenterprise@gmail.com" | head -c 300
echo ""

REMOTE

echo "Done!"
