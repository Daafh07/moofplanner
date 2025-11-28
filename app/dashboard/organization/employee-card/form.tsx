'use client';

import { useActionState } from 'react';
import { createEmployee, type EmployeeState, updateEmployee } from '@/app/lib/actions';
import { plusJakarta, spaceGrotesk } from '@/app/ui/fonts';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const initialState: EmployeeState = { status: 'idle', message: undefined };
const contractOptions = [
  'Permanent contract',
  'Fixed-term contract',
  'On-call contract',
  'Zero-hours contract',
  'Min-max contract',
  'Temporary agency contract',
  'Secondment contract',
];

export default function EmployeeForm({
  onSuccess,
  departments = [],
  locations = [],
  initialValues,
}: {
  onSuccess?: () => void;
  departments?: { id: string; name: string }[];
  locations?: { id: string; name: string }[];
  initialValues?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string | null;
    role?: string | null;
    contractType?: string | null;
    hoursPerWeek?: number | null;
    salaryHourly?: number | null;
    departments?: string[] | null;
    skills?: string[] | null;
    locationId?: string | null;
  };
}) {
  const actionFn = initialValues?.id ? updateEmployee : createEmployee;
  const submitAction: (prevState: EmployeeState, formData: FormData) => Promise<EmployeeState> = (prevState, formData) =>
    actionFn(prevState, formData);
  const [state, formAction] = useActionState<EmployeeState, FormData>(submitAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(initialValues?.departments ?? []);
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    initialValues?.locationId ?? locations[0]?.id ?? '',
  );

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setSelectedDepartments([]);
      setSelectedLocationId(locations[0]?.id ?? '');
      router.refresh();
      onSuccess?.();
    }
  }, [state.status, router, onSuccess, locations]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-3xl border border-white/10 bg-black/25 p-6 text-white"
    >
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" placeholder="Noor Jansen" required defaultValue={initialValues?.name} />
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="noor@moofplanner.com"
          required
          defaultValue={initialValues?.email}
        />
        <Field
          label="Phone"
          name="phone"
          placeholder="+31 6 1234 5678"
          defaultValue={initialValues?.phone ?? undefined}
        />
        <Field
          label="Role"
          name="role"
          placeholder="Shift Supervisor"
          required
          defaultValue={initialValues?.role ?? undefined}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder={initialValues?.id ? 'Create or update login password' : 'Create login password'}
          required={!initialValues?.id}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          label="Contract type"
          name="contractType"
          required
          defaultValue={initialValues?.contractType ?? contractOptions[0]}
        >
          {contractOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
        <Field
      label="Hours per week"
      name="hoursPerWeek"
      type="number"
      min="1"
      placeholder="28"
      required
      defaultValue={initialValues?.hoursPerWeek ?? undefined}
    />
    <Field
      label="Salary per hour (€)"
      name="salaryHourly"
      type="number"
      min="0"
      step="0.01"
      placeholder="18"
      required
      defaultValue={initialValues?.salaryHourly ?? undefined}
    />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DepartmentSelect
          label="Departments"
          name="departments"
          options={departments}
          selected={selectedDepartments}
          onChange={setSelectedDepartments}
        />
        <div className="space-y-4">
          <LocationSelect
            label="Location (required)"
            name="locationId"
            options={locations}
            selected={selectedLocationId}
            onChange={setSelectedLocationId}
          />
          <Field
            label="Skills (comma separated)"
            name="skills"
            placeholder="Barista, Register, First aid"
            defaultValue={initialValues?.skills?.join(', ') ?? undefined}
          />
        </div>
      </div>
      <input type="hidden" name="departments" value={selectedDepartments.join(',')} />

      <button
        type="submit"
        className="cta-primary w-full justify-center"
      >
        {initialValues?.id ? 'Update employee' : 'Create employee'}
      </button>

      {state.message && (
        <p
          className={`${spaceGrotesk.className} text-sm ${
            state.status === 'success' ? 'text-[#d2ff00]' : 'text-red-300'
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  min,
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  step?: string;
  defaultValue?: string | number;
}) {
  return (
    <label className="block text-sm text-white/80">
      <span className={`${plusJakarta.className} mb-2 block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  required = false,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm text-white/80">
      <span className={`${plusJakarta.className} mb-2 block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
        {label}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-[#d2ff00] focus:outline-none focus:ring-2 focus:ring-[#d2ff00]/30"
      >
        {children}
      </select>
    </label>
  );
}

function DepartmentSelect({
  label,
  name,
  options,
  selected,
  onChange,
}: {
  label: string;
  name: string;
  options: { id: string; name: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-2 text-sm text-white/80">
      <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.length === 0 && <p className="text-sm text-white/60">No departments available.</p>}
        {options.map((opt) => (
          <button
            type="button"
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              selected.includes(opt.id)
                ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-white'
                : 'border-white/20 bg-white/5 text-white/70 hover:border-[#d2ff00] hover:text-white'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={selected.join(',')} />
    </div>
  );
}

function LocationSelect({
  label,
  name,
  options,
  selected,
  onChange,
}: {
  label: string;
  name: string;
  options: { id: string; name: string }[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="space-y-2 text-sm text-white/80">
      <span className={`${plusJakarta.className} block text-[0.65rem] uppercase tracking-[0.35em] text-white/60`}>
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.length === 0 && <p className="text-sm text-white/60">No locations yet. Create one first.</p>}
        {options.map((opt) => (
          <button
            type="button"
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition ${
              selected === opt.id
                ? 'border-[#d2ff00] bg-[#d2ff00]/10 text-white'
                : 'border-white/20 bg-white/5 text-white/70 hover:border-[#d2ff00] hover:text-white'
            }`}
          >
            {opt.name}
          </button>
        ))}
      </div>
      <input type="hidden" name={name} value={selected} />
    </div>
  );
}
