const fs = require('fs');

let content = fs.readFileSync('src/components/HomeScreen.tsx', 'utf8');

// Replace the state initialization to ensure it safely reads from localStorage AFTER mount
const stateUpdate = `  const [customBannerImage, setCustomBannerImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedImage = localStorage.getItem('custom_banner_image');
      if (savedImage) {
        setCustomBannerImage(savedImage);
      }
    } catch (e) {
      console.error("Error reading from localStorage", e);
    }
  }, []);`;

content = content.replace(/  const \[customBannerImage, setCustomBannerImage\] = useState<string \| null>\(localStorage\.getItem\('custom_banner_image'\)\);/, stateUpdate);

fs.writeFileSync('src/components/HomeScreen.tsx', content);
console.log("Patched localStorage reading");
