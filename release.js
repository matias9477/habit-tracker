#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { spawn } from 'child_process';

const appJsonPath = path.join(process.cwd(), 'app.json');
const pkgJsonPath = path.join(process.cwd(), 'package.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function incVersion(version, type) {
  let [major, minor, patch] = version.split('.').map(Number);
  if (type === 'major') {
    major++;
    minor = 0;
    patch = 0;
  } else if (type === 'minor') {
    minor++;
    patch = 0;
  } else {
    patch++;
  }
  return `${major}.${minor}.${patch}`;
}

async function main() {
  // 1. Prompt for update type
  const { updateType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'updateType',
      message: 'What type of update is this?',
      choices: [
        { name: 'Patch (bugfix, e.g. 1.0.0 → 1.0.1)', value: 'patch' },
        { name: 'Minor (feature, e.g. 1.0.0 → 1.1.0)', value: 'minor' },
        { name: 'Major (breaking, e.g. 1.0.0 → 2.0.0)', value: 'major' },
      ],
    },
  ]);

  // 2. Update version numbers
  const appJsonOrig = fs.readFileSync(appJsonPath, 'utf8');
  const pkgJsonOrig = fs.readFileSync(pkgJsonPath, 'utf8');
  let versionUpdated = false;
  try {
    const appJson = JSON.parse(appJsonOrig);
    const pkgJson = JSON.parse(pkgJsonOrig);
    const oldVersion = appJson.expo.version;
    const newVersion = incVersion(oldVersion, updateType);
    appJson.expo.version = newVersion;
    appJson.expo.ios.buildNumber = String(
      (parseInt(appJson.expo.ios.buildNumber, 10) || 0) + 1
    );
    pkgJson.version = newVersion;
    writeJson(appJsonPath, appJson);
    writeJson(pkgJsonPath, pkgJson);
    versionUpdated = true;
    console.log(`\nUpdated version: ${oldVersion} → ${newVersion}`);
    console.log(`iOS buildNumber: ${appJson.expo.ios.buildNumber}`);

    // 3. Confirm build for iOS
    const { buildIos } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'buildIos',
        message: 'Build for iOS now?',
        default: true,
      },
    ]);
    if (!buildIos) {
      console.log('Release cancelled.');
      process.exit(0);
    }

    // 4. Run EAS build for iOS
    console.log('\nStarting EAS build for iOS...');
    const buildProc = spawn('npx', ['eas-cli', 'build', '--platform', 'ios'], {
      stdio: 'inherit',
      shell: true,
    });
    await new Promise((resolve, reject) => {
      buildProc.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error('EAS build failed'));
      });
    });
    console.log('iOS build complete.');

    // 5. Prompt to submit to TestFlight
    const { submitIos } = await inquirer.prompt([
      {
        type: 'list',
        name: 'submitIos',
        message: 'Submit this build to TestFlight?',
        choices: [
          { name: 'Yes', value: true },
          { name: 'No', value: false },
        ],
      },
    ]);
    if (submitIos) {
      console.log('\nSubmitting to TestFlight...');
      const submitProc = spawn('npx', ['eas-cli', 'submit', '--platform', 'ios', '--latest'], {
        stdio: 'inherit',
        shell: true,
      });
      await new Promise((resolve, reject) => {
        submitProc.on('close', code => {
          if (code === 0) resolve();
          else reject(new Error('EAS submit failed'));
        });
      });
      console.log('Submitted to TestFlight.');
    } else {
      console.log('Skipped TestFlight submission.');
    }

    // 6. Summary
    console.log('\nRelease complete!');
    console.log(`Version: ${newVersion}`);
    console.log(`iOS buildNumber: ${appJson.expo.ios.buildNumber}`);
  } catch (err) {
    if (versionUpdated) {
      // Revert version changes
      fs.writeFileSync(appJsonPath, appJsonOrig, 'utf8');
      fs.writeFileSync(pkgJsonPath, pkgJsonOrig, 'utf8');
      console.error('\nVersion numbers reverted due to failure.');
    }
    throw err;
  }
}

await main().catch(err => {
  console.error('Release script failed:', err);
  process.exit(1);
}); 