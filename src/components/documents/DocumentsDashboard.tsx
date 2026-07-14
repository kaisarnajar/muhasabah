'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Edit, Trash2, FileText, ExternalLink, Search } from 'lucide-react';
import { addDocument, updateDocument, deleteDocument } from '@/actions/documents';
import { useToast } from '@/context/ToastContext';
import { Document } from '@prisma/client';

export default function DocumentsDashboard({ initialDocuments }: { initialDocuments: Document[] }) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('ALL');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const openAddModal = () => {
    setTitle('');
    setLink('');
    setNotes('');
    setIsFormOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !link.trim()) return;
    setLoading(true);
    try {
      await addDocument(title, link, notes);
      setIsFormOpen(false);
      setCurrentPage(1);
      showToast('Document added successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to add document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !title.trim() || !link.trim()) return;
    setLoading(true);
    try {
      await updateDocument(selectedDoc.id, title, link, notes);
      setIsEditOpen(false);
      setSelectedDoc(null);
      showToast('Document updated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update document', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(docId);
      setSelectedDoc(null);
      showToast('Document deleted successfully.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete document', 'error');
    }
  };

  const handleFilterChange = (newPeriod: string) => {
    setFilterPeriod(newPeriod);
    setCurrentPage(1);
  };

  // Filter documents by search and period
  const filteredDocs = initialDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || 
                          (doc.notes && doc.notes.toLowerCase().includes(search.toLowerCase())) ||
                          doc.link.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const d = new Date(doc.date);
    const now = new Date();

    if (filterPeriod === 'ALL') return true;
    if (filterPeriod === 'TODAY') {
      return d.toISOString().split('T')[0] === now.toISOString().split('T')[0];
    }
    if (filterPeriod === 'WEEK') {
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      weekStart.setDate(weekStart.getDate() - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1)); // Monday
      return d >= weekStart;
    }
    if (filterPeriod === 'MONTH') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (filterPeriod === 'YEAR') {
      return d.getFullYear() === now.getFullYear();
    }
    if (filterPeriod === 'CUSTOM') {
      if (!customStart || !customEnd) return true;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return d >= start && d <= end;
    }
    return true;
  });

  // pagination
  const PAGE_SIZE = 12;
  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedDocs = filteredDocs.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  const filterTabs = [
    { id: 'ALL', label: 'All' },
    { id: 'TODAY', label: 'Today' },
    { id: 'WEEK', label: 'This Week' },
    { id: 'MONTH', label: 'This Month' },
    { id: 'YEAR', label: 'This Year' },
    { id: 'CUSTOM', label: 'Custom Range' },
  ];

  return (
    <div>
      {/* Search and Add Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder="Search documents by title, notes, or link..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="search-input"
            style={{ width: '100%', paddingLeft: '44px', borderRadius: '12px', height: '44px' }}
          />
        </div>
        <button 
          onClick={openAddModal}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 700 }}
        >
          <Plus size={18} /> Add Document
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleFilterChange(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '13px',
              backgroundColor: filterPeriod === tab.id ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
              color: filterPeriod === tab.id ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filterPeriod === 'CUSTOM' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input type="date" value={customStart} onChange={(e) => { setCustomStart(e.target.value); setCurrentPage(1); }} className="search-input" style={{ borderRadius: '10px' }} />
          <span className="text-on-surface-variant" style={{ fontWeight: 600 }}>to</span>
          <input type="date" value={customEnd} onChange={(e) => { setCustomEnd(e.target.value); setCurrentPage(1); }} className="search-input" style={{ borderRadius: '10px' }} />
        </div>
      )}

      {/* Grid of Documents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {paginatedDocs.length === 0 ? (
          <p className="text-on-surface-variant text-body-md" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1', fontStyle: 'italic', fontWeight: 600 }}>
            No documents found. Click "Add Document" to begin logging your resources.
          </p>
        ) : (
          paginatedDocs.map(doc => {
            const docDate = new Date(doc.date);
            const dateStr = docDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

            return (
              <div 
                key={doc.id} 
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1.5px solid var(--c-outline-variant)',
                  backgroundColor: 'var(--c-surface-container-low)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'var(--c-primary)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(191,145,41,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--c-outline-variant)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                {/* Header: Title and Icon */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ padding: '10px', backgroundColor: 'rgba(191,145,41,0.1)', color: 'var(--c-primary)', borderRadius: '12px', display: 'flex', flexShrink: 0 }}>
                    <FileText size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 className="text-title-md" style={{ margin: 0, fontWeight: 700, color: 'var(--c-on-surface)', wordBreak: 'break-word', lineHeight: 1.3 }}>
                      {doc.title}
                    </h4>
                  </div>
                </div>

                {/* Notes Speech Bubble */}
                {doc.notes && (
                  <p style={{ 
                    margin: 0, 
                    padding: '10px 14px', 
                    borderRadius: '12px', 
                    backgroundColor: 'var(--c-surface-container-high)',
                    fontSize: '13px', 
                    color: 'var(--c-on-surface-variant)', 
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    borderLeft: '4px solid var(--c-primary)',
                    wordBreak: 'break-word'
                  }}>
                    "{doc.notes}"
                  </p>
                )}

                {/* Footer and Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '12px', marginTop: 'auto' }}>
                  <span className="text-body-sm text-on-surface-variant" style={{ fontWeight: 600 }}>
                    Saved: {dateStr}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a 
                      href={doc.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="primary-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '8px',
                        boxShadow: 'none'
                      }}
                    >
                      <ExternalLink size={13} /> Link
                    </a>

                    <button
                      onClick={() => {
                        setSelectedDoc(doc);
                        setTitle(doc.title);
                        setLink(doc.link);
                        setNotes(doc.notes || '');
                        setIsEditOpen(true);
                      }}
                      style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid var(--c-outline-variant)',
                        borderRadius: '8px',
                        color: 'var(--c-on-surface-variant)',
                        cursor: 'pointer',
                        display: 'flex',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--c-surface-container-high)';
                        e.currentTarget.style.color = 'var(--c-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--c-on-surface-variant)';
                      }}
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{
                        padding: '6px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
          <button 
            disabled={activePage <= 1}
            onClick={() => setCurrentPage(activePage - 1)}
            className="primary-btn" 
            style={{ padding: '8px 16px', backgroundColor: activePage <= 1 ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage <= 1 ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage <= 1 ? 0.5 : 1, cursor: activePage <= 1 ? 'not-allowed' : 'pointer', boxShadow: 'none' }}
          >
            Previous
          </button>
          
          <span className="text-body-md text-on-surface-variant" style={{ fontWeight: 600 }}>
            Page {activePage} of {totalPages}
          </span>

          <button 
            disabled={activePage >= totalPages}
            onClick={() => setCurrentPage(activePage + 1)}
            className="primary-btn" 
            style={{ padding: '8px 16px', backgroundColor: activePage >= totalPages ? 'var(--c-surface-container-lowest)' : 'var(--c-surface-container-high)', color: activePage >= totalPages ? 'var(--c-on-surface-variant)' : 'var(--c-on-surface)', opacity: activePage >= totalPages ? 0.5 : 1, cursor: activePage >= totalPages ? 'not-allowed' : 'pointer', boxShadow: 'none' }}
          >
            Next
          </button>
        </div>
      )}

      {/* Add Modal */}
      {isFormOpen && mounted && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}>
            <button 
              onClick={() => setIsFormOpen(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Add New Document</h3>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Financial Report 2026, Gym Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Link / URL</label>
                <input 
                  type="url" 
                  placeholder="https://drive.google.com/... or any website link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Context</label>
                <textarea 
                  placeholder="What is this document for? (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '100px', borderRadius: '10px', resize: 'vertical', fontSize: '14px', lineHeight: 1.6 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-btn"
                  style={{ padding: '10px 24px', borderRadius: '8px' }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Modal */}
      {isEditOpen && mounted && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(6px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', position: 'relative', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--c-outline-variant)' }}>
            <button 
              onClick={() => setIsEditOpen(false)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}
            >
              <X size={20} />
            </button>

            <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Edit Document</h3>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Link / URL</label>
                <input 
                  type="url" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 700, fontSize: '11px', color: 'var(--c-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes / Context</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '100px', borderRadius: '10px', resize: 'vertical', fontSize: '14px', lineHeight: 1.6 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditOpen(false)} 
                  style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="primary-btn"
                  style={{ padding: '10px 24px', borderRadius: '8px' }}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
