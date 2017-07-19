All js minimization was made with https://jscompress.com/
All html minimization was made with https://kangax.github.io/html-minifier/

botDev.min.js is the minimized version of botDev.js
botDev.packaged.js is a copy of botDev.js but can be copy pasted into a JavaScript string definition. This is currently not working.
botDev.packaged.min.js is a (working) minimized version of botDev.packaged.js
botDev_installer.js is the JS file that installs everything needed for botDev.js to work along with botDev.js itself
botDev_installer.min.js is the minimzed version of botDev_installer.js
botDev_installer_template.js is botDev.installer.js but instead of <INSERT BOTDEV> it has the contents of botDev.packaged.min.js
botDev_installer_template.min.js is the minimized version of botDev_installer.template.js
botDevPackager.js takes in the botDev.js files, packages them, and generates botDev_installer.js given botDev_installer.template.js
console.html is the botDev.js web console
console.min.html is console.html with minimized JavaScript and HTML
console.packaged.min.html is a copy of console.min.html but can be copy pasted into a JavaScript string definition.