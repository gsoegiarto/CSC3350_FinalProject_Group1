export interface Employee {
  emp_id: number;
  first_name: string;
  last_name: string;
  ssn: string;
  email: string;
  phone: string;
  hire_date: string;
  job_title: string;
  division: string;
  salary: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PayStatement {
  id: number;
  emp_id: number;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  net_pay: number;
  deductions: number;
  created_at: string;
}

export interface PayByJobTitle {
  job_title: string;
  total_pay: number;
  employee_count: number;
}

export interface PayByDivision {
  division: string;
  total_pay: number;
  employee_count: number;
}