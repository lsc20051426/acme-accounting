export enum UserRole {
  accountant = 'accountant',
  corporateSecretary = 'corporateSecretary',
}

export interface newUserDto {
  name: string;
  role: UserRole;
  companyId: number;
}

export interface UserDto {
  id: number;
  name: string;
  role: UserRole;
  companyId: number;
}

export async function getUsers(companyId?: number): Promise<UserDto[]> {
  const response = await fetch(
    `/api/v1/users?${companyId ? `companyId=${companyId}` : ''}`,
  );
  return response.json();
}

export async function createUser(userData: newUserDto): Promise<UserDto> {
  const response = await fetch('/api/v1/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const { message } = await response.json().catch(() => response.statusText);
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`/api/v1/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const { message } = await response.json().catch(() => response.statusText);
    throw new Error(message || `HTTP ${response.status}`);
  }
}
