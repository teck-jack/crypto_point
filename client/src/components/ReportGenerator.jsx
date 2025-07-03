import React, { useState } from 'react';
import { X, Download, FileText, Calendar, TrendingUp, DollarSign, File, Database } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

const ReportGenerator = ({ cryptoData, favorites, onClose }) => {
  const [reportType, setReportType] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const cryptoArray = Object.values(cryptoData);

  const calculatePortfolioStats = () => {
    const totalCoins = cryptoArray.length;
    const gainers = cryptoArray.filter(crypto => parseFloat(crypto.priceChangePercent) > 0).length;
    const losers = cryptoArray.filter(crypto => parseFloat(crypto.priceChangePercent) < 0).length;
    const avgChange = cryptoArray.reduce((sum, crypto) => sum + parseFloat(crypto.priceChangePercent), 0) / totalCoins;
    const totalVolume = cryptoArray.reduce((sum, crypto) => sum + parseFloat(crypto.volume), 0);

    return { totalCoins, gainers, losers, avgChange, totalVolume };
  };

  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF();
      const stats = calculatePortfolioStats();

      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246);
      pdf.text('CryptoPulse Market Report', 20, 30);

      // Date
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);

      // Market Overview
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Market Overview', 20, 65);

      pdf.setFontSize(10);
      pdf.text(`Total Cryptocurrencies Tracked: ${stats.totalCoins}`, 25, 80);
      pdf.text(`Gainers: ${stats.gainers} | Losers: ${stats.losers}`, 25, 90);
      pdf.text(`Average 24h Change: ${stats.avgChange.toFixed(2)}%`, 25, 100);
      pdf.text(`Total 24h Volume: $${(stats.totalVolume / 1e9).toFixed(2)}B`, 25, 110);

      // Favorites Section
      if (favorites.length > 0) {
        pdf.text('Favorite Cryptocurrencies', 20, 130);
        let yPos = 145;

        favorites.forEach((symbol, index) => {
          const crypto = cryptoData[symbol];
          if (crypto && yPos < 270) {
            const price = parseFloat(crypto.lastPrice);
            const change = parseFloat(crypto.priceChangePercent);
            const changeColor = change >= 0 ? [16, 185, 129] : [239, 68, 68];

            pdf.setTextColor(0, 0, 0);
            pdf.text(`${symbol.replace('USDT', '')}: $${price.toFixed(2)}`, 25, yPos);
            pdf.setTextColor(...changeColor);
            pdf.text(`${change >= 0 ? '+' : ''}${change.toFixed(2)}%`, 120, yPos);
            yPos += 12;
          }
        });
      }

      // Top Performers
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Top Performers (24h)', 20, 30);

      const sortedGainers = cryptoArray
        .filter(crypto => parseFloat(crypto.priceChangePercent) > 0)
        .sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
        .slice(0, 10);

      let yPos = 50;
      pdf.setFontSize(10);
      sortedGainers.forEach((crypto, index) => {
        const price = parseFloat(crypto.lastPrice);
        const change = parseFloat(crypto.priceChangePercent);

        pdf.setTextColor(0, 0, 0);
        pdf.text(`${index + 1}. ${crypto.symbol.replace('USDT', '')}: $${price.toFixed(2)}`, 25, yPos);
        pdf.setTextColor(16, 185, 129);
        pdf.text(`+${change.toFixed(2)}%`, 120, yPos);
        yPos += 15;
      });

      // Save PDF
      pdf.save(`cryptopulse-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF report generated successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCSVReport = () => {
    setIsGenerating(true);
    try {
      const headers = ['Symbol', 'Price (USD)', '24h Change (%)', '24h Volume', 'High (24h)', 'Low (24h)', 'Is Favorite'];
      const csvData = [headers];

      cryptoArray.forEach(crypto => {
        csvData.push([
          crypto.symbol.replace('USDT', ''),
          parseFloat(crypto.lastPrice).toFixed(2),
          parseFloat(crypto.priceChangePercent).toFixed(2),
          parseFloat(crypto.volume).toFixed(2),
          parseFloat(crypto.highPrice || crypto.lastPrice).toFixed(2),
          parseFloat(crypto.lowPrice || crypto.lastPrice).toFixed(2),
          favorites.includes(crypto.symbol) ? 'Yes' : 'No'
        ]);
      });

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cryptopulse-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('CSV report generated successfully!');
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.error('Failed to generate CSV report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateReport = () => {
    if (reportType === 'pdf') {
      generatePDFReport();
    } else if (reportType === 'csv') {
      generateCSVReport();
    }
  };

  const stats = calculatePortfolioStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Generate Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Market Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Market Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Coins</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalCoins}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{favorites.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Gainers</p>
                <p className="text-xl font-bold text-green-500">{stats.gainers}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Losers</p>
                <p className="text-xl font-bold text-red-500">{stats.losers}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg 24h Change:</span>
                <span className={`font-semibold ${stats.avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Volume:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${(stats.totalVolume / 1e9).toFixed(2)}B
                </span>
              </div>
            </div>
          </div>

          {/* Report Format Selection */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <File className="w-5 h-5 mr-2 text-purple-500" />
              Select Report Format
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDF Option */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${reportType === 'pdf'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                onClick={() => setReportType('pdf')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="reportType"
                    value="pdf"
                    checked={reportType === 'pdf'}
                    onChange={() => setReportType('pdf')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <FileText className="w-6 h-6 text-red-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">PDF Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Detailed formatted report</p>
                  </div>
                </div>
              </div>

              {/* CSV Option */}
              <div
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${reportType === 'csv'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                  }`}
                onClick={() => setReportType('csv')}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="reportType"
                    value="csv"
                    checked={reportType === 'csv'}
                    onChange={() => setReportType('csv')}
                    className="w-4 h-4 text-green-600"
                  />
                  <Database className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">CSV Export</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Raw data for analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Option for PDF */}
            {reportType === 'pdf' && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeCharts"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeCharts" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Include performance charts and visualizations
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Report Preview */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Report will include:
            </h3>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Market overview and statistics</li>
              <li>• All {stats.totalCoins} tracked cryptocurrencies</li>
              <li>• Your {favorites.length} favorite coins</li>
              <li>• 24-hour performance data</li>
              <li>• Top gainers and losers analysis</li>
              {reportType === 'pdf' && includeCharts && <li>• Performance visualizations</li>}
              {reportType === 'csv' && <li>• Raw data in spreadsheet format</li>}
            </ul>
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="btn-secondary flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;