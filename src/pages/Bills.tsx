import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getBills, uploadBill } from '../services/api';
import { Bill } from '../types/ticket';
import { 
  Receipt, Loader2, Upload, Eye, X, 
  ChevronLeft, ChevronRight, IndianRupee 
} from 'lucide-react';
import { format } from 'date-fns';

const SkeletonBill = () => (
  <div className="bg-zinc-900 rounded-lg p-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-6 w-48 bg-zinc-800 rounded"></div>
      <div className="h-4 w-32 bg-zinc-800 rounded"></div>
      <div className="h-16 w-full bg-zinc-800 rounded"></div>
      <div className="flex gap-2">
        <div className="h-8 w-24 bg-zinc-800 rounded"></div>
        <div className="h-8 w-32 bg-zinc-800 rounded"></div>
      </div>
    </div>
  </div>
);

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [limit, setLimit] = useState(10);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    description: '',
  });

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchBills();
  }, [page]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await getBills(page);
      setBills(data.bills);
      setTotalBills(data.total);
      setLimit(data.limit);
      setTotalPages(Math.ceil(data.total / data.limit));
    } catch (error) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('bill-file') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('amount', formData.amount);
    formDataToSend.append('description', formData.description);

    try {
      setUploadLoading(true);
      await uploadBill(formDataToSend);
      toast.success('Bill uploaded successfully');
      setShowUploadModal(false);
      setFormData({ title: '', amount: '', description: '' });
      fetchBills();
    } catch (error) {
      toast.error('Failed to upload bill');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Bills</h1>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Bill
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <SkeletonBill key={i} />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {bills.map((bill) => (
              <div key={bill._id} className="bg-zinc-900 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{bill.title}</h3>
                    <p className="text-2xl font-bold text-green-500 mb-4">
                      ₹{bill.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-gray-400 mb-4">{bill.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Receipt className="w-4 h-4 mr-1" />
                        Uploaded by: {bill.uploadedBy}
                      </span>
                      <span>
                        {format(new Date(bill.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBill(bill)}
                    className="flex items-center px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Bill
                  </button>
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
              Total Bills: {totalBills} | Showing {limit} per page
            </div>
          </div>
        </>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upload Bill</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-green-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-green-500 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Bill File
                </label>
                <input
                  type="file"
                  id="bill-file"
                  accept="image/*,.pdf"
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-green-600 file:text-white
                    hover:file:bg-green-700
                    file:cursor-pointer file:transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-zinc-800 rounded-md hover:bg-zinc-700 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="flex items-center px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {uploadLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBill && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedBill(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedBill.billUrl}
              alt="Bill"
              className="max-h-[90vh] max-w-full object-contain"
            />
            <button
              onClick={() => setSelectedBill(null)}
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

export default Bills;