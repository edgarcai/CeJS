
(function (){

	/**
	 * 本 library / module 之 id
	 */
	var lib_name = 'locale';

	//	若 CeL 尚未 loaded 或本 library 已經 loaded 則跳出。
	if(typeof CeL !== 'function' || CeL.Class !== 'CeL' || CeL.is_loaded(lib_name))
		return;


/**
 * compatibility/相容性 test
 * @memberOf	CeL
 * @param	msg	msg
 */
CeL.locale = function(msg){
	alert(msg);
};



//CeL.extend(lib_name, {});

})();




//	i18n系列	==================

/*	setup message of various languages for i18n (internationalization)
var languagesMessage={},defaultLanguage,useLanguage,languageAlias;
setObjValue('languageAlias','en_US=en_US,en=en_US,English=en_US,zh_TW=zh_TW,zh=zh_TW,tw=zh_TW,中文=zh_TW,Chinese=zh_TW,日本語=ja_JP,Japanese=ja_JP,ja_JP=ja_JP,ja=ja_JP,jp=ja_JP');
*/
//getLanguageAlias[generateCode.dLK]='languageAlias,existLanguageAlias';
function getLanguageAlias(language){
 if(existLanguageAlias(language))language=languageAlias[language];
 return language;
}

//existLanguageAlias[generateCode.dLK]='languageAlias';
function existLanguageAlias(language){
 return language in languageAlias;
}

//	(language, if you want to setup defaultLanguage as well)
//setLanguage[generateCode.dLK]='getLanguageAlias,defaultLanguage,useLanguage';
function setLanguage(language,mode){
 language=getLanguageAlias(language);
 if(mode)defaultLanguage=language;
 else useLanguage=language;
 return useLanguage;
}

//	setMessage(messageIndex1,[local,message],[local,message],messageIndex2,[local,message],[local,message],..)
//setMessage[generateCode.dLK]='languagesMessage,defaultLanguage,getLanguageAlias';
function setMessage(){
 //if(!defaultLanguage)defaultLanguage='en_US';
 //	n.preference('intl.charset.default')	http://chaichan.hp.infoseek.co.jp/qa3500/qa3803.htm	http://articles.techrepublic.com.com/5100-22-5069931.html
 //	http://forum.mozilla.gr.jp/?mode=al2&namber=5608&rev=&&KLOG=39
 //	navigator.language=general.useragent.locale @ about:config
 //	var n=window.navigator;netscape.security.PrivilegeManager.enablePrivilege('UniversalPreferencesRead');setLanguage((n.browserLanguage||(n.preference&&n.preference('intl.accept_languages')?n.preference('intl.accept_languages').split(',')[0]:n.language?n.language.replace(/-/,'_'):'')));
 if(typeof languagesMessage!='object')languagesMessage={};
 var i=0,msgNow,language,msg;
 for(;i<arguments.length;i++){
  msg=arguments[i];
  //alert(typeof msg+','+msg.constructor+','+msg);
  if(typeof msg=='string')msgNow=msg;
  else if(msg instanceof Array){
   language=msg[0],msg=msg[1];
   //alert(language+','+msg);
   if(language==defaultLanguage||!language)msgNow=msg;
   else if(msgNow){
    language=getLanguageAlias(language);
    if(typeof languagesMessage[language]!='object')languagesMessage[language]={};
    //alert('['+language+']['+msgNow+']='+msg);
    languagesMessage[language][msgNow]=msg;
   }
  }
 }
}

//getMessage[generateCode.dLK]='languagesMessage,useLanguage,getLanguageAlias';
function getMessage(message,language){
 language=getLanguageAlias(language);
 try{
  //alert(languagesMessage[language||useLanguage]);
  return languagesMessage[language||useLanguage][message]||message;
 }catch(e){return message;}
}


//	↑i18n系列	==================





