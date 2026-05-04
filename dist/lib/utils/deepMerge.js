export const deepMerge = (target, source) => {
    const result = Object.assign({}, target);
    for (const key of Object.keys(source)) {
        const srcVal = source[key];
        const tgtVal = target[key];
        if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal) && tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal)) {
            result[key] = deepMerge(tgtVal, srcVal);
        }
        else if (srcVal !== undefined) {
            result[key] = srcVal;
        }
    }
    return result;
};
//# sourceMappingURL=deepMerge.js.map