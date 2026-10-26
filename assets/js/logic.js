/* Cálculos exclusivos de la demostración. El servidor validará estos datos en una entrega posterior. */
(function (root) {
  'use strict';
  const orderTotal = order => order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const orderCost = order => order.items.reduce((sum, item) => sum + item.quantity * (item.cost ?? 0), 0);
  const isSale = order => order.status === 'Entregado' && order.paid === true;
  function summarize(orders, expenses, from, to) {
    const sales = orders.filter(order => isSale(order) && (order.recognizedOn || order.date) >= from && (order.recognizedOn || order.date) <= to);
    const periodExpenses = expenses.filter(expense => expense.date >= from && expense.date <= to);
    const revenue = sales.reduce((sum, order) => sum + orderTotal(order), 0);
    const cost = sales.reduce((sum, order) => sum + orderCost(order), 0);
    const expense = periodExpenses.reduce((sum, item) => sum + item.amount, 0);
    const complete = sales.every(order => order.items.every(item => Number.isFinite(item.cost) && item.cost >= 0));
    return { sales, revenue, cost, expense, gross: revenue - cost, result: revenue - cost - expense, margin: revenue ? (revenue - cost - expense) / revenue * 100 : null, complete, periodExpenses };
  }
  root.FoodSamaLogic = { orderTotal, orderCost, isSale, summarize };
})(globalThis);
