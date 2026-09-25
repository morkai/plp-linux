'use strict';

const fs = require('fs');
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
const xinputOptions = {
  encoding: 'utf8',
  env: {...process.env, DISPLAY: ':0', LC_ALL: 'C'}
};
let output = null;
let mode = null;
let rate = null;

execSync('xrandr --screen "0" --display ":0"', {encoding: 'utf8'}).split('\n').forEach(line =>
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
  execSync(`xrandr --screen "0" --display ":0" --output ${output} --mode ${mode} --rate ${rate}`);

  logger.debug('Setting orientation...');
  execSync(`xrandr --screen "0" --display ":0" --output ${output} --rotate "${orientation}"`);

  execSync('xinput list', xinputOptions).split('\n').forEach(line =>
  {
    const matches = line.match(/id=([0-9]+)\s+\[slave\s+pointer/);

    if (matches)
    {
      const id = matches[1];

      try
      {
        const details = execSync(`xinput list --long "${id}"`, xinputOptions);
        const absoluteAxes = details.split('Class originated from:').filter(axis =>
          /Detail for Valuator [01]:/.test(axis) && /\bMode: absolute\b/.test(axis));

        // Rotate absolute X/Y coordinates (e.g. a touchscreen), not mouse deltas.
        // XTEST/VNC coordinates already refer to the rotated desktop.
        const rotateInput = absoluteAxes.length === 2
          && !/\bXTEST pointer\b/.test(line)
          && !/\bTouch mode: dependent\b/.test(details);
        const inputTransform = rotateInput ? transform : ORIENTATIONS.normal;

        logger.debug('Setting transform...', {id, transform: inputTransform});

        // Reset other pointers too, to undo transforms from earlier runs.
        execSync(`xinput set-prop --type=float "${id}" "Coordinate Transformation Matrix" ${inputTransform}`, xinputOptions);
      }
      catch (err)
      {
        logger.error(err, `Failed to set transform for input device ${id}.`);
      }
    }
  });

  let [width, height] = mode.split('x');

  if (orientation === 'left' || orientation === 'right')
  {
    [width, height] = [height, width];
  }

  logger.debug('Fixing google-chrome preferences...', {
    top: 0,
    right: +width,
    bottom: +height,
    left: 0
  });

  try
  {
    const preferences = JSON.parse(fs.readFileSync('/root/google-chrome/Default/Preferences', 'utf8'));

    if (!preferences.browser)
    {
      preferences.browser = {};
    }

    preferences.browser.window_placement = {
      bottom: +height,
      left: 0,
      maximized: true,
      right: +width,
      top: 0,
      work_area_bottom: +height,
      work_area_left: 0,
      work_area_right: +width,
      work_area_top: 0
    };

    fs.writeFileSync('/root/google-chrome/Default/Preferences', JSON.stringify(preferences));
  }
  catch (err) {}
}
