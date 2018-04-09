const assert = require('assert');
const Validator = require('../../index');

describe('测试字段过滤filter()', function () {
  it('测试filter()', function () {
    let validator = new Validator({
      rules: {
        id: 'int|min:1',
        status: 'enum:pending,success,fail',
        address: 'string',
        type: 'nullable|enum:male,female',
        isApproved1: 'boolean',
        isApproved2: 'boolean',
        isApproved3: 'boolean',
        isApproved4: 'boolean',
        isApproved5: 'boolean',
        isApproved6: 'boolean'
      }
    });
    let res = validator.filter({
      id: 1,
      status: 'success',
      address: 'xxxx',
      other: 'fsdfd',
      isApproved1: 0,
      isApproved2: '0',
      isApproved3: 1,
      isApproved4: '1',
      isApproved5: false,
      isApproved6: true
    });
    assert.deepEqual(res, {
      id: 1,
      status: 'success',
      address: 'xxxx',
      isApproved1: false,
      isApproved2: false,
      isApproved3: true,
      isApproved4: true,
      isApproved5: false,
      isApproved6: true
    });
  });
});