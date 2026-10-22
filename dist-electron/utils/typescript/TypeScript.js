function zipToRecord(keys, values) {
    return keys.reduce((record, key, index) => {
        record[key] = values[index];
        return record;
    }, {});
}
export { zipToRecord };
