
//	[CeL]library_loader_by_registry
try{var o;try{o=new ActiveXObject('Microsoft.XMLHTTP')}catch(e){o=new XMLHttpRequest()}with(o)open('GET',(new ActiveXObject("WScript.Shell")).RegRead('HKCU\\Software\\Colorless echo\\CeL.path'),false),send(null),eval(responseText)}catch(e){}
//	[CeL]End

// WScript.Echo((new ActiveXObject("WScript.Shell")).RegRead('HKCU\\Software\\Colorless echo\\CeL.path'));

CeL.set_debug();

CeL.use('code.log');
var sl = CeL.log;

CeL.use('code.reorganize');

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

	i=CeL.get_various_from_code(all_code);
	//	要當 user library 的，得要以 ANSI 編碼。連 UTF-8 都會出現問題。	2009/12/1 15:59:03
	CeL.write_to_file(CeL.env.registry_path + all_code_include_file_name
			+ '.for_include.js', CeL.iconv(CeL.get_code_from_generated_various(CeL.get_various_from_code(all_code)), 'Big5'), 'Big5');
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

