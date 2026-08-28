import React, { useEffect } from 'react';

export interface SeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  schema?: Record<string, any>;
}

export const SeoHead: React.FC<SeoProps> = ({
  title,
  description,
  canonicalPath = '',
  image = '/images/sovereign-39-front.png',
  type = 'website',
  schema,
}) => {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title.includes('NAYAB') ? title : `${title} | NAYAB Fine Watchmaking`;
    document.title = formattedTitle;

    // Helper to update or create meta tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [key, name] = selector.replace(/[\[\]"']/g, '').split('=');
        if (key && name) {
          element.setAttribute(key, name);
          document.head.appendChild(element);
        }
      }
      element.setAttribute(attr, value);
    };

    // 2. Meta description & OG
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', formattedTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'content', type);
    
    const fullImageUrl = image.startsWith('http') ? image : `https://nayabwatches.com${image.startsWith('/') ? '' : '/'}${image}`;
    setMeta('meta[property="og:image"]', 'content', fullImageUrl);

    const fullUrl = `https://nayabwatches.com${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`;
    setMeta('meta[property="og:url"]', 'content', fullUrl);
    setMeta('meta[name="twitter:title"]', 'content', formattedTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', fullImageUrl);

    // 3. Update Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullUrl);

    // 4. Inject or Update JSON-LD Page Schema
    const scriptId = 'page-json-ld';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema, null, 2);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up dynamic schema when unmounting page if necessary
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [title, description, canonicalPath, image, type, schema]);

  return null;
};
