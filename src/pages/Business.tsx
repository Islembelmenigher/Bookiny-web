import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, MapPin, Star, Clock, DollarSign, User, Phone, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ReviewForm } from '@/components/business/ReviewForm';
import { PortfolioGallery } from '@/components/business/PortfolioGallery';
import { formatDZD } from '@/lib/algeria';

export default function Business() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [staffServices, setStaffServices] = useState<any[]>([]);
  const [staffHours, setStaffHours] = useState<any[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<any[]>([]);
  const [phoneCopied, setPhoneCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBusinessDetails();
    }
  }, [id]);

  // Fetch staff services when business loads
  useEffect(() => {
    if (id && staff.length > 0) {
      fetchStaffServices();
    }
  }, [id, staff]);

  // Filter staff when service is selected
  useEffect(() => {
    if (selectedService && staffServices.length > 0) {
      const staffIds = staffServices
        .filter(ss => ss.service_id === selectedService.id)
        .map(ss => ss.staff_id);
      const filtered = staff.filter(s => staffIds.includes(s.id));
      setFilteredStaff(filtered);
      // Reset staff selection if current staff doesn't offer this service
      if (selectedStaff && !staffIds.includes(selectedStaff.id)) {
        setSelectedStaff(null);
      }
    } else {
      setFilteredStaff(staff);
    }
  }, [selectedService, staffServices, staff]);

  // Fetch staff hours when staff is selected
  useEffect(() => {
    if (selectedStaff) {
      fetchStaffHours(selectedStaff.id);
    } else {
      setStaffHours([]);
    }
  }, [selectedStaff]);

  // Fetch bookings when date changes
  useEffect(() => {
    if (selectedDate && id && selectedStaff) {
      fetchExistingBookings();
    }
  }, [selectedDate, id, selectedStaff]);

  const fetchBusinessDetails = async () => {
    try {
      const [businessRes, servicesRes, staffRes, hoursRes, reviewsRes, ratingRes] = await Promise.all([
        supabase.from('businesses').select('*').eq('id', id).single(),
        supabase.from('services').select('*').eq('business_id', id).eq('is_active', true),
        supabase.from('staff').select('*').eq('business_id', id).eq('is_active', true),
        supabase.from('business_hours').select('*').eq('business_id', id),
        supabase.from('reviews').select('*, profiles(full_name, avatar_url)').eq('business_id', id).order('created_at', { ascending: false }),
        supabase.rpc('get_business_average_rating', { business_uuid: id }),
      ]);

      if (businessRes.error) throw businessRes.error;
      setBusiness(businessRes.data);
      setServices(servicesRes.data || []);
      setStaff(staffRes.data || []);
      setBusinessHours(hoursRes.data || []);
      setReviews(reviewsRes.data || []);
      setAverageRating(ratingRes.data || 0);
    } catch (error: any) {
      toast.error('Failed to load business details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffServices = async () => {
    const { data } = await supabase
      .from('staff_services')
      .select('staff_id, service_id')
      .in('staff_id', staff.map(s => s.id));
    
    setStaffServices(data || []);
  };

  const fetchStaffHours = async (staffId: string) => {
    const { data } = await supabase
      .from('staff_hours')
      .select('*')
      .eq('staff_id', staffId)
      .eq('is_available', true);
    
    setStaffHours(data || []);
  };

  const fetchExistingBookings = async () => {
    if (!selectedDate || !selectedStaff) return;
    
    const { data } = await supabase
      .from('bookings')
      .select('start_time, end_time, staff_id')
      .eq('business_id', id)
      .eq('staff_id', selectedStaff.id)
      .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
      .in('status', ['pending', 'confirmed']);
    
    setExistingBookings(data || []);
  };

  const handleBookService = (service: any) => {
    if (!user) {
      toast.error('Please sign in to book an appointment');
      navigate('/auth');
      return;
    }
    setSelectedService(service);
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedStaff(null);
    setExistingBookings([]);
    setBookingDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      toast.error('Please select all booking details');
      return;
    }

    const bookingDate = format(selectedDate, 'yyyy-MM-dd');
    const endTime = calculateEndTime(selectedTime, selectedService.duration_minutes);
    
    // Check for conflicts
    const { data: conflictCheck } = await supabase
      .from('bookings')
      .select('id')
      .eq('business_id', id)
      .eq('staff_id', selectedStaff.id)
      .eq('booking_date', bookingDate)
      .in('status', ['pending', 'confirmed'])
      .or(`and(start_time.lt.${endTime},end_time.gt.${selectedTime})`);
    
    if (conflictCheck && conflictCheck.length > 0) {
      toast.error('This time slot has just been booked. Please select another time.');
      await fetchExistingBookings();
      setSelectedTime('');
      return;
    }

    try {
      const { error } = await supabase.from('bookings').insert({
        business_id: id,
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        client_id: user?.id,
        booking_date: bookingDate,
        start_time: selectedTime,
        end_time: endTime,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Booking confirmed!');
      setBookingDialogOpen(false);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
      console.error(error);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isSlotReserved = (time: string) => {
    if (!selectedService) return false;
    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + selectedService.duration_minutes;
    
    return existingBookings.some(b => {
      const bookingStart = timeToMinutes(b.start_time);
      const bookingEnd = timeToMinutes(b.end_time);
      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  };

  const getTimeSlots = () => {
    if (!selectedDate || businessHours.length === 0 || !selectedStaff) {
      return [];
    }

    const dayOfWeek = selectedDate.getDay();
    const businessDayHours = businessHours.find(h => h.day_of_week === dayOfWeek);

    if (!businessDayHours || businessDayHours.is_closed) {
      return [];
    }

    // Get staff hours for this day
    const staffDayHours = staffHours.find(h => h.day_of_week === dayOfWeek);
    
    // If staff has no hours set for this day, use business hours
    // If staff has hours, use the intersection of business and staff hours
    let startTime: string;
    let endTime: string;

    if (staffDayHours) {
      // Use the later start time and earlier end time (intersection)
      const businessStart = timeToMinutes(businessDayHours.start_time);
      const businessEnd = timeToMinutes(businessDayHours.end_time);
      const staffStart = timeToMinutes(staffDayHours.start_time);
      const staffEnd = timeToMinutes(staffDayHours.end_time);

      const effectiveStart = Math.max(businessStart, staffStart);
      const effectiveEnd = Math.min(businessEnd, staffEnd);

      if (effectiveStart >= effectiveEnd) {
        return []; // No overlap between business and staff hours
      }

      const startHour = Math.floor(effectiveStart / 60);
      const startMin = effectiveStart % 60;
      const endHour = Math.floor(effectiveEnd / 60);
      const endMin = effectiveEnd % 60;

      startTime = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    } else {
      startTime = businessDayHours.start_time;
      endTime = businessDayHours.end_time;
    }

    const slots: { time: string; status: 'available' | 'reserved' }[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const time = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const reserved = isSlotReserved(time);
      
      slots.push({
        time,
        status: reserved ? 'reserved' : 'available',
      });
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!business) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <p className="text-muted-foreground">Business not found</p>
        </div>
      </Layout>
    );
  }

  const timeSlots = getTimeSlots();

  return (
    <Layout>
      <div className="container py-8 px-4">
        {/* Business Header */}
        <div
          className="h-64 rounded-lg bg-cover bg-center mb-6 relative"
          style={{
            backgroundImage: business.cover_image_url
              ? `url(${business.cover_image_url})`
              : 'linear-gradient(135deg, hsl(185 84% 45%), hsl(185 84% 60%))',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent rounded-lg"></div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{business.name}</h1>
                <Badge>{business.category.replace('_', ' ')}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                {business.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{business.city}, {business.state}</span>
                  </div>
                )}
                {business.phone && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(business.phone);
                      setPhoneCopied(true);
                      setTimeout(() => setPhoneCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{business.phone}</span>
                    {phoneCopied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
                {averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{averageRating} ({reviews.length} reviews)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {business.description && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-muted-foreground">{business.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Portfolio Gallery */}
          <div className="mb-6">
            <PortfolioGallery businessId={id!} />
          </div>

          {/* Services */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Services</h2>
              {services.length === 0 ? (
                <p className="text-muted-foreground">No services available</p>
              ) : (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${service.price}</span>
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => handleBookService(service)}>Book Now</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Staff */}
          {staff.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Our Team</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        {member.title && (
                          <p className="text-sm text-muted-foreground">{member.title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
            
            {user && (
              <div className="mb-6">
                <ReviewForm 
                  businessId={id!} 
                  onReviewSubmitted={fetchBusinessDetails}
                />
              </div>
            )}

            {reviews.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No reviews yet. Be the first to review!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {review.profiles?.avatar_url ? (
                          <img
                            src={review.profiles.avatar_url}
                            alt={review.profiles.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {review.profiles?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.profiles?.full_name || 'Anonymous'}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-muted-foreground mb-2">{review.comment}</p>
                          )}
                          {review.image_url && (
                            <img
                              src={review.image_url}
                              alt="Review"
                              className="rounded-lg max-h-64 object-cover mt-2"
                            />
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(review.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book {selectedService?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Step 1: Select Staff First */}
            <div>
              <h3 className="font-semibold mb-3">1. Select Professional</h3>
              {filteredStaff.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No staff members are available for this service.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredStaff.map((member) => (
                    <Button
                      key={member.id}
                      variant={selectedStaff?.id === member.id ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => {
                        setSelectedStaff(member);
                        setSelectedDate(undefined);
                        setSelectedTime('');
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {member.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Select Date (only show after staff selected) */}
            {selectedStaff && (
              <div>
                <h3 className="font-semibold mb-3">2. Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime('');
                  }}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
            )}

            {/* Step 3: Select Time (only show after date selected) */}
            {selectedStaff && selectedDate && (
              <div>
                <h3 className="font-semibold mb-3">3. Select Time</h3>
                <div className="flex gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500" />
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500" />
                    <span>Reserved</span>
                  </div>
                </div>
                {timeSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {selectedStaff.name} is not available on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {timeSlots.map(({ time, status }) => (
                      <Button
                        key={time}
                        variant="outline"
                        size="sm"
                        disabled={status === 'reserved'}
                        onClick={() => setSelectedTime(time)}
                        className={`
                          ${selectedTime === time ? 'ring-2 ring-primary' : ''}
                          ${status === 'available' ? 'bg-green-500/10 border-green-500 hover:bg-green-500/20 text-foreground' : ''}
                          ${status === 'reserved' ? 'bg-red-500/10 border-red-500 text-muted-foreground cursor-not-allowed' : ''}
                        `}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleConfirmBooking}
              disabled={!selectedStaff || !selectedDate || !selectedTime}
            >
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
