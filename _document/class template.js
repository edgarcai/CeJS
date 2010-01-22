
/*

********	class template		********

用
=function(){}()
似乎亦可，見 SWFObject 2.2
*/

var ClassT={};	//	class template set	讓 addCode 也可以讀通



//	===================================================
/*
	** class description: class template (simple version)

_=this

TODO:


HISTORY:
2008/7/21 16:12:32	create
*/
var
classT=

(ClassT.classT=function(initF){

var

//	class private	-----------------------------------


//	instance constructor	---------------------------
instanceL=[],
initI=function(a){
 var _t=this,_p=pv(_t);
 instanceL.push(_t);	//	for destructor
 //_p.vars=a

 //	initial instance object
},_=function(){initI.apply(this,arguments);initF&&initF.apply(this,arguments);},


//	(instance private handle)	不要 instance private 的把這函數刪掉即可。
_p='_'+(''+Math.random()).replace(/\./,''),
//	get private variables (instance[,destroy]), init private variables (instance[,access function list[, instance destructor]])
pv=function(i,d,k){var V,K=_p('k');return arguments.callee.caller===_p('i')?(V=_p(i[K]=_p()),V.O=i,V.L={}):(K in i)&&(V=_p(i[K]))&&i===V.O?d?(_p(i[K],1),delete i[K]):V.L:{};};

//	class destructor	---------------------------
/*
please call at last (e.g., window.unload)

usage:
classT=classT.destroy();
or if you has something more to do:
classT.destroy()&&classT=null;
*/

_.destroy=function(){for(var i=0,l=instanceL.length;i<l;i++)instanceL[i].destroy();_p();};

//	(instance private handle, continue)
eval('_p=(function(){var '+_p+'={a:pv,d:_.destroy,c:0,k:"+pv+'+Math.random()+'",i:initI};return function(i,d){var f=arguments.callee.caller;if(f==='+_p+'.a){if(!d)return i in '+_p+'?'+_p+'[i]:('+_p+'[i='+_p+'.c++]={},i);'+_p+'[i]={};}if(f==='+_p+'.d)'+_p+'={};}})();');
_p.toString=function(){return'';};


//	class public interface	---------------------------

//	func
_.func=function(){
 var _t=this;
 
};

//	class constructor	---------------------------

// do something others


_.prototype={
//	應該盡量把東西放在 class，instance 少一點…？
//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！

//	instance public interface	-------------------

setV:function(a){
 var _t=this,_p=pv(_t);
 //_p.vars=a
},


//	instance destructor	---------------------------
/*
usage:
instance=instance.destroy();
or if you has something more to do:
instance.destroy()&&instance=null;
*/
destroy:function(){pv(this,1);}
};	//	_.prototype=

return _;
})();	//	function(initF){

//	===================================================






//	解析



//	===================================================

/*
	** class description: class template

_=this

TODO:
.constructor 設定
inherits:
	http://www.cnblogs.com/birdshome/archive/2005/01/28/95933.html
	http://www.blogjava.net/zkjbeyond/archive/2006/05/08/45108.html


HISTORY:
2008/7/21 16:12:32	create
7/24 15:14:16	enhanced by set .toString. But.. If we use delete _p.toString, than we still can..
		eval('a = pv',some_instance);
		eval('var s=_p.toString;delete _p.toString;sl("** test1 _p: "+_p);_p.toString=s;sl("** test2 _p: "+_p);',a);
7/26 11:38:6	className

TOTRY:
直接對 eval 下手，使 delete 掉 eval 則 lost data
*/
var
classT_debug=

//	若是不須讓 addCode 也可以讀通，不加 ClassT.~ 也沒關係。
(ClassT.classT=function(initF){	//	initF: additional initialization function

var

//	class private	-----------------------------------
className='',//classT

//	variables
vars=7,
//	function
doLog=function(m){
 var _t=_;
 sl((className?className+': ':'>> ')+m);	//	this+': '
},



//	instance constructor	---------------------------
instanceL=[],	// 實例 list
initI=function(a){
 var _t=this,//	這裡面有用的是 this，不是 arguments.callee。
	_p=pv(_t);//pv(_t,[func1,func2,..],_.destroy);	//	init private variables
 instanceL.push(_t);	//	for destructor

 //	initial instance object
 _t.property1=[];

 _t.testV=a;
 doLog('class create: '+a);

 //return this;
},

//	盡量減少 instance 體積…有用嗎？
_=function(){
	initI.apply(this,arguments);
	initF&&initF.apply(this,arguments);
},


//	(instance private handle)	不要 instance private 的把這函數刪掉即可。
/*
更完整的防治：比對 arguments.callee.caller 的程式碼，確定登錄過才給予存取。
…在 eval() 的第二 argument 下無用武之地。
*/

_p='_'+(''+Math.random()).replace(/\./,''),

pv=function(i,d,k){	//	get private variables (instance[,destroy]), init private variables (instance[,access function list[, instance destructor]])
 var	V,K=_p('k');
/*	V: get variables

V.L	variables {}
V.O	instance

for full version:
V.F	可存取函數的程式碼 list {}
V.D	instance destructor
*/

//	simple version
 if(0)return arguments.callee.caller===_p('i')?
	(V=_p(i[K]=_p()),V.O=i,V.L={})
	:(K in i)&&(V=_p(i[K]))&&i===V.O?
		d?(_p(i[K],1),delete i[K]):V.L
		:{};	//	竄改就會出 trouble


//	full version
 var c=arguments.callee.caller,j=0,l;
 doLog('pv: '+(c===_p('i')?'init':d?'destory':'get variables')+' by '+c);
 if(c===_p('i')){
  V=_p(i[K]=_p());
  V.O=i;
  if(k)V.D=k;	//	instance destructor
  //	登錄可存取函數的程式碼。更狠的：不用 {} 而用 d，確定是 *完全相同* 的 function。
  if(d instanceof Array)	//	[]: no access!!
   for(k=V.F={},l=d.length;j<l;j++)
    k[d[j]]=1;
  return V.L={};
 }

 //	預防竄改，找尋本來應該的 index。
 if(!(K in i)||!(V=_p(i[K]))||i!==V.O)
  for(k=_p('c');j<k;j++)
   if(i===_p(j).O){
    doLog('pv: correct index: '+i[K]+' to '+j);
    i[K]=j;
    break;
   }

 if((K in i)&&(V=_p(i[K]))&&i===V.O)
  if(d){
   //	call from instance destructor
   if(!V.D||c===V.D)_p(i[K],1),delete i[K];
   //else throw new Error(3,'Error calling to destroy.');
  }else if(!V.F||V.F[c]){
   doLog('pv: get index '+i[K]+'.');
   //if(!V.L)throw new Error(1,'Error to get variables! Maybe it was already destroyed?');//private variables
   return V.L;
  }

 return {};	//	throw new Error(1,'Illegal access!');
};	//	of pv=function(


//	(for inherits)
/*
不要 inherit 的把這段刪掉即可。
usage:
//	模擬 inherits
newClass=oldClass.clone();
//	prevent re-use. 防止再造 
delete oldClass.clone;
*/
(_.clone=arguments.callee).toString=function(){return '[class_template]';};


//	class destructor	---------------------------
/*
please call at last (e.g., window.unload)

usage:
classT=classT.destroy();
or if you has something more to do:
classT.destroy()&&classT=null;
*/

_.destroy=function(){
 doLog('destroy: Destroy class.');
 for(var i=0,l=instanceL.length;i<l;i++)
  instanceL[i].destroy();
 _p();
};


//	class public interface	---------------------------

//	variables
_.variables={};
//	func
_.func=function(){
 var _t=this;
 
};


//	(instance private handle, continue)
//	.a: accessable caller function, .d: class destructor, c:count, .k: private variables keyword, .i: init function, m: accessable class members
//	destructor: (index,1)	Warning: 某些環境中 Array 可能無法用 delete?
eval('_p=(function(){var '+_p+'={a:pv,d:_.destroy,c:0,k:"+pv+'+Math.random()+'",i:initI,m:{_:{}}}; (function(m,i){for(i=0;i<m.length;i++)if(m[i])'+_p+'.m[m[i]]=1;})(['
	//'func1,func2'	//	在這裡填上需要 call 隱藏數值的 class private function。若無，可考慮合併到 _.destroy 前。
	+']); return function(i,d){var f=arguments.callee.caller;if(f==='+_p+'.a){if(!d)return i in '+_p+'?'+_p+'[i]:('+_p+'[i='+_p+'.c++]={},i);'+_p+'[i]={};}if('+_p+'.m[f])return '+_p+'.m._;if(f==='+_p+'.d)'+_p+'={};}})();');
_p.toString=function(){return '';};


//	class constructor	---------------------------

// do something others


_.prototype={
//	應該盡量把東西放在 class，instance 少一點…？

//	instance public interface	-------------------

//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！
property1:[],

setV:function(m){
 var _t=this,_p=pv(_t);
 doLog('setV: class vars='+(vars=m)+', this.vars='+(_p.vars=m));
},

getV:function(){
 var _t=this,_p=pv(_t);
 doLog('getV: class vars='+vars+', this.vars='+_p.vars);
},


//	instance destructor	---------------------------

/*
usage:
instance=instance.destroy();
or if you has something more to do:
instance.destroy()&&instance=null;

TODO: Need *auto* detect if the object is destroyed.
*/
destroy:function(){
 //	If you need to do something (e.g, destroy sub-sub-objects) before destroy it, you need to call pv(this) first here.
 pv(this,1);
}

};	//	_.prototype=

//	class name	---------------------------
if(className){
 _.prototype.toString=_.toString=function(){return '[class '+className+']';};//classT
 //eval('var className=_',this);	//	行不通
}

return _;
})();	//	(function(){


//	===================================================


/*
//	test suit
sl('<hr/>');
var c1=new classT(123),c2=new classT(456);

c1.setV('Hello');
c2.setV('World');
c1.getV();
c2.getV();

sl(c1.testV+','+c2.testV);

c1.destroy();
c2.destroy();
classT.destroy();
*/





/*
繼承
http://www.cnblogs.com/birdshome/archive/2005/01/28/95933.html


引入arguments.length：這代表傳入引數個數（長度），arguments.callee.length：這代表(function)自身定義的引數個數（長度）
function fn(){
 var _f=arguments.callee;	//	f: function, flag	引入arguments.callee：這代表(function)自身
 //	以 _f.* 替代 fn.*
 alert('fn: _f.val='+_f.val);
}
fn.subfn=function(){
 var _f=arguments.callee;	//	function, flag
 //	當不用 new 時，以 _f.* 替代 fn.subfn.*，this.* 替代 fn.*。但在 (fn.subfn=function(){ .. }) 中間就不能用 this, _f
 alert('fn.subfn: this.val='+this.val);	//	*** !!WARNING!! 在 eval() 中 this 可能表示 window，這時就無法用 this 來得到 fn 了。
 alert('fn.subfn: _f.val='+_f.val);
};
fn.subfn.val='test value: fn.subfn.val';
fn.val='test value: fn.val';
fn.prototype={
constructor:fn,	//	need to adjust
subfn:function(){
 var _f=arguments.callee;	//	function, flag
 //	當不用 new 時，以 _f.* 替代 fn.subfn.*，this.* 替代 fn.*
 alert('fn.prototype.subfn: this.val='+this.val);
 alert('fn.prototype.subfn: _f.val='+_f.val);
 alert('fn.prototype.subfn: this.constructor.val='+this.constructor.val);
},
val:'test value: fn.prototype.val'
};	//	fn.prototype={
fn.prototype.subfn.val='test value: fn.prototype.subfn.val';
var inst=new fn;
//inst.constructor.subfn();
inst.subfn();


var obj={
 val:34,
 fn:function(){
  var _f=arguments.callee;	//	function, flag
  //	以 _f.* 替代 obj.subfn.*，this.* 替代 obj.*
  alert(this.val);
 }
};
ww.ee();



to hack @ Firefox 3.0:	https://bugzilla.mozilla.org/show_bug.cgi?id=442333
假設 scope obj.fn 裡有一個 foo 變數，在 Firefox 上可以使用 var a; eval('a = foo', obj.fn) 把 foo 變數抓到 a 裡面，所以你如果有使用這種方法來放與安全性有關的東西，就得重新檢查一次程式碼：Module Pattern Provides No Privacy…at least not in JavaScript(TM)。在一陣討論後，這個功能打算在 Firefox 3.1 拿掉：Remove eval's optional second argument。

*/


/*
實作class:
	http://www.remus.dti.ne.jp/~a-satomi/bunsyorou/ArekorePopup.html
	http://www.klstudio.com/post/32.html
function classA(){
 //	define property
 //	array
 this.attrs=['title','href','cite','datetime'];
 //	object
 this.ns={
	xhtml1:'http://www.w3.org/1999/xhtml',
	xhtml2:'http://www.w3.org/2002/06/xhtml2',
 };
 return this;
}
classA.prototype={
 //	function
 launch:function(){},
 init:function(){},
 //	object
 scanNode:{
  recursive:function(node){}
 },
 //	http://dean.edwards.name/weblog/2005/10/add-event/
 addEvent:function(obj,type,listener){
  if (obj.addEventListener) // Std DOM Events
   obj.addEventListener(type, listener, false);
  else if (obj.attachEvent) // IE
   obj.attachEvent(
    'on' + type,
    function() { listener( {
     type		: window.event.type,
     target		: window.event.srcElement,
     currentTarget	: obj,
     clientX		: window.event.clientX,
     clientY		: window.event.clientY,
     pageY		: document.body.scrollTop + window.event.clientY,
     keyCode		: window.event?window.event.keyCode:e?e.which:0,
     shiftKey		: window.event.shiftKey,
     stopPropagation	: function() { window.event.cancelBubble=true; }
    } ) }
   );
 }
};
var A=new classA();


*/


