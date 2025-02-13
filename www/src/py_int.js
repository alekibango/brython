;(function($B){

var _b_ = $B.builtins

function $err(op, other){
    var msg = "unsupported operand type(s) for " + op +
        " : 'int' and '" + $B.class_name(other) + "'"
    throw _b_.TypeError.$factory(msg)
}

function int_value(obj){
    // Instances of int subclasses that call int.__new__(cls, value)
    // have an attribute $brython_value set
    if(typeof obj == "boolean"){
        return obj ? 1 : 0
    }
    return obj.$brython_value !== undefined ? obj.$brython_value : obj
}

// dictionary for built-in class 'int'
var int = {
    __class__: _b_.type,
    __dir__: _b_.object.__dir__,
    __mro__: [_b_.object],
    $infos: {
        __module__: "builtins",
        __name__: "int"
    },
    $is_class: true,
    $native: true,
    $descriptors: {
        "numerator": true,
        "denominator": true,
        "imag": true,
        "real": true
    }
}

int.as_integer_ratio = function(){
  var $ = $B.args("as_integer_ratio", 1, {self:null}, ["self"],
          arguments, {}, null, null)
  return $B.$list([$.self, 1])
}

int.from_bytes = function() {
    var $ = $B.args("from_bytes", 3,
        {bytes:null, byteorder:null, signed:null},
        ["bytes", "byteorder", "signed"],
        arguments, {signed: false}, null, null)

    var x = $.bytes,
        byteorder = $.byteorder,
        signed = $.signed,
        _bytes, _len
    if(_b_.isinstance(x, [_b_.bytes, _b_.bytearray])){
        _bytes = x.source
        _len = x.source.length
    }else{
        _bytes = _b_.list.$factory(x)
        _len = _bytes.length
        for(var i = 0; i < _len; i++){
            _b_.bytes.$factory([_bytes[i]])
        }
    }
    if(byteorder == "big"){
        _bytes.reverse()
    }else if(byteorder != "little"){
        throw _b_.ValueError.$factory(
            "byteorder must be either 'little' or 'big'")
    }
    var num = _bytes[0]
    if(signed && num >= 128){
        num = num - 256
    }
    var _mult = 256
    for(var i = 1;  i < _len; i++){
        num = $B.add($B.mul(_mult, _bytes[i]), num)
        _mult = $B.mul(_mult, 256)
    }
    if(! signed){
        return num
    }
    if(_bytes[_len - 1] < 128){
        return num
    }
    return $B.sub(num, _mult)
}

int.to_bytes = function(){
    var $ = $B.args("to_bytes", 3,
        {self: null, len: null, byteorder: null, signed: null},
        ["self", "len", "byteorder", "*", "signed"],
        arguments, {signed: false}, null, null),
        self = $.self,
        len = $.len,
        byteorder = $.byteorder,
        signed = $.signed
    if(! _b_.isinstance(len, _b_.int)){
        throw _b_.TypeError.$factory("integer argument expected, got " +
            $B.class_name(len))
    }
    if(["little", "big"].indexOf(byteorder) == -1){
        throw _b_.ValueError.$factory(
            "byteorder must be either 'little' or 'big'")
    }

    if(_b_.isinstance(self, $B.long_int)){
        return $B.long_int.to_bytes(self, len, byteorder, signed)
    }

    if(self < 0){
        if(! signed){
            throw _b_.OverflowError.$factory(
                "can't convert negative int to unsigned")
        }
        self = Math.pow(256, len) + self
    }

    var res = [],
        value = self

    while(value > 0){
        var quotient = Math.floor(value / 256),
            rest = value - 256 * quotient
        res.push(rest)
        if(res.length > len){
            throw _b_.OverflowError.$factory("int too big to convert")
        }
        value = quotient
    }
    while(res.length < len){
        res.push(0)
    }
    if(byteorder == "big"){
        res.reverse()
    }
    return {
        __class__: _b_.bytes,
        source: res
    }
}

int.__abs__ = function(self){return _b_.abs(self)}

int.__add__ = function(self, other){
    self = int_value(self)
    if(_b_.isinstance(other, int)){
        if(other.__class__ == $B.long_int){
            return $B.long_int.__add__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
        other = int_value(other)
        var res = self + other
        if(res > $B.min_int && res < $B.max_int){
            return res
        }else{
            return $B.long_int.__add__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
    }
    return _b_.NotImplemented
}

int.__bool__ = function(self){
    return int_value(self).valueOf() == 0 ? false : true
}

int.__ceil__ = function(self){return Math.ceil(int_value(self))}

int.__divmod__ = function(self, other){
    if(! _b_.isinstance(other, int)){
        return _b_.NotImplemented
    }
    return $B.fast_tuple([int.__floordiv__(self, other),
        int.__mod__(self, other)])
}

int.__eq__ = function(self, other){
    // compare object "self" to class "int"
    if(_b_.isinstance(other, int)){
        return self.valueOf() == int_value(other).valueOf()
    }
    if(_b_.isinstance(other, _b_.float)){
        return self.valueOf() == other.valueOf()
    }
    if(_b_.isinstance(other, _b_.complex)){
        if(other.$imag != 0){return False}
        return self.valueOf() == other.$real
    }
    return _b_.NotImplemented
}

int.__float__ = function(self){
    return new Number(self)
}

function preformat(self, fmt){
    if(fmt.empty){return _b_.str.$factory(self)}
    if(fmt.type && 'bcdoxXn'.indexOf(fmt.type) == -1){
        throw _b_.ValueError.$factory("Unknown format code '" + fmt.type +
            "' for object of type 'int'")
    }
    var res
    switch(fmt.type){
        case undefined:
        case "d":
            res = self.toString()
            break
        case "b":
            res = (fmt.alternate ? "0b" : "") + self.toString(2)
            break
        case "c":
            res = _b_.chr(self)
            break
        case "o":
            res = (fmt.alternate ? "0o" : "") + self.toString(8)
            break
        case "x":
            res = (fmt.alternate ? "0x" : "") + self.toString(16)
            break
        case "X":
            res = (fmt.alternate ? "0X" : "") + self.toString(16).toUpperCase()
            break
        case "n":
            return self // fix me
    }

    if(fmt.sign !== undefined){
        if((fmt.sign == " " || fmt.sign == "+" ) && self >= 0){
            res = fmt.sign + res
        }
    }
    return res
}


int.__format__ = function(self, format_spec){
    var fmt = new $B.parse_format_spec(format_spec)
    if(fmt.type && 'eEfFgG%'.indexOf(fmt.type) != -1){
        // Call __format__ on float(self)
        return _b_.float.__format__(self, format_spec)
    }
    fmt.align = fmt.align || ">"
    var res = preformat(self, fmt)
    if(fmt.comma){
        var sign = res[0] == "-" ? "-" : "",
            rest = res.substr(sign.length),
            len = rest.length,
            nb = Math.ceil(rest.length/3),
            chunks = []
        for(var i = 0; i < nb; i++){
            chunks.push(rest.substring(len - 3 * i - 3, len - 3 * i))
        }
        chunks.reverse()
        res = sign + chunks.join(",")
    }
    return $B.format_width(res, fmt)
}

int.__floordiv__ = function(self, other){
    if(other.__class__ === $B.long_int){
        return $B.long_int.__floordiv__($B.long_int.$factory(self), other)
    }
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(other == 0){throw _b_.ZeroDivisionError.$factory("division by zero")}
        return Math.floor(self / other)
    }
    return _b_.NotImplemented
}

int.__hash__ = function(self){
    if(self.$brython_value){
        // int subclass
        var hash_method = $B.$getattr(self.__class__, '__hash__')
        if(hash_method === int.__hash__){
            if(typeof self.$brython_value == "number"){
                return self.$brython_value
            }else{ // long int
                return $B.long_int.__hash__(self.$brython_value)
            }
        }else{
            return hash_method(self)
        }
    }
    return self.valueOf()
}

//int.__ior__ = function(self,other){return self | other} // bitwise OR

int.__index__ = function(self){
    return int_value(self)
}

int.__init__ = function(self, value){
    if(value === undefined){value = 0}
    self.toString = function(){return value}
    return _b_.None
}

int.__int__ = function(self){return self}

int.__invert__ = function(self){return ~self}

// bitwise left shift
int.__lshift__ = function(self, other){
    self = int_value(self)
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        try{
            return int.$factory($B.long_int.__lshift__($B.long_int.$factory(self),
                $B.long_int.$factory(other)))
        }catch(err){
            console.log('err in lshift', self, other)
            throw err
        }
    }
    return _b_.NotImplemented
}

int.__mod__ = function(self, other) {
    // can't use Javascript % because it works differently for negative numbers
    if(_b_.isinstance(other,_b_.tuple) && other.length == 1){other = other[0]}
    if(other.__class__ === $B.long_int){
        return $B.long_int.__mod__($B.long_int.$factory(self), other)
    }
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(other === false){other = 0}
        else if(other === true){other = 1}
        if(other == 0){throw _b_.ZeroDivisionError.$factory(
            "integer division or modulo by zero")}
        return (self % other + other) % other
    }
    return _b_.NotImplemented
}

int.__mul__ = function(self, other){
    self = int_value(self)
    if(_b_.isinstance(other, int)){
        if(other.__class__ == $B.long_int){
            return $B.long_int.__mul__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
        other = int_value(other)
        var res = self * other
        if(res > $B.min_int && res < $B.max_int){
            return res
        }else{
            return int.$factory($B.long_int.__mul__($B.long_int.$factory(self),
                $B.long_int.$factory(other)))
        }
    }
    return _b_.NotImplemented
}

int.__ne__ = function(self, other){
    var res = int.__eq__(self, other)
    return (res  === _b_.NotImplemented) ? res : !res
}

int.__neg__ = function(self){return -self}

int.__new__ = function(cls, value){
    if(cls === undefined){
        throw _b_.TypeError.$factory("int.__new__(): not enough arguments")
    }else if(! _b_.isinstance(cls, _b_.type)){
        throw _b_.TypeError.$factory("int.__new__(X): X is not a type object")
    }
    if(cls === int){return int.$factory(value)}
    return {
        __class__: cls,
        __dict__: $B.empty_dict(),
        $brython_value: value || 0
    }
}

int.__pos__ = function(self){return self}

function extended_euclidean(a, b){
    var d, u, v
    if(b == 0){
      return [a, 1, 0]
    }else{
      [d, u, v] = extended_euclidean(b, a % b)
      return [d, v, u - Math.floor(a / b) * v]
    }
}

int.__pow__ = function(self, other, z){
    if(! _b_.isinstance(other, int)){
        return _b_.NotImplemented
    }
    if(typeof other == "number"  || _b_.isinstance(other, int)){
        other = int_value(other)
        switch(other.valueOf()) {
            case 0:
                return int.$factory(1)
            case 1:
                return int.$factory(self.valueOf())
      }
      if(z !== undefined && z !== _b_.None){
          // If z is provided, the algorithm is faster than computing
          // self ** other then applying the modulo z
          if(z == 1){return 0}
          var result = 1,
              base = self % z,
              exponent = other,
              long_int = $B.long_int
          if(exponent < 0){
              var gcd, inv, _
              [gcd, inv, _] = extended_euclidean(self, z)
              if(gcd !== 1){
                  throw _b_.ValueError.$factory("not relative primes: " +
                      self + ' and ' + z)
              }
              return int.__pow__(inv, -exponent, z)
          }
          while(exponent > 0){
              if(exponent % 2 == 1){
                  if(result * base > $B.max_int){
                      result = long_int.__mul__(
                          long_int.$factory(result),
                          long_int.$factory(base))
                      result = long_int.__mod__(result, z)
                  }else{
                     result = (result * base) % z
                  }
              }
              exponent = exponent >> 1
              if(base * base > $B.max_int){
                  base = long_int.__mul__(long_int.$factory(base),
                      long_int.$factory(base))
                  base = long_int.__mod__(base, z)
              }else{
                  base = (base * base) % z
              }
          }
          return result
      }
      var res = Math.pow(self.valueOf(), other.valueOf())
      if(res > $B.min_int && res < $B.max_int){
          return other > 0 ? res : new Number(res)
      }else if(res !== Infinity && !isFinite(res)){
          return res
      }else{
          if($B.BigInt){
              return {
                  __class__: $B.long_int,
                  value: ($B.BigInt(self) ** $B.BigInt(other)).toString(),
                  pos: true
              }
          }
          return $B.long_int.__pow__($B.long_int.$from_int(self),
             $B.long_int.$from_int(other))
      }
    }
    if(_b_.isinstance(other, _b_.float)) {
        other = _b_.float.numerator(other)
        if(self >= 0){
            return new Number(Math.pow(self, other))
        }else{
            // use complex power
            return _b_.complex.__pow__($B.make_complex(self, 0), other)
        }
    }else if(_b_.isinstance(other, _b_.complex)){
        var preal = Math.pow(self, other.$real),
            ln = Math.log(self)
        return $B.make_complex(preal * Math.cos(ln), preal * Math.sin(ln))
    }
    var rpow = $B.$getattr(other, "__rpow__", _b_.None)
    if(rpow !== _b_.None){
        return rpow(self)
    }
    $err("**", other)
}

function __newobj__(){
    // __newobj__ is called with a generator as only argument
    var $ = $B.args('__newobj__', 0, {}, [], arguments, {}, 'args', null),
        args = $.args
    var res = args.slice(1)
    res.__class__ = args[0]
    return res
}

int.__reduce_ex__ = function(self){
    return $B.fast_tuple([
        __newobj__,
        $B.fast_tuple([self.__class__ || int, int_value(self)]),
        _b_.None,
        _b_.None,
        _b_.None])
}

int.__repr__ = function(self){
    $B.builtins_repr_check(int, arguments) // in brython_builtins.js
    return int_value(self).toString()
}

// bitwise right shift
int.__rshift__ = function(self, other){
    self = int_value(self)
    if(typeof other == "number" || _b_.isinstance(other, int)){
        other = int_value(other)
        return int.$factory($B.long_int.__rshift__($B.long_int.$factory(self),
            $B.long_int.$factory(other)))
    }
    return _b_.NotImplemented
}

int.__setattr__ = function(self, attr, value){
    if(typeof self == "number" || typeof self == "boolean"){
        var cl_name = $B.class_name(self)
        if(_b_.dir(self).indexOf(attr) > -1){
            var msg = "attribute '" + attr + `' of '${cl_name}'` +
                "objects is not writable"
        }else{
            var msg = `'${cl_name}' object has no attribute '${attr}'`
        }
        throw _b_.AttributeError.$factory(msg)
    }
    // subclasses of int can have attributes set
    _b_.dict.$setitem(self.__dict__, attr, value)
    return _b_.None
}

int.__sub__ = function(self, other){
    self = int_value(self)
    if(_b_.isinstance(other, int)){
        if(other.__class__ == $B.long_int){
            return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
        other = int_value(other)
        var res = self - other
        if(res > $B.min_int && res < $B.max_int){
            return res
        }else{
            return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
    }
    return _b_.NotImplemented
}

int.__truediv__ = function(self, other){
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(other == 0){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        if(other.__class__ === $B.long_int){
            return new Number(self / parseInt(other.value))
        }
        return new Number(self / other)
    }
    return _b_.NotImplemented
}

int.bit_length = function(self){
    s = _b_.bin(self)
    s = $B.$getattr(s, "lstrip")("-0b") // remove leading zeros and minus sign
    return s.length       // len('100101') --> 6
}

// descriptors
int.numerator = function(self){
    return int_value(self)
}
int.denominator = function(self){
    return int.$factory(1)
}
int.imag = function(self){
    return int.$factory(0)
}
int.real = function(self){
    return self
}

for(var attr of ['numerator', 'denominator', 'imag', 'real']){
    int[attr].setter = (function(x){
        return function(self, value){
            throw _b_.AttributeError.$factory(`attribute '${x}' of ` +
                `'${$B.class_name(self)}' objects is not writable`)
        }
    })(attr)
}

$B.max_int32 = (1 << 30) * 2 - 1
$B.min_int32 = - $B.max_int32

// code for operands & | ^
var $op_func = function(self, other){
    self = int_value(self)
    if(typeof other == "number" || _b_.isinstance(other, int)){
        if(other.__class__ === $B.long_int){
            return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
        other = int_value(other)
        if(self > $B.max_int32 || self < $B.min_int32 ||
                other > $B.max_int32 || other < $B.min_int32){
            return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
        return self - other
    }
    return _b_.NotImplemented
}

$op_func += "" // source code
var $ops = {"&": "and", "|": "or", "^": "xor"}
for(var $op in $ops){
    var opf = $op_func.replace(/-/gm, $op)
    opf = opf.replace(new RegExp("sub", "gm"), $ops[$op])
    eval("int.__" + $ops[$op] + "__ = " + opf)
}


// comparison methods
var $comp_func = function(self, other){
    if(other.__class__ === $B.long_int){
        return $B.long_int.__lt__(other, $B.long_int.$factory(self))
    }
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        return self.valueOf() > other.valueOf()
    }else if(_b_.isinstance(other, _b_.float)){
        return self.valueOf() > _b_.float.numerator(other)
    }else if(_b_.isinstance(other, _b_.bool)) {
      return self.valueOf() > _b_.bool.__hash__(other)
    }
    if(_b_.hasattr(other, "__int__") || _b_.hasattr(other, "__index__")){
       return int.__gt__(self, $B.$GetInt(other))
    }

    return _b_.NotImplemented
}
$comp_func += "" // source code

for(var $op in $B.$comps){
    eval("int.__"+$B.$comps[$op] + "__ = " +
          $comp_func.replace(/>/gm, $op).
              replace(/__gt__/gm,"__" + $B.$comps[$op] + "__").
              replace(/__lt__/, "__" + $B.$inv_comps[$op] + "__"))
}

// add "reflected" methods
var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or", "divmod"]

for(var r_opname of r_opnames){
    if(int["__r" + r_opname + "__"] === undefined &&
            int['__' + r_opname + '__']){
        int["__r" + r_opname + "__"] = (function(name){
            return function(self, other){
                if(_b_.isinstance(other, int)){
                    other = int_value(other)
                    return int["__" + name + "__"](other, self)
                }
                return _b_.NotImplemented
            }
        })(r_opname)
    }
}

var $valid_digits = function(base) {
    var digits = ""
    if(base === 0){return "0"}
    if(base < 10){
       for(var i = 0; i < base; i++){digits += String.fromCharCode(i + 48)}
       return digits
    }

    var digits = "0123456789"
    // A = 65 (10 + 55)
    for (var i = 10; i < base; i++) {digits += String.fromCharCode(i + 55)}
    return digits
}

int.$factory = function(value, base){
    // int() with no argument returns 0
    if(value === undefined){return 0}

    // int() of an integer returns the integer if base is undefined
    if(typeof value == "number" &&
        (base === undefined || base == 10)){return parseInt(value)}

    if(_b_.isinstance(value, _b_.complex)){
        throw _b_.TypeError.$factory("can't convert complex to int")
    }

    var $ns = $B.args("int", 2, {x:null, base:null}, ["x", "base"], arguments,
        {"base": 10}, null, null),
        value = $ns["x"],
        base = $ns["base"]

    if(_b_.isinstance(value, _b_.float) && base == 10){
        value = _b_.float.numerator(value) // for float subclasses
        if(value < $B.min_int || value > $B.max_int){
            return $B.long_int.$from_float(value)
        }
        else{
            return value > 0 ? Math.floor(value) : Math.ceil(value)
        }
    }

    if(! (base >=2 && base <= 36)){
        // throw error (base must be 0, or 2-36)
        if(base != 0){
            throw _b_.ValueError.$factory("invalid base")
        }
    }

    if(typeof value == "number"){

        if(base == 10){
           if(value < $B.min_int || value > $B.max_int){
               return $B.long_int.$factory(value)
           }
           return value
        }else if(value.toString().search("e") > -1){
            // can't convert to another base if value is too big
            throw _b_.OverflowError.$factory("can't convert to base " + base)
        }else{
            var res = parseInt(value, base)
            if(value < $B.min_int || value > $B.max_int){
                return $B.long_int.$factory(value, base)
            }
            return res
        }
    }

    if(value === true){return Number(1)}
    if(value === false){return Number(0)}
    if(value.__class__ === $B.long_int){
        var z = parseInt(value.value)
        if(z > $B.min_int && z < $B.max_int){return z}
        else{return value}
    }

    base = $B.$GetInt(base)
    function invalid(value, base){
        throw _b_.ValueError.$factory("invalid literal for int() with base " +
            base + ": '" + _b_.str.$factory(value) + "'")
    }

    if(_b_.isinstance(value, _b_.str)){
        value = value.valueOf()
    }
    if(typeof value == "string") {
        var _value = value.trim()    // remove leading/trailing whitespace
        if(_value.length == 2 && base == 0 &&
                (_value == "0b" || _value == "0o" || _value == "0x")){
           throw _b_.ValueError.$factory("invalid value")
        }
        if(_value.length > 2) {
            var _pre = _value.substr(0, 2).toUpperCase()
            if(base == 0){
                if(_pre == "0B"){base = 2}
                if(_pre == "0O"){base = 8}
                if(_pre == "0X"){base = 16}
            }else if(_pre == "0X" && base != 16){invalid(_value, base)}
            else if(_pre == "0O" && base != 8){invalid(_value, base)}
            if((_pre == "0B" && base == 2) || _pre == "0O" || _pre == "0X"){
                _value = _value.substr(2)
                while(_value.startsWith("_")){
                    _value = _value.substr(1)
                }
            }
        }else if(base == 0){
            // eg int("1\n", 0)
            base = 10
        }
        var _digits = $valid_digits(base),
            _re = new RegExp("^[+-]?[" + _digits + "]" +
            "[" + _digits + "_]*$", "i"),
            match = _re.exec(_value)
        if(match === null){
            invalid(value, base)
        }else{
            value = _value.replace(/_/g, "")
        }
        if(base <= 10 && ! isFinite(value)){
            invalid(_value, base)
        }
        var res = parseInt(value, base)
        if(res < $B.min_int || res > $B.max_int){
            return $B.long_int.$factory(value, base)
        }
        return res
    }

    if(_b_.isinstance(value, [_b_.bytes, _b_.bytearray])){
        return int.$factory($B.$getattr(value, "decode")("latin-1"), base)
    }

    for(var special_method of ["__int__", "__index__", "__trunc__"]){
        var num_value = $B.$getattr(value.__class__ || $B.get_class(value),
            special_method, _b_.None)
        if(num_value !== _b_.None){
            return $B.$call(num_value)(value)
        }
    }
    throw _b_.TypeError.$factory(
        "int() argument must be a string, a bytes-like " +
        "object or a number, not '" + $B.class_name(value) + "'")
}

$B.set_func_names(int, "builtins")

_b_.int = int

// Boolean type
$B.$bool = function(obj){ // return true or false
    if(obj === null || obj === undefined ){ return false}
    switch(typeof obj){
        case "boolean":
            return obj
        case "number":
        case "string":
            if(obj){return true}
            return false
        default:
            if(obj.$is_class){return true}
            var klass = obj.__class__ || $B.get_class(obj),
                missing = {},
                bool_method = $B.$getattr(klass, "__bool__", missing)
            if(bool_method === missing){
                try{return _b_.len(obj) > 0}
                catch(err){return true}
            }else{
                var res = $B.$call(bool_method)(obj)
                if(res !== true && res !== false){
                    throw _b_.TypeError.$factory("__bool__ should return " +
                        "bool, returned " + $B.class_name(res))
                }
                return res
            }
    }
}

var bool = {
    __bases__: [int],
    __class__: _b_.type,
    __mro__: [int, _b_.object],
    $infos:{
        __name__: "bool",
        __module__: "builtins"
    },
    $is_class: true,
    $native: true,
    $descriptors: {
        "numerator": true,
        "denominator": true,
        "imag": true,
        "real": true
    }
}

bool.__and__ = function(self, other){
    if(_b_.isinstance(other, bool)){
        return self && other
    }else if(_b_.isinstance(other, int)){
        return int.__and__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.__float__ = function(self){
    return self ? new Number(1) : new Number(0)
}

bool.__hash__ = bool.__index__ = bool.__int__ = function(self){
   if(self.valueOf()) return 1
   return 0
}

bool.__neg__ = function(self){return -$B.int_or_bool(self)}

bool.__or__ = function(self, other){
    if(_b_.isinstance(other, bool)){
        return self || other
    }else if(_b_.isinstance(other, int)){
        return int.__or__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.__pos__ = $B.int_or_bool

bool.__repr__ = function(self){
    $B.builtins_repr_check(bool, arguments) // in brython_builtins.js
    return self ? "True" : "False"
}

bool.__xor__ = function(self, other) {
    if(_b_.isinstance(other, bool)){
        return self ^ other ? true : false
    }else if(_b_.isinstance(other, int)){
        return int.__xor__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.$factory = function(){
    // Calls $B.$bool, which is used inside the generated JS code and skips
    // arguments control.
    var $ = $B.args("bool", 1, {x: null}, ["x"],
        arguments,{x: false}, null, null)
    return $B.$bool($.x)
}

bool.numerator = int.numerator
bool.denominator = int.denominator
bool.real = int.real
bool.imag = int.imag

_b_.bool = bool

$B.set_func_names(bool, "builtins")

})(__BRYTHON__)
