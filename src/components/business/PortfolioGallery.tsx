import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

interface PortfolioGalleryProps {
  businessId: string;
}

interface PortfolioImage {
  id: string;
  image_url: string;
  caption: string | null;
}

export function PortfolioGallery({ businessId }: PortfolioGalleryProps) {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchPortfolioImages();
  }, [businessId]);

  const fetchPortfolioImages = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('id, image_url, caption')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Portfolio
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className="aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <img
                  src={image.image_url}
                  alt={image.caption || 'Portfolio image'}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Full-screen viewer */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            {selectedIndex !== null && selectedIndex > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {selectedIndex !== null && (
              <img
                src={images[selectedIndex].image_url}
                alt={images[selectedIndex].caption || 'Portfolio image'}
                className="max-h-[80vh] max-w-full object-contain"
              />
            )}

            {selectedIndex !== null && selectedIndex < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {selectedIndex !== null && images[selectedIndex].caption && (
              <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                {images[selectedIndex].caption}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
