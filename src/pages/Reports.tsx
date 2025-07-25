import React, { useState } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, DollarSign, FileText, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useReports } from '../hooks/useReports';
import { formatCurrency, formatDate } from '../utils/calculations';

export const Reports: React.FC = () => {
  const { reports, loading, generateReport, deleteReport, getFinancialInsights } = useReports();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [generating, setGenerating] = useState(false);

  const insights = getFinancialInsights();

  const handleGenerateReport = async () => {
    setGenerating(true);
    await generateReport(reportType, startDate, endDate);
    setGenerating(false);
    setIsModalOpen(false);
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      await deleteReport(id);
    }
  };

  const exportReport = (report: any) => {
    const reportData = {
      title: `Financial Report - ${report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}`,
      report_type: report.report_type,
      period: `${formatDate(report.period_start)} - ${formatDate(report.period_end)}`,
      total_income: report.total_income,
      total_expenses: report.total_expenses,
      net_savings: report.net_savings,
      savings_rate: report.total_income > 0 ? ((report.net_savings / report.total_income) * 100).toFixed(1) + '%' : '0%',
      top_categories: report.top_categories,
      generated_at: formatDate(report.created_at),
      currency: 'NPR'
    };

    // Create CSV format for better readability
    let csvContent = `Financial Report - ${report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}\n`;
    csvContent += `Period: ${reportData.period}\n`;
    csvContent += `Generated: ${reportData.generated_at}\n\n`;
    csvContent += `Summary:\n`;
    csvContent += `Total Income: ${formatCurrency(report.total_income)}\n`;
    csvContent += `Total Expenses: ${formatCurrency(report.total_expenses)}\n`;
    csvContent += `Net Savings: ${formatCurrency(report.net_savings)}\n`;
    csvContent += `Savings Rate: ${reportData.savings_rate}\n\n`;
    
    if (report.top_categories && report.top_categories.length > 0) {
      csvContent += `Top Spending Categories:\n`;
      csvContent += `Category,Amount,Percentage\n`;
      report.top_categories.forEach((cat: any) => {
        csvContent += `${cat.category},${formatCurrency(cat.amount)},${cat.percentage.toFixed(1)}%\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${report.report_type}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Financial Reports
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Generate detailed financial reports and insights
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Button onClick={() => setIsModalOpen(true)} size="lg" icon={<Plus className="h-5 w-5" />}>
            Generate Report
          </Button>
        </motion.div>
      </div>

      {/* Financial Insights */}
      {insights.length > 0 && (
        <Card hover>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
            Financial Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  insight.type === 'success' 
                    ? 'bg-green-50 border-green-500' 
                    : 'bg-yellow-50 border-yellow-500'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{insight.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Reports List */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card hover className="group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {report.report_type} Report
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(report.period_start)} - {formatDate(report.period_end)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600">Income</p>
                        <p className="font-semibold text-green-700">
                          {formatCurrency(report.total_income)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-600">Expenses</p>
                        <p className="font-semibold text-red-700">
                          {formatCurrency(report.total_expenses)}
                        </p>
                      </div>
                    </div>

                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600">Net Savings</p>
                      <p className={`font-semibold text-lg ${
                        report.net_savings >= 0 ? 'text-blue-700' : 'text-red-700'
                      }`}>
                        {formatCurrency(report.net_savings)}
                      </p>
                    </div>

                    {report.top_categories && report.top_categories.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Top Spending Categories</p>
                        <div className="space-y-2">
                          {report.top_categories.slice(0, 3).map((category: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{category.category}</span>
                              <span className="font-medium">{formatCurrency(category.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        Generated on {formatDate(report.created_at)}
                      </p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportReport(report)}
                          icon={<Download className="h-4 w-4" />}
                        >
                          Export
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteReport(report.id)}
                          icon={<FileText className="h-4 w-4" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports generated yet</h3>
            <p className="text-gray-600 mb-6">Create your first financial report to get insights into your spending</p>
            <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="h-4 w-4" />}>
              Generate Your First Report
            </Button>
          </div>
        </Card>
      )}

      {/* Generate Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate Financial Report"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="block w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 px-4 py-3"
            >
              <option value="monthly">Monthly Report</option>
              <option value="yearly">Yearly Report</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleGenerateReport} 
              loading={generating} 
              size="lg" 
              fullWidth
              icon={<BarChart3 className="h-5 w-5" />}
            >
              Generate Report
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsModalOpen(false)} 
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};