'use client';

import { useEffect, useState } from 'react';
import {
  Star,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer: {
    name: string;
    profilePicture: string | null;
  };
  talent: {
    name: string;
  };
  status: 'APPROVED' | 'PENDING' | 'FLAGGED' | 'REJECTED';
}

export default function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [filterStatus, page]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/reviews?status=${filterStatus}&page=${page}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'FLAGGED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">
            <Flag className="h-3 w-3 mr-1" />
            Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reviews Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Moderate and manage user reviews
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Reviews', value: '1,234', icon: Star, color: 'yellow' },
          { title: 'Pending Review', value: '23', icon: AlertTriangle, color: 'yellow' },
          { title: 'Flagged', value: '5', icon: Flag, color: 'red' },
          { title: 'Avg Rating', value: '4.6', icon: ThumbsUp, color: 'green' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl p-6 border border-gray-200 dark:border-white/20"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`h-8 w-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-white/10 backdrop-blur-md rounded-xl border border-gray-200 dark:border-white/20 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-white/10">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              No reviews found
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.reviewer.profilePicture ? (
                      <img
                        src={review.reviewer.profilePicture}
                        alt={review.reviewer.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          {review.reviewer.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {review.reviewer.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Review for {review.talent.name}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(review.status)}
                </div>

                <div className="mb-3">
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {review.comment}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-green-100 hover:bg-green-200 dark:bg-green-500/20 dark:hover:bg-green-500/30 text-green-700 dark:text-green-300 rounded-lg text-sm transition-colors">
                      <CheckCircle className="h-4 w-4 inline mr-1" />
                      Approve
                    </button>
                    <button className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded-lg text-sm transition-colors">
                      <Flag className="h-4 w-4 inline mr-1" />
                      Flag
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors">
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
