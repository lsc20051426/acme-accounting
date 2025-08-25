export interface newCompanyDto {
  name: string;
}

export interface CompanyDto {
  id: number;
  name: string;
}

export async function getCompanies(): Promise<CompanyDto[]> {
  const response = await fetch('/api/v1/companies');
  return response.json();
}

export async function createCompany(
  companyData: newCompanyDto,
): Promise<CompanyDto> {
  const response = await fetch('/api/v1/companies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(companyData),
  });

  if (!response.ok) {
    const { message } = await response.json().catch(() => response.statusText);
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function deleteCompany(id: number): Promise<void> {
  const response = await fetch(`/api/v1/companies/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const { message } = await response.json().catch(() => response.statusText);
    throw new Error(message || `HTTP ${response.status}`);
  }
}
