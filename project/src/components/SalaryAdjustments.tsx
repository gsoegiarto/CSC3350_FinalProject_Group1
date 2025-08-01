import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SalaryAdjustments() {
  const [percentage, setPercentage] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ affected: number; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const percentageIncrease = parseFloat(percentage) / 100;
      const minSal = parseFloat(minSalary);
      const maxSal = parseFloat(maxSalary);

      // First, get employees in the salary range
      const { data: employees, error: fetchError } = await supabase
        .from('employees')
        .select('emp_id, first_name, last_name, salary')
        .gte('salary', minSal)
        .lt('salary', maxSal);

      if (fetchError) throw fetchError;

      if (!employees || employees.length === 0) {
        setResult({
          affected: 0,
          message: 'No employees found in the specified salary range.'
        });
        return;
      }

      // Update each employee's salary
      const updates = employees.map(emp => ({
        emp_id: emp.emp_id,
        salary: Math.round(emp.salary * (1 + percentageIncrease))
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('employees')
          .update({ salary: update.salary })
          .eq('emp_id', update.emp_id);
        
        if (error) throw error;
      }

      setResult({
        affected: employees.length,
        message: `Successfully updated ${employees.length} employee(s) with a ${percentage}% salary increase.`
      });

      // Reset form
      setPercentage('');
      setMinSalary('');
      setMaxSalary('');

    } catch (error) {
      console.error('Error updating salaries:', error);
      setResult({
        affected: 0,
        message: 'Error updating salaries. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Salary Adjustments</h2>
        <p className="text-gray-600 mb-6">
          Apply percentage-based salary increases to employees within a specific salary range.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage Increase (%)
              </label>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="3.2"
                step="0.1"
                min="0"
                max="100"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary ($)
              </label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="58000"
                min="0"
                step="1000"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Salary ($)
              </label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="105000"
                min="0"
                step="1000"
                required
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Example:</h4>
            <p className="text-sm text-blue-700">
              Enter 3.2% increase for salaries ≥ $58,000 and &lt; $105,000
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Apply Salary Adjustments'}
            </button>
          </div>
        </form>

        {result && (
          <div className={`mt-4 p-4 rounded-md ${
            result.affected > 0 ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
          }`}>
            <p className="font-medium">{result.message}</p>
            {result.affected > 0 && (
              <p className="text-sm mt-1">
                Employees affected: {result.affected}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}