'use strict';

const execSync = require('child_process').execSync;

let output = null;
let mode = null;
let rate = null;

execSync('xrandr --screen 0 --display :0', {encoding: 'utf8'}).split('\n').forEach(line =>
{
  if (!output)
  {
    const matches = line.trim().match(/^([A-Za-z0-9]+) connected/);

    if (matches)
    {
      output = matches[1];
    }
  }
  else if (!mode)
  {
    const matches = line.trim().match(/^([0-9]+x[0-9]+)\s+([0-9]+\.[0-9]+)/);

    if (matches)
    {
      mode = matches[1];
      rate = matches[2];
    }
  }
});

if (output && mode && rate)
{
  execSync(`xrandr --screen 0 --display :0 --output ${output} --mode ${mode} --rate ${rate}`);
}
