
/**
 * @name	CeL function for debug
 * @fileoverview
 * 本檔案包含了 debug 用的 functions。
 * @since	
 */

/*

http://code.google.com/apis/ajax/playground/

*/

if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'code.debug';

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
/*
if (eval(library_namespace.use_function(
		'code.compatibility.is_DOM,data.split_String_to_Object')))
	return;
*/


/**
 * null module constructor
 * @class	code.debug 的 functions
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









//JSalert[generateCode.dLK]='getScriptName';//,*var ScriptName=getScriptName();
_// JSDT:_module_
.
/**
 * 顯示訊息視窗<br/>
 * alert() 改用VBScript的MsgBox可產生更多效果，但NS不支援的樣子。
 * @param message	message or object
 * @param {Number} [wait]	the maximum length of time (in seconds) you want the pop-up message box displayed.
 * @param {String} [title]	title of the pop-up message box.
 * @param {Number} [type]	type of buttons and icons you want in the pop-up message box.
 * @return	{Integer} number of the button the user clicked to dismiss the message box.
 * @requires	CeL.get_script_name
 * @see	<a href="http://msdn.microsoft.com/library/en-us/script56/html/wsmthpopup.asp">Popup Method</a>
 * @_memberOf	_module_
 */
JSalert=function (message, wait, title, type) {
	var _f=arguments.callee;
	if (typeof _f.cmd === 'undefined') // 控制是否彈跳出視窗
		_f.cmd = typeof WScript === 'object'
				&& /cscript\.exe$/i.test(WScript.FullName);

	// if(!message)message+='';//if(typeof message==='undefined')message='';else if(!message)message+=''; //
	// 有時傳入如message==null會造成error
	// WScript.Echo()會視情況：視窗執行時彈跳出視窗，cmd執行時直接顯示。但需要用cscript執行時才有效果。
	// http://www.microsoft.com/technet/scriptcenter/guide/sas_wsh_mokz.mspx
	// 可以用 WScript.Echo(t1,t2,..)，中間會以' '間隔
	if (_f.cmd && argument.length < 2)
		return WScript.Echo(message);

	if (!title &&
			// typeof getScriptName === 'function'
			this.get_script_name
			)
		title = getScriptName();

	if (isNaN(type))// typeof type!=='number'
		type = 64;

/*
	if (typeof WshShell != 'object')
		if (typeof WScript === 'object')
			WshShell = WScript.CreateObject("WScript.Shell");
		else
			return undefined;
*/
	if (this.WshShell != 'object')
		if (typeof WScript === 'object')
			this.WshShell = WScript.CreateObject("WScript.Shell");
		else
			return undefined;


	return this.WshShell.Popup(
			//	''+message: 會出現 typeof message==='object' 卻不能顯示的
			'' + message,
			wait, title, type
			);
};

// popup object Error(錯誤)
//popErr[generateCode.dLK]='JSalert,setTool,parse_Function';
function popErr(e,t,f){	//	error object, title, additional text(etc. function name)
 var T=typeof e;
 //alert((T=='object')+','+(e.constructor)+','+(Error)+','+(e instanceof Error))
 //	這裡e instanceof Error若是T=='object'&&e.constructor==Error有時不能達到效果！
 //	use: for(i in e)
 T=e instanceof Error?'Error '+(e.number&0xFFFF)+(e.name?' ['+e.name+']':'')+' (facility code '+(e.number>>16&0x1FFF)+'):\n'+e.description+(!e.message||e.message==e.description?'':'\n\n'+e.message):!e||T=='string'?e:'('+T+')'+e;
 f=f?(''+f).replace(/\0/g,'\\0')+'\n\n'+T:T;
 //	.caller只在執行期間有效。_function_self_.caller可用 arguments.callee.caller 代替，卻不能用arguments.caller
 //	arguments.callee.caller 被取消了。	http://www.opera.com/docs/specs/js/ecma/	http://bytes.com/forum/thread761008.html	http://www.javaeye.com/post/602661	http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/cd3d6d6abcdd048b
 if(typeof WshShell=='object')
  WshShell.Popup(f,0,t||'Error '+(arguments.callee.caller==null?'from the top level':'on '+(typeof parse_Function=='function'?parse_Function(arguments.callee.caller).funcName:'function'))+' of '+ScriptName,16);
 else alert(f);
 return T;
}






/*	debug用:	show function Class	2008/7/23 16:33:42
	!! unfinished !!
	//	http://fillano.blog.ithome.com.tw/post/257/59403
	//	** 一些內建的物件，他的屬性可能會是[[DontEnum]]，也就是不可列舉的，而自訂的物件在下一版的ECMA-262中，也可以這樣設定他的屬性。


usage:
showClass('registryF');
showClass(registryF);


trace 的技巧：

對沒 prototype 的，可能是：
var cl=(function(){
 return new ((function(){var kkk='xsa',aa=function(){return kkk;},init=function(){kkk='22';},_=function(){init();};_.prototype.get=function(){return aa();};return _;})());
})();
cl.constructor=null;	//	絕技…無效

sl(cl.get());
showClass('cl');
eval('sl(kkk)',cl.get);


*/

function showClass(c,n){
 var i,sp='<hr style="width:40%;float:left;"/><br style="clear:both;"/>',h='<span style="color:#bbb;font-size:.8em;">'
	,p=function(m,p){sl(h+n+(p?'.prototype':'')+'.</span><em>'+m+'</em> '+h+'=</span> '+f(c[m]));}
	,f=function(f){return (''+f).replace(/\n/g,'<br/>').replace(/ /g,'&nbsp;');};
 if(typeof c=='string'){
  if(!n)n=c;
  c=eval(c);
 }
 if(!n)n='';
 sl('<hr/>Show class: ('+(typeof c)+')'+(n?' [<em>'+n+'</em>]':'')+'<br/>'
	//+(n?'<em>'+n+'</em> '+h+'=</span> ':'')
	+f(c));
 if(c){
  sl(sp+'class member:');
  for(i in c)
   if(i!='prototype')p(i);
  sl(sp+'prototype:');
  c=c.prototype;
  for(i in c)
   p(i,1);
 }
 sl('<hr/>');
}

showClass.repository={};
showClass.repositoryName='';
showClass.setRepository=function(n){
 var _f=arguments.callee;
 _f.repositoryName=n;
 _f.repository=eval(n);
 if(!_f.repository)_f.repository=eval(n+'={}');
};
/**
 * ** loop?
 * @param	name	name
 * @param	scope	scope
 * @ignore
 * @return
 */
showClass.showOnScope = function(name, scope) {
	var _f = arguments.callee, r = _f.repository;
	// 遇到 _f.repositoryName 剛好為 local 值時會失效。
	eval(_f.repositoryName + '.' + name + '=' + name, typeof scope == 'string' ? r[scope] : scope);
	return _f(r[name], name);
};


//	debug用:	show contents of object	2000-2003/2/22 15:49
//var i,t='';for(i in o)t+=i+':'+o[i];alert(t);
function showObj(obj,mode,searchKey,printmode,range){//object,mode,search string
 var Obj,m='',M=[],M_=0,i,v,search,r2=99,sp='	';if(!range)range=2e3;
 if(typeof obj=='object')Obj=obj;else if(typeof obj=='string'&&typeof document!='undefined')
  if((i=obj.indexOf('.'))<1)Obj=document.getElementById(obj);
  else if(Obj=document.getElementById(obj.slice(0,i)),typeof Obj=='object')Obj=eval('Obj.'+obj.substr(i+1));
 if(!Obj)try{Obj=eval(obj);}catch(e){Obj=obj;}
 search=searchKey?isNaN(searchKey)?searchKey==''?0:2:1:searchKey==0?1:0;//0:not search,1:num,2:string
 if(search==1&&searchKey!=''+parseFloat(searchKey))search=2;
 //if(searchKey)if(isNaN(searchKey))if(searchKey=='')search=0;else search=2;else search=1;else search=0;
 //if(!mode&&mode!=0&&is.ns4)mode=1;
 if(typeof Obj=='object'&&Obj)
  if(!mode){for(i in Obj)m+=i+sp;if(m)M.push(m),M_+=m.length,m='';}
  else if(mode==1){
   for(i in Obj){v=''+Obj[i];//''+eval('Obj.'+i);
    if(search&&i.indexOf(searchKey)==-1&&(!v||search==2&&v.indexOf(searchKey)==-1||v!=searchKey))continue;
    m+=i+'='+(v?typeof v=='string'&&v.length>r2?v.slice(0,r2)+'..(string length '+v.length+')':v:'(nothing:'+typeof v+')')+sp;
    if(m.length>range)M.push(m),M_+=m.length,m='';
   }
   if(m)M.push(m),M_+=m.length,m='';
  }else m+='Error mode '+mode+' .';
 else m='** No such object: '+obj+' ! **\n('+typeof obj+')'+obj+'='+Obj;
 if(printmode&&printmode==1&&typeof document!='undefined')
  with(document)open('text/plain'),clear(),write('content of '+obj+':'+(search?'search for '+searchKey+(search==1?'(num)':'(str)'):'')+' <!-- reload to HTML --><br/>\n'+m),close();
 else if(M_)for(v=i=0;i<M.length;i++)t=obj+' : '+v+'-'+(v+=M[i].length)+'/'+M_+(search?', search for '+searchKey+(search==1?'(number)':'(string)')+'.':''),alert(t+' [Enter] to continue..\n\n'+M[i]);
 else alert('showObj() error:\n'+(m||'show '+obj+': Got nothing!'));
}




return (
	_// JSDT:_module_
);

};


//===================================================


CeL.setup_module(module_name, code_for_including);

};
