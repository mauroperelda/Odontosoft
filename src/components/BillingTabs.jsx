export default function BillingTabs({ activeTab, onTabChange, invoiceCount }) {
  return (
    <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex divide-x divide-slate-200 text-sm font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => onTabChange("new")}
          className={`flex-1 px-5 py-4 transition ${activeTab === "new" ? "bg-slate-50 text-slate-900" : "bg-white hover:bg-slate-50"}`}
        >
          + Nueva factura
        </button>
        <button
          type="button"
          onClick={() => onTabChange("list")}
          className={`flex-1 px-5 py-4 transition ${activeTab === "list" ? "bg-slate-50 text-slate-900" : "bg-white hover:bg-slate-50"}`}
        >
          Listado de facturas
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            {invoiceCount}
          </span>
        </button>
      </div>
    </div>
  );
}
