
/**
 * @name	CeL function for package
 * @fileoverview
 * 本檔案包含了呼叫其他 library 需要用到的 function。
 * @since	2010/1/8 22:21:36
 */


/*
TODO:
use -> using

http://msdn.microsoft.com/en-us/library/2b36h1wa(VS.71).aspx
The arguments object is not available when running in fast mode, the default for JScript .NET. To compile a program from the command line that uses the arguments object, you must turn off the fast option by using /fast-. It is not safe to turn off the fast option in ASP.NET because of threading issues.
*/


typeof CeL === 'function' &&
function(){


var _ = this;




_// JSDT:_module_
.
/**
 * 延展物件 (learned from jQuery)
 * @since	2009/11/25 21:17:44
 * @param	variable_set	variable set
 * @param	name_space	extend to what name-space
 * @param	from_name_space	When inputing function names, we need a base name-space to search these functions.
 * @return	library names-pace
 * @see
 * <a href="http://blog.darkthread.net/blogs/darkthreadtw/archive/2009/03/01/jquery-extend.aspx" accessdate="2009/11/17 1:24" title="jQuery.extend的用法 - 黑暗執行緒">jQuery.extend的用法</a>,
 * <a href="http://www.cnblogs.com/rubylouvre/archive/2009/11/21/1607072.html" accessdate="2010/1/1 1:40">jQuery源码学习笔记三 - Ruby's Louvre - 博客园</a>
 */
extend = function(variable_set, name_space, from_name_space){
/*
	if(this.is_debug())
		throw new Error(1, 'UNDO');
*/
	var _s, i, l;

	if(name_space === undefined || name_space === null)
		//	如果沒有指定擴展的對象，則擴展到自身
		name_space = this;

	if(from_name_space === undefined)
		from_name_space = this;

	if(typeof variable_set === 'function'){
		if(this.parse_function){
		}else{
			_.warn('Warning: Please include ' + this.Class + '.parse_function() first!');
		}

	}else if(typeof variable_set === 'string'){
		if(name_space === from_name_space)
			;
		else if(variable_set in from_name_space){
			//_.debug('extend (' + (typeof variable_set) + ') ' + variable_set + '\n=' + from_name_space[variable_set] + '\n\nto:\n' + name_space);
			name_space[variable_set] = from_name_space[variable_set];
		}else
			try{
				name_space[variable_set] = this.eval_various(variable_set);
				//_.debug(variable_set + ' = ' + name_space[variable_set]);
			}catch(e){
				_.warn(this.Class + '.extend:\n' + e.message);
			}

	}else if(variable_set instanceof Array){
		for (_s = arguments.callee, i = 0, l = variable_set.length; i < l; i++) {
			_s.call(this, variable_set[i], name_space, from_name_space);
		}

	}else if(variable_set instanceof Object){
		for(i in variable_set){
			name_space[i] = variable_set[i];
		}
	}

	return this;
};


_// JSDT:_module_
.
/**
 * Get file resource<br/>
 * 用於 include JavaScript 檔之類需求時，取得檔案內容之輕量級函數。<br/>
 * 除 Ajax，本函數亦可用在 CScript 執行中。
 * @example
 * //	get contents of [path/to/file]:
 * var file_contents = CeL.get_file('path/to/file');
 * @param	{String} path	URI / full path. <em style="text-decoration:line-through;">不能用相對path！</em>
 * @param	{String} [encoding]	file encoding
 * @return	{String} data	content of path
 * @return	{undefined}	when error occurred: no Ajax function, ..
 * @throws	uncaught exception @ Firefox: 0x80520012 (NS_ERROR_FILE_NOT_FOUND), <a href="http://www.w3.org/TR/2007/WD-XMLHttpRequest-20070227/#exceptions">NETWORK_ERR</a> exception
 * @throws	'Access to restricted URI denied' 當 access 到上一層目錄時 @ Firefox
 * @see
 * <a href=http://blog.joycode.com/saucer/archive/2006/10/03/84572.aspx">Cross Site AJAX</a>,
 * <a href="http://domscripting.com/blog/display/91">Cross-domain Ajax</a>,
 * <a href="http://forums.mozillazine.org/viewtopic.php?f=25&amp;t=737645" accessdate="2010/1/1 19:37">FF3 issue with iFrames and XSLT standards</a>,
 * <a href="http://kb.mozillazine.org/Security.fileuri.strict_origin_policy" accessdate="2010/1/1 19:38">Security.fileuri.strict origin policy - MozillaZine Knowledge Base</a>
 */
get_file = function(path, encoding){
	//with(typeof window.XMLHttpRequest=='undefined'?new ActiveXObject('Microsoft.XMLHTTP'):new XMLHttpRequest()){

	/**
	 * XMLHttpRequest object.
	 * This can't cache.
	 * @inner
	 * @ignore
	 */
	var o;

	try{
		o = new ActiveXObject('Microsoft.XMLHTTP');
	}catch(e){
		o = new XMLHttpRequest();
	}

	if (o) with (o) {
		open('GET', path, false);

		if (encoding && o.overrideMimeType)
			/*
			 * old: overrideMimeType('text/xml;charset='+encoding);
			 * 但這樣會被當作 XML 解析，產生語法錯誤。
			 */
			overrideMimeType('application/json;charset=' + encoding);

		try {
			//	http://www.w3.org/TR/2007/WD-XMLHttpRequest-20070227/#dfn-send
			//	Invoking send() without the data argument must give the same result as if it was invoked with null as argument.
			send(null);

		} catch (e) {
			//	Apple Safari 3.0.3 may throw NETWORK_ERR: XMLHttpRequest Exception 101
			//this.warn(this.Class + '.get_file: Loading [' + path + '] failed: ' + e);
			//this.err(e);
			//this.debug('Loading [' + path + '] failed.');

			//e.object = o;	//	[XPCWrappedNative_NoHelper] Cannot modify properties of a WrappedNative @ firefox

			o = this.require_netscape_privilege(e, 2);
			//this.debug('require_netscape_privilege return [' + typeof (o) + ('] ' + o).slice(0, 200) + ' ' + (e === o ? '=' : '!') + '== ' + 'error (' + e + ')');
			if (e === o)
				throw e;
			return o;
		}

		//	當在 local 時，成功的話 status === 0。失敗的話，除 IE 外，status 亦總是 0。
		//	status was introduced in Windows Internet Explorer 7.	http://msdn.microsoft.com/en-us/library/ms534650%28VS.85%29.aspx
		//	因此，在 local 失敗時，僅 IE 可由 status 探測，其他得由 responseText 判別。
		//this.debug('Get [' + path + '], status: [' + status + '] ' + statusText);

		return responseText;
	}
	//	else: This browser does not support XMLHttpRequest.

	//	firefox: This function must return a result of type any
	return undefined;
};


_// JSDT:_module_
.
/**
 * Ask privilege in mozilla projects.
 * enablePrivilege 似乎只能在執行的 function 本身或 caller 呼叫才有效果，跳出函數即無效，不能 cache，因此提供 callback。
 * 就算按下「記住此決定」，重開瀏覽器後需要再重新授權。
 * @param {String,Error} privilege	privilege that asked 或因權限不足導致的 Error
 * @param {Function,Number} callback	Run this callback if getting the privilege. If it's not a function but a number(經過幾層/loop層數), detect if there's a loop or run the caller.
 * @return	OK / the return of callback
 * @throws	error
 * @since	2010/1/2 00:40:42
 */
require_netscape_privilege = function(privilege, callback) {
	var _s = arguments.callee, f, i,
	/**
	 * raise error.
	 * error 有很多種，所以僅以 'object' 判定。
	 * @inner
	 * @ignore
	 */
	re = function(n, m) {
		//this.debug('Error: ' + m);
		throw privilege && typeof privilege === 'object' ?
			//	Error object
			privilege :
			new Error(n, m);
	};

	if(!_s.enabled)
		re(3, 'Privilege requiring disabled.');

	//	test loop
	//	得小心使用: 指定錯可能造成 loop!
	if (!isNaN(callback) && callback > 0 && callback < 32) {
		for (f = _s, i = 0; i < callback; i++)
			if (f = f.caller)
				f = f.arguments.callee;

		if (f === _s)
			// It's looped
			re(4, 'Privilege requiring looped.');

		callback = 1;

	}else if (typeof callback !== 'function')
		callback = 0;

	f = _s.enablePrivilege;
	if (!f && !(_s.enablePrivilege = f = this
				.eval_various('netscape.security.PrivilegeManager.enablePrivilege')))
		re(1, 'No enablePrivilege get.');

	if (this.is_type(privilege, 'DOMException')
					&& privilege.code === 1012)
		//	http://jck11.pixnet.net/blog/post/11630232
		//	Mozilla的安全機制是透過PrivilegeManager來管理，透過PrivilegeManager的enablePrivilege()函式來開啟這項設定。
		//	須在open()之前呼叫enablePrivilege()開啟UniversalBrowserRead權限。

		//	http://code.google.com/p/ubiquity-xforms/wiki/CrossDomainSubmissionDeployment
		//	Or: In the URL type "about:config", get to "signed.applets.codebase_principal_support" and change its value to true.

		//	由任何網站或視窗讀取私密性資料
		privilege = 'UniversalBrowserRead';

	else if (!privilege || typeof privilege !== 'string')
		re(2, 'Unknown privilege.');

	//this.debug('privilege: ' + privilege);
	try {
		//this.log(this.Class + '.require_netscape_privilege: Asking privilege [' + privilege + ']..');
		f(privilege);
	} catch (e) {
		this.warn(this.Class + '.require_netscape_privilege: User denied privilege [' + privilege + '].');
		throw e;
	}

	//this.debug('OK. Get [' + privilege + ']');


	if (callback === 1) {
		//this.debug('再執行一次 caller..');
		callback = _s.caller;
		return callback.apply(this, callback.arguments);

/*		i = callback.apply(this, callback.arguments);
		this.debug(('return ' + i).slice(0, 200));
		return i;
*/
	} else if (callback)
		// 已審查過，為 function
		return callback();
};

_// JSDT:_module_
.
/**
 * 當需要要求權限時，是否執行。（這樣可能彈出對話框）
 * @type	Boolean
 */
require_netscape_privilege.enabled = true;



_// JSDT:_module_
.
/*	得知相對 basePath
<script type="text/javascript" src="../baseFunc.js"></script>
var basePath=getBasePath('baseFunc.js');	//	引數為本.js檔名	若是更改.js檔名，亦需要同步更動此值！
*/
get_base_path = function(JSFN){
	if(!JSFN)
		return (typeof WScript === 'object'
					? WScript.ScriptFullName
					: location.href
				).replace(/[^\/\\]+$/, '');

	//	We don't use isObject or so.
	//	通常會傳入的，都是已經驗證過的值，不會出現需要特殊認證的情況。
	//	因此精確繁複的驗證只用在可能輸入奇怪引數的情況。
	if (typeof document !== 'object')
			return '';

	//	form dojo: d.config.baseUrl = src.substring(0, m.index);
	var i, j, b, o = document.getElementsByTagName('script');

	for (i in o)
		try {
			j = o[i].getAttribute('src');
			i = j.lastIndexOf(JSFN);
			if (i !== -1)
				//	TODO: test 是否以 JSFN 作為結尾
				b = j.slice(0, i);
		} catch (e) {
		}

	//this.log()

	//	b || './'
	return b || '';
};


_// JSDT:_module_
.
/**
 * get the path of specified module
 * @param {String} module_name	module name
 * @param	{String} file_name	取得在同一目錄下檔名為 file_name 之 path。若填入 '' 可取得 parent 目錄。
 * @return	{String} module path
 */
get_module_path = function(module_name, file_name){
	if(!module_name)
		return module_name;

	//this.debug('load [' + module_name + ']');
	var module_path = this.env.registry_path
				|| this.get_base_path(this.env.main_script)
				|| this.get_base_path()
				;
	module_path += this.split_module_name(module_name).join(/\//.test(module_path)?'/':'\\') + '.js';
	//this.debug(module_path);

	if (file_name !== undefined)
		module_path = module_path.replace(/[^\/]+$/, file_name);
	else if (this.getFP)
		module_path = this.getFP(module_path, 1);

	//this.debug(module_name+': '+module_path);

	return module_path;
};


/*
sample to test:

./a/b
./a/b/
../a/b
../a/b/
a/../b		./b
a/./b		a/b
/../a/b		/a/b
/./a/b		/a/b
/a/./b		/a/b
/a/../b		/b
/a/../../../b	/b
/a/b/..		/a
/a/b/../	/a/
a/b/..		a
a/b/../		a/
a/..		.
./a/b/../../../a.b/../c	../c
../../../a.b/../c	../../../c

*/

//	2009/11/23 22:12:5
if(0)
_// JSDT:_module_
.
deprecated_simplify_path = function(path){
	if(typeof path === 'string'){
		path = path.replace(/\s+$|^\s+/,'').replace(/\/\/+/g,'/');

		var p, is_absolute = '/' === path.charAt(0);

		while( path !== (p=path.replace(/\/\.(\/|$)/g,function($0,$1){return $1;})) )
			path = p;
		_.debug('1. '+p);

		while( path !== (p=path.replace(/\/([^\/]+)\/\.\.(\/|$)/g,function($0,$1,$2){alert([$0,$1,$2].join('\n'));return $1 === '..'? $0: $2;})) )
			path = p;
		_.debug('2. '+p);

		if(is_absolute)
			path = path.replace(/^(\/\.\.)+/g,'');
		else
			path = path.replace(/^(\.\/)+/g,'');
		_.debug('3. '+p);

		if(!path)
			path = '.';
	}

	return path;
};

_// JSDT:_module_
.
/**
 * 轉化所有 /., /.., //
 * @since	2009/11/23 22:32:52
 * @param {string} path	欲轉化之 path
 * @return	{string} path
 */
simplify_path = function(path){
	if(typeof path === 'string'){
		var i, j, l, is_absolute, head;

		path = path
			.replace(/^[\w\d\-]+:\/\//,function($0){head = $0; return '';})
			//.replace(/\s+$|^\s+/g,'')
			//.replace(/\/\/+/g,'/')
			.split('/');

		i = 0;
		l = path.length;
		is_absolute = !path[0];

		for(;i<l;i++){
			if(path[i] === '.')
				path[i] = '';

			else if(path[i] === '..'){
				j=i;
				while(j>0)
					if(path[--j] && path[j]!='..'){
						path[i] = path[j] = '';	//	相消
						break;
					}
			}
		}

		if(!is_absolute && !path[0])
			path[0] = '.';

		path = path.join('/')
			.replace(/\/\/+/g,'/')
			.replace(is_absolute? /^(\/\.\.)+/g: /^(\.\/)+/g,'')
			;

		if(!path)
			path = '.';

		if(head)
			path = head + path;
	}

	return path;
};





/**
 * 已經 include 之函式或 class
 * @inner
 * @ignore
 */
var loaded_module = {
};

_// JSDT:_module_
.
/**
 * Include specified module<br/>
 * 注意：以下的 code 中，CeL.warn 不一定會被執行（可能會、可能不會），因為執行時 code.log 尚未被 include。<br/>
 * 此時應該改用 CeL.use('code.log', callback);<br/>
 * code in head/script/:
 * <pre>
 * CeL.use('code.log');
 * CeL.warn('a WARNING');
 * </pre>
 * **	在指定 callback 時 name_space 無效！
 * **	預設會 extend 到 library 本身下！
 * @param	{String} module	module name
 * @param	{Function} [callback]	callback function
 * @param	{Object, Boolean} [extend_to]	extend to which name-space<br/>
 * false:	just load, don't extend to library name-space<br/>
 * this:	extend to global<br/>
 * object:	extend to specified name-space that you can use [name_space]._func_ to run it<br/>
 * (others, including undefined):	extend to root of this library. e.g., call CeL._function_name_ and we can get the specified function.
 * @return	{Error object}
 * @return	-1	will execute callback after load
 * @return	{undefined}	no error, OK
 * @example
 * CeL.use('code.log', function(){..});
 * CeL.use(['code.log', 'code.debug']);
 * @note
 * 'use' 是 JScript.NET 的保留字
 */
use = function(module, callback, extend_to){
	var _s = arguments.callee, i, l, module_path;

	if (!module)
		return;

	/*
	if (arguments.length > 3) {
		l = arguments.length;
		name_space = arguments[--l];
		callback = arguments[--l];
		--l;
		for (i = 0; i < l; i++)
			_s.call(this, arguments[i], callback, name_space);
		return;
	}
	*/

	if (this.is_type(module, 'Array')) {
		var error;
		for (i = 0, l = module.length; i < l; i++)
			if (error = _s.call(this, module[i], callback, extend_to))
				return error;
		return null;
	}

	if (!(module_path = this.get_module_path(module)) || this.is_loaded(module))
		return null;

	//this.debug('load [' + module + ']:\ntry to load [' + module_path + ']');

	//	including code
	try {
		try{
			// this.debug('load ['+module_path+']');
			// this.debug('load ['+module_path+']:\n'+this.get_file(module_path, this.env.source_encoding));
			//WScript.Echo(this.eval);
			if (i = this.get_file(module_path, this.env.source_encoding))
				//	這邊可能會出現 security 問題。
				this.eval(i);
			else
				this.warn('Get nothing from [' + module_path + ']! Some error occurred?');
			i = 0;
		} catch (e) {
			i = e;
		}

		if (i) {
			if (callback && window !== undefined) {
				// TODO: 在指定 callback 時使 name_space 依然有效。
				this.include_resource(module_path, {
					module : module,
					callback : callback,
					global : this
				});
				return -1;
			}
			throw i;
		} else
			typeof callback === 'function' && callback();

	} catch (e) {
		//this.err(e);

		// http://www.w3.org/TR/DOM-Level-2-Core/ecma-script-binding.html
		// http://reference.sitepoint.com/javascript/DOMException
		if (this.is_type(e, 'DOMException') && e.code === 1012)
			this.err(this.Class
					+ '.use:\n'
					+ e.message
					+ '\n'
					+ module_path
					+ '\n\n程式可能呼叫了一個'
					+ (typeof location === 'object'
						&& location.protocol === 'file:' ? '不存在的，\n或是繞經上層目錄'
								: 'cross domain')
								+ '的檔案？\n\n請嘗試使用相對路徑，\n或 '
								+ this.Class
								+ '.use(module, callback function, name_space)');
		else if (this.is_type(e, 'Error') && (e.number & 0xFFFF) == 5
				|| this.is_type(e, 'XPCWrappedNative_NoHelper')
						&& ('' + e.message).indexOf('NS_ERROR_FILE_NOT_FOUND') !== -1) {
			this.err(this.Class + '.use: 檔案可能不存在？\n[' + module_path + ']' +
					(this.get_error_message
							? ('<br/>' + this.get_error_message(e))
							: '\n' + e.message
					)
				);
		} else
			this.err(this.Class + '.use: Cannot load [' + module + ']!'
					+ (this.get_error_message
							? ('<br/>' + this.get_error_message(e) + '<br/>')
							: '\n[' + (e.constructor) + '] ' + (e.number ? (e.number & 0xFFFF) : e.code) + ': ' + e.message + '\n'
					)
					+ '抱歉！在載入其他網頁時發生錯誤，有些功能可能失常。\n重新讀取(reload)，或是過段時間再嘗試或許可以解決問題。');
		//this.log('Cannot load [' + module + ']!', this.log.ERROR, e);

		return e;
	}


	//typeof name_space !== 'undefined' && this.debug(name_space);
	//	處理 extend to what name-space
	if (!extend_to && extend_to !== false
			//	若是在 .setup_module 中的話，可以探測得到 name_space？（忘了）
			//|| typeof name_space !== 'function'
			|| !(extend_to instanceof Object))
		//	預設會 extend 到 library 本身下
		extend_to = this;

	if (extend_to && (i = this.get_module(module))) {
		var ns = i, kw = this.env.not_to_extend_keyword, no_extend = {};
		//this.debug('load [' + module + ']:\nextend\n' + ns);

		if (kw in ns) {
			l = ns[kw];
			if (typeof l === 'string' && l.indexOf(',') > 0)
				l=l.split(',');

			if (typeof l === 'string') {
				no_extend[l] = 1;
			} else if (l instanceof Array) {
				for (i=0;i<l.length;i++)
					//WScript.Echo('no_extend '+l[i]),
					no_extend[l[i]] = 1;
			} else if (l instanceof Object) {
				no_extend = l;
			}

			no_extend[kw] = 1;
		}

		//	'*': 完全不 extend
		if (!no_extend['*']) {
			no_extend.Class = 1;
			var no_self = 'this' in no_extend;
			if(no_self)
				delete no_extend['this'];

			l = [];
			for (i in ns)
				if (!(i in no_extend))
					l.push(i);

			//this.debug('load [' + module + ']:\nextend\n' + l + '\n\nto:\n' + (extend_to.Class || extend_to));
			this.extend(l, extend_to, ns);

			/*
			 * extend module itself.
			 * e.g., .net.web -> .web
			 */
			if (!no_self && (i = this.split_module_name(module))
							&& (i = i.pop()) && !(i in this))
						this[i] = ns;
		}

	}

};


/*
bad: sometimes doesn't work. e.g. Google Maps API in IE
push inside window.onload:
window.onload=function(){
include_resource(p);
setTimeout('init();',2000);
};

way 3:	ref. dojo.provide();, dojo.require();
document.write('<script type="text/javascript" src="'+encodeURI(p)+'"><\/script>');

TODO:
encode

*/
;

_// JSDT:_module_
.
/**
 * include other JavaScript/CSS files
 * @param {String} resource path
 * @param {Function, Object} callback	callback function / 	{callback: callback function, module: module name, global: global object when run callback}
 * @param {Boolean} [use_write]	use document.write() instead of insert a element
 * @param {Boolean} [type]	1: is a .css file, others: script
 */
include_resource = function(path, callback, use_write, type) {
	var _s = arguments.callee, s, t, h;

	if (!_s.loaded){
		s = this.get_include_resource();
		if(!s){
			//	document!=='object': 誤在非 HTML 環境執行，卻要求 HTML 環境下的 resource？
			//if(typeof document==='object')this.warn(this.Class + ".include_resource: Can't load [" + path + "]!");
			return;
		}
		_s.loaded = s[0],
		_s.count = s[1];
	}

	if (path instanceof Array) {
		for (s = 0, t = path.length; s < t; s++)
			_s(path[s], callback, use_write, type);
		return;
	}

	if(path in _s.loaded)
		return;

	if (type === undefined)
		type = /\.css$/i.test(path) ? 1 : 0;

	t = 'text/' + (type === 1 ? 'css' : 'javascript');
/*@cc_on
//use_write=1;	//	old old IE hack
@*/
	if (!use_write)
		try {
			// Dynamic Loading
			// http://code.google.com/apis/ajax/documentation/#Dynamic
			s = document.createElement(type === 1 ? 'link' : 'script');
			s.type = t;
			if (type === 1)
				s.href = path, s.rel = 'stylesheet';
			else
				//	TODO: see jquery-1.4a2.js: globalEval
				//	if (is_code) s.text = path;
				s.src = path;

			h = (document.getElementsByTagName('head')[0] || document.body.parentNode
					.appendChild(document.createElement('head')));

			h.appendChild(s);

			//this.debug('HTML:\n' + document.getElementsByTagName('html')[0].innerHTML);
			/*
			 * from jquery-1.4a2.js:
			 * Use insertBefore instead of appendChild to circumvent an IE6 bug
			 *  when using globalEval and a base node is found.
			 * This arises when a base node is used (#2709).
			 * @see
			 * http://github.com/jquery/jquery/commit/d44c5025c42645a6e2b6e664b689669c3752b236
			 * 不過這會有問題: 後加的 CSS file 優先權會比較高。因此，可以的話還是用 appendChild。
			 */
			//h.insertBefore(s, h.firstChild);

			//	.css 移除後會失效
			//h.removeChild(s);

		} catch (e) {
			use_write = 1;
		}

		if (use_write)
			document.write(type === 1 ? '<link type="' + t
					+ '" rel="stylesheet" href="' + path + '"><\/link>'
					: '<script type="' + t + '" src="' + path
					// language="JScript"
					+ '"><\/script>');

	_s.loaded[path] = _s.count++;

	if (callback)
		_s.wait_to_call(callback);
};

_// JSDT:_module_
.
/**
 * 已經 include_resource 了哪些 JavaScript 檔（存有其路徑）
 * loaded{路徑} = count
 * 本行可省略(only for document)
 */
include_resource.loaded = null;


_// JSDT:_module_
.
/**
 * 已經 include_resource 了多少個 JavaScript 檔
 * @type Number
 * 本行可省略(only for document)
 */
include_resource.count = 0;

_// JSDT:_module_
.
include_resource.wait_to_call = function(callback) {
	//alert('include_resource.wait_to_call:\n' + _.to_module_name(callback.module));

	if (typeof callback === 'function')
		//	不是 module，僅僅為指定 function 的話，直接等一下再看看。
		//	TODO: 等太久時 error handle
		window.setTimeout(callback, 200);

	else if (callback.global.is_loaded(callback.module)){
		if (typeof callback.callback === 'function')
			callback.callback();
		else if (typeof callback.callback === 'string')
			this.use(callback.callback);
		//	TODO
		//else..

	}else {
		/**
		 * the function it self, not 'this'.
		 * @inner
		 * @ignore
		 */
		var _s = arguments.callee, _t = this;
		window.setTimeout(function() {
			_s.call(_t, callback);
		}, 10);
	}
};

_// JSDT:_module_
.
get_include_resource = function(split) {
	if(typeof document!=='object'||!document.getElementsByTagName)
		//	誤在非 HTML 環境執行，卻要求 HTML 環境下的 resource？
		return;

	var i, nodes = document.getElementsByTagName('script'), h, hn, count = 0, p, l;
	if (split)
		h = {
			script : {},
			css : {}
		},
		hn = h.script;
	else
		hn = h = {};

	l = nodes.length;
	for (i = 0; i < l; i++)
		if (p = this.simplify_path(nodes[i].src))
			hn[p] = 1, count++;

	nodes = document.getElementsByTagName('link');
	if (split)
		hn = l.css;

	l = nodes.length;
	for (i = 0; i < l; i++)
		if (p = this.simplify_path(nodes[i].href))
			hn[p] = 1, count++;

	return [ h, count ];
};


_// JSDT:_module_
.
/**
 * include resource of module.
 * @example
 * //	外部程式使用時，通常用在 include 相對於 library 本身路徑固定的檔案。
 * //	例如 file_name 改成相對於 library 本身來說的路徑。
 * CeL.include_module_resource('../../game/game.css');
 * @param {String} file_name	與 module 位於相同目錄下的 resource file name
 * @param {String} [module_name]	呼叫的 module name。未提供則設成 library base path，此時 file_name 為相對於 library 本身路徑的檔案。
 * @return
 * @since	2010/1/1-2 13:58:09
 */
include_module_resource = function(file_name, module_name) {
	//var m = this.split_module_name.call(this, module_name);
	//if (m)m[m.length - 1] = file_name;
	return this.include_resource.call(this,
			this.get_module_path(module_name || this.Class, file_name));
};



_// JSDT:_module_
.
get_module = function(module_name) {
	module_name = this.split_module_name.call(this, module_name);

	//	TODO: test module_name.length
	if(!module_name)
		return null;

	var i = 0, l = module_name.length, name_space = this;
	//	一層一層 call name-space
	while (i < l)
		try {
			name_space = name_space[module_name[i++]];
		} catch (e) {
			return null;
		}

	return name_space;
};



_// JSDT:_module_
.
/**
 * 預先準備好下層 module 定義時的環境。<br/>
 * 請盡量先 call 上層 name-space 再定義下層的。
 * @param	{String} module_name	module name
 * @param	{Function} code_for_including	若欲 include 整個 module 時，需囊括之 code。
 * @return	null	invalid module
 * @return	{Object}	下層 module 之 name-space
 * @return	undefined	something error, e.g., 未成功 load，code_for_including return null, ..
 */
setup_module = function(module_name, code_for_including) {
	module_name = this.split_module_name(module_name);

	//	TODO: test module_name.length
	if(!module_name)
		return null;

	var i = 0, l = module_name.length - 1, name_space = this, name;
	//	一層一層準備好、預定義 name-space
	for (; i < l; i++) {
		if (!name_space[name = module_name[i]])
			//this.debug('預先定義 module [' + this.to_module_name(module_name.slice(0, i + 1)) + ']'),
			name_space[name] = new Function(
					'//	null constructor for module ' +
					this.to_module_name(module_name.slice(0, i + 1)));
		name_space = name_space[name];
	}
	//	name-space 這時是 module 的 parent module。

	if (
			// 尚未被定義或宣告過
			!name_space[name = module_name[l]] ||
			// 可能是之前簡單定義過，例如被上面處理過。這時重新定義，並把原先的 member 搬過來。
			!name_space[name].Class) {

		//	保留原先的 name-space，for 重新定義
		l = name_space[name];

		// extend code, 起始 name-space
		try {
			//this.debug('including code of [' + this.to_module_name(module_name) + ']..'),
			//	TODO: code_for_including(this, load_arguments)
			i = code_for_including(this);
			i.prototype.constructor = i;
			//code_for_including.toString = function() { return '[class_template ' + name + ']'; };
			//i.toString = function() { return '[class ' + name + ']'; };
		} catch (e) {
			this.err(this.Class + '.setup_module: load module ['
					+ this.to_module_name(module_name) + '] error!\n' + e.message);
			i = undefined;
		}
		if (i === undefined)
			return i;
		name_space = name_space[name] = i;

		// 把原先的 member 搬過來
		if (l) {
			delete l.Class;
			//	may use: this.extend()
			for (i in l)
				name_space[i] = l[i];
		}
		name_space.Class = this.to_module_name(module_name);
	}

/*
	l=[];
	for(i in name_space)
		l.push(i);
	WScript.Echo('Get members:\n'+l.join(', '));
*/

	this.set_loaded(name_space.Class, code_for_including);

	return name_space;
};


_// JSDT:_module_
.
/**
 * 模擬 inherits
 * @param {String} module_name	欲繼承的 module_name
 * @param initial_arguments	繼承時的 initial arguments
 * @return
 * @see
 * <a href="http://fillano.blog.ithome.com.tw/post/257/17355" accessdate="2010/1/1 0:6">Fillano's Learning Notes | 物件導向Javascript - 實作繼承的效果</a>,
 * <a href="http://www.crockford.com/javascript/inheritance.html" accessdate="2010/1/1 0:6">Classical Inheritance in JavaScript</a>
 */
inherits = function(module_name, initial_arguments) {
	var c = loaded_module[this.to_module_name(module_name)];
	try {
		if (typeof c === 'function')
			return c(this, initial_arguments);
	} catch (e) {
		return e;
	}
};


_// JSDT:_module_
.
/**
 * 將輸入的 string 分割成各 module 單元。<br/>
 * need environment_adapter()<br/>
 * ** 並沒有對 module 做完善的審核!
 * @param {String} module_name	module name
 * @return	{Array}	module unit array
 */
split_module_name = function(module_name) {
	//this.debug('[' + module_name + ']→[' + module_name.replace(/\.\.+|\\\\+|\/\/+/g, '.').split(/\.|\\|\/|::/) + ']');
	if (typeof module_name === 'string')
		module_name = module_name.replace(/\.\.+|\\\\+|\/\/+/g, '.').split(/\.|\\|\/|::/);

	if (module_name instanceof Array) {
		//	去除 library name
		if (module_name.length>1 && this.Class == module_name[0])
			module_name.shift();
		return module_name;
	} else
		return null;
};



_// JSDT:_module_
.
to_module_name = function(module, separator) {
	if (typeof module === 'function')
		module = module.Class;

	if (typeof module === 'string')
		module = this.split_module_name(module);

	var name = '';
	if (module instanceof Array) {
		if (typeof separator !== 'string')
			separator = this.env.module_name_separator;
		if (module[0] != this.Class)
			name = this.Class + separator;
		name += module.join(separator);
	}

	return name;
};

//	TODO
_// JSDT:_module_
.
unload_module = function(module, g){
};


_// JSDT:_module_
.
/**
 * 判斷 module 是否存在，以及是否破損。
 * @param	{String} module_name	module name
 * @return	{Boolean} module 是否存在以及良好。
 */
is_loaded = function(module_name) {
	// var _s = arguments.callee;
	//this.debug('test ' + this.to_module_name(module_name));
	return loaded_module[this.to_module_name(module_name)] ? true
			: false;
};



_// JSDT:_module_
.
set_loaded = function(module_name, code_for_including) {
	//this.debug(this.to_module_name(module_name));
	loaded_module[this.to_module_name(module_name)] = code_for_including || true;
};




_// JSDT:_module_
.
/**
 * module 中需要 include function 時使用。<br/>
 * TODO: 輸入 function name 即可
 * @example
 * //	requires (inside module)
 * if(eval(library_namespace.use_function('data.split_String_to_Object')))return;
 * @param function_list	function list
 * @param [return_extend]	設定時將回傳 object
 * @return	error
 * @since
 * 2009/12/26 02:36:31
 * 2009/12/31 22:21:23	add 類似 'data.' 的形式，為 module。
 */
use_function = function(function_list, return_extend) {
	var list = this.is_Array(function_list) ? function_list
			: typeof function_list === 'string' ? function_list
					.split(',') : 0;

	if (!list || !list.length)
		return 1;

	//this.debug('load function [' + list + ']');

	var i = 0, m, l = list.length, n,
	old_module_name,
	module_hash = {},
	variable_hash = {};

	for (; i < l; i++)
		if ((m = this.split_module_name(list[i])) && m.length > 1) {
			//this.debug('load function [' + m + ']');
			//	if(n): 類似 'data.split_String_to_Object' 的形式，為 function。else: 類似 'data.' 的形式，為 module。
			n = m[m.length - 1];
			//if (!n)this.debug('load module [' + this.to_module_name(m) + ']');

			if(!n)
				m.pop();
			variable_hash[n || m[m.length - 1]] = this.to_module_name(m);
			if (n)
				m.pop();
			//this.debug('test module ['+m.join(this.env.module_name_separator)+']: '+this.eval_various(m.join(this.env.module_name_separator),this));
			module_hash[m.join(this.env.module_name_separator)] = 1;
		}

	m = [];
	for (i in module_hash)
		//this.debug('prepare to load module ['+i+']'),
		m.push(i);

	//this.debug('module [' + (typeof module_name === 'string' ? module_name: undefined) + '] load:\n' + m);

	// include required modules
	m = this.use(
		m,
		//	module_name 為呼叫 modele，在 .use() 中會被重設：eval 時由 modele 裡面的 code 設定。但在 IE 中為 undefined。
		old_module_name = typeof module_name === 'string' ? module_name
				: undefined);

	if (old_module_name)
		module_name = old_module_name;

	//	use 失敗: 需要 callback？
	if (m)
		return 2;

	if(!return_extend)
		l = [];
	for (i in variable_hash) {
		m = this.eval_various(n = variable_hash[i]);
		//this.debug('load [' + n + ']: ' + m);

		//	test if this function exists
		if (typeof m !== 'function') {
			delete variable_hash[i];
			this.err(this.Class + '.use_function: load [' + n
					+ '] error: ' + (m || "Doesn't defined?"));
		} else if (!return_extend)
			l.push(i + '=' + n);
	}

	//if (!return_extend)this.debug('@[' + module_name + ']: var ' + l.join(',') + ';0');

	return return_extend ? variable_hash : l.length ? 'var ' + l.join(',') + ';0' : '';
};


/**
 * 為一些比較舊的版本或不同瀏覽器而做調適。
 * @since	2010/1/14 17:58:31
 * @inner
 * @private
 * @ignore
 */
function environment_adapter() {
	/*
	 * workaround:
	 * 理論上 '.'.split(/\./).length 應該是 2，但 IE 5~8 中卻為 0!
	 * 用 .split('.') 倒是 OK.
	 * TODO:
	 * 應該增加可以管控與回復的手段，預防有時需要回到原有行為。
	 * @since	2010/1/1 19:03:40
	 */
	if ('.'.split(/\./).length === 0)
		(function() {
			var _String_split = String.prototype.split,
				is_Regexp = _.object_tester('RegExp');
			String.prototype.split = function(r) {
				return is_Regexp(r) ?
						_String_split.call(this.valueOf().replace(
								r.global ? r :
									// TODO: 少了 multiline
									new RegExp(r.source, r.ignoreCase ? 'ig' : 'g'),
							'\0'), '\0') :
						_String_split.call(this, r);
			};
		})();
}

environment_adapter();

}.apply(CeL);

