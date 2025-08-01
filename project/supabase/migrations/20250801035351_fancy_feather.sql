/*
  # Employee Management System Schema

  1. New Tables
    - `employees`
      - `emp_id` (serial, primary key) - Auto-incrementing employee ID
      - `first_name` (text) - Employee first name
      - `last_name` (text) - Employee last name  
      - `ssn` (text, unique) - Social Security Number (no dashes)
      - `email` (text, unique) - Employee email address
      - `phone` (text) - Phone number
      - `hire_date` (date) - Date of hire
      - `job_title` (text) - Job position title
      - `division` (text) - Company division/department
      - `salary` (numeric) - Annual salary
      - `status` (text) - Employment status (active/inactive)
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `pay_statements`
      - `id` (serial, primary key) - Pay statement ID
      - `emp_id` (integer, foreign key) - References employees
      - `pay_period_start` (date) - Start of pay period
      - `pay_period_end` (date) - End of pay period
      - `gross_pay` (numeric) - Gross pay amount
      - `deductions` (numeric) - Total deductions
      - `net_pay` (numeric) - Net pay amount
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for public access (no authentication required per requirements)

  3. Indexes
    - Indexes on commonly searched fields (name, SSN, emp_id)
    - Index on pay_statements for reporting queries
*/

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  emp_id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  ssn TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  hire_date DATE NOT NULL,
  job_title TEXT NOT NULL,
  division TEXT NOT NULL,
  salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pay_statements table
CREATE TABLE IF NOT EXISTS pay_statements (
  id SERIAL PRIMARY KEY,
  emp_id INTEGER NOT NULL REFERENCES employees(emp_id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_employees_ssn ON employees(ssn);
CREATE INDEX IF NOT EXISTS idx_employees_job_title ON employees(job_title);
CREATE INDEX IF NOT EXISTS idx_employees_division ON employees(division);
CREATE INDEX IF NOT EXISTS idx_pay_statements_emp_id ON pay_statements(emp_id);
CREATE INDEX IF NOT EXISTS idx_pay_statements_period ON pay_statements(pay_period_start, pay_period_end);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_statements ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Public access to employees"
  ON employees
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public access to pay_statements"
  ON pay_statements
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at 
  BEFORE UPDATE ON employees 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO employees (first_name, last_name, ssn, email, phone, hire_date, job_title, division, salary, status) VALUES
('John', 'Smith', '123456789', 'john.smith@company2.com', '555-0101', '2022-01-15', 'Software Engineer', 'Engineering', 75000, 'active'),
('Sarah', 'Johnson', '234567890', 'sarah.johnson@company2.com', '555-0102', '2021-06-20', 'Marketing Manager', 'Marketing', 68000, 'active'),
('Michael', 'Brown', '345678901', 'michael.brown@company2.com', '555-0103', '2023-03-10', 'Sales Representative', 'Sales', 52000, 'active'),
('Emily', 'Davis', '456789012', 'emily.davis@company2.com', '555-0104', '2020-08-05', 'HR Director', 'Human Resources', 85000, 'active'),
('David', 'Wilson', '567890123', 'david.wilson@company2.com', '555-0105', '2022-11-30', 'Accountant', 'Finance', 62000, 'active'),
('Lisa', 'Miller', '678901234', 'lisa.miller@company2.com', '555-0106', '2021-04-12', 'Project Manager', 'Engineering', 78000, 'active'),
('James', 'Garcia', '789012345', 'james.garcia@company2.com', '555-0107', '2023-01-08', 'Customer Support', 'Operations', 45000, 'active'),
('Jennifer', 'Martinez', '890123456', 'jennifer.martinez@company2.com', '555-0108', '2020-12-01', 'Senior Developer', 'Engineering', 95000, 'active')
ON CONFLICT (ssn) DO NOTHING;

-- Insert sample pay statements
INSERT INTO pay_statements (emp_id, pay_period_start, pay_period_end, gross_pay, deductions, net_pay) VALUES
(1, '2024-01-01', '2024-01-15', 2884.62, 576.92, 2307.70),
(1, '2024-01-16', '2024-01-31', 2884.62, 576.92, 2307.70),
(2, '2024-01-01', '2024-01-15', 2615.38, 523.08, 2092.30),
(2, '2024-01-16', '2024-01-31', 2615.38, 523.08, 2092.30),
(3, '2024-01-01', '2024-01-15', 2000.00, 400.00, 1600.00),
(3, '2024-01-16', '2024-01-31', 2000.00, 400.00, 1600.00),
(4, '2024-01-01', '2024-01-15', 3269.23, 653.85, 2615.38),
(4, '2024-01-16', '2024-01-31', 3269.23, 653.85, 2615.38),
(5, '2024-01-01', '2024-01-15', 2384.62, 476.92, 1907.70),
(5, '2024-01-16', '2024-01-31', 2384.62, 476.92, 1907.70),
(6, '2024-01-01', '2024-01-15', 3000.00, 600.00, 2400.00),
(6, '2024-01-16', '2024-01-31', 3000.00, 600.00, 2400.00),
(7, '2024-01-01', '2024-01-15', 1730.77, 346.15, 1384.62),
(7, '2024-01-16', '2024-01-31', 1730.77, 346.15, 1384.62),
(8, '2024-01-01', '2024-01-15', 3653.85, 730.77, 2923.08),
(8, '2024-01-16', '2024-01-31', 3653.85, 730.77, 2923.08)
ON CONFLICT DO NOTHING;