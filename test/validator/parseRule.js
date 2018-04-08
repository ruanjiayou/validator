const assert = require('assert');
const Validator = require('../../index');

describe('测试_str2rule()', function () {
  it('测试_str2rule()', function () {
    let rule1 = Validator._str2rule('required');
    assert.deepEqual(rule1, {
      required: true
    });
    let rule2 = Validator._str2rule('nullable|int');
    assert.deepEqual(rule2, {
      nullable: true,
      int: true,
      range: {
        min: -Infinity,
        max: Infinity,
        includeBottom: true,
        includeTop: true
      }
    });
    let rule3 = Validator._str2rule('required|string|enum:pending,success, fail');
    assert.deepEqual(rule3, {
      required: true,
      string: true,
      length: {
        minlength: 0,
        maxlength: 255
      },
      enum: ['pending', 'success', 'fail']
    });
    let rule4 = Validator._str2rule('boolean');
    assert.deepEqual(rule4, {
      required: true,
      boolean: true
    });
    let rule5 = Validator._str2rule('date');
    assert.deepEqual(rule5, {
      required: true,
      date: true
    });
    let rule6 = Validator._str2rule('dateonly');
    assert.deepEqual(rule6, {
      required: true,
      dateonly: true
    });
    let rule7 = Validator._str2rule('timeonly');
    assert.deepEqual(rule7, {
      required: true,
      timeonly: true
    });
    let rule8 = Validator._str2rule('int|min:0|max:20');
    assert.deepEqual(rule8, {
      required: true,
      int: true,
      range: {
        min: 0,
        max: 20,
        includeBottom: true,
        includeTop: true
      }
    });
    let rule9 = Validator._str2rule('float|range:[10,20)');
    assert.deepEqual(rule9, {
      required: true,
      float: true,
      range: {
        min: 10,
        max: 20,
        includeBottom: true,
        includeTop: false
      }
    });
    let rule10 = Validator._str2rule('text|minlength:10|maxlength:20');
    assert.deepEqual(rule10, {
      required: true,
      text: true,
      length: {
        minlength: 10,
        maxlength: 20
      }
    });
    let rule11 = Validator._str2rule('text|length:20,30');
    assert.deepEqual(rule11, {
      required: true,
      text: true,
      length: {
        minlength: 20,
        maxlength: 30
      }
    });
  });
});