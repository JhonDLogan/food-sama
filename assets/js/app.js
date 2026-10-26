/* Food-Sama — comportamiento de la interfaz. No utiliza API, cookies ni base de datos. */
(function () {
  'use strict';
  const data = JSON.parse(JSON.stringify(window.FoodSamaData));
  const { orderTotal, isSale, summarize } = window.FoodSamaLogic;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money = value => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
  const percent = value => value == null ? 'No calculable' : new Intl.NumberFormat('es-CO',{maximumFractionDigits:1}).format(value) + ' %';
  const initials = name => name.trim().split(/\s+/).slice(0,2).map(word => word[0]).join('').toUpperCase();
  const dateText = date => new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short',year:'numeric'}).format(new Date(date+'T12:00:00'));
  const icons = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    utensils:'<path d="M4 3v6a3 3 0 0 0 6 0V3M7 3v18M18 3c-4 4-4 8 0 9V3Zm0 9v9"/>',
    users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2"/>',
    receipt:'<path d="M5 3l3 2 4-2 4 2 3-2v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
    chart:'<path d="M3 3v18h18M7 16v-5M12 16V6M17 16V9"/>',
    store:'<path d="M3 9l2-6h14l2 6M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M5 12v9h14v-9M10 21v-6h5v6"/>',
    logout:'<path d="M10 4H4v16h6M9 12h12M17 8l4 4-4 4"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M16 16l5 5"/>',
    bell:'<path d="M5 16h14l-2-3V9A5 5 0 0 0 7 9v4l-2 3ZM10 20h4"/>',
    'chevron-down':'<path d="M6 9l6 6 6-6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
    external:'<path d="M14 3h7v7M10 14L21 3M10 4H4v16h16v-6"/>',
    wallet:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M4 5V3h14M16 11h5v5h-5v-5Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trend:'<path d="M3 17l6-6 4 4 8-10M15 5h6v6"/>',
    check:'<path d="M5 12l4 4L19 6"/>',
    close:'<path d="M6 6l12 12M6 18L18 6"/>',
    edit:'<path d="M14 5l5 5M3 21l5-1L21 7a2 2 0 0 0-5-5L3 15v6Z"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    phone:'<path d="M7 3l3 5-3 3a15 15 0 0 0 6 6l3-3 5 3c0 4-3 5-7 3A22 22 0 0 1 4 10C2 6 3 3 7 3Z"/>',
    chat:'<path d="M21 11a9 9 0 0 1-13 8l-5 2 2-5A9 9 0 1 1 21 11Z"/><path d="M8 10h8M8 14h5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    download:'<path d="M12 3v12M7 10l5 5 5-5M4 16v5h16v-5"/>',
    print:'<path d="M7 7V3h10v4M7 17H3V8h18v9h-4M7 14h10v7H7v-7Z"/><path d="M17 11h1"/>',
    leaf:'<path d="M4 20l12-12M4 15C0 3 13 2 21 3c1 8 0 21-12 17"/>'
  };
  const icon = name => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">'+(icons[name] || icons.grid)+'</svg>';
  function hydrateIcons(root = document) { $$('[data-icon]',root).forEach(el => { el.innerHTML = icon(el.dataset.icon); el.removeAttribute('data-icon'); }); }
  function toast(message, error = false) {
    const item = document.createElement('div'); item.className = 'toast'+(error?' error':''); item.textContent = message;
    $('#toast-region').append(item); window.setTimeout(() => item.remove(), 4800);
  }
  const dialog = $('#app-dialog');
  function showDialog(title, subtitle, content, footer = '') {
    if (dialog.open) dialog.close();
    $('#dialog-content').innerHTML = '<div class="dialog-head"><div><span class="eyebrow">FOOD-SAMA · DEMOSTRACIÓN</span><h2 id="dialog-title">'+esc(title)+'</h2><p>'+esc(subtitle)+'</p></div><button class="icon-button" data-action="close-dialog" aria-label="Cerrar ventana">'+icon('close')+'</button></div><div class="dialog-body">'+content+'</div>'+(footer?'<div class="dialog-footer">'+footer+'</div>':'');
    dialog.showModal();
  }
  dialog.addEventListener('close', () => document.body.classList.remove('printing'));
  dialog.addEventListener('click', event => { const rect=dialog.getBoundingClientRect(); if(event.target===dialog && (event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom)) dialog.close(); });
  function badge(status) {
    const color = {'Pendiente':'orange','En preparación':'blue','Entregado':'green','Cancelado':'gray'}[status] || 'gray';
    return '<span class="badge badge-'+color+'">'+esc(status)+'</span>';
  }
  const paymentBadge = paid => '<span class="badge badge-'+(paid?'green':'gray')+'">'+(paid?'Pagado':'Por cobrar')+'</span>';
  const sourceIcon = source => ({Web:'globe',Teléfono:'phone',Chat:'chat'}[source] || 'bag');
  const empty = (title, text, kind='bag') => '<div class="empty-state">'+icon(kind)+'<h2>'+esc(title)+'</h2><p>'+esc(text)+'</p></div>';
  const note = text => '<div class="note-strip">'+icon('info')+'<p>'+esc(text)+'</p></div>';
  const field = (label, name, input, span=false) => '<div class="form-field'+(span?' span-two':'')+'"><label for="'+name+'">'+label+'</label>'+input+'</div>';
  const input = (name,value='',type='text',extra='') => '<input id="'+name+'" name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+extra+'>';
  const state = {view:'resumen', category:'Todos', productQuery:'', orderQuery:'', orderStatus:'Todos', orderPayment:'Todos', publicCategory:'Todos', cart:{}, reportFrom:data.date, reportTo:data.date};
  const viewNames = {resumen:'Resumen',pedidos:'Pedidos',menu:'Mi menú',clientes:'Clientes',comprobantes:'Comprobantes',reportes:'Resultados',negocio:'Mi negocio'};
  const todayOrders = () => data.orders.filter(order => order.date === data.date);
  const pendingOrders = () => data.orders.filter(order => !['Entregado','Cancelado'].includes(order.status));
  const totals = () => summarize(data.orders,data.expenses,state.reportFrom,state.reportTo);

  function pageHeading(title, subtitle, action='') {
    return '<div class="page-heading"><div><h1>'+title+'</h1><p>'+subtitle+'</p></div><div class="heading-actions">'+action+'</div></div>';
  }
  const newOrderButton = '<button class="button button-primary" data-action="new-order">'+icon('plus')+'Nuevo pedido</button>';
  function statCard(label,value,foot,kind,footClass='') {
    return '<article class="stat-card"><div class="stat-top"><span>'+label+'</span><span class="stat-symbol">'+icon(kind)+'</span></div><div class="stat-value">'+value+'</div><div class="stat-foot '+footClass+'">'+foot+'</div></article>';
  }
  function ordersTable(orders, includePayment=false) {
    if(!orders.length) return empty('Sin pedidos en esta vista','Prueba otro filtro o registra un pedido de ejemplo.');
    return '<div class="table-wrap"><table><thead><tr><th>PEDIDO</th><th>CLIENTE</th><th>ORIGEN</th><th>ESTADO</th>'+(includePayment?'<th>PAGO</th>':'')+'<th>TOTAL</th><th>HORA</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>'+orders.map(order => '<tr><td><button class="order-code" data-action="view-order" data-id="'+order.id+'">#FS-'+order.id+'</button></td><td><div class="customer-cell"><span class="customer-avatar">'+esc(initials(order.customer))+'</span><div>'+esc(order.customer)+'<small>'+esc(order.delivery)+'</small></div></div></td><td><span class="source">'+icon(sourceIcon(order.source))+esc(order.source)+'</span></td><td>'+badge(order.status)+'</td>'+(includePayment?'<td>'+paymentBadge(order.paid)+'</td>':'')+'<td><strong>'+money(orderTotal(order))+'</strong></td><td class="muted">'+esc(order.time)+'</td><td><button class="icon-button" data-action="view-order" data-id="'+order.id+'" aria-label="Ver pedido FS-'+order.id+'">'+icon('arrow')+'</button></td></tr>').join('')+'</tbody></table></div>';
  }
  function renderDashboard() {
    const day = summarize(data.orders,data.expenses,data.date,data.date);
    const active = pendingOrders().length;
    const productsSold = day.sales.reduce((sum,order) => sum+order.items.reduce((n,item) => n+item.quantity,0),0);
    const dates=['2026-10-18','2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24'];
    const values = dates.map(date => summarize(data.orders,[],date,date).revenue);
    const max = Math.max(150000,...values); const weekTotal = values.reduce((a,b)=>a+b,0);
    const list = todayOrders(); const statusColors = ['#eab96a','#9fb4ca','#7e9b73','#c6cec1'];
    const statuses=['Pendiente','En preparación','Entregado','Cancelado'];
    const counts=statuses.map(status=>list.filter(order=>order.status===status).length);
    let progress=0; const gradient=counts.map((count,index)=>{const start=progress;progress+=list.length?count/list.length*100:0;return statusColors[index]+' '+start+'% '+progress+'%';}).join(',');
    return pageHeading('Tu negocio, al día.','Hola, '+esc(data.business.owner)+'. Así va el turno de hoy.','<div class="date-pill">'+icon('calendar')+dateText(data.date)+'</div>'+newOrderButton)+
      '<section class="hero-banner"><div class="hero-copy"><span class="eyebrow">TODO LISTO PARA EL TURNO</span><h2>Tú pones el sabor.<br>Nosotros, <em>el orden.</em></h2><p>Del primer pedido a la última cuenta, cada detalle de tu negocio tiene su lugar.</p><div class="hero-actions"><button class="button button-dark" data-action="go" data-view="pedidos">Ver mis pedidos '+icon('arrow')+'</button><a class="button button-quiet" href="menu.html" target="_blank" rel="noopener">Mi menú público '+icon('external')+'</a></div></div><img class="hero-art" src="assets/img/hero-food.svg" alt="Hamburguesa artesanal, papas y limonada ilustradas" width="520" height="360"></section>'+
      '<section class="stats-grid" aria-label="Indicadores del día">'+statCard('Ventas de hoy',money(day.revenue),icon('check')+'Entregados y pagados','wallet','green-text')+statCard('Pedidos por atender',String(active),icon('clock')+'Pendientes y en preparación','bag','orange-text')+statCard('Productos vendidos',String(productsSold),'En '+day.sales.length+' ventas del día','utensils')+statCard('Resultado estimado',money(day.result),'Después de costos y gastos','chart','green-text')+'</section>'+
      '<section class="charts-grid"><article class="panel"><div class="panel-head"><div><h2>Ventas de la semana</h2><p>Del 18 al 24 de octubre · Datos de ejemplo</p></div><span class="mini-pill">Últimos 7 días</span></div><div class="chart-summary"><strong>'+money(weekTotal)+'</strong><span>Ventas reconocidas</span></div><div class="bar-chart" role="group" aria-label="Ventas diarias de la semana"><div class="chart-ticks" aria-hidden="true"><span>'+money(max/1000)+' mil</span><span>'+money(max/2000)+' mil</span><span>$0</span></div>'+values.map((value,i)=>'<div class="bar-column"><button class="chart-bar" style="height:'+Math.max(4,value/max*100)+'%" aria-label="'+dateText(dates[i])+': '+money(value)+'"><span class="chart-tooltip">'+money(value)+'</span></button><span class="chart-day">'+['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][i]+'</span></div>').join('')+'</div></article><article class="panel"><div class="panel-head"><div><h2>Pedidos de hoy</h2><p>Cada pedido, en su momento.</p></div>'+icon('bag')+'</div><div class="status-overview"><div class="donut" style="background:conic-gradient('+gradient+')" aria-hidden="true"><div class="donut-hole"><strong>'+list.length+'</strong><span>pedidos en total</span></div></div><div class="legend">'+statuses.map((status,i)=>'<div class="legend-item"><i style="background:'+statusColors[i]+'"></i><span>'+status+'</span><strong>'+counts[i]+'</strong></div>').join('')+'</div></div></article></section>'+
      '<section class="panel table-panel"><div class="panel-head"><div><h2>Pedidos recientes</h2><p>Los últimos movimientos de tu cocina.</p></div><button class="button button-link" data-action="go" data-view="pedidos">Ver todos '+icon('arrow')+'</button></div>'+ordersTable(data.orders.slice(0,4))+'</section>';
  }
  function renderOrders() {
    return pageHeading('Cada pedido cuenta.','Atiende el turno y consulta el estado de cada pedido.',newOrderButton)+
      '<div class="toolbar"><label class="search-field">'+icon('search')+'<span class="sr-only">Buscar pedido</span><input id="order-search" type="search" placeholder="Código, cliente o teléfono…" value="'+esc(state.orderQuery)+'"></label><div class="toolbar-end"><label class="sr-only" for="order-status">Estado del pedido</label><select class="filter-select" id="order-status">'+['Todos','Pendiente','En preparación','Entregado','Cancelado'].map(s=>'<option'+(state.orderStatus===s?' selected':'')+'>'+s+'</option>').join('')+'</select><label class="sr-only" for="order-payment">Estado del pago</label><select class="filter-select" id="order-payment">'+['Todos','Pagado','Por cobrar'].map(s=>'<option'+(state.orderPayment===s?' selected':'')+'>'+s+'</option>').join('')+'</select></div></div><section class="panel" id="orders-content">'+filteredOrdersHtml()+'</section><p class="section-note">El estado de atención y la confirmación del pago se manejan por separado.</p>';
  }
  function filteredOrdersHtml() {
    const query=state.orderQuery.trim().toLowerCase();
    const orders=data.orders.filter(order=>(!query || ('fs-'+order.id+' '+order.customer+' '+order.phone).toLowerCase().includes(query)) && (state.orderStatus==='Todos'||order.status===state.orderStatus) && (state.orderPayment==='Todos'||(state.orderPayment==='Pagado')===order.paid));
    return ordersTable(orders,true)+'<div class="table-footer">'+orders.length+' de '+data.orders.length+' pedidos de ejemplo</div>';
  }
  function categoryTabs(active,action) {
    return data.categories.map(category=>'<button class="filter-tab'+(category===active?' active':'')+'" data-action="'+action+'" data-category="'+esc(category)+'" aria-pressed="'+(category===active)+'">'+esc(category)+'</button>').join('');
  }
  function productCard(product,publicView=false) {
    return '<article class="product-card"><div class="product-image '+esc(product.color)+'"><span class="badge badge-'+(product.available?'green':'gray')+'">'+(product.available?'Disponible':'No disponible')+'</span><img src="assets/img/'+esc(product.image)+'" alt="Ilustración de '+esc(product.name)+'" width="320" height="260"></div><div class="product-body"><div class="product-category">'+esc(product.category)+'</div><h2>'+esc(product.name)+'</h2><p class="product-description">'+esc(product.description)+'</p><div class="product-bottom"><span class="price">'+money(product.price)+'<small>COP</small></span>'+(publicView?'<button class="button button-primary button-small" data-action="cart-add" data-id="'+product.id+'">'+icon('plus')+'Agregar</button>':'<div class="product-actions"><button class="icon-button" data-action="toggle-product" data-id="'+product.id+'" aria-label="'+(product.available?'Pausar':'Activar')+' '+esc(product.name)+'">'+icon('eye')+'</button><button class="icon-button" data-action="edit-product" data-id="'+product.id+'" aria-label="Editar '+esc(product.name)+'">'+icon('edit')+'</button></div>')+'</div></div></article>';
  }
  function renderMenu() {
    return pageHeading('Un menú con personalidad.','Organiza lo que cocinas y lo que ven tus clientes.','<a class="button button-quiet" href="menu.html" target="_blank" rel="noopener">Vista del cliente '+icon('external')+'</a><button class="button button-primary" data-action="new-product">'+icon('plus')+'Agregar producto</button>')+
      '<div class="toolbar"><label class="search-field">'+icon('search')+'<span class="sr-only">Buscar producto</span><input id="product-search" type="search" placeholder="Buscar un producto…" value="'+esc(state.productQuery)+'"></label><span class="muted" style="font-size:11px">'+data.products.filter(p=>p.available).length+' productos disponibles</span></div><div class="filter-tabs">'+categoryTabs(state.category,'filter-product')+'</div><div class="product-grid" id="products-content">'+filteredProductsHtml()+'</div>';
  }
  function filteredProductsHtml() {
    const products=data.products.filter(product=>(state.category==='Todos'||product.category===state.category) && product.name.toLowerCase().includes(state.productQuery.toLowerCase()));
    return products.length?products.map(product=>productCard(product)).join(''):empty('No encontramos ese producto','Prueba otra categoría o cambia la búsqueda.','utensils');
  }
  function renderClients() {
    const clients=Object.values(data.orders.reduce((all,order)=>{if(!all[order.phone]) all[order.phone]={name:order.customer,phone:order.phone,orders:[]};all[order.phone].orders.push(order);return all;},{}));
    return pageHeading('Personas que vuelven.','Los clientes de ejemplo que han pedido en tu negocio.','<span class="mini-pill">'+clients.length+' clientes</span>')+'<section class="clients-grid">'+clients.map(client=>'<article class="client-card"><div class="customer-avatar">'+esc(initials(client.name))+'</div><h2>'+esc(client.name)+'</h2><p>'+icon('phone')+' '+esc(client.phone)+'</p><div class="client-metrics"><div><small>Pedidos registrados</small><strong>'+client.orders.length+'</strong></div><div><small>Total en ventas</small><strong>'+money(client.orders.filter(isSale).reduce((sum,order)=>sum+orderTotal(order),0))+'</strong></div></div></article>').join('')+'</section>'+note('Los contactos son ficticios. En la versión conectada, cada cliente pertenecerá a su negocio.');
  }
  function renderReceipts() {
    const orders=data.orders.filter(isSale);
    return pageHeading('Cada venta, en su lugar.','Comprobantes internos de pedidos entregados y pagados.','<span class="mini-pill">'+orders.length+' comprobantes</span>')+'<section class="panel"><div class="table-wrap"><table><thead><tr><th>COMPROBANTE</th><th>CLIENTE</th><th>FECHA</th><th>PEDIDO</th><th>TOTAL</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>'+orders.map(order=>'<tr><td><strong>CMP-'+order.id+'</strong></td><td>'+esc(order.customer)+'</td><td>'+dateText(order.recognizedOn||order.date)+'</td><td>#FS-'+order.id+'</td><td><strong>'+money(orderTotal(order))+'</strong></td><td><button class="button button-quiet button-small" data-action="receipt" data-id="'+order.id+'">'+icon('receipt')+'Ver comprobante</button></td></tr>').join('')+'</tbody></table></div>'+(orders.length?'':empty('Aún no hay comprobantes','Se muestran cuando un pedido está entregado y pagado.','receipt'))+'</section>'+note('El comprobante es un documento interno de demostración. La facturación electrónica fiscal queda fuera de esta entrega.');
  }
  function renderReports() {
    const result=totals();
    return pageHeading('Claridad para seguir creciendo.','Consulta ventas, costos y gastos del período de ejemplo.','<button class="button button-quiet" data-action="export-report">'+icon('download')+'Exportar CSV</button>')+
      '<form id="report-filter" class="toolbar"><label class="form-field" style="margin:0">Desde<input type="date" name="from" value="'+state.reportFrom+'" required aria-label="Fecha inicial"></label><label class="form-field" style="margin:0">Hasta<input type="date" name="to" value="'+state.reportTo+'" required aria-label="Fecha final"></label><button class="button button-dark" type="submit">Aplicar período</button><button class="button button-quiet" data-action="week-report" type="button">Ver semana</button></form>'+
      '<section class="stats-grid">'+statCard('Ventas reconocidas',money(result.revenue),result.sales.length+' pedidos entregados y pagados','wallet')+statCard('Costo de productos',money(result.cost),'Costos conservados en cada pedido','utensils')+statCard('Gastos del período',money(result.expense),'Gastos operativos de ejemplo','receipt')+statCard('Resultado estimado',result.complete?money(result.result):'Incompleto','Margen: '+(result.complete?percent(result.margin):'sin calcular'),'chart','green-text')+'</section>'+
      '<section class="two-columns"><article class="panel"><div class="panel-head"><div><h2>Así se forma el resultado</h2><p>'+dateText(state.reportFrom)+' al '+dateText(state.reportTo)+'</p></div></div><div class="panel-body"><div class="financial-summary"><div class="financial-row"><span>Ventas</span><strong>'+money(result.revenue)+'</strong></div><div class="financial-row"><span>Menos costo de productos vendidos</span><span>− '+money(result.cost)+'</span></div><div class="financial-row"><span>Utilidad bruta</span><strong>'+money(result.gross)+'</strong></div><div class="financial-row"><span>Menos gastos operativos</span><span>− '+money(result.expense)+'</span></div><div class="financial-row total"><span>Resultado operativo estimado</span><strong>'+money(result.result)+'</strong></div><div class="financial-row margin"><span>Margen sobre ventas</span><strong>'+percent(result.margin)+'</strong></div></div>'+note('Los ingredientes incluidos en el costo del producto no se registran de nuevo como gasto. Los pedidos cancelados no cuentan como ventas.')+'</div></article><article class="panel"><div class="panel-head"><div><h2>Gastos operativos</h2><p>Un detalle pequeño también cuenta.</p></div><button class="button button-link" data-action="new-expense">'+icon('plus')+'Agregar</button></div><div class="panel-body">'+(result.periodExpenses.length?'<ul class="expenses-list">'+result.periodExpenses.map(expense=>'<li><div>'+esc(expense.name)+'<small>'+dateText(expense.date)+'</small></div><strong>'+money(expense.amount)+'</strong></li>').join('')+'</ul>':empty('Sin gastos en este período','Puedes agregar uno de ejemplo.','receipt'))+'</div></article></section>';
  }
  function renderBusiness() {
    const b=data.business;
    return pageHeading('Este es tu espacio.','Los detalles que identifican a tu negocio.')+'<section class="two-columns"><article class="panel"><div class="panel-body"><div class="business-profile"><span class="business-avatar">'+esc(initials(b.name))+'</span><div><h2>'+esc(b.name)+'</h2><p>Perfil del establecimiento</p></div></div><form id="business-form"><div class="form-grid">'+field('Nombre del negocio','business-name',input('business-name',b.name,'text','required maxlength="70"'))+field('Propietario','business-owner',input('business-owner',b.owner,'text','required maxlength="70"'))+field('Teléfono empresarial','business-phone',input('business-phone',b.phone,'tel','required pattern="[+0-9 ]{7,20}" maxlength="20"'))+field('Correo del negocio','business-email',input('business-email',b.email,'email','required'))+field('Ubicación','business-address',input('business-address',b.address,'text','required maxlength="120"'),true)+field('Horario','business-hours',input('business-hours',b.hours,'text','maxlength="120"'),true)+field('Descripción','business-description','<textarea id="business-description" name="business-description" maxlength="220">'+esc(b.description)+'</textarea>',true)+'</div><div class="form-actions"><button class="button button-primary" type="submit">Guardar cambios en la demo</button></div></form></div></article><div><article class="panel"><div class="panel-head"><h2>Tu menú, a un clic</h2></div><div class="panel-body"><p class="muted" style="font-size:12px">Explora la pantalla que verán tus clientes para elegir sus productos.</p><a href="menu.html" class="button button-dark" target="_blank" rel="noopener">Abrir menú público '+icon('external')+'</a></div></article>'+note('Los cambios de esta pantalla se conservan solo mientras esté abierta esta página. La información inicial vuelve al recargar.')+'<article class="panel"><div class="panel-body"><h3>Próxima entrega</h3><p class="muted" style="font-size:12px;margin:0">Cuentas de usuario, permisos por rol, datos separados por negocio y almacenamiento en el servidor.</p></div></article></div></section>';
  }
  function updateBusinessLabels(){ $$('[data-business-name]').forEach(el=>{el.textContent=data.business.name;}); const owner=$('.profile-name'); if(owner){owner.innerHTML=esc(data.business.owner)+'<small>Propietario · Demo</small>';$('.profile-button .avatar').textContent=initials(data.business.owner);} const mark=$('.workspace-avatar');if(mark)mark.textContent=initials(data.business.name); }
  function closeMobile(){ const sidebar=$('#sidebar');if(sidebar){sidebar.classList.remove('open');sidebar.inert=window.matchMedia('(max-width:760px)').matches;} $('#sidebar-shade')?.classList.remove('visible'); $('#mobile-toggle')?.setAttribute('aria-expanded','false'); }
  function navigate(view){ if(!viewNames[view]) view='resumen'; closeMobile(); if(location.hash==='#'+view){state.view=view;render();}else location.hash=view; }
  function render(){
    if(document.body.dataset.page!=='admin') return;
    state.view=viewNames[location.hash.slice(1)]?location.hash.slice(1):'resumen';
    const renderers={resumen:renderDashboard,pedidos:renderOrders,menu:renderMenu,clientes:renderClients,comprobantes:renderReceipts,reportes:renderReports,negocio:renderBusiness};
    $('#main').innerHTML=renderers[state.view]();
    $$('[data-view]', $('.nav')).forEach(el=>{el.classList.toggle('active',el.dataset.view===state.view);if(el.dataset.view===state.view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    $('#breadcrumb-current').textContent=viewNames[state.view];$('#pending-count').textContent=pendingOrders().length;
    document.title='Food-Sama · '+viewNames[state.view];updateBusinessLabels();
  }
  function productForm(id){
    const p=data.products.find(product=>product.id===Number(id));
    showDialog(p?'Editar producto':'Un nuevo favorito','Completa la ficha del producto de ejemplo.',
      '<form id="product-form" data-id="'+(p?p.id:'')+'"><div class="form-grid">'+field('Nombre del producto','product-name',input('product-name',p?.name||'','text','required maxlength="70"'),true)+field('Categoría','product-category','<select id="product-category" name="product-category">'+data.categories.slice(1).map(c=>'<option'+(p?.category===c?' selected':'')+'>'+esc(c)+'</option>').join('')+'</select>')+field('Estado','product-available','<select id="product-available" name="product-available"><option value="yes">Disponible</option><option value="no"'+(p&&!p.available?' selected':'')+'>No disponible</option></select>')+field('Precio de venta en COP','product-price',input('product-price',p?.price??'','number','required min="1" max="10000000" step="1"'))+field('Costo estimado en COP','product-cost',input('product-cost',p?.cost??'','number','required min="0" max="10000000" step="1"'))+field('Descripción','product-description','<textarea id="product-description" name="product-description" required maxlength="220">'+esc(p?.description||'')+'</textarea>',true)+'</div><p class="form-hint">Valores enteros en pesos colombianos. Los costos son información interna del negocio.</p></form>',
      '<button class="button button-quiet" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit" form="product-form">Guardar producto</button>');
  }
  function newOrder(){
    const available=data.products.filter(product=>product.available);
    if(!available.length){toast('Activa un producto antes de crear un pedido.',true);return;}
    showDialog('Nuevo pedido','Simula un pedido recibido por la web, una llamada o un chat.',
      '<form id="new-order-form"><div class="form-grid">'+field('Nombre del cliente','order-customer',input('order-customer','','text','required maxlength="70"'))+field('Teléfono del cliente','order-phone',input('order-phone','','tel','required pattern="[+0-9 ]{7,20}" maxlength="20"'))+field('Origen del pedido','order-source','<select id="order-source" name="order-source"><option>Teléfono</option><option>Chat</option><option>Web</option></select>')+field('Modalidad de entrega','order-delivery','<select id="order-delivery" name="order-delivery"><option>Recoger</option><option>Domicilio</option></select>')+'<div id="address-field" class="form-field span-two" hidden><label for="order-address">Dirección de entrega</label><input id="order-address" name="order-address" maxlength="160"></div></div><h3 style="margin-top:22px">¿Qué vamos a preparar?</h3><div class="line-items">'+available.map(product=>'<div class="line-item"><label for="qty-'+product.id+'">'+esc(product.name)+'<small>'+money(product.price)+'</small></label><input id="qty-'+product.id+'" name="qty-'+product.id+'" type="number" value="0" min="0" max="99" step="1" data-quantity="'+product.id+'" aria-label="Cantidad de '+esc(product.name)+'"></div>').join('')+'</div>'+field('Observaciones','order-notes','<textarea id="order-notes" name="order-notes" maxlength="300" placeholder="Ej. Sin cebolla, salsa aparte…"></textarea>')+'<div class="order-total"><span>Total del pedido</span><strong id="new-order-total">$0</strong></div></form>',
      '<button class="button button-quiet" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit" form="new-order-form">Crear pedido de ejemplo</button>');
  }
  function itemTable(order){ return '<table class="detail-items"><thead><tr><th>PRODUCTO</th><th>CANT.</th><th>SUBTOTAL</th></tr></thead><tbody>'+order.items.map(item=>'<tr><td>'+esc(item.name)+'<small style="display:block;color:var(--muted)">'+money(item.price)+' c/u</small></td><td>'+item.quantity+'</td><td>'+money(item.price*item.quantity)+'</td></tr>').join('')+'</tbody></table>'; }
  function orderDetail(id){
    const order=data.orders.find(item=>item.id===Number(id));if(!order)return;
    const terminal=isSale(order)||order.status==='Cancelado';
    let statusForm=terminal?note(isSale(order)?'Este pedido ya está entregado y pagado. Su comprobante está disponible.':'Pedido cancelado. No se incluye en las ventas.'):
      '<form id="order-state-form" data-id="'+order.id+'" style="margin-top:18px"><div class="form-grid">'+field('Estado de atención','state-status','<select id="state-status" name="status">'+['Pendiente','En preparación','Entregado','Cancelado'].map(s=>'<option'+(order.status===s?' selected':'')+'>'+s+'</option>').join('')+'</select>')+'<div class="form-field"><label>Confirmación de pago</label><label class="checkbox-field"><input type="checkbox" name="paid"'+(order.paid?' checked':'')+'>Pago recibido</label></div><div class="form-field span-two" id="cancel-reason-field" hidden><label for="cancel-reason">Motivo de cancelación</label><input name="reason" id="cancel-reason" maxlength="200"></div></div></form>';
    showDialog('Pedido #FS-'+order.id,dateText(order.date)+' · '+order.time,
      '<div class="detail-grid"><div><small>Cliente</small><strong>'+esc(order.customer)+'</strong></div><div><small>Teléfono</small>'+esc(order.phone)+'</div><div><small>Origen y entrega</small>'+esc(order.source)+' · '+esc(order.delivery)+'</div><div><small>Estado actual</small>'+badge(order.status)+' '+paymentBadge(order.paid)+'</div>'+(order.address?'<div class="span-two"><small>Dirección</small>'+esc(order.address)+'</div>':'')+(order.notes?'<div class="span-two"><small>Observaciones</small>'+esc(order.notes)+'</div>':'')+'</div>'+itemTable(order)+'<div class="order-total"><span>Total</span><strong>'+money(orderTotal(order))+'</strong></div>'+statusForm,
      '<button class="button button-quiet" data-action="close-dialog">Cerrar</button>'+(isSale(order)?'<button class="button button-primary" data-action="receipt" data-id="'+order.id+'">'+icon('receipt')+'Ver comprobante</button>':!terminal?'<button class="button button-primary" type="submit" form="order-state-form">Actualizar en la demo</button>':''));
  }
  function receipt(id){
    const order=data.orders.find(item=>item.id===Number(id));if(!order || !isSale(order)) {toast('El pedido debe estar entregado y pagado.',true);return;}
    showDialog('Comprobante CMP-'+order.id,'Vista imprimible de ejemplo.',
      '<div class="receipt"><div class="receipt-heading"><h3>'+esc(data.business.name)+'</h3><p>'+esc(data.business.phone)+'</p><p>'+esc(data.business.address)+'</p><p>Comprobante interno CMP-'+order.id+'</p></div><div class="detail-grid"><div><small>Cliente</small>'+esc(order.customer)+'</div><div><small>Fecha de venta</small>'+dateText(order.recognizedOn||order.date)+'</div><div><small>Pedido</small>FS-'+order.id+'</div><div><small>Estado</small>Entregado y pagado</div></div>'+itemTable(order)+'<div class="order-total"><span>Total en COP</span><strong>'+money(orderTotal(order))+'</strong></div><p class="receipt-note">Gracias por apoyar nuestra cocina.<br>Documento interno de demostración. No es factura electrónica fiscal.</p></div>',
      '<button class="button button-quiet" data-action="close-dialog">Cerrar</button><button class="button button-primary" data-action="print">'+icon('print')+'Imprimir o guardar PDF</button>');
  }
  function expenseForm(){
    showDialog('Registrar gasto','Agrega un gasto operativo de ejemplo.','<form id="expense-form"><div class="form-grid">'+field('Concepto','expense-name',input('expense-name','','text','required maxlength="90"'),true)+field('Valor en COP','expense-amount',input('expense-amount','','number','required min="1" max="100000000" step="1"'))+field('Fecha','expense-date',input('expense-date',data.date,'date','required'))+'</div>'+note('No incluyas nuevamente los ingredientes que ya están en el costo de cada producto.')+'</form>','<button class="button button-quiet" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit" form="expense-form">Guardar gasto</button>');
  }
  function exportReport(){
    const result=totals();
    const rows=[['Food-Sama — reporte de ejemplo'],['Desde',state.reportFrom],['Hasta',state.reportTo],['Concepto','Valor COP'],['Ventas',result.revenue],['Costos',result.cost],['Utilidad bruta',result.gross],['Gastos',result.expense],['Resultado estimado',result.result],['Margen porcentual',result.margin==null?'No calculable':result.margin.toFixed(2)]];
    const csv='\uFEFF'+rows.map(row=>row.map(cell=>'"'+String(cell).replace(/"/g,'""')+'"').join(';')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'})); const a=document.createElement('a');a.href=url;a.download='food-sama-reporte-'+state.reportFrom+'-al-'+state.reportTo+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Se descargó el reporte de ejemplo.');
  }

  /* Menú del cliente: carrito y formulario de pedido de demostración. */
  function renderPublic(){
    $('#public-filters').innerHTML=categoryTabs(state.publicCategory,'filter-public');
    const products=data.products.filter(product=>product.available && (state.publicCategory==='Todos'||product.category===state.publicCategory));
    $('#public-products').innerHTML=products.length?products.map(product=>productCard(product,true)).join(''):empty('Muy pronto, más opciones','Prueba otra categoría del menú.','utensils');
    $('#cart-count').textContent=Object.values(state.cart).reduce((sum,q)=>sum+q,0);
  }
  function cartItems(){return Object.entries(state.cart).map(([id,quantity])=>({product:data.products.find(p=>p.id===Number(id)),quantity})).filter(item=>item.product && item.quantity>0);}
  function openCart(){
    const items=cartItems();
    if(!items.length){showDialog('Tu pedido','Aquí se reúnen tus favoritos.',empty('Tu pedido está esperando','Agrega un producto del menú para comenzar.'),'<button class="button button-primary" data-action="close-dialog">Seguir explorando</button>');return;}
    showDialog('Tu pedido','Revisa los productos antes de continuar.',items.map(({product,quantity})=>'<div class="cart-line"><img src="assets/img/'+esc(product.image)+'" alt="" width="58" height="50"><div><strong>'+esc(product.name)+'</strong><small>'+money(product.price)+'</small></div><div class="quantity-control"><button aria-label="Quitar una unidad de '+esc(product.name)+'" data-action="cart-minus" data-id="'+product.id+'">−</button><span>'+quantity+'</span><button aria-label="Agregar una unidad de '+esc(product.name)+'" data-action="cart-plus" data-id="'+product.id+'">+</button></div></div>').join('')+'<div class="order-total"><span>Total en COP</span><strong>'+money(items.reduce((sum,item)=>sum+item.product.price*item.quantity,0))+'</strong></div>',
      '<button class="button button-quiet" data-action="close-dialog">Seguir eligiendo</button><button class="button button-primary" data-action="checkout">Continuar '+icon('arrow')+'</button>');
  }
  function checkout(){
    if(!cartItems().length){openCart();return;}
    showDialog('Un último detalle','Completa los datos para simular tu pedido.',
      '<form id="checkout-form"><div class="form-grid">'+field('Tu nombre','checkout-name',input('checkout-name','','text','required maxlength="70"'))+field('Tu teléfono','checkout-phone',input('checkout-phone','','tel','required pattern="[+0-9 ]{7,20}" maxlength="20"'))+field('¿Cómo lo recibes?','checkout-delivery','<select id="checkout-delivery" name="delivery"><option>Recoger</option><option>Domicilio</option></select>',true)+'<div class="form-field span-two" id="checkout-address-field" hidden><label for="checkout-address">Dirección</label><input id="checkout-address" name="address" maxlength="160"></div>'+field('Observaciones','checkout-notes','<textarea id="checkout-notes" name="notes" placeholder="¿Algo que debamos tener en cuenta?" maxlength="300"></textarea>',true)+'</div>'+note('Es una simulación: no se envían datos, no se cobra ni se confirma una compra real. El domicilio no tiene un valor calculado en esta entrega.')+'</form>',
      '<button class="button button-quiet" data-action="open-cart">Volver al pedido</button><button class="button button-primary" type="submit" form="checkout-form">Simular pedido</button>');
  }

  /* Eventos delegados para las vistas generadas. */
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action,id=Number(button.dataset.id);
    if(action==='close-dialog')dialog.close();
    else if(action==='go')navigate(button.dataset.view);
    else if(action==='new-order')newOrder();
    else if(action==='view-order')orderDetail(id);
    else if(action==='receipt')receipt(id);
    else if(action==='print'){document.body.classList.add('printing');window.print();}
    else if(action==='new-product'||action==='edit-product')productForm(id);
    else if(action==='toggle-product'){const product=data.products.find(p=>p.id===id);if(product){product.available=!product.available;render();toast(product.available?'Producto disponible en la demo.':'Producto pausado en la demo.');}}
    else if(action==='filter-product'){state.category=button.dataset.category;render();}
    else if(action==='new-expense')expenseForm();
    else if(action==='export-report')exportReport();
    else if(action==='week-report'){state.reportFrom='2026-10-18';state.reportTo=data.date;render();}
    else if(action==='filter-public'){state.publicCategory=button.dataset.category;renderPublic();}
    else if(action==='cart-add'){const count=state.cart[id]||0;if(count>=99){toast('Máximo 99 unidades de un producto en esta demo.',true);return;}state.cart[id]=count+1;renderPublic();toast('Agregado a tu pedido.');}
    else if(action==='open-cart')openCart();
    else if(action==='cart-plus'||action==='cart-minus'){const next=(state.cart[id]||0)+(action==='cart-plus'?1:-1);if(next>99){toast('Máximo 99 unidades.',true);return;}if(next<=0)delete state.cart[id];else state.cart[id]=next;renderPublic();openCart();}
    else if(action==='checkout')checkout();
  });
  document.addEventListener('input',event=>{
    const el=event.target;
    if(el.id==='product-search'){state.productQuery=el.value;$('#products-content').innerHTML=filteredProductsHtml();}
    else if(el.id==='order-search'){state.orderQuery=el.value;$('#orders-content').innerHTML=filteredOrdersHtml();}
    else if(el.hasAttribute('data-quantity')){const total=$$('[data-quantity]',dialog).reduce((sum,item)=>{const product=data.products.find(p=>p.id===Number(item.dataset.quantity));return sum+(Number(item.value)||0)*product.price;},0);$('#new-order-total').textContent=money(total);}
    else if(el.id==='global-search'){
      const query=el.value.trim().toLowerCase();const results=$('#search-results');if(!query){results.hidden=true;return;}
      const orders=data.orders.filter(order=>('fs-'+order.id+' '+order.customer).toLowerCase().includes(query)).slice(0,3);
      const products=data.products.filter(product=>product.name.toLowerCase().includes(query)).slice(0,3);
      results.innerHTML=orders.map(order=>'<button class="search-result" data-action="view-order" data-id="'+order.id+'"><span>#FS-'+order.id+' · '+esc(order.customer)+'</span><small>Pedido</small></button>').join('')+products.map(product=>'<button class="search-result" data-action="edit-product" data-id="'+product.id+'"><span>'+esc(product.name)+'</span><small>Producto</small></button>').join('');
      if(!results.innerHTML)results.innerHTML='<p class="search-empty">No hay resultados de ejemplo.</p>';results.hidden=false;
    }
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.id==='order-status'){state.orderStatus=el.value;$('#orders-content').innerHTML=filteredOrdersHtml();}
    if(el.id==='order-payment'){state.orderPayment=el.value;$('#orders-content').innerHTML=filteredOrdersHtml();}
    if(el.id==='order-delivery'){const active=el.value==='Domicilio';$('#address-field').hidden=!active;$('#order-address').required=active;}
    if(el.id==='checkout-delivery'){const active=el.value==='Domicilio';$('#checkout-address-field').hidden=!active;$('#checkout-address').required=active;}
    if(el.id==='state-status'){const active=el.value==='Cancelado';$('#cancel-reason-field').hidden=!active;$('#cancel-reason').required=active;}
  });
  document.addEventListener('submit',event=>{
    const form=event.target;event.preventDefault();
    if(!form.checkValidity()){form.reportValidity();return;}
    const values=new FormData(form);
    if(form.id==='product-form'){
      const price=Number(values.get('product-price')),cost=Number(values.get('product-cost'));
      if(!Number.isSafeInteger(price)||price<=0||!Number.isSafeInteger(cost)||cost<0){toast('Usa valores enteros válidos en pesos.',true);return;}
      const name=String(values.get('product-name')).trim(),description=String(values.get('product-description')).trim();if(!name||!description){toast('Completa el nombre y la descripción.',true);return;}
      const existing=data.products.find(product=>product.id===Number(form.dataset.id));const category=values.get('product-category');
      const art={Hamburguesas:['burger.svg','peach'],Pizzas:['pizza.svg','sage'],Especiales:['bowl.svg','lavender'],Acompañamientos:['fries.svg','butter'],Bebidas:['lemonade.svg','sage']}[category];
      const product={id:existing?.id||Math.max(0,...data.products.map(p=>p.id))+1,name,category,description,price,cost,available:values.get('product-available')==='yes',image:existing?.image||art[0],color:existing?.color||art[1]};
      if(existing)Object.assign(existing,product);else data.products.push(product);dialog.close();render();toast('Producto guardado en la demostración.');
    }else if(form.id==='new-order-form'){
      const quantities=$$('[data-quantity]',form);const items=[];
      for(const el of quantities){const quantity=Number(el.value);if(!Number.isInteger(quantity)||quantity<0||quantity>99){toast('Revisa las cantidades del pedido.',true);return;}if(quantity>0){const p=data.products.find(p=>p.id===Number(el.dataset.quantity));items.push({productId:p.id,name:p.name,quantity,price:p.price,cost:p.cost});}}
      if(!items.length){toast('Selecciona al menos un producto.',true);return;}
      const customer=String(values.get('order-customer')).trim();if(!customer){toast('Escribe el nombre del cliente.',true);return;}
      const id=Math.max(...data.orders.map(order=>order.id))+1;
      data.orders.unshift({id,date:data.date,time:new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()),customer,phone:String(values.get('order-phone')).trim(),source:values.get('order-source'),delivery:values.get('order-delivery'),address:values.get('order-delivery')==='Domicilio'?String(values.get('order-address')).trim():'',notes:String(values.get('order-notes')).trim(),status:'Pendiente',paid:false,items});
      dialog.close();render();toast('Pedido #FS-'+id+' creado en la demo.');
    }else if(form.id==='order-state-form'){
      const order=data.orders.find(item=>item.id===Number(form.dataset.id));if(!order||isSale(order)||order.status==='Cancelado')return;
      const next=values.get('status'),paid=values.get('paid')==='on';const rank={'Pendiente':0,'En preparación':1,'Entregado':2};
      if(next!=='Cancelado' && rank[next]<rank[order.status]){toast('El estado de atención debe avanzar en la demo.',true);return;}
      if(next==='Cancelado' && !String(values.get('reason')||'').trim()){toast('Indica el motivo de cancelación.',true);return;}
      order.status=next;order.paid=next==='Cancelado'?false:paid;
      if(next==='Cancelado')order.notes='Cancelado: '+String(values.get('reason')).trim();
      if(isSale(order))order.recognizedOn=data.date;
      dialog.close();render();toast('Pedido actualizado en la demostración.');
    }else if(form.id==='report-filter'){
      const from=values.get('from'),to=values.get('to');if(from>to){toast('La fecha inicial debe ser anterior o igual a la final.',true);return;}state.reportFrom=from;state.reportTo=to;render();
    }else if(form.id==='expense-form'){
      const amount=Number(values.get('expense-amount')),name=String(values.get('expense-name')).trim();if(!Number.isSafeInteger(amount)||amount<=0||!name){toast('Revisa el concepto y el valor del gasto.',true);return;}data.expenses.push({id:Date.now(),date:values.get('expense-date'),name,amount});dialog.close();render();toast('Gasto agregado a la demo.');
    }else if(form.id==='business-form'){
      const name=String(values.get('business-name')).trim(),owner=String(values.get('business-owner')).trim();if(!name||!owner){toast('Completa el nombre del negocio y su propietario.',true);return;}
      data.business={name,owner,phone:String(values.get('business-phone')).trim(),email:String(values.get('business-email')).trim(),address:String(values.get('business-address')).trim(),hours:String(values.get('business-hours')).trim(),description:String(values.get('business-description')).trim()};render();toast('Perfil actualizado solo en esta página de demostración.');
    }else if(form.id==='checkout-form'){
      const name=String(values.get('checkout-name')).trim();if(!name){toast('Escribe tu nombre.',true);return;}
      const total=cartItems().reduce((sum,item)=>sum+item.product.price*item.quantity,0);state.cart={};renderPublic();
      showDialog('¡Así se vería tu confirmación!','Recorrido del cliente completado.', '<div class="confirmation"><div class="confirmation-icon">'+icon('check')+'</div><h3>Gracias, '+esc(name)+'.</h3><p>Pedido de ejemplo <strong>FS-DEMO-001</strong><br>Total: <strong>'+money(total)+'</strong></p>'+note('No se creó una compra real ni se envió información al panel. La conexión entre estas pantallas se realizará con el servidor en una entrega posterior.')+'</div>','<button class="button button-primary" data-action="close-dialog">Volver al menú</button>');
    }else if(form.id==='access-form'){
      showDialog('Vista de acceso completada','Esta pantalla muestra el formulario de la primera entrega.',note('No se validaron credenciales ni se creó una cuenta. Puedes continuar al panel de demostración; la autenticación se implementará en el servidor.'),'<button class="button button-quiet" data-action="close-dialog">Volver</button><a class="button button-primary" href="index.html">Explorar panel '+icon('arrow')+'</a>');
    }
  });
  window.addEventListener('afterprint',()=>document.body.classList.remove('printing'));
  hydrateIcons();
  const page=document.body.dataset.page;
  if(page==='admin'){
    window.addEventListener('hashchange',()=>{closeMobile();render();window.scrollTo(0,0);$('#main').focus({preventScroll:true});});render();closeMobile();
    window.matchMedia('(max-width:760px)').addEventListener('change',closeMobile);
    $('#mobile-toggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#sidebar').inert=!open;$('#sidebar-shade').classList.toggle('visible',open);$('#mobile-toggle').setAttribute('aria-expanded',String(open));});
    $('#sidebar-shade').addEventListener('click',closeMobile);
    $('#profile-button').addEventListener('click',()=>navigate('negocio'));
    $('#notifications').addEventListener('click',()=>{state.orderStatus='Pendiente';navigate('pedidos');});
    $('#about-demo').addEventListener('click',()=>showDialog('Una primera mirada a Food-Sama','Interfaz de la primera entrega.', '<p>Explora el panel, el menú y los formularios con datos de ejemplo. Las interacciones permiten mostrar el recorrido del negocio y del cliente.</p>'+note('Los cambios se reinician al recargar. No hay cuentas reales, base de datos, envío de pedidos ni conexión automática con WhatsApp.'),'<button class="button button-primary" data-action="close-dialog">Entendido</button>'));
    document.addEventListener('click',event=>{if(!event.target.closest('.global-search'))$('#search-results').hidden=true;});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('#search-results').hidden=true;closeMobile();}});
  }else if(page==='public'){
    renderPublic();$('#open-cart').addEventListener('click',openCart);
  }else if(page==='access'){
    function accessTab(register){$('#register-fields').hidden=!register;$$('input',$('#register-fields')).forEach(el=>{el.required=register;});$('#tab-login').classList.toggle('active',!register);$('#tab-register').classList.toggle('active',register);$('#tab-login').setAttribute('aria-pressed',String(!register));$('#tab-register').setAttribute('aria-pressed',String(register));$('#access-title').textContent=register?'Tu negocio empieza aquí':'Bienvenido de nuevo';$('#access-description').textContent=register?'Dale un espacio propio a lo que cocinas.':'Tu negocio tiene un nuevo día por delante.';$('#access-submit').innerHTML=(register?'Ver registro de ejemplo':'Ver acceso de ejemplo')+' <span aria-hidden="true">→</span>';$('#access-password').setAttribute('autocomplete',register?'new-password':'current-password');}
    $('#tab-login').addEventListener('click',()=>accessTab(false));$('#tab-register').addEventListener('click',()=>accessTab(true));
  }
})();
