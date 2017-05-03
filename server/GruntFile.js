module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		"jsbeautifier": {
			"default": {
				src: ["*.js", "*.html"],
				options: {
					js: {
						indentChar: "\t",
						indentSize: 1
					},
					html: {
						indentChar: "\t",
						indentSize: 1
					}
				}
			}
		}
	});

	// Load the plugin that provides the "jsbeautifier" task.
	grunt.loadNpmTasks("grunt-jsbeautifier");

	// Default task(s).
	grunt.registerTask('default', ['jsbeautifier']);

};
