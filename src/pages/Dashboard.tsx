import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  Briefcase, 
  Send, 
  MessageSquare, 
  Award, 
  XCircle, 
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { useReminders } from '../hooks/useReminders';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/applications/StatusBadge';
import { Spinner } from '../components/ui/Spinner';

export const Dashboard: React.FC = () => {
  const { applications, loading: appsLoading } = useApplications();
  const { reminders } = useReminders();

  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter(app => !['rejected', 'offer'].includes(app.status)).length;
    const interviews = applications.filter(app => app.status === 'interview').length;
    const offers = applications.filter(app => app.status === 'offer').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const needsFollowUp = reminders.filter(r => r.reminder_type === 'follow_up' && !r.is_completed).length;

    return { total, active, interviews, offers, rejected, needsFollowUp };
  }, [applications, reminders]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      Saved: 0,
      Applied: 0,
      'Followed Up': 0,
      Interview: 0,
      Rejected: 0,
      Offer: 0
    };

    applications.forEach(app => {
      const label = app.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      counts[label] = (counts[label] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  const COLORS = ['#94a3b8', '#3b82f6', '#6366f1', '#14b8a6', '#ef4444', '#22c55e'];

  if (appsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-serif">Welcome back!</h1>
        <p className="text-slate-500">Here's an overview of your job search progress.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Applications" 
          value={stats.total} 
          icon={Briefcase} 
          color="blue" 
        />
        <StatCard 
          label="Interviews" 
          value={stats.interviews} 
          icon={MessageSquare} 
          color="teal" 
        />
        <StatCard 
          label="Offers" 
          value={stats.offers} 
          icon={Award} 
          color="emerald" 
        />
        <StatCard 
          label="Rejections" 
          value={stats.rejected} 
          icon={XCircle} 
          color="red" 
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2 min-w-0">
          <CardHeader>
            <CardTitle>Application Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommended Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              Recommended Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.active === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">No active applications. Ready to start?</p>
                <Link to="/applications">
                  <span className="mt-2 inline-block text-sm font-semibold text-primary-600 hover:underline">Add your first application</span>
                </Link>
              </div>
            ) : (
              <>
                {stats.needsFollowUp > 0 && (
                  <ActionItem 
                    icon={Send} 
                    label={`${stats.needsFollowUp} application${stats.needsFollowUp > 1 ? 's' : ''} need follow-up`} 
                    to="/reminders" 
                    color="indigo"
                  />
                )}
                <ActionItem 
                  icon={Clock} 
                  label="Review recent applications" 
                  to="/applications" 
                  color="blue"
                />
                <ActionItem 
                  icon={CheckCircle2} 
                  label="Update your resume versions" 
                  to="/settings" 
                  color="teal"
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <Link to="/applications" className="text-sm font-medium text-primary-600 hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500">You haven't added any applications yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2">Company</th>
                    <th className="pb-3">Position</th>
                    <th className="pb-3">Date Applied</th>
                    <th className="pb-3 text-right pr-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2 font-semibold text-slate-800">
                        <Link to={`/applications/${app.id}`}>{app.company_name}</Link>
                      </td>
                      <td className="py-4 text-sm text-slate-600">{app.job_position}</td>
                      <td className="py-4 text-sm text-slate-500">
                        {new Date(app.application_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <Card className="flex items-center gap-4 border-l-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold shadow-sm ${colors[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-800 tracking-tight">{value}</p>
      </div>
    </Card>
  );
};

const ActionItem = ({ icon: Icon, label, to, color }: any) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    teal: 'bg-teal-50 text-teal-600',
  };

  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-white hover:shadow-md hover:border-primary-100 group">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-primary-700 transition-colors">{label}</span>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
};
