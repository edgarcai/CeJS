
/**
 * @name	CeL 輸入教育程度的 function
 * @fileoverview
 * 本檔案包含了輸入教育程度的 functions。
 * @since	2010/1/7 23:50:43
 */


if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'net.form.education';

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


/**
 * null module constructor
 * @class	輸入教育程度的 functions
 * @example
 * var education_form = new CeL.education.TW('education');
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};


//	===================================================

_.TW=

(function(){

var


//	class private	-----------------------------------


//	模擬 inherits
_ = library_namespace.inherits('net.form.select_input', function() {
	var _t = this;
	if (!_t.loaded)
		return;

	_t.setClassName('education_input');
	_t.setSearch('includeKeyWC');
	_t.setAllList(_t.default_list);

	// show arrow
	_t.triggerToInput(1);
	_t.focus(0);
});


//	class public interface	---------------------------




//	instance public interface	-------------------

//	最高教育程度	http://wwwc.moex.gov.tw/ct.asp?xItem=250&CtNode=1054
_.prototype.default_list =
	//請填寫
	'博士（含）以上,碩士/研究所,學士/大學院校,副學士/專科,高中/高職,國中/國民中學,國小（含）以下,其他：請說明'
	.split(',');


return _;
})();	//	(function(){

//	===================================================





return (
	_// JSDT:_module_
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};
