const path = require('path');
const FileSignature = require('../file-signature');
const dir = path.join(__dirname, 'file-signature');
/**
express multer插件 的file格式 
{ file:
   [ { fieldname: 'file',
       originalname: 'v2-f5b222e6368ba7febcca5510f8fc99bd_is.jpg',
       encoding: '7bit',
       mimetype: 'image/jpeg',
       destination: 'D:\\WebSite\\.tmp',
       filename: '9894d75c0df4669177b90a05c3e89b5f',
       path: 'D:\\WebSite\\.tmp\\9894d75c0df4669177b90a05c3e89b5f',
       size: 762 } ] }
 */
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
  'bmp.bmp',
  'jpeg.jpeg',
];
for (let i = 0; i < files.length; i++) {
  let fsg = FileSignature.getSignature(`${dir}/${files[i]}`);
  console.log(fsg, 'signature');
}


process.exit();