#!/usr/bin/node

'use strict';

const fs = require('fs-extra');
const path = require('path');
const request = require('request-promise-native');

const DIST = 'focal';
const UPDATE_URI = `https://packages.ubuntu.com/${DIST}-updates/amd64/\${package}/download`;
const PACKAGES_PATH = `${__dirname}/extract/pool/extras`;
const NEW_PACKAGES_PATH = `${__dirname}/extract/pool/extras-new`;

fs.emptyDirSync(NEW_PACKAGES_PATH);

const nameToFile = {};

fs.readdirSync(PACKAGES_PATH)
  .map(file => ({
    file,
    name: file.split('_')[0]
  }))
  .sort((a, b) => a.file.localeCompare(b.file, undefined, {numeric: true}))
  .forEach(p => nameToFile[p.name] = p.file);

const queue = Object.keys(nameToFile);

updateNext();

function updateNext()
{
  const name = queue.shift();

  if (!name)
  {
    return;
  }

  const oldFile = nameToFile[name];
  const oldVersion = oldFile.replace(`${name}_`, '');

  console.log(name);
  console.log(`\t${oldVersion}`);

  const req = {
    method: 'GET',
    url: UPDATE_URI.replace('${package}', name)
  };

  request(req, (err, res, body) =>
  {
    const re = new RegExp(`href="(http.*?de.archive.*?${name}.*?deb)"`);
    const matches = body.match(re);

    if (!matches)
    {
      return copyOld(oldFile);
    }

    const downloadUri = matches[1];
    const newFile = downloadUri.split('/').pop();
    const newVersion = newFile.replace(`${name}_`, '');

    if (newVersion === oldVersion)
    {
      return copyOld(oldFile);
    }

    console.log(`\t${newVersion}`);

    request(downloadUri)
      .on('error', err =>
      {
        console.log(err.message);
      })
      .on('end', updateNext)
      .pipe(fs.createWriteStream(path.join(NEW_PACKAGES_PATH, newFile)));
  });
}

function copyOld(oldFile)
{
  fs.copySync(path.join(PACKAGES_PATH, oldFile), path.join(NEW_PACKAGES_PATH, oldFile));

  console.log('\tSAME');

  setImmediate(updateNext);
}
