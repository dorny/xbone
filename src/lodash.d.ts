export = lodash


declare var lodash : {

	// new (value) => : typeof lodash;

	// Arrays
	compact: (...any) => any;
	difference: (...any) => any;
	drop: (...any) => any;
	findIndex: (...any) => any;
	findLastIndex: (...any) => any;
	first: (...any) => any;
	flatten: (...any) => any;
	head: (...any) => any;
	indexOf: (...any) => any;
	initial: (...any) => any;
	intersection: (...any) => any;
	last: (...any) => any;
	lastIndexOf: (...any) => any;
	object: (...any) => any;
	pull: (...any) => any;
	range: (...any) => any;
	remove: (...any) => any;
	rest: (...any) => any;
	sortedIndex: (...any) => any;
	tail: (...any) => any;
	take: (...any) => any;
	union: (...any) => any;
	uniq: (...any) => any;
	unique: (...any) => any;
	unzip: (...any) => any;
	without: (...any) => any;
	zip: (...any) => any;
	zipObject: (...any) => any;

	// Chaining
	// chain: (...any) => any;
	// tap: (...any) => any;
	// prototype.chain: (...any) => any;
	// prototype.toString: (...any) => any;
	// prototype.value: (...any) => any;
	// prototype.valueOf: (...any) => any;

	// Collections
	all: (...any) => any;
	any: (...any) => any;
	at: (...any) => any;
	collect: (...any) => any;
	contains: (...any) => any;
	countBy: (...any) => any;
	detect: (...any) => any;
	each: (...any) => any;
	eachRight: (...any) => any;
	every: (...any) => any;
	filter: (...any) => any;
	find: (...any) => any;
	findLast: (...any) => any;
	findWhere: (...any) => any;
	foldl: (...any) => any;
	foldr: (...any) => any;
	forEach: (...any) => any;
	forEachRight: (...any) => any;
	groupBy: (...any) => any;
	include: (...any) => any;
	indexBy: (...any) => any;
	inject: (...any) => any;
	invoke: (...any) => any;
	map: (...any) => any;
	max: (...any) => any;
	min: (...any) => any;
	pluck: (...any) => any;
	reduce: (...any) => any;
	reduceRight: (...any) => any;
	reject: (...any) => any;
	sample: (...any) => any;
	select: (...any) => any;
	shuffle: (...any) => any;
	size: (...any) => any;
	some: (...any) => any;
	sortBy: (...any) => any;
	toArray: (...any) => any;
	where: (...any) => any;

	// Functions
	after: (...any) => any;
	bind: (...any) => any;
	bindAll: (...any) => any;
	bindKey: (...any) => any;
	compose: (...any) => any;
	createCallback: (...any) => any;
	curry: (...any) => any;
	debounce: (...any) => any;
	defer: (...any) => any;
	delay: (...any) => any;
	memoize: (...any) => any;
	once: (...any) => any;
	partial: (...any) => any;
	partialRight: (...any) => any;
	throttle: (...any) => any;
	wrap: (...any) => any;

	// Objects
	assign: (...any) => any;
	clone: (...any) => any;
	cloneDeep: (...any) => any;
	defaults: (...any) => any;
	extend: (...any) => any;
	findKey: (...any) => any;
	findLastKey: (...any) => any;
	forIn: (...any) => any;
	forInRight: (...any) => any;
	forOwn: (...any) => any;
	forOwnRight: (...any) => any;
	functions: (...any) => any;
	has: (...any) => any;
	invert: (...any) => any;
	isArguments: (...any) => any;
	isArray: (...any) => any;
	isBoolean: (...any) => any;
	isDate: (...any) => any;
	isElement: (...any) => any;
	isEmpty: (...any) => any;
	isEqual: (...any) => any;
	isFinite: (...any) => any;
	isFunction: (...any) => any;
	isNaN: (...any) => any;
	isNull: (...any) => any;
	isNumber: (...any) => any;
	isObject: (...any) => any;
	isPlainObject: (...any) => any;
	isRegExp: (...any) => any;
	isString: (...any) => any;
	isUndefined: (...any) => any;
	keys: (...any) => any;
	merge: (...any) => any;
	methods: (...any) => any;
	omit: (...any) => any;
	pairs: (...any) => any;
	pick: (...any) => any;
	transform: (...any) => any;
	values: (...any) => any;

	// Utilities
	escape: (...any) => any;
	identity: (...any) => any;
	mixin: (...any) => any;
	noConflict: (...any) => any;
	parseInt: (...any) => any;
	random: (...any) => any;
	result: (...any) => any;
	runInContext: (...any) => any;
	template: (...any) => any;
	times: (...any) => any;
	unescape: (...any) => any;
	uniqueId: (...any) => any;

	// Properties
	VERSION;
	support: {
		argsClass;
		argsObject;
		enumErrorProps;
		enumPrototypes;
		fastBind;
		funcDecomp;
		funcNames;
		nonEnumArgs;
		nonEnumShadows;
		ownLast;
		spliceObjects;
		unindexedChars;
	};

	templateSettings: {
		escape;
		evaluate;
		interpolate;
		variable;
		imports;
	};
}


