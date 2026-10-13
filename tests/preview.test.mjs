import test from 'node:test';
import assert from 'node:assert/strict';
import {previewPersonnel,assertPreviewRead} from '../web/js/preview.js';
test('admin preview hides managers and staff outside selected location',()=>{
 const data={locations:[{id:'A'},{id:'B'}],staff:[{role:'super_admin',location_ids:['A']},{role:'admin',location_ids:['A']},{role:'receiver',location_ids:['A']},{role:'purchasing',location_ids:['A','B']},{role:'receiver',location_ids:[]}]};
 assert.deepEqual(previewPersonnel(data,'A').staff,[data.staff[2]]);
 assert.deepEqual(previewPersonnel(data,'A').locations,[data.locations[0]]);
 assert.equal(previewPersonnel(data,'').staff.length,0);
 assert.equal(data.staff.length,5);
});
test('preview blocks every write action and lower role personnel reads',()=>{
 assert.doesNotThrow(()=>assertPreviewRead('admin','personnel-list'));
 for(const role of ['admin','purchasing','receiver'])for(const action of ['personnel-create','personnel-update','location-create'])assert.throws(()=>assertPreviewRead(role,action),/preview_readonly/);
 for(const role of ['purchasing','receiver'])assert.throws(()=>assertPreviewRead(role,'personnel-list'),/preview_readonly/);
});
