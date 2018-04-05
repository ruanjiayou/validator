declare namespace validator {
  function error(data: any): void;
  function validate(data: any): boolean;
  function filter(data: any): any;
  function _arr2rule(arr: string): void;
  function parse(): any;
  function check(data: any): boolean;
  function isUrl(v: string): boolean;
  function isDate(v: string): boolean;
  function isInt(v: string): boolean;
  function isFloat(v: string): boolean;
  function isEmail(v: string): boolean;
  function isID(v: string): boolean;
  function isCredit(v: string): boolean;
  function isString(v: string): boolean;
  function isChar(v: string): boolean;
  function isFile(v: string): boolean;
  function getFileSignature(any: any): any;
}

declare module "validator" {
  class validator {
    constructor(o: any, lang?: string);
    error(data: any): void;
    validate(data: any): boolean;
    filter(data: any): any;
    _arr2rule(arr: string): void;
    parse(): any;
    check(data: any): boolean;
    isUrl(v: string): boolean;
    isDate(v: string): boolean;
    isInt(v: string): boolean;
    isFloat(v: string): boolean;
    isEmail(v: string): boolean;
    isID(v: string): boolean;
    isCredit(v: string): boolean;
    isString(v: string): boolean;
    isChar(v: string): boolean;
    isFile(v: string): boolean;
    getFileSignature(any: any): any;
  }
}