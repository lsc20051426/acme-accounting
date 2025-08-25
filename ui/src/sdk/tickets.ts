enum TicketStatus {
  open = 'open',
  resolved = 'resolved',
}
export enum TicketCategory {
  accounting = 'accounting',
  corporate = 'registrationAddressChange',
  management = 'management',
}

export enum TicketType {
  managementReport = 'managementReport',
  registrationAddressChange = 'registrationAddressChange',
}

export interface newTicketDto {
  type: TicketType;
  companyId: number;
}

export interface TicketDto {
  id: number;
  type: TicketType;
  companyId: number;
  assigneeId: number;
  status: TicketStatus;
  category: TicketCategory;
}

export async function getTickets(): Promise<TicketDto[]> {
  const response = await fetch('/api/v1/tickets');
  return response.json();
}

export async function createTicket(
  ticketData: newTicketDto,
): Promise<TicketDto> {
  const response = await fetch('/api/v1/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketData),
  });

  if (!response.ok) {
    const { message } = await response.json().catch(() => response.statusText);
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}
