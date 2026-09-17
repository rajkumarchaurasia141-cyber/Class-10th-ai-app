const fs = require('fs');

let content = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');

const regex = /const banners = \[\s*\{[^}]+\},\s*\{[^}]+\},\s*\{[^}]+\}\s*\];/;

const newBanners = `const banners = [
    {
      title: "बिहार बोर्ड 10वीं टॉपर बैच 2026",
      subtitle: "संपूर्ण तैयारी",
      bg: "bg-gradient-to-r from-blue-600 to-indigo-600",
      image: "🎓",
      customImgUrl: "https://i.ibb.co/qF4jJdbN/Whats-App-Image-2025-03-05-at-00-58-15-e204c965.jpg" // Using your actual photo link here
    },
    {
      title: "चैप्टर-वाइज 50 MCQs डेली टेस्ट सीरीज़",
      subtitle: "लाइव",
      bg: "bg-gradient-to-r from-emerald-600 to-teal-600",
      image: "📝"
    },
    {
      title: "100% NCERT सटीक नोट्स",
      subtitle: "+ वीडियो लेक्चर्स",
      bg: "bg-gradient-to-r from-rose-600 to-pink-600",
      image: "📚"
    }
  ];`;

content = content.replace(regex, newBanners);

const renderRegex = /<div className="text-6xl sm:text-7xl opacity-90 drop-shadow-lg scale-110">\s*\{banner\.image\}\s*<\/div>/;

const newRender = `{banner.customImgUrl ? (
              <img src={banner.customImgUrl} alt={banner.title} className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-full border-4 border-white/20 shadow-xl right-0 absolute mr-4" />
            ) : (
              <div className="text-6xl sm:text-7xl opacity-90 drop-shadow-lg scale-110">
                {banner.image}
              </div>
            )}`;

content = content.replace(renderRegex, newRender);

// Modify the max-width of text so it doesn't overlap the image
content = content.replace(/<div className="flex flex-col justify-center h-full max-w-\[70%\]">/, '<div className="flex flex-col justify-center h-full max-w-[65%] sm:max-w-[70%] z-20">');

fs.writeFileSync('src/components/HomeScreen.tsx', content);
console.log("Banner patched successfully.");
