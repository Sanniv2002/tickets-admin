import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getTickets, verifyPayment, markTicketGiven, searchTickets, uploadPaymentProof, markEntry, whoami, archiveTicket } from '../services/api';
import { Ticket, PaginatedResponse, User } from '../types/ticket';
import {
  X, TicketIcon, CreditCard,
  Search, ChevronLeft, ChevronRight,
  Loader2, Eye, XCircle, Filter, ChevronDown, Hash, Upload, DoorOpen, IndianRupee,
  Archive, ArchiveRestore
} from 'lucide-react';

type FilterType = 'all' | 'paid' | 'not_paid';

const SkeletonTicket = () => (
  <div className="bg-zinc-900 rounded-lg p-6 border-l-4 border-yellow-500 animate-pulse">
    <div className="space-y-4">
      <div className="h-6 w-48 bg-zinc-800 rounded"></div>
      <div className="h-4 w-32 bg-zinc-800 rounded"></div>
      <div className="grid grid-cols-2 gap-4">
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

const TicketList = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [limit, setLimit] = useState(10);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [ticketNumberInput, setTicketNumberInput] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<User | null>(null);
  const [pageInput, setPageInput] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchUser();
    fetchTickets();
  }, [page, activeSearch, activeFilter]);

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const fetchUser = async () => {
    const userData = await whoami();
    setUser(userData);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSearch();
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const getFilterParams = () => {
    switch (activeFilter) {
      case 'paid':
        return { filter: 'stage:2' };
      case 'not_paid':
        return { filter: 'stage:1' };
      default:
        return {};
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let data: PaginatedResponse;
      const filterParams = getFilterParams();

      if (activeSearch) {
        data = await searchTickets(activeSearch, filterParams);
        const sortedTickets = [...data.tickets].sort((a, b) => (b.score || 0) - (a.score || 0));
        setTickets(sortedTickets);
      } else {
        data = await getTickets(page, filterParams);
        setTickets(data.tickets);
      }

      setTotalTickets(data.total);
      setLimit(data.limit);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      toast.error('Failed to fetch tickets');
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

  const setLoadingState = (id: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: state }));
  };

  const handleVerifyPayment = async (ticketId: string) => {
    try {
      setLoadingState(ticketId, true);
      await verifyPayment(ticketId);
      toast.success('Payment verified');
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, payment_verified: true, ticket_number: ticketNumberInput } : ticket
        )
      );
    } catch (error) {
      toast.error('Failed to verify payment');
    } finally {
      setLoadingState(ticketId, false);
    }
  };

  const handleMarkTicketGiven = async (ticketId: string) => {
    if (!ticketNumberInput) {
      toast.error('Please enter a ticket number');
      return;
    }

    try {
      setLoadingState(ticketId, true);
      await markTicketGiven(ticketId, ticketNumberInput);
      toast.success('Ticket marked as given');
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, ticket_given: true, ticket_number: ticketNumberInput } : ticket
        )
      );
      setTicketNumberInput('');
      setSelectedTicketId(null);
    } catch (error) {
      toast.error('Failed to mark ticket');
    } finally {
      setLoadingState(ticketId, false);
    }
  };

  const handleMarkEntry = async (ticketId: string) => {
    try {
      setLoadingState(ticketId, true);
      await markEntry(ticketId);
      toast.success('Entry marked successfully');
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, entry_marked: true } : ticket
        )
      );
    } catch (error) {
      toast.error('Failed to mark entry');
    } finally {
      setLoadingState(ticketId, false);
    }
  };

  const handleArchiveTicket = async (ticketId: string, archive: boolean) => {
    if (!user?.isSuperAdmin) {
      toast.error('Only superadmins can archive tickets');
      return;
    }

    try {
      setLoadingState(`archive-${ticketId}`, true);
      await archiveTicket(ticketId, archive);
      toast.success(archive ? 'Ticket archived successfully' : 'Ticket unarchived successfully');
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket._id === ticketId ? { ...ticket, is_archived: archive } : ticket
        )
      );
    } catch (error) {
      toast.error(archive ? 'Failed to archive ticket' : 'Failed to unarchive ticket');
    } finally {
      setLoadingState(`archive-${ticketId}`, false);
    }
  };

  const getFilterLabel = (filter: FilterType) => {
    switch (filter) {
      case 'paid':
        return 'Paid Tickets';
      case 'not_paid':
        return 'Unpaid Tickets';
      default:
        return 'All Tickets';
    }
  };

  const getPaymentStatusBadge = (ticket: Ticket) => {
    if (!ticket.payment_verified && ticket.stage === '1') {
      return (
        <span className="px-2 py-1 rounded text-sm bg-red-500/20 text-red-400">
          Payment Pending
        </span>
      );
    } else if (!ticket.payment_verified && ticket.stage === '2') {
      return (
        <span className="px-2 py-1 rounded text-sm bg-yellow-500/20 text-yellow-400">
          Payment Verification Pending
        </span>
      );
    } else if (ticket.payment_verified) {
      return (
        <span className="px-2 py-1 rounded text-sm bg-green-500/20 text-green-400">
          Payment Verified
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Ticket Management</h1>
          <div className="flex gap-4">
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name, email, or roll number... (Press Enter to search, Esc to clear)"
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
            <div className="relative filter-dropdown">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 min-w-[160px] justify-between"
              >
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  <span>{getFilterLabel(activeFilter)}</span>
                </div>
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {(['all', 'paid', 'not_paid'] as FilterType[]).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setActiveFilter(filter);
                          setIsFilterOpen(false);
                          setSearchParams({ page: '1' });
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-700 ${activeFilter === filter ? 'bg-zinc-700' : ''
                          }`}
                      >
                        {getFilterLabel(filter)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {activeSearch && (
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800">
              <p className="text-gray-300">
                {totalTickets === 0 ? (
                  <span>No results found for "<span className="text-red-500">{activeSearch}</span>"</span>
                ) : (
                  <span>
                    Found <span className="text-red-500 font-semibold">{totalTickets}</span> {totalTickets === 1 ? 'result' : 'results'} for "<span className="text-red-500">{activeSearch}</span>"
                    {totalTickets > 1 && <span className="text-gray-400"> (sorted by relevance)</span>}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonTicket key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {tickets?.map((ticket) => (
              <div
                key={ticket._id}
                className={`bg-zinc-900 rounded-lg p-6 ${ticket.stage === '2' ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{ticket.name}</h3>
                    <p className="text-gray-400">{ticket.email}</p>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Roll Number</p>
                        <p>{ticket.rollNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Contact</p>
                        <p>{ticket.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Degree & Year</p>
                        <p>{`${ticket.degree} - ${ticket.year}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Branch</p>
                        <p>{ticket.branch}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4 flex-wrap gap-y-2">
                      {getPaymentStatusBadge(ticket)}
                      <span className={`px-2 py-1 rounded text-sm ${ticket.ticket_given ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {ticket.ticket_given ? 'Ticket Given' : 'Ticket Pending'}
                      </span>
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
                      {activeSearch && ticket.score && (
                        <span className="px-2 py-1 rounded text-sm bg-blue-500/20 text-blue-400">
                          Match Score: {(ticket.score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {user?.isSuperAdmin && (
                    <button
                      onClick={() => handleArchiveTicket(ticket._id!, !ticket.is_archived)}
                      disabled={loadingStates[`archive-${ticket._id}`]}
                      className={`p-2 rounded-lg transition-colors ${
                        ticket.is_archived 
                          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                          : 'bg-zinc-800 hover:bg-zinc-700'
                      }`}
                      title={ticket.is_archived ? 'Unarchive Ticket' : 'Archive Ticket'}
                    >
                      {loadingStates[`archive-${ticket._id}`] ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : ticket.is_archived ? (
                        <ArchiveRestore className="w-5 h-5" />
                      ) : (
                        <Archive className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>

                {ticket.is_archived && (
                  <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                    <p className="text-sm text-purple-400 flex items-center gap-2">
                      <Archive className="w-4 h-4" />
                      This ticket has been archived
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-4">
                  {!ticket.payment_proof && ticket.stage === '1' && (
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-upload-${ticket._id}`}
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              setLoadingStates(prev => ({ ...prev, [`upload-${ticket._id}`]: true }));
                              const { id, payment_proof } = await uploadPaymentProof(ticket._id!, file);
                              toast.success('Payment proof uploaded successfully');
                              setTickets((prevTickets) =>
                                prevTickets.map((ticket) =>
                                  ticket._id === id ? { ...ticket, payment_proof, stage: "2" } : ticket
                                )
                              );
                            } catch (error) {
                              toast.error('Failed to upload payment proof');
                            } finally {
                              setLoadingStates(prev => ({ ...prev, [`upload-${ticket._id}`]: false }));
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => document.getElementById(`file-upload-${ticket._id}`)?.click()}
                        disabled={loadingStates[`upload-${ticket._id}`]}
                        className="flex items-center px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loadingStates[`upload-${ticket._id}`] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload Payment Proof
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleVerifyPayment(ticket._id!)}
                    disabled={ticket.payment_verified || loadingStates[ticket._id!]}
                    className="flex items-center px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {loadingStates[ticket._id!] ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Verify Payment
                  </button>

                  {selectedTicketId === ticket._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter ticket number"
                        value={ticketNumberInput}
                        onChange={(e) => setTicketNumberInput(e.target.value)}
                        className="px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleMarkTicketGiven(ticket._id!)}
                        disabled={loadingStates[ticket._id!]}
                        className="flex items-center px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loadingStates[ticket._id!] ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <TicketIcon className="w-4 h-4 mr-2" />
                        )}
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTicketId(null);
                          setTicketNumberInput('');
                        }}
                        className="p-2 bg-zinc-700 rounded-md hover:bg-zinc-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedTicketId(ticket._id!)}
                      disabled={ticket.ticket_given}
                      className="flex items-center px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      <TicketIcon className="w-4 h-4 mr-2" />
                      Mark Ticket Given
                    </button>
                  )}

                  {ticket.payment_verified && ticket.ticket_given && !ticket.entry_marked && (
                    <button
                      onClick={() => handleMarkEntry(ticket._id!)}
                      disabled={loadingStates[ticket._id!]}
                      className="flex items-center px-4 py-2 bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      {loadingStates[ticket._id!] ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <DoorOpen className="w-4 h-4 mr-2" />
                      )}
                      Mark Entry
                    </button>
                  )}

                  {ticket.entry_marked && (
                    <span
                      className="px-2 py-1 rounded text-sm bg-orange-500/20 text-orange-400 flex items-center">
                      <DoorOpen className="w-3 h-3 mr-1" />
                      Entry Marked
                    </span>
                  )}

                  {ticket.payment_proof && (
                    <button
                      onClick={() => setSelectedImage(ticket.payment_proof as string)}
                      className="flex items-center px-4 py-2 bg-zinc-700 rounded-md hover:bg-zinc-600"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Payment Proof
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!activeSearch && (
          <div className="mt-8 flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchParams({ page: String(page - 1) })}
                disabled={page === 1}
                className="p-2 bg-zinc-800 rounded-md hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
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
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-gray-400">
              Total Tickets: {totalTickets} | Showing {limit} per page
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Payment Proof"
              className="max-h-[90vh] max-w-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;