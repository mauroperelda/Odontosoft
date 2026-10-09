import Topbar from "./Topbar";

export default function ContentLayout({ children, headerProps }) {
  return (
    <div className="app-container">
      <div className="main-content">
        <Topbar title={headerProps?.pageTitle} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
