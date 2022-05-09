exports.updated = (user, params) => {
  const obj = { user, cookieStatus: "Updated" };
  return loopOverKeys(obj, params);
};

exports.notUpdated = (user, params) => {
  const obj = { user, cookieStatus: "Not Updated" };
  return loopOverKeys(obj, params);
};

function loopOverKeys(object, keysToLoop) {
  const obj = { ...object };
  Object.keys(keysToLoop).forEach((key) => {
    obj[key] = keysToLoop[key];
  });
  return obj;
}
