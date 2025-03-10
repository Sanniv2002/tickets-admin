import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getNotes, createNote, updateNote, deleteNote } from '../services/api';
import { Note } from '../types/ticket';
import {
  Plus, Loader2, Pin, Archive, Star, ChevronDown,
  ChevronRight, Trash2, Edit, X, PinOff, ArchiveRestore,
  StarOff, Search, XCircle
} from 'lucide-react';

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    parentId: '',
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newNote = await createNote({
        title: noteForm.title,
        description: noteForm.description,
        parentId: noteForm.parentId || undefined,
      });
      toast.success('Note created successfully');
      setShowNoteModal(false);
      setNoteForm({ title: '', description: '', parentId: '' });
      await fetchNotes();
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      await updateNote(id, updates);
      toast.success('Note updated successfully');
      await fetchNotes();
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(id);
      toast.success('Note deleted successfully');
      await fetchNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filterNotes = (notes: Note[], searchTerm: string): Note[] => {
    return notes.filter(note => {
      const matchesSearch = 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase());

      const childrenMatch = note.children ? 
        filterNotes(note.children, searchTerm).length > 0 : false;

      return matchesSearch || childrenMatch;
    }).map(note => ({
      ...note,
      children: note.children ? filterNotes(note.children, searchTerm) : undefined
    }));
  };

  const renderNote = (note: Note, level = 0) => {
    const isExpanded = expandedNotes.has(note._id);

    return (
      <div key={note._id} className="mb-4" style={{ marginLeft: `${level * 24}px` }}>
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {note.children && note.children.length > 0 && (
                  <button
                    onClick={() => toggleExpand(note._id)}
                    className="p-1 hover:bg-zinc-800 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                <h3 className="text-lg font-semibold text-white">{note.title}</h3>
              </div>
              <p className="text-gray-400 mt-2 whitespace-pre-wrap">{note.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateNote(note._id, { isPinned: !note.isPinned })}
                className={`p-2 rounded-lg transition-colors ${
                  note.isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-zinc-800'
                }`}
              >
                {note.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleUpdateNote(note._id, { isArchived: !note.isArchived })}
                className={`p-2 rounded-lg transition-colors ${
                  note.isArchived ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-zinc-800'
                }`}
              >
                {note.isArchived ? (
                  <ArchiveRestore className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleUpdateNote(note._id, { isImportant: !note.isImportant })}
                className={`p-2 rounded-lg transition-colors ${
                  note.isImportant ? 'bg-red-500/20 text-red-400' : 'hover:bg-zinc-800'
                }`}
              >
                {note.isImportant ? (
                  <StarOff className="w-4 h-4" />
                ) : (
                  <Star className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedNote(note);
                  setNoteForm({
                    title: note.title,
                    description: note.description,
                    parentId: note.parentId || '',
                  });
                  setShowNoteModal(true);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteNote(note._id)}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {note.isPinned && (
              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                Pinned
              </span>
            )}
            {note.isArchived && (
              <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">
                Archived
              </span>
            )}
            {note.isImportant && (
              <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                Important
              </span>
            )}
          </div>
        </div>
        {isExpanded && note.children && note.children.length > 0 && (
          <div className="mt-4">
            {note.children.map(childNote => renderNote(childNote, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredNotes = searchTerm ? filterNotes(notes, searchTerm) : notes;
  const rootNotes = filteredNotes.filter(note => !note.parentId);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Notes</h1>
        <button
          onClick={() => {
            setSelectedNote(null);
            setNoteForm({ title: '', description: '', parentId: '' });
            setShowNoteModal(true);
          }}
          className="flex items-center px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Note
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : rootNotes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No notes found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rootNotes.map(note => renderNote(note))}
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {selectedNote ? 'Edit Note' : 'Add New Note'}
              </h2>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={noteForm.description}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-500 min-h-[200px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Parent Note (Optional)
                </label>
                <select
                  value={noteForm.parentId}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, parentId: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">No parent</option>
                  {notes.map(note => (
                    <option key={note._id} value={note._id}>
                      {note.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 text-white"
                >
                  {selectedNote ? 'Update Note' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;