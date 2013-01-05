/**
 * @name CeL file system functions
 * @fileoverview 本檔案包含了 file system functions。
 * @since 2013/1/5 9:38:34
 * @see <a href="http://en.wikipedia.org/wiki/Filesystem" accessdate="2013/1/5
 *      9:44">File system</a>
 */

'use strict';
if (typeof CeL === 'function')
	CeL.run({
		name : 'data.file',
		code : function(library_namespace) {

			var
			// const: sub files. 必須是不會被用於檔案、目錄名之值。
			FILES = '',
			// file/directory status/infomation, even contents.
			// 必須是不會被用於檔案、目錄名之值。
			DATA = '.';

			function file_system_object(path) {

			}

			function file_system_structure(path) {

			}

			function refresh_structure(callback, options) {

			}

			function structure_to_JSON(options) {
				// hierarchy:
				// .structure={
				// FILES:[],
				// DATA:{},
				// sub directory name:{}
				// };

			}

			/**
			 * travel structure.<br />
			 * 巡覽 file system 的函數。
			 * 
			 * @param {Function|Array}callback
			 *            file system handle function array.
			 * @param options
			 *            filter / type
			 */
			function for_each_FSO(callback, options) {

			}

			library_namespace.extend({
				for_each : for_each_FSO,
				refresh : refresh_structure,
				toJSON : structure_to_JSON
			}, file_system_structure.prototype);

			return {
				// object : file_system_object,
				structure : file_system_structure
			};
		}

	});
