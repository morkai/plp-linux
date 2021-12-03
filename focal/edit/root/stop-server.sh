#!/bin/bash

ID=$1

if [ -z "$ID" ] ; then
  ID=server
fi

pkill --signal SIGTERM --pidfile /root/pid/$ID.pid
