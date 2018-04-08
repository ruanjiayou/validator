# validator
验证restful API接口的参数(Verify the restful API interface parameters)
file-signature的参考地址:https://github.com/leahciMic/file-signature
今后的更改与 https://github.com/ruanjiayou/header-helper 保持一致
## 安装方式
```
npm install https://github.com/ruanjiayou/validator.git --save
```
## 使用案例
```js
// 特别注意:methods中不能用箭头函数,this是指向validator实例的,Validator有一些基本的内置方法(isInt,isFloat等)
// express项目,路由中验证参数
const Validator = require('validator');
const validator = new Validator({
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
const input = validator.filter(req.body);
try {
  validator.check(input);
} catch(err) {
  return next(err);
}
// 业务代码
// 方式二
try {
  const input = validator.validate(req.body);
  // ... 业务代码
} catch(err) {
  next(err);
}
```

## 模块说明
```
删除了代码中的逻辑验证.不要瞎jb写 required|nullable,min:abc,require少个d,range:(20,10),methods:fn1,,fn2等等乱七八的东西
if规则和nullable的区别:nullable,data中没字段就不验证;if,为false时会主动删除data中的字段,然后功能就和nullable一样了
一.内置字段类型(小写)
  元类型: boolean/enum/int/float/string/text/url/email/date/dateonly/timeonly/file/methods
  限制类型两大类:nullable/required/min/max/rang/length/minlength/maxlength/if
  说明:联合使用要求,min/max/range和int/float,minlength/maxlength/length和string/text
  int/float默认range为[-Infinity,Infinity],string默认length为[0,255],text默认length为[0,Infinity]
二.内置判断方法
  isUrl/isDate/isInt/isFloat/isEmail/isID/isCredit/isString/isChar/isFile
三.其他成员函数说明
  1) error() 生成统一错误
  2) filter() 滤除参数中额外的字段
  3) check() 对参数中指定的字段进行验证
  4) validate() 集成了filter()和check()的功能
  5) _str2rule() 将某个字段简约的字符串规则转化为详细的规则对象
  6) parse() 对所有的字段使用_str2rule()
```
