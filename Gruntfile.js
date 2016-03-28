module.exports = function(grunt) {

  // 專案設定
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  // 載入可以提供 uglify task 的 plugin
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // 預設的 task
  grunt.registerTask('default', ['uglify']);

};
