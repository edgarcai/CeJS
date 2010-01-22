
/**
 * @name	CeL function for native objects
 * @fileoverview
 * 本檔案包含了 native objects 的 functions。
 * @since	
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'native';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @_name	_module_
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {

//	requires
if (eval(library_namespace.use_function(
		'data.split_String_to_Object')))
	return;


/**
 * null module constructor
 * @class	native objects 的 functions
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






/*	opposite of toUTCString()
	尚不成熟！假如是type=='date'，不如用new Date()!
	string大部分可用new Date(Date.parse(str))代替!
	http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K742.aspx

var UTCDay,UTCMonth;
setObjValue('UTCDay','Sun,Mon,Tue,Wed,Thu,Fri,Sat',1);
setObjValue('UTCMonth','Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',1);
var fromUTCStringFormat=[[0,3,2,1,4],[0,5,1,2,3],[0,4,1,2,3]];	//	0:[Mon, 9 Aug 2004 12:05:00 GMT],1:[Thu Sep 30 18:12:08 UTC+0800 2004],2:[Sat Jun 26 18:19:46 2004]
function fromUTCString(str,format){
 var s=''+str,f;
 if(!s)return;
 if(typeof format=='undefined')if(f=Date.parse(s))return new Date(f);else return 'Unknown format!';//format=0;
 if(!isNaN(format)&&format<fromUTCStringFormat.length)f=fromUTCStringFormat[format];
 else return 'Yet support this kind of format['+format+']!\nWe support to '+fromUTCStringFormat.length+'.';
 if(!f[0])f[0]=' ';
 s=s.replace(new RegExp(f[0]+'+','g'),f[0]).split(f[0]);
 if(s.length<f.length)return 'The item length of data: '+s.length+' is less then format['+format+']: '+f.length+'!\n'+s.join(',');// new Date
 if(f.length==5)s[f[4]]=s[f[4]].split(':');
 else if(f.length==7)s[f[4]]=[s[f[4]],s[f[5]],s[f[6]]];
 else return 'Illegal date format!';
 if(format==1&&s[4].match(/([+-]\d{2})/))s[f[4]][0]=parseInt(s[f[3]][0])+parseInt(RegExp.$1);
 alert(str+'\n'+s[f[1]]+','+s[f[2]]+'('+UTCMonth[s[f[2]]]+'),'+s[f[3]]+','+s[f[4]][0]+','+s[f[4]][1]+','+s[f[4]][2]);
 //	check,可以包括星期
 if( !(s[f[2]]=UTCMonth[s[f[2]]]) || !(s=new Date(s[f[1]],s[f[2]],s[f[3]],s[f[4]][0],s[f[4]][1],s[f[4]][2])) )	//	Date.UTC()
  s='Input data error!';
 return s;
}
*/

/*	string <-> date object, Date.parse()
	http://msdn2.microsoft.com/zh-tw/library/t5580e8h(VS.80).aspx


/((\d{1,4})[\/.-])?([01]?\d)([\/.-]([0-3]?\d))?/
/([0-2]?\d):([0-5]?\d)(:([0-5]?\d))?\s*(([PA])M)?/


(


(


(
([12]\d{3}|1?\d{2})

[\/.-]
)?

([01]?\d)

([\/.-]([0-3]?\d)(\.\d+)?)?


|


([0-2]?\d)
:
([0-5]?\d)

(:([0-5]?\d))?

\s*
(([PA])M)?


)



\s*
){1,2}


try:
'2003/1/4  12:53:5'.toDate();
StrToDate.m.join('<br/>');
	$2:year
	$3:month
	$5:mday


*/
StrToDate.pd=/(([12]\d{3}|1\d{2}|[2-9]\d)[\/.\-年])?([01]?\d)([\/.\-月]([0-3]?\d)日?)?/;	//	pattern of date
StrToDate.pt=/([0-2]?\d)[:時]([0-5]?\d)([:分]([0-5]?\d)(\.\d+)?)?\s*(([PA])M)?/i;	//	pattern of time
StrToDate.r1=new RegExp(StrToDate.pd.source+'(\\s+'+StrToDate.pt.source+')?','i');	//	date [time]
StrToDate.r2=new RegExp(StrToDate.pt.source+'(\\s+'+StrToDate.pd.source+')?','i');	//	time [date]
//StrToDate.m;	//	matched string
function StrToDate(s,f,diff){	//	date string, force parse(no Date.parse() try), 時差 in hour(例如 TW: UTC+8 → 8, 可使用.5)
 if(!s)s=this.valueOf();//.toString();
 var m,a,b,c;
 if(!f&&!diff&&(m=Date.parse(s)))return new Date(m);	//	有diff時不使用 Date.parse

 if(m=s.match(/(^|[^\d])([12]\d{3})([^\/.\-年]|$)/))s=m[2]+'/1';	//	僅有年時的bug

 f=1911;	//	小於此年份會加上此年份。for 民國
 if(diff)diff=(new Date).getTimezoneOffset()+parseInt(60*diff);
 if(!diff)diff=0;
 if(m=s.match(StrToDate.r1))
  //	日期先
  //for(var i=1;i<11;i++)m[i]=m[i]?Math.floor(m[i]):0;	//	needless
  a=new Date((b=m[2]-0)&&b<200?b+f:b,m[3]?m[3]-1:0,m[5]||1,	m[12]=='P'||m[13]=='p'?m[7]-0+12:m[7],m[8]-diff,m[10],m[11]*1e3);

 if((!m||!isNaN(m[0]))&&(c=s.match(StrToDate.r2)))	//	不match或僅有一數字
  //	時間先
  m=c,a=new Date((b=m[10]-0)&&b<200?b+f:b,m[11]?m[11]-1:0,m[13]||1,	m[7]=='P'||m[7]=='p'?m[1]-0+12:m[1],m[2]-diff,m[4],m[5]*1e3);

 //var t="match:\n"+s+"\n\n";for(var i=0;i<m.length;i++){t+=(i>9?i:' '+i)+': '+m[i]+'\n';}if(!m[1]||!m[2]||!m[4])alert(t);

 if(StrToDate.m=m){
  //	判別未輸入時預設年份設對了沒：以最接近 now 的為基準
  if(!b && a-new Date(0,0,2)>0 && (
		m=new Date(a),
		a.setFullYear(s=(b=new Date).getFullYear()),
		m.setFullYear(a-b>0?s-1:s+1),
		a-b>0&&a-b>b-m||a-b<0&&a-b<b-m
	))a=m;
  return a;
 }
}

//	Turn to RFC 822 date-time
//DateToRFC822[generateCode.dLK]='setTool,StrToDate';
function DateToRFC822(d){
 if(!(d instanceof Date))d=(''+d).toDate();
 if(!d)d=new Date;
 return d.toGMTString().replace(/UTC/gi,'GMT');
}

//	要用更多樣化的，請使用gDate()
function DateToStr(sp){
 if(!sp)sp='/';
 with(this)return ''+getYear()+sp+(getMonth()+1)+sp+getDate()+' '+getHours()+':'+getMinutes();//+':'+.getSeconds()+'.'+getMilliseconds();
}
//var tt='2001/8/7 03:35PM';alert(tt+'\n'+tt.toDate().toStr());

/*	顯示格式化日期string	input date,mode	2003/10/18 1:04修正
	mode:	+4:不顯示時間,+3:顯示時間至時,+2:顯示時間至分,+1:顯示時間至秒,+0:顯示時間至毫秒(ms)
		+32(4):不顯示日期,+24(3):顯示日期mm/dd,+16(2):顯示日期yyyy/mm,+8(1):顯示日期yyyy/mm/dd(星期),+0:顯示日期yyyy/mm/dd
		+64:input UTC	+128:output UTC
	http://www.merlyn.demon.co.uk/js-dates.htm
	http://aa.usno.navy.mil/data/docs/JulianDate.html

NOTE:
在現有時制下要轉換其他時區之時間成正確time:
d=_其他時區之時間_;
diff=其他時區之時差(例如 TW: UTC+8)
d.setTime(d.getTime()-60000*((new Date).getTimezoneOffset()+diff*60))

*/
//gDate[generateCode.dLK]='dateUTCdiff,setTool,decplaces';
var dateUTCdiff;	//	全球標準時間(UCT)與本地時間之差距
gDate.noZero=1;
function gDate(d,M,sp1,sp2){
 //alert('['+(typeof d)+'] '+d+', '+M);
 if(!M)M=0;
 var isUTC,a,b,T,r=M;M%=64,noZero=arguments.callee.noZero,N=function(n){return noZero||n>9?n:'0'+n;};
 r=(r-M)/64;
 if(r%2==1)a=0;
 else{
  //	UTC time = local time + dateUTCdiff(ms)
  if(isNaN(dateUTCdiff))dateUTCdiff=6e4*(new Date).getTimezoneOffset();	//	.getTimezoneOffset() is in min. 60000(ms)=60*1000(ms)
  a=dateUTCdiff;
 }
 isUTC=r>1;
 if(typeof d=='number' && d>=0)
  d=new Date(Math.abs(d+a)<9e7?d+a:d)
  ,M=32+M%8;	//	d<90000000~24*60*60*1000，判別為當天，只顯示時間。不允許d<0！
 else if(typeof d=='string'&&d.toDate())d=d.toDate();
 else if(typeof d=='date')d=new Date(d);	//	應對在Excel等中會出現的東西
 else if(!(d instanceof Date))d=new Date;//http://www.interq.or.jp/student/exeal/dss/ejs/1/1.html 引数がオブジェクトを要求してくる場合は instanceof 演算子を使用します	typeof d!='object'||d.constructor!=Date	//	new Date==new Date()
 a=sp1||'/',b=sp2||':',T=M%8,M=(M-T)/8,r='';
 if(T>4&&M>3)return '';	//	沒啥好顯示的了
 //	date
 if(M<4){
  r=N((isUTC?d.getUTCMonth():d.getMonth())+1);
  if(M<3)r=(isUTC?d.getUTCFullYear():d.getFullYear())+a+r;
  if(M!=2){
   r+=a+N(isUTC?d.getUTCDate():d.getDate());
   if(M==1)r+='('+(isUTC?d.getUTCDay():d.getDay())+')';
  }
 }
 //	time
 if(T<4){
  if(M<4)r+=' ';	//	日期&時間中間分隔
  r+=N(isUTC?d.getUTCHours():d.getHours())+b;
  if(T<3){
   r+=N(isUTC?d.getUTCMinutes():d.getMinutes());
   if(T<2)r+=b+(T?N(isUTC?d.getUTCSeconds():d.getSeconds()):(isUTC?d.getUTCSeconds()+d.getUTCMilliseconds()/1e3:d.getSeconds()+d.getMilliseconds()/1e3).decp(3));
  }
 }
 return r;
}



/*
	Syntax error: http://msdn.microsoft.com/library/en-us/script56/html/js56jserrsyntaxerror.asp
	function經ScriptEngine會轉成/取用'function'開始到'}'為止的字串

	用[var thisFuncName=parse_Function().funcName]可得本身之函數名
	if(_detect_)alert('double run '+parse_Function().funcName+'() by '+parse_Function(arguments.callee.caller).funcName+'()!');

You may use this.constructor


TODO:
to call: parse_Function(this,arguments)
e.g., parent_func.child_func=function(){var name=parse_Function(this,arguments);}

bug:
函數定義 .toString() 時無法使用。
*/
/**
 * 函數的文字解譯/取得函數的語法
 * @param function_name	function name
 * @param flag	=1: reduce
 * @return
 * @example
 * parsed_data = new parse_Function(function_name);
 * @see
 * http://www.interq.or.jp/student/exeal/dss/ref/jscript/object/function.html,
 * 
 */
function parse_Function(function_name, flag) {
	if (!function_name
			&& typeof (function_name = arguments.callee.caller) !== 'function')
		return;
	if (typeof function_name === 'string')
		this.oriName = function_name,
		// 不加var會變成global變數
		eval('var function_name=' + function_name);

	//	原先：functionRegExp=/^\s*function\s+(\w+) ..	因為有function(~){~}這種的，所以改變。
	var functionRegExp// =/^\s*function\s*(\w*)\s*\(([\w\s,]*)\)\s*\{\s*((.|\n)*)\s*\}\s*$/m
		, functionArguments, functionContents, functionString;

	//	for JScript<=5
	try {
		functionRegExp = new RegExp(
			'^\\s*function\\s*(\\w*)\\s*\\(([\\w\\s,]*)\\)\\s*\\{\\s*((.|\\n)*)\\s*\\}\\s*$', 'm');
	} catch (e) {
	}

	this.func = function_name;
	functionString = '' + function_name;
	//alert(typeof functionString+'\n'+functionString+'\n'+functionString.match(functionRegExp))
	//	detect error
	if (!functionString.match(functionRegExp))
		//	JScript5 不能用throw!	http://www.oldversion.com/Internet-Explorer.html
		//throw new Error(1002,'Syntax error(語法錯誤)');
		return 1002;

	//	可能是用了dupF=oF
	//if(functionString!=RegExp.$1)throw new Error(1,'Function name unmatch(函數名稱不相符)');


	function_name = RegExp.$1;
	functionArguments = RegExp.$2.split(',');
	functionContents = RegExp.$3;
	for ( var i = 0; i < functionArguments.length; i++) {
		functionArguments[i] = functionArguments[i].replace(/\s+$|^\s+/g, '')
				// 去除前後空白
				// .replace(/\s+$/,'').replace(/^\s+/,'')
				;
		if (functionArguments[i].match(/\s/))
			//throw new Error(1002,'Syntax error at arguments(語法錯誤)');
			return 1002;
	}

	//	在HTML中用this.name=會改變window.name!
	this.funcName = function_name;
	this.arguments = functionArguments;
	this.contents = functionContents;
	//this.parse=[functionArguments,functionContents];
	//alert('function '+this.name+'('+this.arguments+'){\n'+this.contents+'}')
	return this;
}




//	補強String.fromCharCode()
function fromCharCode(c){
 if(!isNaN(c))return String.fromCharCode(c);
 try{return eval('String.fromCharCode('+c+');');}catch(e){}//	直接最快
/*
 if(typeof c=='string')return eval('String.fromCharCode('+n+')');//c=c.split(',');	後者可以通過審查
 if(typeof c=='object'){
  var t='',d,i,a,n=[];
  if(c.length)a=c;else{a=[];for(i in c)a.push(c[i]);}
  for(i=0;i<a.length;i++)
   if(!isNaN(c=a[i])||!isNaN(c=(''+a[i]).charCodeAt(0)))n.push(c);	//	跳過無法判讀的值
  return eval('String.fromCharCode('+n+')');//n.join(',')	這樣較快
 }
*/
}





/*	2008/8/2 10:10:49
	對付有時 charCodeAt 會傳回 >256 的數值。	http://www.alanwood.net/demos/charsetdiffs.html
	若確定編碼是 ASCII (char code 是 0~255) 即可使用此函數替代 charCodeAt
*/
function toASCIIcode(s,a){	//	string, at
 var _f=arguments.callee,c;

 if(!_f.t){
  //	initial
  var i=129,t=_f.t=[],l={8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
  for(;i<256;i+=2)
   t[i]=i;
  for(i in l)
   //sl(i+' = '+l[i]),
   t[Math.floor(i)]=l[i];
 }

 if(a<0&&!isNaN(s))c=s;
 else c=s.charCodeAt(a||0);

 return c<128?c:_f.t[c]||c;
}


/*	2008/8/2 9:9:16
	encodeURI, encodeURIComponent 僅能編成 utf-8，對於其他 local 編碼可使用本函數。

e.g.,
f.src='http://www.map.com.tw/search_engine/searchBar.asp?search_class=address&SearchWord='+encodeUC(q[0],'big5')




perl
#use Encode qw(from_to);
use Encode;

my $tEnc='utf-8';

$t="金";

$t=Encode::decode($t,'big5');

Encode::from_to($t,$lEnc,$outEnc);

Encode::from_to

@b=split(//,$a);

for($i=0;$i<scalar(@b);$i++){
 $r.=sprintf('%%%X',ord($b[$i]));
};


*/
//encodeUC[generateCode.dLK]='toASCIIcode';
function encodeUC(u,enc){
 if(!enc||enc=='utf8')return encodeURI(u);

 with(new ActiveXObject("ADODB.Stream"))
  Type=2,//adTypeText;
  Charset=enc,
  Open(),
  WriteText(u),
  Position=0,
  Charset='iso-8859-1',
  u=ReadText(),
  Close();

 var i=0,c,r=[];
 for(;i<u.length;i++)
  r.push((c=u.charCodeAt(i))<128?u.charAt(i):'%'+toASCIIcode(c,-1).toString(16).toUpperCase());

 return r.join('').replace(/ /g,'+');
}





/*	String to RegExp	qq// in perl
	(pattern text, flags when need to return RegExp object, char pattern need to escape)
*/
function to_RegExp_pattern(t,toR,p){
 var r=t
	.replace(p||/([.+*?|()\[\]\\{}])/g,'\\$1')	//	不能用 $0
	.replace(/^([\^])/,'\\^').replace(/([$])$/,'\\$')	//	這種方法不完全，例如 /\s+$|^\s+/g
	;
 return toR?new RegExp(r,/^[igms]$/i.test(toR)?toR:''):r;
}
//String.prototype.toRegExp=function(f){return to_RegExp_pattern(this.valueOf(),f);};


/*
	http://msdn.microsoft.com/zh-tw/library/x9h97e00(VS.80).aspx
		如果規則運算式已經設定了全域旗標，test 將會從 lastIndex 值表示的位置開始搜尋字串。如果未設定全域旗標，則 test 會略過 lastIndex 值，並從字串之首開始搜尋。
	http://www.aptana.com/reference/html/api/RegExp.html

附帶 'g' flag 的 RegExp 對相同字串作 .test() 時，第二次並不會重設。因此像下面的 expression 兩次並不會得到相同結果。
var r=/,/g,t='a,b';WScript.Echo(r.test(t)+','+r.test(t));

改成這樣就可以了：
var r=/,/g,t='a,b',s=renew_RegExp_flag(r,'-g');WScript.Echo(s.test(t)+','+s.test(t));

這倒沒問題：
r=/,/g,a='a,b';if(r.test(a))alert(a.replace(r,'_'));


** delete r.lastIndex; 無效，得用 r.lastIndex=0;
因此下面的亦可：
if(r.global)r.lastIndex=0;
if(r.test(a)){~}
*/
function renew_RegExp_flag(r,f){
 var i,fs={global:'g',ignoreCase:'i',multiline:'m'};

 //	未設定 flag,
 if(!f){
  f='';
  for(i in fs)
   if(r[i])f+=fs[i];
  return f;
 }

 var a=f.charAt(0),F='',m;
 a=a=='+'?1:a=='-'?0:(F=1);

 if(F)
  //	無 [+-]
  F=f;
 else
  //	f: [+-]~ 的情況，parse flag
  for(i in fs)
   if((m=f.indexOf(fs[i],1)!=-1)&&a || !m&&r[i])
    F+=fs[i];
 
 return new RegExp(r.source,F);
}


/*	2004/5/27 16:08
	將 MS-DOS 萬用字元(wildcard characters)轉成 RegExp, 回傳 pattern
	for search

usage:
	p=new RegExp(turnWildcardToRegExp('*.*'))


flag&1	有變化的時候才 return RegExp
flag&2	add ^$


萬用字元經常用在檔名的置換。
* 代表任意檔案名稱
如：ls * 表示列出所有檔案名稱。
? 則代表一個字元
如: ls index.??? 表示列出所有 index.三個字元 的檔案名稱
[ ] 代表選擇其中一個字元
[Ab] 則代表 A 或 b 二者之中的一個字元
如: ls [Ab]same 為 Asame 或 bsame
[! ] 代表除外的一個字元
[!Ab] 則代表 不是 A 且 不是 b 的一個字元
如: [!0-9] 表不是數字字元
如: *[!E] 表末尾不是 E 的檔名

memo:
檔案名稱不可包含字元	** 不包含目錄分隔字元 [\\/]:
/:*?"<>|/

*/

//	萬用字元 RegExp source, ReadOnly
turnWildcardToRegExp.w_chars='*?\\[\\]';

function turnWildcardToRegExp(p,f){	//	pattern, flag

 if(p instanceof RegExp)return p;
 if(!p||typeof p!='string')return;

 var ic=arguments.callee.w_chars,r;
 if((f&1) && !new RegExp('['+ic+']').test(p))
  return p;

 ic='[^'+ic+']';
 r=p
	//	old: 考慮 \
	//.replace(/(\\*)(\*+|\?+|\.)/g,function($0,$1,$2){var c=$2.charAt(0);return $1.length%2?$0:$1+(c=='*'?ic+'*':c=='?'?ic+'{'+$2.length+'}':'\\'+$2);})

	//	處理目錄分隔字元：多轉一，'/' → '\\' 或相反
	.replace(/[\\\/]+/g,typeof dirSp=='string'?dirSp:'\\')

	//	在 RegExp 中有作用，但非萬用字元，在檔名中無特殊作用的
	.replace(/([().^$\-])/g,'\\$1')

	//	* 代表任意檔案字元
	.replace(/\*+/g,'\0*')

	//	? 代表一個檔案字元
	.replace(/\?+/g,function($0){return '\0{'+$0.length+'}'})

	//	translate wildcard characters
	.replace(/\0+/g,ic)

	//	[ ] 代表選擇其中一個字元
	//pass

	//	[! ] 代表除外的一個字元
	.replace(/\[!([^\]]*)\]/g,'[^$1]')

	;


 //	有變化的時候才 return RegExp
 if(!(f&1) || p!=r)try{
  p=new RegExp(f&2?'^'+r+'$':r,'i');
 }catch(e){
  //	輸入了不正確的 RegExp：未預期的次數符號等
 }

 return p;
}




//	string & Number處理	-----------------------------------------------

//	set prototype's function of 內建物件 for 相容性(not good way..)
//setTool[generateCode.dLK]='*setTool();';//,product,countS,decplaces,getText,turnUnicode,trimStr,StrToDate,DateToStr,JSalert
function setTool(){
 if(!String.prototype.x&&typeof product=='function')String.prototype.x=product;
 if(!String.prototype.count&&typeof countS=='function')String.prototype.count=countS;
 if(!Number.prototype.decp&&typeof decplaces=='function')Number.prototype.decp=decplaces;
 if(!String.prototype.gText&&typeof getText=='function')String.prototype.gText=getText;
 if(!String.prototype.turnU&&typeof turnUnicode=='function')String.prototype.turnU=turnUnicode;
 if(!String.prototype.trim&&typeof trimStr=='function')String.prototype.trim=trimStr;
 //if(!Array.prototype.unique&&typeof Aunique=='function')Array.prototype.unique=Aunique;	//	建議不用，因為在for(in Array)時會..

 if(!String.prototype.toDate&&typeof StrToDate=='function')String.prototype.toDate=StrToDate;
 if(!Date.prototype.toStr&&typeof DateToStr=='function')Date.prototype.toStr=DateToStr;
 if(typeof alert=='undefined'&&typeof JSalert=='function')alert=JSalert;	//	在HTML中typeof alert=='object'
}

function Aunique(){return uniqueArray(this);}
function uniqueArray(a,f){	//	array,sortFunction
 if(f)a.sort(f);else a.sort();
 var i=1,j=-1;
 for(;i<a.length;i++)
  if(a[i]==a[i-1]){if(j<0)j=i;}
  else if(j>=0)a.splice(j,i-j),i=j,j=-1;
 if(j>=0)a.splice(j,i-j);
 return a;
}

function product(c){
 if(isNaN(c)||(c=Math.floor(c))<1)return '';
 var i,r='',s=[];s[i=1]=this;
 while(i+i<=c)s[i+i]=s[i]+s[i],i+=i;
 while(c){if(i<=c)r+=s[i],c-=i;i/=2;}
 return r;//in VB:String(c,this)
}
//	計算string中出現k之次數	用s///亦可@perl
function countS(k){	//	k亦可用RegExp
 //var c=0,s=this,i=0,l;if(k&&typeof k=='string'){l=k.length;while((i=this.indexOf(k,i))!=-1)c++,i+=l;}return c;
 return (this.length-this.replace(k,'').length)/k.length;
}


_// JSDT:_module_
.
/**
 * 取至小數d位，
 * 原因：JScript即使在做加減運算時，有時還是會出現1.4000000000000001，0.0999999999999998等數值。此函數可取至1.4與0.1
 * @param digits	number of decimal places shown
 * @param max	max digits	max==0:round() else floor()
 * @return
 * @see
 * https://bugzilla.mozilla.org/show_bug.cgi?id=5856
 * IEEE754の丸め演算は最も報告されるES3「バグ」である。
 * http://www.jibbering.com/faq/#FAQ4_6
 * @example
 * {var d=new Date,v=0.09999998,i=0,a;for(;i<100000;i++)a=v.decp(2);alert(v+'\n→'+a+'\ntime:'+gDate(new Date-d));}
 */
decplaces = function(digits, max) {
	var v = this.valueOf(),
	i, n;

	if (isNaN(v))
		return v;

	if (isNaN(digits) || digits < 0)
		// 內定：8位
		digits = 8;
	else if (digits > 20)
		digits = 20;

	if (!max && Number.prototype.toFixed)
		return parseFloat(v.toFixed(digits));

	if (v < 0)
		// 負數
		n = 1, v = -v;
	if ((i = (v = v.toString(10)).indexOf('e')) != -1)
		return v.charAt(i + 1) == '-' ? 0 : v;

	//library_namespace.debug(v);
	if (i = v.indexOf('.'), i != -1) {
		if (i + 1 + digits < v.length)
			if (max)
				v = v.slice(0, i + 1 + digits);
			else {
				v = '00000000000000000000' + Math.round(
						v.slice(0, i++) + v.substr(i, digits) + '.'
						+ v.charAt(i + digits)).toString(10);
				// (v!=0?alert(v+','+v.length+','+digits+','+v.substr(0,v.length-digits)+','+v.substr(max)):0);
				v = v.slice(0, max = v.length - digits) + '.' + v.substr(max);
			}
	}

	return v ? parseFloat((n ? '-' : '') + v) : 0;
};
/*	old:very slow
function decplaces(d,m){
 var v=this.valueOf(),i;if(isNaN(v))return v;
 if(isNaN(d)||d<0)d=8;	//	內定：8位
 if(!m){
  v=Math.round(Math.pow(10,d)*v);v=v<0?'-'+'0'.x(d)+(-v):'0'.x(d)+v;
  v=v.slice(0,i=v.length-d)+'.'+v.substr(i);
 }else if(i=(v=''+v).indexOf('.')+1)v=v.slice(0,i+(d?d:d-1));
 return parseFloat(v||0);
}
*/

/*
//	增添單位
var addDenominationSet={};
addDenominationSet.a=',,,,'.split(',');
function addDenomination(a,b){

}
*/




//var sourceF=WScript.ScriptName,targetF='test.js';simpleWrite('tmp.js',alert+'\n'+simpleRead+'\n'+simpleWrite+'\nvar t="",ForReading=1,ForWriting=2,ForAppending=8\n,TristateUseDefault=-2,TristateTrue=-1,TristateFalse=0\n,WshShell=WScript.CreateObject("WScript.Shell"),fso=WScript.CreateObject("Scripting.FileSystemObject");\nt='+dQuote(simpleRead(sourceF),80)+';\nsimpleWrite("'+targetF+'",t);//eval(t);\nalert(simpleRead("'+sourceF+'")==simpleRead("'+targetF+'")?"The same (test dQuote OK!)":"Different!");');//WshShell.Run('"'+getFolder(WScript.ScriptFullName)+targetF+'"');
//	determine quotation mark:輸入字串，傳回已加'或"之字串。
/*
dQuote.qc=function(c,C){
	return c<32?'\\'+c:C;
};
*/
function dQuote(s,len,sp){	//	string,分割長度(會採用'~'+"~"的方式),separator(去除末尾用)
 var q;s=''+s;if(sp)s=s.replace(new RegExp('['+sp+']+$'),'');	//	去除末尾之sp
 if(isNaN(len)||len<0)len=0;
 if(len){
  var t='';
  for(;s;)t+='+'+dQuote(s.slice(0,len))+'\n',s=s.substr(len);	//	'\n':NewLine
  return t.substr(1);
 }
 //if(len){var t='';for(;s;)t+='t+='+dQuote(s.slice(0,len))+'\n',s=s.substr(len);return t.substr(3);}	//	test用
 s=s.replace(/\\/g,'\\\\')
	.replace(/\r/g,'\\r').replace(/\n/g,'\\n')	//	\b,\t,\f
	//	轉換控制字符
	.replace(/([\0-\37\x7f\xff])/g,function($0,$1){var c=$1.charCodeAt(0);return c<64?'\\'+c.toString(8):'\\x'+(c<16?'0':'')+c.toString(16);})
	//.replace(/([\u00000100-\uffffffff])/g,function($0,$1){})
	;
 //q=s.length;while(s.charAt(--q)==sp);s=s.slice(0,q+1);
 if(s.indexOf(q="'")!=-1)q='"';
 if(s.indexOf(q)!=-1)s=s.replace(new RegExp(q="'",'g'),"\\'");	//	,alert("Can't determine quotation mark, the resource may cause error.\n"+s);
 return q+s+q;
}

/*	2006/10/27 16:36
	from program\database\BaseF.pm
	check input string send to SQL server
*/
function checkSQLInput(str){
 if(!str)return '';
 // 限制長度
 if(maxInput&&str.length>maxInput)str=str.slice(0,maxInput);
 return str
	// for \uxxxx
	.replace(/\\u([\da-f]{4})/g,function($0,$1){return String.fromCharCode($1);})
	.replace(/\\/g,'\\\\')
	.replace(/\x00/g,'\\0')	//	.replace(/[\x00-\x31]/g,'')
	//.replace(/\x09/g,'\\t')
	//.replace(/\x1a/g,'\\Z')
	.replace(/\r/g,'\\r').replace(/\n/g,'\\n')	//	.replace(/\r\n/g,' ')
	.replace(/'/g,"''")	//	.replace(/"/g,'\\"')
	;
}
// 去掉前後space
function checkSQLInput_noSpace(str){
 return str?checkSQLInput(str.replace(/\s+$|^\s+/g,'')):'';	//	.replace(/[\s\n]+$|^[\s\n]+/g,'')
}


//	轉換字串成數值，包括分數等。分數亦將轉為分數。
function parseNumber(n){
 if(typeof n=='number')return n;
 if(!n||typeof n!='string')return NaN;
 n=n.replace(/(\d),(\d)/g,'$1$2');
 var m;
 if(m=n.match(/(-?[\d.]+)\s+([\d.]+)\/([\d.]+)/)){
  var p=parseFloat(m[1]),q=parseFloat(m[2])/parseFloat(m[3]);
  return p+(m[1].charAt(0)=='-'?-q:q);
 }
 if(m=n.match(/(-?[\d.]+)\/([\d.]+)/))return parseFloat(m[1])/parseFloat(m[2]);	//	new quotient(m[1],m[2])
 try{return isNaN(m=parseFloat(n))&&typeof eval=='function'?eval(n):m;}catch(e){return m;}
}






return (
	_// JSDT:_module_
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};
