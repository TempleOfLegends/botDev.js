All js minimization was made with https://jscompress.com/
All html minimization was made with https://kangax.github.io/html-minifier/

botDev.min.js is the minimized version of botDev.js
console.html is the botDev.js web console
console.min.html is console.html with minimized JavaScript and HTML

There are botDev_installer JS files. All of these install botDev.js, but you can choose how to download it via which installer you download. The ones with .min.js are minified versions of the installers, and these should install the code quicker due to less code. The ones with _min in the name install the minified version of botDev.js.

The installers check for the following NodeJS modules, and if they aren't there, download them.
1) Express
2) Socket.io
3) Discord.js

They also download the following files
1) botDev(.min).js
2) console(.min).html
3) config.txt
