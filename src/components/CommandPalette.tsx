import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  Ticket,
  Users,
  LayoutDashboard,
  Archive,
  Bell,
  UserPlus,
  Search,
  Command as CommandIcon,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSearch('');
  }, [isOpen]);

  const commands = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      shortcut: ['G', 'D'],
    },
    {
      name: 'Tickets',
      icon: Ticket,
      path: '/tickets',
      shortcut: ['G', 'T'],
    },
    {
      name: 'Archived Tickets',
      icon: Archive,
      path: '/archived-tickets',
      shortcut: ['G', 'A'],
    },
    {
      name: 'Attendees',
      icon: Users,
      path: '/attendees',
      shortcut: ['G', 'P'],
    },
    {
      name: 'Notifications',
      icon: Bell,
      path: '/notifications',
      shortcut: ['G', 'M'],
    },
    {
      name: 'Admin Management',
      icon: UserPlus,
      path: '/admin-management',
      shortcut: ['G', 'S'],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <Command
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 overflow-hidden"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        <div className="flex items-center border-b border-zinc-800 px-3">
          <Search className="w-4 h-4 text-zinc-400 mr-2" />
          <Command.Input
            autoFocus
            placeholder="Search commands..."
            className="flex-1 h-12 bg-transparent text-white placeholder-zinc-400 outline-none"
            value={search}
            onValueChange={setSearch}
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs text-zinc-400 bg-zinc-800 rounded">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800">
          <Command.Empty className="py-6 text-center text-sm text-zinc-400">
            No results found.
          </Command.Empty>

          {commands.map((command) => (
            <Command.Item
              key={command.path}
              value={command.name}
              onSelect={() => {
                navigate(command.path);
                onClose();
              }}
              className="flex items-center gap-2 px-3 py-3 text-white rounded-lg cursor-pointer hover:bg-zinc-800 aria-selected:bg-zinc-800"
            >
              <command.icon className="w-4 h-4 text-zinc-400" />
              <span className="flex-1">{command.name}</span>
              <kbd className="hidden sm:flex items-center gap-1">
                {command.shortcut.map((key, index) => (
                  <React.Fragment key={key}>
                    <span className="px-1.5 py-0.5 text-xs text-zinc-400 bg-zinc-800 rounded">
                      {key}
                    </span>
                    {index < command.shortcut.length - 1 && <span className="text-zinc-600">+</span>}
                  </React.Fragment>
                ))}
              </kbd>
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </div>
  );
};

export default CommandPalette;