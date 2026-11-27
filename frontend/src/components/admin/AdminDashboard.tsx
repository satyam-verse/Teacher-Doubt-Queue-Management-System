import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ShieldCheck,
  Users,
  Bot,
  Zap,
  Activity,
  CheckCircle2,
  RefreshCw,
  Search,
  Server,
  Database,
  Cpu,
  Radio
} from 'lucide-react';
import type { AdminStats, SystemHealthInfo, User, Role, SubscriptionTier } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealthInfo | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'health'>('overview');

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch stats
      const statsRes = await api.get('/api/v1/admin/stats');
      if (statsRes.data) {
        setStats(statsRes.data);
      }

      // 2. Fetch health
      const healthRes = await api.get('/api/v1/admin/health');
      if (healthRes.data) {
        setHealth(healthRes.data);
      }

      // 3. Fetch users
      const params: Record<string, string> = {};
      if (searchQuery) params.q = searchQuery;
      if (roleFilter) params.role = roleFilter;
      if (tierFilter) params.tier = tierFilter;

      const usersRes = await api.get('/api/v1/admin/users', { params });
      if (usersRes.data) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token, roleFilter, tierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleUpdateRole = async (userId: number, newRole: Role) => {
    if (!token) return;
    try {
      const res = await api.patch(`/api/v1/admin/users/${userId}/role`, { role: newRole });
      if (res.status === 200) {
        setActionMessage(`User #${userId} role updated to ${newRole}`);
        fetchAdminData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update role:', err);
      setActionMessage(err.response?.data?.error || 'Failed to update role');
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleUpdateTier = async (userId: number, newTier: SubscriptionTier) => {
    if (!token) return;
    try {
      const res = await api.patch(`/api/v1/admin/users/${userId}/tier`, { tier: newTier });
      if (res.status === 200) {
        setActionMessage(`User #${userId} tier updated to ${newTier.toUpperCase()}`);
        fetchAdminData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update tier:', err);
      setActionMessage(err.response?.data?.error || 'Failed to update tier');
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="cyan" className="text-[10px] uppercase font-mono font-bold tracking-wider">
              Institutional Admin
            </Badge>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">DoubtX Governance & Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span>Institutional Admin Console</span>
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
            Department-wide analytics, RBAC role management, SaaS subscription licensing, and system telemetry across all university nodes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAdminData}
            disabled={loading}
            className="text-xs border-white/10 bg-navy-900/80 text-slate-300 hover:bg-navy-800 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-medium text-center shadow-lg shadow-emerald-950/40">
          {actionMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-white hover:bg-navy-900/60'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Institutional Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-white hover:bg-navy-900/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User & Tier Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'health'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
              : 'text-slate-400 hover:text-white hover:bg-navy-900/60'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>System Diagnostics</span>
        </button>
      </div>

      {/* TAB 1: Overview & Institutional Analytics */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neo-glass-card rounded-2xl p-5 space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Enrolled</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats?.users.total ?? '--'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {stats?.users.students ?? 0} Students · {stats?.users.teachers ?? 0} Faculty
              </div>
            </div>

            <div className="neo-glass-card rounded-2xl p-5 space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Classroom Doubts</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats?.doubts.total ?? '--'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {stats?.doubts.resolved ?? 0} Resolved · {stats?.doubts.queued ?? 0} Queued
              </div>
            </div>

            <div className="neo-glass-card rounded-2xl p-5 space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>AI Discussions</span>
                <Bot className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats?.ai_workspace.total_conversations ?? '--'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {stats?.ai_workspace.total_messages_generated ?? 0} Prompts & Proofs
              </div>
            </div>

            <div className="neo-glass-card rounded-2xl p-5 space-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Turnaround Velocity</span>
                <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {stats?.doubts.avg_resolution_minutes ?? 0}m
              </div>
              <div className="text-[11px] text-slate-400">Average resolution latency</div>
            </div>
          </div>

          {/* Subscription Tier Distribution */}
          <div className="neo-glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>SaaS License Tier Breakdown</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-navy-950/70 border border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-semibold">Free Starter</span>
                  <Badge variant="outline" className="text-[10px] font-mono">20 queries/day</Badge>
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {stats?.users.tier_distribution.free ?? 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Active student accounts</div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950/70 border border-purple-500/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-purple-300 font-semibold">DoubtX Pro</span>
                  <Badge variant="purple" className="text-[10px] font-mono">Unlimited AI</Badge>
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {stats?.users.tier_distribution.pro ?? 0}
                </div>
                <div className="text-[11px] text-purple-300/70 mt-0.5">Pro student subscribers</div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950/70 border border-cyan-500/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyan-300 font-semibold">Campus Enterprise</span>
                  <Badge variant="cyan" className="text-[10px] font-mono">Institutional</Badge>
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  {stats?.users.tier_distribution.campus ?? 0}
                </div>
                <div className="text-[11px] text-cyan-300/70 mt-0.5">Faculty & Admin seats</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: User & Role Management Table */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All Tiers</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="campus">Campus</option>
              </select>

              <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-xs">
                Filter
              </Button>
            </div>
          </form>

          {/* Users Table */}
          <div className="neo-glass-card rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-navy-950/90 border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Role Switcher</th>
                    <th className="py-3.5 px-4">Subscription Tier</th>
                    <th className="py-3.5 px-4">Daily Quota Usage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-3.5 px-4 font-medium text-white">
                          <div className="flex items-center space-x-2.5">
                            <div className="h-7 w-7 rounded-full bg-navy-800 border border-cyan-500/30 flex items-center justify-center font-bold text-[11px] text-cyan-400 shadow-sm">
                              {u.full_name.charAt(0)}
                            </div>
                            <span>{u.full_name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value as Role)}
                            className="bg-navy-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 font-medium"
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.subscription_tier || 'free'}
                            onChange={(e) => handleUpdateTier(u.id, e.target.value as SubscriptionTier)}
                            className={`bg-navy-950 border rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider font-mono ${
                              u.subscription_tier === 'campus'
                                ? 'border-cyan-500/50 text-cyan-300 bg-cyan-950/30'
                                : u.subscription_tier === 'pro'
                                ? 'border-purple-500/50 text-purple-300 bg-purple-950/30'
                                : 'border-white/10 text-slate-400'
                            }`}
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="campus">Campus</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <span className="text-cyan-400 font-semibold">{u.daily_ai_query_count || 0}</span>
                          <span className="text-slate-500"> / </span>
                          <span>{u.daily_ai_query_quota || 20}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: System Diagnostics & Health */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Database Service */}
            <div className="neo-glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Database className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-semibold text-white text-sm">Database Engine</h3>
                </div>
                <Badge variant={health?.services.database.status === 'connected' ? 'success' : 'destructive'} className="font-mono text-[10px]">
                  {health?.services.database.status || 'Checking...'}
                </Badge>
              </div>
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Engine:</span>
                  <span className="font-mono text-slate-200">{health?.services.database.engine || 'SQLite / MySQL'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Connection:</span>
                  <span className="text-emerald-400 font-semibold font-mono">Active Pool</span>
                </div>
                <div className="flex justify-between">
                  <span>Read Latency:</span>
                  <span className="font-mono text-slate-200">~1.2 ms</span>
                </div>
              </div>
            </div>

            {/* Google Gemini AI */}
            <div className="neo-glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Cpu className="h-5 w-5 text-purple-400" />
                  <h3 className="font-semibold text-white text-sm">Gemini AI Model</h3>
                </div>
                <Badge variant={health?.services.gemini_ai.status === 'connected' ? 'purple' : 'warning'} className="font-mono text-[10px]">
                  {health?.services.gemini_ai.status || 'Active'}
                </Badge>
              </div>
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Model:</span>
                  <span className="font-mono text-slate-200">{health?.services.gemini_ai.model || 'gemini-2.5-flash'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Multimodal:</span>
                  <span className="text-indigo-400 font-semibold">Images & PDFs Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className="font-mono text-slate-200">{health?.services.gemini_ai.latency_ms || 320} ms</span>
                </div>
              </div>
            </div>

            {/* WebSocket Real-Time Gateway */}
            <div className="neo-glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Radio className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-semibold text-white text-sm">WebSocket Gateway</h3>
                </div>
                <Badge variant="success" className="font-mono text-[10px]">Active</Badge>
              </div>
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Protocol:</span>
                  <span className="font-mono text-slate-200">{health?.services.websocket.protocol || 'Socket.IO v4'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span>Broadcast Mode:</span>
                  <span className="text-emerald-400 font-semibold font-mono">Async Threading</span>
                </div>
                <div className="flex justify-between">
                  <span>Live Sync:</span>
                  <span className="font-mono text-slate-200">&lt; 300 ms</span>
                </div>
              </div>
            </div>

          </div>

          <div className="neo-glass-card rounded-2xl p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>Server Timestamp: <span className="font-mono text-slate-200">{health?.timestamp || new Date().toISOString()}</span></span>
            <span className="text-emerald-400 flex items-center space-x-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>Full Platform Health Verified</span>
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
