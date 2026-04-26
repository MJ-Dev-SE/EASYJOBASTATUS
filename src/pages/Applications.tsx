import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Briefcase, ExternalLink, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/applications/StatusBadge';
import { Spinner } from '../components/ui/Spinner';
import { ApplicationStatus } from '../types';
import { Link } from 'react-router-dom';

export const Applications: React.FC = () => {
  const { applications, loading, addApplication, deleteApplication } = useApplications();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    company_name: '',
    job_position: '',
    job_link: '',
    status: 'saved' as ApplicationStatus,
    application_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.job_position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [applications, searchQuery, filterStatus]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addApplication(formData);
    setIsAddModalOpen(false);
    setFormData({
      company_name: '',
      job_position: '',
      job_link: '',
      status: 'saved',
      application_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Job Applications</h1>
          <p className="text-slate-500">Track all your active and past applications in one place.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Application
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company or position..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400 lg:hidden" />
          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="followed_up">Followed Up</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="offer">Offer</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Briefcase className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No applications found</h3>
          <p className="mt-1 text-slate-500">Try adjusting your filters or add a new application.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((app) => (
            <Card key={app.id} hoverable className="group">
              <div className="flex items-start justify-between">
                <StatusBadge status={app.status} />
                <button 
                  onClick={() => deleteApplication(app.id)}
                  className="rounded-full p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{app.company_name}</h3>
                <p className="text-sm font-medium text-slate-600 line-clamp-1">{app.job_position}</p>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <span>Applied:</span>
                  <span className="font-semibold">{new Date(app.application_date).toLocaleDateString()}</span>
                </div>
                {app.job_link && (
                  <a 
                    href={app.job_link} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-1 text-primary-600 hover:underline"
                  >
                    View Link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="mt-6">
                <Link to={`/applications/${app.id}`}>
                  <Button variant="outline" className="w-full text-slate-600 hover:border-primary-200">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <Card className="relative w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="mb-6 text-2xl font-bold font-serif">Add Application</h2>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Company Name</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g. Google"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Job Position</label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                    value={formData.job_position}
                    onChange={(e) => setFormData({ ...formData, job_position: e.target.value })}
                    placeholder="e.g. Frontend Developer"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Job Link (Optional)</label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                  value={formData.job_link}
                  onChange={(e) => setFormData({ ...formData, job_link: e.target.value })}
                  placeholder="https://jobs.google.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="saved">Saved</option>
                    <option value="applied">Applied</option>
                    <option value="followed_up">Followed Up</option>
                    <option value="interview">Interview</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                    value={formData.application_date}
                    onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Notes</label>
                <textarea
                  className="h-24 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm focus:border-primary-500 focus:bg-white focus:outline-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add initial notes or context..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Application</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
