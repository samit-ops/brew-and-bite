export default function OrderStatusBadge({ status }) {
  let colorClass = "";
  let label = "";

  switch (status) {
    case "received":
      colorClass = "bg-blue-500/10 text-blue-400 border-blue-500/20";
      label = "Received";
      break;
    case "preparing":
      colorClass = "bg-brand-amber/10 text-brand-amber border-brand-amber/20";
      label = "Preparing";
      break;
    case "out-for-delivery":
      colorClass = "bg-purple-500/10 text-purple-400 border-purple-500/20";
      label = "Out for Delivery";
      break;
    case "delivered":
      colorClass = "bg-green-500/10 text-green-400 border-green-500/20";
      label = "Delivered";
      break;
    default:
      colorClass = "bg-gray-500/10 text-gray-400 border-gray-500/20";
      label = "Unknown";
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border tracking-wider uppercase ${colorClass}`}>
      {label}
    </span>
  );
}
