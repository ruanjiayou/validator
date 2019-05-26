const assert = require('assert');
const validator = require('../index');

describe('测试字段检查', function () {
  it('member function', () => {
    const validation = new validator({
      rules: {}
    });
    let res = false;
    res = validation.isUrl('http://www.google.com/path/file.txt?search=test&q=1#aaa');
    assert.equal(res, true);
    res = validation.isFloat('-1.0');
    assert.equal(res, true);
    res = validation.isEmail('test@gmail.com');
    assert.equal(res, true);
    res = validation.isString('a');
    assert.equal(res, true);
    res = validation.isChar('abc123');
    assert.equal(res, true);
    res = validation.isChar('\u9564');
    assert.equal(res, false);
    res = validation.isFile({});
    assert.equal(res, false);
    res = validation.isFile('');
    assert.equal(res, false);
  });
  it('1.required', () => {
    const validation = new validator({
      rules: {
        name: 'required|string'
      }
    });
    // 字符串 ==> 正常
    const i1 = validation.validate({ name: 'ruan' });
    assert.deepEqual(i1, { name: 'ruan' });
    // 空字符串 ==> 必填
    try {
      validation.validate({ name: '' });
    } catch (err) {
      assert.equal('name', err.field);
      assert.equal('required', err.rule);
    }
    // null ==> 必填
    try {
      validation.validate({ name: null });
    } catch (err) {
      const i3 = err;
      assert.deepEqual(i3.message, 'name 字段不能为null!');
    }
    // undefined ==> 必填
    try {
      validation.validate({ name: undefined });
    } catch (err) {
      const i4 = err;
      assert.deepEqual(i4.message, 'name 字段不能为undefined!');
    }
    // ==> 必填
    try {
      validation.validate({});
    } catch (err) {
      const i5 = err;
      assert.deepEqual(i5.message, 'name 字段不能为undefined!');
    }
    // 数组 ==> 正常
    const i6 = validation.validate({ name: [] });
    assert.deepEqual(i6, { name: [] });
  });
  it('2.nullable', () => {
    const validation = new validator({
      rules: {
        memberId: 'int|nullable',
        name: 'string|nullable'
      }
    });
    // ==> 正常
    const i1 = validation.validate({ memberId: null, name: null });
    assert.deepEqual(i1, { memberId: null, name: null });
    // 可选 ==> 正常
    const i2 = validation.validate({ memberId: '1' });
    assert.deepEqual(i2, { memberId: 1 });
  });
  it('3.empty', () => {
    const validation = new validator({
      rules: {
        description: 'required|string|empty',
        name: 'required|string'
      }
    });
    // empty '' => 正常
    const i1 = validation.validate({ name: 'ruan', description: '' });
    assert.deepEqual(i1, { name: 'ruan', description: '' });
    // '' => 必填
    try {
      validation.validate({ name: '', description: '' });
    } catch (err) {
      assert.equal(err.field, 'name');
      assert.equal(err.rule, 'required');
    }
  });
  it('boolean', () => {
    const validation = new validator({
      rules: {
        approved: 'boolean'
      }
    });
    const i1 = validation.validate({ approved: '1' });
    const i2 = validation.validate({ approved: 1 });
    const i3 = validation.validate({ approved: 'true' });
    const i4 = validation.validate({ approved: 'TRUE' });
    const i5 = validation.validate({ approved: true });
    const i6 = validation.validate({ approved: null });
    const i7 = validation.validate({ approved: undefined });
    const i8 = validation.validate({ approved: false });
    const i9 = validation.validate({ approved: 0 });
    assert.deepEqual(i1, { approved: true });
    assert.deepEqual(i2, { approved: true });
    assert.deepEqual(i3, { approved: true });
    assert.deepEqual(i4, { approved: true });
    assert.deepEqual(i5, { approved: true });
    assert.deepEqual(i6, { approved: false });
    assert.deepEqual(i7, { approved: false });
    assert.deepEqual(i8, { approved: false });
    assert.deepEqual(i9, { approved: false });
  });
  it('4.int', () => {
    const validation = new validator({
      rules: {
        id: 'int'
      }
    });
    // ==> 正常
    const i1 = validation.validate({ id: 1 });
    assert.deepEqual(i1, { id: 1 })
    // 数值字符串 ==> 正常
    const i2 = validation.validate({ id: '2' });
    assert.deepEqual(i2, { id: 2 });
    // 无required undefined ==> 正常 null/'' 错误
    try {
      const i3 = validation.validate({ id: null });
      assert.deepEqual(i3, {});
    } catch (err) {
      assert.equal(err.field, 'id');
      assert.equal(err.rule, 'int');
    }
    try {
      const i5 = validation.validate({ id: '' });
      assert.deepEqual(i5, {});
    } catch (err) {
      assert.equal(err.field, 'id');
      assert.equal(err.rule, 'int');
    }
    const i4 = validation.validate({ id: undefined });
    assert.deepEqual(i4, {});

    try {
      validation.validate({ id: 'a' })
    } catch (err) {
      assert.equal(err.field, 'id');
      assert.equal(err.rule, 'int');
    }
  });
  it('5.float', () => {
    const validation = new validator({
      rules: {
        price: 'float:9,2|min:-100|max:+100.00',
        weight: 'float',
      }
    });
    const i1 = validation.validate({ price: +100 });
    assert.deepEqual(i1, { price: 100 });
    const i2 = validation.validate({ price: 100.000 });
    assert.deepEqual(i2, { price: 100 });
    try {
      validation.validate({ price: -100 });
    } catch (err) {
      assert.deepEqual(err.field, 'price');
      assert.deepEqual(err.rule, 'min')
    }
    const i4 = validation.validate({ price: '+100' });
    assert.deepEqual(i4, { price: '100' });
    const i5 = validation.validate({});
    try {
      const i6 = validation.validate({ price: 99.123 });
    } catch (err) {
      assert.deepEqual(err.field, 'price');
      assert.deepEqual(err.rule, 'float.n');
    }
    try {
      const i7 = validation.validate({ price: 1234567890 });
    } catch (err) {
      assert.deepEqual(err.field, 'price');
      assert.deepEqual(err.rule, 'float.m');
    }
    try {
      const i8 = validation.validate({ weight: 18 });
      console.log(i8)
    } catch (err) {
      console.log(err);
    }
  });
  it('6.min', () => {
    const validation = new validator({
      rules: {
        age: 'int|min:12'
      }
    });
    const i1 = validation.validate({ age: 12 });
    assert.deepEqual(i1, { age: 12 });
    try {
      const i2 = validation.validate({ age: 11 });
    } catch (err) {
      assert.equal(err.field, 'age');
      assert.equal(err.rule, 'min');
    }
  });
  it('7.max', () => {
    const validation = new validator({
      rules: {
        age: 'int|max:100'
      }
    });
    const i1 = validation.validate({ age: 100 });
    assert.deepEqual(i1, { age: 100 });
    try {
      const i2 = validation.validate({ age: 101 });
    } catch (err) {
      assert.equal(err.field, 'age');
      assert.equal(err.rule, 'max');
    }
  });
  it('8.array', () => {
    const validation = new validator({
      rules: {
        images: 'array',
        urls: 'array|minlength:1'
      }
    });
    const i1 = validation.validate({});
    assert.deepEqual(i1, {});
    const i2 = validation.validate({ images: [] });
    assert.deepEqual(i2, { images: [] });
    const i3 = validation.validate({ images: ['a'] });
    assert.deepEqual(i3, { images: ['a'] });
    const i4 = validation.validate({ urls: ['xxx'] });
    assert.deepEqual(i4, { urls: ['xxx'] });
    try {
      const i5 = validation.validate({ urls: [] });
    } catch (err) {
      assert.equal(err.field, 'urls');
      assert.equal(err.rule, 'minlength');
    }
  });
  /**
   * minlength maxlength
   */
  it('9.minlength', () => {
    const validation = new validator({
      rules: {
        password: 'char|minlength:6'
      }
    });
    const i1 = validation.validate({ password: '123456' });
    assert.deepEqual(i1, { password: '123456' });
    try {
      const i3 = validation.validate({ password: '12345' });
    } catch (err) {
      assert.equal(err.field, 'password');
      assert.equal(err.rule, 'minlength');
    }
  });
  it('10.maxlength', () => {
    const validation = new validator({
      rules: {
        password: 'char|maxlength:12'
      }
    });
    const i1 = validation.validate({ password: '123456123456' });
    assert.deepEqual(i1, { password: '123456123456' });
    try {
      const i2 = validation.validate({ password: '1234561234567' });
    } catch (err) {
      assert.equal(err.field, 'password');
      assert.equal(err.rule, 'maxlength');
    }
  });
  it('11.email', () => {

  });
  it('12.url', () => {

  });
  it('13.enmu', () => {
    const validation = new validator({
      rules: {
        status: 'enum:pending,success,fail'
      }
    });
    const i1 = validation.validate({ status: 'pending' });
    assert.deepEqual(i1, { status: 'pending' });
    try {
      const i2 = validation.validate({ status: 'xxx' });
      assert.deepEqual(i2, { status: 'xxx' });
    } catch (err) {
      assert.equal(err.field, 'status');
      assert.equal(err.rule, 'enum');
    }
  });
  it('14.date', () => {
    const validation = new validator({
      rules: {
        createdAt: 'date'
      }
    });
    const i1 = validation.validate({ createdAt: '2018-06-14T09:55:38.000Z' });
    assert.deepEqual(i1, { createdAt: '2018-06-14T09:55:38.000Z' });
  });
  it('15.dateonly', () => {
    const validation = new validator({
      rules: {
        createdAt: 'dateonly'
      }
    });
    const i1 = validation.validate({ createdAt: '2018-06-14' });
    assert.deepEqual(i1, { createdAt: '2018-06-14' });
  });
  it('16.timeonly', () => {
    const validation = new validator({
      rules: {
        createdAt: 'timeonly'
      }
    });
    const i1 = validation.validate({ createdAt: '17:57:52' });
    assert.deepEqual(i1, { createdAt: '17:57:52' });
  });
  it('17.IDCard', () => {
    const validation = new validator({
      rules: {
        id: 'IDCard'
      }
    });
    const i1 = validation.validate({ id: '37132619880717015X' });
    assert.deepEqual(i1, { id: '37132619880717015X' });
    try {
      const i2 = validation.validate({ id: '371326198807170151' });
    } catch (err) {
      assert.equal(err.field, 'id');
      assert.equal(err.rule, 'IDCard');
    }

  });
  it('18.creditCard', () => {
    const validation = new validator({
      rules: {
        creditCard: 'creditCard'
      }
    });
    const i1 = validation.validate({ creditCard: '6212264000053084147' });
    assert.deepEqual(i1, { creditCard: '6212264000053084147' });
    try {
      const i2 = validation.validate({ creditCard: '6212264000053084146' });
    } catch (err) {
      assert.equal(err.field, 'creditCard');
      assert.equal(err.rule, 'creditCard');
    }
  });
  it('19.file', () => {
    const validation = new validator({
      rules: {
        upload: 'file|required'
      }
    });
    const data = validation.validate({
      upload: [{
        fieldname: 'upload',
        originalname: 'index.html',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        destination: process.cwd(),
        filename: 'index.js',
        path: process.cwd() + '/index.js',
        size: 1856
      }]
    });
    console.log(data);
  });
  /**
   * if?
   */
  it('21.default', () => {
    const validation = new validator({
      rules: {
        createdAt: 'required|date|default:datetime',
        d0: 'required|default:0',
        d1: 'required|default:1',
        dtrue: 'required|default:true',
        dfalse: 'required|default:false',
        dnull: 'required|default:null',
        origin: 'required|string|default:""',
        content: 'required|string|default:"123"',
        ts: 'required|int|default:timestamp',
        ms: 'required|int|default:unix',
        today: 'required|date|default:today',
        tonight: 'required|date|default:tonight',
        images: 'required|array|default:array',
        json: 'required|object|default:object'
      }
    });
    const input = { origin: 'http' };
    const data = validation.validate(input);
    assert.equal(data.origin, 'http');
    assert.equal(data.content, '123');
    assert.strictEqual(data.d0, 0);
    assert.strictEqual(data.d1, 1);
    assert.strictEqual(data.dtrue, true);
    assert.strictEqual(data.dfalse, false);
    assert.strictEqual(data.dnull, null);
  });
  it('22.format', () => {
    const validation = new validator({
      rules: {
        images: 'required|array|default:array|format:string',
        json: 'required|object|default:object|format:string',
      }
    });
    const data = validation.validate({
      images: ['abc'],
      json: { test: 'abc' },
    });
    assert.equal(data.images, '["abc"]');
    assert.equal(data.json, '{"test":"abc"}');
  });
  it('23.alias', () => {
    const validation = new validator({
      rules: {
        name: 'required|string|alias:wx_%'
      }
    });
    const data = validation.validate({ name: 'max' });
    assert.equal(data.wx_name, 'max');
  });
  it('24.ignore', () => {
    const validation = new validator({
      rules: {
        age: 'int|ignore'
      }
    });
    const data = validation.validate({ age: 'abc' });
    assert.deepEqual(data, {});
  });
});