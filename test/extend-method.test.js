const assert = require('assert');
const validator = require('../index');

class validator2 extends validator {
  constructor(params) {
    super(params);
    this.holder = 'test';
  }
  custom(arg) {
    return arg == 'a';
  }
}

describe('测试字段检查', function () {
  it('custom method success', () => {
    const validation = new validator2({
      rules: {
        other: 'method:custom'
      }
    });
    const res = validation.validate({ other: 'a' });
    assert.deepEqual(res, { other: 'a' });
  });
  it('custom method fail', () => {
    const validation = new validator2({
      rules: {
        other: 'method:custom'
      }
    });
    try {
      validation.validate({ other: 'b' });
    } catch (err) {
      assert.equal(err.field, 'other');
      assert.equal(err.rule, 'method');
      assert.equal(err.value, 'custom');
    }
  });
});