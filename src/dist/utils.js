"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.findBackground = exports.headerColors = exports.PERFORMANCE_COLORS = exports.formatPercentage = exports.calculatePerformanceRatio = exports.filterMapFunctional = exports.selectSearchParams = exports.debounceNavigation = exports.validateDataElementGroupSets = exports.buildQueryParams = exports.resolveDataElementGroups = exports.extractDataElementGroupsByProgram = exports.extractDataElementGroups = exports.makeDataElementData = exports.fixedPeriods = exports.createOptions2 = exports.convertToDataElementsOptions = exports.convertToDataElementGroupsOptions = exports.convertToDataElementGroupSetsOptions = exports.flattenDataElementGroupSets = exports.flattenDataElements = exports.onlyDegs = exports.programAndDegs = exports.programOnly = exports.prepareVisionData = void 0;
var lodash_1 = require("lodash");
exports.prepareVisionData = function (_a) {
    var _b;
    var data = _a.data, dataElements = _a.dataElements;
    return (_b = data.metaData.dimensions["dx"]) === null || _b === void 0 ? void 0 : _b.map(function (x) {
        var _a;
        var current = new Map();
        (_a = data.metaData.dimensions["pe"]) === null || _a === void 0 ? void 0 : _a.forEach(function (pe) {
            data.metaData.dimensions["Duw5yep8Vae"].forEach(function (dim) {
                var _a;
                var search = data.rows.find(function (row) { return row[0] === x && row[3] === pe && row[2] === dim; });
                current.set("" + pe + dim, (_a = search === null || search === void 0 ? void 0 : search[4]) !== null && _a !== void 0 ? _a : "");
            });
        });
        return __assign(__assign(__assign({ id: x }, dataElements.get(x)), { name: data.metaData.items[x].name, code: data.metaData.items[x].code }), Object.fromEntries(current));
    });
};
exports.programOnly = new Set([
    "project-performance",
    "policy-actions",
    "output",
]);
exports.programAndDegs = new Set([
    "objective",
    "sub-programme",
    "sub-intervention4action",
]);
exports.onlyDegs = new Set(["goal", "resultsFrameworkObjective"]);
exports.flattenDataElements = function (dataElements) {
    return new Map(dataElements.map(function (_a) {
        var id = _a.id, name = _a.name, dataElementGroups = _a.dataElementGroups, attributeValues = _a.attributeValues;
        var obj = new Map();
        obj.set(id, name);
        obj.set("id", id);
        attributeValues.forEach(function (_a) {
            var value = _a.value, _b = _a.attribute, id = _b.id, name = _b.name;
            obj.set(id, value);
            obj.set(name, value);
        });
        dataElementGroups.forEach(function (_a) {
            var id = _a.id, name = _a.name, groupSets = _a.groupSets, attributeValues = _a.attributeValues;
            obj.set(id, name);
            attributeValues.forEach(function (_a) {
                var value = _a.value, _b = _a.attribute, id = _b.id, name = _b.name;
                obj.set(id, value);
                obj.set(name, value);
            });
            groupSets.forEach(function (_a) {
                var id = _a.id, name = _a.name, attributeValues = _a.attributeValues;
                obj.set(id, name);
                attributeValues.forEach(function (_a) {
                    var value = _a.value, _b = _a.attribute, id = _b.id, name = _b.name;
                    obj.set(id, value);
                    obj.set(name, value);
                });
            });
        });
        return [id, Object.fromEntries(obj)];
    }));
};
exports.flattenDataElementGroupSets = function (dataElementGroupSets) {
    var allDataElements = dataElementGroupSets.flatMap(function (_a) {
        var attributeValues = _a.attributeValues, id = _a.id, name = _a.name, dataElementGroups = _a.dataElementGroups;
        var degs = __assign(__assign(__assign({}, lodash_1.fromPairs(attributeValues.map(function (_a) {
            var value = _a.value, id = _a.attribute.id;
            return [
                id,
                value,
            ];
        }))), lodash_1.fromPairs(attributeValues.map(function (_a) {
            var value = _a.value, name = _a.attribute.name;
            return [
                name,
                value,
            ];
        }))), { degsName: name, degsId: id });
        return dataElementGroups.flatMap(function (_a) {
            var id = _a.id, attributeValues = _a.attributeValues, name = _a.name, dataElements = _a.dataElements;
            var deg = __assign(__assign(__assign({}, lodash_1.fromPairs(attributeValues.map(function (_a) {
                var value = _a.value, id = _a.attribute.id;
                return [id, value];
            }))), lodash_1.fromPairs(attributeValues.map(function (_a) {
                var value = _a.value, name = _a.attribute.name;
                return [
                    name,
                    value,
                ];
            }))), { degName: name, degId: id });
            return dataElements.map(function (_a) {
                var attributeValues = _a.attributeValues, id = _a.id, name = _a.name;
                return (__assign(__assign(__assign(__assign({ id: id,
                    name: name }, lodash_1.fromPairs(attributeValues.map(function (_a) {
                    var value = _a.value, id = _a.attribute.id;
                    return [
                        id,
                        value,
                    ];
                }))), lodash_1.fromPairs(attributeValues.map(function (_a) {
                    var value = _a.value, name = _a.attribute.name;
                    return [
                        name,
                        value,
                    ];
                }))), degs), deg));
            });
        });
    });
    return new Map(Object.entries(lodash_1.groupBy(allDataElements, "id")).map(function (_a) {
        var id = _a[0], val = _a[1];
        return [
            id,
            Object.assign.apply(Object, __spreadArrays([{}], val)),
        ];
    }));
};
exports.convertToDataElementGroupSetsOptions = function (dataElementGroupSets) {
    return dataElementGroupSets.map(function (_a) {
        var id = _a.id, name = _a.name;
        return ({
            value: id,
            label: name
        });
    });
};
exports.convertToDataElementGroupsOptions = function (dataElementGroupSet, dataElementGroupSets) {
    return dataElementGroupSets.flatMap(function (_a) {
        var dataElementGroups = _a.dataElementGroups, id = _a.id;
        if (dataElementGroupSet !== id) {
            return [];
        }
        return dataElementGroups.map(function (_a) {
            var id = _a.id, name = _a.name;
            return ({
                value: id,
                label: name
            });
        });
    });
};
exports.convertToDataElementsOptions = function (dataElementGroupSets) {
    return dataElementGroupSets.flatMap(function (_a) {
        var dataElementGroups = _a.dataElementGroups;
        return dataElementGroups.flatMap(function (_a) {
            var dataElements = _a.dataElements;
            return dataElements.map(function (_a) {
                var id = _a.id, name = _a.name;
                return ({
                    value: id,
                    label: name
                });
            });
        });
    });
};
exports.createOptions2 = function (labels, values) {
    if (labels.length === values.length) {
        return labels.map(function (label, index) {
            return {
                label: label,
                value: values[index]
            };
        });
    }
    return [];
};
exports.fixedPeriods = [
    "DAILY",
    "WEEKLY",
    "WEEKLYWED",
    "WEEKLYTHU",
    "WEEKLYSAT",
    "WEEKLYSUN",
    "BIWEEKLY",
    "MONTHLY",
    "BIMONTHLY",
    "QUARTERLY",
    "QUARTERLYNOV",
    "SIXMONTHLY",
    "SIXMONTHLYAPR",
    "SIXMONTHLYNOV",
    "YEARLY",
    "FYNOV",
    "FYOCT",
    "FYJUL",
    "FYAPR",
];
exports.makeDataElementData = function (data) {
    var _a = data.analytics, rows = _a.rows, _b = _a.metaData, items = _b.items, dimensions = _b.dimensions;
    return dimensions.dx.map(function (a) {
        var _a;
        var current = new Map();
        var dataElementDetails = data.dataElements.get(a);
        (_a = dimensions["pe"]) === null || _a === void 0 ? void 0 : _a.forEach(function (pe) {
            dimensions["Duw5yep8Vae"].forEach(function (dim) {
                var _a;
                var search = rows.find(function (row) { return row[0] === a && row[3] === pe && row[2] === dim; });
                current.set("" + pe + dim, (_a = search === null || search === void 0 ? void 0 : search[4]) !== null && _a !== void 0 ? _a : "");
            });
            var target = Number(current.get("" + pe + data.targetId));
            var actual = Number(current.get("" + pe + data.actualId));
            var ratio = exports.calculatePerformanceRatio(actual, target);
            var _a = exports.findBackground(ratio, dataElementDetails === null || dataElementDetails === void 0 ? void 0 : dataElementDetails["descending indicator type"]), performance = _a.performance, style = _a.style;
            if (isNaN(ratio)) {
                current.set(pe + "performance", "-");
            }
            else {
                current.set(pe + "performance", exports.formatPercentage(ratio / 100));
            }
            current.set(pe + "style", style);
            current.set(pe + "performance-group", performance);
            current.set(pe + "target", isNaN(target) ? 0 : 1);
            current.set(pe + "actual", isNaN(actual) ? 0 : 1);
        });
        return __assign(__assign({ id: a, dx: items[a].name, code: items[a].code }, Object.fromEntries(current)), dataElementDetails);
    });
};
exports.extractDataElementGroups = function (dataElementGroupSets, degs) {
    var _a;
    if (dataElementGroupSets.length === 0)
        return [];
    if (degs !== undefined) {
        var targetGroupSet = dataElementGroupSets.find(function (d) { return d.id === degs; });
        return (_a = targetGroupSet === null || targetGroupSet === void 0 ? void 0 : targetGroupSet.dataElementGroups.map(function (g) { return g.id; })) !== null && _a !== void 0 ? _a : [];
    }
    return dataElementGroupSets.flatMap(function (d) {
        return d.dataElementGroups.map(function (g) { return g.id; });
    });
};
exports.extractDataElementGroupsByProgram = function (dataElementGroupSets, program) {
    if (program === undefined || dataElementGroupSets.length === 0) {
        return {
            groupSets: [],
            dataElementGroups: []
        };
    }
    var groupSets = dataElementGroupSets.flatMap(function (d) {
        var _a, _b;
        var hasProgram = (_b = (_a = d.attributeValues) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.value === program; })) !== null && _b !== void 0 ? _b : false;
        if (hasProgram) {
            return d.id;
        }
        return [];
    });
    var dataElementGroups = dataElementGroupSets.flatMap(function (d) {
        var _a, _b;
        var hasProgram = (_b = (_a = d.attributeValues) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.value === program; })) !== null && _b !== void 0 ? _b : false;
        if (hasProgram) {
            return d.dataElementGroups.map(function (g) { return g.id; });
        }
        return [];
    });
    return {
        groupSets: groupSets,
        dataElementGroups: dataElementGroups
    };
};
exports.resolveDataElementGroups = function (searchParams, dataElementGroupSets) {
    var deg = searchParams.deg, degs = searchParams.degs, program = searchParams.program;
    if (deg !== undefined) {
        return {
            groupSets: [degs !== null && degs !== void 0 ? degs : ""],
            dataElementGroups: [deg]
        };
    }
    if (program !== undefined) {
        return exports.extractDataElementGroupsByProgram(dataElementGroupSets, program);
    }
    var dataElementGroups = exports.extractDataElementGroups(dataElementGroupSets, degs);
    return {
        groupSets: dataElementGroupSets.map(function (d) { return d.id; }),
        dataElementGroups: dataElementGroups
    };
};
exports.buildQueryParams = function (_a, searchParams) {
    var dataElementGroups = _a.dataElementGroups;
    var pe = searchParams.pe, ou = searchParams.ou, program = searchParams.program;
    return __assign({ deg: dataElementGroups.map(function (de) { return "DE_GROUP-" + de; }).join(";"), pe: pe,
        ou: ou }, (program && { program: program }));
};
exports.validateDataElementGroupSets = function (dataElementGroupSets) {
    return (Array.isArray(dataElementGroupSets) &&
        dataElementGroupSets.every(function (set) {
            return set &&
                typeof set.id === "string" &&
                Array.isArray(set.dataElementGroups);
        }));
};
exports.debounceNavigation = function (fn, delay) {
    if (delay === void 0) { delay = 300; }
    var timeoutId;
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () { return fn.apply(void 0, args); }, delay);
    });
};
exports.selectSearchParams = function (searchParams, keys) {
    return keys.reduce(function (acc, key) {
        acc[key] = searchParams[key];
        return acc;
    }, {});
};
function filterMapFunctional(map, predicate) {
    return Array.from(map)
        .filter(function (_a) {
        var key = _a[0], value = _a[1];
        return predicate(key, value);
    })
        .map(function (_a) {
        var value = _a[1];
        return value;
    });
}
exports.filterMapFunctional = filterMapFunctional;
exports.calculatePerformanceRatio = function (actual, target) {
    if (isNaN(actual) || isNaN(target) || target === 0)
        return NaN;
    return (actual * 100) / target;
};
exports.formatPercentage = function (value) {
    return new Intl.NumberFormat("en-US", {
        style: "percent"
    }).format(value);
};
exports.PERFORMANCE_COLORS = {
    red: { bg: "#CD615A", fg: "black", end: 75 },
    yellow: { bg: "#F4CD4D", fg: "black", start: 75, end: 99 },
    gray: { bg: "#AAAAAA", fg: "black", start: 75, end: 99 },
    green: { bg: "#339D73", fg: "white", start: 100 }
};
exports.headerColors = {
    n: { backgroundColor: "#CD615A", color: "black" },
    m: { backgroundColor: "#F4CD4D", color: "black" },
    x: { backgroundColor: "#AAAAAA", color: "black" },
    a: { backgroundColor: "#339D73", color: "white" }
};
exports.findBackground = function (value, isDescending) {
    if (isNaN(value)) {
        return {
            style: {
                backgroundColor: exports.PERFORMANCE_COLORS.gray.bg,
                color: exports.PERFORMANCE_COLORS.gray.fg
            },
            performance: "x"
        };
    }
    var red = exports.PERFORMANCE_COLORS.red, yellow = exports.PERFORMANCE_COLORS.yellow, green = exports.PERFORMANCE_COLORS.green;
    if (isDescending && isDescending === "true") {
        if (value < red.end) {
            return {
                style: { backgroundColor: green.bg, color: green.fg },
                performance: "a"
            };
        }
        if (value >= yellow.start && value < yellow.end) {
            return {
                style: { backgroundColor: yellow.bg, color: yellow.fg },
                performance: "m"
            };
        }
        if (value >= green.start) {
            return {
                style: { backgroundColor: red.bg, color: red.fg },
                performance: "n"
            };
        }
    }
    else {
        if (value < red.end) {
            return {
                style: { backgroundColor: red.bg, color: red.fg },
                performance: "n"
            };
        }
        if (value >= yellow.start && value < yellow.end) {
            return {
                style: { backgroundColor: yellow.bg, color: yellow.fg },
                performance: "m"
            };
        }
        if (value >= green.start) {
            return {
                style: { backgroundColor: green.bg, color: green.fg },
                performance: "a"
            };
        }
    }
    return {
        style: {
            backgroundColor: exports.PERFORMANCE_COLORS.gray.bg,
            color: exports.PERFORMANCE_COLORS.gray.fg
        },
        performance: "x"
    };
};
