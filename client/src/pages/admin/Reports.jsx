import React, { useState, useEffect } from 'react';
import {
  FaDownload, FaCalendarAlt, FaUsers, FaDumbbell,
  FaMoneyBillWave, FaChartLine, FaChartBar, FaChartPie,
  FaFileExport, FaPrint, FaEnvelope, FaFilePdf,
  FaFileExcel, FaClock, FaUserTie, FaCreditCard,
  FaCrown, FaFire, FaArrowUp, FaArrowDown,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';
import DateRangePicker from '../../components/admin/DateRangePicker';
import ReportCard from '../../components/admin/ReportCard';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [exportLoading, setExportLoading] = useState(false);
  
  // Report data states
  const [overviewStats, setOverviewStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);
  const [programPopularity, setProgramPopularity] = useState([]);
  const [trainerPerformance, setTrainerPerformance] = useState([]);
  const [membershipDistribution, setMembershipDistribution] = useState([]);
  const [bookingTrends, setBookingTrends] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  const [retentionStats, setRetentionStats] = useState({ retention_rate: 0, monthly_churn: 0, yearly_churn: 0 });

  useEffect(() => {
    fetchAllReports();
  }, [dateRange]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      
      const [
        overviewRes,
        revenueRes,
        growthRes,
        programsRes,
        trainersRes,
        membershipRes,
        bookingsRes,
        hoursRes,
        retentionRes
      ] = await Promise.all([
        adminAPI.getOverviewStats(dateRange),
        adminAPI.getRevenueReport(dateRange),
        adminAPI.getMemberGrowthReport(dateRange),
        adminAPI.getPopularPrograms(dateRange),
        adminAPI.getTrainerPerformance(dateRange),
        adminAPI.getMembershipDistribution(),
        adminAPI.getBookingTrends(dateRange),
        adminAPI.getPeakHours(),
        adminAPI.getRetentionRate()
      ]);

      if (overviewRes.success) setOverviewStats(overviewRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data);
      if (growthRes.success) setMemberGrowth(growthRes.data);
      if (programsRes.success) setProgramPopularity(programsRes.data);
      if (trainersRes.success) setTrainerPerformance(trainersRes.data);
      if (membershipRes.success) setMembershipDistribution(membershipRes.data);
      if (bookingsRes.success) setBookingTrends(bookingsRes.data);
      if (hoursRes.success) setPeakHours(hoursRes.data);
      if (retentionRes.success) {
        setRetentionData(retentionRes.data.timeline || []);
        setRetentionStats({
          retention_rate: retentionRes.data.retention_rate || 0,
          monthly_churn: retentionRes.data.monthly_churn || 0,
          yearly_churn: retentionRes.data.yearly_churn || 0
        });
      }

    } catch (error) {
      console.error('Fetch reports error:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'pdf') => {
    try {
      setExportLoading(true);
      const response = await adminAPI.exportReport(activeTab, format, dateRange);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${activeTab}_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'members', label: 'Members', icon: FaUsers },
    { id: 'revenue', label: 'Revenue', icon: FaMoneyBillWave },
    { id: 'programs', label: 'Programs', icon: FaDumbbell },
    { id: 'trainers', label: 'Trainers', icon: FaUserTie },
    { id: 'bookings', label: 'Bookings', icon: FaClock },
    { id: 'retention', label: 'Retention', icon: FaChartBar }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track your gym's performance and growth</p>
        </div>

        <div className="flex items-center gap-3">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          
          <div className="relative">
            <button
              onClick={() => handleExport('pdf')}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
            >
              <FaDownload />
              {exportLoading ? 'Exporting...' : 'Export Report'}
            </button>
            
            {exportLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition ${
                activeTab === tab.id
                  ? 'text-orange-500 border-b-2 border-orange-500 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && overviewStats && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ReportCard
                title="Total Revenue"
                value={`KSH ${overviewStats.totalRevenue?.toLocaleString()}`}
                change={overviewStats.revenueChange}
                icon={FaMoneyBillWave}
                color="green"
              />
              <ReportCard
                title="Active Members"
                value={overviewStats.activeMembers}
                change={overviewStats.membersChange}
                icon={FaUsers}
                color="blue"
              />
              <ReportCard
                title="New Members"
                value={overviewStats.newMembers}
                change={overviewStats.newMembersChange}
                icon={FaUserTie}
                color="orange"
              />
              <ReportCard
                title="Total Bookings"
                value={overviewStats.totalBookings}
                change={overviewStats.bookingsChange}
                icon={FaClock}
                color="purple"
              />
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f97316" 
                    fill="#fed7aa" 
                    name="Revenue (KSH)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Member Growth & Program Popularity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={memberGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="new_members" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Members"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Programs</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programPopularity.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="title" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Membership Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Membership Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={membershipDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="member_count"
                    >
                      {membershipDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {membershipDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span>{item.plan_name}</span>
                      </div>
                      <span className="font-semibold">{item.member_count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Activity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 mb-1">Active Today</p>
                    <p className="text-2xl font-bold text-blue-800">{overviewStats?.activeToday || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 mb-1">This Week</p>
                    <p className="text-2xl font-bold text-green-800">{overviewStats?.activeThisWeek || 0}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 mb-1">New This Month</p>
                    <p className="text-2xl font-bold text-orange-800">{overviewStats?.newThisMonth || 0}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Returning</p>
                    <p className="text-2xl font-bold text-purple-800">{overviewStats?.returningMembers || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KSH {overviewStats?.monthlyRevenue?.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Average Transaction</p>
                <p className="text-2xl font-bold text-gray-900">KSH {overviewStats?.avgTransaction?.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm text-gray-500 mb-2">Projected Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KSH {overviewStats?.projectedRevenue?.toLocaleString()}</p>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Membership Distribution %</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={membershipDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="percentage"
                    >
                      {membershipDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">M-Pesa</span>
                    <span className="font-semibold">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Credit Card</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Bank Transfer</span>
                    <span className="font-semibold">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Popular Programs */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Most Popular Programs</h3>
                <div className="space-y-4">
                  {programPopularity.slice(0, 5).map((program, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">{idx + 1}.</span>
                        <span className="text-sm text-gray-600">{program.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-orange-600">{program.enrollments}</span>
                        <span className="text-xs text-gray-400">enrollments</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Categories */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Program Categories</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Strength', value: 35 },
                        { name: 'Cardio', value: 25 },
                        { name: 'Yoga', value: 20 },
                        { name: 'HIIT', value: 15 },
                        { name: 'Other', value: 5 }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Trainers Tab */}
        {activeTab === 'trainers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trainer Performance */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Trainers</h3>
                <div className="space-y-4">
                  {trainerPerformance.slice(0, 5).map((trainer, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 text-xs font-bold">
                            {trainer.name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{trainer.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-green-600">{trainer.sessions}</span>
                        <span className="text-xs text-gray-400">sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trainer Ratings */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Trainer Ratings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trainerPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="avg_rating" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Booking Trends */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={bookingTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#f97316" 
                    fill="#fed7aa" 
                    name="Bookings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Peak Hours */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Peak Hours</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Booking Status */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confirmed</span>
                    <span className="font-semibold text-green-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-semibold text-yellow-600">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-semibold text-blue-600">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cancelled</span>
                    <span className="font-semibold text-red-600">5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retention Tab */}
        {activeTab === 'retention' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Retention Rate */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Retention</h3>
                <div className="text-center">
                  <div className="relative inline-block">
                    <svg className="w-32 h-32">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className="text-orange-500"
                        strokeWidth="8"
                        strokeDasharray={352}
                        strokeDashoffset={352 * (1 - (retentionStats.retention_rate / 100))}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                    </svg>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="text-3xl font-bold text-gray-900">{Math.round(retentionStats.retention_rate)}%</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">Member retention rate</p>
                </div>
              </div>

              {/* Churn Rate */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Churn Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Churn</span>
                    <span className="font-semibold text-red-600">{retentionStats.monthly_churn}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${retentionStats.monthly_churn}%` }}></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-600">Yearly Churn</span>
                    <span className="font-semibold text-red-600">{retentionStats.yearly_churn}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${retentionStats.yearly_churn}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Retention Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Retention Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="retention_rate" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    name="Retention %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;