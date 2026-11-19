const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'image-size',
  'dist',
  'cjs',
  'index.js',
);

if (fs.existsSync(target)) {
  let code = fs.readFileSync(target, 'utf8');
  code = code.split('/* METRO_PATCH */')[0].split('const nodeFs')[0];
  code += `
/* METRO_PATCH */
var nodeFs = require("fs");
var origImageSize = lookup_1.imageSize;
function imageSizeWrapper(input) {
  if (typeof input === "string") {
    return origImageSize(nodeFs.readFileSync(input));
  }
  return origImageSize(input);
}
module.exports = imageSizeWrapper;
module.exports.imageSize = imageSizeWrapper;
module.exports.default = imageSizeWrapper;
module.exports.disableTypes = lookup_1.disableTypes;
module.exports.types = types_1.types;
`;
  fs.writeFileSync(target, code, 'utf8');
  console.log('Successfully patched image-size for Metro compatibility');
}
