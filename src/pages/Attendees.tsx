import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAttendees, markEntry, searchAttendees } from '../services/api';
import { Ticket } from '../types/ticket';
import { ChevronLeft, ChevronRight, Loader2, DoorOpen, Search, XCircle, Hash } from 'lucide-react';

const SkeletonTicket = () => (
  <div className="bg-zinc-900 rounded-lg p-4 sm:p-6 animate-pulse">
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
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-zinc-800 rounded"></div>
        <div className="h-8 w-32 bg-zinc-800 rounded"></div>
      </div>
    </div>
  </div>
);

const Attendees = () => {
  const [attendees, setAttendees] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchAttendees();
  }, [page, activeSearch]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSearch();
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      let data;
      
      if (activeSearch) {
        data = await searchAttendees(activeSearch);
        const sortedAttendees = [...data.tickets].sort((a, b) => (b.score || 0) - (a.score || 0));
        setAttendees(sortedAttendees);
      } else {
        data = await getAttendees(page);
        setAttendees(data.tickets);
      }
      
      setTotalAttendees(data.total);
      setLimit(data.limit);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      toast.error('Failed to fetch attendees');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setSearchParams({ page: '1' });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setActiveSearch(searchTerm);
      setSearchParams({ page: '1' });
    }
  };

  const handleMarkEntry = async (ticketId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [ticketId]: true }));
      await markEntry(ticketId);
      toast.success('Entry marked successfully');
      fetchAttendees();
    } catch (error) {
      toast.error('Failed to mark entry');
    } finally {
      setLoadingStates(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Attendees</h1>

      <div className="mb-6 sm:mb-8 space-y-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search attendees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full px-4 py-2 pl-10 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-red-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <XCircle className="h-5 w-5" />
            </button>
          )}
        </div>

        {activeSearch && (
          <div className="bg-zinc-900/50 p-3 sm:p-4 rounded-lg border border-zinc-800">
            <p className="text-sm sm:text-base text-gray-300">
              {totalAttendees === 0 ? (
                <span>No results found for "<span className="text-red-500">{activeSearch}</span>"</span>
              ) : (
                <span>
                  Found <span className="text-red-500 font-semibold">{totalAttendees}</span> {totalAttendees === 1 ? 'result' : 'results'} for "<span className="text-red-500">{activeSearch}</span>"
                  {totalAttendees > 1 && <span className="text-gray-400"> (sorted by relevance)</span>}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 sm:space-y-6">
          {[1, 2, 3].map((i) => (
            <SkeletonTicket key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4 sm:space-y-6">
            {attendees.map((attendee) => (
              <div
                key={attendee._id}
                className="bg-zinc-900 rounded-lg p-4 sm:p-6 border-l-4 border-green-500"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-white">{attendee.name}</h3>
                    <p className="text-gray-400 text-sm sm:text-base">{attendee.email}</p>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Roll Number</p>
                        <p className="text-sm sm:text-base text-white">{attendee.rollNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Contact</p>
                        <p className="text-sm sm:text-base text-white">{attendee.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Degree & Year</p>
                        <p className="text-sm sm:text-base text-white">{`${attendee.degree} - ${attendee.year}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Branch</p>
                        <p className="text-sm sm:text-base text-white">{attendee.branch}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 rounded text-sm bg-green-500/20 text-green-400">
                        Payment Verified
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-green-500/20 text-green-400">
                        Ticket Given
                      </span>
                      <span className="px-2 py-1 rounded text-sm bg-purple-500/20 text-purple-400 flex items-center">
                        <Hash className="w-3 h-3 mr-1" />
                        Ticket: {attendee.ticket_number}
                      </span>
                      {activeSearch && attendee.score && (
                        <span className="px-2 py-1 rounded text-sm bg-blue-500/20 text-blue-400">
                          Match Score: {(attendee.score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="sm:ml-4 flex sm:flex-col gap-2">
                    {attendee.entry_marked ? (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm flex items-center whitespace-nowrap">
                        <DoorOpen className="w-4 h-4 mr-1" />
                        Entry Marked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkEntry(attendee._id!)}
                        disabled={loadingStates[attendee._id!]}
                        className="flex items-center px-4 py-2 bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
                      >
                        {loadingStates[attendee._id!] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <DoorOpen className="w-4 h-4 mr-2" />
                        )}
                        Mark Entry
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!activeSearch && (
            <div className="mt-6 sm:mt-8 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSearchParams({ page: String(page - 1) })}
                  disabled={page === 1}
                  className="p-2 bg-zinc-800 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setSearchParams({ page: String(page + 1) })}
                  disabled={page >= totalPages}
                  className="p-2 bg-zinc-800 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                Total Attendees: {totalAttendees} | Showing {limit} per page
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Attendees;