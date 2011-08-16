
/**
 * @name	CeL function for CSV data
 * @fileoverview
 * 本檔案包含了處理 CSV data 的 functions。
 * @since	
 */


if (typeof CeL === 'function')
CeL.setup_module('data.CSV',
{
require : '',
code : function(library_namespace, load_arguments) {

//	requiring
//var split_String_to_Object;
eval(library_namespace.use_function(this));


/**
 * null module constructor
 * @class	CSV data 的 functions
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};





/*

TODO:
可一筆一筆處理，不佔記憶體。
DoEvents

http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html
GetKeywords: function(str) {
 o: return '\\b(' + str.replace(/\s+/g, '|') + ')\\b';
 x: return '\\b' + str.replace(/\s+/g, '\\b|\\b') + '\\b';
},


http://www.jsdb.org/
jsdb.from_array
jsdb.from_CSV
jsdb.from_CSV_file
jsdb.select=function(
	field	//	[1,0,1,1,1] || '1010100' || 'a,b,c,d' || {a:0,b:1,c:1}
	,where	//	function(o={a:,b:,c:}){..;return select;} || {a:3} || {a:function(a){..;return select;}} || {a://} || {op:'a&&b||c',a:[3,4,6,11],b:[4,5,6],c:32}
	)
jsdb.concat(table1, table2, id filed/[id fileds] = auto detect)
jsdb.from_HTML_TABLE(data,for_every_cell)
jsdb.transpose	//	轉置
jsdb.to_CSV
jsdb.to_HTML_TABLE
jsdb.to_array(row_first)
jsdb.to_object(row_first)

*/

_// JSDT:_module_
.
/**
 * parse CSV data to JSON	讀入 CSV 檔
 * @param {String} _t	CSV text data
 * @param {Boolean} doCheck check if data is valid
 * @param {Boolean} hasTitle	there's a title line
 * @return	{Array}	[ [L1_1,L1_2,..], [L2_1,L2_2,..],.. ]
 * @_memberOf	_module_
 * @example
 * //	to use:
 * var data=parse_CSV('~');
 * data[_line_][_field_]
 *
 * //	hasTitle:
 * var data = parse_CSV('~',0,1);
 * //data[_line_][data.t[_title_]]
 *
 * //	then:
 * data.tA	=	title line
 * data.t[_field_name_]	=	field number of title
 * data.it	=	ignored title array
 * data[num]	=	the num-th line (num: 0,1,2,..)
 * @see
 * <a href="http://www.jsdb.org/" accessdate="2010/1/1 0:53">JSDB: JavaScript for databases</a>,
 * <a href="http://hax.pie4.us/2009/05/lesson-of-regexp-50x-faster-with-just.html" accessdate="2010/1/1 0:53">John Hax: A lesson of RegExp: 50x faster with just one line patch</a>
 */
parse_CSV = function(_t, doCheck, hasTitle) {
	if (!_t || !/[^\n]/.test(_t = _t.replace(/\r\n?/g, '\n')))
		return;
	//_t+=_t.slice(-1)!='\n\n'?'\n':'\n';//if(_t.slice(-1)!='\n')_t+='\n';//if(!/\n/.test(_t))_t+='\n';	//	後面一定要[\n]是bug?

	var _f = arguments.callee, _r = [], _a, _b = {}, _i = 0, _m = _f.fd

/*
Here is a workaround for Opera 10.00 alpha build 1139 bug

'\u10a0'.match(/[^\u10a1]+/)
and
'\u10a0'.match(/[^"]+/)
gives different result.
The latter should '\u10a0' but it gives null.

But
'\u10a0'.match(/[^"\u109a]+/)
works.

*/
	, c = '\u10a0'.match(/[^"]+/) ? '' : '\u109a'
	;


	for (_m = '((|[^' + _f.td + _m
			// +c: for Opera bug
			+ c
			+ '\\n][^' + _m
			// +c: for Opera bug
			+ c
			+ '\\n]*'; _i <
			// 這裡不加  _f.td 可以 parse 更多狀況
			_f.td.length; _i++)
		_a = _f.td.charAt(_i), _b[_a] = new RegExp(_a + _a, 'g'), _m += '|'
			+ _a + '(([^' + _a
			// +c: for Opera bug
			+ c
			// 不用 [^'+_a+']+| 快很多
			+ ']|' + _a + _a + '|\\n)*)' + _a;
	_m += ')[' + _f.fd + '\\n])';
/*
 _m=
	'((|[^\'"'+_m+'\\n][^'+_m+'\\n]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_m+'\\n])'
	'((|[^\'"'+_m+'\\n$][^'+_m+'\\n$]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_m+'\\n$])'
_a='((|[^"\''+_f.fd+'\\n][^'+_f.fd+'\\n]*|"((""|[^"]|\\n)*)"|\'((\'\'|[^\']|\\n)*)\')['+_f.fd+'\\n])',alert(_m+'\n'+_a+'\n'+(_m==_a));
*/
	//alert( 'now:\n' + new RegExp(_m,'g').source + '\n\nfull:\n' + /((|[^'",;\t\n$][^,;\t\n$]*|'((''|[^']|\n)*)'|"((""|[^"]|\n)*)")[,;\t\n$])/.source);
	if (doCheck
			&& !new RegExp('^(' + _m + ')+$').test(_t.slice(-1) == '\n' ? _t
					: _t + '\n'))
		throw new Error(1, "parse_CSV(): Can't parse data!\npattern: /^" + _m
				+ "$/g");

	for (_a = [], _i = 0, _m = (_t.slice(-1) == '\n' ? _t : _t + '\n')
			.match(new RegExp(_m, 'g')); _i < _m.length; _i++) {
		_a.push(_b[_t = _m[_i].charAt(0)] ? _m[_i].slice(1, -2).replace(_b[_t],
				_t) : _m[_i].slice(0, -1));
		//alert('['+_i+'] '+_m[_i]+'|\n'+_a.slice(-1));
		if (_m[_i].slice(-1) == '\n')
			_r.push(_a), _a = [];
	}
	//if(_a.length)_r.push(_a);

	if (typeof hasTitle == 'undefined')
		hasTitle = _f.hasTitle === null ? 0 : _f.hasTitle;
	if (hasTitle) {
		// ignored title array
		_r.it = [];
		while (_a = _r.shift(), _a.length < _r[0].length)
			// 預防 title 有許多行
			_r.it.push(_a);
		for (_r.tA = _a, _b = _r.t = {}, _i = 0; _i < _a.length; _i++)
			_b[_a[_i]] = _i;
	}

	// _r=[ [L1_1,L1_2,..], [L2_1,L2_2,..],.. ]
	return _r;
};

_// JSDT:_module_
.
/**
* field delimiter
*/
parse_CSV.fd = '\\t,;';// :\s
_// JSDT:_module_
.
/**
* text delimiter
*/
parse_CSV.td = '"\'';
//_.parse_CSV.ld	line delimiter: only \n, \r will be ignored.
_// JSDT:_module_
.
/**
* auto detect.. no title
*/
parse_CSV.hasTitle = null;
//_.parse_CSV.title_word='t';	//	data[parse_CSV.title_word]=title row array
//_.parse_CSV.fd=';',parse_CSV.td='"',alert(parse_CSV('"dfdf\nsdff";"sdf""sadf\n""as""dfsdf";sdfsadf;"dfsdfdf""dfsadf";sfshgjk',1).join('\n'));WScript.Quit();



//	2007/8/6 17:53:57-22:11:22

/*
test:
'dfgdfg,"fgd",dfg'
'dfgdfg,"fgd",dfg'

'sdfsdf','ssdfdf'',''sdf'

*/
/**
 * 讀入CSV檔<br/>
 * !! slow !!
 * @since 2007/8/6 17:53:57-22:11:22
 * @see 可參考 JKL.ParseXML.CSV.prototype.parse_CSV	2007/11/4 15:49:4
 * @deprecated 廢棄: use parse_CSV() instead
 * @param FP file path
 * @param FD field delimiter([,;:	]|\s+)
 * @param TD text delimiter['"]
 * @param hasTitle the data has a title line
 * @return Array contains data
 */
//readCSVdata[generateCode.dLK]='autodetectEncode,simpleRead,simpleFileAutodetectEncode';
function readCSVdata(FP,FD,TD,hasTitle,enc){
 var t=simpleRead(FP,enc||simpleFileAutodetectEncode).replace(/^[\r\n\s]+/,''),r=[],reg={
	'"':/"?(([^"]+|"")+)"?([,;:	]|[ \r\n]+)/g,
	"'":/'?(([^']+|'')+)'?([,;:	]|[ \r\n]+)/g
 };
 //	detect delimiter
/*
 if(!FD||!TD){
  var a,b,i=0,F='[,;:	\s]',T='[\'"]',r=new RegExp('(^'+(TD||T)+'|('+(TD||T)+')('+(FD||F)+')('+(TD||T)+')|'+(TD||T)+'$)','g');
  F={},T={};
  try{
   t.replace(/(^['"]|(['"])([,;:	\s])(['"])|['"]$)/g,function($0,$1,$2,$3,$4){
    if(!$2)T[$0]=(T[$0]||0)+1;
    else if($2==$4)T[$2]=(T[$2]||0)+1,F[$3]=(F[$3]||0)+1;
    if(i++>20)break;
    return $0;
   });
  }catch(e){}
  if(!FD){a=b=0;for(i in F)if(F[i]>a)a=F[b=i];FD=b;}
  if(!TD){a=b=0;for(i in T)if(T[i]>a)a=T[b=i];TD=b;}
 }
*/
 if(!TD){
  l=t.indexOf('\n');
  if(l==-1)t.indexOf('\r');
  l=(l==-1?t:t.slice(0,l));
  if(!l.replace(reg['"'],''))TD='"';
  else if(!l.replace(reg["'"],''))TD="'";
  else return;
 }
 reg=reg[TD];

 l=[];if(!hasTitle)r.length=1;
 (t+'\n').replace(reg,function($0,$1,$2,$3){
	l.push($1);
	if(/\r\n/.test($3))r.push(l),l=[];
	return '';
 });
 if(hasTitle)
  for(l=0,r.t={};l<r[0].length;l++)r.t[r[0][l]]=l;
 return r;
}


toCSV.fd=',';	//	field delimiter
toCSV.td='"';	//	text delimiter
toCSV.force_td=1;	//	是否強制加上 text delimiter
toCSV.ld='\n';	//	line delimiter
function toCSV(o,title){
 var CSV=[],_f=arguments.callee,s,r,td=_f.td,a=td,i=0,t=function(t){
	var i=0,l=[];
	for(;i<t.length;i++)
	 l.push(s&&s.test(t[i])?t[i].replace(r,a):t[i]);
	i=_f.force_td?(td||''):'';
	CSV.push(i+l.join(i+_f.fd+i)+i);
 };

 if(a)s=new RegExp('\\'+a),r=new RegExp('\\'+a,'g'),a+=a;
 else if(toCSV.ld=='\n')s=/\n/,r=/\n/g,a='\\n';
 if(title)if(title instanceof Array)t(title);

 for(;i<o.length;i++)t(o[i]);

 return CSV.join(_f.ld);
}
/*	old:
function quoteCSVfield(t,d){
 if(!d)d='"';
 for(var i=0,j,rd=new RegExp(d,'g'),d2=d+d;i<t.length;i++){
  for(j=0;j<t[i].length;j++)
   if(typeof t[i][j]=='string')t[i][j]=d+t[i][j].replace(rd,d2)+d;
  if(t[i] instanceof Array)t[i]=t[i].join(',');
 }
 return t.join('\n')+'\n';
}
*/







return (
	_// JSDT:_module_
);
}


});

