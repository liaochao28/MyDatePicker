/**
 * main.js
 * requirejs 的配置文件
**/

require.config({
	paths: {
		"jquery": ["http://libs.baidu.com/jquery/2.0.3/jquery", "../../work/js/jquery.min"],
		"datetime": ["datetime"]
	}
});

require(["jquery","datetime"],function($,dt){
	dt.DateTime.init($("[type='date']"));
});