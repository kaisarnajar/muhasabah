'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Edit, Trash2, Heart, Search } from 'lucide-react';
import { addDua, updateDua, deleteDua } from '@/actions/dua';
import { useToast } from '@/context/ToastContext';
import { Dua, DuaCategory } from '@prisma/client';

const CATEGORY_DETAILS: Record<DuaCategory, { label: string; bg: string; color: string }> = {
  PERSONAL: { label: 'Personal', bg: 'rgba(195, 150, 38, 0.12)', color: 'var(--c-primary)' },
  FAMILY: { label: 'Family', bg: 'rgba(54, 162, 235, 0.12)', color: '#1a73e8' },
  CAREER: { label: 'Career', bg: 'rgba(75, 192, 192, 0.12)', color: '#0f9d58' },
  GENERAL: { label: 'General', bg: 'rgba(153, 102, 255, 0.12)', color: '#8e24aa' },
};

// Helper function to check if text contains Arabic characters
const isArabicText = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

export default function DuaDashboard({ initialDuas }: { initialDuas: Dua[] }) {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [translation, setTranslation] = useState('');
  const [category, setCategory] = useState<DuaCategory>('PERSONAL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const openAddModal = () => {
    setTitle('');
    setContent('');
    setTranslation('');
    setCategory('PERSONAL');
    setIsFormOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await addDua(title, content, translation, category);
      setIsFormOpen(false);
      setCurrentPage(1);
      showToast('Dua added successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to add Dua', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDua || !title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await updateDua(selectedDua.id, title, content, translation, category);
      setIsEditOpen(false);
      setSelectedDua(null);
      showToast('Dua updated successfully!', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update Dua', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (duaId: number) => {
    if (!confirm('Are you sure you want to delete this Dua?')) return;
    try {
      await deleteDua(duaId);
      setSelectedDua(null);
      showToast('Dua deleted successfully.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete Dua', 'error');
    }
  };

  // Filter Duas
  const filteredDuas = initialDuas.filter(dua => {
    const matchesSearch = dua.title.toLowerCase().includes(search.toLowerCase()) || 
                          dua.content.toLowerCase().includes(search.toLowerCase()) ||
                          (dua.translation && dua.translation.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || dua.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filteredDuas.length / PAGE_SIZE) || 1;
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const paginatedDuas = filteredDuas.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  return (
    <div>
      {/* Search and Action Toolbar */}
      <div className="flex-row justify-between mb-24 gap-16" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-on-surface-variant)' }} />
          <input 
            type="text" 
            placeholder="Search Duas by title, content or translation..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="search-input"
            style={{ width: '100%', paddingLeft: '40px', borderRadius: '8px' }}
          />
        </div>

        <button onClick={openAddModal} className="primary-btn" style={{ padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Add Dua
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {(['ALL', 'PERSONAL', 'FAMILY', 'CAREER', 'GENERAL'] as const).map(cat => {
          const isSelected = selectedCategory === cat;
          const label = cat === 'ALL' ? 'All Duas' : CATEGORY_DETAILS[cat].label;
          return (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 600,
                fontSize: '13px',
                backgroundColor: isSelected ? 'var(--c-primary)' : 'var(--c-surface-container-high)',
                color: isSelected ? 'var(--c-on-primary)' : 'var(--c-on-surface-variant)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid of Duas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
        {paginatedDuas.length === 0 ? (
          <p className="text-on-surface-variant text-body-md" style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>No Duas found. Click &quot;Add Dua&quot; to begin building your list.</p>
        ) : (
          paginatedDuas.map(dua => {
            const catInfo = CATEGORY_DETAILS[dua.category];
            const isContentArabic = isArabicText(dua.content);

            return (
              <div 
                key={dua.id} 
                className="card"
                onClick={() => setSelectedDua(dua)}
                style={{ 
                  padding: '18px', 
                  cursor: 'pointer',
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--c-outline-variant)',
                  justifyContent: 'space-between',
                  minHeight: '160px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        backgroundColor: catInfo.bg, 
                        color: catInfo.color, 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      {catInfo.label}
                    </span>
                  </div>
                  
                  <h3 
                    className="text-title-md" 
                    style={{ 
                      margin: 0, 
                      fontWeight: 700, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 1, 
                      WebkitBoxOrient: 'vertical',
                      color: 'var(--c-on-surface)' 
                    }}
                  >
                    {dua.title}
                  </h3>

                  <p 
                    className="text-body-md"
                    style={{ 
                      whiteSpace: 'pre-wrap', 
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.5,
                      direction: isContentArabic ? 'rtl' : 'ltr',
                      textAlign: isContentArabic ? 'right' : 'left',
                      fontFamily: isContentArabic ? '"Scheherazade New", Amiri, serif' : 'inherit',
                      fontSize: isContentArabic ? '18px' : '13px',
                      color: 'var(--c-on-surface-variant)'
                    }}
                  >
                    {dua.content}
                  </p>
                </div>

                {dua.translation && (
                  <p 
                    className="text-label-sm"
                    style={{ 
                      margin: 0, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      fontStyle: 'italic',
                      color: 'var(--c-on-surface-variant)',
                      opacity: 0.8
                    }}
                  >
                    {dua.translation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
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

      {/* ADD DUA MODAL */}
      {isFormOpen && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsFormOpen(false)}
        >
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Add Supplication / Dua</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Title / Subject</label>
                <input 
                  type="text" 
                  placeholder="e.g., Dua for Rizq, Dua for parents"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '8px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DuaCategory)}
                    className="search-input"
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="FAMILY">Family</option>
                    <option value="CAREER">Career</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Dua Content (Arabic / Local language)</label>
                <textarea 
                  placeholder="Paste or write your Dua here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '100px', borderRadius: '8px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Translation / Meaning / Notes (Optional)</label>
                <textarea 
                  placeholder="Write the translation or notes..."
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '70px', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px' }}>{loading ? 'Saving...' : 'Save Dua'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DUA DETAILS MODAL */}
      {selectedDua && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelectedDua(null)}
        >
          <div className="card" style={{ width: '100%', maxWidth: '550px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span 
                  style={{ 
                    alignSelf: 'flex-start',
                    fontSize: '10px', 
                    fontWeight: 700, 
                    backgroundColor: CATEGORY_DETAILS[selectedDua.category].bg, 
                    color: CATEGORY_DETAILS[selectedDua.category].color, 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {CATEGORY_DETAILS[selectedDua.category].label}
                </span>
                <h3 className="text-headline-sm" style={{ margin: '4px 0 0 0', fontWeight: 700 }}>{selectedDua.title}</h3>
              </div>
              <button onClick={() => setSelectedDua(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            </div>

            {/* Supplication text container */}
            <div 
              style={{ 
                padding: '20px', 
                borderRadius: '12px', 
                backgroundColor: 'var(--c-surface-container-low)', 
                border: '1px solid var(--c-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <p 
                style={{ 
                  margin: 0, 
                  lineHeight: 1.8, 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  direction: isArabicText(selectedDua.content) ? 'rtl' : 'ltr',
                  textAlign: isArabicText(selectedDua.content) ? 'right' : 'left',
                  fontFamily: isArabicText(selectedDua.content) ? '"Scheherazade New", Amiri, serif' : 'inherit',
                  fontSize: isArabicText(selectedDua.content) ? '26px' : '15px',
                  color: 'var(--c-on-surface)'
                }}
              >
                {selectedDua.content}
              </p>
            </div>

            {/* Translation / Notes container */}
            {selectedDua.translation && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--c-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Translation / Meaning</span>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--c-on-surface-variant)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontStyle: 'italic' }}>
                  {selectedDua.translation}
                </p>
              </div>
            )}

            {/* Actions buttons */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '20px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setTitle(selectedDua.title);
                  setContent(selectedDua.content);
                  setTranslation(selectedDua.translation || '');
                  setCategory(selectedDua.category);
                  setIsEditOpen(true);
                }}
                className="primary-btn"
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', backgroundColor: 'var(--c-surface-container-high)', color: 'var(--c-on-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, boxShadow: 'none' }}
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => handleDelete(selectedDua.id)}
                className="primary-btn"
                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', border: '1px solid rgba(220, 53, 69, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, boxShadow: 'none' }}
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT DUA MODAL */}
      {isEditOpen && selectedDua && mounted && createPortal(
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1010, padding: '16px', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsEditOpen(false)}
        >
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-headline-sm" style={{ margin: 0, fontWeight: 700 }}>Edit Dua</h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-on-surface-variant)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Title / Subject</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', borderRadius: '8px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="text-label-md" style={{ fontWeight: 600 }}>Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DuaCategory)}
                    className="search-input"
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                  >
                    <option value="PERSONAL">Personal</option>
                    <option value="FAMILY">Family</option>
                    <option value="CAREER">Career</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Dua Content (Arabic / Local language)</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '100px', borderRadius: '8px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="text-label-md" style={{ fontWeight: 600 }}>Translation / Meaning / Notes (Optional)</label>
                <textarea 
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="search-input"
                  style={{ width: '100%', minHeight: '70px', borderRadius: '8px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--c-outline-variant)', paddingTop: '16px', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsEditOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--c-on-surface-variant)', border: '1px solid var(--c-outline-variant)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
