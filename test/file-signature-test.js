const path = require('path');
const FileSignature = require('../file-signature');
const dir = path.join(__dirname, 'file-signature');

// console.log(`${dir}/dll.dll`, 'path');  // D:\MyGitHub\validator\test/dll.dll
let files = [
  'dll.dll',
  'doc.doc',
  'gif.gif',
  'htpasswd',
  'jpg.jpg',
  'ogg.ogg',
  'pdf.pdf',
  'png.png',
  'rar.rar',
  'wav.wav',
];
for (let i = 0; i < files.length; i++) {
  let fsg = FileSignature.getSignature(`${dir}/${files[i]}`);
  console.log(fsg, 'signature');
}


process.exit();