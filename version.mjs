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

  let nextVersion;

  if (branchName === 'release') {
    console.log('Branch: release');
    nextVersion = semver.inc(currentVersion, 'minor');
  } else {
    console.log('Branch: master');
    const prereleaseComponents = semver.prerelease(currentVersion);
    if (prereleaseComponents && prereleaseComponents.includes('beta')) {
      nextVersion = semver.inc(currentVersion, 'prerelease', 'beta');
    } else {
      const nextMinorVersion = semver.inc(currentVersion, 'minor');
      nextVersion = `${semver.major(nextMinorVersion)}.${semver.minor(
        nextMinorVersion
      )}.0-beta.1`;
    }
  }

  if (!nextVersion) {
    throw new Error('Could not determine next version');
  }

  console.log('Next version:', nextVersion);

  const versionInfo = { version: nextVersion, commit: currentCommitHash };
  await fs.writeFile('./version.json', JSON.stringify(versionInfo, null, 2));
  console.log('Version info saved to version.json');

  console.log('Running build command...');
  await execa('npm', ['run', 'build']);
  console.log('Build command completed');

  console.log('Setting the version using lerna...');
  await execa('npx', [
    'lerna',
    'version',
    nextVersion,
    '--yes',
    '--force-publish',
  ]);
  console.log('Version set using lerna');

  console.log('Committing and pushing changes...');
  await execa('git', ['add', '-A']);
  await execa('git', [
    'commit',
    '-m',
    `chore(version): Bump version to ${nextVersion}`,
  ]);
  await execa('git', ['push', 'origin', branchName]);
  console.log('Changes committed and pushed');

  // Publishing each package
  // await execa('npx', ['lerna', 'publish', 'from-git', '--yes']);

  console.log('Version bump process completed successfully');
}

run().catch((err) => {
  console.error('Error encountered during version bump:', err);
  process.exit(1);
});
