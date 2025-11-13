import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookingAPI, ShowtimesAPI } from '../lib/api';

// Simple toast function if the toast utility is not available
const toast = {
  error: (title, message) => {
    console.error(title, message);
    alert(`${title}: ${message}`);
  }
};

try {
  // Try to import the actual toast function
  const { toast: importedToast } = await import('../lib/toast');
  Object.assign(toast, importedToast);
} catch (e) {
  console.warn('Toast module not found, using fallback', e);
}

// Seat component with enhanced styling and tooltips
const Seat = ({ seat, onToggle }) => {
  const isUnavailable = seat.status === 'booked' || seat.status === 'locked';
  const isSelected = seat.selected;
  
  const getSeatStatus = () => {
    if (seat.status === 'booked') return 'Booked';
    if (seat.status === 'locked') return 'Locked';
    return 'Available';
  };

  return (
    <div className="relative group">
      <button
        disabled={isUnavailable}
        onClick={onToggle}
        className={`
          w-10 h-10 md:w-12 md:h-12 rounded-md flex items-center justify-center
          text-sm font-medium transition-all duration-200 relative
          ${isUnavailable 
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
            : isSelected 
              ? 'bg-blue-600 text-white border-2 border-blue-500 transform -translate-y-1 shadow-lg' 
              : 'bg-gray-800 text-white border-2 border-gray-600 hover:border-blue-400 hover:bg-gray-700'}
          ${seat.seat % 5 === 0 ? 'mr-6' : ''}
        `}
      >
        {seat.seat}
        {isUnavailable && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-px bg-gray-600 transform rotate-45"></div>
          </div>
        )}
      </button>
      <div className="absolute z-10 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-md whitespace-nowrap -top-10 left-1/2 transform -translate-x-1/2">
        {`Seat ${seat.row}${seat.seat} - ${getSeatStatus()}`}
      </div>
    </div>
  );
};

// Legend component for seat status
const SeatLegend = () => (
  <div className="flex flex-wrap justify-center gap-4 mb-8">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-blue-600 border-2 border-blue-500"></div>
      <span className="text-sm text-gray-300">Selected</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-gray-800 border-2 border-gray-600"></div>
      <span className="text-sm text-gray-300">Available</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded bg-gray-800 border-2 border-gray-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-px bg-gray-600 transform rotate-45"></div>
        </div>
      </div>
      <span className="text-sm text-gray-400">Booked</span>
    </div>
  </div>
);

// Screen component
const Screen = () => (
  <div className="mb-8">
    <div className="h-2 bg-gradient-to-t from-blue-500/20 to-transparent rounded-t-full mx-auto w-3/4"></div>
    <div className="text-center text-sm text-gray-400 mt-2">Screen This Way</div>
  </div>
);

export default function SeatSelection() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [grid, setGrid] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create a default seat grid
  const createDefaultSeatGrid = () => {
    const rows = 'ABCDEFGH'.split('');
    const seatsPerRow = 16;
    return rows.map(row => 
      Array.from({ length: seatsPerRow }, (_, i) => ({
        row,
        seat: i + 1,
        status: 'available',
        selected: false
      }))
    );
  };

  // Load seat data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, load the showtime data which is critical
        let showtimeData;
        try {
          showtimeData = await ShowtimesAPI.get(showtimeId);
          setMeta(showtimeData);
        } catch (showtimeError) {
          console.error('Failed to load showtime:', showtimeError);
          throw new Error('Failed to load showtime information');
        }
        
        // Then try to load locked seats, but don't fail if this doesn't work
        let seatsData = { bookedSeats: [], lockedSeats: [] };
        try {
          const lockedSeatsResponse = await BookingAPI.lockedSeats(showtimeId).catch(e => {
            console.warn('Failed to load locked seats, using empty list', e);
            return { data: { bookedSeats: [], lockedSeats: [] } };
          });
          
          // Handle different response formats
          if (lockedSeatsResponse && lockedSeatsResponse.data) {
            seatsData = {
              bookedSeats: lockedSeatsResponse.data.bookedSeats || [],
              lockedSeats: lockedSeatsResponse.data.lockedSeats || []
            };
          }
        } catch (seatsError) {
          console.warn('Error loading seat status, using default available seats', seatsError);
          // Continue with empty seat data
        }
        
        // Create seat grid
        const rows = 'ABCDEFGH'.split('');
        const seatsPerRow = 16;
        
        // Helper to safely check seat status
        const getSeatStatus = (row, seat) => {
          try {
            if (!seatsData) return 'available';
            
            const seatKey = `${row}-${seat}`.toLowerCase();
            const isBooked = Array.isArray(seatsData.bookedSeats) && 
              seatsData.bookedSeats.some(s => 
                s && `${s.row}-${s.seat}`.toLowerCase() === seatKey
              );
            const isLocked = Array.isArray(seatsData.lockedSeats) && 
              seatsData.lockedSeats.some(s => 
                s && `${s.row}-${s.seat}`.toLowerCase() === seatKey
              );
            
            if (isBooked) return 'booked';
            if (isLocked) return 'locked';
            return 'available';
          } catch (e) {
            console.warn('Error checking seat status, defaulting to available', e);
            return 'available';
          }
        };
        
        const seatGrid = rows.map(row => 
          Array.from({ length: seatsPerRow }, (_, i) => ({
            row,
            seat: i + 1,
            status: getSeatStatus(row, i + 1),
            selected: false
          }))
        );
        
        setGrid(seatGrid);
      } catch (err) {
        console.error('Error in loadData:', err);
        // Even if there's an error, we'll show a default grid so the UI isn't broken
        setGrid(createDefaultSeatGrid());
        setError('Some seat information could not be loaded. Please proceed with caution.');
        toast.warning('Warning', 'Some seat information could not be loaded. Seats may not reflect current availability.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [showtimeId]);

  // Lock or unlock a seat
  const updateSeatLock = useCallback(async (seat, lock = true) => {
    try {
      if (lock) {
        await BookingAPI.lockSeat(showtimeId, {
          row: seat.row,
          seat: seat.seat,
          price: meta?.price || 200
        });
      } else {
        await BookingAPI.unlockSeat(showtimeId, {
          row: seat.row,
          seat: seat.seat
        });
      }
      return true;
    } catch (error) {
      console.error(`Error ${lock ? 'locking' : 'unlocking'} seat:`, error);
      toast.error('Error', `Failed to ${lock ? 'reserve' : 'release'} seat. Please try again.`);
      return false;
    }
  }, [showtimeId, meta?.price]);

  // Toggle seat selection with locking
  const toggleSeat = useCallback(async (rIdx, cIdx) => {
    try {
      setGrid(prev => {
        const newGrid = JSON.parse(JSON.stringify(prev));
        const seat = newGrid[rIdx]?.[cIdx];
        
        // Validate seat exists and is available
        if (!seat || (seat.status !== 'available' && !seat.selected)) {
          console.warn('Cannot select this seat:', seat);
          return prev;
        }
        
        const newSelected = !seat.selected;
        const seatKey = `${seat.row}-${seat.seat}`;
        
        // Update UI optimistically
        newGrid[rIdx][cIdx] = { ...seat, selected: newSelected };
        
        // Update selected seats list
        setSelected(prevSelected => {
          if (newSelected) {
            return [
              ...prevSelected, 
              { 
                _id: seatKey,
                row: seat.row, 
                seat: seat.seat, 
                price: meta?.price || 200,
                showtime: showtimeId,
                locked: false // Track if we've locked this seat
              }
            ];
          } else {
            return prevSelected.filter(s => s._id !== seatKey);
          }
        });
        
        return newGrid;
      });
      
      // Get the seat data after state update
      const seat = grid[rIdx]?.[cIdx];
      if (!seat) return;
      
      // Lock or unlock the seat on the server
      const success = await updateSeatLock(seat, !seat.selected);
      
      if (!success) {
        // Revert the selection if locking failed
        setGrid(prev => {
          const newGrid = JSON.parse(JSON.stringify(prev));
          if (newGrid[rIdx]?.[cIdx]) {
            newGrid[rIdx][cIdx].selected = seat.selected; // Revert to previous state
          }
          return newGrid;
        });
        
        setSelected(prevSelected => 
          seat.selected 
            ? [...prevSelected, { 
                _id: `${seat.row}-${seat.seat}`,
                row: seat.row,
                seat: seat.seat,
                price: meta?.price || 200,
                showtime: showtimeId
              }]
            : prevSelected.filter(s => !(s.row === seat.row && s.seat === seat.seat))
        );
      } else if (!seat.selected) {
        // If we're deselecting, update the locked status
        setSelected(prevSelected => 
          prevSelected.map(s => 
            s.row === seat.row && s.seat === seat.seat 
              ? { ...s, locked: false } 
              : s
          )
        );
      } else {
        // If we're selecting, update the locked status
        setSelected(prevSelected => 
          prevSelected.map(s => 
            s.row === seat.row && s.seat === seat.seat 
              ? { ...s, locked: true } 
              : s
          )
        );
      }
      
    } catch (error) {
      console.error('Error toggling seat selection:', error);
      toast.error('Error', 'Failed to update seat selection');
    }
  }, [grid, meta?.price, showtimeId, updateSeatLock]);

  // Proceed to checkout
  const proceedToCheckout = useCallback(() => {
    try {
      if (!selected.length) {
        toast.error('Selection Required', 'Please select at least one seat');
        return;
      }
      
      if (!meta) {
        toast.error('Error', 'Showtime information is not available');
        return;
      }
      
      // Prepare navigation state
      const checkoutState = {
        showtime: {
          _id: showtimeId,
          movie: meta.movie,
          theater: meta.theater,
          startTime: meta.startTime,
          price: meta.price || 200
        },
        seats: selected.map(s => ({
          row: s.row,
          seat: s.seat,
          price: s.price
        })),
        totalAmount: selected.reduce((sum, seat) => sum + (seat.price || 0), 0)
      };
      
      console.log('Navigating to checkout with:', checkoutState);
      
      navigate('/checkout', { 
        state: checkoutState,
        replace: true
      });
      
    } catch (error) {
      console.error('Error proceeding to checkout:', error);
      toast.error('Error', 'Failed to proceed to checkout. Please try again.');
    }
  }, [selected, meta, showtimeId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalAmount = selected.reduce((sum, seat) => sum + (seat.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Seats</h1>
          <p className="text-gray-400">{meta?.theater?.name} • {meta?.theater?.location}</p>
          <p className="text-lg font-medium mt-2">
            {meta?.movie?.title} • {new Date(meta?.startTime).toLocaleDateString()}
            {' • '}
            {new Date(meta?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Screen */}
        <Screen />

        {/* Seat Legend */}
        <SeatLegend />

        {/* Seat Grid */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8 overflow-hidden">
          <div className="overflow-x-auto pb-4">
            <div className="space-y-4 w-max mx-auto">
              {grid.map((row, ri) => (
                <div key={ri} className="flex items-center gap-2">
                  <div className="w-8 text-center font-medium text-gray-300">{row[0].row}</div>
                  <div className="flex gap-1">
                    {row.map((seat, si) => (
                      <Seat 
                        key={`${ri}-${si}`} 
                        seat={seat} 
                        onToggle={() => toggleSeat(ri, si)} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Selection</h3>
          
          {selected.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Selected Seats</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.map((s, i) => (
                      <span key={i} className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {s.row}{s.seat}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-1">Price per Ticket</h4>
                  <p className="text-lg font-medium">₹{meta?.price || 200}</p>
                </div>
                <div className="md:text-right">
                  <h4 className="text-gray-400 text-sm mb-1">Total Amount</h4>
                  <p className="text-2xl font-bold text-blue-400">₹{totalAmount}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={proceedToCheckout}
                  className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Proceed to Pay
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p>Select seats to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}