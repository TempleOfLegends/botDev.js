/*global require*/
/*global console*/
/*global process*/

var filename = __filename;

var exec = require("child_process").exec;
var fs = require("fs");

function deleteFile() {
	"use strict";
	
	console.log("Installation complete! Deleting " + filename);
	
	fs.unlink(filename, function (err) {
		if (err) {
			console.log(err);
			
			return;
		}
		
		console.log("Successfully deleted " + filename + ". Goodbye!");
		
		process.exit(0);
	});
}

function install_botDev() {
	"use strict";
	
	console.log("Installing botDev.js...");
	
	var str = "function randomNum(t,r){\"use strict\";return t+Math.round(Math.random()*(r-t))}function isPrime(t){\"use strict\";var r;for(r=2;r<=Math.sqrt(t);r+=2===r?1:2)if(t%r==0)return!1;return!0}function gcd(t,r){\"use strict\";for(var e;0!==r;)e=r,r=t%r,t=e;return t}function SHA512(t){\"use strict\";return crypto.createHash(\"sha512\").update(t).digest(\"hex\")}function encrypt(t,r){\"use strict\";var e=crypto.createCipher(\"aes-256-ctr\",r);return e.update(t,\"utf8\",\"hex\")+e.final(\"hex\")}function decrypt(t,r){\"use strict\";var e=crypto.createDecipher(\"aes-256-ctr\",r);return e.update(t,\"hex\",\"utf8\")+e.final(\"utf8\")}function Bot(t){\"use strict\";new Discord.Client({token:t,autorun:!0});var r={};fs.readFile(\"./config.txt\",\"utf8\",function(t,e){t&&\"ENOENT\"===t.code&&(console.log(\"Unable to find config.txt\"),process.exit(0)),t&&\"ENOENT\"!==t.code&&(console.log(\"Unable to read config.txt\"),process.exit(0)),e=e.split(\"\\n\").join(\"\\r\").split(\"\\r\").filter(function(t){return!(\"\"===t||t.startsWith(\"#\"))});var n,o,s;for(n=0;n<e.length;n+=1)e[n]=e[n].split(\" = \"),o=e[n].splice(0,1),s=JSON.parse(e[n].join(\" \")),r[o]=s;console.log(JSON.stringify(r,null,4))}),this.loadCommands=function(){},this.on=function(){}}var version={\"discord-js\":\"11.1.0\",\"botDev.js\":\"2.2.1\"},Discord=require(\"discord.js\"),crypto=require(\"crypto\"),fs=require(\"fs\"),express=require(\"express\"),app=express();module.exports=Bot;";
	
	fs.writeFile("./botDev.js", str, function (err) {
		if (err) {
			console.log(err);
			
			return;
		}
		
		console.log("botDev.js has been installed!");
		
		deleteFile();
	});
}

function install_config() {
	"use strict";
	
	console.log("Installing config.txt...");
	
	var str = "# Bot ownership\n\n\n\n\n\n\n\n# Discord ID of the owner of this bot\n\nowner = \"205910685782245376\"\n\n\n\n\n\n\n\n\n\n\n\n# Command execution\n\n\n\n\n\n\n\n# Bot default prefix\n\ncommands.exe.prefix = \"!\"\n\n\n\n# Bot default suffix\n\ncommands.exe.suffix = \"!\"\n\n\n\n# Make mentions an argument that is a collection of the tagged users\n\ncommands.exe.mention_is_arg = true\n\n\n\n\n\n\n\n\n\n\n\n# Password generation\n\n\n\n\n\n\n\n# Master password bytes\n\npassword.master.bytes = 32\n\n\n\n# Final password length\n\npassword.final.length = 128\n\n\n\n# Password hashing algorithm\n\npassowrd.hash = \"sha512\"\n\n\n\n# Password encoding\n\npassword.encoding = \"hex\"\n\n\n\n\n\n\n\n\n\n\n\n# Backup info\n\n\n\n\n\n\n\n# Interval (in milliseconds) in which the bot backs up its files.\n\nbackup.interval = 300000\n\n\n\n# Message bot sends before a backup\n\nbackup.msg.start = \"Backing up files...\"\n\n\n\n# Message bot sends before backing up a file\n\nbackup.msg.read = \"Backing up file <FILE>...\"\n\n\n\n# Message bot sends when reading a file fails\n\nbackup.msg.read.error = \"Unable to read file <FILE>.\"\n\n\n\n# Message bot sends before writing a file\n\nbackup.msg.write = \"Writing backup file for <FILE>...\"\n\n\n\n# Message bot sends when writing a backup fails\n\nbackup.msg.write.error = \"Unable to backup file <FILE>.\"\n\n\n\n# Message bot sends once backup is completed\n\nbackup.msg.end = \"Backup complete! <PERCENT>% of files were successfully backed up\"\n\n\n\n\n\n\n\n\n\n# Web Console\n\n\n\n\n\n\n\n# Whether or not to use the web console\n\nwebconsole = true\n\n\n\n# Default port. Set this to -1 to generate a port\n\nwebconsole.port = -1\n\n\n\n# Number to add to characters in port generation hash\n\nwebconsole.port.hash.add = 829\n\n\n\n# Minimum port number\n\nwebconsole.port.min = 1000\n\n\n\n# Maximum port number\n\nwebconsole.port.max = 8759\n\n\n\n\n\n\n\n\n\n\n\n# Commands\n\n\n\n\n\n\n\n# If default \"help\" command should be added\n\ncommands.help = true\n\n\n\n# Custom name of default \"help\" command\n\ncommands.help.name = \"help\"\n\n\n\n# Whether the bot should send the help page in DMs or in the channel. Set 0 to DMs, 1 for the channel the command was requested in\n\ncommands.help.channel = 1\n\n\n\n# Message to send to user once help is sent in DMs.\n\ncommands.help.channel.msg = \"<USER>, help has been sent!\"\n\n\n\n# Whether or not the bot should use an embed for the help page\n\ncommands.help.embed = false\n\n\n\n# Color for help embed\n\ncommands.help.embed.color = \"#02c5d8\"\n\n\n\n# Whether or not to specify an author for help embed\n\ncommands.help.embed.author = true\n\n\n\n# Author for help embed\n\ncommands.help.embed.author.author = \"<BOT NAME>\"\n\n\n\n# Whether or not to use an icon for help embed\n\ncommands.help.embed.author.icon = true\n\n\n\n# Author icon for help embed\n\ncommands.help.embed.author.icon.icon = \"<BOT PROFILE PICTURE>\"\n\n\n\n# Whether or not to use a title for help embed\n\ncommands.help.embed.title = true\n\n\n\n# Title for help embed\n\ncommands.help.embed.title.title = \"Help Page\"\n\n\n\n# Whether or not to use a URL for help embed\n\ncommands.help.embed.url = false\n\n\n\n# URL for help embed\n\ncommands.help.embed.url.url = \"\"\n\n\n\n# Whether or not to add a timestamp for help embed\n\ncommands.help.embed.timestamp = true\n\n\n\n# Whether or not to add a footer for help embed\n\ncommands.help.embed.footer = true\n\n\n\n# Footer text for help embed\n\ncommands.help.embed.footer.text = \"<BOT NAME>\"\n\n\n\n# Whether or not to use a footer icon for help embed\n\ncommands.help.embed.footer.icon = true\n\n\n\n# Footer icon for help embed\n\ncommands.help.embed.footer.icon.icon = \"<BOT PROFILE PICTURE>\"\n\n\n\n# Format for multiple commands\n\ncommands.help.format.multiple = \"<PREFIX><COMMAND><SUFFIX> : <PURPOSE>\\n\\tUsage: <COMMAND> <HELP>\\n\\tPermissions: ``<PERMS>``\"\n\n\n\n# What to separate multiple commands in help page with\n\ncommands.help.join = \"\\n\\n\"\n\n\n\n# Format for one command\n\ncommands.help.format.single = \"<PREFIX><COMMAND><SUFFIX> : <PURPOSE>\\n\\tUsage: <COMMAND> <HELP>\\n\\tPermissions: ``<PERMS>``\"\n\n\n\n\n\n\n\n# If default \"ping\" command should be added\n\ncommands.ping = true\n\n\n\n# Custom name of default \"ping\" command\n\ncommands.ping.name = \"ping\"\n\n\n\n# If \"ping\" command should use the Client.ping property, contrary to measuring the time it took to send \"pong\"\n\ncommands.ping.client_ping = false\n\n\n\n# Amount of allowed decimal places in ping\n\ncommands.ping.decimals = 2\n\n\n\n\n\n\n\n# If default \"kill\" command should be added\n\ncommands.kill = true\n\n\n\n# Custom name of default \"kill\" command\n\ncommands.kill.name = \"kill\"\n\n\n\n# Whether or not a password should be required\n\ncommands.kill.password = true\n\n\n\n\n\n\n\n# If default \"account\" command should be added\n\ncommands.account = true\n\n\n\n# Custom name of default \"account\" command\n\ncommands.account.name = \"account\"\n\n\n\n\n\n\n\n# If default \"perms\" command should be added\n\ncommands.perms = true\n\n\n\n# Custom name of default \"perms\" command\n\ncommands.perms.name = \"perms\"\n\n\n\n\n\n\n\n\n\n\n\n# Server info\n\n\n\n\n\n\n\n# What to display when the bot is added to a server\n\nserver.bot_join = \"<OWNER>, I have been added to this server!\"\n\n\n\n\n\n\n\n\n\n\n\n# Data to store about servers\n\n\n\n\n\n\n\n# Whether or not to store avatar IDs\n\nstorage.users.avatar = true\n\n\n\n# Whether or not to store avatar urls\n\nstorage.users.avatar.url = false\n\n\n\n# Whether or not to store usernames\n\nstorage.users.username = true\n\n\n\n# Whether or not to store discriminators\n\nstorage.users.disc = true\n\n\n\n# Whether or not to store whether or not the user is a bot\n\nstorage.users.bot = true\n\n\n\n# Whether or not to store uptime\n\nstorage.users.uptime = true\n\n\n\n# Whether or not to store user status\n\nstorage.users.status = false\n\n\n\n\n\n\n\n\n\n\n\n# Console logs for file system\n\n\n\n\n\n\n\n# Message to send when checking for existance of a file\n\nlog.check = \"Checking for <FILE>...\"\n\n\n\n# Message to send if file doesn't exist\n\nlog.check.enoent = \"Unable to find <FILE>\"\n\n\n\n# Message to send if unable to check for the existance of a file\n\nlog.check.error = \"Unable to check for <FILE>\"\n\n\n\n# Message to send if able to find file\n\nlog.check.success = \"Found <FILE>\"\n\n\n\n\n\n\n\n# Message to send if reading file\n\nlog.read = \"Reading <FILE>...\"\n\n\n\n# Message to send if file doesn't exist\n\nlog.read.enoent = \"Unable to find <FILE>\"\n\n\n\n# Message to send if unable to read file\n\nlog.read.error = \"Unable to read <FILE>\"\n\n\n\n# Message to send if reading of the file was successful\n\nlog.read.success = \"Successfully read <FILE>\"\n\n\n\n\n\n\n\n# Message to send if writing file\n\nlog.write = \"Writing <FILE>...\"\n\n\n\n# Message to send if unable to write file\n\nlog.write.error = \"Unable to write <FILE>\"\n\n\n\n# Message to send if writing of the file was successful\n\nlog.write.success = \"Successfully wrote <FILE>\"";
	
	fs.writeFile("./config.txt", str, function (err) {
		if (err) {
			console.log(err);
			
			return;
		}
		
		console.log("config.txt has been installed!");
		
		install_botDev();
	});
}

function install_console() {
	"use strict";
	
	console.log("Installing console.html...");
	
	var str = "<!DOCTYPE html><title id=title></title><link id=icon rel=icon><body><script src=/socket.io/socket.io.js></script><div id=console><div id=options><div id=errorsOption onclick=toggle(this) style=color:red>Errors</div><div id=infoOption onclick=toggle(this) style=color:green>Info</div><div id=warningsOption onclick=toggle(this) style=color:orange>Warnings</div><div id=commandsOption onclick=toggle(this) style=color:#00f>Commands</div></div><div id=general><table><tr><td>Bot<td><button id=please onclick=stop(this)>Stop</button><tr><td>Avatar<td id=avatar><tr><td>Name<td id=name><tr><td>Discord ID<td id=id><tr><td>Connected Users<td id=users><tr><td>Ping<td id=ping><tr><td>Token<td id=token><tr><td>Uptime<td id=uptime><tr><td>Game<td id=game><tr><td>Status<td id=status></table></div><div id=errors></div><div id=info></div><div id=warnings></div><div id=commands></div></div><style>body{font-family:Arial,Helvetica,sans-serif}#console{position:absolute;top:0;left:0;width:100%;height:100%}#console #general,#console #options{overflow-y:auto}#console #options{position:absolute;top:0;left:0;height:100%;width:calc(25% - 1px);border-right:1px solid #000}#console #options div{position:relative;width:calc(100% - 20px);padding:10px;cursor:pointer;border-bottom:1px solid #000;background-color:#fff;font-weight:700;transition:background-color 1s}#console #options div.show{background-color:#d7d7d7;transition:background-color 1s}#console #general{position:absolute;top:0;right:0;height:100%;width:calc(75% - 1px);z-index:1;border-left:1px solid #000}table{font-family:arial,sans-serif;border-collapse:collapse;width:100%}td,th{text-align:left;padding:20px}tr:nth-child(even){background-color:#d7d7d7}button{text-align:center;background-color:#54a8f8;padding-left:37.5px;padding-right:37.5px;padding-top:10px;padding-bottom:10px;border-radius:10px;border:2px solid #54a8f8;transition:background-color 1s;cursor:pointer}button.barrier{background-color:#fff;transition:background-color 1s}#commands,#errors,#info,#warnings{opacity:0;word-wrap:break-word;position:absolute;top:0;right:0;height:calc(100% - 20px);width:calc(75% - 21px);border-left:1px solid #000;background-color:#fff;padding:10px;z-index:0;transition:opacity 1s,z-index 0s 1s;overflow:auto}#commands.show,#errors.show,#info.show,#warnings.show{opacity:1;z-index:1000;transition:opacity 1s}</style><script>function stop(e){\"barrier\"!==e.className&&(e.className=\"barrier\",socket.emit(\"stop\",\"stop\"))}function toggle(e){var n=e.innerHTML.split(\" \")[0].toLowerCase();\"errors\"!==n&&(document.getElementById(\"errors\").className=\"\",document.getElementById(\"errorsOption\").className=\"\",document.getElementById(\"errors\").innerHTML=\"\"),\"info\"!==n&&(document.getElementById(\"info\").className=\"\",document.getElementById(\"infoOption\").className=\"\",document.getElementById(\"info\").innerHTML=\"\"),\"warnings\"!==n&&(document.getElementById(\"warnings\").className=\"\",document.getElementById(\"warningsOption\").className=\"\",document.getElementById(\"warnings\").innerHTML=\"\"),\"commands\"!==n&&(document.getElementById(\"commands\").className=\"\",document.getElementById(\"commandsOption\").className=\"\",document.getElementById(\"commands\").innerHTML=\"\"),\"show\"===document.getElementById(n).className?(document.getElementById(n).className=\"\",document.getElementById(n).innerHTML=\"\",document.getElementById(n+\"Option\").className=\"\"):(document.getElementById(n).className=\"show\",document.getElementById(n+\"Option\").className=\"show\",document.getElementById(n).innerHTML=\"<span>\"+LIST[n].join(\"</span><br /><span>\")+\"</span>\")}var socket=io.connect(window.location.href.split(\"/\")[2]),ERRORS=document.getElementById(\"errorsList\"),INFO=document.getElementById(\"infoList\"),WARNINGS=document.getElementById(\"warningsList\"),COMMANDS=document.getElementById(\"commandsList\");socket.on(\"title\",function(e){document.getElementById(\"title\").innerHTML=e}),socket.on(\"icon\",function(e){document.getElementById(\"icon\").href=e,document.getElementById(\"icon\").type=\"image/jpg\"}),socket.on(\"data\",function(e){document.getElementById(\"please\").className=\"\";var n,t=Object.keys(e);for(n=0;n<t.length;n+=1)document.getElementById(t[n]).innerHTML=e[t[n]];setTimeout(function(){socket.emit(\"beep\",\"beep\")},1e3)}),socket.on(\"boop\",function(e){var n,t=Object.keys(e);for(n=0;n<t.length;n+=1)document.getElementById(t[n]).innerHTML=e[t[n]];setTimeout(function(){socket.emit(\"beep\",\"beep\")},1e3)});var LIST={};socket.on(\"list\",function(e){LIST=e,document.getElementById(\"errorsOption\").innerHTML=\"Errors (\"+LIST.errors.length+\")\",document.getElementById(\"infoOption\").innerHTML=\"Info (\"+LIST.info.length+\")\",document.getElementById(\"warningsOption\").innerHTML=\"Warnings (\"+LIST.warnings.length+\")\",document.getElementById(\"commandsOption\").innerHTML=\"Commands (\"+LIST.commands.length+\")\"})</script>";
	
	fs.writeFile("./console.html", str, function (err) {
		if (err) {
			console.log(err);
			
			return;
		}
		
		console.log("console.html has been installed!");
		
		install_config();
	});
}

function install_discordJS() {
	"use strict";
	
	console.log("Looking for /node_modules/discord.js/ ...");
	
	try {
		var stat = fs.statSync("./node_modules/discord.js/");
		
		console.log("Found /node_modules/discord.js/ .");
		
		install_console();
	} catch (err) {
		if (err && err.code === "ENOENT") {
			console.log("Installing discord.js...  (this may take a while)");
			
			exec("npm install discord.js", function (err, stdout, stderr) {

				if (err) {
					console.log(err);
					
					process.exit(0);
				}

				if (stdout) {
					console.log("discord.js has been installed!");
					
					install_console();
				}
				
				if (stderr) {
					console.log(stderr);
				}
			});
		} else if (err) {
			console.log("Unable to check for /node_modules/discord.js/. Try again");

			process.exit(0);
		}
	}
}

function install_socketIO() {
	"use strict";
	
	console.log("Looking for /node_modules/socket.io/ ...");
	
	try {
		var stat = fs.statSync("./node_modules/socket.io/");
		
		console.log("Found /node_modules/socket.io/ .");
		
		install_discordJS();
	} catch (err) {
		if (err && err.code === "ENOENT") {
			console.log("Installing socket.io...  (this may take a while)");
			
			exec("npm install socket.io", function (err, stdout, stderr) {

				if (err) {
					console.log(err);
					
					process.exit(0);
				}

				if (stdout) {
					console.log("socket.io has been installed!");
					
					install_discordJS();
				}
				
				if (stderr) {
					console.log(stderr);
				}
			});
		} else if (err) {
			console.log("Unable to check for /node_modules/socket.io/. Try again");

			process.exit(0);
		}
	}
}

function install_express() {
	"use strict";
	
	console.log("Looking for /node_modules/express/ ...");
	
	try {
		var stat = fs.statSync("./node_modules/express/");
		
		console.log("Found /node_modules/express/ .");
		
		install_socketIO();
	} catch (err) {
		if (err && err.code === "ENOENT") {
			console.log("Installing express... (this may take a while)");
			
			exec("npm install express", function (err, stdout, stderr) {

				if (err) {
					console.log(err);
					
					process.exit(0);
				}

				if (stdout) {
					console.log("express has been installed!");
					
					install_socketIO();
				}
				
				if (stderr) {
					console.log(stderr);
				}
			});
		} else if (err) {
			console.log("Unable to check for /node_modules/express/. Try again");

			process.exit(0);
		}
	}
}

console.log("Thank you for using botDev.js <3 - Henry");

install_express();