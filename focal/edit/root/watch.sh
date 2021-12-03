#!/bin/bash

touch /root/log/$1.txt
tail -f /root/log/$1.txt
