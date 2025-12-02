import { useState } from 'react';
import { X, Heart, UserX, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Profile } from '@/types/campus-connect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProfileViewerProps {
  profile: Profile;
  onClose: () => void;
  onLike?: () => void;
  onPass?: () => void;
  onReport?: () => void;
  isDatingMode?: boolean;
}

export function ProfileViewer({
  profile,
  onClose,
  onLike,
  onPass,
  onReport,
  isDatingMode = false
}: ProfileViewerProps) {
  const photos = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : profile.avatar_url 
    ? [profile.avatar_url] 
    : [];
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Photo Carousel */}
      <div className="relative h-[60vh] bg-muted">
        {photos.length > 0 ? (
          <>
            <img
              src={photos[currentPhotoIndex]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            
            {/* Photo indicators */}
            <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all",
                    index === currentPhotoIndex 
                      ? "bg-white" 
                      : "bg-white/30"
                  )}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            {photos.length > 1 && (
              <>
                {currentPhotoIndex > 0 && (
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {currentPhotoIndex < photos.length - 1 && (
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No photos
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h1 className="text-3xl font-bold">{profile.name}, {profile.age}</h1>
            <p className="text-muted-foreground mt-1">
              {profile.branch} • Year {profile.year}
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Profile Prompts */}
          {profile.prompt_good_at && (
            <div>
              <h3 className="font-semibold mb-2">I'm really good at...</h3>
              <p className="text-muted-foreground">{profile.prompt_good_at}</p>
            </div>
          )}

          {profile.prompt_care_about && (
            <div>
              <h3 className="font-semibold mb-2">Things I care about...</h3>
              <p className="text-muted-foreground">{profile.prompt_care_about}</p>
            </div>
          )}

          {profile.prompt_looking_for && (
            <div>
              <h3 className="font-semibold mb-2">Looking for...</h3>
              <p className="text-muted-foreground">{profile.prompt_looking_for}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies */}
          {profile.hobbies && profile.hobbies.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby) => (
                  <Badge key={hobby} variant="secondary">
                    {hobby}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {profile.goals && profile.goals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Goals</h3>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal) => (
                  <Badge key={goal} variant="secondary">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {isDatingMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-6 flex justify-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={onPass}
            className="w-16 h-16 rounded-full"
          >
            <UserX className="w-6 h-6" />
          </Button>
          
          <Button
            size="lg"
            onClick={onReport}
            variant="outline"
            className="w-16 h-16 rounded-full"
          >
            <Flag className="w-6 h-6" />
          </Button>
          
          <Button
            size="lg"
            onClick={onLike}
            className="w-16 h-16 rounded-full bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}