import { redirect } from 'next/navigation';

export default function OrganizationHome() {
  // No standalone page; send users to the first sub-tab.
  redirect('/dashboard/organization/employee-card');
}
