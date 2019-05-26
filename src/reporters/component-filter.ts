import * as opentracing from '../opentracing/index';
import BaseReporter from './base';
import BasicSpan, { ISpanLog } from '../basic/span';


export class ComponentFilterReporter extends BaseReporter {
    private _target: BaseReporter;
    private _namespaces: string;
    private _regexes: {
        names: RegExp[],
        skips: RegExp[]
    };


    constructor(targetReporter: BaseReporter, namespaces: string) {
        super();
        this._target = targetReporter;
        this._namespaces = namespaces;
        this.setupRegexes();
        this.accepts.spanCreate = targetReporter.accepts.spanCreate;
        this.accepts.spanLog = targetReporter.accepts.spanLog;
        this.accepts.spanFinish = targetReporter.accepts.spanFinish;
    }


    updateFilter(namespaces: string) {
        this._namespaces = namespaces;
        this.setupRegexes();
    }


    recieveSpanCreate(span: BasicSpan) {
        const componentName = span.getTag(opentracing.Tags.COMPONENT);
        if (!componentName) return false;
        if (!this.test(componentName)) return false;
        return this._target.recieveSpanCreate(span);
    }


    recieveSpanLog(span: BasicSpan, log: ISpanLog) {
        const componentName = span.getTag(opentracing.Tags.COMPONENT);
        if (!componentName) return false;
        if (!this.test(componentName)) return false;
        return this._target.recieveSpanLog(span, log);
    }


    recieveSpanFinish(span: BasicSpan) {
        const componentName = span.getTag(opentracing.Tags.COMPONENT);
        if (!componentName) return false;
        if (!this.test(componentName)) return false;
        return this._target.recieveSpanFinish(span);
    }


    /**
     * Stolen from:
     * https://github.com/visionmedia/debug/blob/master/src/common.js
     */
    private setupRegexes() {
        this._regexes = { names: [], skips: [] };

        let i;
		const split = (typeof this._namespaces === 'string' ? this._namespaces : '').split(/[\s,]+/);
		const len = split.length;

		for (i = 0; i < len; i++) {
			if (!split[i]) {
				// ignore empty strings
				continue;
			}

			const namespaces = split[i].replace(/\*/g, '.*?');

			if (namespaces[0] === '-') {
				this._regexes.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
			} else {
				this._regexes.names.push(new RegExp('^' + namespaces + '$'));
			}
		}
    }


    /**
     * Stolen from:
     * https://github.com/visionmedia/debug/blob/master/src/common.js
     */
    private test(name: string) {
		if (name[name.length - 1] === '*') {
			return true;
		}

		let i;
		let len;

		for (i = 0, len = this._regexes.skips.length; i < len; i++) {
			if (this._regexes.skips[i].test(name)) {
				return false;
			}
		}

		for (i = 0, len = this._regexes.names.length; i < len; i++) {
			if (this._regexes.names[i].test(name)) {
				return true;
			}
		}

		return false;
	}


    close() {
        this._target.close();
        this._target = null;
        this._regexes = { names: [], skips: [] };
    }
}


export default ComponentFilterReporter;
