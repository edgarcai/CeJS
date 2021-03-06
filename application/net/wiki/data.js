﻿/**
 * @name CeL function for MediaWiki (Wikipedia / 維基百科): wikidata
 * 
 * @fileoverview 本檔案包含了 MediaWiki 自動化作業用程式庫的子程式庫。
 * 
 * TODO:<code>

https://www.wikidata.org/wiki/Help:QuickStatements

</code>
 * 
 * @since 2019/10/11 拆分自 CeL.application.net.wiki
 * 
 * @see https://github.com/maxlath/wikibase-sdk
 */

// More examples: see /_test suite/test.js
// Wikipedia bots demo: https://github.com/kanasimi/wikibot
'use strict';
// 'use asm';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name
	name : 'application.net.wiki.data',

	require : 'data.native.|data.date.'
	//
	+ '|application.net.wiki.query.|application.net.wiki.page.'
	// wiki_API.edit.check_data()
	+ '|application.net.wiki.edit.'
	// wiki_API.parse.redirect()
	+ '|application.net.wiki.parser.'
	//
	+ '|application.net.Ajax.get_URL',

	// 設定不匯出的子函式。
	no_extend : 'this,*',

	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code
});

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL'), wiki_API = library_namespace.net.wiki, KEY_SESSION = wiki_API.KEY_SESSION, KEY_HOST_SESSION = wiki_API.KEY_HOST_SESSION;
	// @inner
	var API_URL_of_options = wiki_API.API_URL_of_options, is_api_and_title = wiki_API.is_api_and_title, is_wikidata_site = wiki_API.is_wikidata_site, wikidata_get_site = wiki_API.wikidata_get_site, language_code_to_site_alias = wiki_API.language_code_to_site_alias;
	var KEY_CORRESPOND_PAGE = wiki_API.KEY_CORRESPOND_PAGE, KEY_get_entity_value = wiki_API.KEY_get_entity_value, PATTERN_PROJECT_CODE_i = wiki_API.PATTERN_PROJECT_CODE_i, PATTERN_wiki_project_URL = wiki_API.PATTERN_wiki_project_URL;

	var
	/** {Number}未發現之index。 const: 基本上與程式碼設計合一，僅表示名義，不可更改。(=== -1) */
	NOT_FOUND = ''.indexOf('_');

	// ------------------------------------------------------------------------

	// 客製化的設定。
	// wikidata_site_alias[site code] = Wikidata site code
	// @see https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
	// for sites
	var wikidata_site_alias = {
		// 為粵文維基百科特別處理。
		yuewiki : 'zh_yuewiki',

		// 為日文特別修正: 'jp' is wrong!
		jpwiki : 'jawiki'
	};

	function get_data_API_URL(options, default_API_URL) {
		// library_namespace.debug('options:', 0, 'get_data_API_URL');
		// console.log(options);

		var API_URL;
		if (options) {
			var session = options[KEY_SESSION];
			if (wiki_API.is_wiki_API(session)) {
				if (session.data_session) {
					API_URL = session.data_session.API_URL;
				}
				if (!API_URL && session.is_wikidata) {
					API_URL = session.API_URL;
				}
			} else {
				API_URL = API_URL_of_options(options);
			}
		}

		// console.trace(API_URL);
		return API_URL || default_API_URL
		// `wikidata_API_URL`
		|| wiki_API.api_URL('wikidata');
	}

	// --------------------------------------------------------------------------------------------
	// Wikidata 操作函數
	// https://www.wikidata.org/wiki/Wikidata:Data_access

	/**
	 * @see <code>

	// https://meta.wikimedia.org/wiki/Wikidata/Notes/Inclusion_syntax
	{{label}}, {{Q}}, [[d:Q1]]

	http://wdq.wmflabs.org/api_documentation.html
	https://github.com/maxlath/wikidata-sdk

	</code>
	 * 
	 * @since
	 */

	/**
	 * 測試 value 是否為實體項目 wikidata entity / wikibase-item.
	 * 
	 * is_wikidata_page()
	 * 
	 * @param value
	 *            value to test. 要測試的值。
	 * @param {Boolean}[strict]
	 *            嚴格檢測。
	 * 
	 * @returns {Boolean}value 為實體項目。
	 */
	function is_entity(value, strict) {
		return library_namespace.is_Object(value)
		// {String}id: Q\d+ 或 P\d+。
		&& (strict ? /^[PQ]\d{1,10}$/.test(value.id) : value.id)
		//
		&& library_namespace.is_Object(value.labels);
	}

	/**
	 * API URL of wikidata.<br />
	 * e.g., 'https://www.wikidata.org/w/api.php',
	 * 'https://test.wikidata.org/w/api.php'
	 * 
	 * @type {String}
	 */
	var wikidata_API_URL = wiki_API.api_URL('wikidata');

	/**
	 * Combine ((session)) with Wikidata. 立即性(asynchronous)設定 this.data_session。
	 * 
	 * @param {wiki_API}session
	 *            正作業中之 wiki_API instance。
	 * @param {Function}[callback]
	 *            回調函數。 callback({Array}entity list or {Object}entity or
	 * @param {String}[API_URL]
	 *            language code or API URL of Wikidata
	 * @param {String}[password]
	 *            user password
	 * @param {Boolean}[force]
	 *            無論如何重新設定 this.data_session。
	 * 
	 * @inner
	 */
	function setup_data_session(session, callback, API_URL, password, force) {
		if (force === undefined) {
			if (typeof password === 'boolean') {
				// shift arguments.
				force = password;
				password = null;
			} else if (typeof API_URL === 'boolean' && password === undefined) {
				// shift arguments.
				force = API_URL;
				API_URL = null;
			}
		}

		if (session.data_session && API_URL & !force) {
			return;
		}

		if (session.data_session) {
			library_namespace.debug('直接清空佇列。', 2, 'setup_data_session');
			// TODO: 強制中斷所有正在執行之任務。
			session.data_session.actions.clear();
		}

		if (typeof API_URL === 'string' && !/wikidata/i.test(API_URL)
				&& !PATTERN_PROJECT_CODE_i.test(API_URL)) {
			// e.g., 'test' → 'test.wikidata'
			API_URL += '.wikidata';
		}

		// set Wikidata session
		var data_config = [ session.token.lgname,
		// wiki.set_data(host session, password)
		password || session.token.lgpassword,
		// API_URL: host session
		typeof API_URL === 'string' && wiki_API.api_URL(API_URL)
		//
		|| wikidata_API_URL ];
		if (data_config[0] && data_config[1]) {
			session.data_session = wiki_API.login(data_config[0],
					data_config[1], data_config[2]);
		} else {
			session.data_session = new wiki_API(data_config[0], data_config[1],
					data_config[2]);
		}

		library_namespace.debug('Setup 宿主 host session.', 2,
				'setup_data_session');
		session.data_session[KEY_HOST_SESSION] = session;
		library_namespace.debug('run callback: ' + callback, 2,
				'setup_data_session');
		session.data_session.run(callback);
	}

	// ------------------------------------------------------------------------

	function normalize_wikidata_key(key) {
		if (typeof key !== 'string') {
			library_namespace.error('normalize_wikidata_key: key: '
					+ JSON.stringify(key));
			// console.trace(key);
			throw new Error('normalize_wikidata_key: typeof key is NOT string!');
		}
		return key.replace(/_/g, ' ').trim();
	}

	/**
	 * 搜索標籤包含特定關鍵字(label=key)的項目。
	 * 
	 * 此搜索有極大問題:不能自動偵測與轉換中文繁簡體。 或須轉成英語再行搜尋。
	 * 
	 * @example<code>

	CeL.wiki.data.search('宇宙', function(entity) {result=entity;console.log(entity[0]==='Q1');}, {get_id:true});
	CeL.wiki.data.search('宇宙', function(entity) {result=entity;console.log(entity==='Q1');}, {get_id:true, limit:1});
	CeL.wiki.data.search('形狀', function(entity) {result=entity;console.log(entity==='P1419');}, {get_id:true, type:'property'});

	</code>
	 * 
	 * @param {String}key
	 *            要搜尋的關鍵字。item/property title.
	 * @param {Function}[callback]
	 *            回調函數。 callback({Array}entity list or {Object}entity or
	 *            {String}entity id, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function wikidata_search(key, callback, options) {
		if (!key) {
			callback(undefined, 'wikidata_search: No key assigned.');
			return;
		}
		if (typeof options === 'function')
			options = {
				filter : options
			};
		else if (typeof options === 'string') {
			options = {
				language : options
			};
		} else {
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);
		}

		var language = options.language;
		if (is_api_and_title(key, 'language')) {
			if (is_wikidata_site(key[0])) {
				wikidata_entity(key, function(entity, error) {
					// console.log(entity);
					var id = !error && entity && entity.id;
					// 預設找不到 sitelink 會作搜尋。
					if (!id && !options.no_search) {
						key = key.clone();
						if (key[0] = key[0].replace(/wiki.*$/, '')) {
							wikidata_search(key, callback, options);
							return;
						}
					}
					callback(id, error);
				}, {
					props : ''
				});
				return;
			}
			// for [ {String}language, {String}key ]
			language = key[0];
			key = key[1];
		}

		// console.log('key: ' + key);
		key = normalize_wikidata_key(key);
		var action = [ API_URL_of_options(options) || wikidata_API_URL,
		// search. e.g.,
		// https://www.wikidata.org/w/api.php?action=wbsearchentities&search=abc&language=en&utf8=1
		'wbsearchentities&search=' + encodeURIComponent(key)
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
		+ '&language=' + (language
		//
		|| wikidata_get_site(options, true) || wiki_API.language)
		//
		+ '&limit=' + (options.limit || 'max') ];

		if (options.type) {
			// item|property
			// 預設值：item
			action[1] += '&type=' + options.type;
		}

		if (options['continue'] > 0)
			action[1] += '&continue=' + options['continue'];

		wiki_API.query(action, function(data, error) {
			if (!error) {
				error = data ? data.error : 'No data get';
			}
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wikidata_search: ['
				//
				+ error.code + '] ' + error.info);
				callback(undefined, error);
				return;
			}

			// console.log(data);
			var list;
			if (!Array.isArray(data.search)) {
				list = [];
			} else if (!('filter' in options)
					|| typeof options.filter === 'function') {
				list = data.search.filter(options.filter ||
				// default filter
				function(item) {
					// 自此結果能得到的資訊有限。
					// label: 'Universe'
					// match: { type: 'label', language: 'zh', text: '宇宙' }
					if (item.match && key === item.match.text
					// 通常不會希望取得維基百科消歧義頁。
					// @see 'Wikimedia disambiguation page' @
					// [[d:MediaWiki:Gadget-autoEdit.js]]
					&& !/disambiguation|消歧義|消歧義|曖昧さ回避/.test(item.description)) {
						return true;
					}
				});
			}

			if (Array.isArray(options.list)) {
				options.list.push(list);
			} else {
				options.list = [ list ];
			}
			list = options.list;

			if (!options.limit && data['search-continue'] > 0) {
				options['continue'] = data['search-continue'];
				wikidata_search(key, callback, options);
				return;
			}

			if (Array.isArray(list.length) && list.length > 1) {
				// clone list
				list = list.clone();
			} else {
				list = list[0];
			}
			if (options.get_id) {
				list = list.map(function(item) {
					return item.id;
				});
			}
			if (!options.multi && (
			// options.limit <= 1
			list.length <= 1)) {
				list = list[0];
			}
			// console.trace(options);
			callback(list);
		}, null, options);
	}

	// wikidata_search_cache[{String}"zh:性質"] = {String}"P31";
	var wikidata_search_cache = {
	// 載於, 出典, source of claim
	// 'en:stated in' : 'P248',
	// 導入自, source
	// 'en:imported from Wikimedia project' : 'P143',
	// 來源網址, website
	// 'en:reference URL' : 'P854',
	// 檢索日期
	// 'en:retrieved' : 'P813'
	},
	// entity (Q\d+) 用。
	// 可考量加入 .type (item|property) 為 key 的一部分，
	// 或改成 wikidata_search_cache={item:{},property:{}}。
	wikidata_search_cache_entity = Object.create(null);

	wikidata_search.add_cache = function(key, id, language, is_entity) {
		var cached_hash = is_entity ? wikidata_search_cache_entity
				: wikidata_search_cache;
		language = wikidata_get_site(language, true) || wiki_API.language;
		cached_hash[language + ':' + key] = id;
	};

	// wrapper function of wikidata_search().
	wikidata_search.use_cache = function(key, callback, options) {
		if (!options && library_namespace.is_Object(callback)) {
			// shift arguments.
			options = callback;
			callback = undefined;
		}

		var language_and_key,
		// 須與 wikidata_search() 相同!
		// TODO: 可以 guess_language(key) 猜測語言。
		language = wikidata_get_site(options, true) || wiki_API.language,
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
		cached_hash = options && options.type && options.type !==
		// default_options.type: 'property'
		wikidata_search.use_cache.default_options.type ? wikidata_search_cache_entity
				: wikidata_search_cache;

		// console.log(key);
		if (library_namespace.is_Object(key)) {
			// convert language+value object
			if (key.language && ('value' in key)) {
				// e.g., {language:'ja',value:'日本'}
				key = [ key.language, key.value ];
			} else if ((language_and_key = Object.keys(key)).length === 1
			// e.g., {ja:'日本'}
			&& (language_and_key = language_and_key[0])) {
				key = [ language_and_key, key[language_and_key] ];
			}
		}

		if (typeof key === 'string') {
			key = normalize_wikidata_key(key);
			language_and_key = language + ':' + key;

		} else if (Array.isArray(key)) {
			if (is_api_and_title(key, 'language')) {
				// key.join(':')
				language_and_key = key[0] + ':'
				//
				+ normalize_wikidata_key(key[1]);
			} else {
				// 處理取得多 keys 之 id 的情況。
				var index = 0,
				//
				cache_next_key = function() {
					library_namespace.debug(index + '/' + key.length, 3,
							'use_cache.cache_next_key');
					if (index === key.length) {
						// done. callback(id_list)
						callback(key.map(function(k) {
							if (is_api_and_title(k, 'language')) {
								return cached_hash[k[0] + ':'
								//
								+ normalize_wikidata_key(k[1])];
							}
							k = normalize_wikidata_key(k);
							return cached_hash[language + ':' + k];
						}));
						return;
					}
					// console.trace(options);
					wikidata_search.use_cache(key[index++], cache_next_key,
					//
					Object.assign({
						API_URL : get_data_API_URL(options)
					}, wikidata_search.use_cache.default_options, {
						// 警告:若是設定must_callback=false，會造成程序不callback而中途跳出!
						must_callback : true
					}, options));
				};
				cache_next_key();
				return;
			}

		} else {
			// 避免若是未match is_api_and_title(key, 'language')，
			// 可能導致 infinite loop!
			key = 'wikidata_search.use_cache: Invalid key: [' + key + ']';
			// console.warn(key);
			callback(undefined, key);
			return;
		}
		library_namespace.debug('search '
				+ (language_and_key || JSON.stringify(key)) + ' ('
				+ is_api_and_title(key, 'language') + ')', 4,
				'wikidata_search.use_cache');

		if ((!options || !options.force)
		// TODO: key 可能是 [ language code, labels|aliases ] 之類。
		// &&language_and_key
		&& (language_and_key in cached_hash)) {
			library_namespace.debug('has cache: [' + language_and_key + '] → '
					+ cached_hash[language_and_key], 4,
					'wikidata_search.use_cache');
			key = cached_hash[language_and_key];

			if (/^[PQ]\d{1,10}$/.test(key)) {
			}
			if (options && options.must_callback) {
				callback(key);
				return;
			} else {
				// 只在有 cache 時才即刻回傳。
				return key;
			}
		}

		if (!options || library_namespace.is_empty_object(options)) {
			options = Object.clone(wikidata_search.use_cache.default_options);
		} else if (!options.get_id) {
			if (!options.must_callback) {
				// 在僅設定 .must_callback 時，不顯示警告而自動補上應有的設定。
				library_namespace.warn('wikidata_search.use_cache: 當把實體名稱 ['
						+ language_and_key
						+ '] 轉換成 id 時，應設定 options.get_id。 options: '
						+ JSON.stringify(options));
			}
			options = Object.assign({
				get_id : true
			}, options);
		}

		// console.log(arguments);
		wikidata_search(key, function(id, error) {
			// console.log(language_and_key + ': ' + id);
			if (!id) {
				library_namespace
						.error('wikidata_search.use_cache: Nothing found: ['
								+ language_and_key + ']');
				// console.log(options);
				// console.trace('wikidata_search.use_cache: Nothing found');

			} else if (typeof id === 'string' && /^[PQ]\d{1,10}$/.test(id)) {
				library_namespace.debug('cache '
				// 搜尋此類型的實體。 預設值：item
				+ (options && options.type || 'item')
				//
				+ ' ' + id + ' ← [' + language_and_key + ']', 1,
						'wikidata_search.use_cache');
			}
			// 即使有錯誤，依然做 cache 紀錄，避免重複偵測操作。
			cached_hash[language_and_key] = id;

			callback(id, error);
		}, options);
	};

	// default options passed to wikidata_search()
	wikidata_search.use_cache.default_options = {
		// 若有必要用上 options.API_URL，應在個別操作內設定。

		// 通常 property 才值得使用 cache。
		// entity 可採用 'item'
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsearchentities
		type : 'property',
		// limit : 1,
		get_id : true
	};

	// ------------------------------------------------------------------------

	/**
	 * {Array}時間精度(精密度)單位。
	 * 
	 * 注意：須配合 index_precision @ CeL.data.date！
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON#time
	 */
	var time_unit = 'gigayear,100 megayear,10 megayear,megayear,100 kiloyear,10 kiloyear,millennium,century,decade,year,month,day,hour,minute,second,microsecond'
			.split(','),
	// 精確至日: 11。
	INDEX_OF_PRECISION = time_unit.to_hash();
	time_unit.zh = '十億年,億年,千萬年,百萬年,十萬年,萬年,千紀,世紀,年代,年,月,日,時,分,秒,毫秒,微秒,納秒'
			.split(',');

	/**
	 * 將時間轉為字串。
	 * 
	 * @inner
	 */
	function time_toString() {
		var unit = this.unit;
		if (this.power) {
			unit = Math.abs(this[0]) + unit[0];
			return this.power > 1e4 ? unit + (this[0] < 0 ? '前' : '後')
			//
			: (this[0] < 0 ? '前' : '') + unit;
		}

		return this.map(function(value, index) {
			return value + unit[index];
		}).join('');
	}

	/**
	 * 將經緯度座標轉為字串。
	 * 
	 * @inner
	 */
	function coordinate_toString(type) {
		// 經緯度座標 coordinates [ latitude 緯度, longitude 經度 ]
		return Marh.abs(this[0]) + ' ' + (this[0] < 0 ? 'S' : 'N')
		//
		+ ', ' + Marh.abs(this[1]) + ' ' + (this[1] < 0 ? 'W' : 'E');
	}

	/**
	 * 將特定的屬性值轉為 JavaScript 的物件。
	 * 
	 * @param {Object}data
	 *            從Wikidata所得到的屬性值。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns 轉成JavaScript的值。
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/API#wbformatvalue
	 *      https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON#Claims_and_Statements
	 *      https://www.mediawiki.org/wiki/Wikibase/API
	 *      https://www.mediawiki.org/wiki/Wikibase/Indexing/RDF_Dump_Format#Value_representation
	 *      https://www.wikidata.org/wiki/Special:ListDatatypes
	 */
	function wikidata_datavalue(data, callback, options) {
		// console.log(data);
		// console.log(JSON.stringify(data));
		if (library_namespace.is_Object(callback) && !options) {
			// shift arguments.
			options = callback;
			callback = undefined;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		callback = typeof callback === 'function' && callback;

		var value = options.multi && !Array.isArray(data) ? [ data ] : data;

		if (Array.isArray(value)) {
			if (!options.single) {
				if (options.multi) {
					delete options.multi;
				}
				// TODO: array + ('numeric-id' in value)
				// TODO: using Promise.all([])
				if (callback) {
					// console.log(value);
					value.run_parallel(function(run_next, item, index) {
						// console.log([ index, item ]);
						wikidata_datavalue(item, function(v, error) {
							// console.log([ index, v ]);
							value[index] = v;
							run_next();
						}, options);
					}, function() {
						callback(value);
					});
				}
				return value.map(function(v) {
					return wikidata_datavalue(v, undefined, options);
				});
			}

			// 選擇推薦值/最佳等級。
			var first;
			if (value.every(function(v) {
				if (!v) {
					return true;
				}
				if (v.rank !== 'preferred') {
					if (!first) {
						first = v;
					}
					return true;
				}
				// TODO: check v.mainsnak.datavalue.value.language
				value = v;
				// return false;
			})) {
				// 沒有推薦值，選擇首個非空的值。
				value = first;
			}
		}

		if (is_entity(value)) {
			// get label of entity
			value = value.labels;
			var language = wikidata_get_site(options, true);
			language = language && value[language] || value[wiki_API.language]
			// 最起碼選個國際通用的。
			|| value.en;
			if (!language) {
				// 隨便挑一個語言的 label。
				for (language in value) {
					value = value[language];
					break;
				}
			}
			return value.value;
		}

		if (!value) {
			callback && callback(value);
			return value;
		}

		// TODO: value.qualifiers, value['qualifiers-order']
		// TODO: value.references
		value = value.mainsnak || value;
		if (value) {
			// console.log(value);
			// console.log(JSON.stringify(value));

			// 與 normalize_wikidata_value() 須同步!
			if (value.snaktype === 'novalue') {
				value = null;
				callback && callback(value);
				return value;
			}
			if (value.snaktype === 'somevalue') {
				// e.g., [[Q1]], Property:P1419 形狀
				// Property:P805 主條目
				if (callback && data.qualifiers
						&& Array.isArray(value = data.qualifiers.P805)) {
					if (value.length === 1) {
						value = value[0];
					}
					delete options[library_namespace.new_options.new_key];
					// console.log(value);
					wikidata_datavalue(value, callback, options);
					return;
				}
				value = wikidata_edit.somevalue;
				callback && callback(value);
				return value;
			}
		}
		// assert: value.snaktype === 'value'
		value = value.datavalue || value;

		var type = value.type;
		// TODO: type 可能為 undefined!

		if ('value' in value)
			value = value.value;

		if (typeof value !== 'object') {
			// e.g., typeof value === 'string'
			callback && callback(value);
			return value;
		}

		if ('text' in value) {
			// e.g., { text: 'Ὅμηρος', language: 'grc' }
			value = value.text;
			callback && callback(value);
			return value;
		}

		if ('amount' in value) {
			// qualifiers 純量數值
			value = +value.amount;
			callback && callback(value);
			return value;
		}

		if ('latitude' in value) {
			// 經緯度座標 coordinates [ latitude 緯度, longitude 經度 ]
			var coordinate = [ value.latitude, value.longitude ];
			if (false) {
				// geodetic reference system, 大地座標系/坐標系統測量基準
				var system = value.globe.match(/[^\\\/]+$/);
				system = system && system[0];
				switch (system) {
				case 'Q2':
					coordinate.system = 'Earth';
					break;
				case 'Q11902211':
					coordinate.system = 'WGS84';
					break;
				case 'Q215848':
					coordinate.system = 'WGS';
					break;
				case 'Q1378064':
					coordinate.system = 'ED50';
					break;
				default:
					if (system)
						coordinate.system = system;
					else
						// invalid data?
						;
				}
			}
			// TODO: precision
			coordinate.precision = value.precision;
			coordinate.toString = coordinate_toString;
			value = coordinate;
			callback && callback(value);
			return value;
		}

		if ('time' in value) {
			// date & time. 時間日期
			var matched, year, precision = value.precision;

			if (precision <= 9) {
				matched = value.time.match(/^[+\-]\d+/);
				year = +matched[0];
				var power = Math.pow(10, 9 - precision);
				matched = [ year / power | 0 ];
				matched.unit = [ time_unit.zh[precision] ];
				matched.power = power;

			} else {
				matched = value.time.match(
				// [ all, Y, m, d, H, M, S ]
				/^([+\-]\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)Z$/);
				// +1: is length, not index
				// +1: year starts from 1.
				matched = matched.slice(1, precision - 9 + 1 + 1)
				//
				.map(function(value) {
					return +value;
				});
				year = matched[0];
				matched.unit = time_unit.zh.slice(9, precision + 1);
			}

			// proleptic Gregorian calendar:
			// http://www.wikidata.org/entity/Q1985727
			// proleptic Julian calendar:
			// http://www.wikidata.org/entity/Q1985786
			var type = value.calendarmodel.match(/[^\\\/]+$/);
			if (type && type[0] === 'Q1985786') {
				matched.Julian = true;
				// matched.type = 'Julian';
			} else if (type && type === 'Q1985727') {
				// matched.type = 'Gregorian';
			} else {
				// matched.type = type || value.calendarmodel;
			}

			var Julian_day;
			if (year >= -4716
			//
			&& (Julian_day = library_namespace.Julian_day))
				// start JDN
				matched.JD = Julian_day.from_YMD(year, matched[1], matched[2],
						!matched.Julian);
			matched.toString = time_toString;
			callback && callback(matched);
			return matched;
		}

		if ('numeric-id' in value) {
			// wikidata entity. 實體
			value = 'Q' + value['numeric-id'];
			if (callback) {
				library_namespace.debug('Trying to get entity ' + value, 1,
						'wikidata_datavalue');
				// console.log(value);
				// console.log(wikidata_get_site(options, true));
				wikidata_entity(value, options.get_object ? callback
				// default: get label 標籤標題
				: function(entity, error) {
					// console.log([ entity, error ]);
					if (error) {
						library_namespace.debug(
								'Failed to get entity ' + value, 0,
								'wikidata_datavalue');
						callback && callback(undefined, error);
						return;
					}
					entity = entity.labels || entity;
					entity = entity[wikidata_get_site(options, true)
							|| wiki_API.language]
							|| entity;
					callback
							&& callback('value' in entity ? entity.value
									: entity);
				}, {
					languages : wikidata_get_site(options, true)
				});
			}
			return value;
		}

		library_namespace.warn('wikidata_datavalue: 尚無法處理此屬性: [' + type
				+ ']，請修改本函數。');
		callback && callback(value);
		return value;
	}

	// 取得value在property_list中的index。相當於 property_list.indexOf(value)
	// type=-1: list.lastIndexOf(value), type=1: list.includes(value),
	// other type: list.indexOf(value)
	wikidata_datavalue.get_index = function(property_list, value, type) {
		function to_comparable(value) {
			if (Array.isArray(value) && value.JD) {
				// e.g., new Date('2000-1-1 UTC+0')
				var date = new Date(value.join('-') + ' UTC+0');
				if (isNaN(date.getTime())) {
					library_namespace
							.error('wikidata_datavalue.get_index: Invalid Date: '
									+ value);
				}
				value = date;
			}
			// e.g., library_namespace.is_Date(value)
			return typeof value === 'object' ? JSON.stringify(value) : value;
		}

		property_list = wikidata_datavalue(property_list, undefined, {
			multi : true
		}).map(to_comparable);

		value = to_comparable(value && value.datavalue ? wikidata_datavalue(value)
				: value);

		if (!isNaN(value) && property_list.every(function(v) {
			return typeof v === 'number';
		})) {
			value = +value;
		}

		// console.log([ value, property_list ]);

		if (type === 0) {
			return [ property_list, value ];
		}
		if (type === 1) {
			return property_list.includes(value);
		}
		if (type === -1) {
			return property_list.lastIndexOf(value);
		}
		return property_list.indexOf(value);
	};

	// ------------------------------------------------------------------------

	// @see [[:en:Help:Interwiki linking#Project titles and shortcuts]],
	// [[:zh:Help:跨语言链接#出現在正文中的連結]]
	// TODO:
	// [[:phab:T102533]]
	// [[:sourceforge:project/shownotes.php?release id=226003&group id=34373]]
	// http://sourceforge.net/project/shownotes.php%3Frelease_id%3D226003%26group_id%3D34373
	// [[:gerrit:gitweb?p=mediawiki/core.git;a=blob;f=RELEASE-NOTES-1.23]]
	// https://gerrit.wikimedia.org/r/gitweb%3Fp%3Dmediawiki/core.git;a%3Dblob;f%3DRELEASE-NOTES-1.23
	// [[:google:湘江]]
	// https://www.google.com/search?q=%E6%B9%98%E6%B1%9F
	// [[:imdbtitle:0075713]], [[:imdbname:2339825]] → {{imdb name}}
	// http://www.imdb.com/title/tt0075713/
	// [[:arxiv:Hep-ex/0403017]]
	// [[:gutenberg:27690]]
	// [[:scores:Das wohltemperierte Klavier I, BWV 846-869 (Bach, Johann
	// Sebastian)]]
	// [[:wikt:제비]]
	// [[:yue:海珠湖國家濕地公園]]

	// @see set_default_language()
	// language-code.wikipedia.org e.g., zh-classical.wikipedia.org
	//
	// IETF language tag language code for gettext()
	// e.g., zh-classical → lzh
	// [[language_code:]] e.g., [[zh-classical:]] @see [[m:List of Wikipedias]]
	// [[yue:]] → zh-yue → zh_yuewiki
	//
	// site_namewiki for Wikidata API e.g., zh-classical → zh_classicalwiki
	// @see https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	// language_code for database e.g., zh-classical → zh_classicalwiki_p

	/**
	 * language code → Wikidata site code / Wikidata site name / Wikimedia
	 * project name<br />
	 * 將語言代碼轉為 Wikidata API 可使用之 site name。
	 * 
	 * @example<code>

	// e.g., 'enwiki', 'zhwiki', 'enwikinews'
	CeL.wiki.site_name(wiki)

	</code>
	 * 
	 * @param {String}language
	 *            語言代碼, project code or session。 e.g., en, zh-classical, ja
	 * @param {String}[family]
	 *            Wikimedia project / family. e.g., wikipedia, wikinews,
	 *            wiktionary. assert: family &&
	 *            /^wik[it][a-z]{0,9}$/.test(family)
	 * 
	 * @returns {String}Wikidata API 可使用之 site name。
	 * 
	 * @see wikidata_get_site()
	 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	 * 
	 * @since 2017/9/4 20:57:8 整合原先的 language_to_project(),
	 *        language_to_site_name()
	 */
	function language_to_site_name(language, family) {
		// 不能保證 wiki_API.is_wiki_API(language) → is_Object(language)，因此使用
		// typeof。
		if (typeof language === 'object') {
			var session = language[KEY_SESSION];
			if (session) {
				// treat language as options.
				// options.language 較 session 的設定優先。
				language = language.language || session.API_URL;
			} else if (wiki_API.is_wiki_API(language)) {
				// treat language as session.
				session = language;
				// assert: typeof language.API_URL === 'string'
				language = session.API_URL;
			}
		}
		// console.log(session);

		if (language) {
			// 正規化。
			language = String(language).trim().toLowerCase();
			if (!isNaN(wiki_API.namespace(language))) {
				// e.g., input "language" of [[Category:title]]
				// 光是只有 "Category"，代表還是在本 wiki 中，不算外語言。
				// return language;
				return wiki_API.language
						+ (!family || family === 'wikipedia' ? 'wiki' : family);
			}

			/**
			 * matched: [ 0: protocol + host name, 1: protocol, 2: host name,<br />
			 * 3: 第一 domain name (e.g., language code / family / project),<br />
			 * 4: 第二 domain name (e.g., family: 'wikipedia') ]
			 * 
			 * @see PATTERN_PROJECT_CODE
			 */
			var matched = language.match(PATTERN_wiki_project_URL);
			if (matched) {
				// console.log(matched);
				library_namespace.debug(language, 4, 'language_to_site_name');
				family = family || matched[4];
				// TODO: error handling
				language = matched[3]
				// e.g., 'zh-min-nan' → 'zh_min_nan'
				.replace(/[- ]/g, '_');
				// using "commons" instead of "commonswikimedia"
				if (family !== 'wikimedia'
						|| !(language in wiki_API.api_URL.wikimedia)) {
					// e.g., language = [ ..., 'zh', 'wikinews' ] → 'zhwikinews'
					language += family === 'wikipedia' ? 'wiki' : family;
				}
				library_namespace.debug(language, 3, 'language_to_site_name');
				return language;
			}
		} else {
			// 警告: 若是沒有輸入，則會直接回傳預設的語言。因此您或許需要先檢測是不是設定了 language。
			language = wiki_API.language.replace(/[- ]/g, '_');
		}

		var matched = language
		// 拆分 language, family。以防 incase wikt, wikisource
		// testwikidatawiki → testwikidata,wiki
		.match(/^([a-z\d_]+)(wik[it][a-z]{0,9}?)$/, '');
		if (matched) {
			language = matched[1];
			family = family || matched[2];
		}

		if (language in language_code_to_site_alias) {
			// e.g., 'lzh' → 'zh-classical'
			language = language_code_to_site_alias[language];
		}

		language += !family || family === 'wikipedia' ? 'wiki' : family;
		// throw language;
		return language;
	}

	/**
	 * language code → Wikidata site name / Wikimedia project name<br />
	 * 將語言代碼轉為 Wikidata site name / Wikimedia project name。
	 * 
	 * @param {String}language
	 *            語言代碼, project code or session。
	 * 
	 * @returns {String}Wikidata site name / Wikimedia project name。
	 * 
	 * @see wikidata_get_site()
	 */
	function deprecated_language_to_project(language) {
		if (wiki_API.is_wiki_API(language)) {
			// treat language as session.
			// assert: typeof language.API_URL === 'string'
			language = language.API_URL.toLowerCase().match(
			// @see PATTERN_PROJECT_CODE
			/\/\/([a-z][a-z\d\-]{0,14})\.([a-z]+)/);
			library_namespace.debug(language, 4, 'language_to_project');
			// TODO: error handling
			language = language[1].replace(/-/g, '_')
			// e.g., language = [ ..., 'zh', 'wikinews' ] → 'zhwikinews'
			+ (language[2] === 'wikipedia' ? 'wiki' : language[2]);
			library_namespace.debug(language, 3, 'language_to_project');
			return language;
		}

		// 正規化。
		language = language && String(language).trim().toLowerCase()
		// 以防 incase wikt, wikisource
		.replace(/wik.+$/, '') || wiki_API.language;

		if (language.startsWith('category')) {
			// e.g., input "language" of [[Category:title]]
			// 光是只有 "Category"，代表還是在本 wiki 中，不算外語言。
			return language;
			return wiki_API.language + 'wiki';
		}

		if (language in language_code_to_site_alias) {
			// e.g., 'lzh' → 'zh-classical'
			language = language_code_to_site_alias[language];
		}

		// e.g., 'zh-min-nan' → 'zh_min_nan'
		var site = language.replace(/-/g, '_') + 'wiki';
		if (site in wikidata_site_alias) {
			site = wikidata_site_alias[site];
		}

		return site;
	}

	/**
	 * language code → Wikidata site code<br />
	 * 將語言代碼轉為 Wikidata API 可使用之 site name。
	 * 
	 * @param {String}language
	 *            語言代碼。
	 * 
	 * @returns {String}Wikidata API 可使用之 site name。
	 * 
	 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	 */
	function deprecated_language_to_site(language) {
		// 正規化。
		language = language && typeof language !== 'object' ? String(language)
				.trim().toLowerCase()
		// 警告: 若是沒有輸入，則會直接回傳預設的語言。因此您或許需要先檢測是不是設定了 language。
		: wiki_API.language;

		if (language.startsWith('category')) {
			// e.g., input "language" of [[Category:title]]
			// 光是只有 "Category"，代表還是在本 wiki 中，不算外語言。
			return language;
			return wiki_API.language + 'wiki';
		}

		// e.g., 'zh-min-nan' → 'zh_min_nan'
		var site = language.replace(/-/g, '_');
		if (!site.includes('wik')) {
			// 以防 incase wikt, wikisource
			site += 'wiki';
		}

		if (site in wikidata_site_alias) {
			site = wikidata_site_alias[site];
		}

		return site;
	}

	/**
	 * get label of entity. 取得指定實體的標籤。
	 * 
	 * CeL.wiki.data.label_of()
	 * 
	 * @param {Object}entity
	 *            指定實體。
	 * @param {String}[language]
	 *            指定取得此語言之資料。
	 * @param {Boolean}[use_title]
	 *            當沒有標籤的時候，使用各語言連結標題。
	 * @param {Boolean}[get_labels]
	 *            取得所有標籤。
	 * 
	 * @returns {String|Array}標籤。
	 */
	function get_entity_label(entity, language, use_title, get_labels) {
		if (get_labels) {
			if (use_title) {
				use_title = get_entity_link(entity, language);
				if (!Array.isArray(use_title))
					use_title = use_title ? [ use_title ] : [];
			}
			return entity_labels_and_aliases(entity, language, use_title);
		}

		var labels = entity && entity.labels;
		if (labels) {
			var label = labels[language || wiki_API.language];
			if (label)
				return label.value;
			if (!language)
				return labels;
		}

		if (use_title) {
			return get_entity_link(entity, language);
		}
	}

	/**
	 * get site link of entity. 取得指定實體的語言連結標題。
	 * 
	 * CeL.wiki.data.title_of(entity, language)
	 * 
	 * @param {Object}entity
	 *            指定實體。
	 * @param {String}[language]
	 *            指定取得此語言之資料。
	 * 
	 * @returns {String}語言標題。
	 */
	function get_entity_link(entity, language) {
		var sitelinks = entity && entity.sitelinks;
		if (sitelinks) {
			var link = sitelinks[wiki_API.site_name(language)];
			if (link) {
				return link.title;
			}
			if (!language) {
				link = [];
				for (language in sitelinks) {
					link.push(sitelinks[language].title);
				}
				return link;
			}
		}
	}

	/**
	 * 取得特定實體的特定屬性值。
	 * 
	 * @example<code>

	CeL.wiki.data('Q1', function(entity) {result=entity;});
	CeL.wiki.data('Q2', function(entity) {result=entity;console.log(JSON.stringify(entity).slice(0,400));});
	CeL.wiki.data('Q1', function(entity) {console.log(entity.id==='Q1'&&JSON.stringify(entity.labels)==='{"zh":{"language":"zh","value":"宇宙"}}');}, {languages:'zh'});
	CeL.wiki.data('Q1', function(entity) {console.log(entity.labels['en'].value+': '+entity.labels['zh'].value==='universe: 宇宙');});
	// Get the property of wikidata entity.
	// 取得Wikidata中指定實體項目的指定屬性/陳述。
	CeL.wiki.data('Q1', function(entity) {console.log(entity['en'].value+': '+entity['zh'].value==='universe: 宇宙');}, 'labels');
	// { id: 'P1', missing: '' }
	CeL.wiki.data('Q1|P1', function(entity) {console.log(JSON.stringify(entity[1])==='{"id":"P1","missing":""}');});
	CeL.wiki.data(['Q1','P1'], function(entity) {console.log(entity);});

	CeL.wiki.data('Q11188', function(entity) {result=entity;console.log(JSON.stringify(entity.labels.zh)==='{"language":"zh","value":"世界人口"}');});

	CeL.wiki.data('P6', function(entity) {result=entity;console.log(JSON.stringify(entity.labels.zh)==='{"language":"zh","value":"政府首长"');});

	CeL.wiki.data('宇宙', '形狀', function(entity) {result=entity;console.log(entity==='宇宙的形狀');})
	CeL.wiki.data('荷马', '出生日期', function(entity) {result=entity;console.log(''+entity==='前8世紀');})
	CeL.wiki.data('荷马', function(entity) {result=entity;console.log(CeL.wiki.entity.value_of(entity.claims.P1477)==='Ὅμηρος');})
	CeL.wiki.data('艾薩克·牛頓', '出生日期', function(entity) {result=entity;console.log(''+entity==='1643年1月4日,1642年12月25日');})

	// 實體項目值的鏈接數據界面 (無法篩選所要資料，傳輸量較大。)
	// 非即時資料!
	CeL.get_URL('https://www.wikidata.org/wiki/Special:EntityData/Q1.json',function(r){r=JSON.parse(r.responseText);console.log(r.entities.Q1.labels.zh.value)})

	// ------------------------------------------------------------------------

	wiki = CeL.wiki.login(user_name, pw, 'wikidata');
	wiki.data(id, function(entity){}, {is_key:true}).edit_data(function(entity){});
	wiki.page('title').data(function(entity){}, options).edit_data().edit()

	wiki = Wiki(true)
	wiki.page('宇宙').data(function(entity){result=entity;console.log(entity);})

	wiki = Wiki(true, 'wikidata');
	wiki.data('宇宙', function(entity){result=entity;console.log(entity.labels['en'].value==='universe');})
	wiki.data('宇宙', '形狀', function(entity){result=entity;console.log(entity==='宇宙的形狀');})
	wiki.query('CLAIM[31:14827288] AND CLAIM[31:593744]', function(entity) {result=entity;console.log(entity.labels['zh-tw'].value==='維基資料');})

	</code>
	 * 
	 * @param {String|Array}key
	 *            entity id. 欲取得之特定實體 id。 e.g., 'Q1', 'P6'
	 * @param {String}[property]
	 *            取得特定屬性值。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON
	 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
	 */
	function wikidata_entity(key, property, callback, options) {
		if (typeof property === 'function' && !options) {
			// shift arguments.
			options = callback;
			callback = property;
			property = null;
		}

		if (typeof options === 'string') {
			options = {
				props : options
			};
		} else if (typeof options === 'function') {
			options = {
				filter : options
			};
		} else {
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);
		}

		var API_URL = get_data_API_URL(options);
		if (false) {
			console.log('wikidata_entity: get_data_API_URL API_URL : '
					+ API_URL);
		}

		// ----------------------------
		// convert property: title to id
		if (typeof property === 'string' && !/^P\d{1,5}$/.test(property)) {
			if (library_namespace.is_debug(2)
					&& /^(?:(?:info|sitelinks|sitelinks\/urls|aliases|labels|descriptions|claims|datatype)\|)+$/
							.test(property + '|'))
				library_namespace.warn(
				//
				'wikidata_entity: 您或許該採用 options.props = ' + property);
			/** {String}setup language of key and property name. 僅在需要 search 時使用。 */
			property = [ wikidata_get_site(options, true) || wiki_API.language,
					property ];
		}

		// console.log('property: ' + property);
		if (is_api_and_title(property, 'language')) {
			// TODO: property 可能是 [ language code, 'labels|aliases' ] 之類。
			property = wikidata_search.use_cache(property, function(id, error) {
				wikidata_entity(key, id, callback, options);
			}, options);
			if (!property) {
				// assert: property === undefined
				// Waiting for conversion.
				return;
			}
		}

		// ----------------------------
		// convert key: title to id
		if (typeof key === 'number') {
			key = [ key ];
		} else if (typeof key === 'string'
				&& !/^[PQ]\d{1,10}(\|[PQ]\d{1,10})*$/.test(key)) {
			/** {String}setup language of key and property name. 僅在需要 search 時使用。 */
			key = [ wikidata_get_site(options, true) || wiki_API.language, key ];
		}

		if (Array.isArray(key)) {
			if (is_api_and_title(key)) {
				if (is_wikidata_site(key[0])) {
					key = {
						site : key[0],
						title : key[1]
					};

				} else {
					wikidata_search(key, function(id) {
						if (id) {
							library_namespace.debug(
							//
							'entity ' + id + ' ← [[:' + key.join(':') + ']]',
									1, 'wikidata_entity');
							wikidata_entity(id, property, callback, options);
							return;
						}

						// 可能為重定向頁面？
						// 例如要求 "A of B" 而無此項，
						// 但 [[en:A of B]]→[[en:A]] 且存在 "A"，則會回傳本"A"項。
						wiki_API.page(key.clone(), function(page_data) {
							var content = wiki_API.content_of(page_data),
							// 測試檢查是否為重定向頁面。
							redirect = wiki_API.parse.redirect(content);
							if (redirect) {
								library_namespace.info(
								//
								'wikidata_entity: 處理重定向頁面: [[:' + key.join(':')
										+ ']] → [[:' + key[0] + ':' + redirect
										+ ']]。');
								wikidata_entity([ key[0],
								// wiki_API.normalize_title():
								// 此 API 無法自動轉換首字大小寫之類！因此需要自行正規化。
								wiki_API.normalize_title(redirect) ], property,
										callback, options);
								return;
							}

							library_namespace.error(
							//
							'wikidata_entity: Wikidata 不存在/已刪除 [[:'
									+ key.join(':') + ']] 之數據，'
									+ (content ? '但' : '且無法取得/不')
									+ '存在此 Wikipedia 頁面。無法處理此 Wikidata 數據要求。');
							callback(undefined, 'no_key');
						});

					}, {
						API_URL : API_URL,
						get_id : true,
						limit : 1
					});
					// Waiting for conversion.
					return;
				}

			} else {
				key = key.map(function(id) {
					if (/^[PQ]\d{1,10}$/.test(id))
						return id;
					if (library_namespace.is_digits(id))
						return 'Q' + id;
					library_namespace.warn(
					//
					'wikidata_entity: Invalid id: ' + id);
					return '';
				}).join('|');
			}
		}

		// ----------------------------

		if (!key || library_namespace.is_empty_object(key)) {
			library_namespace.error('wikidata_entity: 未設定欲取得之特定實體 id。');
			callback(undefined, 'no_key');
			return;
		}

		// 實體項目 entity
		// https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1&props=labels&utf8=1
		// TODO: claim/聲明/屬性/分類/陳述/statement
		// https://www.wikidata.org/w/api.php?action=wbgetclaims&ids=P1&props=claims&utf8=1
		// TODO: 維基百科 sitelinks
		// https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1&props=sitelinks&utf8=1
		var action;
		// 不採用 wiki_API.is_page_data(key)
		// 以允許自行設定 {title:title,language:language}。
		if (key.title) {
			action = 'sites='
					+ (key.site || key.language
							&& wiki_API.site_name(key.language) || wikidata_get_site(options))
					+ '&titles=' + encodeURIComponent(key.title);
		} else {
			action = 'ids=' + key;
		}
		library_namespace.debug('action: [' + action + ']', 2,
				'wikidata_entity');
		// https://www.wikidata.org/w/api.php?action=help&modules=wbgetentities
		action = [ API_URL, 'wbgetentities&' + action ];

		if (property && !('props' in options)) {
			options.props = 'claims';
		}
		var props = options.props;
		if (Array.isArray(props)) {
			props = props.join('|');
		}
		// 可接受 "props=" (空 props)。
		if (props || props === '') {
			// retrieve properties. 僅擷取這些屬性。
			action[1] += '&props=' + props;
			if (props.includes('|')) {
				// 對於多種屬性，不特別取之。
				props = null;
			}
		}
		if (options.languages) {
			// retrieve languages, language to callback. 僅擷取這些語言。
			action[1] += '&languages=' + options.languages;
		}
		// console.log(options);
		// console.log(action);

		// console.log('wikidata_entity: API_URL: ' + API_URL);
		// console.log('wikidata_entity: action: ' + action);
		// console.log(arguments);
		// TODO:
		wiki_API.query(action, function(data, error) {
			error = error || data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				if (error.code === 'param-missing') {
					library_namespace.error(
					/**
					 * 可能是錯把 "category" 之類當作 sites name??
					 * 
					 * wikidata_entity: [param-missing] A parameter that is
					 * required was missing. (Either provide the item "ids" or
					 * pairs of "sites" and "titles" for corresponding pages)
					 */
					'wikidata_entity: 未設定欲取得之特定實體 id。請確定您的要求，尤其是 sites 存在: '
							+ decodeURI(action[0]));
				} else {
					library_namespace.error('wikidata_entity: '
					//
					+ (error.code ? '[' + error.code + '] '
					//
					+ error.info : error));
				}
				callback(undefined, error);
				return;
			}

			// assert: library_namespace.is_Object(data):
			// {entities:{Q1:{pageid:129,lastrevid:0,id:'P1',labels:{},claims:{},...},P1:{id:'P1',missing:''}},success:1}
			// @see https://www.mediawiki.org/wiki/Wikibase/DataModel/JSON
			// @see https://www.wikidata.org/wiki/Special:ListDatatypes
			if (data && data.entities) {
				data = data.entities;
				var list = [];
				for ( var id in data) {
					list.push(data[id]);
				}
				data = list;
				if (data.length === 1) {
					data = data[0];
					if (props && (props in data)) {
						data = data[props];
					} else {
						if (wiki_API.is_page_data(key)) {
							library_namespace.debug(data.id + ' 對應頁面: '
									+ wiki_API.title_link_of(key), 1,
									'wikidata_entity');
							data[KEY_CORRESPOND_PAGE] = key;
						}
						// assert: KEY_get_entity_value, KEY_SESSION
						// is NOT in data
						Object.defineProperty(data, KEY_get_entity_value, {
							value : wikidata_entity_value
						});
						if (options && options[KEY_SESSION]) {
							// for .resolve_item
							data[KEY_SESSION] = options[KEY_SESSION];
						}
					}
				}
			}

			if (property && data) {
				property = data.claims
				//
				? data.claims[property] : data[property];
			}
			if (property) {
				wikidata_datavalue(property, callback, options);
			} else {
				callback(data);
			}
		}, null, options);
	}

	/**
	 * 取得特定屬性值。
	 * 
	 * @param {String}[property]
	 *            取得特定屬性值。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值)
	 * 
	 * @returns 屬性的值
	 * 
	 * @inner
	 */
	function wikidata_entity_value(property, options, callback) {
		if (Array.isArray(property)) {
			// e.g., entity.value(['property','property'])
			var property_list = property;
			property = Object.create(null);
			property_list.forEach(function(key) {
				property[key] = null;
			});
		}
		if (library_namespace.is_Object(property)) {
			// e.g., entity.value({'property':'language'})
			if (callback) {
				;
			}
			// TODO: for callback
			for ( var key in property) {
				var _options = property[key];
				if (typeof _options === 'string'
						&& PATTERN_PROJECT_CODE_i.test(_options)) {
					_options = Object.assign({
						language : _options.toLowerCase()
					}, options);
				} else {
					_options = options;
				}
				property[key] = wikidata_entity_value.call(this, key, _options);
			}
			return property;
		}

		var value, language = wikidata_get_site(options, true)
				|| wiki_API.language, matched = typeof property === 'string'
				&& property.match(/^P(\d+)$/i);

		if (matched) {
			property = +matched[1];
		}

		if (property === 'label') {
			value = this.labels && this.labels[language];
		} else if (property === 'alias') {
			value = this.aliases && this.aliases[language];
		} else if (property === 'sitelink') {
			value = this.sitelinks && this.sitelinks[language];
		} else if (typeof property === 'number') {
			value = this.claims && this.claims['P' + property];
		} else if (value = wikidata_search.use_cache(property, Object.assign({
			type : 'property'
		}, options))) {
			// 一般 property
			value = this.claims && this.claims[value];
		} else {
			library_namespace
					.error('wikidata_entity_value: Can not deal with property ['
							+ property + ']');
			return;
		}

		if (options && options.resolve_item) {
			value = wikidata_datavalue(value);
			if (Array.isArray(value)) {
				// 有的時候因為操作錯誤，所以會有相同的屬性值。但是這一種情況應該要更正原資料。
				// value = value.unique();
			}
			this[KEY_SESSION][KEY_HOST_SESSION].data(value, callback);
			return value;
		}

		return wikidata_datavalue(value, callback, options);
	}

	// ------------------------------------------------------------------------

	// test if is Q4167410: Wikimedia disambiguation page 維基媒體消歧義頁
	// [[Special:链接到消歧义页的页面]]: 頁面內容含有 __DISAMBIG__ (或別名) 標籤會被作為消歧義頁面。
	// CeL.wiki.data.is_DAB(entity)
	function is_DAB(entity, callback) {
		var property = entity && entity.claims && entity.claims.P31;
		if (property && wikidata_datavalue(property) === 'Q4167410') {
			if (callback) {
				callback(true, entity);
				return;
			}
			return true;
		}
		if (!callback) {
			return;
		}

		// wikidata 的 item 或 Q4167410 需要手動加入，非自動連結。
		// 因此不能光靠 Q4167410 準確判定是否為消歧義頁。其他屬性相同。
		// 準確判定得自行檢查原維基之資訊，例如檢查 action=query&prop=info。

		// 基本上只有 Q(entity, 可連結 wikipedia page) 與 P(entity 的屬性) 之分。
		// 再把各 wikipedia page 手動加入 entity 之 sitelink。

		// TODO: 檢查 __DISAMBIG__ page property

		// TODO: 檢查 [[Category:All disambiguation pages]]

		// TODO: 檢查標題是否有 "(消歧義)" 之類。

		// TODO: 檢查
		// https://en.wikipedia.org/w/api.php?action=query&titles=title&prop=pageprops
		// 看看是否 ('disambiguation' in page_data.pageprops)；
		// 這方法即使在 wikipedia 沒 entity 時依然有效。
		callback(null, entity);
	}

	// ------------------------------------------------------------------------

	// TODO: 自 root 開始尋找所有的 property
	function property_tree(root, property, callback, options) {
		if (typeof options === 'string') {
			options = {
				retrieve : options
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var entity_now = root,
		// 擷取具有代表性的特性。 label/sitelink/property/entity
		retrieve = options.retrieve || 'label',
		//
		tree = [];

		function next_entity() {
			wikidata_entity(entity_now, function(data, error) {
				;
			});
		}

		next_entity();
	}

	// ------------------------------------------------------------------------

	// export 導出.
	Object.assign(wikidata_entity, {
		search : wikidata_search,
		// 標籤
		label_of : get_entity_label,
		// 標題
		title_of : get_entity_link,
		value_of : wikidata_datavalue,
		is_DAB : is_DAB,

		// CeL.wiki.data.include_label()
		include_label : include_label
	});

	// ------------------------------------------------------------------------

	// P143 (導入自, 'imported from Wikimedia project') for bot, P248 (載於, stated
	// in) for humans
	// + 來源網址 (P854) reference URL
	// + 檢索日期 (P813) retrieved date

	// @see wikidata_search_cache
	// wikidata_datatype_cache.P31 = {String}datatype of P31;
	var wikidata_datatype_cache = Object.create(null);

	// callback(datatype of property, error)
	function wikidata_datatype(property, callback, options) {
		if (is_api_and_title(property, 'language')) {
			property = wikidata_search.use_cache(property, function(id, error) {
				wikidata_datatype(id, callback, options);
			}, Object.assign(Object.create(null),
					wikidata_search.use_cache.default_options, options));
			if (!property) {
				// assert: property === undefined
				// Waiting for conversion.
				return;
			}
		}

		if (property > 0) {
			property = 'P' + property;
		}
		if (!/^P\d{1,5}$/.test(property)) {
			callback(undefined, 'wikidata_datatype: Invalid property: ['
					+ property + ']');
			return;
		}

		var datatype = wikidata_datatype_cache[property];
		if (datatype) {
			callback(datatype);
			return;
		}

		var action = [ get_data_API_URL(options),
		// https://www.wikidata.org/w/api.php?action=wbgetentities&props=datatype&ids=P7
		'wbgetentities&props=datatype&ids=' + property ];
		wiki_API.query(action, function(data) {
			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wikidata_datatype: ['
				//
				+ error.code + '] ' + error.info);
				callback(undefined, error);
				return;
			}

			// data =
			// {"entities":{"P7":{"type":"property","datatype":"wikibase-item","id":"P7"}},"success":1}
			// data.entities[property].datatype
			if (!(data = data.entities) || !(data = data[property])) {
				callback(undefined, 'Invalid/Unknown return for [' + property
						+ ']');
				return;
			}

			library_namespace.debug('datatype of property [' + property
					+ ']: [' + data.datatype + ']', 1, 'wikidata_datatype');
			// cache
			wikidata_datatype_cache[property] = data.datatype;
			callback(data.datatype);
		}, null, options);
	}

	// ------------------------------------------------------------------------

	// auto-detect if are multiple values
	function is_multi_wikidata_value(value, options) {
		return value === wikidata_edit.remove_all ? false
		//
		: 'multi' in options ? options.multi
		// auto-detect: guess if is multi
		: Array.isArray(value)
		// 去除經緯度+高度的情形。
		&& (value.length !== 2 || value.length !== 3
		//
		|| typeof value[0] !== 'number' || typeof value[1] !== 'number');
	}

	// https://github.com/DataValues/Number/blob/master/src/DataValues/DecimalValue.php#L43
	// const QUANTITY_VALUE_PATTERN = '/^[-+]([1-9]\d*|\d)(\.\d+)?\z/';

	// return quantity acceptable by wikidata API ({String}with sign)
	// https://www.wikidata.org/wiki/Help:Statements#Quantitative_values
	// https://phabricator.wikimedia.org/T119226
	function wikidata_quantity(value, unit) {
		// assert: typeof value === 'number'
		value = +value;
		// TODO: 極大極小值。
		// 負數已經自動加上 "-"
		return value < 0 ? String(value)
		// `value || 0`: for NaN
		: '+' + (value || 0);
	}

	/**
	 * 盡可能模擬 wikidata (wikibase) 之 JSON 資料結構。
	 * 
	 * TODO: callback
	 * 
	 * @param value
	 *            要解析的值
	 * @param {String}[datatype]
	 *            資料型別
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @returns {Object}wikidata (wikibase) 之 JSON 資料結構。
	 * 
	 * @see https://www.wikidata.org/w/api.php?action=help&modules=wbparsevalue
	 *      https://www.mediawiki.org/wiki/Wikibase/API#wbparsevalue
	 *      https://phabricator.wikimedia.org/T112140
	 */
	function normalize_wikidata_value(value, datatype, options, to_pass) {
		if (library_namespace.is_Object(datatype) && options === undefined) {
			// 輸入省略了datatype。
			// input: normalize_wikidata_value(value, options)
			options = datatype;
			datatype = undefined;
		} else if (typeof options === 'string' && /^P\d{1,5}$/i.test(options)) {
			options = {
				property : options
			};
		} else if (typeof options === 'string'
				&& PATTERN_PROJECT_CODE_i.test(options)) {
			options = {
				language : options.toLowerCase()
			};
		} else {
			options = library_namespace.setup_options(options);
		}

		var is_multi = is_multi_wikidata_value(value, options);
		// console.trace('is_multi: ' + is_multi + ', value: ' + value);
		if (is_multi) {
			if (!Array.isArray(value)) {
				value = [ value ];
			}
			// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
			options = library_namespace.new_options(options);
			delete options.multi;
			var left = value.length, callback = options.callback;
			options.callback = function(normalized_data, index) {
				if (!(0 <= index && index < value.length)) {
					throw new Error('normalize_wikidata_value: Invalid index: '
							+ index);
				}
				library_namespace.debug('Set [' + index + ']: '
						+ JSON.stringify(normalized_data), 3,
						'normalize_wikidata_value');
				// console.log(normalized_data);
				value[index] = normalized_data;
				if (--left === 0 && typeof callback === 'function') {
					library_namespace.debug('is_multi: Run callback:', 3,
							'normalize_wikidata_value');
					// console.log(value);
					// console.log(callback + '');
					callback(value, to_pass);
				}
			};
			value = value.map(function(v, index) {
				return normalize_wikidata_value(v, datatype, options, index);
			});
			return value;
		}

		// --------------------------------------

		if (!datatype && options.property
				&& typeof options.callback === 'function'
				&& (!('get_type' in options) || options.get_type)) {
			// 先取得/確認指定 property 之 datatype。
			wikidata_datatype(options.property, function(datatype) {
				var matched = datatype
						&& datatype.match(/^wikibase-(item|property)$/);
				if (matched && !/^[PQ]\d{1,10}$/.test(value)) {
					library_namespace.debug('將屬性名稱轉換成 id。'
							+ JSON.stringify(value), 3,
							'normalize_wikidata_value');
					// console.log(options);
					wikidata_search.use_cache(value, function(id, error) {
						normalize_wikidata_value(
						//
						id || 'Nothing found: [' + value + ']', datatype,
								options, to_pass);
					}, Object.assign(Object.create(null),
					// 因wikidata_search.use_cache.default_options包含.type設定，必須將特殊type設定放在匯入default_options後!
					wikidata_search.use_cache.default_options, {
						type : matched[1],
						// 警告:若是設定must_callback=false，會造成程序不callback而中途跳出!
						must_callback : true
					}, options));
				} else {
					normalize_wikidata_value(value, datatype || NOT_FOUND,
							options, to_pass);
				}
			}, options);
			return;
		}

		// --------------------------------------
		// 處理單一項目。
		var snaktype, datavalue_type, error;

		function normalized() {
			var normalized_data = {
				snaktype : snaktype || 'value'
			};
			if (options.property) {
				normalized_data.property = options.property;
			}
			if (options.hash) {
				normalized_data.hash = options.hash;
			}
			if (datatype) {
				normalized_data.datavalue = {
					value : value,
					type : datavalue_type
				};
				normalized_data.datatype = datatype;
			}
			if (error) {
				library_namespace.error(error);
				normalized_data.error = error;
			}

			// console.log(JSON.stringify(normalized_data));
			// console.log(normalized_data);
			if (typeof options.callback === 'function') {
				options.callback(normalized_data, to_pass);
			}
			return normalized_data;
		}

		// delete: {P1:CeL.wiki.edit_data.remove_all}
		// delete: {P1:value,remove:true}
		// snaktype novalue 無數值: {P1:null}
		// snaktype somevalue 未知數值: {P1:CeL.wiki.edit_data.somevalue}
		// snaktype value: {P1:...}

		if (value === null) {
			snaktype = 'novalue';
			return normalized();
		}

		if (value === wikidata_edit.somevalue) {
			snaktype = 'somevalue';
			return normalized();
		}

		if (datatype === NOT_FOUND) {
			// 例如經過 options.get_type 卻沒找到。
			// 因為之前應該已經顯示過錯誤訊息，因此這邊直接放棄作業。
			return normalized();
		}

		// --------------------------------------
		// 處理一般賦值。

		if (!datatype) {
			// auto-detect: guess datatype

			// https://www.wikidata.org/w/api.php?action=help&modules=wbparsevalue
			// https://www.wikidata.org/w/api.php?action=wbgetentities&ids=P3088&props=datatype
			// +claims:P1793
			//
			// url: {P856:"https://url"}, {P1896:"https://url"}
			// monolingualtext: {P1448:"text"} ← 自動判別language,
			// monolingualtext: {P1448:"text",language:"zh-tw"}
			// string: {P1353:"text"}
			// external-id: {P212:'id'}
			// math: {P2534:'1+2'}
			// commonsMedia: {P18:'file.svg'}
			//
			// quantity: {P1114:0}
			// time: {P585:new Date} date.precision=1
			// wikibase-item: {P1629:Q1}
			// wikibase-property: {P1687:P1}
			// globe-coordinate 經緯度:
			// {P625: [ {Number}latitude 緯度, {Number}longitude 經度 ]}

			if (typeof value === 'number') {
				datatype = 'quantity';
			} else if (Array.isArray(value)
					&& (value.length === 2 || value.length === 3)) {
				datatype = 'globe-coordinate';
			} else if (library_namespace.is_Date(value)) {
				datatype = 'time';
			} else {
				value = String(value);
				var matched = value.match(/^([PQ])(\d{1,10})$/i);
				if (matched) {
					datatype = /^[Qq]$/.test(matched[1]) ? 'wikibase-item'
							: 'wikibase-property';
				} else if ('language' in options) {
					datatype = 'monolingualtext';
				} else if (/^(?:https?|ftp):\/\//i.test(value)) {
					datatype = 'url';
				} else if (/\.(?:jpg|png|svg)$/i.test(value)) {
					datatype = 'commonsMedia';
				} else {
					// TODO: other types: external-id, math
					datatype = 'string';
				}
			}
			// console.log('guess datatype: ' + datatype + ', value: ' + value);
		}

		// --------------------------------------

		if (typeof value === 'object' && value.snaktype && value.datatype) {
			// 若 value 已經是完整的 wikidata object，則直接回傳之。
			if (datatype !== value.datatype) {
				library_namespace.error(
				// 所指定的與 value 的不同。
				'normalize_wikidata_value: The datatype of the value ['
						+ value.datatype + '] is different from specified: ['
						+ datatype + ']');
			}

			if (typeof options.callback === 'function') {
				options.callback(value, to_pass);
			}
			return value;
		}

		// --------------------------------------
		// 依據各種不同的 datatype 生成結構化資料。

		switch (datatype) {
		case 'globe-coordinate':
			datavalue_type = 'globecoordinate';
			value = {
				latitude : +value[0],
				longitude : +value[1],
				altitude : typeof value[2] === 'number' ? value[2] : null,
				precision : options.precision || 0.000001,
				globe : options.globe || 'https://www.wikidata.org/entity/Q2'
			};
			break;

		case 'monolingualtext':
			datavalue_type = datatype;
			value = {
				text : value,
				language : wikidata_get_site(options, true)
						|| guess_language(value)
			};
			// console.log('use language: ' + value.language);
			break;

		case 'quantity':
			datavalue_type = datatype;
			var unit = options.unit || 1;
			value = wikidata_quantity(value);
			value = {
				amount : value,
				// unit of measure item (empty for dimensionless values)
				// e.g., 'https://www.wikidata.org/entity/Q857027'
				unit : String(unit),
				// optional https://www.wikidata.org/wiki/Help:Data_type
				upperBound : typeof options.upperBound === 'number' ? wikidata_quantity(options.upperBound)
						: value,
				// optional https://www.wikidata.org/wiki/Help:Data_type
				lowerBound : typeof options.lowerBound === 'number' ? wikidata_quantity(options.lowerBound)
						: value
			};
			break;

		case 'time':
			datavalue_type = datatype;
			var precision = options.precision;
			// 規範日期。
			if (!library_namespace.is_Date(value)) {
				var date_value;
				// TODO: 解析各種日期格式。
				if (value && isNaN(date_value = Date.parse(value))) {
					// Warning:
					// String_to_Date()只在有載入CeL.data.date時才能用。但String_to_Date()比parse_date()功能大多了。
					date_value = library_namespace.String_to_Date(value, {
						// 都必須當作UTC+0，否則被轉換成UTC+0時會出現偏差。
						zone : 0
					});
					if (date_value) {
						if (('precision' in date_value)
						//
						&& (date_value.precision in INDEX_OF_PRECISION)) {
							precision = INDEX_OF_PRECISION[date_value.precision];
						}
						date_value = date_value.getTime();
					} else {
						date_value = parse_date(value, true) || NaN;
					}
				}
				if (isNaN(date_value)) {
					error = 'Invalid Date: [' + value + ']';
				} else {
					// TODO: 按照date_value設定.precision。
					value = new Date(date_value);
				}
			} else if (isNaN(value.getTime())) {
				error = 'Invalid Date';
			}

			if (isNaN(precision)) {
				precision = INDEX_OF_PRECISION.day;
			}
			if (error) {
				value = String(value);
			} else {
				if (precision === INDEX_OF_PRECISION.day) {
					// 當 precision=INDEX_OF_PRECISION.day 時，時分秒*必須*設置為 0!
					value.setUTCHours(0, 0, 0, 0);
				}
				value = value.toISOString();
			}
			value = {
				// Data value corrupt: $timestamp must resemble ISO 8601, given
				time : value
				// '2000-01-01T00:00:00.000Z' → '2000-01-01T00:00:00Z'
				.replace(/\.\d{3}Z$/, 'Z')
				// '2000-01-01T00:00:00Z' → '+2000-01-01T00:00:00Z'
				.replace(/^(\d{4}-)/, '+$1'),
				timezone : options.timezone || 0,
				before : options.before || 0,
				after : options.after || 0,
				precision : precision,
				calendarmodel : options.calendarmodel
				// proleptic Gregorian calendar:
				|| 'https://www.wikidata.org/entity/Q1985727'
			};
			break;

		case 'wikibase-item':
		case 'wikibase-property':
			datavalue_type = 'wikibase-entityid';
			// console.log(value);
			var matched = typeof value === 'string'
					&& value.match(/^([PQ])(\d{1,10})$/i);
			if (matched) {
				value = {
					'entity-type' : datatype === 'wikibase-item' ? 'item'
							: 'property',
					'numeric-id' : +matched[2],
					// 在設定時，id 這項可省略。
					id : value
				};
			} else {
				error = 'normalize_wikidata_value: Illegal ' + datatype + ': '
						+ JSON.stringify(value);
			}
			break;

		case 'commonsMedia':
		case 'url':
		case 'external-id':
		case 'math':
		case 'string':
			datavalue_type = 'string';
			// Data value corrupt: Can only construct StringValue from strings
			value = String(value);
			break;

		default:
			error = 'normalize_wikidata_value: Unknown datatype [' + datatype
					+ '] and value [' + JSON.stringify(value) + ']';
			return;
		}

		return normalized();
	}

	/**
	 * @inner only for set_claims()
	 */
	var entity_properties = {
		// 值的部分為單純表達意思用的內容結構，可以其他的值代替。
		pageid : 1,
		ns : 0,
		title : 'Q1',
		lastrevid : 1,
		modified : '2000-01-01T00:00:00Z',
		type : 'item',
		id : 'Q1',
		labels : [],
		descriptions : [],
		aliases : [],
		claims : [],
		sitelinks : []
	},
	//
	KEY_property_options = 'options',
	/**
	 * 放置不應該成為 key 的一些屬性名稱
	 * 
	 * @inner only for set_claims()
	 */
	claim_properties = {
		// 值的部分為單純表達意思用的內容結構，可以其他的值代替。
		// mainsnak : {},
		// snaktype : '',
		// datavalue : {},
		// id : '',
		type : '',
		rank : '',
		language : '',
		// 警告: 此屬性應置於個別 claim 中。
		remove : true,
		// additional_properties, KEY_property_options
		// options : {},
		multi : true,
		references : []
	};

	// example 1:
	//
	// {Object}可接受的原始輸入形式之一
	// {載於:'宇宙',導入自:'zhwiki',來源網址:undefined,臺灣物種名錄物種編號:{value:123,remove:true},language:'zh',references:{...}}+exists_property_hash
	//
	// {Array}可接受的原始輸入形式之2: 直接轉換為{Array}陣列
	// [{載於:'宇宙',導入自:'zhwiki',來源網址:undefined,臺灣物種名錄物種編號:{value:123,remove:true},language:'zh',references:{...}}]
	// +exists_property_hash
	//
	// {Array}可接受的原始輸入形式之2'
	// 分析每一個個別的{Object}項目，將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表。這期間可能會改變要求項目的項目數 →
	// [{載於:'宇宙',options:AP},{導入自:'zhwiki',options:AP},{來源網址:undefined,options:AP},{臺灣物種名錄物種編號:123,remove:true,options:AP}]
	// + additional_properties: AP={language:'zh',references:{...}}
	// + exists_property_hash
	// * {Object|Array}AP.references 當作個別{Object} properties 項目的參照。
	// * 若某項有 .mainsnak 或 .snaktype 則當作輸入了全套完整的資料，不處理此項。
	//
	// {Array}可接受的原始輸入形式之3
	// 將{Array}屬性名稱列表轉換成{Array}屬性 id 列表 →
	// [{P248:'宇宙',property:'P248'},{P143:'zhwiki',property:'P143'},{P854:undefined,property:'P854'},{P3088:123,remove:true,property:'P3088'}]
	// + additional_properties + exists_property_hash
	//
	// 去掉 exists_property_hash 已有、重複者。
	// 處理 remove:true & remove all。
	//
	// get datatype of each property →
	// [{P248:'Q1'},{P143:'Q30239'},{P854:undefined},{P3088:123,remove:true}]
	// + additional_properties + exists_property_hash
	//
	// normalize property data value →
	// [{P248:{normalized value of P248}},{P143:{normalized value of P143}}
	// ,{property:P854,remove:true,value:undefined},{property:P3088,remove:true,value:123}]
	// + additional_properties
	//
	// 去掉殼 → data = [{normalized value of P248},{normalized value of P143}
	// ,{property:P854,remove:true,value:undefined},{property:P3088,remove:true,value:123}]
	// .additional=additional_properties
	//
	// callback(data)

	// example 2:
	//
	// [{生物俗名:['SB2#1','SB2#2','SB2#3'],multi:true,language:'zh-tw',references:{臺灣物種名錄物種編號:123456}},
	// {読み仮名 : 'かな',language : 'ja',references : {'imported from Wikimedia
	// project' : 'jawiki'}}]
	// +exists_property_hash
	//
	// {Array}可接受的原始輸入形式之2'
	// 分析每一個個別的{Object}項目，將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表。這期間可能會改變要求項目的項目數 →
	// [{生物俗名:'SB2#1',options:AP1},{生物俗名:'SB2#2',options:AP1},{生物俗名:'SB2#3',options:AP1},
	// {読み仮名 : 'かな',options(KEY_property_options):AP2}]
	// +additional_properties:AP1={language:'zh-tw',references:{臺灣物種名錄物種編號:123456}}
	// +additional_properties:AP2={language:'ja',references:{'imported from
	// Wikimedia project':'jawiki'}}

	/**
	 * 規範化屬性列表。
	 * 
	 * @param {Object|Array}properties
	 *            要轉換的屬性。
	 * @param {Function}callback
	 *            回調函數。 callback({Array}property list, error)
	 * @param {Object}[exists_property_hash]
	 *            已經存在的屬性雜湊。可以由 wikidata API 取得。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function normalize_wikidata_properties(properties, callback,
			exists_property_hash, options) {
		// console.log(properties);
		// console.log(options);
		// console.trace('normalize_wikidata_properties');

		library_namespace.debug('normalize properties: '
				+ JSON.stringify(properties), 3,
				'normalize_wikidata_properties');

		// console.log('-'.repeat(40));
		// console.log(properties);

		if (library_namespace.is_Object(properties)) {
			// {Array}可接受的原始輸入形式之2: 直接轉換為{Array}陣列
			properties = [ properties ];

		} else if (!Array.isArray(properties)) {
			if (properties) {
				library_namespace
						.error('normalize_wikidata_properties: Invalid properties: '
								+ JSON.stringify(properties));
			}

			callback(properties);
			return;
		}

		// 分析每一個個別的{Object}項目，將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表。這期間可能會改變要求項目的項目數

		// 索求、需要轉換的屬性名稱 property key
		var demands = [],
		// demands 對應的 property
		property_corresponding = [],
		//
		options_language = wikidata_get_site(options, true);

		// console.log(options_language);
		// console.log('-'.repeat(20));
		// console.log(properties);

		var old_properties = properties;
		properties = [];
		old_properties.forEach(function(property) {
			if (!property) {
				// Skip null property.
				return;
			}

			// e.g., property:{P1:'',P2:'',language:'zh',references:{}}
			// assert: library_namespace.is_Object(property)

			// * 若某項有 .mainsnak 或 .snaktype 則當作輸入了全套完整的資料，不處理此項。
			if (property.mainsnak || property.snaktype) {
				properties.push(property);
				// Skip it.
				return;
			}

			// [KEY_property_options]: additional properties
			// 參照用設定: 設定每個屬性的時候將參照的設定，包含如 .language 等。
			var additional_properties = property[KEY_property_options],
			//
			check = function(property_data) {
				var property_key = property_data.property;
				if (!/^[PQ]\d{1,10}$/.test(property_key)) {
					// 有些設定在建構property_data時尚存留於((property))，這時得要自其中取出。
					var language = property.language || additional_properties
							&& additional_properties.language
							|| options_language;
					// console.log(language);
					// throw language;
					demands.push(language ? [ language, property_key ]
							: property_key);
					property_corresponding.push(property_data);
				}
				properties.push(property_data);
			};

			// .property: property key
			if (property.property) {
				check(property);
				return;
			}

			// e.g.,
			// properties:{P1:'',P2:'',language:'zh',references:{}}
			// assert: library_namespace.is_Object(properties)

			// 將{Object}簡易的屬性雜湊轉換成{Array}屬性名稱列表 →
			// 因為需要動到不可回復的操作，因此不更動到原先的屬性。
			// 初始化
			additional_properties = Object.assign(Object.create(null),
					additional_properties);

			// console.log(property);

			// properties應該為{Array}屬性名稱/id列表陣列。
			// 將 參照用設定 設為空，以便之後使用。
			// 把應該用做參照用設定的移到 property[KEY_property_options]，
			// 其他的屬性值搬到新的 properties。
			for ( var key in property) {
				var value = property[key], language;
				if (key in claim_properties) {
					additional_properties[key] = value;

				} else if (key !== KEY_property_options) {
					if (library_namespace.is_Object(value)) {
						// convert language+value object
						if (value.language && ('value' in value)) {
							// e.g., {language:'ja',value:'日本'}
							value = [ value.language, value.value ];
						} else if ((language = Object.keys(value)).length === 1
						// e.g., {ja:'日本'}
						&& (language = language[0])) {
							value = [ language, value[language] ];
						}
					}

					// console.log(value);

					var is_multi = value !== wikidata_edit.remove_all
					//
					&& ('multi' in additional_properties
					//
					? additional_properties.multi
					//
					: is_multi_wikidata_value(value, property));
					if (is_multi) {
						// e.g., [ 'jawiki', ['日本', '米国'] ]
						if (is_api_and_title(value, 'language')
						// [ 'jawiki', '日本' ] 可能會混淆。
						&& Array.isArray(value[1])) {
							value = value[1].map(function(v) {
								// return [ value[0], v ];
								return {
									language : value[0],
									value : v
								};
							});
						}
						// console.log(value);

						// set multiple values
						(Array.isArray(value) ? value : [ value ])
						//
						.forEach(function(v) {
							var property_data = {
								// 將屬性名稱 property key 儲存在 .property
								property : key,
								value : v
							};
							property_data[KEY_property_options]
							//
							= additional_properties;
							check(property_data);
						});
					} else {
						var property_data = {
							// 將屬性名稱 property key 儲存在 .property
							property : key,
							value : value
						};
						property_data[KEY_property_options]
						//
						= additional_properties;
						check(property_data);
					}
				}
			}
			// 這應該僅用於指示本 property，因此處理過後已經無用。
			delete additional_properties.multi;
		});

		// console.log('-'.repeat(60));
		// console.log(properties);

		// Release memory. 釋放被占用的記憶體。
		old_properties = null;

		// --------------------------------------

		// 將{Array}屬性名稱列表轉換成{Array}屬性 id 列表 →

		// console.log(demands);
		wikidata_search.use_cache(demands, function(property_id_list) {
			// console.log(property_id_list);

			// 將{Array}屬性名稱列表轉換成{Array}屬性 id 列表 →
			if (property_id_list.length !== property_corresponding.length) {
				throw new Error(
				//
				'normalize_wikidata_properties: property_id_list.length '
						+ property_id_list.length
						+ ' !== property_corresponding.length '
						+ property_corresponding.length);
			}
			property_id_list.forEach(function(id, index) {
				var property_data = property_corresponding[index];
				// id 可能為 undefined/null
				if (/^[PQ]\d{1,10}$/.test(id)) {
					if (!('value' in property_data)) {
						property_data.value
						//
						= property_data[property_data.property];
					}
					property_data.property = id;
				} else {
					library_namespace.error(
					//
					'normalize_wikidata_properties: Invalid property key: '
							+ JSON.stringify(property_data));
				}
			});

			function property_value(property_data) {
				return 'value' in property_data ? property_data.value
						: property_data[property_data.property];
			}

			// 跳過要刪除的。
			function property_to_remove(property_data) {
				if (!('remove' in property_data)
						&& property_data[KEY_property_options]
						&& ('remove' in property_data[KEY_property_options])) {
					if (typeof property_data[KEY_property_options].remove
					//
					=== 'function') {
						console.log(property_data[KEY_property_options]);
						throw new Error(
						//		
						'wikidata_search.use_cache: .remove is function');
					}
					property_data.remove
					// copy configuration.
					// 警告: 此屬性應置於個別 claim 中，而非放在參照用設定。
					// 注意: 這操作會更改 property_data!
					= property_data[KEY_property_options].remove;
				}

				if (property_data.remove
				// 為欲刪除之index。
				|| property_data.remove === 0) {
					return true;
				}
				var value = property_value(property_data);
				if (value === wikidata_edit.remove_all
				// 若遇刪除此屬性下所有值，必須明確指定 wikidata_edit.remove_all，避免錯誤操作。
				// && value === undefined
				) {
					// 正規化 property_data.remove: 若有刪除操作，必定會設定 .remove。
					// 注意: 這操作會更改 property_data!
					property_data.remove = wikidata_edit.remove_all;
					return true;
				}
			}

			// 去掉 exists_property_hash 已有、重複者。
			if (exists_property_hash) {
				// console.log(exists_property_hash);
				properties = properties.filter(function(property_data) {
					// 當有輸入 exists_property_hash 時，所有的相關作業都會在這段處理。
					// 之後 normalize_next_value()不會再動到 exists_property_hash 相關作業。
					var property_id = property_data.property;
					if (!property_id) {
						// 在此無法處理。例如未能轉換 key 成 id。
						return true;
					}
					var value = property_value(property_data),
					//
					exists_property_list = exists_property_hash[property_id];
					// console.log(property_data);

					if (!(property_id in wikidata_datatype_cache)
							&& exists_property_list) {
						var datatype = exists_property_list[0]
								&& exists_property_list[0].mainsnak
								&& exists_property_list[0].mainsnak.datatype;
						if (datatype) {
							// 利用原有 datatype 加快速度。
							wikidata_datatype_cache[property_id] = datatype;
						}
					}

					if (property_to_remove(property_data)) {
						// 刪除時，需要存在此 property 才有必要處置。
						if (!exists_property_list) {
							library_namespace.debug('Skip ' + property_id
							//
							+ (value ? '=' + JSON.stringify(value) : '')
									+ ': 無此屬性id，無法刪除。', 1,
									'normalize_wikidata_properties');
							return false;
						}

						// ((true >= 0))
						if (typeof property_data.remove === 'number'
								&& property_data.remove >= 0) {
							if (property_data.remove in exists_property_list) {
								return true;
							}
							// 要刪除的值不存在。
							library_namespace.warn(
							//
							'normalize_wikidata_properties: Skip '
							//
							+ property_id
							//
							+ (value ? '=' + JSON.stringify(value) : '')
							//
							+ ': 不存在指定要刪除的 index ' + property_data.remove + '/'
									+ exists_property_list.length + '，無法刪除。');
							return false;
						}

						if (!property_data.remove || property_data.remove
						//
						=== wikidata_edit.remove_all) {
							return true;
						}

						if (property_data.remove !== true) {
							library_namespace.warn(
							//
							'normalize_wikidata_properties: Invalid .remove ['
							//
							+ property_data.remove + ']: ' + property_id
							//
							+ (value ? '=' + JSON.stringify(value) : '')
							//
							+ ', will still try to remove the property.');
							// property_data.remove = true;
						}

						// 直接檢測已有的 index，設定於 property_data.remove。
						// 若有必要刪除，從最後一個相符的刪除起。
						var duplicate_index = wikidata_datavalue.get_index(
								exists_property_list, value, -1);
						// console.log(exists_property_list);
						// console.log(duplicate_index);

						if (duplicate_index !== NOT_FOUND) {
							// delete property_data.value;
							property_data.remove = duplicate_index;
							return true;
						}
						// 要刪除的值不存在。
						library_namespace.debug(
						//
						'Skip ' + property_id
						//
						+ (value ? '=' + JSON.stringify(value)
						//
						+ ': 此屬性無此值，無法刪除。' : ': 無此屬性id，無法刪除。')
						//
						, 1, 'normalize_wikidata_properties');
						return false;
					}

					if (!exists_property_list) {
						// 設定值時，不存在此 property 即有必要處置。
						return true;
					}

					// 檢測是否已有此值。
					if (false) {
						console.log(wikidata_datavalue.get_index(
								exists_property_list, value, 0));
					}
					// 若有必要設定 references，從首個相符的設定起。
					var duplicate_index = wikidata_datavalue.get_index(
							exists_property_list, value);
					if (duplicate_index === NOT_FOUND) {
						return true;
					}

					// console.log(property_data);

					// {Object|Array}property_data[KEY_property_options].references
					// 當作每個 properties 的參照。
					var references = 'references' in property_data
					//
					? property_data.references
							: property_data[KEY_property_options]
							//
							&& property_data[KEY_property_options].references;
					library_namespace.debug('Skip ' + property_id + '['
							+ duplicate_index + ']: 此屬性已存在相同值 [' + value + ']。'
							+ (references ? '但依舊處理其 references 設定。' : ''), 1,
							'normalize_wikidata_properties');
					if (typeof references === 'object') {
						// delete property_data.value;
						property_data.exists_index = duplicate_index;
						return true;
					}
					return false;
				});
			}

			var index = 0,
			//
			normalize_next_value = function() {
				library_namespace.debug(index + '/' + properties.length, 3,
						'normalize_next_value');
				if (index === properties.length) {
					library_namespace.debug(
							'done: 已經將可查到的屬性名稱轉換成屬性 id。 callback(properties);',
							2, 'normalize_next_value');
					callback(properties);
					return;
				}

				var property_data = properties[index++];
				if (property_to_remove(property_data)) {
					// 跳過要刪除的。
					normalize_next_value();
					return;
				}

				// get datatype of each property →
				var language = property_data.language
						|| property_data[KEY_property_options]
						&& property_data[KEY_property_options].language
						|| options_language,
				//
				_options = Object.assign({
					// multi : false,
					callback : function(normalized_value) {
						// console.trace(options);
						if (typeof options.value_filter === 'function') {
							normalized_value = options
									.value_filter(normalized_value);
						}

						if (Array.isArray(normalized_value)
								&& options.aoto_select) {
							// 採用首個可用的，最有可能是目標的。
							normalized_value.some(function(value) {
								if (value && !value.error
										&& value.datatype !== NOT_FOUND) {
									normalized_value = value;
									return true;
								}
							});
						}

						if (Array.isArray(normalized_value)
								|| normalized_value.error
								|| normalized_value.datatype === NOT_FOUND) {
							// 將無法轉換的放在 .error。
							if (properties.error) {
								properties.error.push(property_data);
							} else {
								properties.error = [ property_data ];
							}

							if (Array.isArray(normalized_value)) {
								library_namespace.error(
								// 得到多個值而非單一值。
								'normalize_next_value: get multiple values instead of just one value: ['
										+ value + '] → '
										+ JSON.stringify(normalized_value));

							} else if (false && normalized_value.error) {
								// 之前應該已經在 normalize_wikidata_value() 顯示過錯誤訊息。
								library_namespace
										.error('normalize_next_value: '
												+ normalized_value.error);
							}
							// 因為之前應該已經顯示過錯誤訊息，因此這邊直接放棄作業，排除此 property。

							properties.splice(--index, 1);
							normalize_next_value();
							return;
						}

						if (false) {
							console.log('-'.repeat(60));
							console.log(normalized_value);
							console.log(property_data.property + ': '
							//
							+ JSON.stringify(exists_property_hash
							//
							[property_data.property]));
						}
						if (exists_property_hash[property_data.property]
						// 二次篩選:因為已經轉換/取得了 entity id，可以再次做確認。
						&& (normalized_value.datatype === 'wikibase-item'
						// and 已經轉換了 date time
						|| normalized_value.datatype === 'time')
						//
						&& wikidata_datavalue.get_index(
						//
						exists_property_hash[property_data.property],
						//
						normalized_value, 1)) {
							library_namespace.debug('Skip exists value: '
									+ value + ' ('
									+ wikidata_datavalue(normalized_value)
									+ ')', 1, 'normalize_next_value');
							// TODO: 依舊增添 references。
							properties.splice(--index, 1);
							normalize_next_value();
							return;
						}

						if (false) {
							// normalize property data value →
							property_data[property_data.property]
							//
							= normalized_value;
						}

						// console.log('-'.repeat(60));
						// console.log(normalized_value);
						// 去掉殼 →
						properties[index - 1] = normalized_value;
						// 複製/搬移需要用到的屬性。
						if (property_data.exists_index >= 0) {
							normalized_value.exists_index
							//
							= property_data.exists_index;
						}

						// *
						// {Object|Array}property_data[KEY_property_options].references
						// 當作每個 properties 的參照。
						var references = 'references' in property_data
						//
						? property_data.references
						//
						: property_data[KEY_property_options]
						//
						&& property_data[KEY_property_options].references;
						if (typeof references === 'object') {
							normalized_value.references = references;
						}

						normalize_next_value();
					},
					property : property_data.property
				}, options, property_data[KEY_property_options]);
				if (language) {
					_options.language = language;
				}

				// console.log('-'.repeat(60));
				// console.log(property_data);
				var value = property_value(property_data);
				// console.log('-'.repeat(60));
				// console.log(value);
				// console.log(_options);
				normalize_wikidata_value(value, property_data.datatype,
						_options);
			};

			normalize_next_value();

		}, Object.assign(Object.create(null),
				wikidata_search.use_cache.default_options, options));

	}

	// ----------------------------------------------------

	/**
	 * references: {Pid:value}
	 * 
	 * @inner only for set_claims()
	 */
	function set_references(GUID, property_data, callback, options, API_URL,
			session, exists_references) {

		normalize_wikidata_properties(property_data.references, function(
				references) {
			if (!Array.isArray(references)) {
				if (references) {
					library_namespace
							.error('set_references: Invalid references: '
									+ JSON.stringify(references));
				} else {
					// assert: 本次沒有要設定 claim 的資料。
				}
				callback();
				return;
			}

			// e.g., references:[{P1:'',language:'zh'},{P2:'',references:{}}]
			property_data.references = references;

			// console.log(references);

			// console.log(JSON.stringify(property_data.references));
			// console.log(property_data.references);

			var references = Object.create(null);
			property_data.references.forEach(function(reference_data) {
				references[reference_data.property] = [ reference_data ];
			});

			// console.log(JSON.stringify(references));
			// console.log(references);
			var POST_data = {
				statement : GUID,
				snaks : JSON.stringify(references)
			};

			if (options.reference_index >= 0) {
				POST_data.index = options.reference_index;
			}

			if (options.bot) {
				POST_data.bot = 1;
			}
			if (options.summary) {
				POST_data.summary = options.summary;
			}
			// TODO: baserevid, 但這需要每次重新取得 revid。

			// the token should be sent as the last parameter.
			POST_data.token = options.token;

			wiki_API.query([ API_URL, 'wbsetreference' ],
			// https://www.wikidata.org/w/api.php?action=help&modules=wbsetreference
			function(data) {
				// console.log(data);
				// console.log(JSON.stringify(data));
				var error = data && data.error;
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					// e.g., set_references: [failed-save] Edit conflict.
					library_namespace.error('set_references: [' + error.code
							+ '] ' + error.info);
				}
				// data =
				// {"pageinfo":{"lastrevid":1},"success":1,"reference":{"hash":"123abc..","snaks":{...},"snaks-order":[]}}
				callback(data, error);
			}, POST_data, session);

		}, exists_references
		// 確保會設定 .remove / .exists_index = duplicate_index。
		|| Object.create(null),
		//
		Object.assign({
			// [KEY_SESSION]
			session : session
		}));
	}

	/**
	 * remove/delete/刪除 property/claims
	 * 
	 * @inner only for set_claims()
	 */
	function remove_claims(exists_property_list, callback, options, API_URL,
			session, index) {
		if (index === wikidata_edit.remove_all) {
			// delete one by one
			index = exists_property_list.length;
			var remove_next_claim = function() {
				if (index-- > 0) {
					remove_claims(exists_property_list, remove_next_claim,
							options, API_URL, session, index);
				} else {
					callback();
				}
			};
			remove_next_claim();
			return;
		}

		library_namespace.debug('delete exists_property_list[' + index + ']: '
				+ JSON.stringify(exists_property_list[index]), 1,
				'remove_claims');
		var POST_data = {
			claim : exists_property_list[index].id
		};

		if (options.bot) {
			POST_data.bot = 1;
		}
		if (options.summary) {
			POST_data.summary = options.summary;
		}
		// TODO: baserevid, 但這需要每次重新取得 revid。

		// the token should be sent as the last parameter.
		POST_data.token = options.token;

		wiki_API.query([ API_URL, 'wbremoveclaims' ], function(data) {
			// console.log(data);
			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('remove_claims: [' + error.code + '] '
						+ error.info);
			}
			// data =
			// {pageinfo:{lastrevid:1},success:1,claims:['Q1$123-ABC']}
			callback(data);
		}, POST_data, session);
	}

	/**
	 * edit property/claims
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_claims(data, token, callback, options, session, entity) {
		library_namespace.debug('normalize data: ' + JSON.stringify(data), 3,
				'set_claims');

		if (!data.claims) {
			library_namespace.debug(
					'把所有不是正規屬性的當作是 claims property key，搬到 data.claims。'
							+ '正規屬性留在原處。', 5, 'set_claims');
			data.claims = Object.create(null);
			for ( var key in data) {
				if (!(key in entity_properties)) {
					data.claims[key] = data[key];
					delete data[key];
				}
			}
		}
		if (library_namespace.is_empty_object(data.claims)) {
			delete data.claims;
		}

		var POST_data = {
			entity : options.id || entity && entity.id,
			// placeholder 佔位符
			property : null,
			snaktype : null,
			value : null
		},
		// action to set properties. 創建Wikibase陳述。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbcreateclaim
		claim_action = [ get_data_API_URL(options), 'wbcreateclaim' ],
		// process to what index of {Array}claims
		claim_index = 0;

		if (!POST_data.entity) {
			// console.log(options);
			if (!options.title) {
				throw new Error('set_claims: No entity id specified!');
			}

			// 取得 id
			wikidata_entity({
				site : options.site,
				title : decodeURIComponent(options.title)
			}, function(_entity, error) {
				if (error) {
					callback(undefined, error);
					return;
				}
				// console.log(_entity);
				options = Object.assign({
					id : _entity.id
				}, options);
				delete options.site;
				delete options.title;
				set_claims(data, token, callback,
				//
				options, session, entity && entity.claims ? entity : _entity);
			},
			// 若是未輸入 entity，那就取得 entity 內容以幫助檢查是否已存在相同屬性值。
			entity && entity.claims ? {
				props : ''
			} : null);
			return;
		}

		if (!entity || !entity.claims) {
			library_namespace.debug('未輸入 entity 以供檢查是否已存在相同屬性值。', 1,
					'set_claims');
		}

		// TODO: 可拆解成 wbsetclaim

		if (options.bot) {
			POST_data.bot = 1;
		}
		if (options.summary) {
			POST_data.summary = options.summary;
		}
		// TODO: baserevid, 但這需要每次重新取得 revid。

		// the token should be sent as the last parameter.
		POST_data.token = token;

		// 即使已存在相同屬性值，依然添增/處理其 references 設定。
		var force_add_references = options.force_add_references,
		//
		set_next_claim = function() {
			var claims = data.claims;
			library_namespace.debug('claims: ' + JSON.stringify(claims), 3,
					'set_next_claim');
			// console.log(claim_index + '-'.repeat(60));
			// console.log(claims);
			if (claim_index === claims.length) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_claim');
				// 去除空的設定。
				if (library_namespace.is_empty_object(data.claims)) {
					delete data.claims;
				}

				// console.log('' + callback);
				callback();
				return;
			}

			var property_data = claims[claim_index], property_id = property_data.property, exists_property_list = entity
					&& entity.claims && entity.claims[property_id];

			if (property_data.remove === wikidata_edit.remove_all) {
				// assert: 有此屬性id
				// delete: {P1:CeL.wiki.edit_data.remove_all}
				library_namespace.debug(
						'delete ' + property_id + ' one by one', 1,
						'set_next_claim');
				remove_claims(exists_property_list, shift_to_next, POST_data,
						claim_action[0], session, property_data.remove);
				return;
			}

			// ((true >= 0))
			if (typeof property_data.remove === 'number'
					&& property_data.remove >= 0) {
				// delete: {P1:value,remove:true}
				library_namespace.debug('delete ' + property_id + '['
						+ property_data.remove + ']', 1, 'set_next_claim');
				remove_claims(exists_property_list, shift_to_next, POST_data,
						claim_action[0], session, property_data.remove);
				return;
			}

			if (property_data.remove) {
				library_namespace.error('set_next_claim: Invalid .remove ['
						+ property_data.remove + '].');
				shift_to_next();
				return;
			}

			if (property_data.exists_index >= 0) {
				library_namespace.debug('Skip ' + property_id + '['
						+ property_data.exists_index + '] 此屬性已存在相同值 ['
						+ wikidata_datavalue(property_data) + ']'
						+ (force_add_references ? '，但依舊處理其 references 設定' : '')
						+ '。', 1, 'set_next_claim');
				if (force_add_references) {
					if (!property_data.references) {
						throw 'set_next_claim: No references found!';
					}
					var exists_references = entity.claims[property_id][property_data.exists_index].references;
					set_references(
							exists_property_list[property_data.exists_index].id,
							property_data, shift_to_next, POST_data,
							claim_action[0], session,
							// should use .references[*].snaks
							exists_references && exists_references[0].snaks);

				} else {
					// default: 跳過已存在相同屬性值之 references 設定。
					// 因為此時 references 可能為好幾組設定，不容易分割排除重複 references，結果將會造成重複輸入。
					shift_to_next();
				}

				return;
			}

			POST_data.property = property_id;
			// 照 datavalue 修改 POST_data。
			POST_data.snaktype = property_data.snaktype;
			if (POST_data.snaktype === 'value') {
				POST_data.value = JSON.stringify(property_data.datavalue.value);
			} else {
				// 不直接刪掉 POST_data.value，因為此值為 placeholder 佔位符。
				POST_data.value = '';
			}

			// console.log(JSON.stringify(POST_data));
			// console.log(POST_data);

			wiki_API.query(claim_action, function(data) {
				var error = data && data.error;
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>
					 * set_next_claim: [invalid-entity-id] Invalid entity ID. (The serialization "読み仮名" is not recognized by the configured id builders)
					 * </code>
					 */
					library_namespace.error('set_next_claim: [' + error.code
							+ '] ' + error.info);
					library_namespace.warn('data to write: '
							+ JSON.stringify(POST_data));
					// console.log(claim_index);
					// console.log(claims);
					claim_index++;
					set_next_claim();

				} else if (property_data.references) {
					// data =
					// {"pageinfo":{"lastrevid":00},"success":1,"claim":{"mainsnak":{"snaktype":"value","property":"P1","datavalue":{"value":{"text":"name","language":"zh"},"type":"monolingualtext"},"datatype":"monolingualtext"},"type":"statement","id":"Q1$1-2-3","rank":"normal"}}

					library_namespace.debug('設定完主要數值，接著設定 references。', 1,
							'set_next_claim');
					set_references(data.claim.id, property_data, shift_to_next,
							POST_data, claim_action[0], session);

				} else {
					shift_to_next();
				}

			}, POST_data, session);
			// console.log('set_next_claim: Waiting for ' + claim_action);
		},
		//
		shift_to_next = function() {
			var claims = data.claims;
			library_namespace.debug(claim_index + '/' + claims.length, 3,
					'shift_to_next');
			// 排掉能處理且已經處理完畢的claim。
			if (claim_index === 0) {
				claims.shift();
			} else {
				// assert: claim_index>0
				claims.splice(claim_index, 1);
			}
			set_next_claim();
		};

		normalize_wikidata_properties(data.claims, function(claims) {
			if (!Array.isArray(claims)) {
				if (claims) {
					library_namespace.error('set_claims: Invalid claims: '
							+ JSON.stringify(claims));
				} else {
					// assert: 本次沒有要設定 claim 的資料。
				}
				callback();
				return;
			}

			// e.g., claims:[{P1:'',language:'zh'},{P2:'',references:{}}]
			data.claims = claims;

			// console.log(JSON.stringify(claims));
			// console.log(claims);
			set_next_claim();
		}, entity && entity.claims
		// 確保會設定 .remove / .exists_index = duplicate_index。
		|| Object.create(null),
		//
		Object.assign({
			// [KEY_SESSION]
			session : session
		}, options));
	}

	if (false) {
		// examples

		// Cache the id of "性質" first. 先快取必要的屬性id值。
		CeL.wiki.data.search.use_cache('性質', function(id_list) {
			// Get the id of property '性質' first.
			// and here we get the id of '性質': "P31"
			CeL.log(id_list);
			// 執行剩下的程序. run rest codes.
		}, {
			must_callback : true,
			type : 'property'
		});

		// ----------------------------
		// rest codes:

		// Set up the wiki instance.
		var wiki = CeL.wiki.login(user_name, password, 'zh');

		wiki.data('維基數據沙盒2', function(data_JSON) {
			CeL.wiki.data.search.use_cache('性質', function(id_list) {
				data_JSON.value('性質', {
					// resolve wikibase-item
					resolve_item : true
				}, function(entity) {
					// get "Wikidata Sandbox"
					CeL.log(entity.value('label', 'en'));
				});
			}, {
				must_callback : true,
				type : 'property'
			});
		});

		// If we have run CeL.wiki.data.search.use_cache('性質')
		// first or inside it...
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON.value('性質', {
				// resolve wikibase-item
				resolve_item : true
			}, function(entity) {
				// get "Wikidata Sandbox"
				CeL.log(entity.value('label', 'en'));
			});
		});

		// Old style. The same effect as codes above.
		wiki.data('維基數據沙盒2', function(data_JSON) {
			// Here we are running the callback.
			CeL.wiki.data.search.use_cache('性質', function(id_list) {
				wiki.data(data_JSON.value('性質'), function(entity) {
					// via wikidata_entity_value()
					// get "维基数据测试沙盒"
					CeL.log(entity.value('label'));
				});
			}, {
				must_callback : true,
				type : 'property'
			});
		});

		wiki.data('維基數據沙盒2', function(data_JSON) {
			wiki.data(data_JSON.value('性質'), function(entity) {
				// via wikidata_entity_value()
				// get "维基数据测试沙盒"
				CeL.log(entity.value('label'));
			});
		});

		// edit properties
		wiki.edit_data(function(entity) {
			// add new / set single value with references
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw',
				references : {
					臺灣物種名錄物種編號 : 123456,
					// [[d:Special:AbuseFilter/54]]
					// 導入自 : 'zhwiki',
					載於 : '臺灣物種名錄物種',
					來源網址 : 'https://www.wikidata.org/',
					檢索日期 : new Date
				}
			};

			// set multiple values
			return {
				labels : {
					ja : 'ウィキデータ・サンドボックス2',
					'zh-tw' : [ '維基數據沙盒2', '維基數據沙盒#2', '維基數據沙盒-2' ]
				},
				descriptions : {
					'zh-tw' : '作為沙盒以供測試功能'
				},
				claims : [ {
					生物俗名 : [ 'SB2#1', 'SB2#2', 'SB2#3' ],
					multi : true,
					language : 'zh-tw',
					references : {
						臺灣物種名錄物種編號 : 123456
					}
				}, {
					読み仮名 : 'かな',
					language : 'ja',
					references : {
						// P143
						'imported from Wikimedia project' : 'jawikipedia'
					}
				} ]
			};

			// remove specified value 生物俗名=SB2
			return {
				生物俗名 : 'SB2',
				language : 'zh-tw',
				remove : true
			};

			// to remove ALL "生物俗名"
			return {
				生物俗名 : CeL.wiki.edit_data.remove_all,
				language : 'zh-tw'
			};

		}, {
			bot : 1,
			summary : 'bot test: edit properties'
		});

		// ----------------------------

		// add property/claim to Q13406268
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		// delete property/claim (all 生物俗名)
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : CeL.wiki.edit_data.remove_all,
				language : 'zh-tw'
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		// delete property/claim (生物俗名=維基數據沙盒2)
		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw',
				remove : true
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});

		wiki.data('維基數據沙盒2', function(data_JSON) {
			data_JSON;
		}).edit_data(function(entity) {
			return {
				生物俗名 : '維基數據沙盒2',
				language : 'zh-tw',
				references : {
					臺灣物種名錄物種編號 : 123456,
					// [[d:Special:AbuseFilter/54]]
					// 導入自 : 'zhwiki',
					載於 : '臺灣物種名錄物種',
					來源網址 : 'https://www.wikidata.org/',
					檢索日期 : new Date
				}
			};
		}, {
			bot : 1,
			summary : 'bot test: edit property'
		});
	}

	// ----------------------------------------------------

	// TODO:
	// data.labels + data.aliases:
	// {language_code:[label,{value:label,language:language_code,remove:''},...],...}
	// or will auto-guess language 未指定語言者將會自動猜測:
	// [label,{value:label,language:language_code,remove:''},{value:label,remove:''}]
	// or
	// [ [language_code,label], [language_code,label], ... ]
	//
	// 正規化 →
	// {language_code:[label_1,label_2,...],...}
	//
	// 去掉重複的標籤 →
	// {language_code:[label_1,label_2,...],...}
	// + .remove: {language_code:[label_1,label_2,...],...}
	//
	// → data.labels = {language_code:{value:label,language:language_code},...}
	// + data.aliases =
	// {language_code:[{value:label,language:language_code}],...}

	// adjust 調整 labels to aliases
	// @see wikidata_edit.add_labels
	function normalize_labels_aliases(data, entity, options) {
		var label_data = data.labels;
		if (typeof label_data === 'string') {
			label_data = [ label_data ];
		}

		if (library_namespace.is_Object(label_data)) {
			// assert: 調整 {Object}data.labels。
			// for
			// {en:[{value:label,language:language_code},{value:label,language:language_code},...]}
			var labels = [];
			for ( var language in label_data) {
				var label = label_data[language];
				if (Array.isArray(label)) {
					label.forEach(function(l) {
						// assert: {Object}l
						labels.push({
							language : language,
							value : l
						});
					});
				} else {
					labels.push(typeof label === 'string' ? {
						language : language,
						value : label
					}
					// assert: {Object}label || [language,label]
					: label);
				}
			}
			label_data = labels;

		} else if (!Array.isArray(label_data)) {
			if (label_data !== undefined) {
				// error?
			}
			return;
		}

		// assert: {Array}label_data = [label,label,...]

		// for
		// [{value:label,language:language_code},{value:label,language:language_code},...]

		// 正規化 →
		// labels = {language_code:[label_1,label_2,...],...}
		var labels = Object.create(null),
		// 先指定的為主labels，其他多的labels放到aliases。
		aliases = data.aliases || Object.create(null),
		// reconstruct labels
		error_list = label_data.filter(function(label) {
			if (!label && label !== '') {
				// Skip null label.
				return;
			}

			if (typeof label === 'string') {
				label = {
					language : wikidata_get_site(options, true)
							|| guess_language(label),
					value : label
				};
			} else if (is_api_and_title(label, 'language')) {
				label = {
					language : label[0] || guess_language(label[1]),
					value : label[1]
				};
			} else if (!label.language
			//
			|| !label.value && !('remove' in label)) {
				library_namespace.error('set_labels: Invalid label: '
						+ JSON.stringify(label));
				return true;
			}

			if (!(label.language in labels) && entity && entity.labels
					&& entity.labels[label.language]) {
				labels[label.language]
				// 不佚失原label。
				= entity.labels[label.language].value;
			}

			if (!labels[label.language] || !labels[label.language].value
			//
			|| ('remove' in labels[label.language])) {
				// 設定成為新的值。
				labels[label.language] = label;
				return;
			}

			// 先指定的為主labels，其他多的labels放到aliases。
			if (aliases[label.language]) {
				// assert: Array.isArray(aliases[label.language])
				aliases[label.language].push(label);
			} else {
				aliases[label.language] = [ label ];
			}
		});

		// 去除空的設定。
		if (library_namespace.is_empty_object(labels)) {
			delete data.labels;
		} else {
			data.labels = labels;
		}

		if (library_namespace.is_empty_object(aliases)) {
			delete data.aliases;
		} else {
			data.aliases = aliases;
		}

		// return error_list;
	}

	/**
	 * edit labels
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_labels(data, token, callback, options, session, entity) {
		if (!data.labels) {
			// Nothing to set
			callback();
			return;
		}

		normalize_labels_aliases(data, entity, options);

		var data_labels = data.labels;
		// e.g., data.labels={language_code:label,language_code:[labels],...}
		if (!library_namespace.is_Object(data_labels)) {
			library_namespace.error('set_labels: Invalid labels: '
					+ JSON.stringify(data_labels));
			callback();
			return;
		}

		var labels_to_set = [];
		for ( var language in data_labels) {
			var label = data_labels[language];
			if (!library_namespace.is_Object(label)) {
				library_namespace.error('set_labels: Invalid label: '
						+ JSON.stringify(label));
				continue;
			}

			labels_to_set.push(label);
		}

		if (labels_to_set.length === 0) {
			callback();
			return;
		}

		var POST_data = {
			id : options.id,
			language : '',
			value : ''
		};

		if (options.bot) {
			POST_data.bot = 1;
		}
		if (options.summary) {
			POST_data.summary = options.summary;
		}
		// TODO: baserevid, 但這需要每次重新取得 revid。

		// the token should be sent as the last parameter.
		POST_data.token = token;

		var index = 0,
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetlabel
		action = [ get_data_API_URL(options), 'wbsetlabel' ];

		function set_next_labels() {
			if (index === labels_to_set.length) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_labels');
				// 去除空的設定。
				if (library_namespace.is_empty_object(data.labels)) {
					delete data.labels;
				}

				callback();
				return;
			}

			var label = labels_to_set[index++];
			// assert: 這不會更改POST_data原有keys之順序。
			// Object.assign(POST_data, label);

			POST_data.language = label.language;
			// wbsetlabel 處理 value='' 時會視同 remove。
			POST_data.value = 'remove' in label ? ''
			// assert: typeof label.value === 'string' or 'number'
			: label.value;

			// 設定單一 Wikibase 實體的標籤。
			wiki_API.query(action, function(data) {
				var error = data && data.error;
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>
					 * 
					 * </code>
					 */
					library_namespace.error('set_next_labels: [' + error.code
							+ '] ' + error.info);
				} else {
					// successful done.
					delete data_labels[label.language];
				}

				set_next_labels();

			}, POST_data, session);
		}

		set_next_labels();

		// TODO: set sitelinks
		// TODO: 可拆解成 wbsetsitelink
	}

	/**
	 * edit aliases
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_aliases(data, token, callback, options, session, entity) {
		if (!data.aliases) {
			// Nothing to set
			callback();
			return;
		}

		// console.log(data.aliases);

		var data_aliases = data.aliases, aliases_queue;
		if (Array.isArray(data_aliases)) {
			aliases_queue = data_aliases;
			data_aliases = Object.create(null);
			aliases_queue.forEach(function(alias) {
				// 判別 language。
				var value = alias && alias.value, language = alias.language
						|| options.language || guess_language(value);
				if (language in data_aliases) {
					data_aliases[language].push(alias);
				} else {
					data_aliases[language] = [ alias ];
				}
			});

		} else if (!library_namespace.is_Object(data_aliases)) {
			library_namespace.error('set_aliases: Invalid aliases: '
					+ JSON.stringify(data_aliases));
			callback();
			return;
		}

		aliases_queue = [];
		for ( var language in data_aliases) {
			var alias_list = data_aliases[language];
			if (!Array.isArray(alias_list)) {
				if (alias_list === wikidata_edit.remove_all) {
					// 表示 set。
					aliases_queue.push([ language, [] ]);
				} else if (alias_list && typeof alias_list === 'string') {
					// 表示 set。
					aliases_queue.push([ language, [ alias_list ] ]);
				} else {
					library_namespace.error('set_aliases: Invalid aliases: '
							+ JSON.stringify(alias_list));
				}
				continue;
			}

			var aliases_to_add = [], aliases_to_remove = [];
			alias_list.forEach(function(alias) {
				if (!alias) {
					// 跳過沒東西的。
					return;
				}
				if ('remove' in alias) {
					if (alias.remove === wikidata_edit.remove_all) {
						// 表示 set。這將會忽略所有remove。
						aliases_to_remove = undefined;
					} else if ('value' in alias) {
						if (aliases_to_remove) {
							aliases_to_remove.push(alias.value);
						}
					} else {
						library_namespace
								.error('set_aliases: No value to value for '
										+ language);
					}
				} else if ('set' in alias) {
					// 表示 set。這將會忽略所有remove。
					aliases_to_remove = undefined;
					aliases_to_add = [ alias.value ];
					// 警告:當使用 wbeditentity，並列多個未設定 .add 之 alias 時，
					// 只會加入最後一個。但這邊將會全部加入，因此行為不同！
				} else if (alias.value === wikidata_edit.remove_all) {
					// 表示 set。這將會忽略所有remove。
					aliases_to_remove = undefined;
				} else {
					aliases_to_add.push(alias.value);
				}
			});

			if (aliases_to_add.length > 0 || aliases_to_remove > 0) {
				aliases_queue.push([ language, aliases_to_add.unique(),
						aliases_to_remove && aliases_to_remove.unique() ]);
			}
		}

		if (aliases_queue.length === 0) {
			callback();
			return;
		}

		// console.log(aliases_queue);

		var POST_data = {
			id : options.id,
			language : ''
		// set : '',
		// add : '',
		// remove : ''
		};

		if (options.bot) {
			POST_data.bot = 1;
		}
		if (options.summary) {
			POST_data.summary = options.summary;
		}
		// TODO: baserevid, 但這需要每次重新取得 revid。

		var
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetaliases
		action = [ get_data_API_URL(options), 'wbsetaliases' ];

		function set_next_aliases() {
			if (aliases_queue.length === 0) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_aliases');
				// 有錯誤也已經提醒。
				delete data.aliases;

				callback();
				return;
			}

			var aliases_data = aliases_queue.pop();
			// assert: 這不會更改POST_data原有keys之順序。

			POST_data.language = aliases_data[0];
			if (aliases_data[2]) {
				delete POST_data.set;
				POST_data.add = aliases_data[1].join('|');
				POST_data.remove = aliases_data[2].join('|');
			} else {
				delete POST_data.add;
				delete POST_data.remove;
				POST_data.set = aliases_data[1].join('|');
			}

			// the token should be sent as the last parameter.
			delete POST_data.token;
			POST_data.token = token;

			// 設定單一 Wikibase 實體的標籤。
			wiki_API.query(action, function(data) {
				var error = data && data.error;
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>
					 * 
					 * </code>
					 */
					library_namespace.error('set_next_aliases: [' + error.code
							+ '] ' + error.info);
				} else {
					// successful done.
				}

				set_next_aliases();

			}, POST_data, session);
		}

		set_next_aliases();
	}

	/**
	 * edit descriptions
	 * 
	 * @inner only for wikidata_edit()
	 */
	function set_descriptions(data, token, callback, options, session, entity) {
		if (!data.descriptions) {
			// Nothing to set
			callback();
			return;
		}

		// console.log(data.descriptions);

		var data_descriptions = data.descriptions;
		if (typeof data_descriptions === 'string') {
			data_descriptions = [ data_descriptions ];
		}

		if (library_namespace.is_Object(data_descriptions)) {
			// assert: 調整 {Object}data.descriptions。
			// for
			// {en:[{value:label,language:language_code},{value:label,language:language_code},...]}
			var descriptions = [];
			for ( var language in data_descriptions) {
				var description = data_descriptions[language];
				if (Array.isArray(description)) {
					description.forEach(function(d) {
						// assert: {Object}d
						descriptions.push({
							language : language,
							value : d
						});
					});
				} else {
					descriptions.push(typeof description === 'string' ? {
						language : language,
						value : description
					}
					// assert: {Object}description || [language,description]
					: description);
				}
			}
			data_descriptions = descriptions;

		} else if (!Array.isArray(data_descriptions)) {
			if (data_descriptions !== undefined) {
				// error?
			}
			return;
		}

		// 正規化 →
		// descriptions = {language_code:description,...}
		var descriptions = Object.create(null),
		//
		default_lang = session.language || session[KEY_HOST_SESSION].language
				|| wiki_API.language,
		// reconstruct labels
		error_list = data_descriptions.filter(function(description) {
			var language;
			if (typeof description === 'string') {
				language = wikidata_get_site(options, true)
						|| guess_language(description) || default_lang;
			} else if (is_api_and_title(description, 'language')) {
				language = description[0] || guess_language(description[1])
						|| default_lang;
				description = description[1];
			} else if (!description || !description.language
			//
			|| !description.value && !('remove' in description)) {
				library_namespace
						.error('set_descriptions: Invalid descriptions: '
								+ JSON.stringify(description));
				return true;
			} else {
				language = description.language
						|| wikidata_get_site(options, true)
						|| guess_language(description.value) || default_lang;
				if ('remove' in description) {
					description = '';
				} else {
					description = description.value;
				}
			}

			// 設定成為新的值。
			descriptions[language] = description || '';
		});

		// 去除空的設定。
		if (library_namespace.is_empty_object(descriptions)) {
			delete data.descriptions;
			callback();
			return;
		}

		// console.log(descriptions);

		var POST_data = {
			id : options.id,
			language : '',
			value : ''
		};

		if (options.bot) {
			POST_data.bot = 1;
		}
		if (options.summary) {
			POST_data.summary = options.summary;
		}
		// TODO: baserevid, 但這需要每次重新取得 revid。

		// the token should be sent as the last parameter.
		POST_data.token = token;

		var description_keys = Object.keys(descriptions),
		// https://www.wikidata.org/w/api.php?action=help&modules=wbsetdescription
		action = [ get_data_API_URL(options), 'wbsetdescription' ];

		function set_next_descriptions() {
			if (description_keys.length === 0) {
				library_namespace.debug('done. 已處理完所有能處理的。 callback();', 2,
						'set_next_descriptions');
				// 有錯誤也已經提醒。
				delete data.descriptions;

				callback();
				return;
			}

			var language = description_keys.pop();
			// assert: 這不會更改POST_data原有keys之順序。

			POST_data.language = language;
			POST_data.value = descriptions[language];

			// 設定單一 Wikibase 實體的標籤。
			wiki_API.query(action, function(data) {
				var error = data && data.error;
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					/**
					 * e.g., <code>
					 * 
					 * </code>
					 */
					library_namespace.error('set_next_descriptions: ['
							+ error.code + '] ' + error.info);
				} else {
					// successful done.
				}

				set_next_descriptions();

			}, POST_data, session);
		}

		set_next_descriptions();
	}

	// ----------------------------------------------------

	/**
	 * Creates or modifies Wikibase entity. 創建或編輯Wikidata實體。
	 * 
	 * 注意: 若是本來已有某個值（例如 label），採用 add 會被取代。或須偵測並避免更動原有值。
	 * 
	 * @example<code>

	 wiki = Wiki(true, 'test.wikidata');
	 // TODO:
	 wiki.page('宇宙').data(function(entity){result=entity;console.log(entity);}).edit(function(){return '';}).edit_data(function(){return {};});
	 wiki.page('宇宙').edit_data(function(entity){result=entity;console.log(entity);});

	 </code>
	 * 
	 * @param {String|Array}id
	 *            id to modify or entity you want to create.<br />
	 *            item/property 將會創建實體。
	 * @param {Object|Function}data
	 *            used as the data source to modify. 要編輯（更改或創建）的資料。可能被更改！<br />
	 *            {Object}data or {Function}data(entity)
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}callback
	 *            回調函數。 callback(entity, error)
	 * 
	 * @see https://www.wikidata.org/wiki/Wikidata:Creating_a_bot
	 * @see https://www.wikidata.org/wiki/Wikidata:Bots<br />
	 *      Monitor
	 *      https://www.wikidata.org/wiki/Wikidata:Database_reports/Constraint_violations<br />
	 *      Bots should add instance of (P31 性質) or subclass of (P279 上一級分類) or
	 *      part of (P361 屬於) if possible<br />
	 *      Bots importing from Wikipedia should add in addition to imported
	 *      from (P143) also reference URL (P854) with the value of the full URL
	 *      and either retrieved (P813) or include the version id of the source
	 *      page in the full URL.
	 */
	function wikidata_edit(id, data, token, options, callback) {
		if (typeof options === 'function' && !callback) {
			// shift arguments.
			callback = options;
			options = null;
		}

		if (!library_namespace.is_Object(options)) {
			// 前置處理。
			options = Object.create(null);
		}

		if (!id && !options['new']) {
			callback(undefined, {
				code : 'no_id',
				message : 'Did not set id! 未設定欲取得之特定實體 id。'
			});
			return;
		}

		if (typeof data === 'function') {
			if (is_entity(id)) {
				library_namespace.debug('餵給(回傳要編輯資料的)設定值函數 ' + id.id + ' ('
						+ (get_entity_label(id) || get_entity_link(id)) + ')。',
						2, 'wikidata_edit');
				// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
				data = data.call(options, id);

			} else {
				if (false) {
					library_namespace.debug(
					// TypeError: Converting circular structure to JSON
					'Get id from ' + JSON.stringify(id), 3, 'wikidata_edit');
				}
				wikidata_entity(id, options.props, function(entity, error) {
					if (error) {
						library_namespace.debug('Get error '
								+ JSON.stringify(error), 3, 'wikidata_edit');
						callback(undefined, error);
						return;
					}
					if (false) {
						// TypeError: Converting circular structure to JSON
						library_namespace.debug('Get entity '
								+ JSON.stringify(entity), 3, 'wikidata_edit');
					}
					if ('missing' in entity) {
						// TODO: e.g., 此頁面不存在/已刪除。
						// return;
					}

					delete options.props;
					delete options.languages;
					// .call(options,): 使(回傳要編輯資料的)設定值函數能以this即時變更 options。
					data = data.call(options, is_entity(entity) ? entity
					// error?
					: undefined);
					wikidata_edit(id, data, token, options, callback);
				}, options);
				return;
			}
		}

		var entity;
		if (is_entity(id)) {
			// 輸入 id 為實體項目 entity
			entity = id;
			if (!options.baserevid) {
				// 檢測編輯衝突用。
				options.baserevid = id.lastrevid;
			}
			id = id.id;
		}

		var action = wiki_API.edit.check_data(data, id, options,
				'wikidata_edit');
		if (action) {
			library_namespace.debug('直接執行 callback。', 2, 'wikidata_edit');
			callback(undefined, action);
			return;
		}

		if (!id) {
			if (!options['new'])
				library_namespace
						.debug('未設定 id，您可能需要手動檢查。', 2, 'wikidata_edit');

		} else if (is_entity(id)
		// && /^Q\d{1,10}$/.test(id.id)
		) {
			options.id = id.id;

		} else if (wiki_API.is_page_data(id)) {
			options.site = wikidata_get_site(options);
			options.title = encodeURIComponent(id.title);

		} else if (id === 'item' || id === 'property') {
			options['new'] = id;

		} else if (/^Q\d{1,10}$/.test(id)) {
			// e.g., 'Q1'
			options.id = id;

		} else if (is_api_and_title(id)) {
			options.site = wiki_API.site_name(id[0]);
			options.title = id[1];

		} else {
			library_namespace.warn('wikidata_edit: Invalid id: ' + id);
		}

		var session;
		if ('session' in options) {
			session = options[KEY_SESSION];
			delete options[KEY_SESSION];
		}

		// edit實體項目entity
		action = [
		// https://www.wikidata.org/w/api.php?action=help&modules=wbeditentity
		get_data_API_URL(options), 'wbeditentity' ];

		// 還存在此項可能會被匯入 query 中。但須注意刪掉後未來將不能再被利用！
		delete options.API_URL;

		if (library_namespace.is_Object(token)) {
			token = token.csrftoken;
		}

		function do_wbeditentity() {
			for ( var key in data) {
				if (Array.isArray(data[key]) ? data[key].length === 0
						: library_namespace.is_empty_object(data[key])) {
					delete data[key];
				}
			}
			if (library_namespace.is_empty_object(data)) {
				callback(data);
				return;
			}
			// data 會在 set_claims() 被修改，因此不能提前設定。
			options.data = JSON.stringify(data);
			if (library_namespace.is_debug(2)) {
				library_namespace.debug('options.data: ' + options.data, 2,
						'wikidata_edit.do_wbeditentity');
				console.log(data);
			}

			// the token should be sent as the last parameter.
			options.token = token;

			wiki_API.query(action, function handle_result(data) {
				var error = data && data.error;
				// 檢查伺服器回應是否有錯誤資訊。
				if (error) {
					library_namespace.error(
					// e.g., "數據庫被禁止寫入以進行維護，所以您目前將無法保存您所作的編輯"
					// Mediawiki is in read-only mode during maintenance
					'wikidata_edit.do_wbeditentity: '
					//
					+ (options.id ? options.id + ': ' : '')
					// [readonly] The wiki is currently in read-only mode
					+ '[' + error.code + '] ' + error.info);
					library_namespace.warn('data to write: '
							+ JSON.stringify(options));
					callback(undefined, error);
					return;
				}

				if (data.entity) {
					data = data.entity;
				}
				callback(data);
			}, options, session);
		}

		if (false && Array.isArray(data)) {
			// TODO: 按照內容分類。
			library_namespace
					.warn('wikidata_edit.do_wbeditentity: Treat {Array}data as {claims:data}!');
			data = {
				claims : data
			};
		}

		// TODO: 創建實體項目重定向。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbcreateredirect

		// console.log(options);

		// TODO: 避免 callback hell: using ES7 async/await?
		// TODO: 用更簡單的方法統合這幾個函數。
		library_namespace.debug('Run set_claims', 2, 'wikidata_edit');
		set_claims(data, token, function() {
			library_namespace.debug('Run set_labels', 2, 'wikidata_edit');
			set_labels(data, token, function() {
				library_namespace.debug('Run set_aliases', 2, 'wikidata_edit');
				set_aliases(data, token, function() {
					library_namespace.debug('Run set_descriptions', 2,
							'wikidata_edit');
					set_descriptions(data, token, do_wbeditentity, options,
							session, entity);
				}, options, session, entity);
			}, options, session, entity);
		}, options, session, entity);
	}

	// CeL.wiki.edit_data.somevalue
	// snaktype somevalue 未知數值 unknown value
	wikidata_edit.somevalue = {
		// 單純表達意思用的內容結構，可以其他的值代替。
		unknown_value : true
	};

	// CeL.wiki.edit_data.remove_all
	// 注意: 不可為 index!
	wikidata_edit.remove_all = {
		// 單純表達意思用的內容結構，可以其他的值代替。
		remove_all : true
	};

	/**
	 * 取得指定實體，指定語言的所有 labels 與 aliases 值之列表。
	 * 
	 * @param {Object}entity
	 *            指定實體的 JSON 值。
	 * @param {String}[language]
	 *            指定取得此語言之資料。
	 * @param {Array}[list]
	 *            添加此原有之 label 列表。<br />
	 *            list = [ {String}label, ... ]
	 * 
	 * @returns {Array}所有 labels 與 aliases 值之列表。
	 */
	function entity_labels_and_aliases(entity, language, list) {
		if (!Array.isArray(list))
			// 初始化。
			list = [];

		if (!entity)
			return list;

		if (false && language && is_entity(entity) && !list) {
			// faster

			/** {Object|Array}label */
			var label = entity.labels[language],
			/** {Array}aliases */
			list = entity.aliases && entity.aliases[language];

			if (label) {
				label = label.value;
				if (list)
					// 不更動到原 aliases。
					(list = list.map(function(item) {
						return item.value;
					})).unshift(label);
				else
					list = [ label ];
			} else if (!list) {
				return [];
			}

			return list;
		}

		function add_list(item_list) {
			if (Array.isArray(item_list)) {
				// assert: {Array}item_list 為 wikidata_edit() 要編輯（更改或創建）的資料。
				// assert: item_list = [{language:'',value:''}, ...]
				list.append(item_list.map(function(item) {
					return item.value;
				}));

			} else if (!language) {
				// assert: {Object}item_list
				for ( var _language in item_list) {
					// assert: Array.isArray(aliases[label])
					add_list(item_list[_language]);
				}

			} else if (language in item_list) {
				// assert: {Object}item_list
				item_list = item_list[language];
				if (Array.isArray(item_list))
					add_list(item_list);
				else
					list.push(item_list.value);
			}
		}

		entity.labels && add_list(entity.labels);
		entity.aliases && add_list(entity.aliases);
		return list;
	}

	// common characters.
	// FULLWIDTH full width form characters 全形 ØωⅡ
	var PATTERN_common_characters_FW = /[\s\-ー・·．˙•，、。？！；：“”‘’「」『』（）－—…《》〈〉【】〖〗〔〕～←→↔⇐⇒⇔]+/g,
	// [[:en:Chùa Báo Quốc]]
	// {{tsl|ja|オメガクインテット|*ω*Quintet}}
	// {{tsl|en|Tamara de Lempicka|Tamara Łempicka}}
	// {{link-en|Željko Ivanek|Zeljko Ivanek}}
	/** {RegExp}常用字母的匹配模式。應該是英語也能接受的符號。 */
	PATTERN_common_characters = /[\s\d_,.:;'"!()\-+\&<>\\\/\?–`@#$%^&*=~×☆★♪♫♬♩○●©®℗™℠]+/g,
	// 不能用來判別語言、不能表達意義的泛用符號/字元。無關緊要（不造成主要意義）的字元。
	PATTERN_only_common_characters = new RegExp('^['
			+ PATTERN_common_characters.source.slice(1, -2)
			//
			+ PATTERN_common_characters_FW.source.slice(1, -2) + ']*$'),
	// non-Chinese / non-CJK: 必須置於所有非中日韓語言之後測試!!
	// 2E80-2EFF 中日韓漢字部首補充 CJK Radicals Supplement
	/** {RegExp}非漢文化字母的匹配模式。 */
	PATTERN_non_CJK = /^[\u0008-\u2E7F]+$/i,
	/**
	 * 判定 label 標籤標題語言使用之 pattern。
	 * 
	 * @type {Object}
	 * 
	 * @see [[以人口排列的語言列表]], [[維基百科:維基百科語言列表]], [[Special:統計#其他語言的維基百科]],
	 *      application.locale.encoding
	 */
	label_language_patterns = {
		// 常用的[[英文字母]]需要放置於第一個測試。
		en : /^[a-z]+$/i,

		// [[西班牙語字母]]
		// 'áéíñóúü'.toLowerCase().split('').sort().unique_sorted().join('')
		es : /^[a-záéíñóúü]+$/i,
		// [[:en:French orthography]]
		// http://character-code.com/french-html-codes.php
		fr : /^[a-z«»àâæçèéêëîïôùûüÿœ₣€]+$/i,
		// [[德語字母]], [[:de:Deutsches Alphabet]]
		de : /^[a-zäöüß]+$/i,

		// [[Arabic script in Unicode]] [[阿拉伯字母]]
		// \u10E60-\u10E7F
		ar : /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/,

		// 印度 [[印地語]][[天城文]]
		bh : /^[\u0900-\u097F\uA8E0-\uA8FF\u1CD0-\u1CFF]+$/,
		// [[:en:Bengali (Unicode block)]]
		bn : /^[\u0980-\u09FF]+$/,

		// [[俄語字母]], [\p{IsCyrillic}]+
		ru : /^[\u0401-\u0451]+$/,

		// [[Unicode and HTML for the Hebrew alphabet]] [[希伯來字母]]
		// [[Hebrew (Unicode block)]]
		he : /^[\u0591-\u05F4]+$/,

		// [[越南文字母]]
		vi : /^[aăâbcdđeêghiklmnoôơpqrstuưvxy]+$/i

	}, label_CJK_patterns = {
		ja : /^[\u3041-\u30FF\u31F0-\u31FF\uFA30-\uFA6A]+$/,
		// [[朝鮮字母]]
		ko : /^[\uAC00-\uD7A3\u1100-\u11FF\u3131-\u318E]+$/
	};

	/**
	 * 猜測 label 標籤標題之語言。
	 * 
	 * @param {String}label
	 *            標籤標題
	 * @param {String}[CJK_language]
	 *            預設之中日韓語言 code。
	 * 
	 * @returns {String|Undefined}label 之語言。
	 */
	function guess_language(label, CJK_language) {
		if (!label
		// 先去掉所有泛用符號/字元。
		|| !(label = label.replace(PATTERN_common_characters, ''))) {
			// 刪掉泛用符號/字元後已無東西剩下。
			return;
		}

		// non_CJK: 此處事實上為非中日韓漢字之未知語言。
		var non_CJK = PATTERN_non_CJK.test(label),
		//
		patterns = non_CJK ? label_language_patterns : label_CJK_patterns;

		for ( var language in patterns) {
			if (patterns[language].test(label)) {
				return language;
			}
		}

		if (!non_CJK) {
			return CJK_language;
		}

		library_namespace.warn(
		//
		'guess_language: Unknown non-CJK label: [' + label + ']');
		return '';
	}

	/**
	 * 回傳 wikidata_edit() 可用的個別 label 或 alias 設定項。
	 * 
	 * @param {String}label
	 *            label 值。
	 * @param {String}[language]
	 *            設定此 label 之語言。
	 * @param {String}[default_lang]
	 *            default language to use
	 * @param {Array}[add_to_list]
	 *            添加在此編輯資料列表中。
	 * 
	 * @returns {Object}個別 label 或 alias 設定項。
	 */
	wikidata_edit.add_item = function(label, language, default_lang,
			add_to_list) {
		if (!language || typeof language !== 'string') {
			// 無法猜出則使用預設之語言。
			language = guess_language(label) || default_lang;
			if (!language) {
				return;
			}
		}
		label = {
			language : language,
			value : label,
			add : 1
		};
		if (add_to_list) {
			add_to_list.push(label);
		}
		return label;
	};

	// --------------------------------

	// 測試是否包含前，正規化 label。
	// 注意: 因為會變更 label，不可將此輸出作為最後 import 之內容！
	function key_of_label(label) {
		return label && String(label)
		// 去掉無關緊要（不造成主要意義）的字元。 ja:"・", "ー"
		.replace(PATTERN_common_characters_FW, '').toLowerCase()
		// 去掉複數。 TODO: 此法過於簡略。
		.replace(/s$/, '')
		// 保證回傳 {String}。 TODO: {Number}0
		|| '';
	}

	// 測試是否包含等價或延伸（而不僅僅是完全相同的） label。
	// 複雜版 original.includes(label_to_test)
	// TODO: 可省略 /[,;.!]/
	function include_label(original, label_to_test) {
		// 沒東西要測試，表示也毋須作進一步處理。
		if (!label_to_test) {
			return true;
		}
		// 原先沒東西，表示一定沒包含。
		if (!original) {
			return false;
		}

		label_to_test = key_of_label(label_to_test);

		if (Array.isArray(original)) {
			return original.some(function(label) {
				return key_of_label(label).includes(label_to_test);
			});
		}

		// 測試正規化後是否包含。
		return key_of_label(original).includes(label_to_test);
	}

	/**
	 * 當想把 labels 加入 entity 時，輸入之則可自動去除重複的 labels，並回傳 wikidata_edit() 可用的編輯資料。
	 * merge labels / alias
	 * 
	 * TODO: 不區分大小寫與空格（這有時可能為 typo），只要存在即跳過。或最起碼忽略首字大小寫差異。
	 * 
	 * @param {Object}labels
	 *            labels = {language:[label list],...}
	 * @param {Object}[entity]
	 *            指定實體的 JSON 值。
	 * @param {Object}[data]
	 *            添加在此編輯資料中。
	 * 
	 * @returns {Object}wikidata_edit() 可用的編輯資料。
	 */
	wikidata_edit.add_labels = function(labels, entity, data) {
		var data_alias;

		// assert: {Object}data 為 wikidata_edit() 要編輯（更改或創建）的資料。
		// data={labels:[{language:'',value:'',add:},...],aliases:[{language:'',value:'',add:},...]}
		if (data && (Array.isArray(data.labels) || Array.isArray(data.aliases))) {
			// {Array}data_alias
			data_alias = entity_labels_and_aliases(data);
			if (false) {
				if (!Array.isArray(data.labels))
					data.labels = [];
				else if (!Array.isArray(data.aliases))
					data.aliases = [];
			}

		} else {
			// 初始化。
			// Object.create(null);
			data = {
			// labels : [],
			// aliases : []
			};
		}

		var count = 0;
		// excludes existing label or alias. 去除已存在的 label/alias。
		for ( var language in labels) {
			// 此語言要添加的 label data。
			var label_data = labels[language];
			if (language === 'no') {
				library_namespace.debug('change language [' + language
						+ '] → [nb]', 2, 'wikidata_edit.add_labels');
				// using the language code "nb", not "no", at no.wikipedia.org
				// @see [[phab:T102533]]
				language = 'nb';
			}
			if (!Array.isArray(label_data)) {
				if (label_data)
					;
				library_namespace.warn('wikidata_edit.add_labels: language ['
						+ language + '] is not Array: (' + (typeof label_data)
						+ ')' + label_data);
				continue;
			}

			// TODO: 提高效率。
			var alias = entity_labels_and_aliases(entity, language, data_alias),
			/** {Boolean}此語言是否有此label */
			has_this_language_label = undefined,
			/** {Array}本次 label_data 已添加之 label list */
			new_alias = undefined,
			//
			matched = language.match(/^([a-z]{2,3})-/);

			if (matched) {
				// 若是要添加 'zh-tw'，則應該順便檢查 'zh'。
				entity_labels_and_aliases(entity, matched[1], alias);
			}

			label_data
			// 確保 "title" 在 "title (type)" 之前。
			.sort()
			// 避免要添加的 label_data 本身即有重複。
			.unique_sorted()
			// 處理各 label。
			.forEach(function(label) {
				if (!label || typeof label !== 'string') {
					// warnning: Invalid label.
					return;
				}

				var label_without_type = /\([^()]+\)$/.test(label)
				// e.g., label === "title (type)"
				// → label_without_type = "title"
				&& label.replace(/\s*\([^()]+\)$/, '');

				// 測試是否包含等價或延伸（而不僅僅是完全相同的） label。
				// TODO: 每個 label 每次測試皆得重新 key_of_label()，效率過差。
				if (include_label(alias, label)
				//
				|| label_without_type
				// 當已有 "title" 時，不添加 "title (type)"。
				&& (include_label(alias, label_without_type)
				// assert: !new_alias.includes(label)，已被 .unique() 除去。
				|| new_alias && include_label(new_alias, label_without_type))) {
					// Skip. 已有此 label 或等價之 label。
					return;
				}

				count++;
				if (new_alias)
					new_alias.push(label);
				else
					new_alias = [ label ];

				var item = wikidata_edit.add_item(label, language);

				if (has_this_language_label === undefined)
					has_this_language_label
					// 注意: 若是本來已有某個值（例如 label），採用 add 會被取代。或須偵測並避免更動原有值。
					= entity.labels && entity.labels[language]
					//
					|| data.labels && data.labels.some(function(item) {
						return item.language === language;
					});

				if (!has_this_language_label) {
					// 因為預料會增加的 label/aliases 很少，因此採後初始化。
					if (!data.labels)
						data.labels = [];
					// 第一個當作 label。直接登錄。
					data.labels.push(item);
				} else {
					// 因為預料會增加的 label/aliases 很少，因此採後初始化。
					if (!data.aliases)
						data.aliases = [];
					// 其他的當作 alias
					data.aliases.push(item);
				}
			});

			if (new_alias) {
				if (data_alias)
					data_alias.append(new_alias);
				else
					data_alias = new_alias;
			}
		}

		if (count === 0) {
			// No labels/aliases to set. 已無剩下需要設定之新 label/aliases。
			return;
		}

		if (false) {
			// 已採後初始化。既然造出實例，表示必定有資料。
			// trim 修剪；修整
			if (data.labels.length === 0)
				delete data.labels;
			if (data.aliases.length === 0)
				delete data.aliases;
		}

		return data;
	};

	// ------------------------------------------------------------------------

	/**
	 * 合併自 wikidata 的 entity。
	 * 
	 * TODO: wikidata_merge([to, from1, from2], ...)
	 * 
	 * @param {String}to
	 *            要合併自的ID
	 * @param {String}from
	 *            要合併到的ID
	 * @param {Object}token
	 *            login 資訊，包含“csrf”令牌/密鑰。
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list)
	 */
	function wikidata_merge(to, from, token, options, callback) {
		if (!/^Q\d{1,10}$/.test(to)) {
			wikidata_entity(to, function(entity, error) {
				if (error) {
					callback(undefined, error);
				} else {
					wikidata_merge(entity.id, from, callback, options);
				}
			});
			return;
		}

		if (!/^Q\d{1,10}$/.test(from)) {
			wikidata_entity(from, function(entity, error) {
				if (error) {
					callback(undefined, error);
				} else {
					wikidata_merge(to, entity.id, callback, options);
				}
			});
			return;
		}

		// 正規化並提供可隨意改變的同內容參數，以避免修改或覆蓋附加參數。
		options = library_namespace.new_options(options);

		// 要忽略衝突的項的元素數組，只能包含值“description”和/或“sitelink”和/或“statement”。
		// 多值 (以 | 分隔)：description、sitelink、statement
		// 網站鏈接和描述
		var ignoreconflicts = 'ignoreconflicts' in options ? options.ignoreconflicts
				// 最常使用的功能是合併2頁面。可忽略任何衝突的 description, statement。
				// https://www.wikidata.org/wiki/Help:Statements
				: 'description';

		var session;
		if ('session' in options) {
			session = options[KEY_SESSION];
			delete options[KEY_SESSION];
		}

		var action = 'wbmergeitems&fromid=' + from + '&toid=' + to;
		if (ignoreconflicts) {
			action += '&ignoreconflicts=' + ignoreconflicts;
		}

		action = [
		// 合併重複項。
		// https://www.wikidata.org/w/api.php?action=help&modules=wbmergeitems
		get_data_API_URL(options), action ];

		// the token should be sent as the last parameter.
		options.token = library_namespace.is_Object(token) ? token.csrftoken
				: token;

		wiki_API.query(action, function(data) {
			var error = data && data.error;
			// 檢查伺服器回應是否有錯誤資訊。
			if (error) {
				library_namespace.error('wikidata_merge: ['
				// [failed-modify] Attempted modification of the item failed.
				// (Conflicting descriptions for language zh)
				+ error.code + '] ' + error.info);
				callback(undefined, error);
				return;
			}

			// Will create redirection.
			// 此 wbmergeitems 之回傳 data 不包含 item 資訊。
			// data =
			// {"success":1,"redirected":1,"from":{"id":"Q1","type":"item","lastrevid":1},"to":{"id":"Q2","type":"item","lastrevid":2}}
			// {"success":1,"redirected":0,"from":{"id":"Q1","type":"item","lastrevid":1},"to":{"id":"Q2","type":"item","lastrevid":2}}
			callback(data);
		}, options, session);
	}

	// ------------------------------------------------------------------------

	/** {String}API URL of Wikidata Query. */
	var wikidata_query_API_URL = 'https://wdq.wmflabs.org/api';

	/**
	 * 查詢 Wikidata Query。
	 * 
	 * @example<code>

	 CeL.wiki.wdq('claim[31:146]', function(list) {result=list;console.log(list);});
	 CeL.wiki.wdq('CLAIM[31:14827288] AND CLAIM[31:593744]', function(list) {result=list;console.log(list);});
	 //	查詢國家
	 CeL.wiki.wdq('claim[31:6256]', function(list) {result=list;console.log(list);});


	 // Wikidata filter claim
	 // https://wdq.wmflabs.org/api_documentation.html
	 // https://wdq.wmflabs.org/wdq/?q=claim[31:146]&callback=eer
	 // https://wdq.wmflabs.org/api?q=claim[31:146]&callback=eer
	 CeL.get_URL('https://wdq.wmflabs.org/api?q=claim[31:146]', function(data) {result=data=JSON.parse(data.responseText);console.log(data.items);})
	 CeL.get_URL('https://wdq.wmflabs.org/api?q=string[label:宇宙]', function(data) {result=data=JSON.parse(data.responseText);console.log(data.items);})

	 </code>
	 * 
	 * @param {String}query
	 *            查詢語句。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list, error)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function wikidata_query(query, callback, options) {
		var action = [ options && options.API_URL || wikidata_query_API_URL,
				'?q=', encodeURIComponent(query) ];

		if (options) {
			if (typeof options === 'string') {
				options = {
					props : options
				};
			} else if (Array.isArray(options)) {
				options = {
					props : options.join(',')
				};
			} else {
				// 已使用過。
				delete options.API_URL;
			}

			if (options.wdq_props)
				action.push('&props=', options.wdq_props);
			if (options.noitems)
				// 毋須 '&noitems=1'
				action.push('&noitems');
			// &callback=
		}

		get_URL(action.join(''), function(data) {
			var items;
			// error handling
			try {
				items = JSON.parse(data.responseText).items;
			} catch (e) {
			}
			if (!items || options && options.get_id) {
				callback(undefined, data && data.status || 'Failed to get '
						+ query);
				return;
			}
			if (items.length > 50) {
				// 上限值為 50 (機器人為 500)。
				library_namespace.debug('Get ' + items.length
						+ ' items, more than 50.', 2, 'wikidata_query');
				var session = options && options[KEY_SESSION];
				// session && session.data(items, callback, options);
				if (session && !session.data_session) {
					// 得先登入。
					session.set_data(function() {
						wikidata_entity(items, callback, options);
					});
					return;
				}
			}
			wikidata_entity(items, callback, options);
		});
	}

	/** {String}API URL of Wikidata Query Service (SPARQL). */
	var wikidata_SPARQL_API_URL = 'https://query.wikidata.org/bigdata/namespace/wdq/sparql';

	/**
	 * 查詢 Wikidata Query Service (SPARQL)。
	 * 
	 * @example<code>

	 CeL.wiki.SPARQL('SELECT ?item ?itemLabel WHERE { ?item wdt:P31 wd:Q146 . SERVICE wikibase:label { bd:serviceParam wikibase:language "en" } }', function(list) {result=list;console.log(list);})

	 </code>
	 * 
	 * @param {String}query
	 *            查詢語句。
	 * @param {Function}[callback]
	 *            回調函數。 callback(轉成JavaScript的值. e.g., {Array}list)
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://www.mediawiki.org/wiki/Wikidata_query_service/User_Manual
	 *      https://www.wikidata.org/wiki/Wikidata:Data_access#SPARQL_endpoints
	 */
	function wikidata_SPARQL(query, callback, options) {
		var action = [ options && options.API_URL || wikidata_SPARQL_API_URL,
				'?query=', encodeURIComponent(query), '&format=json' ];

		get_URL(action.join(''), function(data, error) {
			if (error) {
				callback(undefined, error);
				return;
			}
			data = JSON.parse(data.responseText);
			var items = data.results;
			if (!items || !Array.isArray(items = items.bindings)) {
				callback(data);
				return;
			}
			// 正常情況
			callback(items);
		});
	}

	// --------------------------------------------------------------------------------------------

	/** {String}API URL of PetScan. */
	var wikidata_PetScan_API_URL = 'https://petscan.wmflabs.org/',
	// 常用 parameters。
	PetScan_parameters = 'combination,sparql'.split(',');

	/**
	 * PetScan can generate lists of Wikipedia (and related projects) pages or
	 * Wikidata items that match certain criteria, such as all pages in a
	 * certain category, or all items with a certain property.
	 * 
	 * @example<code>

	// [[:Category:日本のポップ歌手]]直下の記事のうちWikidataにおいて性別(P21)が女性(Q6581072)となっているもの
	CeL.wiki.petscan('日本のポップ歌手',function(items){result=items;console.log(items);},{language:'ja',sparql:'SELECT ?item WHERE { ?item wdt:P21 wd:Q6581072 }'})

	 </code>
	 * 
	 * @param {String}categories
	 *            List of categories, one per line without "category:" part.
	 * @param {Function}[callback]
	 *            回調函數。 callback({Array}[{Object}item])
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function petscan(categories, callback, options) {
		var _options;
		if (options) {
			if (typeof options === 'string') {
				options = {
					language : options
				};
			} else {
				_options = options;
			}
		} else {
			options = Object.create(null);
		}

		var language = options.language || wiki_API.language, parameters;
		if (is_api_and_title(categories, 'language')) {
			language = categories[0];
			categories = categories[1];
		}

		if (_options) {
			parameters = Object.create(null);
			PetScan_parameters.forEach(function(parameter) {
				if (parameter in options) {
					parameters[parameter] = options[parameter];
				}
			});
			Object.assign(parameters, options.parameters);
		}
		_options = {
			language : language,
			wikidata_label_language : language,
			categories : Array.isArray(categories)
			// List of categories, one per line without "category:" part.
			// 此時應設定 combination:union/subset
			? categories.join('\n') : categories,
			project : options.project || options.family || 'wikipedia',
			// 確保輸出為需要的格式。
			format : 'wiki',
			doit : 'D'
		};
		if (parameters) {
			Object.assign(parameters, _options);
		} else {
			parameters = _options;
		}

		get_URL((options.API_URL || wikidata_PetScan_API_URL) + '?'
				+ get_URL.parameters_to_String(parameters), function(data,
				error) {
			if (error) {
				callback(undefined, error);
				return;
			}
			data = data.responseText;
			var items = [], matched,
			/**
			 * <code>
			!Title !! Page ID !! Namespace !! Size (bytes) !! Last change !! Wikidata
			| [[Q234598|宇多田ヒカル]] || 228187 || 0 || 49939 || 20161028033707
			→ format form PetScan format=json
			{"id":228187,"len":49939,"namespace":0,"title":"Q234598","touched":"20161028033707"},
			 </code>
			 */
			PATTERN =
			// [ all, title, sitelink, miscellaneous ]
			// TODO: use PATTERN_wikilink
			/\n\|\s*\[\[([^\[\]\|{}\n�]+)\|([^\[\]\n]*?)\]\]\s*\|\|([^\n]+)/g;
			while (matched = PATTERN.exec(data)) {
				var miscellaneous = matched[3].split(/\s*\|\|\s*/),
				//
				item = {
					id : +miscellaneous[0],
					len : +miscellaneous[2],
					namespace : +miscellaneous[1],
					title : matched[1],
					touched : miscellaneous[3]
				};
				if (matched[2]) {
					// Maybe it's label...
					item.sitelink = matched[2];
				}
				if ((matched = miscellaneous[4])
				//
				&& (matched = matched.match(/\[\[:d:([^\[\]\|{}\n#�:]+)/))) {
					item.wikidata = matched[1];
				}
				items.push(item);
			}
			callback(items);
		});
	}

	// ------------------------------------------------------------------------

	// export 導出.

	// @inner
	library_namespace.set_method(wiki_API, {
		setup_data_session : setup_data_session
	});

	// ------------------------------------------

	// @static
	Object.assign(wiki_API, {
		PATTERN_common_characters : PATTERN_common_characters,
		PATTERN_only_common_characters : PATTERN_only_common_characters,

		// site_name_of
		site_name : language_to_site_name,

		guess_language : guess_language,

		is_entity : is_entity,

		// data : wikidata_entity,
		edit_data : wikidata_edit,
		merge_data : wikidata_merge,
		//
		wdq : wikidata_query,
		SPARQL : wikidata_SPARQL,
		petscan : petscan
	});

	return wikidata_entity;
}
