
/**
 * @name	CeL quotient function
 * @fileoverview
 * 本檔案包含了 quotient 的 functions。
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
var module_name = 'math.quotient';

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
		'net.web.XML_node,net.web.set_attribute,net.web.remove_all_child,net.web.set_class,data.split_String_to_Object')))
	return;


//requires
if (eval(library_namespace.use_function(
	'data.split_String_to_Object')))
return;


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





// ============================================================================
//	definition of module quotient


var Repetend_spChar='_';	//	循環節分隔符號：整數.小數__Repetend_spChar__循環節
var quotient_defaultDigitChar='0123456789abcdefghijklmnopqrstuvwxyz';//.split('')
/*
有理數rational number，有理数全体のつくる集合はしばしば、商を意味する quotient の頭文字をとり、太字の Q で表す。
整數部分
分数	fraction
分子	numerator
vinculum  = "divide by"
分母	denominator
真分數	proper fraction
approximate:取近似值

eg.	alert((new quotient(3,4)).count('*',new quotient(2,7)).print());
*/
function quotient(numerator,denominator,base,approximate){
 if(typeof numerator=='object'&&numerator instanceof quotient)return numerator;//numerator.type=='quotient'
 if(isNaN(numerator))numerator=0;
 if(!denominator||isNaN(denominator))denominator=1;
 else if(denominator<0)denominator=-denominator,numerator=-numerator;

 var q=qNum(numerator);	//	qNum需test，並回傳(分子,分母,誤差)！
 if(!q)numerator=0;
 else if(approximate||!q[2])numerator=q[0],denominator*=q[1];	//	無誤差時使用之
 else while(numerator%1||denominator%1)numerator*=10,denominator*=10;	//	化為整數

 //	value
 this.n=numerator,this.d=denominator;//this.type='quotient';
 return this;
}

//	functions

//	最簡分數/化簡,約分reduction
quotient.prototype.reduce=function(){
 var g=gcd(this.n,this.d);
 if(g&&g>1)this.n/=g,this.d/=g;
 return this;
};
//	四則運算+-*/(+-×÷)**[=]
//	http://www.javaworld.com.tw/jute/post/view?bid=35&id=30169&tpg=1&ppg=1&sty=1&age=0#30169
quotient.prototype.count=function(op,q2){
 var q;
 if(op.slice(-1)=='=')q=this,op=op.slice(0,-1);
 else q=new quotient(this);
 q2=new quotient(q2);
 //document.write('<br/>'+this.type+','+q.print()+' , '+q2.print());
 if(op=='-')q2.n=-q2.n,op='+';
 else if(op=='/'){var t=q2.n;q2.n=q2.d,q2.d=t,op='*';}
 //document.write('<br/>'+q.print(1)+','+q2.print(1));
 if(op=='+')q.n=q.n*q2.d+q.d*q2.n,q.d*=q2.d;
 else if(op=='*')q.n*=q2.n,q.d*=q2.d;
 //	N! 是指 N的階乘 (Factorial,power)
 else if((op=='**'||op=='^')&&q2.reduce().d==1){q.reduce(),q.n=Math.pow(q.n,q2.n),q.d=Math.pow(q.d,q2.n);return q;}
 else{alert('quotient_count(): illegal operator ['+op+']!');return this;}
 //document.write('<br/>'+q.print(1)+','+q2.print(1));
 //	other: error
 //document.write('<br/>_'+q.reduce().print());
 try{return q.reduce();}catch(e){}
 return q;
};
/*	轉成循環小數 circulating decimal/repeating decimal	2004/7/9 13:28

	ch:
	循環小數 digital 字集

	http://mathworld.wolfram.com/RepeatingDecimal.html
	http://hk.geocities.com/goodprimes/OFrp.htm
	return (decimal/數字部分string,repunitIndex/循環節Repetend出現在)
	可以考慮使用.toString()，會快很多。
*/
quotient.prototype.base=function(base,ch){
 if(!base&&!ch)return this.toDec();
 if(!base)base=10;	//	基底預設為10進位
 //if(!isNaN(ch))ch+='';
 if(typeof ch!='string'||ch.length<2)
  ch=quotient_defaultDigitChar;	//	字集
 if(base<2||base>ch.length)return;	//	illegal base

 this.reduce();
 var d=this.d,f,o=this.n,i,t,m=0;
 if(o<0)o=-o,m=1;	//	負數

 //	find base的因數Factor
 f=getFloorFactor(base);

 //	find 分母的因數Factor與基底base之交集(不能用gcd)
 for(i=0,g=1,t=d;i<f.length;i+=2)
  while(t%f[i]==0)g*=f[i],t/=f[i];

 //	get整數integer部分→out
 f=o%d;
 i=(o-f)/d;
 o='';
 while(i)t=i%base,i=(i-t)/base,o=ch.charAt(t)+o;
 if(!o)o='0',m=0;
 //document.write('<br/>_'+typeof o+','+(o||'(null)')+','+o);
 if(!f)return (m?'-':'')+o;
 o+='.';	//	進入小數

 //	set 餘數f/分母d,餘數residue mark r=f,循環節Repetend location of out:l,已解決的因數s
 var r=f,l=o.length,s=1;

 //	do main loop
 for(;;){//while(o.length-l<d){	//	限制?位:debug用
  //document.write('<br/>.'+r+','+f+'/'+d+'('+base+'),'+s+':'+g+','+o);
  if(!f){l=0;break;}	//	可以整除，無循環。
  f*=base;
  if(s==g){	//	分母與base已互質
   t=f,f%=d,o+=ch.charAt((t-f)/d);
   if(f==r)break;	//	bingo!循環節結束
  }else{
   t=gcd(base,d),	//	f與d已互質
   s*=t,f/=t,d/=t,
   t=f,f%=d,o+=ch.charAt((t-f)/d),	//	do the same thing
   r=f,l=o.length;	//	r需重設..此處有否可能出問題?maybe not
  }
 }

 //	善後
 if(l)o+='('+(o.length-l)+')',o=o.slice(0,l)+Repetend_spChar+o.substr(l);
 if(m)o='-'+o;
 return o;
};
//quotient.prototype.base[generateCode.dLK]='quotient_defaultDigitChar';

//	為十進位最佳化的quotient_turnBase()	2004/7/9 13:47
quotient.prototype.toDec=function(){
 this.reduce();
 var d=this.d,t=d,g=1,m=0,f,o=this.n;
 if(o<0)o=-o,m=1;	//	負數

 //	find 分母的2,5因數
 while(t%2==0)g<<=1,t>>=1;
 while(t%5==0)g*=5,t/=5;

 //	get整數integer部分→out
 f=o%d,o=(o-f)/d;
 //document.write('<br/>_'+typeof o+','+(o||'(null)')+','+o);
 if(!f)return (m?'-':'')+o;	//	留下+-
 o+='.';	//	進入小數

 //	set 餘數f/分母d,餘數residue mark r=f,循環節Repetend location of out:l,已解決的因數s
 var r=f,l=o.length,s=1;

 //	do main loop
 for(;;){//while(o.length-l<d){//	//	限制?位:debug用
  //document.write('<br/>.'+r+','+f+'/'+d+','+s+':'+g+','+o);
  if(!f){l=0;break;}	//	可以整除，無循環。
  f*=10;
  if(s==g){	//	分母與base已互質
   t=f,f%=d,o+=(t-f)/d;
   if(f==r)break;	//	bingo!循環節結束
  }else{
   t=d%5==0?d%2==0?10:5:2,
   s*=t,f/=t,d/=t,
   t=f,f%=d,o+=(t-f)/d,	//	do the same thing
   r=f,l=o.length;	//	r需重設..此處有否可能出問題?maybe not
  }
 }

 //	善後
 if(l)o+='('+(o.length-l)+')',o=o.slice(0,l)+Repetend_spChar+o.substr(l);
 if(m)o='-'+o;
 return o;
};
/*	顯示	2004/7/9 14:23
	mode:
	0	假分數 improper fraction
	1	帶分數 mixed number
	2	直接除(10進)
	3	轉成循環小數,除至小數點下digit位數（非四捨五入！）

	ch:
	顯示帶分數時代表整數與真分數之間的分隔。多為' '或'+'。
	轉成循環小數時，代表循環小數digital字集


有效位數、小數位數	http://technet.microsoft.com/zh-tw/library/ms190476.aspx
Precision, Scale
有效位數是數字的位數。小數位數是數字中在小數點右側的位數。例如，123.45 這個數字的有效位數是 5，小數位數是 2。
Precision is the number of digits in a number. Scale is the number of digits to the right of the decimal point in a number. For example, the number 123.45 has a precision of 5 and a scale of 2.
*/
quotient.prototype.print=function(mode,base,ch,digit){
 if(mode<3||!mode){
  if(mode==2)return this.n/this.d;
  var p,f;
  if( !mode || this.n<this.d )p=this.n+'/'+this.d;
  else f=this.n%this.d,p=(this.n-f)/this.d+(f?(ch||'+')+f+'/'+this.d:'');
  return p;
 }

 if(mode==3){
  var n=this.base(base,ch);
  if(isNaN(digit))return n;
  var f=n.indexOf(Repetend_spChar),b=n.indexOf('.');
  if(f==-1||!digit)
   return b==-1?n:digit?n.slice(0,b+digit+1):n.slice(0,b);
  digit+=b+1,
  b=n.substr(f+1),	//	循環節
  n=n.slice(0,f);
  while(n.length<digit)n+=b;
  return n.slice(0,digit);
 }
};
//	測試大小：0:==,<0:<,>0:>
quotient.prototype.comp=function(q2){
 q2=new quotient(q2);
 return this.n*q2.d-this.d*q2.n;
};
/*	轉換數字的底數	2004/7/9 16:13
	回傳quotient物件，請用quotient.base()傳回所欲之base
*/
function turnBaseQ(num,base,ch){	//	Number, Base, Editable Output Coding (length defines Base)
 //if(!num)num=0;
 if(!base&&ch)base=ch.length;
 if(isNaN(base)||base<2||base>ch.length)base=10;
 if(!ch)ch=quotient_defaultDigitChar;
 if(!num||base==10&&(''+num).indexOf(Repetend_spChar)==-1)return new quotient(num);	//	可能有循環小數，所以不能放過僅僅base==10

 var i=0,n=new quotient(0,1),m=0,t=0,p,c={},r=new quotient(0,1);
 for(;i<ch.length;i++)c[ch.charAt(i)]=i;	//	字集

 num+='',i=-1,n.d=r.d=1;
 //document.write('<br/>'+i+','+num.length+','+t+','+num+','+n.print());
 if(num.charAt(0)=='-')i=0,m=1;
 while(++i<num.length&&(p=num.charAt(i))!='.')	//	整數
  if(isNaN(p=c[p])||p>=base)return;	//	error!
  else t=t*base+p;
 //document.write('<br/>'+i+','+num.length+','+t+','+num+','+n.print());
 while(++i<num.length&&(p=num.charAt(i))!=Repetend_spChar)	//	小數
  if(isNaN(p=c[p])||p>=base)return;	//	error!
  else n.n=n.n*base+p,n.d*=base;
 while(++i<num.length)	//	循環節
  if(isNaN(p=c[num.charAt(i)])||p>=base)return;	//	error!
  else r.n=r.n*base+p,r.d*=base;
 //document.write('<br/>**'+n.print());
 //	善後
 n=n.count('+=',t);
 if(r.n)r.d=(r.d-1)*n.d,n.count('+=',r);
 n.reduce();
 //document.write('<br/>*'+n.print());
 if(m)n.n=-n.n;
 return n;
}

/*	test
var q=turnBaseQ('10000.'+Repetend_spChar+'3',11);
if(!q)alert('bad input!');else document.write('<br/>'+q.base(8)+','+q.base()+' , '+q.print()+','+q.print(1)+','+q.print(2)+','+q.print(3,0,'',5));
*/




return (
	_// JSDT:_module_
);
};

//============================================================================

CeL.setup_module(module_name, code_for_including);

};
