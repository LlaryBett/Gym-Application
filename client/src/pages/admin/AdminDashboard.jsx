import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, FaUserTie, FaDumbbell, FaCalendarCheck,
  FaArrowUp, FaArrowDown, FaCreditCard, FaChartLine
} from 'react-icons/fa';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { adminAPI } from '../../services/adminAPI';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newMembersToday: 0,
    totalTrainers: 0,
    totalPrograms: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    revenue_change: 0,     // 👈 Add these
    members_change: 0,     // 👈 Add these
    bookings_change: 0     // 👈 Add these
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [popularPrograms, setPopularPrograms] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [memberGrowth, setMemberGrowth] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [statsRes, membersRes, programsRes, revenueRes, growthRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getRecentMembers(5),
        adminAPI.getPopularPrograms(),
        adminAPI.getRevenueData(30),
        adminAPI.getMemberGrowth(30)
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (membersRes.success) setRecentMembers(membersRes.data);
      if (programsRes.success) setPopularPrograms(programsRes.data);
      if (revenueRes.success) setRevenueData(revenueRes.data);
      if (growthRes.success) setMemberGrowth(growthRes.data);

    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
              <span>{Math.abs(trend).toFixed(1)}% from last month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
          <Icon />
        </div>
      </div>
    </div>
  );

  const colors = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening at PowerGym.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Members"
          value={stats.totalMembers}
          icon={FaUsers}
          trend={stats.members_change}  // 👈 Use API data
          color={colors.orange}
        />
        <StatCard 
          title="Active Members"
          value={stats.activeMembers}
          icon={FaUsers}
          trend={stats.members_change}  // 👈 Use same trend or add separate one
          color={colors.green}
        />
        <StatCard 
          title="Today's Bookings"
          value={stats.todayBookings}
          icon={FaCalendarCheck}
          trend={stats.bookings_change}  // 👈 Use API data
          color={colors.blue}
        />
        <StatCard 
          title="Monthly Revenue"
          value={`KSH ${stats.monthlyRevenue?.toLocaleString()}`}
          icon={FaCreditCard}
          trend={stats.revenue_change}  // 👈 Use API data
          color={colors.purple}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#f97316" fill="#fed7aa" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Member Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="new_members" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Members</h3>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {member.status}
                </span>
              </div>
            ))}
          </div>
          <Link 
            to="/admin/members" 
            className="mt-4 inline-block text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            View All Members →
          </Link>
        </div>

        {/* Popular Programs */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Programs</h3>
          <div className="space-y-4">
            {popularPrograms.map((program) => (
              <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition">
                <div className="flex items-center gap-3">
                  <img 
                    src={program.image} 
                    alt={program.title}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{program.title}</p>
                    <p className="text-xs text-gray-500">{program.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600">{program.enrollments || 0}</p>
                  <p className="text-xs text-gray-500">enrollments</p>
                </div>
              </div>
            ))}
          </div>
          <Link 
            to="/admin/programs" 
            className="mt-4 inline-block text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            View All Programs →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;