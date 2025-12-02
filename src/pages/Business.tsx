import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, MapPin, Star, Clock, DollarSign, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ReviewForm } from '@/components/business/ReviewForm';

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

  useEffect(() => {
    if (id) {
      fetchBusinessDetails();
    }
  }, [id]);

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

  const handleBookService = (service: any) => {
    if (!user) {
      toast.error('Please sign in to book an appointment');
      navigate('/auth');
      return;
    }
    setSelectedService(service);
    setBookingDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      toast.error('Please select all booking details');
      return;
    }

    try {
      const { error } = await supabase.from('bookings').insert({
        business_id: id,
        service_id: selectedService.id,
        staff_id: selectedStaff.id,
        client_id: user?.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: selectedTime,
        end_time: calculateEndTime(selectedTime, selectedService.duration_minutes),
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

  const getAvailableTimeSlots = () => {
    if (!selectedDate || businessHours.length === 0) {
      return [];
    }

    const dayOfWeek = selectedDate.getDay();
    const dayHours = businessHours.find(h => h.day_of_week === dayOfWeek);

    if (!dayHours || dayHours.is_closed) {
      return [];
    }

    const slots = [];
    const [startHour, startMin] = dayHours.start_time.split(':').map(Number);
    const [endHour, endMin] = dayHours.end_time.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
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
              <div className="flex items-center gap-4 text-muted-foreground">
                {business.city && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{business.city}, {business.state}</span>
                  </div>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book {selectedService?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Select Staff */}
            <div>
              <h3 className="font-semibold mb-3">Select Professional</h3>
              <div className="grid grid-cols-2 gap-2">
                {staff.map((member) => (
                  <Button
                    key={member.id}
                    variant={selectedStaff?.id === member.id ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setSelectedStaff(member)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {member.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Select Date */}
            <div>
              <h3 className="font-semibold mb-3">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border pointer-events-auto"
              />
            </div>

            {/* Select Time */}
            {selectedDate && (
              <div>
                <h3 className="font-semibold mb-3">Select Time</h3>
                {getAvailableTimeSlots().length === 0 ? (
                  <p className="text-sm text-muted-foreground">This business is closed on the selected date.</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                    {getAvailableTimeSlots().map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
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
