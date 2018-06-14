const assert = require('assert');
const validater = require('../../index').validater;
const validation = new validater();

describe('测试_str2rule()', function () {
  it('测试_str2rule()', function () {
    let rule1 = validation._str2rule('required|int');
    assert.deepEqual(rule1, {
      required: true,
      int: true
    });
    let rule2 = validation._str2rule('nullable|int');
    assert.deepEqual(rule2, {
      nullable: true,
      int: true
    });
    let rule3 = validation._str2rule('required|string|enum:pending,success, fail');
    assert.deepEqual(rule3, {
      required: true,
      string: true,
      enum: new Set(['pending', 'success', 'fail'])
    });
    let rule4 = validation._str2rule('boolean');
    assert.deepEqual(rule4, {
      boolean: true
    });
    let rule5 = validation._str2rule('date');
    assert.deepEqual(rule5, {
      date: true
    });
    let rule6 = validation._str2rule('dateonly');
    assert.deepEqual(rule6, {
      dateonly: true
    });
    let rule7 = validation._str2rule('timeonly');
    assert.deepEqual(rule7, {
      timeonly: true
    });
    let rule8 = validation._str2rule('int|min:0|max:20');
    assert.deepEqual(rule8, {
      int: true,
      min: 0,
      max: 20,
    });
    let rule9 = validation._str2rule('float|min:10|max:20');
    assert.deepEqual(rule9, {
      float: {
        m: 10,
        n: 2
      },
      min: 10,
      max: 20,
    });
    let rule10 = validation._str2rule('char|minlength:10|maxlength:20');
    assert.deepEqual(rule10, {
      char: true,
      minlength: 10,
      maxlength: 20
    });
    let rule11 = validation._str2rule('char|minlength:20|maxlength:30');
    assert.deepEqual(rule11, {
      char: true,
      minlength: 20,
      maxlength: 30
    });
    let rule12 = validation._str2rule('float:9,2');
    assert.deepEqual(rule12, {
      float: {
        m: 9,
        n: 2
      }
    });
    let rule13 = validation._str2rule('int|nonzero');
    assert.deepEqual(rule13, {
      int: true,
      nonzero: true
    })
  });
});