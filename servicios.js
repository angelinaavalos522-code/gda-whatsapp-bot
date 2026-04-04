// servicios.js
const Servicios = {
  data: [
    {id:1,n:'Mecanica General',c:'Mecanica',p:200000,d:'3-6 hs',q:0,e:'activo'},
    {id:2,n:'Cambio de Aceite',c:'Mantenimiento',p:120000,d:'30 min',q:0,e:'activo'},
    {id:3,n:'Sistema Electrico',c:'Electrica',p:150000,d:'2-4 hs',q:0,e:'activo'},
    {id:4,n:'Aire Acondicionado',c:'Climatizacion',p:180000,d:'2-3 hs',q:0,e:'activo'},
    {id:5,n:'Frenos y Suspension',c:'Mecanica',p:250000,d:'2-5 hs',q:0,e:'activo'},
    {id:6,n:'Diagnostico OBD',c:'Diagnostico',p:80000,d:'1 hs',q:0,e:'activo'},
    {id:7,n:'Transmision',c:'Mecanica',p:400000,d:'4-8 hs',q:0,e:'activo'},
    {id:8,n:'Escape y Catalizador',c:'Mecanica',p:180000,d:'2-3 hs',q:0,e:'inactivo'},
  ],

  render() {
    const el = document.getElementById('tServicios'); if (!el) return;
    el.innerHTML = Servicios.data.map(s => `<tr>
      <td class="td-m">#${s.id}</td>
      <td class="td-n">${s.n}</td>
      <td><span class="bx bl">${s.c}</span></td>
      <td class="td-m" style="color:var(--accent2)">₲ ${Number(s.p).toLocaleString()}</td>
      <td>${s.d}</td><td>${s.q}</td>
      <td><span class="bx ${s.e==='activo'?'gr':'re'}">${s.e}</span></td>
      <td><div class="ab">
        <button class="ev" onclick="UI.toast('Editar servicio','var(--accent)')">✏</button>
        <button class="dl" onclick="Servicios.delete(${s.id})">🗑</button>
      </div></td></tr>`).join('');
  },

  delete(id) {
    Servicios.data = Servicios.data.filter(s => s.id !== id);
    Servicios.render();
    UI.toast('🗑 Servicio eliminado', 'var(--red)');
  }
};

function addServicio() {
  const m = document.getElementById('mServicio');
  const inp = m.querySelectorAll('input,select,textarea');
  Servicios.data.unshift({id:Date.now(), n:inp[0]?.value||'Nuevo', c:inp[1]?.value||'Mecanica', p:parseInt(inp[2]?.value)||0, d:inp[3]?.value||'—', e:inp[4]?.value||'activo', q:0});
  Servicios.render();
  UI.toast('✅ Servicio agregado','var(--green)');
  UI.closeModal('mServicio');
}
function rServicios() { Servicios.render(); }
