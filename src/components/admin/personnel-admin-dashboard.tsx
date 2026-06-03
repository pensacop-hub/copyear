"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightLeft,
  CheckCircle2,
  Edit3,
  ListOrdered,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Shuffle,
  Trash2,
  UserRound,
} from "lucide-react";
import type {
  CopAreaHead,
  CopAreaHeadInput,
  CopPersonnel,
  CopPersonnelInput,
} from "@/lib/cop-personnel";

type PersonnelAdminDashboardProps = {
  initialPersonnel: CopPersonnel[];
  initialAreaHeads: CopAreaHead[];
  embedded?: boolean;
};

const editableFields: Array<{
  key: keyof CopPersonnelInput;
  label: string;
  type?: string;
}> = [
  { key: "sortOrder", label: "Display Order", type: "number" },
  { key: "region", label: "Region" },
  { key: "area", label: "Area" },
  { key: "district", label: "District" },
  { key: "districtLeader", label: "District Leader" },
  { key: "phone", label: "Phone", type: "tel" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Address" },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toInput(person: CopPersonnel): CopPersonnelInput {
  return {
    sortOrder: person.sortOrder,
    region: person.region,
    area: person.area,
    areaLeader: person.areaLeader,
    district: person.district,
    districtLeader: person.districtLeader,
    phone: person.phone,
    email: person.email,
    address: person.address,
  };
}

function blankInput(): CopPersonnelInput {
  return {
    sortOrder: 0,
    region: "",
    area: "",
    areaLeader: "",
    district: "",
    districtLeader: "",
    phone: "",
    email: "",
    address: "",
  };
}

function toAreaHeadInput(areaHead: CopAreaHead): CopAreaHeadInput {
  return {
    sortOrder: areaHead.sortOrder,
    region: areaHead.region,
    area: areaHead.area,
    name: areaHead.name,
    phone: areaHead.phone,
    email: areaHead.email,
    address: areaHead.address,
  };
}

function blankAreaHeadInput(): CopAreaHeadInput {
  return {
    sortOrder: 0,
    region: "",
    area: "",
    name: "",
    phone: "",
    email: "",
    address: "",
  };
}

function searchValue(person: CopPersonnel) {
  return normalize(
    [
      person.sortOrder,
      person.region,
      person.area,
      person.areaLeader,
      person.district,
      person.districtLeader,
      person.phone,
      person.email,
      person.address,
    ].join(" "),
  );
}

export function PersonnelAdminDashboard({
  initialPersonnel,
  initialAreaHeads,
  embedded = false,
}: PersonnelAdminDashboardProps) {
  const [personnel, setPersonnel] = useState(initialPersonnel);
  const [areaHeads, setAreaHeads] = useState(initialAreaHeads);
  const [selectedId, setSelectedId] = useState(initialPersonnel[0]?.id ?? 0);
  const [selectedAreaHeadId, setSelectedAreaHeadId] = useState(initialAreaHeads[0]?.id ?? 0);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CopPersonnelInput>(
    initialPersonnel[0] ? toInput(initialPersonnel[0]) : blankInput(),
  );
  const [newForm, setNewForm] = useState<CopPersonnelInput>(blankInput());
  const [areaHeadForm, setAreaHeadForm] = useState<CopAreaHeadInput>(
    initialAreaHeads[0] ? toAreaHeadInput(initialAreaHeads[0]) : blankAreaHeadInput(),
  );
  const [newAreaHeadForm, setNewAreaHeadForm] = useState<CopAreaHeadInput>(blankAreaHeadInput());
  const [areaHeadQuery, setAreaHeadQuery] = useState("");
  const [sourceId, setSourceId] = useState(initialPersonnel[0]?.id ?? 0);
  const [targetId, setTargetId] = useState(initialPersonnel[1]?.id ?? 0);
  const [sourceQuery, setSourceQuery] = useState("");
  const [targetQuery, setTargetQuery] = useState("");
  const [transferMode, setTransferMode] = useState<"switch" | "direct">("switch");
  const [areaSourceQuery, setAreaSourceQuery] = useState("");
  const [areaTargetQuery, setAreaTargetQuery] = useState("");
  const [areaSource, setAreaSource] = useState(initialPersonnel[0]?.area ?? "");
  const [areaTarget, setAreaTarget] = useState(initialPersonnel[1]?.area ?? "");
  const [areaTransferMode, setAreaTransferMode] = useState<"switch" | "direct">("switch");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();
  const [isCreating, startCreating] = useTransition();
  const [isAreaHeadSaving, startAreaHeadSaving] = useTransition();
  const [isAreaHeadCreating, startAreaHeadCreating] = useTransition();
  const [isRetiring, startRetiring] = useTransition();
  const [isTransferring, startTransfer] = useTransition();
  const [isAreaTransferring, startAreaTransfer] = useTransition();

  const selectedPerson = useMemo(
    () => personnel.find((person) => person.id === selectedId) ?? personnel[0],
    [personnel, selectedId],
  );

  const selectedAreaHead = useMemo(
    () => areaHeads.find((areaHead) => areaHead.id === selectedAreaHeadId) ?? areaHeads[0],
    [areaHeads, selectedAreaHeadId],
  );

  const sourcePerson = personnel.find((person) => person.id === sourceId);
  const targetPerson = personnel.find((person) => person.id === targetId);

  const areaOptions = useMemo(() => {
    return areaHeads
      .map((areaHead) => ({
        area: areaHead.area,
        areaLeader: areaHead.name,
        region: areaHead.region,
      }))
      .sort((a, b) => a.area.localeCompare(b.area));
  }, [areaHeads]);

  const filteredAreaHeads = useMemo(() => {
    const terms = normalize(areaHeadQuery.trim()).split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return areaHeads;
    }

    return areaHeads.filter((areaHead) => {
      const haystack = normalize(
        [
          areaHead.sortOrder,
          areaHead.region,
          areaHead.area,
          areaHead.name,
          areaHead.phone,
          areaHead.email,
          areaHead.address,
        ].join(" "),
      );
      return terms.every((term) => haystack.includes(term));
    });
  }, [areaHeads, areaHeadQuery]);

  const areaSourceOptions = useMemo(() => {
    const search = normalize(areaSourceQuery.trim());
    if (!search) return areaOptions;
    return areaOptions.filter((area) =>
      normalize(`${area.area} ${area.areaLeader} ${area.region}`).includes(search),
    );
  }, [areaOptions, areaSourceQuery]);

  const areaTargetOptions = useMemo(() => {
    const search = normalize(areaTargetQuery.trim());
    if (!search) return areaOptions;
    return areaOptions.filter((area) =>
      normalize(`${area.area} ${area.areaLeader} ${area.region}`).includes(search),
    );
  }, [areaOptions, areaTargetQuery]);

  const sourceArea = areaOptions.find((area) => area.area === areaSource);
  const targetArea = areaOptions.find((area) => area.area === areaTarget);
  const areaHeadCount = useMemo(
    () => new Set(areaHeads.map((areaHead) => areaHead.name).filter(Boolean)).size,
    [areaHeads],
  );

  const sourceOptions = useMemo(() => {
    const terms = normalize(sourceQuery.trim()).split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return personnel;
    }
    return personnel.filter((person) => {
      const haystack = searchValue(person);
      return terms.every((term) => haystack.includes(term));
    });
  }, [personnel, sourceQuery]);

  const targetOptions = useMemo(() => {
    const terms = normalize(targetQuery.trim()).split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return personnel;
    }
    return personnel.filter((person) => {
      const haystack = searchValue(person);
      return terms.every((term) => haystack.includes(term));
    });
  }, [personnel, targetQuery]);

  const filteredPersonnel = useMemo(() => {
    const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);

    if (terms.length === 0) {
      return personnel;
    }

    return personnel.filter((person) => {
      const haystack = searchValue(person);
      return terms.every((term) => haystack.includes(term));
    });
  }, [personnel, query]);

  function selectPerson(person: CopPersonnel) {
    setSelectedId(person.id);
    setForm(toInput(person));
    setMessage("");
    setError("");
  }

  function selectTransferPerson(kind: "source" | "target", person: CopPersonnel) {
    const label = `${person.districtLeader} - ${person.district}, ${person.area}`;

    if (kind === "source") {
      setSourceId(person.id);
      setSourceQuery(label);
      return;
    }

    setTargetId(person.id);
    setTargetQuery(label);
  }

  function selectAreaHead(areaHead: CopAreaHead) {
    setSelectedAreaHeadId(areaHead.id);
    setAreaHeadForm(toAreaHeadInput(areaHead));
    setMessage("");
    setError("");
  }

  function areaHeadNameFor(area: string, fallback = "") {
    return areaHeads.find((areaHead) => areaHead.area === area)?.name ?? fallback;
  }

  function syncPersonnelAreaHead(area: string, name: string) {
    setPersonnel((current) =>
      current.map((person) =>
        person.area === area ? { ...person, areaLeader: name } : person,
      ),
    );
    setForm((current) =>
      current.area === area ? { ...current, areaLeader: name } : current,
    );
    setNewForm((current) =>
      current.area === area ? { ...current, areaLeader: name } : current,
    );
  }

  async function savePerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPerson) {
      return;
    }

    setError("");
    setMessage("");
    startSaving(async () => {
      const response = await fetch(`/api/admin/personnel/${selectedPerson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          areaLeader: areaHeadNameFor(form.area, form.areaLeader),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to save personnel record.");
        return;
      }

      const updated = payload.person as CopPersonnel;
      setPersonnel((current) =>
        current.map((person) => (person.id === updated.id ? updated : person)),
      );
      setSelectedId(updated.id);
      setForm(toInput(updated));
      setMessage("Record saved");
    });
  }

  async function createPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    startCreating(async () => {
      const response = await fetch("/api/admin/personnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newForm,
          areaLeader: areaHeadNameFor(newForm.area, newForm.areaLeader),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to create personnel record.");
        return;
      }

      const created = payload.person as CopPersonnel;
      setPersonnel((current) => [...current, created]);
      setSelectedId(created.id);
      setForm(toInput(created));
      setNewForm(blankInput());
      setMessage("New personnel record added");
    });
  }

  async function saveAreaHead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAreaHead) {
      return;
    }

    setError("");
    setMessage("");

    startAreaHeadSaving(async () => {
      const response = await fetch(`/api/admin/area-heads/${selectedAreaHead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(areaHeadForm),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to save area head.");
        return;
      }

      const updated = payload.areaHead as CopAreaHead;
      setAreaHeads((current) =>
        current
          .map((areaHead) => (areaHead.id === updated.id ? updated : areaHead))
          .sort((a, b) => a.sortOrder - b.sortOrder || a.area.localeCompare(b.area)),
      );
      setSelectedAreaHeadId(updated.id);
      setAreaHeadForm(toAreaHeadInput(updated));
      syncPersonnelAreaHead(updated.area, updated.name);
      setMessage("Area head saved");
    });
  }

  async function createAreaHead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    startAreaHeadCreating(async () => {
      const response = await fetch("/api/admin/area-heads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAreaHeadForm),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to create area head.");
        return;
      }

      const created = payload.areaHead as CopAreaHead;
      setAreaHeads((current) =>
        [...current, created].sort((a, b) => a.sortOrder - b.sortOrder || a.area.localeCompare(b.area)),
      );
      setSelectedAreaHeadId(created.id);
      setAreaHeadForm(toAreaHeadInput(created));
      setNewAreaHeadForm(blankAreaHeadInput());
      syncPersonnelAreaHead(created.area, created.name);
      setMessage("New area head added");
    });
  }

  async function retireSelectedPerson() {
    if (!selectedPerson) {
      return;
    }

    const confirmed = window.confirm(
      `Retire ${selectedPerson.districtLeader}? This removes the record from the directory.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    startRetiring(async () => {
      const response = await fetch(`/api/admin/personnel/${selectedPerson.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to retire personnel.");
        return;
      }

      setPersonnel((current) => {
        const next = current.filter((person) => person.id !== selectedPerson.id);
        const replacement = next[0];
        if (replacement) {
          setSelectedId(replacement.id);
          setForm(toInput(replacement));
        } else {
          setSelectedId(0);
          setForm(blankInput());
        }
        return next;
      });
      setMessage("Personnel retired and removed from records");
    });
  }

  async function runTransfer() {
    setError("");
    setMessage("");

    startTransfer(async () => {
      const response = await fetch("/api/admin/personnel/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, targetId, mode: transferMode }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to complete transfer.");
        return;
      }

      const changed = payload.personnel as CopPersonnel[];
      setPersonnel((current) =>
        current.map((person) => changed.find((item) => item.id === person.id) ?? person),
      );

      const refreshedSelected = changed.find((person) => person.id === selectedId);
      if (refreshedSelected) {
        setForm(toInput(refreshedSelected));
      }

      setMessage(transferMode === "switch" ? "Switch completed" : "Direct transfer completed");
    });
  }

  async function runAreaTransfer() {
    setError("");
    setMessage("");
    const beforeSource = areaHeads.find((areaHead) => areaHead.area === areaSource);
    const beforeTarget = areaHeads.find((areaHead) => areaHead.area === areaTarget);

    startAreaTransfer(async () => {
      const response = await fetch("/api/admin/personnel/area-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceArea: areaSource,
          targetArea: areaTarget,
          mode: areaTransferMode,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error ?? "Unable to transfer area head.");
        return;
      }

      const changed = payload.personnel as CopPersonnel[];
      setPersonnel((current) =>
        current.map((person) => changed.find((item) => item.id === person.id) ?? person),
      );

      if (beforeSource && beforeTarget) {
        setAreaHeads((current) =>
          current.map((areaHead) => {
            if (areaHead.id === beforeSource.id) {
              return areaTransferMode === "switch"
                ? {
                    ...areaHead,
                    name: beforeTarget.name,
                    phone: beforeTarget.phone,
                    email: beforeTarget.email,
                    address: beforeTarget.address,
                  }
                : { ...areaHead, name: "Vacant", phone: "", email: "", address: "" };
            }

            if (areaHead.id === beforeTarget.id) {
              return {
                ...areaHead,
                name: beforeSource.name,
                phone: beforeSource.phone,
                email: beforeSource.email,
                address: beforeSource.address,
              };
            }

            return areaHead;
          }),
        );
      }

      const refreshedSelected = changed.find((person) => person.id === selectedId);
      if (refreshedSelected) {
        setForm(toInput(refreshedSelected));
      }

      setMessage(areaTransferMode === "switch" ? "Area heads switched" : "Area head transferred");
    });
  }

  return (
    <section className={`${embedded ? "bg-transparent px-0 pb-0 pt-0" : "min-h-screen bg-[#F7FAFC] px-4 pb-12 pt-32 sm:px-6 lg:px-8"} text-slate-950`}>
      <div className="mx-auto max-w-7xl">
        {!embedded && <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image src="/cop.png" alt="COP Logo" fill sizes="48px" className="object-contain p-2" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-800">
                  Admin
                </p>
                <h1 className="text-3xl font-black tracking-normal sm:text-4xl">
                  COP Personnel Dashboard
                </h1>
              </div>
            </div>
          </div>

          <Link
            href="/personnel"
            className="inline-flex h-11 items-center justify-center gap-2 border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-800"
          >
            <UserRound className="h-4 w-4" />
            Public Directory
          </Link>
          <Link
            href="/admin/calendar"
            className="inline-flex h-11 items-center justify-center border border-slate-950 bg-slate-950 px-4 text-sm font-black text-white shadow-sm transition hover:bg-blue-950"
          >
            Calendar CMS
          </Link>
        </div>}

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="border-l-4 border-blue-800 bg-white p-4 shadow-sm">
            <p className="text-2xl font-black">{areaHeadCount}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Area Heads
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 bg-white p-4 shadow-sm">
            <p className="text-2xl font-black">
              {new Set(personnel.map((person) => person.region)).size}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Regions
            </p>
          </div>
          <div className="border-l-4 border-emerald-600 bg-white p-4 shadow-sm">
            <p className="text-2xl font-black">
              {new Set(personnel.map((person) => person.area)).size}
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Areas
            </p>
          </div>
          <div className="border-l-4 border-slate-950 bg-white p-4 shadow-sm">
            <p className="text-2xl font-black">{filteredPersonnel.length}</p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Shown
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-100 p-4">
              <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                <Search className="h-5 w-5 flex-none text-blue-800" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-full w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400"
                  placeholder="Search records"
                  aria-label="Search admin personnel records"
                />
              </div>
            </div>

            <div className="max-h-[720px] overflow-auto">
              <table className="w-full min-w-[920px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-950 text-white">
                  <tr>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">#</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Leader</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">District</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Area</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Region</th>
                    <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.16em]">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonnel.map((person) => (
                    <tr
                      key={person.id}
                      onClick={() => selectPerson(person)}
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-blue-50/60 ${person.id === selectedId ? "bg-yellow-50" : "bg-white"}`}
                    >
                      <td className="px-4 py-3 font-black text-blue-800">{person.sortOrder}</td>
                      <td className="px-4 py-3 font-bold text-slate-950">{person.districtLeader}</td>
                      <td className="px-4 py-3 text-slate-600">{person.district}</td>
                      <td className="px-4 py-3 text-slate-600">{person.area}</td>
                      <td className="px-4 py-3 text-slate-600">{person.region}</td>
                      <td className="px-4 py-3 text-slate-600">{person.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={savePerson} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                    Edit Record
                  </p>
                  <h2 className="mt-1 text-xl font-black">{selectedPerson?.districtLeader}</h2>
                </div>
                <Edit3 className="h-5 w-5 text-yellow-600" />
              </div>

              <datalist id="admin-area-options">
                {areaOptions.map((area) => (
                  <option key={area.area} value={area.area} />
                ))}
              </datalist>

              <div className="grid gap-4 sm:grid-cols-2">
                {editableFields.map((field) => (
                  <label key={field.key} className={field.key === "address" ? "sm:col-span-2" : ""}>
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                      {field.label}
                    </span>
                    <input
                      type={field.type ?? "text"}
                      value={form[field.key]}
                      list={field.key === "area" ? "admin-area-options" : undefined}
                      onChange={(event) => {
                        const value = field.key === "sortOrder" ? Number(event.target.value) : event.target.value;
                        setForm((current) => {
                          const next = { ...current, [field.key]: value };
                          if (field.key === "area") {
                            next.areaLeader = areaHeadNameFor(event.target.value, current.areaLeader);
                          }
                          return next;
                        });
                      }}
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white"
                    />
                  </label>
                ))}
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                    Current Area Head
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {areaHeadNameFor(form.area, form.areaLeader) || "No area head mapped"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => selectedPerson && setForm(toInput(selectedPerson))}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 transition hover:text-blue-800"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={retireSelectedPerson}
                    disabled={isRetiring || !selectedPerson}
                    className="inline-flex h-11 items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    {isRetiring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Retired
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-800 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-60"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </button>
              </div>
            </form>

            <form onSubmit={createPerson} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                    New Entry
                  </p>
                  <h2 className="mt-1 text-xl font-black">Add Newly Picked Personnel</h2>
                </div>
                <Plus className="h-5 w-5 text-yellow-600" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {editableFields.map((field) => (
                  <label key={field.key} className={field.key === "address" ? "sm:col-span-2" : ""}>
                    <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                      {field.label}
                    </span>
                    <input
                      type={field.type ?? "text"}
                      value={newForm[field.key]}
                      list={field.key === "area" ? "admin-area-options" : undefined}
                      onChange={(event) => {
                        const value = field.key === "sortOrder" ? Number(event.target.value) : event.target.value;
                        setNewForm((current) => {
                          const next = { ...current, [field.key]: value };
                          if (field.key === "area") {
                            next.areaLeader = areaHeadNameFor(event.target.value, current.areaLeader);
                          }
                          return next;
                        });
                      }}
                      className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white"
                    />
                  </label>
                ))}
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-800">
                    Current Area Head
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">
                    {areaHeadNameFor(newForm.area, newForm.areaLeader) || "Select an area"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-60"
                >
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Personnel
                </button>
              </div>
            </form>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                    Area Heads
                  </p>
                  <h2 className="mt-1 text-xl font-black">Edit Area Head Details</h2>
                </div>
                <ListOrdered className="h-5 w-5 text-yellow-600" />
              </div>

              <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
                <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-200">
                  <div className="border-b border-slate-100 p-3">
                    <div className="flex h-11 items-center gap-2 rounded-2xl bg-slate-50 px-3 ring-1 ring-slate-200">
                      <Search className="h-4 w-4 flex-none text-blue-800" />
                      <input
                        value={areaHeadQuery}
                        onChange={(event) => setAreaHeadQuery(event.target.value)}
                        placeholder="Search area heads"
                        className="h-full w-full bg-transparent text-sm font-bold outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {filteredAreaHeads.map((areaHead) => (
                      <button
                        type="button"
                        key={areaHead.id}
                        onClick={() => selectAreaHead(areaHead)}
                        className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-blue-50 ${areaHead.id === selectedAreaHeadId ? "bg-yellow-50" : "bg-white"}`}
                      >
                        <span className="block text-sm font-black text-slate-950">
                          {areaHead.name}
                        </span>
                        <span className="mt-1 block text-xs font-bold text-slate-500">
                          {areaHead.area} Area, {areaHead.region}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5">
                  <form onSubmit={saveAreaHead} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-blue-800">
                      Selected Area Head
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {([
                        ["sortOrder", "Display Order", "number"],
                        ["region", "Region", "text"],
                        ["area", "Area", "text"],
                        ["name", "Area Head", "text"],
                        ["phone", "Phone", "tel"],
                        ["email", "Email", "email"],
                        ["address", "Address", "text"],
                      ] as const).map(([key, label, type]) => (
                        <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                          <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                            {label}
                          </span>
                          <input
                            type={type}
                            value={areaHeadForm[key]}
                            onChange={(event) =>
                              setAreaHeadForm((current) => ({
                                ...current,
                                [key]: key === "sortOrder" ? Number(event.target.value) : event.target.value,
                              }))
                            }
                            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-400"
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={isAreaHeadSaving || !selectedAreaHead}
                      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-blue-800 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-60"
                    >
                      {isAreaHeadSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Area Head
                    </button>
                  </form>

                  <form onSubmit={createAreaHead} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Add Area Head
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {([
                        ["sortOrder", "Display Order", "number"],
                        ["region", "Region", "text"],
                        ["area", "Area", "text"],
                        ["name", "Area Head", "text"],
                        ["phone", "Phone", "tel"],
                        ["email", "Email", "email"],
                        ["address", "Address", "text"],
                      ] as const).map(([key, label, type]) => (
                        <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                          <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                            {label}
                          </span>
                          <input
                            type={type}
                            value={newAreaHeadForm[key]}
                            onChange={(event) =>
                              setNewAreaHeadForm((current) => ({
                                ...current,
                                [key]: key === "sortOrder" ? Number(event.target.value) : event.target.value,
                              }))
                            }
                            className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white"
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="submit"
                      disabled={isAreaHeadCreating}
                      className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-60"
                    >
                      {isAreaHeadCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Add Area Head
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                    Transfers
                  </p>
                  <h2 className="mt-1 text-xl font-black">Switching Desk</h2>
                </div>
                <ArrowRightLeft className="h-5 w-5 text-yellow-600" />
              </div>

              <div className="grid gap-4">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    From / In
                  </span>
                  <input
                    value={sourceQuery}
                    onChange={(event) => setSourceQuery(event.target.value)}
                    placeholder="Search source leader, district, area"
                    className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-blue-400"
                  />
                  <select
                    value={sourceId}
                    onChange={(event) => {
                      const person = personnel.find((item) => item.id === Number(event.target.value));
                      if (person) selectTransferPerson("source", person);
                    }}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white"
                  >
                    {sourceOptions.map((person) => (
                      <option key={person.id} value={person.id}>
                        #{person.sortOrder} {person.districtLeader} - {person.district}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    To / Out
                  </span>
                  <input
                    value={targetQuery}
                    onChange={(event) => setTargetQuery(event.target.value)}
                    placeholder="Search target leader, district, area"
                    className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-blue-400"
                  />
                  <select
                    value={targetId}
                    onChange={(event) => {
                      const person = personnel.find((item) => item.id === Number(event.target.value));
                      if (person) selectTransferPerson("target", person);
                    }}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white"
                  >
                    {targetOptions.map((person) => (
                      <option key={person.id} value={person.id}>
                        #{person.sortOrder} {person.districtLeader} - {person.district}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTransferMode("switch")}
                    className={`h-12 rounded-2xl border px-3 text-sm font-black transition ${transferMode === "switch" ? "border-blue-800 bg-blue-800 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    Switch
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferMode("direct")}
                    className={`h-12 rounded-2xl border px-3 text-sm font-black transition ${transferMode === "direct" ? "border-blue-800 bg-blue-800 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    Direct
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        From / Current
                      </p>
                      <p className="mt-1 font-black text-slate-950">{sourcePerson?.districtLeader}</p>
                      <p className="text-slate-500">{sourcePerson?.district}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        To / Destination
                      </p>
                      <p className="mt-1 font-black text-slate-950">{targetPerson?.districtLeader}</p>
                      <p className="text-slate-500">{targetPerson?.district}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-xs font-bold leading-5 text-slate-600">
                  {transferMode === "switch"
                    ? "Switch will exchange the two selected leaders between their current districts."
                    : "Direct will move the From leader into the To district and mark the From district vacant."}
                </div>

                <button
                  type="button"
                  onClick={runTransfer}
                  disabled={isTransferring || sourceId === targetId}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-50"
                >
                  {isTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                  Apply Transfer
                </button>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-800">
                    Area Heads
                  </p>
                  <h2 className="mt-1 text-xl font-black">Area Head Transfer Desk</h2>
                </div>
                <ArrowRightLeft className="h-5 w-5 text-yellow-600" />
              </div>

              <div className="grid gap-4">
                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Source Area
                  </span>
                  <input
                    value={areaSourceQuery}
                    onChange={(event) => setAreaSourceQuery(event.target.value)}
                    placeholder="Search area or area head"
                    className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-blue-400"
                  />
                  <select
                    value={areaSource}
                    onChange={(event) => setAreaSource(event.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white"
                  >
                    {areaSourceOptions.map((area) => (
                      <option key={area.area} value={area.area}>
                        {area.area} - {area.areaLeader}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                    Target Area
                  </span>
                  <input
                    value={areaTargetQuery}
                    onChange={(event) => setAreaTargetQuery(event.target.value)}
                    placeholder="Search target area or area head"
                    className="mt-2 h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none transition focus:border-blue-400"
                  />
                  <select
                    value={areaTarget}
                    onChange={(event) => setAreaTarget(event.target.value)}
                    className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold outline-none focus:border-blue-400 focus:bg-white"
                  >
                    {areaTargetOptions.map((area) => (
                      <option key={area.area} value={area.area}>
                        {area.area} - {area.areaLeader}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAreaTransferMode("switch")}
                    className={`h-12 rounded-2xl border px-3 text-sm font-black transition ${areaTransferMode === "switch" ? "border-blue-800 bg-blue-800 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    Switch
                  </button>
                  <button
                    type="button"
                    onClick={() => setAreaTransferMode("direct")}
                    className={`h-12 rounded-2xl border px-3 text-sm font-black transition ${areaTransferMode === "direct" ? "border-blue-800 bg-blue-800 text-white" : "border-slate-200 bg-white text-slate-600"}`}
                  >
                    Direct
                  </button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Source
                      </p>
                      <p className="mt-1 font-black text-slate-950">{sourceArea?.areaLeader}</p>
                      <p className="text-slate-500">{sourceArea?.area}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                        Target
                      </p>
                      <p className="mt-1 font-black text-slate-950">{targetArea?.areaLeader}</p>
                      <p className="text-slate-500">{targetArea?.area}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runAreaTransfer}
                  disabled={isAreaTransferring || areaSource === areaTarget}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-blue-950 disabled:opacity-50"
                >
                  {isAreaTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
                  Apply Area Head Transfer
                </button>
              </div>
            </div>

            {(message || error) && (
              <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black ${error ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"}`}>
                <CheckCircle2 className="h-5 w-5" />
                {error || message}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
