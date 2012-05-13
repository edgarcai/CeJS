
/**
 * @name	CeL bank account function
 * @fileoverview
 * 本檔案包含了輸入 bank account 的 functions。
 * @since	
 */


if (typeof CeL === 'function')
CeL.setup_module('interact.form.bank_account', {
sub_module : {
TW : {
require : 'interact.form.select_input.|data.CSV.parse_CSV',
code : function(library_namespace, load_arguments) {
'use strict';

//	requiring
var parse_CSV;
eval(library_namespace.use_function(this));



//	===================================================
/*
	used for bank account & bank id input form

TODO:


HISTORY:
2008/7/26 14:46:14	create
*/


var

//	class private	-----------------------------------

module_name = this.module_name,
parent_module_name = module_name.replace(/\.[^.]+$/, ''),

//	存放 data 的 path
path = library_namespace.get_module_path(parent_module_name, ''),


//	總單位帳號長度
mainLen=3,
//	支單位帳號長度
branchLen=7,

/*

//	and, select_input 用
bank[Number(id)]={
	id:'\d'			//	通匯金融代號, 郵局或是銀行代碼
	name:'',		//	總單位名稱
	digital:\d || [\d,..],	//	帳號長度之描述
	maxD:\d,		//	max 長度
	minD:\d,		//	min 長度
	branch:{		//	分行
		通匯金融代號:支單位名稱,..
	}
}

*/

bank=[],
bankNow,bankIdNow,

getBankID=function(id,force){
 var o=bank[id=Math.floor(id)],l,d,i;
 if(!o)return;
 if(!force&&('branch' in o))return o.branch;

 library_namespace.debug('getBankID: load ['+path+'id'+(id>99?'':id>9?'0':'00')+id+'.csv]',2);
 try{
  d=library_namespace.get_file(path+'id'+(id>99?'':id>9?'0':'00')+id+'.csv');
 }catch(e){
  library_namespace.warn('getBankID: <em>Can not get data: ['+url+']!</em> '+e.message);
  return;
 }
 if(!d||!(d=parse_CSV(d))||!d.length){
  library_namespace.warn('getBankID: Can not read data from ['+url+']!');
  return;
 }


 library_namespace.debug('getBankID: '+d.length+' data',2);
 for(i=0,l=o.branch={};i<d.length;i++){
  library_namespace.debug('getBankID: data ['+d[i][0]+'] '+d[i][1],3);
  if(!isNaN(d[i][0])){
   library_namespace.debug('getBankID: branch ['+d[i][0]+'] '+d[i][1],2);
   l[d[i][0]]=d[i][1];
  }else if(library_namespace.is_debug()){
   library_namespace.debug('getBankID: unknown data ['+d[i][0]+'] '+d[i][1],2);
  }
 }

 return l;
},

//	將帳號長度之描述轉成帳號長度， return max digital
getDigital=function(id){
 var o=bank[id=Math.floor(id)],d,a,i=0,m,max=0,min=Number.MAX_VALUE;
 if(!o)return;	//	error
 if('maxD' in o)return o.maxD;	//	作過了

 //sl('getDigital: get id '+id+', parse ['+o.digital+']');
 d=o.digital,a=d.replace(/\n/g,'').match(/\d{1,2}位/g);

 if(a)	//	有可能資料錯誤，無法取得。
  for(d=[];i<a.length;i++)
   if(m=a[i].match(/\d{1,2}/)){
    d.push(m=Math.floor(m[0]));
    if(min>m)min=m;
    if(max<m)max=m;
   }

 if(!d.length)d=max=min=0;
 else if(d.length===1)d=max=min=d[0];

 //sl('getDigital: '+o.name+' '+min+'-'+max);
 o.maxD=max;
 o.minD=min;

 return max;
},

/**
 * inherit select_input
 * @class	輸入 bank account 的 functions
 */
_ = library_namespace.inherit('interact.form.select_input', function() {
	var _t=this,i;
	if(!_t.loaded)return;

	_t.setClassName('bank_account_input');
	_t.setSearch(function(i,k){
	 //if(k)sl('compare function: ['+k+'], ['+(typeof i)+']'+i);
	 return typeof i=='object'?
	  //	bank
	  i.id.slice(0,k.length)==k||i.name.indexOf(k)!=-1
	  //	bank.branch
	  :i.length<k.length?0/*i==k.slice(0,i.length)*/:i.slice(0,k.length)==k;
	});
	_t.setInputType(1);
	i=_t.onInput;
	(_t.onInput=function(k){
	 //sl('onInput: input ['+k+'] - '+k.slice(0,3))
	 if(_t.inputAs!=2&&k&&k.length>=mainLen){
	  var id=Math.floor(k.slice(0,mainLen)),l;
	  if((bank[id])&&(l=getBankID(id))&&l!==_t.setAllList())
	   bankNow=bank[bankIdNow=id].name,_t.setInputType(0,id),_t.setAllList(l);
	 }else if(bank!==_t.setAllList())bankNow=0,bankIdNow=-1,_t.setInputType(0,-1),_t.setAllList(bank);
	 //	執行主要功能
	 i.apply(_t,arguments);
	 //	若達到標標準，則 triggerToInput。
	 if(!_t.clickNow&&k&&(_t.inputAs==2&&k.length==mainLen||_t.inputAs==3&&k.length==branchLen||k.length==getDigital(bankIdNow)))
	  _t.triggerToInput(0);
	 else _t.focus();
	})();

	//	show arrow
	_t.triggerToInput(1);
	_t.focus(0);
}),
_p = _.prototype;


//	class public interface	---------------------------


//	初始設定並讀取 bank id data
//	這應該在所有 new 之前先作！
_.readData = function(url) {
	if (!url)
		return;
	path = url.match(/^(.+\/)?([^\/]+)$/)[1];

	var data, i = 0, a, b;
	try {
		a = library_namespace.get_file(url);
	} catch (e) {
		library_namespace.warn( [ 'bank_account.TW.readData: Can not get data: [', url,
		                  		']! ', {
		                  			em : [ '本 module [', module_name, '] 須以 Ajax 載入資料！ ' ]
		                  		}, e.message ]);
		return;
	}
	if (!a || !(data = parse_CSV(a))
			|| data.length < 9
			|| data[0].length < 3) {
		library_namespace.warn('bank_account.TW.readData: Can not read data from [' + url + ']!');
		return;
	}
	//library_namespace.debug('Read ' + data.length + ' items from [' + url + ']', 1, 'bank_account.TW.readData');

	//	reset
	bank = [];

	for (; i < data.length; i++) {
		a = data[i];
		bank[Math.floor(a[0])] = {
				//	通匯金融代號
				id : a[0],
				//	總單位名稱
				name : a[1],
				//	帳號長度之描述
				digital : a[2]
		};
	}

};


//	class constructor	---------------------------

_.readData(path + 'bank/id.csv');


//	不再使繼承
delete _.clone;


//	instance public interface	-------------------

//	1: all, 2: 到總單位, 3: 到支單位
_p.setInputType=function(t,i){	//	(type,id)
 var _t=this;
 if(t)_t.inputAs=t,i=i||-1;
 t=_t.inputAs;
 //	mainLen+getDigital(i): 看來似乎得加上原來銀行代號 mainLen 碼。最起碼郵局是這樣。
 if(i)_t.setMaxLength(t==2?mainLen:t==3?branchLen:i<0?20:getDigital(i)?mainLen+getDigital(i):20);
 return t;
};

//	input: (list, index), return [value, title[, key=title||value]]
_p.onList=function(l,i){
 if(bankNow)return [l[i],i+' '+bankNow];
 else if(i in l)return [l[i].name,l[i].id];
};

//	input: (list, index), return value to set as input key
_p.onSelect=function(l,i){
 return bankNow?i:l[i].id;
};

_p.verify = function(k) {
	// sl('verify ['+k+']');
	var m;

	if (!k && k !== 0)
		return 1;

	if (!library_namespace.is_digits(k))
		return 2;

	if (k.length >= mainLen)
		if (!bank[m = Math.floor(k.slice(0, mainLen))]
				|| k.length >= branchLen
				&& (m = bank[m].branch)
				&& !(k.slice(0, branchLen) in m)
				//	為郵局(branch length:10)特設
				&& (k.slice(0, 3) !== '700' || !((k.slice(0, 10) in m))))
			return 1;
};





/**
 * 不 extend 的 member.
 * '*': 完全不 extend.
 * this: 連 module 本身都不 extend 到 library name-space 下.
 * @ignore
 */
_// JSDT:_module_
.no_extend = '*,this';


return (
	_// JSDT:_module_
);
}
//.TW
}

//	sub_module
}
});
