export function sortStaff(rows,key='active',direction='descending',language='tr'){
 const compare=new Intl.Collator(language,{numeric:true,sensitivity:'base'}).compare;
 const newest=(a,b)=>(Date.parse(b.created_at)||0)-(Date.parse(a.created_at)||0)||compare(a.employee_number,b.employee_number);
 return [...rows].sort((a,b)=>{
  const value=key==='active'?Number(a.active)-Number(b.active):compare(a[key]??'',b[key]??'');
  return value*(direction==='ascending'?1:-1)||newest(a,b);
 });
}
