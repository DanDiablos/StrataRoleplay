let faker;

const pick = (values) => values[Math.floor(Math.random() * values.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randHex = (len) => Array.from({ length: len }, () => pick('0123456789abcdef')).join('');
const randAlpha = (len) => Array.from({ length: len }, () => pick('abcdefghijklmnopqrstuvwxyz')).join('');
const randAlnum = (len) => Array.from({ length: len }, () => pick('abcdefghijklmnopqrstuvwxyz0123456789')).join('');

try {
	// Keep support for local dependency installs when available.
	({ faker } = require('@faker-js/faker'));
} catch (error) {
	const firstNames = ['James', 'Olivia', 'Noah', 'Emma', 'Liam', 'Ava', 'Mason', 'Sophia'];
	const lastNames = ['Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Davis', 'Miller', 'Wilson'];
	const jobs = ['Mechanic', 'Paramedic', 'Developer', 'Dispatcher', 'Bartender', 'Engineer'];
	const companies = ['Summit Logistics', 'Blue River Group', 'Harbor Works', 'Northline Systems'];
	const cities = ['Los Santos', 'Sandy Shores', 'Paleto Bay', 'Vespucci'];
	const states = ['San Andreas', 'New Austin', 'Liberty'];
	const streets = ['Power St', 'Alta Pl', 'Integrity Way', 'Vinewood Blvd', 'Innocence Blvd'];

	faker = {
		internet: {
			color: () => `#${randHex(6)}`,
			email: () => `${randAlpha(7)}@${pick(['example.com', 'mail.net', 'test.org'])}`,
			avatar: () => `https://api.dicebear.com/7.x/identicon/svg?seed=${randAlnum(12)}`,
			domainName: () => `${randAlpha(8)}.${pick(['com', 'net', 'org'])}`,
			ip: () => `${randInt(1, 254)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`,
			ipv6: () => `${randHex(4)}:${randHex(4)}:${randHex(4)}:${randHex(4)}:${randHex(4)}:${randHex(4)}:${randHex(4)}:${randHex(4)}`,
			mac: () => `${randHex(2)}:${randHex(2)}:${randHex(2)}:${randHex(2)}:${randHex(2)}:${randHex(2)}`,
		},
		person: {
			firstName: () => pick(firstNames),
			lastName: () => pick(lastNames),
			middleName: () => pick(firstNames),
			jobTitle: () => pick(jobs),
		},
		company: {
			name: () => pick(companies),
		},
		location: {
			city: () => pick(cities),
			state: () => pick(states),
			streetAddress: () => `${randInt(10, 9999)} ${pick(streets)}`,
			secondaryAddress: () => `Apt ${randInt(1, 99)}`,
		},
		finance: {
			accountNumber: () => `${randInt(10000000, 99999999)}`,
			creditCardNumber: () => `${randInt(1000, 9999)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}-${randInt(1000, 9999)}`,
			bitcoinAddress: () => `bc1${randAlnum(30)}`,
		},
		date: {
			past: () => new Date(Date.now() - randInt(1, 365) * 24 * 60 * 60 * 1000),
			future: () => new Date(Date.now() + randInt(1, 365) * 24 * 60 * 60 * 1000),
			recent: () => new Date(Date.now() - randInt(1, 72) * 60 * 60 * 1000),
			soon: () => new Date(Date.now() + randInt(1, 72) * 60 * 60 * 1000),
		},
		phone: {
			phoneNumber: () => `${randInt(200, 999)}-${randInt(200, 999)}-${randInt(1000, 9999)}`,
		},
		vehicle: {
			vehicle: () => `${pick(['Bravado', 'Karin', 'Vapid', 'Albany'])} ${pick(['Buffalo', 'Sultan', 'Stanier', 'Baller'])}`,
			manufacturer: () => pick(['Bravado', 'Karin', 'Vapid', 'Albany']),
			model: () => pick(['Buffalo', 'Sultan', 'Stanier', 'Baller']),
			color: () => pick(['Black', 'White', 'Red', 'Blue', 'Silver', 'Green']),
			vin: () => randAlnum(17).toUpperCase(),
			vrm: () => `${randAlpha(3).toUpperCase()}${randInt(100, 999)}`,
		},
		datatype: {
			number: () => randInt(0, 999999),
			float: () => Math.random() * 1000,
			string: () => randAlnum(12),
			uuid: () => `${randHex(8)}-${randHex(4)}-${randHex(4)}-${randHex(4)}-${randHex(12)}`,
		},
		image: {
			image: () => `https://picsum.photos/seed/${randAlnum(10)}/640/480`,
			avatar: () => `https://api.dicebear.com/7.x/identicon/svg?seed=${randAlnum(12)}`,
		},
		hacker: {
			abbreviation: () => pick(['HTTP', 'SSL', 'TCP', 'API', 'JSON']),
			adjective: () => pick(['virtual', 'wireless', 'cross-platform', 'digital']),
			noun: () => pick(['protocol', 'bus', 'firewall', 'driver']),
			verb: () => pick(['hack', 'compress', 'connect', 'transmit']),
			ingverb: () => pick(['hacking', 'compressing', 'connecting', 'transmitting']),
		},
		word: {
			adjective: () => pick(['quick', 'silent', 'agile', 'stable']),
			adverb: () => pick(['quickly', 'silently', 'smoothly', 'safely']),
			noun: () => pick(['signal', 'matrix', 'vector', 'engine']),
			verb: () => pick(['move', 'build', 'run', 'merge']),
		},
	};
}

exports('GeneratorColor', (t) => {
	return faker.internet.color();
});

exports('GeneratorNameFirst', (t) => {
	return faker.person.firstName();
});

exports('GeneratorNameLast', (t) => {
	return faker.person.lastName();
});

exports('GeneratorNameMiddle', (t) => {
	return faker.person.middleName();
});

exports('GeneratorJob', (t) => {
	return faker.person.jobTitle();
});

exports('GeneratorCompany', (t) => {
	return faker.company.name();
});

exports('GeneratorAddressCity', (t) => {
	return faker.location.city();
});

exports('GeneratorAddressState', (t) => {
	return faker.location.state();
});

exports('GeneratorAddressStreet', (t) => {
	return faker.location.streetAddress();
});

exports('GeneratorAddressStreetSecondary', (t) => {
	return faker.location.secondaryAddress();
});

exports('GeneratorFinanceAccount', (t) => {
	return faker.finance.accountNumber();
});

exports('GeneratorFinanceCreditCard', (t) => {
	return faker.finance.creditCardNumber();
});

exports('GeneratorFinanceCryptoAddress', (t) => {
	return faker.finance.bitcoinAddress();
});

exports('GeneratorInternetEmail', (t) => {
	return faker.internet.email();
});

exports('GeneratorInternetAvatar', (t) => {
	return faker.internet.avatar();
});

exports('GeneratorInternetDomain', (t) => {
	return faker.internet.domainName();
});

exports('GeneratorInternetIP', (t) => {
	return faker.internet.ip();
});

exports('GeneratorInternetIPv6', (t) => {
	return faker.internet.ipv6();
});

exports('GeneratorInternetMacAddress', (t) => {
	return faker.internet.mac();
});

exports('GeneratorDatePast', (t) => {
	return faker.date.past();
});

exports('GeneratorDateFuture', (t) => {
	return faker.date.future();
});

exports('GeneratorDateRecent', (t) => {
	return faker.date.recent();
});

exports('GeneratorDateSoon', (t) => {
	return faker.date.soon();
});

exports('GeneratorPhone', (t) => {
	return faker.phone.phoneNumber();
});

exports('GeneratorVehicleMakeModel', (t) => {
	return faker.vehicle.vehicle();
});

exports('GeneratorVehicleMake', (t) => {
	return faker.vehicle.manufacturer();
});

exports('GeneratorVehicleModel', (t) => {
	return faker.vehicle.model();
});

exports('GeneratorVehicleColor', (t) => {
	return faker.vehicle.color();
});

exports('GeneratorVehicleVIN', (t) => {
	return faker.vehicle.vin();
});

exports('GeneratorVehiclePlate', (t) => {
	return faker.vehicle.vrm();
});

exports('GeneratorDataNumber', (t) => {
	return faker.datatype.number();
});

exports('GeneratorDataFloat', (t) => {
	return faker.datatype.float();
});

exports('GeneratorDataString', (t) => {
	return faker.datatype.string();
});

exports('GeneratorDataUUID', (t) => {
	return faker.datatype.uuid();
});

exports('GeneratorImageImage', (t) => {
	return faker.image.image();
});

exports('GeneratorImageAvatar', (t) => {
	return faker.image.avatar();
});

exports('GeneratorHackerAbbreviation', (t) => {
	return faker.hacker.abbreviation();
});

exports('GeneratorHackerAdjective', (t) => {
	return faker.hacker.adjective();
});

exports('GeneratorHackerNoun', (t) => {
	return faker.hacker.noun();
});

exports('GeneratorHackerVerb', (t) => {
	return faker.hacker.verb();
});

exports('GeneratorHackerIngVerb', (t) => {
	return faker.hacker.ingverb();
});

exports('GeneratorWordAdjective', (t) => {
	return faker.word.adjective();
});

exports('GeneratorWordAdverb', (t) => {
	return faker.word.adverb();
});

exports('GeneratorWordNoun', (t) => {
	return faker.word.noun();
});

exports('GeneratorWordVerb', (t) => {
	return faker.word.verb();
});
