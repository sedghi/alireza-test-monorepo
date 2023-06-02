import { execa } from 'execa';
import semver from 'semver';
import fs from 'fs/promises';

async function run() {
  const { stdout: branchName } = await execa('git', [
    'rev-parse',
    '--abbrev-ref',
    'HEAD',
  ]);
  // const branchName = 'release';
  const packageJsonPath = 'packages/core/package.json';
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

  const currentVersion = packageJson.version;
  const { stdout: currentCommitHash } = await execa('git', [
    'rev-parse',
    'HEAD',
  ]);
  let nextVersion;

  if (branchName === 'release') {
    // In release branch, bump the minor version which means if current version
    // of the code is 3.4.0 then the next version will be 3.5.0
    nextVersion = semver.inc(currentVersion, 'minor');
  } else {
    // In the master branch,
    const prereleaseComponents = semver.prerelease(currentVersion);
    if (prereleaseComponents && prereleaseComponents.includes('beta')) {
      // If current version is beta, bump the prerelease version
      nextVersion = semver.inc(currentVersion, 'prerelease', 'beta');
    } else {
      // if current version is not beta, and we are in master branch, then
      // bump the minor and reset the patch and start from beta.1
      const nextMinorVersion = semver.inc(currentVersion, 'minor');
      nextVersion = `${semver.major(nextMinorVersion)}.${semver.minor(
        nextMinorVersion
      )}.0-beta.1`;
    }
  }

  if (!nextVersion) {
    throw new Error('Could not determine next version');
  }

  // Write the version and commit hash to a file
  const versionInfo = { version: nextVersion, commit: currentCommitHash };
  await fs.writeFile('./version.json', JSON.stringify(versionInfo, null, 2));

  // Run build command so that the version info is included in the build
  //
  await execa('npm', ['run', 'build']);

  // Set the version using lerna
  await execa('npx', [
    'lerna',
    'version',
    nextVersion,
    '--yes',
    '--force-publish',
  ]);

  // Publish to GitHub
  await execa('git', ['add', '-A']);
  await execa('git', [
    'commit',
    '-m',
    `chore(version): Bump version to ${nextVersion}`,
  ]);

  // push to the same branch name
  await execa('git', ['push', 'origin', branchName]);

  // Publish each package
  // await execa('npx', ['lerna', 'publish', 'from-git', '--yes']);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
