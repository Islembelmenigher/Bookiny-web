import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BusinessCoverUploadProps {
  businessId: string;
  currentCoverUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export function BusinessCoverUpload({ businessId, currentCoverUrl, onUploadSuccess }: BusinessCoverUploadProps) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.coverImage.typeError'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.coverImage.sizeError'));
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-covers')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('business-covers')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ cover_image_url: publicUrl })
        .eq('id', businessId);

      if (updateError) throw updateError;

      onUploadSuccess(publicUrl);
      toast.success(t('settings.coverImage.success'));
    } catch (error: any) {
      toast.error(error.message || t('settings.coverImage.error'));
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.coverImage.title')}</CardTitle>
        <CardDescription>{t('settings.coverImage.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preview */}
          <div
            className="h-48 rounded-lg bg-muted flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: currentCoverUrl ? `url(${currentCoverUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!currentCoverUrl && (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('settings.coverImage.noImage')}</p>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div>
            <Label htmlFor="cover-upload" className="cursor-pointer">
              <Button type="button" disabled={uploading} asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? t('settings.coverImage.uploading') : t('settings.coverImage.upload')}
                </span>
              </Button>
            </Label>
            <Input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {t('settings.coverImage.recommendation')}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
