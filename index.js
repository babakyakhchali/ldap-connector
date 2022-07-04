const ldap = require("ldapjs")

// const createClientN = url =>
//   new Promise((resolve, reject) => {
//     const client = ldap.createClient({
//       url,
//       timeout: 1000,
//       connectTimeout: 1000,
//     });
//     client.once('error', (e) => {
//       reject(e);
//     });
//     client.on('connect', () => {
//       resolve(client);
//     });
//   });

const createClient = function (u, errCb) {
	let client = ldap.createClient({
		url: u,
		timeout: 3000,
		connectTimeout: 3000
	});
	client.on('error', e => {
		errCb(e);
	});
	return client;
};


const search = module.exports.search = function (opts) {
	const sopts = {
		scope: 'sub',
		filter: opts.filter
	}
	if(opts.attributes){
		sopts.attributes = opts.attributes
	}
	return new Promise((resolve, reject) => {
		let client = createClient(opts.url, e => reject(e));
		client.bind(opts.bindDN, opts.bindCredentials, e => {
			if (e) {
				reject(e);
			} else {
				client.search(opts.base,sopts, function (err, res) {
					if (err) {
						reject(err);
					} else {
						var r = [];
						res.on('searchEntry', function (entry) {
							if (opts.json == true) {
								r.push(entry.json);
							} else {
								r.push(entry);
							}

						});

						res.on('error', function (err) {
							reject(err);
							client.unbind();
						});

						res.on('end', function (result) {
							resolve(r);
							client.unbind();
						});
					}
				});
			}
		});
	});
}

const findUsers = module.exports.findUsers = function  (opts) {
	let filter = '(&(objectClass=user)(!(objectClass=computer)))';
	if (opts.active == true) {
		filter = '(&(objectClass=user)(!(objectClass=computer))(!(userAccountControl:1.2.840.113556.1.4.803:=2)))';
	}
	if (opts.f) {
		filter = '(&' + filter + '(' + opts.f + '))';
	}
	opts.filter = filter;
	return search({...opts,		
		attributes: ['distinguishedName','sAMAccountName','userPrincipalName','memberOf','displayName']
	})
};

const findGroups = module.exports.findGroups = function (opts) {
	let filter = '(&(objectClass=group)(!(objectClass=computer)))';
	if (opts.f) {
		filter = '(&' + filter + '(' + opts.f + '))';
	}
	return search({
		json:opts.json,
		url,bindCredentials,bindDN,filter,
		attributes: ['distinguishedName','sAMAccountName','userPrincipalName','memberOf','member','description']
	})
};

const auth = module.exports.auth = function (usr, pas, cb) {
	return new Promise((resolve, reject) => {
		let client = createClient(e => reject(e));
		client.bind(usr, pas, function (err) {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});

};

const formatGuid =  module.exports.formatGuid = function (data) {
	let format = '{3}{2}{1}{0}-{5}{4}-{7}{6}-{8}{9}-{10}{11}{12}{13}{14}{15}';
	for (var i = 0; i < data.length; i++) {
		let tt = +data[i];
		var re = new RegExp('\\{' + i + '\\}', 'g');
		// Leading 0 is needed if value of data[i] is less than 16 (of 10 as hex). 
		var dataStr = data[i].toString(16);
		format = format.replace(re, data[i] >= 16 ? dataStr : '0' + dataStr);
	}
	return format;
}


