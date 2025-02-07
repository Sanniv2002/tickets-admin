import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAttendees, markEntry } from '../services/api';
import { Ticket } from '../types/ticket';
import { ChevronLeft, ChevronRight, Loader2, User, DoorOpen } from 'lucide-react';

const Attendees = () => {
  const [attendees, setAttendees] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchAttendees();
  }, [page]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const data = await getAttendees(page);
      setAttendees(data.tickets);
      setTotalAttendees(data.total);
      setLimit(data.limit);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      toast.error('Failed to fetch attendees');
    } finally {
      setLoading(false);
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
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Attendees</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900 rounded-lg p-6 animate-pulse">
              <div className="h-6 w-48 bg-zinc-800 rounded mb-2"></div>
              <div className="h-4 w-32 bg-zinc-800 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                <div className="h-4 w-36 bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {attendees.map((attendee) => (
              <div
                key={attendee._id}
                className="bg-zinc-900 rounded-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600/20 p-3 rounded-lg">
                      <User className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{attendee.name}</h3>
                      <p className="text-gray-400">Ticket Number: {attendee.ticket_number}</p>
                    </div>
                  </div>
                  <div>
                    {attendee.entry_marked ? (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm flex items-center">
                        <DoorOpen className="w-4 h-4 mr-1" />
                        Entry Marked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkEntry(attendee._id!)}
                        disabled={loadingStates[attendee._id!]}
                        className="flex items-center px-4 py-2 bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
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

          <div className="mt-8 flex flex-col items-center space-y-4">
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
            <div className="text-sm text-gray-400">
              Total Attendees: {totalAttendees} | Showing {limit} per page
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendees;