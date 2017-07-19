/*
	
	Code by HenryTurkeyBrain
	
	http://www.henryturkeybrain.com
	https://www.youtube.com/c/HenryTurkeyBrain
	
	If you use this in your bot(s), please credit me!
*/

/*global require*/
/*global console*/
/*global process*/
/*global module*/
/*global Promise*/

var version = {
	"discord-js": "11.1.0",
	"botDev.js": "2.2.1"
};

var Discord = require("discord.js");

var crypto = require("crypto");

var fs = require("fs");

var express = require("express");

var app = express();

function randomNum(a, b) {
	"use strict";
	return a + Math.round(Math.random() * (b - a));
}

function isPrime(x) {
	"use strict";
	var i;
	for (i = 2; i <= Math.sqrt(x); i += ((i === 2) ? 1 : 2)) {
		if (x % i === 0) {
			return false;
		}
	}
	
	return true;
}

function gcd(a, b) {
	"use strict";
	var c;
	while (b !== 0) {
		c = b;
		b = a % b;
		a = c;
	}
	return a;
}



function hash(str, algorithm, encoding) {
	"use strict";
	
	algorithm = (algorithm !== undefined) ? algorithm : "sha512";
	encoding = (encoding !== undefined) ? encoding : "hex";
	
	var digest = crypto.createHash(algorithm);
	return digest.update(str).digest(encoding);
}


// use 256 bits to avoid higher bit key attacks

function encrypt(str, key) {
	"use strict";
	
	var AES = crypto.createCipher("aes-256-ctr", key);
	return AES.update(str, "utf8", "hex") + AES.final("hex");
}

// use 256 bits to avoid higher bit key attacks

function decrypt(str, key) {
	"use strict";
	
	var AES = crypto.createDecipher("aes-256-ctr", key);
	return AES.update(str, "hex", "utf8") + AES.final("utf8");
}

function Bot(token) {
	"use strict";
	
	var bot = new Discord.Client({
		token: token,
		autorun: true
	}), Commands = {}, masterPassword, passwords = {}, servers = {}, defaultPerms, queue = {}, callbacks = {}, auth, port, server, socketio, io, config = {}, content, i, prop, val;
	
	try {
		content = fs.readFileSync("./config.txt", "utf8");
	} catch (err) {
		if (err && err.code === "ENOENT") {
			console.log("Unable to find config.txt");
		}
		
		if (err && err.code !== "ENOENT") {
			console.log("Unable to read config.txt");
		}
		process.exit(0);
	}
	
	content = content.split("\n").join("\r").split("\r").filter(function (line) {
		return !(line === "" || line.startsWith("#"));
	});
	
	for (i = 0; i < content.length; i += 1) {
		content[i] = content[i].split(" = ");
		prop = content[i].splice(0, 1);
		val = JSON.parse(content[i].join(" "));
		
		config[prop] = val;
	}
	
	if (config.owner === "owner") {
		console.log("Please configure the bot's onwer in config.txt file to make it your discord ID");
	}
	
	auth = {
		msg: {
			status: false,
			enforce: false,
			override: false
		}
	};
	
	this.hash = hash;
	
	masterPassword = "";
	
	function generatePassword(usage) {
		passwords[usage] = hash(masterPassword + token + usage, config["password.hash"], config["password.encoding"]);
		
		while (passwords[usage].length < config["password.final.length"]) {
			passwords[usage] += hash(masterPassword + token + usage + passwords[usage], config["password.hash"], config["password.encoding"]);
		}
		
		passwords[usage] = passwords[usage].substr(0, config["password.final.length"]);
	}
	
	this.generatePassword = generatePassword;
	
	crypto.randomBytes(config["password.master.bytes"], function (err, buf) {
		if (err) {
			callbacks.onerror(err);
			
			process.exit(0);
		}
		
		masterPassword = buf.toString(config["password.encoding"]);
		
		generatePassword("crash");
	});
	
	
	
	function updateAccount(user, guildID) {
		var acc = servers[guildID].users[user.id];
		
		if (!servers[guildID].users[user.id]) {
			servers[guildID].users[user.id] = {};
		}
		
		servers[guildID].users[user.id].perms = (acc) ? acc.perms : ["DEFAULT_PERMS"];
		
		if (config["storage.users.avatar"]) {
			servers[guildID].users[user.id].avatar = user.avatar;
		}
		
		if (config["storage.users.avatar.url"]) {
			servers[guildID].users[user.id].avatarImg = user.displayAvatarURL;
		}
		
		if (config["storage.users.username"]) {
			servers[guildID].users[user.id].username = user.username;
		}
		
		if (config["storage.users.disc"]) {
			servers[guildID].users[user.id].disc = user.discriminator;
		}
		
		if (config["storage.users.bot"]) {
			servers[guildID].users[user.id].bot = user.bot;
		}
		
		if (config["storage.users.uptime"]) {
			servers[guildID].users[user.id].uptime = user.client.uptime;
		}
		
		if (config["storage.users.status"]) {
			servers[guildID].users[user.id].status = user.client.status;
		}
		
		servers[guildID].users[user.id].version = version["botDev.js"];
		
		/*	bot: user.bot,
			uptime: user.client.uptime,
			status: user.client.status,
			email: user.email,
			verified: user.verified,
			browser: user.browser*/
		
		return new Promise(function (resolve, reject) {
			fs.writeFile("/Servers/" + guildID + "/users.json", JSON.stringify(servers[guildID].users, null, 4), "utf8", function (err) {
				if (err) {
					callbacks.onerror(err);
					
					reject();
					
					return;
				}
				
				resolve();
			});
		});
		
	}
	
	this.updateAccount = updateAccount;
	
	
	
	function getRawPerms(id, guildID) {
		if (servers[guildID].users[id] !== undefined) {
			return servers[guildID].users[id].perms;
		} else {
			bot.error(id + " has no account", guildID);
			
			return ["DEFAULT_PERMS"];
		}
	}
	
	this.getRawPerms = getRawPerms;
	
	
	
	function getPerms(id, guildID) {
		var perms = [], rawperms = getRawPerms(id, guildID), i, k, perm;
		for (i = 0; i < rawperms.length; i += 1) {
			perm = rawperms[i].replace("~", "");
			if (perm === "DEFAULT_PERMS") {
				for (k = 0; k < servers[guildID].defaultPerms.length; k += 1) {
					perms.push(servers[guildID].defaultPerms[k]);
				}
			} else {
				if (rawperms[i].startsWith("~")) {
					if (perms.indexOf(perm) > -1) {
						perms.splice(perms.indexOf(perm), 1);
					}
				} else {
					perms.push(perm);
				}
			}
		}
		
		return perms;
	}
	
	this.getPerms = getPerms;
	
	
	
	
	
	this.loadCommands = function (commands) {
		var keys = Object.keys(commands), i;
		
		for (i = 0; i < keys.length; i += 1) {
			if (keys[i].indexOf(" ") > -1) {
				console.log("Command \"" + keys[i] + "\" cannot have a space in its name.");
				
				process.exit(0);
			}
			
			Commands[keys[i].toLowerCase()] = commands[keys[i]];
		}
		
		if (config["commands.help"] && !Commands[config["commands.help.name"]]) {
			Commands[config["commands.help.name"]] = {
				help: "[command]",
				purpose: "Lists all commands",
				perms: [],
				guild: false,
				callback: function (msg, args) {
					var i, keys = Object.keys(Commands), str = "", perms, channel = (config["commands.help.channel"] === 0) ? msg.author : msg.channel, embed = {};
					
					if (config["commands.help.embed"]) {
						if (config["commands.help.embed.author"]) {
							embed.author = {};
							embed.author.name = config["commands.help.embed.author.author"].replace("<BOT NAME>", bot.user.username).replace("<OWNER>", config.owner);
							
							if (config["commands.help.embed.author.icon"]) {
								embed.author.icon_url = config["commands.help.embed.author.icon.icon"].replace("<BOT PROFILE PICTURE>", bot.user.avatarURL);
							}
						}
						
						if (config["commands.help.embed.title"]) {
							embed.title = config["commands.help.embed.title.title"];
						}
						
						if (config["commands.help.embed.url"]) {
							embed.url = config["commands.help.embed.url.url"];
						}
						
						if (config["commands.help.embed.timestamp"]) {
							embed.timestamp = new Date();//config["commands.help.embed.timestamp.timestamp"].replace("<TIME>", new Date());
						}
						
						if (config["commands.help.embed.footer"]) {
							embed.footer = {};
							
							embed.footer.text = config["commands.help.embed.footer.text"].replace("<BOT NAME>", bot.user.username).replace("<OWNER>", config.owner);
							
							if (config["commands.help.embed.footer.icon"]) {
								embed.footer.icon_url = config["commands.help.embed.footer.icon.icon"].replace("<BOT PROFILE PICTURE>", bot.user.avatarURL);
							}
						}
						
						embed.color = parseInt(config["commands.help.embed.color"].replace("#", ""), 16);
						
						
						if (args[0] && Commands[args[0].toLowerCase()] !== undefined) {
							perms = Commands[args[0].toLowerCase()].perms;
							
							embed.fields = [{
								name: args[0].toLowerCase(),
								value: config["commands.help.format.single"].split("<PREFIX>").join(config["commands.exe.prefix"]).split("<COMMAND>").join(args[0].toLowerCase()).split("<SUFFIX>").join(config["commands.exe.suffix"]).split("<PURPOSE>").join(Commands[args[0].toLowerCase()].purpose).split("<HELP>").join(Commands[args[0].toLowerCase()].help).split("<PERMS>").join((perms.length > 0) ? perms.join(", ") : "none")
							}];
						} else {
							embed.fields = [];
							
							for (i = 0; i < keys.length; i += 1) {
								perms = Commands[keys[i]].perms;
								
								embed.fields.push({
									name: keys[i].toLowerCase(),
									value: config["commands.help.format.multiple"].split("<PREFIX>").join(config["commands.exe.prefix"]).split("<COMMAND>").join(keys[i].toLowerCase()).split("<SUFFIX>").join(config["commands.exe.suffix"]).split("<PURPOSE>").join(Commands[keys[i]].purpose).split("<HELP>").join(Commands[keys[i]].help).split("<PERMS>").join((perms.length > 0) ? perms.join(", ") : "none")
								});
							}
						}
						
						channel.send({
							embed: embed
						}).then(function (message) {
							if (config["commands.help.channel"] === 0) {
								msg.channel.send(config["commands.help.channel.msg"].replace("<USER>", msg.author));
							}
						});
					} else {
						if (args[0] && Commands[args[0].toLowerCase()] !== undefined) {
							perms = Commands[args[0].toLowerCase()].perms;
							
							str = config["commands.help.format.single"].split("<PREFIX>").join(config["commands.exe.prefix"]).split("<COMMAND>").join(args[0].toLowerCase()).split("<SUFFIX>").join(config["commands.exe.suffix"]).split("<PURPOSE>").join(Commands[args[0].toLowerCase()].purpose).split("<HELP>").join(Commands[args[0].toLowerCase()].help).split("<PERMS>").join((perms.length > 0) ? perms.join(", ") : "none");

							bot.MSG("\n\n" + str, channel, msg.author);

							return;
						}
						// loops through all the commands
						for (i = 0; i < keys.length; i += 1) {
							perms = Commands[keys[i]].perms;
							
							str += config["commands.help.format.multiple"].split("<PREFIX>").join(config["commands.exe.prefix"]).split("<COMMAND>").join(keys[i].toLowerCase()).split("<SUFFIX>").join(config["commands.exe.suffix"]).split("<PURPOSE>").join(Commands[keys[i]].purpose).split("<HELP>").join(Commands[keys[i]].help).split("<PERMS>").join((perms.length > 0) ? perms.join(", ") : "none") + config["commands.help.join"];
						}
						
						bot.MSG("\n\n" + str, msg.channel, msg.author);
					}
				}
			};
		}
		
		if (config["commands.ping"]) {
			Commands[config["commands.ping.name"]] = {
				help: [],
				purpose: "Test bot speed",
				perms: [],
				guild: false,
				callback: function (msg, args) {
					var t1 = msg.createdAt, t2;
					
					if (config["commands.ping.client_ping"]) {
						msg.channel.send("Pong!\n\nAverage ping time: " + Math.round(Math.pow(10, config["commands.ping.decimals"]) * bot.ping) / Math.pow(10, config["commands.ping.decimals"]));
					} else {
						msg.channel.send("Pong!").then(function (msg) {
							t2 = msg.createdAt;

							msg.edit("Pong!\n\nTime to receive ping and send pong: " + (t2 - t1) + "ms");
						});
					}
					
				}
			};
		}
		
		
		if (config["commands.kill"]) {
			Commands[config["commands.kill.name"]] = {
				help: "<password>",
				purpose: "Crashes bot",
				perms: [],
				guild: false,
				callback: function (msg, args) {
					if ((config["commands.kill.password"] && args[0] === passwords.crash) || !config["commands.kill.password"]) {
						callbacks.crash(msg).then(function () {
							process.exit(0);
						}).catch(function (err) {
							this.MSG("Unable to crash bot: ```" + err + "```");
						});
					} else {
						callbacks.crashfail(msg);
					}
				}
			};
		}
		
		
		if (config["commands.account"]) {
			Commands[config["commands.account.name"]] = {
				help: "",
				purpose: "Access your account",
				perms: [],
				guild: true,
				callback: function (msg, args) {
					var guildID = msg.channel.guild.id, acc = servers[guildID].users[msg.author.id];
					if (args.length === 0) {
						bot.MSG("Your account information on _**" + msg.channel.guild.name + "**_n\n__**Permissions**__\n - **" + getPerms(msg.author.id, guildID).join("**\n - **") + "**", msg.author);
					}
				}
			};
		}
		
		
		if (config["commands.perms"]) {
			Commands[config["commands.perms.name"]] = {
				help: "add/remove/list <user>/DEFAULT (perm)",
				purpose: "Manage permissions on the server",
				perms: ["CAN_MANAGE_PERMISSIONS"],
				guild: true,
				callback: function (msg, args) {
					var method = args[0], user = args[1] || "", perm = args[2] || "", server = servers[msg.channel.guild.id], perms;

					user = user.replace("<", "").replace("!", "").replace("@", "").replace(">", "");

					if (server.users[user] === undefined && user !== "DEFAULT") {
						perm = args[1] || "";

						user = msg.author.id;
					}

					if (method === "list") {
						if (user !== "DEFAULT") {
							perms = getPerms(user, msg.channel.guild.id);
						} else {
							perms = server.defaultPerms;
						}

						if (user === "DEFAULT") {
							bot.MSG("Here are this server's default perms: ```JavaScript\n\"" + perms.join("\", \"") + "\"```", msg.channel, msg.author);
						} else {
							bot.MSG("Here are <@" + user + ">'s perms: ```JavaScript\n\"" + perms.join("\", \"") + "\"```", msg.channel, msg.author);
						}
					}

					if (method === "add") {
						perms = getPerms(msg.author.id, msg.channel.guild.id);

						if (perms.indexOf(perm) === -1 && perms.indexOf("OP") === -1) {
							bot.MSG("You can't add a permission that you don't have!", msg.channel, msg.author);

							return;
						}

						if (user !== "DEFAULT") {
							if (server.users[user].perms.indexOf(perm) === -1) {
								server.users[user].perms.push(perm);

								servers[msg.channel.guild.id] = server;

								bot.fetchUser(user).then(function (userObj) {
									updateAccount(userObj, msg.channel.guild.id);

									bot.MSG("Added permission ```JavaScript\n\"" + perm + "\"``` to <@" + user + ">", msg.channel, msg.author);
								}).catch(function (err) {
									throw new Error(err);
								});
							} else {
								bot.MSG("<@" + user + "> already has permission ```JavaScript\n\"" + perm + "\"```", msg.channel, msg.author);
							}
						} else {
							if (server.defaultPerms.indexOf(perm) === -1) {
								server.defaultPerms.push(perm);

								fs.writeFile("./Servers/" + msg.channel.guild.id + "/defaultPerms.txt", server.defaultPerms, function (err) {
									if (err) {
										callbacks.onerror(err);

										return;
									}

									bot.MSG("Permission ```JavaScript\n\"" + perm + "\"``` has been added to this server's default perms", msg.channel, msg.author);
								});
							} else {
								bot.MSG("This server's default perms already include ```JavaScript\n\"" + perm + "\"```", msg.channel, msg.author);
							}
						}
					}

					if (method === "remove") {
						perms = getPerms(msg.author.id, msg.channel.guild.id);

						if (perms.indexOf(perm) === -1 && perms.indexOf("OP") === -1) {
							bot.MSG("You can't remove a permission that you don't have!", msg.channel, msg.author);

							return;
						}


						if (user !== "DEFAULT") {
							perms = getPerms(user, msg.channel.guild.id);

							if (perms.indexOf(perm) > -1) {
								if (server.users[user].perms.indexOf(perm) > -1) {
									server.users[user].perms.splice(server.users[user].perms.indexOf(perm));
								} else {
									server.users[user].perms.push("~" + perm);
								}

								servers[msg.channel.guild.id] = server;

								bot.fetchUser(user).then(function (userObj) {
									updateAccount(userObj, msg.channel.guild.id);

									bot.MSG("Removed permission ```JavaScript\n\"" + perm + "\"``` from <@" + user + ">", msg.channel, msg.author);
								}).catch(function (err) {
									throw new Error(err);
								});

							} else {
								bot.MSG("<@" + user + "> doesn't have permission ```JavaScript\n\"" + perm + "\"```", msg.channel, msg.author);
							}
						} else {
							if (server.defaultPerms.indexOf(perm) > -1) {
								server.defaultPerms.splice(server.defaultPerms.indexOf(perm));

								fs.writeFile("./Servers/" + msg.channel.guild.id + "/defaultPerms.txt", server.defaultPerms, function (err) {
									if (err) {
										callbacks.onerror(err);

										return;
									}

									bot.MSG("Permission ```JavaScript\n\"" + perm + "\"``` has been removed from this server's default perms", msg.channel, msg.author);
								});
							} else {
								bot.MSG("This server's default perms don't have ```JavaScript\n\"" + perm + "\"```", msg.channel, msg.author);
							}
						}
					}
				}
			};
		}
	};
	
	callbacks = {
		crash: function (msg) {
			bot.info("Goodbye, cruel world");
			
			return new Promise(function (resolve, reject) {
				resolve();
			});
		},
		
		crashfail: function (msg) {
			bot.MSG("Wrong password", msg.channel, msg.author);
		},
		
		error: function (err) {
			bot.error(err);
		},
		onerror: function (err) {
			if (err) {
				callbacks.error(err);
			}
		},
		
		guildCreate: function (guild) {
			servers[guild.id] = {};
			
			fs.mkdir("/Servers/" + guild.id, function (err) {
				fs.stat("/Servers/" + guild.id + "/users.json", function (err, stat) {
					if (err) {
						if (err.code === "ENOENT") {
							fs.writeFile("/Servers/" + guild.id + "/users.json", "{}");
							servers[guild.id].users = {};
						} else {
							callbacks.onerror(err);
						}
					} else {
						fs.readFile("/Servers/" + guild.id + "/users.json", "utf8", function (err, content) {
							if (err) {
								callbacks.onerror(err);

								process.exit(0);
							}

							servers[guild.id].users = JSON.parse(content);
						});
					}
				});

				fs.stat("/Servers/" + guild.id + "/defaultPerms.txt", function (err, stat) {
					if (err) {
						if (err.code === "ENOENT") {
							fs.readFile(bot.user.id + "/defaultPerms.txt", "utf8", function (err, content) {
								if (err) {
									callbacks.onerror(err);

									return;
								}

								fs.writeFile("/Servers/" + guild.id + "/defaultPerms.txt", content);

								servers[guild.id].defaultPerms = content.split(",").join(" ").split(" ").join(" ").split(" ");
								while (servers[guild.id].defaultPerms.indexOf("") > -1) {
									servers[guild.id].defaultPerms.splice(servers[guild.id].defaultPerms.indexOf(""), 1);
								}
							});
						} else {
							callbacks.onerror(err);
						}
					} else {
						fs.readFile("/Servers/" + guild.id + "/defaultPerms.txt", "utf8", function (err, content) {
							if (err) {
								callbacks.onerror(err);

								process.exit(0);
							}

							servers[guild.id].defaultPerms = content.split(",").join(" ").split(" ").join(" ").split(" ");
							while (servers[guild.id].defaultPerms.indexOf("") > -1) {
								servers[guild.id].defaultPerms.splice(servers[guild.id].defaultPerms.indexOf(""), 1);
							}
						});
					}
				});

				fs.stat("/Servers/" + guild.id + "/serverInfo.json", function (err, stat) {
					if (err) {
						if (err.code === "ENOENT") {
							var info = {
								createdAt: guild.createdAt.toString(),
								iconURL: guild.iconURL
							};

							fs.writeFile("/Servers/" + guild.id + "/serverInfo.json", JSON.stringify(info, null, 4), function (err) {
								callbacks.onerror(err);
							});
						} else {
							callbacks.onerror(err);
						}
					}
				});
			});

			guild.defaultChannel.send(config["server.bot_join"].replace("<OWNER>", guild.owner));
		},
		
		customReady: function () {
			
		},
		ready: function () {
			bot.user.setGame("Discord | " + config["commands.exe.prefix"] + config["commands.help.name"] + config["commands.exe.suffix"]);
			
			var keys = Object.keys(passwords), i, proceed = new Promise(function (resolve, reject) {
				bot.info("Checking for /" + bot.user.id + "/ ...");
				
				fs.stat(bot.user.id, function (err, stat) {
					if (err && err.code !== "ENOENT") {
						bot.info("Unable to check for /" + bot.user.id);
						callbacks.onerror(err);
						resolve();
						
						return;
					}

					if (err && err.code === "ENOENT") {
						bot.info("Unable to find /" + bot.user.id + "/");

						bot.info("Creating /" + bot.user.id + "/");

						fs.mkdir(bot.user.id, function (err) {
							if (err) {
								bot.info("Unable to create /" + bot.user.id + "/");
								callbacks.onerror(err);
								resolve();
								
								return;
							}
							
							resolve();
						});
					}
					
					resolve();
				});
			});
			
			proceed.then(function () {
				var proceed2 = new Promise(function (resolve, reject) {
					bot.info("Checking for /Servers/");
					
					fs.stat("/Servers/", function (err, stat) {
						if (err && err.code !== "ENOENT") {
							bot.info("Unable to check for /" + bot.user.id);
							callbacks.onerror(err);
							resolve();
						}
						
						if (err && err.code === "ENOENT") {
							bot.info("Unable to find /Servers/");

							bot.info("Creating /Servers/...");

							fs.mkdir("/Servers/", function (err) {
								if (err) {
									bot.info("Unable to create /" + bot.user.id + "/");
									callbacks.onerror(err);
									resolve();

									return;
								}

								resolve();
							});
						}
						
						resolve();
					});
				});
				
				proceed2.then(function () {
					fs.readdir("/Servers/", function (err, files) {
						if (err) {
							callbacks.onerror(err);
							
							return;
						}
						
						var i, read = function (x) {
							return new Promise(function (RESOLVE, REJECT) {
								bot.info("Reading server " + x + "...");
								
								var proceed3 = new Promise(function (resolve, reject) {
									bot.info("Reading /Servers/" + x + "/users.json ...");

									fs.readFile("/Servers/" + x + "/users.json", function (err, content) {
										if (err && err.code !== "ENOENT") {
											bot.info("Unable to read /Servers/" + x + "/users.json ...");
											callbacks.onerror(err);
											resolve();

											return;
										}

										if (err && err.code === "ENOENT") {
											bot.info("Unable to find /Servers/" + x + "/users.json");

											bot.info("Writing /Servers/" + x + "/users.json ...");
											fs.writeFile("/Servers/" + x + "/users.json", "{}", function (err) {
												if (err) {
													bot.info("Unable to write /Servers/" + x + "/users.json");
													callbacks.onerror(err);
													resolve();

													return;
												}

												bot.info("Successfully wrote Servers/" + x + "/users.json");
											});

											servers[x].users = {};

											return;
										}
										
										try {
											bot.info("Successfully stored user data for server " + x);
											servers[x].users = JSON.parse(content);

											resolve();
										} catch (e) {
											bot.info("Error parsing /Servers/" + x + "/users.json, defaulting user data...");
											fs.writeFile("/Servers/" + x + "/users.json", "{}", function (err) {
												if (err) {
													bot.info("Unable to write /Servers/" + x + "/users.json");
													callbacks.onerror(err);
													resolve();

													return;
												}

												bot.info("Successfully defaulted /Servers/" + x + "/users.json");

												resolve();
											});

											servers[x].users = {};
										}
									});
								});

								proceed3.then(function () {
									var proceed4 = new Promise(function (resolve, reject) {
										bot.info("Reading /Servers/" + x + "/defaultPerms.txt...");

										fs.readFile("/Servers/" + x + "/defaultPerms.txt", function (err, content) {
											if (err && err.code !== "ENOENT") {
												bot.info("Unable to read /Servers/" + x + "/defaultPerms.txt");
												callbacks.onerror(err);
												resolve();

												return;
											}
											
											if (err && err.code === "ENOENT") {
												bot.info("Unable to find /Servers/" + x + "/defaultPerms.txt");
												
												bot.info("Reading /" + bot.user.id + "/defaultPerms.txt ...");
												
												fs.readFile(bot.user.id + "/defaultPerms.txt", "utf8", function (err, content2) {
													if (err && err.code !== "ENOENT") {
														bot.info("Unable to read /" + bot.user.id + "/defaultPerms.txt");
														callbacks.onerror(err);
														resolve();

														return;
													}
													
													if (err && err.code === "ENOENT") {
														bot.info("Unable to find /" + bot.user.id + "/defaultPerms.txt, defaulting it...");
														
														content2 = "CAN_USE_BOT_COMMANDS, CAN_HAVE_SECURE_ACCOUNT_1";
														
														fs.writeFile(bot.user.id + "/defaultPerms.txt", content, function (err) {
															if (err) {
																bot.info("Unable to write /" + bot.user.id + "/defaultPerms.txt");
																callbacks.onerror(err);
																resolve();
																
																return;
															}
															
															bot.info("Successfully defaulted /" + bot.user.id + "/defaultPerms.txt");
														});
														
													}
													
													content = content2;
													
													bot.info("Writing /Servers/" + x + "/defaultPerms.txt ...");
													
													fs.writeFile("/Servers/" + x + "/defaultPerms.txt", function (err) {
														if (err) {
															bot.info("Unable to write /Servers/" + x + "/defaultPerms.txt");
															callbacks.onerror(err);
															resolve();
															
															return;
														}
														
														bot.info("Successfully wrote /Servers/" + x + "/defaultPerms.txt ...");
													});
												});
											}

											content = String(content);
											servers[x].defaultPerms = content.split(",").join(" ").split(" ").join(" ").split(" ");
											while (servers[x].defaultPerms.indexOf("") > -1) {
												servers[x].defaultPerms.splice(servers[x].defaultPerms.indexOf(""), 1);
											}
											
											resolve();
										});
									});
									
									proceed4.then(function () {
										RESOLVE();
									});
								});
							});
						};
						
						function next(i) {
							var promise;
							
							if (i === files.length) {
								bot.info("Checking for /" + bot.user.id + "/defaultPerms.txt ...");
								
								promise = new Promise(function (resolve, reject) {
									fs.stat(bot.user.id + "/defaultPerms.txt", function (err, stat) {
										if (err) {
											if (err.code === "ENOENT") {
												bot.info("Unable to find /" + bot.user.id + "/defaultPerms.txt ...");
												bot.info("Defaulting /" + bot.user.id + "/defaultPerms.txt ...");
												fs.writeFile(bot.user.id + "/defaultPerms.txt", "CAN_USE_BOT_COMMANDS, CAN_HAVE_SECURE_ACCOUNT_1", function (err) {
													if (err) {
														bot.info("Unable to write /" + bot.user.id + "/defaultPerms.txt");
														callbacks.onerror(err);
														resolve();
														
														return;
													}
												});
											} else {
												bot.info("Unable to check /" + bot.user.id + "/defaultPerms.txt");
												callbacks.onerror(err);
												resolve();
											}
										}
										
										bot.info("Found /" + bot.user.id + "/defaultPerms.txt");
										
										resolve();
									});
								});
								
								promise.then(function () {
									var proceed5 = new Promise(function (resolve, reject) {
										bot.info("Checking for /" + bot.user.id + "/README.txt ...");
										
										fs.stat(bot.user.id + "/README.txt", function (err, stat) {
											if (err) {
												if (err.code === "ENOENT") {
													bot.info("Unable to find /" + bot.user.id + "/README.txt ...");
													bot.info("Defaulting /" + bot.user.id + "/README.txt ...");
													
													fs.writeFile(bot.user.id + "/README.txt", "This directory has essential files that if edited incorrectly could cause your bot to malfunction. Please only edit these files if you know what you are doing. ~ HenryTurkeyBrain", function (err) {
														if (err) {
															bot.info("Unable to write /" + bot.user.id + "/README.txt");
															callbacks.onerror(err);
															resolve();

															return;
														}
													});
												} else {
													bot.info("Unable to check /" + bot.user.id + "/README.txt");
													callbacks.onerror(err);
													resolve();
												}
											}
											
											bot.info("Found /" + bot.user.id + "/README.txt");
											
											resolve();
										});
									});
									
									proceed5.then(function () {
										bot.info("\n\n\n\n\n");
										bot.info("MASTER PASSWORD : " + masterPassword);
										bot.info(" * MASTER PASSWORD generates other passwords, keep this super secret.");
										bot.info(" * Keep your bot's token secret. Given the token and MASTER PASSWORD, you can find any other passwords.");
										bot.info(" * MASTER PASSWORD does not work as a substitute for other passwords, it just generates them.");
										bot.info(" * Given a password, you cannot find MASTER PASSWORD or any other passwords.");

										fs.readFile("./version.json", "utf8", function (err, content) {
											if (err && err.code !== "ENOENT") {
												callbacks.onerror(err);
												process.exit(0);
												return;
											}

											if (err && err.code === "ENOENT") {
												fs.writeFile("./version.json", JSON.stringify(version, null, 4), function (err) {
													if (err) {
														callbacks.onerror(err);
														process.exit(0);
														return;
													}
												});

												return;
											}

											var version2 = JSON.parse(content);

											if (version2["discord-js"] !== version["discord-js"]) {
												bot.warn("botDev.js v" + version["discord-js"] + "." + version["botDev.js"] + " is uncompatible with discord-js v" + version["discord-js"]);

												return;
											}

											if (version2["botDev.js"] !== version["botDev.js"]) {
												bot.warn("Code for botDev.js v" + version2["botDev.js"] + " may be uncompatible with code for botDev.js v" + version["botDev.js"] + ". Please update your code if your console says so.");

												version2["botDev.js"] = version["botDev.js"];

												fs.writeFile("./version.json", JSON.stringify(version2, null, 4), function (err) {
													if (err) {
														callbacks.onerror(err);
														process.exit(0);
														return;
													}
												});
											}
										});

										for (i = 0; i < keys.length; i += 1) {
											bot.info(keys[i].toUpperCase() + " PASSWORD : " + passwords[keys[i]]);
										}

										callbacks.customReady();

										if (config.webconsole) {
											if (config["webconsole.port"] === -1) {
												port = hash(token + bot.id, config["password.hash"], config["password.encoding"]);
												
												port = port.split("").map(function (char) {
													return config["webconsole.port.hash.add"] + char.charCodeAt(0);
												}).reduce(function (sum, val) {
													return (sum + val) % (config["webconsole.port.max"] - config["webconsole.port.min"]);
												}, 0) + config["webconsole.port.min"];
											} else {
												port = config["webconsole.port"];
											}
											
											server = app.listen(port);

											socketio = require("socket.io");
											io = socketio.listen(server);

											app.get("*", function (req, res) {
												res.sendFile(__dirname + "/console.html");
											});

											io.sockets.on("connection", function (socket) {
												socket.emit("title", bot.user.username + " - botDev Web Console");
												socket.emit("icon", "https://cdn.discordapp.com/avatars/" + bot.user.id + "/" + bot.user.avatar + ".png?size=16");
												socket.emit("list", bot.console.lists);
												var uptime = bot.uptime, d, h, m, s, ms;
												d = Math.floor(uptime / 86400000);
												h = Math.floor((uptime - 86400000 * d) / 3600000);
												m = Math.floor((uptime - 86400000 * d - 3600000 * h) / 60000);
												s = Math.floor((uptime - 86400000 * d - 3600000 * h - 60000 * m) / 1000);
												ms = (uptime - 86400000 * d - 3600000 * h - 60000 * m) % 1000;

												socket.emit("data", {
													avatar: "<img src=\"https://cdn.discordapp.com/avatars/" + bot.user.id + "/" + bot.user.avatar + ".png?size=64\">",
													name: bot.user.tag,
													id: bot.user.id,
													users: bot.users.size,
													ping: Math.round(bot.ping * 100) / 100 + "ms",
													token: bot.token,
													uptime: bot.uptime + "ms; " + d + " day" + ((d === 1) ? "" : "s") + ", " + h + " hour" + ((h === 1) ? "" : "s") + ", " + m + " minute" + ((m === 1) ? "" : "s") + ", " + s + " second" + ((s === 1) ? "" : "s") + ", " + ms + " millisecond" + ((ms === 1) ? "" : "s"),
													game: bot.user.presence.game.name,
													status: bot.user.presence.status
												});

												socket.on("stop", function () {
													process.exit(0);
												});

												socket.on("beep", function () {
													var uptime = bot.uptime, d, h, m, s, ms;
													d = Math.floor(uptime / 86400000);
													h = Math.floor((uptime - 86400000 * d) / 3600000);
													m = Math.floor((uptime - 86400000 * d - 3600000 * h) / 60000);
													s = Math.floor((uptime - 86400000 * d - 3600000 * h - 60000 * m) / 1000);
													ms = (uptime - 86400000 * d - 3600000 * h - 60000 * m) % 1000;
													socket.emit("boop", {
														users: bot.users.size,
														ping: Math.round(bot.ping * 100) / 100 + "ms",
														uptime: bot.uptime + "ms; " + d + " day" + ((d === 1) ? "" : "s") + ", " + h + " hour" + ((h === 1) ? "" : "s") + ", " + m + " minute" + ((m === 1) ? "" : "s") + ", " + s + " second" + ((s === 1) ? "" : "s") + ", " + ms + " millisecond" + ((ms === 1) ? "" : "s"),
														game: bot.user.presence.game.name,
														status: bot.user.presence.status
													});

													socket.emit("list", bot.console.lists);
												});
											});

											console.log("Web console: http://localhost:" + port);
										}
									});
								});
								
								
								
								return;
							}
							
							servers[files[i]] = {};
							promise = read(files[i]);
							promise.then(function () {
								next(i + 1);
							});
						}
						
						next(0);
					});
				});
			});
		},
		
		customMessage: function () {
			
		},
		message: function (msg) {
			var args = msg.content.split(" "), command, perms, i, perm, s = true, missingPerms = [];
			
			
			
			if (msg.channel.guild) {
				if (servers[msg.channel.guild.id] === undefined) {
					callbacks.guildCreate(msg.channel.guild);
					
					return;
				}
				
				updateAccount(msg.author, msg.channel.guild.id);

				perms = getPerms(msg.author.id, msg.channel.guild.id);

				if (msg.author.id === msg.channel.guild.owner.id || msg.author.id === config.owner) {
					if (perms.indexOf("OP") === -1) {
						perms.push("OP");

						servers[msg.channel.guild.id].users[msg.author.id].perms.push("OP");
					}
				}
			}

			// check prefix and suffix
			if (args[0].startsWith(config["commands.exe.prefix"]) && args[0].endsWith(config["commands.exe.suffix"])) {
				command = args.shift();
				command = command.replace(config["commands.exe.prefix"], "").replace(config["commands.exe.suffix"], "");
				
				if (Commands[command.toLowerCase()] !== undefined) {
					bot.command(msg.author.username + "#" + msg.author.discriminator + " issued " + msg.content);

					// only check for perms if its a guild
					if (msg.channel.guild) {
						if (perms.indexOf("OP") === -1) {
							for (i = 0; i < Commands[command.toLowerCase()].perms.length; i += 1) {
								perm = Commands[command.toLowerCase()].perms[i];
								if (perms.indexOf(perm) === -1) {
									s = false;
									missingPerms.push(perm);
								}
							}

							if (perms.indexOf("CAN_USE_BOT_COMMANDS") === -1) {
								s = false;
								missingPerms.push("CAN_USE_BOT_COMMANDS");
							}
						}
					}

					if (s) {
						if (msg.channel.guild) {
							if (queue[msg.channel.guild.id] === undefined) {
								queue[msg.channel.guild.id] = [];

								setInterval(function () {
									if (queue[msg.channel.guild.id].length > 0) {
										var c = queue[msg.channel.guild.id].shift();

										try {
											c.callback(c.msg, c.args, bot);
										} catch (e) {
											bot.MSG("An error occured :(\n\n``" + e + "``", c.msg.channel, c.msg.author);
											callbacks.onerror(e);
										}
									}
								}, 200);
							}
							
							if (command.toLowerCase() !== "ping") {
								if (queue[msg.channel.guild.id].length < 5) {
									queue[msg.channel.guild.id].push({
										callback: Commands[command.toLowerCase()].callback,
										msg: msg,
										args: args
									});
								} else {
									bot.MSG("Maximum command queue length exceeded. Please wait until I finish running other queued commands.", msg.channel, msg.author);
								}
							} else {
								Commands[command.toLowerCase()].callback(msg, args, bot);
							}
						} else {
							if (!Commands[command.toLowerCase()].guild || Commands[command.toLowerCase()].guild === undefined) {
								try {
									Commands[command.toLowerCase()].callback(msg, args, bot);
								} catch (e) {
									bot.MSG("An error occured :(\n\n``" + e + "``", msg.channel, msg.author);
									callbacks.onerror(e);
								}
							} else {
								bot.MSG("This command can only be used in servers.", msg.channel, msg.author);
							}
						}
					} else {
						bot.MSG("You may not run this command because you are missing the following permission(s):\n\n```JavaScript\n\"" + missingPerms.join("\", \"") + "\"```", msg.channel, msg.author);
					}
				}

			}


			if (msg.author.bot) {
				return;
			}

			callbacks.customMessage(msg);
		},
		
		delet: function () {
			
		},
		
		edit: function () {
			
		},
		
		guildMemberAdd: function () {
			
		},
		
		guildMemberRemove: function () {
			
		}
	};
	
	this.bot = function () {
		return bot;
	};
	
	bot.on("guildCreate", function (guild) {
		callbacks.guildCreate(guild);
	});
	
	bot.on("ready", function () {
		callbacks.ready();
	});
	
	bot.on("message", function (msg) {
		callbacks.message(msg);
	});
	
	bot.on("messageDelete", function (msg) {
		callbacks.delet(msg);
	});
	
	bot.on("messageDeleteBulk", function (msgs) {
		var keys = msgs.keyArray(), i, msg;
		for (i = 0; i < keys.length; i += 1) {
			msg = msgs.get(keys[i]);
			callbacks.delet(msg);
		}
	});
	
	bot.on("guildMemberAdd", function (member) {
		callbacks.guildMemberAdd(member);
	});
	
	bot.on("guildMemberRemove", function (member) {
		callbacks.guildMemberRemove(member);
	});
	
	
	this.on = function (str, callback) {
		if (str === "ready") {
			callbacks.customReady = callback;
			
			return;
		}
		
		if (str === "message") {
			callbacks.customMessage = callback;
			
			return;
		}
		
		if (str === "delete") {
			callbacks.delet = callback;
		}
		
		if (str === "edit") {
			bot.on("messageUpdate", function (o, n) {
				callback(o, n);
			});
			
			return;
		}
		
		if (str === "join") {
			callbacks.guildMemberAdd = callback;
			
			return;
		}
		
		if (str === "leave") {
			callbacks.guildMemberRemove = callback;
			
			return;
		}
		
		if (str === "crash") {
			callbacks.crash = callback;
			
			return;
		}
		
		if (str === "crashFail") {
			callbacks.crashFail = callbacks;
			
			return;
		}
		
		if (str === "error") {
			callbacks.error = callback;
			
			return;
		}
		
		bot.on(str, function (a, b, c, d, e, f) {
			callback(a, b, c, d, e, f);
		});
	};
	
	
	bot.authorize = function () {
		auth.msg.status = true;
	};
	
	this.authorize = bot.authorize;
	
	
	
	
	
	this.getUserByID = function (id) {
		return bot.fetchUser(id);
	};
	
	this.setGame = function (game) {
		bot.user.setGame(game);
	};
	
	this.MSG = function (txt, channel, author) {
		bot.authorize();
		
		if (author === undefined) {
			author = "";
		} else {
			author += ", ";
		}
		
		return channel.send(author + txt);
	};
	
	bot.MSG = this.MSG;
	
	bot.error = function (error) {
		if (config.webconsole) {
			bot.console.error(error);
		} else {
			console.log("X " + error);
		}
	};
	
	bot.info = function (info) {
		if (config.webconsole) {
			bot.console.info(info);
		} else {
			console.log("* " + info);
		}
	};
	
	bot.warn = function (warn) {
		if (config.webconsole) {
			bot.console.warn(warn);
		} else {
			console.log("! " + warn);
		}
	};
	
	bot.command = function (command) {
		if (config.webconsole) {
			bot.console.command(command);
		} else {
			console.log("- " + command);
		}
	};
	
	bot.fs = {
		read: {
			start: function (file) {
				bot.info(config["log.read"].replace("<FILE", file));
			},
			enoent: function (file) {
				bot.info(config["log.read.enoent"].replace("<FILE", file));
			},
			error: function (file) {
				bot.info(config["log.read.error"].replace("<FILE", file));
			},
			success: function (file) {
				bot.info(config["log.read.success"].replace("<FILE", file));
			}
		},
		write: {
			start: function (file) {
				bot.info(config["log.write"].replace("<FILE", file));
			},
			error: function (file) {
				bot.info(config["log.write.error"].replace("<FILE", file));
			},
			success: function (file) {
				bot.info(config["log.write.success"].replace("<FILE", file));
			}
		},
		check: {
			start: function (file) {
				bot.info(config["log.check"].replace("<FILE", file));
			},
			enoent: function (file) {
				bot.info(config["log.check.enoent"].replace("<FILE", file));
			},
			error: function (file) {
				bot.info(config["log.check.error"].replace("<FILE", file));
			},
			success: function (file) {
				bot.info(config["log.check.success"].replace("<FILE", file));
			}
		}
	};
	
	bot.console = {
		lists: {
			errors: [],
			info: [],
			warnings: [],
			commands: []
		},
		error: function (error) {
			if (io) {
				io.sockets.emit("error", error);
			}
			bot.console.lists.errors.push(error);
		},
		info: function (info) {
			if (io) {
				io.sockets.emit("info", info);
			}
			bot.console.lists.info.push(info);
		},
		warn: function (warning) {
			if (io) {
				io.sockets.emit("warn", warning);
			}
			bot.console.lists.warnings.push(warning);
		},
		command: function (command) {
			if (io) {
				io.sockets.emit("command", command);
			}
			bot.console.lists.commands.push(command);
		}
	};
	
	bot.login(token);
	
	
	// Deprecated functions
	
	this.crash = function () {
		bot.error("bot.crash(function () { ... }) is deprecated. Please use bot.on(\"crash\", function () { ... })");
	};
	
	this.crashFail = function () {
		bot.error("bot.crashFail(function () { ... }) is deprecated. Please use bot.on(\"crashFail\", function () { ... })");
	};
	
	this.prefixSuffix = function () {
		bot.error("bot.prefixSuffix(PREFIX, SUFFIX) is deprecated. Please put this in the options: prefix: PREFIX, suffix: SUFFIX");
	};
	
	this.onerror = function (error) {
		bot.error("bot.onerror() is deprecated. lease use bot.on(\"error\", function () { ... })");
	};
}

module.exports = Bot;