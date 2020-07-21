#!/bin/bash

POOL="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )/extract/pool"

if [ "$(ls -A $POOL/extras-new)" ]; then
  rm -rf $POOL/extras
  mv $POOL/extras-new $POOL/extras
  mkdir $POOL/extras-new
else
  echo extras-new directory is empty!
fi
