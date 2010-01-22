//	[CeL]library_loader_by_registry
try{var o;try{o=new ActiveXObject('Microsoft.XMLHTTP')}catch(e){o=new XMLHttpRequest()}with(o)open('GET',(new ActiveXObject("WScript.Shell")).RegRead('HKCU\\Software\\Colorless echo\\CeL.path'),false),send(null),eval(responseText)}catch(e){}
//	[CeL]End

// WScript.Echo((new ActiveXObject("WScript.Shell")).RegRead('HKCU\\Software\\Colorless echo\\CeL.path'));

CeL.use('code.log');
sl = CeL.log;
// WScript.Echo(CeL.Log.log);
// CeL.log(CeL);

// CeL.warn('a WARNING level message');

// sl(CeL.env.registry_path+CeL.env.main_script);
// sl(CeL.get_file(CeL.env.registry_path+CeL.env.main_script));

//CeL.use('IO.file');
CeL.use('IO.Windows.file');
if(!CeL.is_loaded('IO.Windows.file'))
	WScript.Quit(1);

var jar_setup = CeL.get_file(CeL.env.registry_path + '.settings\\.jsdtscope'), source_file_list = [], source_module_list = [], i, fn, target_file_list = [], t, library_name = CeL.Class, module_name
	, all_code_include_file_name = '_include' + CeL.env.path_separator + CeL.Class
	, all_code=[];
//sl(jar_setup);


var fso = WScript.CreateObject("Scripting.FileSystemObject"), jsdoc_directory = 'C:\\eclipse\\dropins\\jsdoc-toolkit\\', command_line = 'C:\\Sun\\SDK\\jdk\\bin\\java.exe -jar "'
	+ jsdoc_directory
	+ 'jsrun.jar" "'
	+ jsdoc_directory
	+ 'app\\run.js" -w -v -strict -A -p "-t='
	+ jsdoc_directory
	+ 'templates\\jsdoc" "-d='
	+ CeL.env.registry_path
	+ '\\_document\\JSDoc" "-e=UTF-8"';

//CeL.log('fso:\n[' + fso + ']');
//sl(CeL.traverse_file_system);
CeL.traverse_file_system(function(f) {
	var p = f.Path.slice(CeL.env.registry_path.length);
	if (!/^[._]/.test(p) && /\.js$/.test(p) && !/origin\.js$/.test(p))
		//sl(p + '\n' + source_file_list),
		source_module_list.push(CeL.to_module_name(p.replace(/\.js$/,''))),
		source_file_list.push(p);
}, CeL.env.registry_path);
//CeL.log('source module list:\n'+source_module_list.join('\n'));
//WScript.Echo(CeL.log);

for (i in source_file_list) {
	fn = source_file_list[i].replace(/[^.]+$/, function($0) {
		return 'origin.' + $0;
	});
	t = CeL.read_all_file(CeL.env.registry_path + source_file_list[i], CeL.env.source_encoding);
	//sl(CeL.env.registry_path + source_file_list[i] + '\n' + t);

	// 置換
	module_name = CeL.to_module_name(source_file_list[i].replace(/\.js$/,''));
	//CeL.log(library_name+'\n'+module_name);
	t = t.replace(/\n\s+\*\s+@_[a-zA-Z]+\s+[^\n]+(\n\s+\*\s+[^@\s][^\n]+)*/g,
			function($0) {
				// if($0.lastIndexOf('\n')>1)CeL.log('['+$0+']\n');
			return $0
					// 換掉 @_
					.replace(/_/, '')
					// 置換 class name
					.replace(/_class_/g, library_name)
					// 置換 module name
					.replace(/_module_/g, module_name);
		}).replace(/(\n\s*)(var\s+)?_([^\da-zA-Z].*)?\s*\/\/ JSDT:([^\n]+)/g, function($0, $1, $2, $3, $4) {
		return $1 + $4
				// 置換 class name
				.replace(/_class_/g, library_name)
				// 置換 module name
				.replace(/_module_/g, module_name);
	});

	if (all_code_include_file_name)
		all_code.push(t);

	CeL.write_to_file(CeL.env.registry_path + fn, t, 'UTF-8');
	target_file_list.push(fn);
}


if(all_code_include_file_name){
	i=CeL.env.new_line;
	i+=i;
	i+=i;
	all_code=all_code.join(i+'//--------------------------------------------------------------------------------//'+i);

	CeL.write_to_file(CeL.env.registry_path + all_code_include_file_name + '.all.js', all_code, 'UTF-8');
	//target_file_list=[all_code_include_file_name + '.all.js'];

	//	2009/12/5 15:04:42
	//CeL.log(''+all_code.slice(0, 100));
	//	使用 .split(/\r?\n/) 應注意：這實際上等於 .split(/(\r?\n)+/) (??)
	all_code = all_code.split(/\r?\n/);
	var m, l = all_code.length, line = '', p, n, last_code = [], tmp_code,v,last_name;
	for (i = 0; i < l; i++) {
		line = all_code[i];
		if (/^\s*\/\*\*/.test(line)) {
			//CeL.log(''+line);
			p = {};
			p[n = 'description'] = '';
			tmp_code = [];
			while (i < l && line.indexOf('*/') === -1) {
				//CeL.log(''+line);
				tmp_code.push(line);
				if (m = line.match(/^\s+\*\s+@([_a-zA-Z\d.]+)\s+([^\s].+)$/))
					p[n = m[1]] = m[2];
				else if (m = line.match(/^\s+\*\s+@([_a-zA-Z\d.]+)/))
					p[n = m[1]] = 1;
				else if (m = line.match(/^\s+\*\s+([^\s].+)$/)) {
					if (p[n] === 1)
						p[n] = m[2];
					else
						p[n] += (p[n] ? '\n' : '') + m[2];
				}
				line = all_code[++i];
			}
			//CeL.log('[' + i + ']' + '\n' + tmp_code.join('\n') + '\n' + line);
			if (m = line.match(/(.*?\*\/)/)) {
				tmp_code.push(m[1]);
				line = line.replace(/(.*?)\*\//, '');

				n = '';
				v = function(_) {
					n = (p.name || (p.memberOf ? (_.replace(/[\s\n]+/g, '').indexOf(p.memberOf + '.') === -1 ? p.memberOf + '.'
							: '')
							+ _ /* .replace(/^(.+)\./,'') */
							: p.property ? last_name ? last_name
									+ '.prototype.' + _.replace(/^(.+)\./, '')
									: '' : _)).replace(/[\s\n]+/g, '');
				};
				/*
				 * 3 kinds: function name(){}; var name=function(){}; var
				 * name=123;
				 */
				while (!/^\s*function\s$/.test(line) && !/[=;,]/.test(line))
					line += ' ' + all_code[++i];
				if (m = line
						.match(/^\s*function\s+([_a-zA-Z\d.]*)\s*\((.*)/)) {
					// function name(){};
					v(m[1]);
					v = m[2];
					while (i < l && v.indexOf(')') === -1)
						v += all_code[++i];
					m = v.match(/^[^)]+/);
					tmp_code.push(n + '=function(' + m[0] + '){};');
				} else if (m = line
						.match(/^\s*(var\s+)?([_a-zA-Z\d.]+)\s*=\s*(.+)/)) {
					v(m[2]);
					v = m[3];
					if (/^function(\s+[_a-zA-Z\d]+)?\s*\(/.test(v)) {
						// var name=function(){};
						while (i < l && v.indexOf(')') === -1)
							v += all_code[++i];
						m = v.match(/^[^)]+\)/);
						tmp_code.push(n + '=' + m[0] + '{};');
					} else {
						// var name=123;
						if (!p.type)
							if (/^['"]/.test(v)) {
								p.type = 'string';
							} else if (!isNaN(v)) {
								p.type = 'number';
							} else if (/^(true|false)([\s;,]|$)/.test(v)) {
								p.type = 'bool';
							} else if (v.charAt(0) === '[') {
								p.type = 'array';
							} else if (v.charAt(0) === '{') {
								p.type = 'object';
							} else if (v.charAt(0) === '/') {
								p.type = 'regexp';
							} else if (/^regexp obj(ect)?$/.test(p.type)) {
								p.type = 'regexp';
							}

						if (n === 'module_name')
							;
						switch ((p.type || '').toLowerCase()) {
						case 'string':
							m = v.replace(/\s*[,;]*\s*$/, '');
							//CeL.log('['+m+']');
							if (/^'[^\\']*'$/.test(m)
									|| /^"[^\\"]*"$/.test(m)) {
								v = '=' + m + ';';
							} else {
								v = '="";	//	' + v;
							}
							break;
						case 'bool':
							if (m = v.toLowerCase().match(
									/^(true|false)([\s,;]|$)/i)) {
								v = '=' + m[1] + ';';
							} else {
								v = '=true;	//	' + v;
							}
							break;
						case 'number':
						case 'int':
						case 'integer':
							if (!isNaN(v)) {
								v = '=' + v + ';';
							} else {
								v = '=0;	//	' + v;
							}
							break;
						case 'array':
							v = '=' + '[];';
							break;
						case 'object':
							if (v.charAt(0) === '{') {
								while (i < l){
									if (v.lastIndexOf('}') !== -1) {
										m = v.slice(1, v.lastIndexOf('}'));
										if (m.lastIndexOf('/*') === -1
												|| m.lastIndexOf('/*') < m
														.lastIndexOf('*/'))
											break;
									}
									v += '\n' + all_code[++i];
								}
								m = v.replace(/\s*\/\/[^\n]*/g, '').replace(
										/\/\*((.|\n)*?)\*\//g, '').replace(/}(.*)$/,
										'}');
								if (0 && m.length > 3)
									CeL.log(n + '\n' + m
									// + '\n'+v
									);
								if (/^{([\s\n]*(('[^']*'|"[^"]*"|[_a-zA-Z\d.]+))[\s\n]*:('[^']*'|"[^"]*"|[\s\n\d+\-*\/()\^]+|true|false|null)+|,)*}/
										.test(m))
									v = '=' + v.replace(/}(.*)$/, '}') + ';';
								else
									v = '=' + '{};';
							} else
								v = '=' + '{};';
							break;
						case 'regexp':
							if (/^\/.+\/$/.test(v))
								v = '=' + v + ';';
							else {
								v = '=' + '/^regexp$/;	//	' + v;
							}
							break;
						default:
							if (/^[_a-zA-Z\d.]/.test(v)) {
								// reference
								v = ';//' + (p.type ? '[' + p.type + ']' : '')
										+ v;
							} else {
								// unknown code
								v = ';	//	'
										+ (p.type ? '[' + p.type + ']' : '')
										+ v;
							}
						}
						tmp_code.push(n + v);
					}
				}
				if (n)
					if (n === 'module_name') {
						v=v.replace(/['";=\s\n]/g, '');
						tmp_code = [ '//	setup module ['+v+']' ];
						v = CeL.split_module_name(v);
						for (p = 1; p <= v.length; p++)
							n = CeL.to_module_name(v.slice(0, p)),
							tmp_code.push(
									//'//	' + n,
									//n + '=function(){};',
									n + '={};',
									n + '.prototype={};');
						last_code.push(tmp_code.join('\n'));
					} else if (!p.ignore && !p.inner && !p.private){
						if (!p.property)
							last_name = n;
						last_code.push(tmp_code.join('\n'));
					}
			}
		}
	}
	//	要當 user library 的，得要以 ANSI 編碼。連 UTF-8 都會出現問題。	2009/12/1 15:59:03
	CeL.write_to_file(CeL.env.registry_path + all_code_include_file_name
			+ '.for_include.js', CeL.iconv(last_code.join('\n').replace(/[\r\n]+/g,CeL.env.new_line), 'Big5'), 'Big5');
}

for(i in target_file_list){
	command_line+=' "'+CeL.env.registry_path+target_file_list[i]+'"';
}
//command_line += ' >> "'+CeL.env.registry_path+'create doc.log"';

if (1)
	(WScript.CreateObject("WScript.Shell")).Run(command_line, 1, true);
//sl('translate_encoding:\n\n' + command_line + '\n\n');


for (i in target_file_list)
	try {
		fso.DeleteFile(CeL.env.registry_path + target_file_list[i]);
	} catch (e) {
		// TODO: handle exception
	}

;

