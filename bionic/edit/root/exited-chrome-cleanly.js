'use strict';

const fs = require('fs');

try { fs.unlinkSync('/root/google-chrome/SingletonCookie'); } catch (err) {}
try { fs.unlinkSync('/root/google-chrome/SingletonLock'); } catch (err) {}
try { fs.unlinkSync('/root/google-chrome/SingletonSocket'); } catch (err) {}

try
{
  const localState = JSON.parse(fs.readFileSync('/root/google-chrome/Local State', 'utf8'));

  if (localState
    && localState.user_experience_metrics
    && !localState.user_experience_metrics.exited_cleanly)
  {
    localState.user_experience_metrics.exited_cleanly = true;

    if (localState.user_experience_metrics.stability)
    {
      localState.user_experience_metrics.stability.exited_cleanly = true;
    }

    fs.writeFileSync('/root/google-chrome/Local State', JSON.stringify(localState));
  }
}
catch (err) {}

try
{
  const preferences = JSON.parse(fs.readFileSync('/root/google-chrome/Default/Preferences', 'utf8'));

  if (preferences
    && preferences.profile
    && (!preferences.profile.exited_cleanly || preferences.profile.exit_type !== 'Normal'))
  {
    preferences.profile.exit_type = 'Normal';
    preferences.profile.exited_cleanly = true;

    fs.writeFileSync('/root/google-chrome/Default/Preferences', JSON.stringify(preferences));
  }
}
catch (err) {}
