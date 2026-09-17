const fs = require('fs');

let content = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');

// 1. Add state for custom image in HomeScreen
const stateInsert = `  // Auto-Sliding Banner State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customBannerImage, setCustomBannerImage] = useState<string | null>(localStorage.getItem('custom_banner_image'));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomBannerImage(base64String);
        localStorage.setItem('custom_banner_image', base64String);
      };
      reader.readAsDataURL(file);
    }
  };
`;

content = content.replace(/  \/\/ Auto-Sliding Banner State\n  const \[currentSlide, setCurrentSlide\] = useState\(0\);/, stateInsert);

// 2. Update the banner image rendering logic
const renderRegex = /\{banner\.customImgUrl \? \([\s\S]*?\) : \([\s\S]*?\{banner\.image\}\s*<\/div>\s*\)\}/;

const newRender = `{index === 0 ? (
              <div className="relative z-20 mr-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  id="banner-upload" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <label htmlFor="banner-upload" className="cursor-pointer group/img relative block">
                  {customBannerImage ? (
                    <img src={customBannerImage} alt="Profile" className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-full border-4 border-white/20 shadow-xl" />
                  ) : (
                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white/20 shadow-xl bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center hover:bg-white/20 transition-colors">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white/80 mb-1" />
                      <span className="text-[10px] sm:text-xs text-white/80 font-medium">Add Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="text-6xl sm:text-7xl opacity-90 drop-shadow-lg scale-110">
                {banner.image}
              </div>
            )}`;

content = content.replace(renderRegex, newRender);

fs.writeFileSync('src/components/HomeScreen.tsx', content);
console.log("Custom upload banner patched successfully.");
