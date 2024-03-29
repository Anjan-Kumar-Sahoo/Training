import MockAdapter from 'axios-mock-adapter';

class ExtendedMockAdapter extends MockAdapter {
	baseUrl;

	constructor(axiosInstance, mockAdapterOptions, baseUrl = '') {
		super(axiosInstance);
		this.baseUrl = baseUrl;
	}

	RequestMatcherFunc(url, requestType) {
		const transformedUrl = transformUrlIfNeeded(this.baseUrl + (url || ''));
		// @ts-ignore
		return createExtendedHandler(super[requestType](transformedUrl), transformedUrl, url);
	}

	onGet = (url) => this.RequestMatcherFunc(url, 'onGet');

	onPost = (url) => this.RequestMatcherFunc(url, 'onPost');

	onPut = (url) => this.RequestMatcherFunc(url, 'onPut');

	onDelete = (url) => this.RequestMatcherFunc(url, 'onDelete');

	onPatch = (url) => this.RequestMatcherFunc(url, 'onPatch');
}

function transformUrlIfNeeded(url) {
	if (typeof url === 'string' && url.includes(':')) {
		return convertUrlToRegex(url);
	}

	return url;
}

function convertUrlToRegex(url) {
	return new RegExp(
		`^${url
			.split('/')
			.map((segment) => {
				if (segment.startsWith(':')) {
					const paramName = segment.slice(1);
					return `(?<${paramName}>[^/]+)`;
				}

				return segment;
			})
			.join('/')}$`
	);
}

function createExtendedHandler(handler, matcherUrl, url) {
	const originalReply = handler.reply.bind(handler);
	// @ts-ignore
	handler.reply = (func) => {
		return originalReply((config) => {
			const params = extractParamsFromUrl(config.url, matcherUrl);
			// Assigning the extracted parameters to config.params
			config.params = { ...config.params, ...params };
			return func(config);
		});
	};
	return handler;
}

function extractParamsFromUrl(configUrl, matcherUrl) {
	if (typeof configUrl !== 'string' || !(matcherUrl instanceof RegExp || typeof matcherUrl === 'string')) {
		return {};
	}

	const params = {};

	if (matcherUrl instanceof RegExp) {
		const regexResult = matcherUrl.exec(configUrl);

		if (regexResult && regexResult.groups) {
			for (const key in regexResult.groups) {
				params[key] = regexResult.groups[key];
			}
		}
	} else {
		const matcherParts = matcherUrl.split('/');
		const urlParts = configUrl.split('/');
		for (let i = 0; i < matcherParts.length; i += 1) {
			if (matcherParts[i].startsWith(':')) {
				const key = matcherParts[i].slice(1);
				params[key] = urlParts[i] || '';
			}
		}
	}

	return params;
}

export default ExtendedMockAdapter;
