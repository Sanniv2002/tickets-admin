import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getArchivedTickets, archiveTicket, whoami } from '../services/api';
import { Ticket, User } from '../types/ticket';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArchiveRestore,
  Archive,
  Hash,
  IndianRupee,
  DoorOpen
} from 'lucide-react';

const SkeletonTicket = () => (
  <div className="bg-zinc-900 rounded-lg p-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-6 w-48 bg-zinc-800 rounded mb-2"></div>
      <div className="h-4 w-32 bg-zinc-800 rounded mb-4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-24 bg-zinc-800 rounded"></div>
            <div className="h-4 w-32 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ArchivedTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<User | null>(null);
  const [pageInput, setPageInput] = useState('');

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchUser();
    fetchArchivedTickets();
  }, [page]);

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const fetchUser = async () => {
    const userData = await whoami();
    setUser(userData);
  };

  const fetchArchivedTickets = async () => {
    try {
      setLoading(true);
      const data = await getArchivedTickets(page);
      setTickets(data.tickets);
      setTotalTickets(data.total);
      setLimit(data.limit);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      toast.error('Failed to fetch archived tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchiveTicket = async (ticketId: string) => {
    if (!user?.isSuperAdmin) {
      toast.error('Only superadmins can unarchive tickets');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [ticketId]: true }));
      await archiveTicket(ticketId, false);
      toast.success('Ticket unarchived successfully');
      await fetchArchivedTickets();
    } catch (error) {
      toast.error('Failed to unarchive ticket');
    } finally {
      setLoadingStates(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newPage = parseInt(pageInput);
      if (newPage >= 1 && newPage <= totalPages) {
        setSearchParams({ page: newPage.toString() });
      } else {
        setPageInput(page.toString());
        toast.error(`Please enter a page number between 1 and ${totalPages}`);
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-white">Archived Tickets</h1>
        <div className="bg-purple-500/20 px-3 py-1 rounded-full flex items-center gap-2">
          <Archive className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm font-medium">
            {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'} archived
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <SkeletonTicket key={i} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
          <Archive className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Archived Tickets</h2>
          <p className="text-gray-400">There are no archived tickets to display.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="bg-zinc-900 rounded-lg p-6 border-l-4 border-purple-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">{ticket.name}</h3>
                  <p className="text-gray-400">{ticket.email}</p>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Roll Number</p>
                      <p className="text-white">{ticket.rollNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Contact</p>
                      <p className="text-white">{ticket.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Degree & Year</p>
                      <p className="text-white">{`${ticket.degree} - ${ticket.year}`}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Branch</p>
                      <p className="text-white">{ticket.branch}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {ticket.payment_verified && (
                      <span className="px-2 py-1 rounded text-sm bg-green-500/20 text-green-400">
                        Payment Verified
                      </span>
                    )}
                    {ticket.ticket_given && (
                      <span className="px-2 py-1 rounded text-sm bg-green-500/20 text-green-400">
                        Ticket Given
                      </span>
                    )}
                    {ticket.ticket_number && (
                      <span className="px-2 py-1 rounded text-sm bg-purple-500/20 text-purple-400 flex items-center">
                        <Hash className="w-3 h-3 mr-1" />
                        Ticket: {ticket.ticket_number}
                      </span>
                    )}
                    {ticket.price && (
                      <span className="px-2 py-1 rounded text-sm bg-blue-500/20 text-blue-400 flex items-center">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        Price: ₹{ticket.price}
                      </span>
                    )}
                    {ticket.entry_marked && (
                      <span className="px-2 py-1 rounded text-sm bg-orange-500/20 text-orange-400 flex items-center">
                        <DoorOpen className="w-3 h-3 mr-1" />
                        Entry Marked
                      </span>
                    )}
                  </div>
                </div>

                {user?.isSuperAdmin && (
                  <button
                    onClick={() => handleUnarchiveTicket(ticket._id!)}
                    disabled={loadingStates[ticket._id!]}
                    className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                    title="Unarchive Ticket"
                  >
                    {loadingStates[ticket._id!] ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <ArchiveRestore className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="mt-8 flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchParams({ page: String(page - 1) })}
                disabled={page === 1}
                className="p-2 bg-zinc-800 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Page</span>
                <input
                  type="text"
                  value={pageInput}
                  onChange={handlePageInputChange}
                  onKeyDown={handlePageInputKeyDown}
                  className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-center text-white focus:outline-none focus:border-red-500"
                  placeholder="Page"
                />
                <span className="text-gray-400">of {totalPages}</span>
              </div>
              <button
                onClick={() => setSearchParams({ page: String(page + 1) })}
                disabled={page >= totalPages}
                className="p-2 bg-zinc-800 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              Total Archived Tickets: {totalTickets} | Showing {limit} per page
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchivedTickets;