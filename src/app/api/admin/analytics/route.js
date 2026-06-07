import dbconnect from "@/lib/db";
import Order from "@/lib/models/Order";

export async function GET() {
  await dbconnect();

  const orders = await Order.find();

  // 📦 TOTAL ORDERS
  const totalOrders = orders.length;

  // 💰 TOTAL REVENUE
  const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // 📊 AVG ORDER VALUE
  const avgOrderValue = totalOrders ? revenue / totalOrders : 0;

  // 👤 NEW + REPEAT CUSTOMERS
  const customerMap = {};

  orders.forEach(order => {
    const key = order.customer.phone;

    if (!customerMap[key]) {
      customerMap[key] = [];
    }

    customerMap[key].push(order.createdAt);
  });

  let newCustomers = 0;
  const today = new Date().toDateString();

  Object.values(customerMap).forEach(dates => {
    const firstOrderDate = new Date(
      dates.sort((a, b) => new Date(a) - new Date(b))[0]
    ).toDateString();

    if (firstOrderDate === today) {
      newCustomers++;
    }
  });

  const totalCustomers = Object.keys(customerMap).length;
  const repeatCustomers = totalCustomers - newCustomers;

  // 📈 SALES LAST 7 DAYS (FIXED + COMPLETE)
  const salesMap = {};

  // Pre-fill last 7 days (so graph never breaks)
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];
    salesMap[key] = 0;
  }

  // Fill actual data
  orders.forEach(order => {
    const date = new Date(order.createdAt).toISOString().split("T")[0];

    if (salesMap[date] !== undefined) {
      salesMap[date] += order.totalAmount;
    }
  });

  // Convert to sorted array
  const salesLast7Days = Object.entries(salesMap)
    .map(([date, revenue]) => ({
      date,
      revenue,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

    const itemMap = {};

orders.forEach(order => {
  order.items.forEach(item => {
    itemMap[item.name] = (itemMap[item.name] || 0) + item.quantity;
  });
});

const topItems = Object.entries(itemMap)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

  const hourMap = {};

orders.forEach(order => {
  const hour = new Date(order.createdAt).getHours();

  hourMap[hour] = (hourMap[hour] || 0) + 1;
});

const peakHours = Object.entries(hourMap)
  .map(([hour, count]) => ({ hour: Number(hour), count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

  const now = new Date();

// Last 7 days
const last7Start = new Date();
last7Start.setDate(now.getDate() - 6);

// Previous 7 days
const prev7Start = new Date();
prev7Start.setDate(now.getDate() - 13);

const prev7End = new Date();
prev7End.setDate(now.getDate() - 7);

let last7Revenue = 0;
let prev7Revenue = 0;

orders.forEach(order => {
  const date = new Date(order.createdAt);

  if (date >= last7Start) {
    last7Revenue += order.totalAmount;
  } else if (date >= prev7Start && date <= prev7End) {
    prev7Revenue += order.totalAmount;
  }
});

const weeklyTrend =
  prev7Revenue === 0
    ? 100
    : ((last7Revenue - prev7Revenue) / prev7Revenue) * 100;

    let totalItems = 0;

orders.forEach(order => {
  order.items.forEach(item => {
    totalItems += item.quantity;
  });
});

const avgItemsPerOrder =
  totalOrders ? totalItems / totalOrders : 0;

  const bestDay = salesLast7Days.reduce((max, curr) =>
  curr.revenue > max.revenue ? curr : max
);

const statusCounts = {
  received: 0,
  preparing: 0,
  "out-for-delivery": 0,
  delivered: 0,
};

orders.forEach(order => {
  statusCounts[order.status]++;
});


  return Response.json({
    success: true,
    data: {
      totalOrders,
      revenue,
      avgOrderValue,
      newCustomers,
      repeatCustomers,
      salesLast7Days,
      topItems,
peakHours,
weeklyTrend,
avgItemsPerOrder,
bestDay,
statusCounts,
    },
  });
  
}