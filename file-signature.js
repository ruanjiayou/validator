const fs = require('fs');
const SignatureDatas = require('./signature-data');

class FileSignature {
  constructor() {

  }
  /**
   * 判断两个buff是否相等
   * @param {buffer} buff1 
   * @param {buffer} buff2 
   * @returns boolean
   */
  static bufferIsEqual(buf1, buf2) {
    var i = buf1.length - 1;
    if (buf1.length !== buf2.length)
      return false;
    for (; i >= 0; i--)
      if (buf1[i] !== buf2[i])
        return false;
    return true;
  }
  /**
   * 获取文件头信息
   * @param 文件头buffer|string
   * @returns 文件头信息json
   */
  getSignature(fileHeader) {
    if (typeof fileHeader === 'string') {
      fileHeader = this.getFileHeader(fileHeader);
    }
    for (let i = SignatureDatas.length - 1; i >= 0; i--) {
      let signature = SignatureDatas[i];
      if (FileSignature.bufferIsEqual(fileHeader.slice(0, signature.byteSeq.length), signature.byteSeq)) {
        return {
          extension: signature.extension,
          description: signature.description || '',
          mimeType: signature.mimeType.mime || 'application/octet-stream'
        };
      }
    }
  }
  /**
   * 获取指定文件的文件头
   * @param {string} path 文件路径
   * @returns buffer
   */
  getFileHeader(path) {
    var fd, buf = new Buffer(256);
    fd = fs.openSync(path, 'r');
    fs.readSync(fd, buf, 0, buf.length, 0);
    fs.closeSync(fd);
    return buf;
  }
}

module.exports = new FileSignature();