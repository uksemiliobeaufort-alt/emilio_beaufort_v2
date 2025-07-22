// pages/sitemap.xml.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getAllBlogs() {
  const snapshot = await getDocs(collection(db, "blog_posts"));

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      slug: data.slug,
      updatedAt: data.updatedAt?.toDate() || new Date(),
      featuredImage: data.featuredImage || null,
    };
  });
}

function generateSiteMap(posts) {
  const baseUrl = "https://www.emiliobeaufort.com";

  const staticPages = [
    "",
    "/about",
    "/products",
    "/journal",
    "/partnerships",
    "/careers",
    "/waitlist",
    "/philosophy",
    "/privacy-policy",
  ];

  const staticUrls = staticPages
    .map(
      (path) => `
    <url>
      <loc>${baseUrl}${path}</loc>
      <changefreq>${
        path === "" || path === "/products" || path === "/journal"
          ? "weekly"
          : "monthly"
      }</changefreq>
      <priority>${path === "" ? "1.0" : path === "/products" ? "0.9" : "0.8"}</priority>
    </url>`
    )
    .join("");

  const blogUrls = posts
    .map(
      (post) => `
    <url>
      <loc>${baseUrl}/journal/${post.slug}</loc>
      <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
      ${
        post.featuredImage
          ? `<image:image>
              <image:loc>${post.featuredImage}</image:loc>
              <image:caption>${post.slug}</image:caption>
            </image:image>`
          : ""
      }
    </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${staticUrls}
    ${blogUrls}
  </urlset>`;
}

export async function getServerSideProps({ res }) {
  const blogs = await getAllBlogs();
  const sitemap = generateSiteMap(blogs);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
