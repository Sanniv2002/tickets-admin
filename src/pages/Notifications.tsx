import { useEffect, useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { getNotifications, markNotificationsAsRead } from '../services/api';
import { Notification } from '../types/ticket';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Loader2, Check } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [recentlyRead, setRecentlyRead] = useState<Set<string>>(new Set());
  const observer = useRef<IntersectionObserver | null>(null);
  const { markAsRead } = useNotifications();

  const lastNotificationRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  useEffect(() => {
    const unreadIds = notifications
      .filter(notification => !notification.read)
      .map(notification => notification._id);

    if (unreadIds.length > 0) {
      markNotificationsAsRead(unreadIds)
        .then(() => {
          markAsRead(unreadIds);
          setRecentlyRead(new Set(unreadIds));
          setNotifications(prev => 
            prev.map(notification => 
              unreadIds.includes(notification._id) 
                ? { ...notification, read: true }
                : notification
            )
          );

          // Clear the recently read status after animation
          setTimeout(() => {
            setRecentlyRead(new Set());
          }, 2000);
        })
        .catch(console.error);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await getNotifications(page);
      
      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      
      setHasMore(response.notifications.length === response.limit);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Notifications</h1>

      <div className="space-y-4 max-w-3xl">
        {notifications.map((notification, index) => {
          const isRecentlyRead = recentlyRead.has(notification._id);
          
          return (
            <div
              key={notification._id}
              ref={index === notifications.length - 1 ? lastNotificationRef : null}
              className={`p-4 rounded-lg transition-all duration-300 ${
                notification.read 
                  ? 'bg-zinc-900' 
                  : 'bg-red-500/5 border-2 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
              } ${
                isRecentlyRead ? 'animate-highlight' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div 
                  className={`p-2 rounded-lg transition-colors ${
                    notification.read 
                      ? 'bg-zinc-800' 
                      : 'bg-red-500/20 animate-pulse'
                  }`}
                >
                  <Bell className={`w-5 h-5 ${
                    notification.read ? 'text-gray-400' : 'text-red-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`${
                    notification.read ? 'text-gray-200' : 'text-white font-medium'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {format(new Date(notification.ts), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {isRecentlyRead && (
                  <div className="animate-fadeOut flex items-center gap-1 text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Read</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-red-600" />
          </div>
        )}

        {!hasMore && notifications.length > 0 && (
          <p className="text-center text-gray-400 py-4">No more notifications</p>
        )}

        {notifications.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;