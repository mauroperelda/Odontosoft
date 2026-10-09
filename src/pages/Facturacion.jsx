import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layout/MainLayout";
import BillingHeader from "../components/BillingHeader";
import BillingTabs from "../components/BillingTabs";
import InvoiceForm from "../components/InvoiceForm";
import InvoiceTable from "../components/InvoiceTable";
import { PageLoader } from "../components/Loader";
import { formatApiError } from "../services/apiErrors";
import { errorAlert, toastSuccess } from "../utils/swal";
import {
  createInvoiceWithDetails,
  getInvoices,
} from "../services/invoices";
import { getUbicaciones } from "../services/ubicaciones";
import { getTratamientosConPrecios } from "../services/tratamientos";
import { getPatients } from "../services/patients";

export default function Facturacion() {
  const [activeTab, setActiveTab] = useState("new");
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [tratamientos, setTratamientos] = useState([]); // con precios
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [invoiceData, patientData, ubicacionesData, tratamientosData] =
          await Promise.all([
            getInvoices(),
            getPatients(),
            getUbicaciones(),
            getTratamientosConPrecios(),
          ]);

        setInvoices(invoiceData ?? []);

        // getPatients devuelve un PagedResult; extraemos items.
        const rawPatients = Array.isArray(patientData)
          ? patientData
          : patientData?.items ?? [];
        setPatients(rawPatients);

        setUbicaciones(Array.isArray(ubicacionesData) ? ubicacionesData : []);
        setTratamientos(
          Array.isArray(tratamientosData) ? tratamientosData : []
        );
      } catch (err) {
        const { message } = formatApiError(err);
        errorAlert({
          title: "No se pudieron cargar los datos de facturación",
          text: message,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const invoiceCount = invoices.length;
  const todayCount = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return invoices.filter((invoice) => {
      const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString() : "";
      return invoiceDate === today;
    }).length;
  }, [invoices]);

  const totalFacturado = useMemo(() => {
    const total = invoices.reduce((sum, invoice) => {
      // `amount` viene como number desde invoices.js (ver pagoToInvoice).
      // `total` viene como string formato "$X.XXX,XX", por eso Number()
      // devuelve NaN. Usamos amount, y caemos a total solo si es number.
      const raw = invoice.amount ?? invoice.total;
      const amount = typeof raw === "number" ? raw : Number(raw) || 0;
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
    return `$${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [invoices]);

  const billingStats = {
    totalLabel: `${totalFacturado} total`,
    today: `${todayCount}`,
    total: totalFacturado,
    totalTrend: "+0%",
    totalUp: true,
    locations: `${ubicaciones.length}`,
    activePatients: `${patients.length}`,
  };

  const handleSaveInvoice = async (formValues) => {
    setSaving(true);
    try {
      await createInvoiceWithDetails(formValues);
      // Refrescamos el listado de pagos para que aparezca la factura nueva.
      const fresh = await getInvoices();
      setInvoices(fresh);
      setActiveTab("list");
      toastSuccess("Factura guardada correctamente.");
    } catch (err) {
      const { message, fieldErrors } = formatApiError(err);
      // Si el back devuelve errores por campo, los mostramos en el form en
      // lugar de tirar un alert genérico.
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        return fieldErrors;
      }
      errorAlert({
        title: "No se pudo guardar la factura",
        text: message,
      });
      return null;
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout headerProps={{ pageTitle: "Facturación" }}>
      <BillingHeader stats={billingStats} />
      <BillingTabs activeTab={activeTab} onTabChange={setActiveTab} invoiceCount={invoiceCount} />

      {activeTab === "new" ? (
        <InvoiceForm
          onSave={handleSaveInvoice}
          patients={patients}
          ubicaciones={ubicaciones}
          tratamientos={tratamientos}
          saving={saving}
        />
      ) : (
        <div className="space-y-6">
          {loading ? (
            <PageLoader message="Cargando facturas..." />
          ) : (
            <InvoiceTable invoices={invoices} />
          )}
        </div>
      )}
    </MainLayout>
  );
}
