module.exports = {
  testDir: './tests',
  reporter: 'html',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};