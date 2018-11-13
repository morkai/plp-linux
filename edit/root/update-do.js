'use strict';

const fs = require('fs');
const {host} = require('./server.json');

let etcHosts = fs.readFileSync('/etc/hosts', 'utf8');

if (etcHosts.includes('ket.wmes.walkner.pl'))
{
  etcHosts = etcHosts.replace(/(\.?[0-9]+){4}\s+ket.wmes.walkner.pl/, `${host} ket.wmes.pl`);
}
else if (etcHosts.includes('ket.wmes.pl'))
{
  etcHosts = etcHosts.replace(/(\.?[0-9]+){4}\s+ket.wmes.pl/, `${host} ket.wmes.pl`);
}
else
{
  etcHosts += `\n\n${host} ket.wmes.pl\n`;
}

fs.writeFileSync('/etc/hosts', etcHosts);
