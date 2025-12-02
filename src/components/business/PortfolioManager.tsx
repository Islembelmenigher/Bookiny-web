import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PortfolioManagerProps {
  businessId: string;
}

interface PortfolioImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

export function PortfolioManager({ businessId }: PortfolioManagerProps) {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPortfolioImages();
  }, [businessId]);

  const fetchPortfolioImages = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_images')
        .select('*')
        .eq('business_id', businessId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast.error('Failed to load portfolio images');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        const { error: insertError } = await supabase
          .from('portfolio_images')
          .insert({
            business_id: businessId,
            image_url: publicUrl,
            display_order: images.length,
          });

        if (insertError) throw insertError;
      }

      toast.success('Images uploaded successfully');
      fetchPortfolioImages();
    } catch (error: any) {
      toast.error('Failed to upload images');
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (image: PortfolioImage) => {
    try {
      // Extract file path from URL
      const urlParts = image.image_url.split('/portfolio-images/');
      if (urlParts.length > 1) {
        await supabase.storage
          .from('portfolio-images')
          .remove([urlParts[1]]);
      }

      const { error } = await supabase
        .from('portfolio_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      toast.success('Image deleted');
      fetchPortfolioImages();
    } catch (error: any) {
      toast.error('Failed to delete image');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Portfolio Gallery
        </CardTitle>
        <CardDescription>
          Upload photos showcasing your work (before/after, finished projects, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div>
          <Label htmlFor="portfolio-upload" className="sr-only">
            Upload Images
          </Label>
          <Input
            id="portfolio-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Label
            htmlFor="portfolio-upload"
            className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <span>Click to upload images (max 5MB each)</span>
              </>
            )}
          </Label>
        </div>

        {/* Image Grid */}
        {images.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No portfolio images yet. Upload some to showcase your work!
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group aspect-square">
                <img
                  src={image.image_url}
                  alt="Portfolio"
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(image)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
