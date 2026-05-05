'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Briefcase } from 'lucide-react';

export interface WorkHistoryItem {
  id?: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
}

interface WorkHistoryManagerProps {
  items: WorkHistoryItem[];
  onUpdate: (items: WorkHistoryItem[]) => void;
}

export default function WorkHistoryManager({ items, onUpdate }: WorkHistoryManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentItem, setCurrentItem] = useState<WorkHistoryItem>({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: ''
  });

  const handleOpenModal = (index?: number) => {
    if (index !== undefined) {
      setEditingIndex(index);
      setCurrentItem({ ...items[index] });
    } else {
      setEditingIndex(null);
      setCurrentItem({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentItem.title || !currentItem.company || !currentItem.startDate) return;

    const newItems = [...items];
    if (editingIndex !== null) {
      newItems[editingIndex] = currentItem;
    } else {
      newItems.push(currentItem);
    }
    onUpdate(newItems);
    setIsModalOpen(false);
  };

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-light-surface dark:text-dark-surface">Work History</h3>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-red-400 bg-blue-50 dark:bg-red-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <Plus size={16} />
          Add Role
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 bg-light-surface dark:bg-dark-surface/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Briefcase className="mx-auto h-10 w-10 text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No work history added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-start justify-between p-4 bg-light-surface dark:bg-dark-surface/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <h4 className="font-semibold text-light-surface dark:text-dark-surface">{item.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.company}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(item.startDate).getFullYear()} - {item.isCurrent ? 'Present' : (item.endDate ? new Date(item.endDate).getFullYear() : '')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenModal(index)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-red-400 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-light-surface dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-light-surface dark:text-dark-surface">
                {editingIndex !== null ? 'Edit Role' : 'Add Role'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title *</label>
                <input
                  type="text"
                  value={currentItem.title}
                  onChange={e => setCurrentItem({...currentItem, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-surface dark:bg-dark-surface text-light-surface dark:text-dark-surface"
                  placeholder="e.g. Lead Vocalist"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company/Production *</label>
                <input
                  type="text"
                  value={currentItem.company}
                  onChange={e => setCurrentItem({...currentItem, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-surface dark:bg-dark-surface text-light-surface dark:text-dark-surface"
                  placeholder="e.g. Blue Note Jazz Club"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={currentItem.startDate ? new Date(currentItem.startDate).toISOString().split('T')[0] : ''}
                    onChange={e => setCurrentItem({...currentItem, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-surface dark:bg-dark-surface text-light-surface dark:text-dark-surface"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    disabled={currentItem.isCurrent}
                    value={currentItem.endDate ? new Date(currentItem.endDate).toISOString().split('T')[0] : ''}
                    onChange={e => setCurrentItem({...currentItem, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-surface dark:bg-dark-surface text-light-surface dark:text-dark-surface disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={currentItem.isCurrent}
                  onChange={e => setCurrentItem({...currentItem, isCurrent: e.target.checked, endDate: e.target.checked ? null : currentItem.endDate})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isCurrent" className="text-sm text-light-surface dark:text-dark-surface">I currently work here</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={currentItem.description || ''}
                  onChange={e => setCurrentItem({...currentItem, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-surface dark:bg-dark-surface text-light-surface dark:text-dark-surface"
                  placeholder="Describe your role and achievements..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-light-surface dark:text-dark-surface hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!currentItem.title || !currentItem.company || !currentItem.startDate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
