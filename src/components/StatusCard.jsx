import '../styles/cards.css';

function StatusCard({ icon: Icon, title, value, color, bgColor }) {
  return (
    <div className="status-card" style={{ borderLeftColor: color }}>
      <div className="card-icon-wrapper" style={{ backgroundColor: bgColor }}>
        <Icon size={24} color={color} />
      </div>
      <div className="card-info">
        <h3 className="card-title">{title}</h3>
        <p className="card-value" style={{ color }}>{value}</p>
      </div>
    </div>
  );
}

export default StatusCard;