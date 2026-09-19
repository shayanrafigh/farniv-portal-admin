import React, { useState, useEffect, useCallback } from 'react';
import { AuthSession, Project, Customer, ProjectStage, ProjectMessage } from './types';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { ProjectList } from './components/ProjectList';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { NewProjectModal } from './components/NewProjectModal';
import { CustomerManagement } from './components/CustomerManagement';
import { AdminSettings } from './components/AdminSettings';
import { FarnivLogo } from './components/FarnivLogo';

export default function App() {
  // Session state (strictly from saved localStorage session or null to require login)
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('safebox_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'projects' | 'customers' | 'settings' | 'messages'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Active Project Detail modal state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<{
    project: Project;
    stages: ProjectStage[];
    messages: ProjectMessage[];
  } | null>(null);

  // New Project modal state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  // Save session in localStorage
  const handleLoginSuccess = (newSession: AuthSession) => {
    setSession(newSession);
    localStorage.setItem('safebox_session', JSON.stringify(newSession));
    setActiveTab('projects');
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('safebox_session');
    setSelectedProjectId(null);
    setSelectedProjectDetail(null);
  };

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      const url =
        session.role === 'customer'
          ? `/api/projects?customerId=${session.id}`
          : '/api/projects';

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Fetch Customers
  const fetchCustomers = useCallback(async () => {
    if (!session || session.role !== 'admin') return;
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  }, [session]);

  // Fetch Project Details (stages & messages)
  const fetchProjectDetails = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedProjectDetail({
          project: data,
          stages: data.stages || [],
          messages: data.messages || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (session) {
      fetchProjects();
      if (session.role === 'admin') {
        fetchCustomers();
      }
    }
  }, [session, fetchProjects, fetchCustomers]);

  // Whenever selected project changes, load details
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectDetails(selectedProjectId);
    } else {
      setSelectedProjectDetail(null);
    }
  }, [selectedProjectId, fetchProjectDetails]);

  // Handle Project Creation
  const handleCreateProject = async (projectData: any) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'خطا در ثبت پروژه');
    }
    await fetchProjects();
  };

  // Handle Project Deletion
  const handleDeleteProject = async (projectId: string) => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await fetchProjects();
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    }
  };

  // Handle Customer Creation
  const handleCreateCustomer = async (customerData: any) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'خطا در ثبت مشتری');
    }
    await fetchCustomers();
    return data;
  };

  // Handle Customer Deletion
  const handleDeleteCustomer = async (id: string) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await fetchCustomers();
      await fetchProjects();
    }
  };

  // Handle Adding Stage with Local OS Image Upload
  const handleAddStage = async (formData: FormData) => {
    if (!selectedProjectId) return;
    const res = await fetch(`/api/projects/${selectedProjectId}/stages`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      throw new Error('خطا در آپلود مرحله و تصویر');
    }
    await fetchProjectDetails(selectedProjectId);
    await fetchProjects();
  };

  // Toggle Stage completion
  const handleToggleStageComplete = async (stageId: string, currentStatus: boolean) => {
    if (!selectedProjectId) return;
    await fetch(`/api/stages/${stageId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus }),
    });
    await fetchProjectDetails(selectedProjectId);
    await fetchProjects();
  };

  // Delete Stage
  const handleDeleteStage = async (stageId: string) => {
    if (!selectedProjectId) return;
    await fetch(`/api/stages/${stageId}`, {
      method: 'DELETE',
    });
    await fetchProjectDetails(selectedProjectId);
    await fetchProjects();
  };

  // Send Message / Reply
  const handleSendMessage = async (content: string, replyToId: string | null) => {
    if (!selectedProjectId || !session) return;
    const res = await fetch(`/api/projects/${selectedProjectId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: session.role,
        senderName: session.name,
        content,
        replyToId,
      }),
    });
    if (res.ok) {
      await fetchProjectDetails(selectedProjectId);
      await fetchProjects();
    }
  };

  // If user is not logged in, render Login screen
  if (!session) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'projects' && (
          <ProjectList
            projects={projects}
            session={session}
            onOpenProject={(id) => setSelectedProjectId(id)}
            onOpenNewProject={() => setShowNewProjectModal(true)}
            onDeleteProject={(session.role === 'admin' || session.permissions?.canManageProjects) ? handleDeleteProject : undefined}
          />
        )}

        {(session.role === 'admin' || session.permissions?.canManageCustomers) && activeTab === 'customers' && (
          <CustomerManagement
            customers={customers}
            onCreateCustomer={handleCreateCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onSelectCustomerProjects={(customerId) => {
              setActiveTab('projects');
            }}
          />
        )}

        {(session.role === 'admin' || session.permissions?.canManageSettings) && activeTab === 'settings' && (
          <AdminSettings
            session={session}
            onUpdateSession={(newUsername) => {
              setSession((prev) => (prev ? { ...prev, username: newUsername } : null));
            }}
          />
        )}
      </main>

      {/* Project Detail & Stage Inspection Modal */}
      {selectedProjectDetail && (
        <ProjectDetailModal
          project={selectedProjectDetail.project}
          stages={selectedProjectDetail.stages}
          messages={selectedProjectDetail.messages}
          session={session}
          onClose={() => setSelectedProjectId(null)}
          onAddStage={handleAddStage}
          onToggleStageComplete={handleToggleStageComplete}
          onDeleteStage={handleDeleteStage}
          onSendMessage={handleSendMessage}
          onRefresh={() => fetchProjectDetails(selectedProjectId!)}
        />
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          customers={customers}
          onClose={() => setShowNewProjectModal(false)}
          onCreateProject={handleCreateProject}
          onOpenNewCustomer={() => {
            setShowNewProjectModal(false);
            setActiveTab('customers');
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <div className="bg-white px-2 py-1 rounded-lg border border-slate-700 shadow-sm shrink-0">
              <FarnivLogo variant="light" className="h-5" />
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-300">گروه صنعتی فرنیو (FARNIV)</span>
              <span className="text-slate-600 mx-2 hidden sm:inline">|</span>
              <span className="text-slate-400">تولیدکننده گاوصندوق‌های آسانسوری بال اسکرو و نسوز</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono" dir="ltr">
            <a href="https://www.farniv.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 text-slate-400 transition-colors">
              www.farniv.com
            </a>
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">Storage: uploads/</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
