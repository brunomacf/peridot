import _ from 'lodash';

// turns a list like ['mayEdit','mayWrite'] into an object like {mayEdit: true, mayWrite: true}
// ported from Exchange lodash-mixins.js
function arrayToTruthMap(array, value = true) {
  return _.zipObject(array, _.fill(new Array(_.size(array)), value));
}

export { arrayToTruthMap };
