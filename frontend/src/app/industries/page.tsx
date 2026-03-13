"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Factory,
  Plus,
  Pencil,
  Trash2,
  X,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useIndustries, type Industry } from "@/lib/hooks";
import { api } from "@/lib/api";

// ── Status config ─────────────────────────────────────────────────────
const statusConfig: Record<
  Industry["status"],
  { color: string; bg: string; border: string; icon: typeof CheckCircle2; label: string }
> = {
  Compliant: {
    color: "text-accent-green",
    bg: "bg-accent-green/10",
    border: "border-accent-green/20",
    icon: CheckCircle2,
    label: "COMPLIANT",
  },
  Warning: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    icon: AlertTriangle,
    label: "WARNING",
  },
  "Non-Compliant": {
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: XCircle,
    label: "NON-COMPLIANT",
  },
};

// ── Empty form state ──────────────────────────────────────────────────
interface FormData {
  name: string;
  industryType: string;
  region: string;
  latitude: string;
  longitude: string;
  emissionLimit: string;
  status: Industry["status"];
}

const emptyForm: FormData = {
  name: "",
  industryType: "",
  region: "",
  latitude: "",
  longitude: "",
  emissionLimit: "",
  status: "Compliant",
};

// ── Page ──────────────────────────────────────────────────────────────
export default function IndustriesPage() {
  const { data, loading, error: fetchError, refetch } = useIndustries();
  const industries = data?.industries ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // ── Toast helper ────────────────────────────────────────────────────
  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Counts ──────────────────────────────────────────────────────────
  const counts = {
    Compliant: industries.filter((i) => i.status === "Compliant").length,
    Warning: industries.filter((i) => i.status === "Warning").length,
    "Non-Compliant": industries.filter((i) => i.status === "Non-Compliant").length,
  };

  // ── Modal helpers ───────────────────────────────────────────────────
  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(ind: Industry) {
    setEditingId(ind.id);
    setForm({
      name: ind.name,
      industryType: ind.industryType,
      region: ind.region,
      latitude: ind.latitude != null ? String(ind.latitude) : "",
      longitude: ind.longitude != null ? String(ind.longitude) : "",
      emissionLimit: ind.emissionLimit != null ? String(ind.emissionLimit) : "",
      status: ind.status,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
  }

  // ── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!form.name || !form.industryType || !form.region) {
      setFormError("Name, Industry Type, and Region are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);

    const payload: Record<string, unknown> = {
      name: form.name,
      industryType: form.industryType,
      region: form.region,
      status: form.status,
    };
    if (form.latitude) payload.latitude = parseFloat(form.latitude);
    if (form.longitude) payload.longitude = parseFloat(form.longitude);
    if (form.emissionLimit) payload.emissionLimit = parseFloat(form.emissionLimit);

    try {
      if (editingId) {
        await api.updateIndustry(editingId, payload);
        showToast(`"${form.name}" updated successfully`);
      } else {
        await api.createIndustry(payload);
        showToast(`"${form.name}" registered successfully`);
      }
      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setFormError(null);
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }, [form, editingId, refetch]);

  // ── Delete ──────────────────────────────────────────────────────────
  async function handleDelete(ind: Industry) {
    if (!confirm(`Remove "${ind.name}" from the registry?`)) return;
    setDeletingId(ind.id);
    try {
      await api.deleteIndustry(ind.id);
      showToast(`"${ind.name}" removed from registry`);
      refetch();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  }

  // ── Loading state ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-3">
                <Factory className="h-6 w-6 text-accent-cyan" />
                Industry Compliance Registry
              </h1>
              <p className="text-sm text-slate-500 font-mono mt-1">
                Track registered industrial facilities and their environmental compliance status
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-mono rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Industry
            </button>
          </div>
        </motion.div>

        {/* Fetch error banner */}
        {fetchError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-red-400/20 bg-red-400/5"
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-xs font-mono text-red-400">
                Failed to load industries: {fetchError}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-lg border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-all"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {(["Compliant", "Warning", "Non-Compliant"] as const).map((status, i) => {
            const cfg = statusConfig[status];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl border border-white/5 bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.bg} ${cfg.border} border`}>
                    <Icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-mono font-bold ${cfg.color}`}>
                      {counts[status]}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{cfg.label}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Table or empty state */}
        {industries.length === 0 && !fetchError ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-12 flex flex-col items-center justify-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 mb-5">
              <Factory className="h-8 w-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-mono font-bold text-slate-300 mb-2">
              No industries registered yet
            </h3>
            <p className="text-sm font-mono text-slate-500 mb-6 max-w-sm">
              Click &quot;Add Industry&quot; to register your first industrial facility and start tracking compliance.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-mono rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Industry
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Industry Name</th>
                    <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Region</th>
                    <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Emission Limit</th>
                    <th className="text-left px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-4 text-xs text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {industries.map((ind) => {
                    const cfg = statusConfig[ind.status];
                    const Icon = cfg.icon;
                    const hasCoords = ind.latitude != null && ind.longitude != null;
                    const isDeleting = deletingId === ind.id;

                    return (
                      <tr
                        key={ind.id}
                        className={`border-b border-white/5 last:border-0 transition-colors ${
                          isDeleting ? "opacity-50" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="px-5 py-4 text-slate-200">{ind.name}</td>
                        <td className="px-5 py-4 text-slate-400">{ind.industryType}</td>
                        <td className="px-5 py-4 text-slate-400">{ind.region}</td>
                        <td className="px-5 py-4 text-slate-400">
                          {ind.emissionLimit != null ? `${ind.emissionLimit} µg/m³` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${cfg.bg} ${cfg.border} ${cfg.color}`}
                          >
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {hasCoords && (
                              <Link
                                href="/map"
                                title="View on map"
                                className="p-1.5 rounded-md text-slate-500 hover:text-accent-cyan hover:bg-white/5 transition-all"
                              >
                                <MapPin className="h-4 w-4" />
                              </Link>
                            )}
                            <button
                              onClick={() => openEdit(ind)}
                              disabled={isDeleting}
                              title="Edit"
                              className="p-1.5 rounded-md text-slate-500 hover:text-yellow-400 hover:bg-white/5 transition-all disabled:pointer-events-none"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(ind)}
                              disabled={isDeleting}
                              title="Delete"
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all disabled:pointer-events-none"
                            >
                              {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Toast notification ──────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-mono text-xs shadow-lg backdrop-blur-sm ${
                toast.type === "success"
                  ? "border-accent-green/20 bg-accent-green/10 text-accent-green"
                  : "border-red-400/20 bg-red-400/10 text-red-400"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 flex-shrink-0" />
              )}
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border border-white/10 bg-navy-900 p-6"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-mono font-bold text-white">
                  {editingId ? "Edit Industry" : "Register New Industry"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 px-3 py-2 rounded-lg border border-red-400/20 bg-red-400/5 text-xs font-mono text-red-400">
                  {formError}
                </div>
              )}

              {/* Form fields */}
              <div className="space-y-4">
                <Field label="Industry Name" required>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Raipur Steel Plant"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Industry Type" required>
                    <input
                      className="input-field"
                      value={form.industryType}
                      onChange={(e) => setForm({ ...form, industryType: e.target.value })}
                      placeholder="e.g. Steel"
                    />
                  </Field>
                  <Field label="Region" required>
                    <input
                      className="input-field"
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      placeholder="e.g. Chhattisgarh"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Latitude">
                    <input
                      className="input-field"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      placeholder="21.2514"
                    />
                  </Field>
                  <Field label="Longitude">
                    <input
                      className="input-field"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      placeholder="81.6296"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Emission Limit (µg/m³)">
                    <input
                      className="input-field"
                      type="number"
                      step="any"
                      value={form.emissionLimit}
                      onChange={(e) => setForm({ ...form, emissionLimit: e.target.value })}
                      placeholder="150"
                    />
                  </Field>
                  <Field label="Compliance Status">
                    <select
                      className="input-field"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as Industry["status"] })}
                    >
                      <option value="Compliant">Compliant</option>
                      <option value="Warning">Warning</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                    </select>
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-mono rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-mono rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 disabled:opacity-50 transition-all"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Save Changes" : "Register"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Field input styling */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-family: monospace;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(0, 229, 255, 0.4);
        }
        .input-field::placeholder {
          color: #475569;
        }
        .input-field option {
          background: #0d1529;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}

// ── Reusable field wrapper ────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-mono text-slate-500 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
