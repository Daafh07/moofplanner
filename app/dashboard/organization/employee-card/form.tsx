'use client';

import { useActionState } from 'react';
import { createEmployee, type EmployeeState } from '@/app/lib/actions';
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
}: {
  onSuccess?: () => void;
  departments?: { id: string; name: string }[];
}) {
  const [state, formAction] = useActionState(createEmployee, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset();
      setSelectedDepartments([]);
      router.refresh();
      onSuccess?.();
    }
  }, [state.status, router, onSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-3xl border border-white/10 bg-black/25 p-6 text-white"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" placeholder="Noor Jansen" required />
        <Field label="Email" name="email" type="email" placeholder="noor@moofplanner.com" required />
        <Field label="Phone" name="phone" placeholder="+31 6 1234 5678" />
        <Field label="Role" name="role" placeholder="Shift Supervisor" required />
        <Field label="Password (optional)" name="password" type="password" placeholder="Create a login password" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Contract type" name="contractType" required defaultValue={contractOptions[0]}>
          {contractOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectField>
        <Field label="Hours per week" name="hoursPerWeek" type="number" min="1" placeholder="28" required />
        <Field label="Salary per month (€)" name="salaryMonthly" type="number" min="0" step="0.01" placeholder="2650" required />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DepartmentSelect
          label="Departments"
          name="departments"
          options={departments}
          selected={selectedDepartments}
          onChange={setSelectedDepartments}
        />
        <Field label="Skills (comma separated)" name="skills" placeholder="Barista, Register, First aid" />
      </div>
      <input type="hidden" name="departments" value={selectedDepartments.join(',')} />

      <button
        type="submit"
        className="cta-primary w-full justify-center"
      >
        Create employee
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  step?: string;
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
