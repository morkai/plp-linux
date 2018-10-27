'use strict';

const {host} = require('./server.json');

let etcHosts = fs.readFileSync('/etc/hosts', 'utf8');

if (etcHosts.includes('ket.wmes.walkner.pl'))
{
  etcHosts = etcHosts.replace(/(\.?[0-9]+){4}\s+ket.wmes.walkner.pl/, `${host} ket.wmes.walkner.pl`);
}
else
{
  etcHosts += `\n\n${host} ket.wmes.walkner.pl\n`;
}

fs.writeFileSync('/etc/hosts', etcHosts);
