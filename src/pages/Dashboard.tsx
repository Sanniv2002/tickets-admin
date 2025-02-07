import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Users, CreditCard, IndianRupee, Plus, Loader2, X, Trash2, Lock, Mail } from 'lucide-react';
import { getAnalytics, getOffers, addOffer, setActiveOffer, deleteOffer, whoami, getEmailTemplates, sendBulkEmails } from '../services/api';
import { Analytics, Offer, User, EmailTemplate } from '../types/ticket';
import toast from 'react-hot-toast';

const SkeletonCard = () => (
  <div className="bg-zinc-900 rounded-lg p-6 animate-pulse">
    <div className="h-8 w-24 bg-zinc-800 rounded mb-4"></div>
    <div className="h-4 w-48 bg-zinc-800 rounded mb-2"></div>
    <div className="space-y-2">
      <div className="h-4 w-32 bg-zinc-800 rounded"></div>
      <div className="h-4 w-40 bg-zinc-800 rounded"></div>
    </div>
  </div>
);

const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-zinc-900 rounded-lg p-6 animate-pulse">
        <div className="w-12 h-12 bg-zinc-800 rounded-lg mb-4"></div>
        <div className="h-6 w-16 bg-zinc-800 rounded mb-2"></div>
        <div className="h-4 w-24 bg-zinc-800 rounded"></div>
      </div>
    ))}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newOffer, setNewOffer] = useState({ offer: '', price: '' });
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sendingEmails, setSendingEmails] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await whoami();
      setUser(userData);
    };
    fetchUser();
    fetchAnalytics();
    fetchOffers();
    fetchEmailTemplates();
  }, []);

  const fetchEmailTemplates = async () => {
    try {
      const templates = await getEmailTemplates();
      setEmailTemplates(templates);
      if (templates.length > 0) {
        setSelectedTemplate(templates[0].id);
      }
    } catch (error) {
      toast.error('Failed to fetch email templates');
    }
  };

  const handleSendBulkEmails = async () => {
    if (!user?.isSuperAdmin) {
      toast.error('Only superadmins can send bulk emails');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select an email template');
      return;
    }

    try {
      setSendingEmails(true);
      await sendBulkEmails(selectedTemplate);
      toast.success('Bulk emails sent successfully');
      setShowEmailModal(false);
    } catch (error) {
      toast.error('Failed to send bulk emails');
    } finally {
      setSendingEmails(false);
    }
  };

  const getSelectedTemplate = () => {
    return emailTemplates.find(template => template.id === selectedTemplate);
  };

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isSuperAdmin) {
      toast.error('Only superadmins can add offers');
      return;
    }
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
    if (!user?.isSuperAdmin) {
      toast.error('Only superadmins can modify offers');
      return;
    }
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
    if (!user?.isSuperAdmin) {
      toast.error('Only superadmins can delete offers');
      return;
    }
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
      
      {loading ? (
        <>
          <SkeletonStats />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </>
      ) : (
        <>
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
            <div className="bg-zinc-900 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex p-3 rounded-lg bg-yellow-500/20 text-yellow-400 mb-4">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Ticket Pricing</h2>
                </div>
                <button
                  onClick={() => user?.isSuperAdmin ? setShowOfferModal(true) : toast.error('Only superadmins can add offers')}
                  className="group relative px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  disabled={!user?.isSuperAdmin}
                >
                  {!user?.isSuperAdmin && (
                    <Lock className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2" />
                  )}
                  <Plus className="w-4 h-4" />
                  <span className={!user?.isSuperAdmin ? 'mr-6' : ''}>Add Offer</span>
                  {!user?.isSuperAdmin && (
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Only superadmins can add offers
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-6">
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
                              disabled={loadingStates[`activate-${offer._id}`] || !user?.isSuperAdmin}
                              className="group relative px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {loadingStates[`activate-${offer._id}`] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  {!user?.isSuperAdmin && (
                                    <Lock className="w-4 h-4" />
                                  )}
                                  Activate
                                </>
                              )}
                              {!user?.isSuperAdmin && (
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Only superadmins can activate offers
                                </span>
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer._id)}
                              disabled={loadingStates[`delete-${offer._id}`] || !user?.isSuperAdmin}
                              className="group relative p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {loadingStates[`delete-${offer._id}`] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  {!user?.isSuperAdmin && (
                                    <Lock className="w-4 h-4" />
                                  )}
                                  <Trash2 className="w-4 h-4" />
                                </>
                              )}
                              {!user?.isSuperAdmin && (
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  Only superadmins can delete offers
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

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
                  onClick={() => navigate('/attendees')}
                  className="flex items-center justify-center px-4 py-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  <Users className="w-5 h-5 mr-2" />
                  View Attendees
                </button>
                {user?.isSuperAdmin && (
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Send Bulk Emails
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Offer</h2>
              <button
                onClick={() => setShowOfferModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 bg-white" />
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

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Send Bulk Emails</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Email Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-purple-500"
              >
                {emailTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplate && getSelectedTemplate() && (
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Subject</h3>
                  <div className="p-3 bg-zinc-800 rounded-md text-white">
                    {getSelectedTemplate()?.subject}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Email Body</h3>
                  <div className="p-3 bg-zinc-800 rounded-md text-white whitespace-pre-wrap h-60 overflow-y-scroll scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-900">
                    {getSelectedTemplate()?.body}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendBulkEmails}
                disabled={sendingEmails}
                className="flex items-center px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {sendingEmails ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Emails
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;