export = Lodash


declare class Lodash
{
	// Arrays
	static compact(...any) : any;
	static difference(...any) : any;
	static drop(...any) : any;
	static findIndex(...any) : any;
	static findLastIndex(...any) : any;
	static first(...any) : any;
	static flatten(...any) : any;
	static head(...any) : any;
	static indexOf(...any) : any;
	static initial(...any) : any;
	static intersection(...any) : any;
	static last(...any) : any;
	static lastIndexOf(...any) : any;
	static object(...any) : any;
	static pull(...any) : any;
	static range(...any) : any;
	static remove(...any) : any;
	static rest(...any) : any;
	static sortedIndex(...any) : any;
	static tail(...any) : any;
	static take(...any) : any;
	static union(...any) : any;
	static uniq(...any) : any;
	static unique(...any) : any;
	static unzip(...any) : any;
	static without(...any) : any;
	static zip(...any) : any;
	static zipObject(...any) : any;

	// Chaining
	// chain(...any) : any;
	// tap(...any) : any;
	// prototype.chain(...any) : any;
	// prototype.toString(...any) : any;
	// prototype.value(...any) : any;
	// prototype.valueOf(...any) : any;

	// Collections
	static all(...any) : any;
	static any(...any) : any;
	static at(...any) : any;
	static collect(...any) : any;
	static contains(...any) : any;
	static countBy(...any) : any;
	static detect(...any) : any;
	static each(...any) : any;
	static eachRight(...any) : any;
	static every(...any) : any;
	static filter(...any) : any;
	static find(...any) : any;
	static findLast(...any) : any;
	static findWhere(...any) : any;
	static foldl(...any) : any;
	static foldr(...any) : any;
	static forEach(...any) : any;
	static forEachRight(...any) : any;
	static groupBy(...any) : any;
	static include(...any) : any;
	static indexBy(...any) : any;
	static inject(...any) : any;
	static invoke(...any) : any;
	static map(...any) : any;
	static max(...any) : any;
	static min(...any) : any;
	static pluck(...any) : any;
	static reduce(...any) : any;
	static reduceRight(...any) : any;
	static reject(...any) : any;
	static sample(...any) : any;
	static select(...any) : any;
	static shuffle(...any) : any;
	static size(...any) : any;
	static some(...any) : any;
	static sortBy(...any) : any;
	static toArray(...any) : any;
	static where(...any) : any;

	// Functions
	static after(...any) : any;
	static bind(...any) : any;
	static bindAll(...any) : any;
	static bindKey(...any) : any;
	static compose(...any) : any;
	static createCallback(...any) : any;
	static curry(...any) : any;
	static debounce(...any) : any;
	static defer(...any) : any;
	static delay(...any) : any;
	static memoize(...any) : any;
	static once(...any) : any;
	static partial(...any) : any;
	static partialRight(...any) : any;
	static throttle(...any) : any;
	static wrap(...any) : any;

	// Objects
	static assign(...any) : any;
	static clone(...any) : any;
	static cloneDeep(...any) : any;
	static defaults(...any) : any;
	static extend(...any) : any;
	static findKey(...any) : any;
	static findLastKey(...any) : any;
	static forIn(...any) : any;
	static forInRight(...any) : any;
	static forOwn(...any) : any;
	static forOwnRight(...any) : any;
	static functions(...any) : any;
	static has(...any) : any;
	static invert(...any) : any;
	static isArguments(...any) : any;
	static isArray(...any) : any;
	static isBoolean(...any) : any;
	static isDate(...any) : any;
	static isElement(...any) : any;
	static isEmpty(...any) : any;
	static isEqual(...any) : any;
	static isFinite(...any) : any;
	static isFunction(...any) : any;
	static isNaN(...any) : any;
	static isNull(...any) : any;
	static isNumber(...any) : any;
	static isObject(...any) : any;
	static isPlainObject(...any) : any;
	static isRegExp(...any) : any;
	static isString(...any) : any;
	static isUndefined(...any) : any;
	static keys(...any) : any;
	static merge(...any) : any;
	static methods(...any) : any;
	static omit(...any) : any;
	static pairs(...any) : any;
	static pick(...any) : any;
	static transform(...any) : any;
	static values(...any) : any;

	// Utilities
	static escape(...any) : any;
	static identity(...any) : any;
	static mixin(...any) : any;
	static noConflict(...any) : any;
	static parseInt(...any) : any;
	static random(...any) : any;
	static result(...any) : any;
	static runInContext(...any) : any;
	static template(...any) : any;
	static times(...any) : any;
	static unescape(...any) : any;
	static uniqueId(...any) : any;

	// Properties
	static VERSION;
	static support: {
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

	static templateSettings: {
		escape;
		evaluate;
		interpolate;
		variable;
		imports;
	};
}


