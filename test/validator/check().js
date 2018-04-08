const assert = require('assert');
const Validator = require('../../index');

describe('测试字段检查', function () {
  it('测试check()', function () {
    let validator = new Validator({
      rules: {
        status: 'required|enum:pending,success,fail',
        isApproved: 'required|boolean',
        age: 'required|int|range:[1,200]',
        name: 'required|string|length:[6,16]',
        sex: 'nullable|enum:male,female'
      }
    });
    let input = validator.validate({
      status: 'success',
      isApproved: false,
      age: 18,
      name: 'ruanjiayou'
    });
    assert.deepEqual(input, {
      status: 'success',
      isApproved: false,
      age: 18,
      name: 'ruanjiayou'
    });
  });
});