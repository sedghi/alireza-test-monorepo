const execa = require('execa');
const semver = require('semver');
const fs = require('fs').promises;

async function run() {
  const { stdout: branchName } = await execa.command(
    'git rev-parse --abbrev-ref HEAD'
  );
  const packageJsonPath = 'platform/app/package.json';
  const packageJson = require(`./${packageJsonPath}`);
  const currentVersion = packageJson.version;
  const { stdout: currentCommitHash } = await execa.command(
    'git rev-parse HEAD'
  );
  let nextVersion;

  if (branchName === 'release') {
    // In release branch, bump the minor version
    nextVersion = semver.inc(currentVersion, 'minor');
  } else {
    // In any other branch, bump the beta version
    const nextMinorVersion = semver.inc(currentVersion, 'minor');
    nextVersion = semver.inc(nextMinorVersion, 'prerelease', 'beta');
  }

  // Write the version and commit hash to a file
  const versionInfo = { version: nextVersion, commit: currentCommitHash };
  await fs.writeFile(
    './public/version.json',
    JSON.stringify(versionInfo, null, 2)
  );

  // Run build command
  await execa.command('npm run build');

  // Set the version using lerna
  await execa.command(
    `npx lerna version ${nextVersion} --no-git-tag-version --no-push --yes`
  );

  // Publish to GitHub
  await execa.command('git add -A');
  await execa.command(`git commit -m "Bump version to ${nextVersion}"`);
  await execa.command('git push origin HEAD');

  // Publish each package
  await execa.command('npx lerna publish from-git --yes');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
