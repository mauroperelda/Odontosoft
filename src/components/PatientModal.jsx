import { useState } from "react";
import { X } from "lucide-react";
import SearchPatientForm from "./SearchPatientForm";
import ManualLoadForm from "./ManualLoadForm";

export default function PatientModal({ selectedDateLabel, onClose }) {
  const [activeTab, setActiveTab] = useState("buscar");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400 mb-2">Agendar turno</p>
            <h3 className="text-xl font-semibold text-slate-900">{selectedDateLabel}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab("buscar")}
            className={`px-4 py-3 transition ${
              activeTab === "buscar" ? "bg-white text-slate-900" : "bg-transparent"
            }`}
          >
            Buscar paciente
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-3 transition ${
              activeTab === "manual" ? "bg-white text-slate-900" : "bg-transparent"
            }`}
          >
            Carga manual
          </button>
        </div>

        {activeTab === "buscar" ? <SearchPatientForm /> : <ManualLoadForm />}
      </div>
    </div>
  );
}
