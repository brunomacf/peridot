import Mixin from '@ember/object/mixin';
import { hasMany } from 'ember-data/relationships';

export default Mixin.create({
  lists: hasMany('list')
});
