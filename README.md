# validator
[![Build Status](https://travis-ci.org/ruanjiayou/validator.svg)](https://travis-ci.org/ruanjiayou/validator)
[![Coverage Status](https://coveralls.io/repos/github/ruanjiayou/validator/badge.svg?branch=master)](https://coveralls.io/github/ruanjiayou/validator?branch=master)
[![](https://img.shields.io/npm/dm/validater-max.svg)](https://www.npmjs.com/package/validater-max)
验证restful API接口的参数(Verify the restful API interface parameters)

## 安装方式
```
npm install https://github.com/ruanjiayou/validator.git --save
```
## 使用案例
```js
// 特别注意:methods中不能用箭头函数,this是指向validator实例的,validator有一些基本的内置方法(isInt,isFloat等)
// express项目,路由中验证参数
const validator = require('validater-max');
const validation = new validater({
  // lang: 'zh-cn', //设置语言
  rules: {
    id: 'required|int',
    time: 'required|date',
    status: 'required|enum:pending,success,fail',
    IDCard: 'required|methods:isIDCard18,other'
  },
  methods: {
    isIDCard18: function(v) {
      return this.isID(v);
    },
    other: function(v) {
      // ... 自定义验证,返回boolean值
    }
  }
});
// 方式一
const input = validation.filter(req.body);
try {
  validation.check(input);
  // ... 业务代码
} catch(err) {
  return next(err);
}
// 方式二
try {
  const input = validation.validate(req.body);
  // ... 业务代码
} catch(err) {
  next(err);
}
```

## 模块说明
```
删除了代码中的逻辑验证.不要瞎jb写 required|nullable,min:abc,require少个d,range:(20,10),methods:fn1,,fn2等等乱七八的东西
required,nullable,empty,nonzero的区别:required,值不能为undefined;nullable,值可以为null,empty,值可以为空字符串;(empty:专门为前端准备,有些人就是要传id=&search=&time=);nonzero,不能是0或'0' '000'
file类型: 可以为文件对象,可以为字符串
一.内置字段类型(小写)
  元类型: boolean/enum/int/float/object/array/string/url/email/date/dateonly/timeonly/file/methods/IDCard/creditCard
  限制类型两大类:required/nullable/empty/nonzero/ignore/default/alias/min/max/length/minlength/maxlength/if
  说明:联合使用要求,min/max和int/float,minlength/maxlength/length和string
  int/float默认{m:10,n:2}
二.内置判断方法
  isUrl()/isDate()/isInt()/isFloat()/isEmail()/isID()/isCredit()/isString()/isChar()/isFile()
三.其他成员函数说明
  1) error() 统一错误处理,抛出异常
  2) filter() 滤除参数中额外的字段
  3) check() 对参数中指定的字段进行验证
  4) validate() 集成了filter()和check()的功能
  5) _str2rule() 将某个字段简约的字符串规则转化为详细的规则对象
  6) parse() 对所有的字段使用_str2rule()
  7) compile() 简单模板替换
```