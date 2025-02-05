import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Users, CreditCard, IndianRupee, Plus, Loader2, X, Trash2 } from 'lucide-react';
import { getAnalytics, getOffers, addOffer, setActiveOffer, deleteOffer } from '../services/api';
import { Analytics, Offer } from '../types/ticket';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newOffer, setNewOffer] = useState({ offer: '', price: '' });
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchAnalytics();
    fetchOffers();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to fetch analytics');
    }
  };

  const fetchOffers = async () => {
    try {
      const data = await getOffers();
      setOffers(data);
    } catch (error) {
      toast.error('Failed to fetch offers');
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addOffer(newOffer);
      toast.success('Offer added successfully');
      setShowOfferModal(false);
      setNewOffer({ offer: '', price: '' });
      fetchOffers();
    } catch (error) {
      toast.error('Failed to add offer');
    } finally {
      setIsLoading(false);
    }
  };

  const setLoadingState = (id: string, state: boolean) => {
    setLoadingStates(prev => ({ ...prev, [id]: state }));
  };

  const handleSetActiveOffer = async (offerId: string, currentOfferId: string) => {
    try {
      setLoadingState(`activate-${offerId}`, true);
      await setActiveOffer(offerId, currentOfferId);
      toast.success('Offer activated successfully');
      fetchOffers();
    } catch (error) {
      toast.error('Failed to activate offer');
    } finally {
      setLoadingState(`activate-${offerId}`, false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      setLoadingState(`delete-${offerId}`, true);
      await deleteOffer(offerId);
      toast.success('Offer deleted successfully');
      fetchOffers();
    } catch (error) {
      toast.error('Failed to delete offer');
    } finally {
      setLoadingState(`delete-${offerId}`, false);
    }
  };

  const stats = [
    {
      title: 'Total Tickets',
      value: analytics?.totalTickets || 0,
      icon: Ticket,
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      title: 'Verified Payments',
      value: analytics?.verifiedPayments || 0,
      icon: CreditCard,
      color: 'bg-green-500/20 text-green-400',
    },
    {
      title: 'Entries Marked',
      value: analytics?.entriesMarked || 0,
      icon: Users,
      color: 'bg-purple-500/20 text-purple-400',
    },
  ];

  const activeOffer = offers.find(offer => offer.active);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-zinc-900 rounded-lg p-6">
            <div className={`inline-flex p-3 rounded-lg ${stat.color} mb-4`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
            <p className="text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Ticket Pricing Card */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex p-3 rounded-lg bg-yellow-500/20 text-yellow-400 mb-4">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white">Ticket Pricing</h2>
            </div>
            <button
              onClick={() => setShowOfferModal(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Offer
            </button>
          </div>

          <div className="mt-6">
            {/* Active Offer */}
            {activeOffer && (
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Current Active Offer</p>
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{activeOffer.offer}</p>
                    <p className="text-2xl font-bold text-white">₹{activeOffer.price}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                    Active
                  </span>
                </div>
              </div>
            )}

            {/* Other Offers */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Available Offers</p>
              <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800 pr-2">
                {offers
                  .filter(offer => !offer.active)
                  .map((offer) => (
                    <div key={offer._id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{offer.offer}</p>
                        <p className="text-xl font-bold text-white">₹{offer.price}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSetActiveOffer(offer._id, activeOffer?._id || '')}
                          disabled={loadingStates[`activate-${offer._id}`]}
                          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {loadingStates[`activate-${offer._id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Activate'
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer._id)}
                          disabled={loadingStates[`delete-${offer._id}`]}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loadingStates[`delete-${offer._id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-zinc-900 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/tickets')}
              className="flex items-center justify-center px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Ticket className="w-5 h-5 mr-2" />
              Manage Tickets
            </button>
            <button
              className="flex items-center justify-center px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              View Attendees
            </button>
          </div>
        </div>
      </div>

      {/* Add Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Offer</h2>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddOffer} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Offer Name
                </label>
                <input
                  type="text"
                  value={newOffer.offer}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, offer: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Price (₹)
                </label>
                <input
                  type="number"
                  value={newOffer.price}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-yellow-500"
                  required
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-yellow-600 rounded-md hover:bg-yellow-700 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Offer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;