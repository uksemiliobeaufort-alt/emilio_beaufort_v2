
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FounderCardProps {
  name: string;
  role: string;
  imageUrl?: string;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onDelete: () => void;
}

export function FounderCard({ name, role, imageUrl, uploading, onUpload, onDelete }: FounderCardProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <p className="text-sm text-gray-600">{role}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-2xl font-bold text-gray-600">${name.split(' ').map(n => n[0]).join('')}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-gray-600">
                  {name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`upload-${name}`} className="text-sm font-medium">
              Upload Image
            </Label>
            <Input
              id={`upload-${name}`}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
              className="text-sm"
            />
            {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
          </div>

          {imageUrl && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="w-full"
            >
              Delete Image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
