import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getNotes, createNote, updateNote, deleteNote } from '../services/api';
import { Note, NoteItem } from '../types/ticket';
import {
  Plus, Loader2, Archive, ChevronDown,
  ChevronRight, Trash2, Edit, X, ArchiveRestore,
  Clock, User, Tag, PlusCircle
} from 'lucide-react';
import { format } from 'date-fns';

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [noteForm, setNoteForm] = useState({
    heading: '',
    items: [] as NoteItem[],
    tags: [] as string[],
  });
  const [newItem, setNewItem] = useState('');
  const [newTag, setNewTag] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);

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
        heading: noteForm.heading,
        items: noteForm.items,
      });
      toast.success('Note created successfully');
      setShowNoteModal(false);
      setNoteForm({ heading: '', items: [], tags: [] });
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

  const addItem = () => {
    if (newItem.trim()) {
      setNoteForm(prev => ({
        ...prev,
        items: [...prev.items, { description: newItem.trim(), toggle: false, tags: [] }]
      }));
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    setNoteForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const addTagToItem = (itemIndex: number, tag: string) => {
    if (tag.trim() && !noteForm.items[itemIndex].tags.includes(tag.trim())) {
      setNoteForm(prev => ({
        ...prev,
        items: prev.items.map((item, i) => 
          i === itemIndex 
            ? { ...item, tags: [...item.tags, tag.trim()] }
            : item
        )
      }));
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const removeTagFromItem = (itemIndex: number, tagToRemove: string) => {
    setNoteForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === itemIndex 
          ? { ...item, tags: item.tags.filter(tag => tag !== tagToRemove) }
          : item
      )
    }));
  };

  const renderNote = (note: Note) => {
    const isExpanded = expandedNotes.has(note._id!);

    return (
      <div key={note._id} className="mb-4">
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {note.items.length > 0 && (
                  <button
                    onClick={() => toggleExpand(note._id!)}
                    className="p-1 hover:bg-zinc-800 rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
                <h3 className="text-lg font-semibold text-white">{note.heading}</h3>
              </div>
              
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                <User className="w-4 h-4" />
                <span>{note.author}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>{format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}</span>
              </div>

              {isExpanded && note.items.length > 0 && (
                <div className="mt-4 space-y-4">
                  {note.items.map((item, index) => (
                    <div key={index} className="bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.toggle}
                          onChange={() => {
                            const updatedItems = [...note.items];
                            updatedItems[index].toggle = !item.toggle;
                            handleUpdateNote(note._id!, { items: updatedItems });
                          }}
                          className="rounded border-gray-600 text-red-600 focus:ring-red-500"
                        />
                        <span className={`text-gray-300 ${item.toggle ? 'line-through' : ''}`}>
                          {item.description}
                        </span>
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 ml-6">
                          {item.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 text-xs bg-zinc-700 text-gray-300 rounded-full flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateNote(note._id!, { isArchived: !note.isArchived })}
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
                onClick={() => {
                  setSelectedNote(note);
                  setNoteForm({
                    heading: note.heading,
                    items: note.items,
                    tags: note.tags,
                  });
                  setShowNoteModal(true);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteNote(note._id!)}
                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Notes</h1>
        <button
          onClick={() => {
            setSelectedNote(null);
            setNoteForm({ heading: '', items: [], tags: [] });
            setShowNoteModal(true);
          }}
          className="flex items-center px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Note
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No notes found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map(note => renderNote(note))}
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
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <form onSubmit={handleCreateNote} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Heading
                </label>
                <input
                  type="text"
                  value={noteForm.heading}
                  onChange={(e) => setNoteForm(prev => ({ ...prev, heading: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Items
                </label>
                <div className="space-y-4">
                  {noteForm.items.map((item, index) => (
                    <div key={index} className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-gray-300">{item.description}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 ml-6">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {item.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 text-xs bg-zinc-700 text-gray-300 rounded-full flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3" />
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTagFromItem(index, tag)}
                                className="ml-1 hover:text-red-400"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>

                        {selectedItemIndex === index && showTagInput ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTagToItem(index, newTag))}
                              placeholder="Add tag"
                              className="flex-1 px-3 py-1 text-sm bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:border-red-500"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => addTagToItem(index, newTag)}
                              className="px-3 py-1 bg-zinc-700 rounded-md hover:bg-zinc-600 text-sm"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemIndex(null);
                                setShowTagInput(false);
                                setNewTag('');
                              }}
                              className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItemIndex(index);
                              setShowTagInput(true);
                            }}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                          >
                            <PlusCircle className="w-4 h-4" />
                            Add tag
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                      placeholder="Add new item"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
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