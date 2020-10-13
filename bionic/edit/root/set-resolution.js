'use strict';

const {execSync} = require('child_process');
const logger = require('h5.logger').create({module: 'set-resolution'});
const config = require('./server/config.json');

const ORIENTATIONS = {
  normal: '1 0 0 0 1 0 0 0 1',
  inverted: '-1 0 1 0 -1 1 0 0 1',
  left: '0 -1 1 1 0 0 0 0 1',
  right: '0 1 0 -1 0 1 0 0 1'
};

const orientation = config.orientation || 'normal';
const transform = ORIENTATIONS[orientation];
let output = null;
let mode = null;
let rate = null;

execSync('xrandr --screen 0 --display :0', {encoding: 'utf8'}).split('\n').forEach(line =>
{
  if (!output)
  {
    const matches = line.trim().match(/^([A-Za-z0-9_-]+) connected/);

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

logger.debug('Parameters:', {
  output,
  mode,
  rate,
  orientation,
  transform
});

if (output && mode && rate)
{
  logger.debug('Setting mode & rate...');
  execSync(`xrandr --screen 0 --display :0 --output ${output} --mode ${mode} --rate ${rate}`);

  logger.debug('Setting orientation...');
  execSync(`xrandr --screen 0 --display :0 --orientation ${orientation}`);

  execSync(`xinput list`, {encoding: 'utf8'}).split('\n').forEach(line =>
  {
    const matches = line.match(/id=([0-9]+)\s+\[slave\s+pointer/);

    if (matches)
    {
      const id = matches[1];

      logger.debug('Setting transform...', {id});

      execSync(`xinput set-prop "${id}" "Coordinate Transformation Matrix" ${transform}`);
    }
  });
}
