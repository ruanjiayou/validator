const _ = require('lodash');
const moment = require('moment');

const types = new Set(['required', 'nullable', 'empty', 'nonzero', 'minlength', 'maxlength', 'length', 'min', 'max', 'methods', 'array', 'char', 'string', 'enum', 'int', 'float', 'file', 'boolean', 'date', 'dateonly', 'timeonly', 'email', 'url', 'IDCard', 'creditCard']);
const atoms = new Set(['methods', 'array', 'char', 'string', 'enum', 'int', 'float', 'file', 'boolean', 'date', 'dateonly', 'timeonly', 'email', 'url', 'IDCard', 'creditCard']);
const bools = new Set([1, '1', true, 'true', 'TRUE']);
const messages = {
  'zh-cn': {
    'atom': '{{field}} 字段规则没有基本类型',
    'required': '{{field}} 字段不能为{{value}}!',
    'url': '{{field}} 字段的值 {{data}} 不是有效的url!',
    'email': '{{field}} 字段的值 {{data}} 不是有效的邮件格式!',
    'date': '{{field}} 字段的值 {{data}} 不是有效的 日期时间 格式!',
    'dateonly': '{{field}} 字段的值 {{data}} 不是有效的日期格式!',
    'timeonly': '{{field}} 字段的值 {{data}} 不是有效的时间格式!',
    'custom': '{{data}} 不是 {{field}} 字段中 自定义的验证方法 {{value}}!',
    'methods': {},
    'int': '{{field}} 字段的值 {{data}} 必须是整数!',
    'float': '{{field}} 字段的值 {{data}} 不是有效的浮点数!',
    'float.m': '{{field}} 字段的值 {{data}} 数值过大!',
    'float.n': '{{field}} 字段的值 {{data}} 精确度过细!',
    'boolean': '{{field}} 字段的值 {{data}} 不是布尔类型!',
    'enum': '{{field}} 字段的值 {{data}} 不是{{rule}} 规则中 {{value}} 中的一种!',
    'min': '{{field}}的值最小为{{value}}!',
    'max': '{{field}}的值最大为{{value}}!',
    'minlength': '{{field}}的长度最小为{{value}}!',
    'maxlength': '{{field}}的长度最大为{{value}}!',
    'length': '{{field}}的长度不是{{value}}!',
    'file': '{{data}} 不是预期({{value}})的文件格式!'
  }
};
/**
 * 辅助函数
 * @param {string} str 
 * @param {string} sperator 分割符
 * @param {function} cb 回调函数
 */
function _str2arr(str, sperator = ',', cb) {
  return str.split(sperator).map((item) => {
    let res = item.trim();
    if (typeof cb === 'function') {
      res = cb(res);
    }
    return res;
  });
}
/**
 * nullable: 可以传null
 * empty: 可以传空字符串
 * required: true,不能是undefined;false,删除字段
 * nonzero: 不能是0
 */
class validater {
  /**
   * @param {object} o 参数: rules/[lang]/[methods]/[messages]
   * @param {string} lang 语言,默认zh-cn
   */
  constructor(o = {}) {
    this.lang = o.lang || 'zh-cn';
    this.rules = o.rules;
    this.messages = o.messages || messages[this.lang];
    this.methods = o.methods || {};
    this.rules = this.parse(this.rules);
    if (!_.isUndefined(o.hodler)) {
      this.holder = o.hodler;
    }
  }
  /**
   * 统一处理错误
   * @param {object} o 错误详情
   */
  error(o) {
    let err = new Error();
    if (typeof o === 'object') {
      _.assign(err, o);
      o = validater.compile(this.messages[o.rule], o);
    }
    err.message = o;
    err.validate = true;
    throw err;
  }
  set holder(v) {
    this.prototype.hodler = v;
  }
  /**
   * 将数据编译到模板中
   * @param {string} str 模板
   * @param {object} data 数据
   */
  static compile(str, data) {
    let reg = /\{\{\s*([a-z0-9]+)\s*\}\}/g, res = str, m = null;
    while ((m = reg.exec(str)) !== null) {
      let [k, v] = m, value = data[v] === undefined ? ' ?? ' : data[v];
      res = res.replace(k, value);
    }
    return res;
  }
  /**
   * 过滤并验证参数(综合filter()和check()两个函数)
   * @param {object} data 待校验数据
   */
  validate(data) {
    return this.check(this.filter(data));
  }
  /**
   * 按rules的字段,过滤额外的字段
   * @param {object} 原数据
   */
  filter(data) {
    let res = {};
    for (let k in this.rules) {
      res[k] = this.rules[k].boolean === true ? (bools.has(data[k]) ? true : false) : data[k];
    }
    return res;
  }
  /**
   * 字符串转规则对象
   * @param {string} str 字符串
   * @returns object 规则对象
   */
  _str2rule(str) {
    const arr = _str2arr(str, '|');
    let hasAtom = false;
    // 默认值处理
    let rule = {};
    for (let i = 0; i < arr.length; i++) {
      let str = arr[i];
      let [kv, k, v] = /^([a-zA-Z0-9]+)[:]?(.*)$/.exec(str.trim());
      if (!types.has(k)) {
        throw new Error(`参数验证中没有 ${k} 规则!`);
      }
      // 至少一个基本类型的检查
      if (hasAtom === false && atoms.has(k)) {
        hasAtom = true;
      }
      if ('file' === k) {
        rule.file = _str2arr(v);
      } else if ('methods' === k) {
        let that = this;
        rule.methods = {};
        _str2arr(v, ',', (name) => { rule.methods[name] = that.methods[name]; });
      } else if ('min' === k) {
        rule.min = parseFloat(v);
      } else if ('max' === k) {
        rule.max = parseFloat(v);
      } else if ('float' === k) {
        if (v.trim() === '') {
          rule.float = { m: 10, n: 2 };
        } else {
          const [m, n] = _str2arr(v, ',', (i) => { return parseInt(i); });
          rule.float = { m, n };
        }
      } else if ('minlength' === k) {
        rule.minlength = parseInt(v);
      } else if ('maxlength' === k) {
        rule.maxlength = parseInt(v);
      } else if ('length' === k) {
        rule.length = parseInt(v);
      } else if ('enum' === k) {
        rule.enum = new Set(_str2arr(v));
      } else {
        rule[k] = true;
      }
    }
    if (hasAtom === false) {
      throw new Error(`验证语法中必须要有基本类型!`);
    }
    return rule;
  }
  /**
   * 将简易字符串验证转化为增强对象
   * required|int|min:100|max:200  --> { required: true, int: true }
   * @param {object} 验证对象(简单字符串表达)
   * @returns object 验证对象(增强型对象)
   */
  parse(rules) {
    const res = {};
    for (let k in rules) {
      res[k] = this._str2rule(rules[k]);
    }
    return res;
  }
  /**
   * k: 字段, data: 
   * @param {object} data 数据
   * @returns 处理后的数据
   */
  check(data) {
    for (let k in this.rules) {
      let v = data[k], rule = this.rules[k];
      const err = { field: k, data: v, rule: '', value: '' };
      // undefined null '' 的处理:required处理undefined;nullable处理null;empty 处理 空字符串
      if (null === v && rule.nullable || v === '' && rule.empty) {
        continue;
      }
      // 0 '0' '0000'
      if (rule.nonzero && /^[0]+$/.test(v)) {
        err.rule = 'nonzero';
        this.error(err);
      }
      if (null === v || v === undefined || v === '') {
        if (rule.required) {
          err.rule = 'required';
          err.value = `${v}`;
          this.error(err);
        } else {
          delete data[k];
          continue;
        }
      }
      if (rule.int) {
        if (!this.isInt(v)) {
          err.rule = 'int';
          this.error(err);
        }
        v = parseInt(v);
      }
      if (rule.float) {
        err.rule = 'float';
        const mm = /^[-+]?((\d+)[.])?(\d+)$/.exec(v);
        if (null !== mm) {
          let n = mm[3].length, m = 0;
          if (undefined === mm[2]) {
            m = n;
            n = 0
          } else {
            m = mm[2].length + n;
          }
          if (m > rule.float.m) {
            err.rule = 'float.m';
            this.error(err);
          }
          if (n > rule.float.n) {
            err.rule = 'float.n';
            this.error(err);
          }
        } else {
          this.error(err);
        }
        v = parseFloat(v);
      }
      if (_.isNumber(rule.min) && v < rule.min) {
        err.rule = 'min';
        this.error(err);
      }
      if (_.isNumber(rule.max) && v > rule.max) {
        err.rule = 'max';
        this.error(err);
      }
      if (rule.array && !_.isArray(v)) {
        err.rule = 'array';
        this.error(err);
      }
      if (_.isString(v) || _.isArray(v)) {
        if (_.isNumber(rule.minlength) && v.length < rule.minlength) {
          err.rule = 'minlength';
          err.value = rule.minlength;
          this.error(err);
        }
        if (_.isNumber(rule.maxlength) && v.length > rule.maxlength) {
          err.rule = 'maxlength';
          err.value = rule.maxlength;
          this.error(err);
        }
        if (_.isNumber(rule.length) && rule.length !== v.length) {
          err.rule = 'length';
          err.value = rule.length;
          this.error(err);
        }
      }
      if (rule.email && !this.isEmail(v)) {
        err.rule = 'email';
        this.error(err);
      }
      if (rule.url && !this.isUrl(v)) {
        err.rule = 'url';
        this.error(err);
      }
      if (rule.enum && -1 === rule.enum.has(v)) {
        err.rule = 'enum';
        err.value = Array.from(rule.enum);
        this.error(err);
      }
      if (rule.boolean && typeof data[k] !== 'boolean') {
        err.rule = 'boolean';
        this.error(err);
      }
      if (rule.date) {
        if (!this.isDate(v)) {
          err.rule = 'date';
          this.error(err);
        }
        v = moment(v).toISOString();
      }
      if (rule.dateonly && !this.isDateOnly(v)) {
        err.rule = 'dateonly';
        this.error(err);
      }
      if (rule.timeonly && !this.isTimeOnly(v)) {
        err.rule = 'timeonly';
        this.error(err);
      }
      if (rule.IDCard && !this.isIDCard(v)) {
        err.rule = 'IDCard';
        this.error(err);
      }
      if (rule.creditCard && !this.isCreditCard(v)) {
        err.rule = 'creditCard';
        this.error(err);
      }
      data[k] = v;
      for (let f in rule.methods) {
        let fn = rule.methods[f];
        if (!fn.call(this, v)) {
          err.rule = 'methods';
          err.value = f;
          this.error(err);
        }
      }
    }// for end
    return data;
  }

  isUrl(v) {
    return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(v);
  }
  isDate(v) {
    return moment(v).isValid();
  }
  isDateOnly(v) {
    return moment(v, 'YYYY-MM-DD', true).isValid();
  }
  isTimeOnly(v) {
    return moment(v, 'HH:mm:ss', true).isValid();
  }
  isInt(v) {
    return /^[-+]?\d+$/.test(v);
  }
  isFloat(v) {
    return /^[-+]?(\d+[.])?(\d+)$/.test(v);
  }
  isEmail(v) {
    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(v)
  }
  isIDCard(sfzhm_new) {
    let sum = 0,
      weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
      validate = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    for (let m = 0; m < sfzhm_new.length - 1; m++) {
      sum += sfzhm_new[m] * weight[m];
    }
    let mode = sum % 11;
    if (sfzhm_new[17] == validate[mode]) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Luhn校验算法校验银行卡号
   * Description:  银行卡号Luhm校验
   * Luhm校验规则：16位银行卡号（19位通用）:
   * 1.将未带校验位的 15（或18）位卡号从右依次编号 1 到 15（18），位于奇数位号上的数字乘以 2。
   * 2.将奇位乘积的个十位全部相加，再加上所有偶数位上的数字。
   * 3.将加法和加上校验位能被 10 整除。
   * 方法步骤很清晰，易理解，需要在页面引用Jquery.js
   * bankno为银行卡号
   */
  isCreditCard(bankno) {
    var lastNum = bankno.substr(bankno.length - 1, 1);//取出最后一位（与luhm进行比较）

    var first15Num = bankno.substr(0, bankno.length - 1);//前15或18位
    var newArr = new Array();
    for (var i = first15Num.length - 1; i > -1; i--) {//前15或18位倒序存进数组
      newArr.push(first15Num.substr(i, 1));
    }
    var arrJiShu = new Array();  //奇数位*2的积 <9
    var arrJiShu2 = new Array(); //奇数位*2的积 >9

    var arrOuShu = new Array();  //偶数位数组
    for (var j = 0; j < newArr.length; j++) {
      if ((j + 1) % 2 == 1) {//奇数位
        if (parseInt(newArr[j]) * 2 < 9)
          arrJiShu.push(parseInt(newArr[j]) * 2);
        else
          arrJiShu2.push(parseInt(newArr[j]) * 2);
      }
      else //偶数位
        arrOuShu.push(newArr[j]);
    }

    var jishu_child1 = new Array();//奇数位*2 >9 的分割之后的数组个位数
    var jishu_child2 = new Array();//奇数位*2 >9 的分割之后的数组十位数
    for (var h = 0; h < arrJiShu2.length; h++) {
      jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
      jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
    }

    var sumJiShu = 0; //奇数位*2 < 9 的数组之和
    var sumOuShu = 0; //偶数位数组之和
    var sumJiShuChild1 = 0; //奇数位*2 >9 的分割之后的数组个位数之和
    var sumJiShuChild2 = 0; //奇数位*2 >9 的分割之后的数组十位数之和
    var sumTotal = 0;
    for (var m = 0; m < arrJiShu.length; m++) {
      sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
    }

    for (var n = 0; n < arrOuShu.length; n++) {
      sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
    }

    for (var p = 0; p < jishu_child1.length; p++) {
      sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
      sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
    }
    //计算总和
    sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);

    //计算Luhm值
    var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
    var luhm = 10 - k;
    var my = false;
    if (lastNum == luhm) {//Luhm验证通过
      my = true;
    }
    else {//银行卡号必须符合Luhm校验
      my = false;
    }
    return my;
  }
  isString(str) {
    return typeof str === 'string';
  }
  isChar(str) {
    for (let i = str.length; i >= 0; i--) {
      let ch = str.charCodeAt(i);
      if (ch < 32 || ch > 126) {
        return false;
      }
    }
    return true;
  }
  /**
   * 字符串或数组
   * @param {string|array} data 
   */
  isFile(data) {
    return ((_.isString(data)) || _.isArray(data)) ? true : false;
  }
}

module.exports = {
  validater
};