

const yaml = require('js-yaml');
const fs = require('fs');

const args = process.argv.slice(2);

switch (args[0]) {
  case 'watch':
    watch();
    break;
  default:
    convert();
}

function watch() {
  fs.watch('./settings.yaml', function (event, filename) {
    require('child_process').fork('./yaml-convert.js');
  });
}

function convert() {
  try {
    const json = yaml.load(fs.readFileSync('./settings.yaml', 'utf8'));
    fs.writeFileSync('./src/settings.json', JSON.stringify(json));
  } catch (e) {
    console.log(e);
  }
}
