export default function InvoiceTable({ invoices }) {
  return (
    <div className="table-responsive rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-[0.16em] text-[11px]">
          <tr>
            <th className="px-3 py-3 md:px-6 md:py-4">Nro. factura</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Cliente</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Monto</th>
            <th className="px-3 py-3 md:px-6 md:py-4">Estado</th>
            <th className="px-3 py-3 md:px-6 md:py-4 hidden md:table-cell">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr className="border-t border-slate-200">
              <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                No hay facturas registradas aún.
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr key={invoice.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-3 md:px-6 md:py-4 font-medium text-slate-900 whitespace-nowrap">{invoice.number || invoice.id}</td>
                <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600">
                  <span className="block max-w-[140px] md:max-w-none truncate">{invoice.customerName || invoice.customer}</span>
                </td>
                <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600 whitespace-nowrap">{invoice.total || invoice.amount}</td>
                <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600">{invoice.status || "Pendiente"}</td>
                <td className="px-3 py-3 md:px-6 md:py-4 text-slate-600 whitespace-nowrap hidden md:table-cell">{invoice.date ? new Date(invoice.date).toLocaleDateString() : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
