export default function Header({ date, title, subtitle, action }) {
  return (
    <header className="header">
      <div>
        {date && <span className="header-date">{date}</span>}
        <h1 className="header-title">{title || "Buenos días"}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      {action && (
        <button className="header-btn" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </header>
  );
}