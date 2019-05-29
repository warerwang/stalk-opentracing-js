const stalk = require('../');
const apiCompatibilityChecks = require('opentracing/lib/test/api_compatibility.js').default;
apiCompatibilityChecks(() => new stalk.StalkTracer());
