// UI preview only; never substitutes the real server authorization.
export function previewPersonnel(result,locationId){
 const ids=locationId?[locationId]:[];
 return {...result,locations:result.locations.filter(l=>ids.includes(l.id)),staff:result.staff.filter(s=>['purchasing','receiver'].includes(s.role)&&s.location_ids.length>0&&s.location_ids.every(id=>ids.includes(id)))};
}
export function assertPreviewRead(role,action){
 if(role!=='admin'||action!=='personnel-list')throw new Error('preview_readonly');
}
