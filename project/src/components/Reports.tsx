import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Employee, PayStatement, PayByJobTitle, PayByDivision } from '../types/employee';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('employee-pay');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payStatements, setPayStatements] = useState<PayStatement[]>([]);
  const [payByJobTitle, setPayByJobTitle] = useState<PayByJobTitle[]>([]);
  const [payByDivision, setPayByDivision] = useState<PayByDivision[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeReport === 'employee-pay') {
      fetchEmployeesWithPay();
    } else if (activeReport === 'pay-by-title') {
      fetchPayByJobTitle();
    } else if (activeReport === 'pay-by-division') {
      fetchPayByDivision();
    }
  }, [activeReport, selectedMonth]);

  const fetchEmployeesWithPay = async () => {
    setLoading(true);
    try {
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .order('emp_id');

      const { data: payData, error: payError } = await supabase
        .from('pay_statements')
        .select('*')
        .order('pay_period_start', { ascending: false });

      if (empError) throw empError;
      if (payError) throw payError;

      setEmployees(empData || []);
      setPayStatements(payData || []);
    } catch (error) {
      console.error('Error fetching employee pay data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayByJobTitle = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedMonth + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('pay_statements')
        .select(`
          gross_pay,
          employees!inner(job_title)
        `)
        .gte('pay_period_start', startDate.toISOString())
        .lte('pay_period_end', endDate.toISOString());

      if (error) throw error;

      const grouped = (data || []).reduce((acc: Record<string, { total: number; count: number }>, item: any) => {
        const title = item.employees.job_title;
        if (!acc[title]) {
          acc[title] = { total: 0, count: 0 };
        }
        acc[title].total += item.gross_pay;
        acc[title].count += 1;
        return acc;
      }, {});

      const result = Object.entries(grouped).map(([title, data]) => ({
        job_title: title,
        total_pay: data.total,
        employee_count: data.count,
      }));

      setPayByJobTitle(result);
    } catch (error) {
      console.error('Error fetching pay by job title:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayByDivision = async () => {
    setLoading(true);
    try {
      const startDate = new Date(selectedMonth + '-01');
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      const { data, error } = await supabase
        .from('pay_statements')
        .select(`
          gross_pay,
          employees!inner(division)
        `)
        .gte('pay_period_start', startDate.toISOString())
        .lte('pay_period_end', endDate.toISOString());

      if (error) throw error;

      const grouped = (data || []).reduce((acc: Record<string, { total: number; count: number }>, item: any) => {
        const division = item.employees.division;
        if (!acc[division]) {
          acc[division] = { total: 0, count: 0 };
        }
        acc[division].total += item.gross_pay;
        acc[division].count += 1;
        return acc;
      }, {});

      const result = Object.entries(grouped).map(([division, data]) => ({
        division,
        total_pay: data.total,
        employee_count: data.count,
      }));

      setPayByDivision(result);
    } catch (error) {
      console.error('Error fetching pay by division:', error);
    } finally {
      setLoading(false);
    }
  };

  const reports = [
    { id: 'employee-pay', label: 'Employee Pay History', icon: FileText },
    { id: 'pay-by-title', label: 'Pay by Job Title', icon: FileText },
    { id: 'pay-by-division', label: 'Pay by Division', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
        {(activeReport === 'pay-by-title' || activeReport === 'pay-by-division') && (
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      <div className="flex space-x-4 border-b">
        {reports.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveReport(id)}
            className={`flex items-center space-x-2 py-2 px-4 border-b-2 text-sm font-medium transition-colors ${
              activeReport === id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && activeReport === 'employee-pay' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Full-time Employee Information with Pay Statement History</h3>
          </div>
          {employees.map((employee) => {
            const employeePay = payStatements.filter(pay => pay.emp_id === employee.emp_id);
            return (
              <div key={employee.emp_id} className="border-b border-gray-200">
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {employee.job_title} - {employee.division} | Salary: ${employee.salary.toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.status}
                    </span>
                  </div>
                </div>
                {employeePay.length > 0 ? (
                  <div className="px-6 py-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 uppercase tracking-wider">
                          <th className="text-left">Pay Period</th>
                          <th className="text-right">Gross Pay</th>
                          <th className="text-right">Deductions</th>
                          <th className="text-right">Net Pay</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {employeePay.slice(0, 5).map((pay) => (
                          <tr key={pay.id}>
                            <td className="py-2">
                              {new Date(pay.pay_period_start).toLocaleDateString()} - {new Date(pay.pay_period_end).toLocaleDateString()}
                            </td>
                            <td className="text-right py-2">${pay.gross_pay.toLocaleString()}</td>
                            <td className="text-right py-2">${pay.deductions.toLocaleString()}</td>
                            <td className="text-right py-2 font-medium">${pay.net_pay.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="px-6 py-4 text-sm text-gray-500">
                    No pay statements found for this employee.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && activeReport === 'pay-by-title' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Total Pay by Job Title - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pay
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Pay
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payByJobTitle.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.job_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.employee_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    ${item.total_pay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${Math.round(item.total_pay / item.employee_count).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && activeReport === 'pay-by-division' && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Total Pay by Division - {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Division
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee Count
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pay
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Pay
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payByDivision.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.division}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.employee_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    ${item.total_pay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${Math.round(item.total_pay / item.employee_count).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && (
        (activeReport === 'pay-by-title' && payByJobTitle.length === 0) ||
        (activeReport === 'pay-by-division' && payByDivision.length === 0)
      ) && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500">No pay data found for the selected month.</p>
        </div>
      )}
    </div>
  );
}