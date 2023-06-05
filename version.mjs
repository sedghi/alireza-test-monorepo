import { execa } from 'execa';
import semver from 'semver';
import fs from 'fs/promises';

async function run() {
  console.log('Starting version bump process...');

  const { stdout: branchName } = await execa('git', [
    'rev-parse',
    '--abbrev-ref',
    'HEAD',
  ]);
  console.log('Current branch:', branchName);

  const packageJsonPath = 'packages/core/package.json';
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

  const currentVersion = packageJson.version;
  console.log('Current version:', currentVersion);

  const { stdout: currentCommitHash } = await execa('git', [
    'rev-parse',
    'HEAD',
  ]);
  console.log('Current commit hash:', currentCommitHash);

  const { stdout: lastCommitMessage } = await execa('git', [
    'log',
    '--format=%B',
    '-n',
    '1',
  ]);

  let nextVersion;

  if (branchName === 'release') {
    console.log('Branch: release');
    nextVersion = semver.inc(currentVersion, 'minor');
  } else {
    console.log('Branch: master');
    const prereleaseComponents = semver.prerelease(currentVersion);
    const isBumpBeta = lastCommitMessage.trim().endsWith('[BUMP BETA]');
    console.log('isBumpBeta', isBumpBeta);

    if (
      prereleaseComponents &&
      prereleaseComponents.includes('beta') &&
      !isBumpBeta
    ) {
      nextVersion = semver.inc(currentVersion, 'prerelease', 'beta');
    } else {
      console.log('Bumping minor versoin for beta release');
      const nextMinorVersion = semver.inc(currentVersion, 'minor');
      nextVersion = `${semver.major(nextMinorVersion)}.${semver.minor(
        nextMinorVersion
      )}.0-beta.0`;
    }
  }

  if (!nextVersion) {
    throw new Error('Could not determine next version');
  }

  console.log('Next version:', nextVersion);

  const versionInfo = { version: nextVersion, commit: currentCommitHash };
  await fs.writeFile('./version.json', JSON.stringify(versionInfo, null, 2));
  console.log('Version info saved to version.json');

  // Todo: Do we really need to run the build command here?
  // Maybe we need to hook the netlify deploy preview
  // await execa('yarn', ['run', 'build']);
  // console.log('Build command completed');

  console.log('Committing and pushing changes...');
  await execa('git', ['add', '-A']);
  await execa('git', [
    'commit',
    '-m',
    'chore(version): version.json [skip ci]',
  ]);
  await execa('git', ['push', 'origin', branchName]);

  console.log('Setting the version using lerna...');

  // add a message to the commit to indicate that the version was set using lerna
  await execa('npx', [
    'lerna',
    'version',
    nextVersion,
    '--yes',
    '--force-publish',
    '--message',
    'chore(version): Update package versions [skip ci]',
  ]);
  console.log('Version set using lerna');

  // Publishing each package, if on master/main branch publish beta versions
  // otherwise publish latest

  if (branchName === 'release') {
    await execa('npx', [
      'lerna',
      'publish',
      'from-package',
      '--no-verify-access',
      '--yes',
    ]);
  } else {
    await execa('npx', [
      'lerna',
      'publish',
      'from-package',
      '--no-verify-access',
      '--yes',
      '--dist-tag',
      'beta',
    ]);
  }

  console.log('Finished');
}

run().catch((err) => {
  console.error('Error encountered during version bump:', err);
  process.exit(1);
});
