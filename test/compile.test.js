const assert = require('assert');
const validator = require('../index');

describe('测试编译提示错误模板', function () {
  it('测试compile()', function () {
    let str = validator.compile('123{{test}}345', { test: 'abc' });
    assert.equal(str, '123abc345');
  });
  it('测试compile() 空格', function () {
    let str = validator.compile('1{{test}}2{{ test}}3{{test }}4{{ test }}', { test: 'abc' });
    assert.equal(str, '1abc2abc3abc4abc');
  });
  it('测试compile() 无数据', function () {
    let str = validator.compile('123{{test}}345', {});
    assert.equal(str, '123 ?? 345');
  });
});