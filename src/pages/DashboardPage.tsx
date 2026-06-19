import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Building2, RefreshCw, ChevronDown, Check, X } from 'lucide-react';
import useDashboardStore from '../store/useDashboardStore';
import { mockClinics } from '../mock/clinics';
import KPICards from '../components/dashboard/KPICards';
import ClinicDataTable from '../components/dashboard/ClinicDataTable';
import TrendChart from '../components/dashboard/TrendChart';
import MissingAnglePie from '../components/dashboard/MissingAnglePie';

const DashboardPage: React.FC = () => {
  const {
    selectedDate,
    selectedClinicIds,
    setSelectedDate,
    toggleClinic,
    setAllClinics,
    loadDashboardData,
  } = useDashboardStore();

  const [showClinicDropdown, setShowClinicDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowClinicDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleSelectAllClinics = () => {
    if (selectedClinicIds.length === mockClinics.length) {
      setAllClinics([]);
    } else {
      setAllClinics(mockClinics.map((c) => c.id));
    }
  };

  const getSelectedClinicLabel = () => {
    if (selectedClinicIds.length === 0) return '全部门店';
    if (selectedClinicIds.length === mockClinics.length) return '全部门店';
    if (selectedClinicIds.length === 1) {
      const clinic = mockClinics.find((c) => c.id === selectedClinicIds[0]);
      return clinic?.name ?? '已选择 1 家';
    }
    return `已选择 ${selectedClinicIds.length} 家`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">门店看板</h1>
          <p className="text-sm text-slate-500">实时监控各门店复诊拍照质量数据</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">选择日期</span>
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-44 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-mono"
                />
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowClinicDropdown(!showClinicDropdown)}
                className="inline-flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-200 min-w-[200px]"
              >
                <Building2 className="w-5 h-5 text-slate-500" />
                <span className="flex-1 text-left text-sm text-slate-700 font-medium truncate">
                  {getSelectedClinicLabel()}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    showClinicDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showClinicDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-elevated border border-slate-200 overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={handleSelectAllClinics}
                      className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-white transition-colors"
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          selectedClinicIds.length === mockClinics.length
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedClinicIds.length === mockClinics.length && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-slate-700">全选所有门店</span>
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-2">
                    {mockClinics.map((clinic) => {
                      const isChecked = selectedClinicIds.includes(clinic.id);
                      const isAllSelected = selectedClinicIds.length === 0;
                      const checked = isChecked || isAllSelected;
                      return (
                        <button
                          key={clinic.id}
                          type="button"
                          onClick={() => toggleClinic(clinic.id)}
                          className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              checked
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-slate-300 hover:border-primary-400'
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-medium text-slate-800 truncate">
                              {clinic.name}
                            </div>
                            <div className="text-xs text-slate-400 truncate mt-0.5">
                              {clinic.address}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedClinicIds.length > 0 && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                      <button
                        type="button"
                        onClick={() => setAllClinics([])}
                        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-danger-600 hover:bg-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        清除选择
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1" />

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4.5 h-4.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              刷新数据
            </button>
          </div>
        </div>

        <div className="mb-6">
          <KPICards />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">门店数据明细</h2>
          </div>
          <ClinicDataTable />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrendChart />
          </div>
          <div className="lg:col-span-1">
            <MissingAnglePie />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
