import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const RatingStars = ({ storeId, userRating, onRatingChange }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userRating) {
      setRating(userRating);
    }
  }, [userRating]);

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/ratings/${storeId}`,
        { rating },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Rating submitted successfully!');
      if (onRatingChange) {
        onRatingChange(rating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.response?.data?.message || 'Error submitting rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rating-container">
      <div className="stars-container">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <FaStar
              key={index}
              className={`star ${ratingValue <= (hover || rating) ? 'filled' : 'empty'}`}
              onClick={() => setRating(ratingValue)}
              onMouseEnter={() => setHover(ratingValue)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </div>
      <div className="rating-info">
        <span className="rating-text">
          {rating > 0 ? `Your rating: ${rating} star${rating > 1 ? 's' : ''}` : 'Click to rate'}
        </span>
        {rating > 0 && (
          <button
            className="submit-rating-btn"
            onClick={handleRatingSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        )}
      </div>
    </div>
  );
};

export default RatingStars; 