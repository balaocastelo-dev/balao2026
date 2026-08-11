"use client";

import { useEffect, useState } from "react";
import { Instagram, ExternalLink, Heart, MessageCircle } from "lucide-react";
import Image from "next/image";

interface InstaPost {
  id: string;
  permalink: string;
  media_url: string;
  caption?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstaPost[]>([]);
  const [loading, setLoading] = useState(true);

  const PROFILE_URL = "https://www.instagram.com/balaodainformatica_castelo/";

  useEffect(() => {
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setPosts(data.slice(0, 5));
        }
      })
      .catch((err) => console.error("Failed to fetch instagram feed", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8 animate-pulse">
        <div className="h-8 bg-gray-200 w-64 mb-6 rounded mx-auto lg:mx-0"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-6">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5 rounded-full">
            <div className="bg-white p-1 rounded-full">
                <Instagram className="text-black" size={16} />
            </div>
        </div>
        <div>
            <h2 className="text-sm font-bold text-gray-800">Siga-nos</h2>
            <a 
                href={PROFILE_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-[#E60012] transition-colors block -mt-0.5"
            >
                @balaodainformatica_castelo
            </a>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink || PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all"
          >
            {post.media_url ? (
                <div className="relative w-full h-full">
                   <img 
                        src={post.media_url} 
                        alt={post.caption || "Instagram Post"}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.classList.add('bg-gray-200', 'flex', 'items-center', 'justify-center');
                        }}
                   />
                   {/* Fallback Icon displayed via CSS/JS logic if img hidden, or just overlay */}
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                    <Instagram size={48} />
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white backdrop-blur-[2px]">
                {post.like_count !== undefined && (
                    <div className="flex items-center gap-1 font-bold">
                        <Heart size={20} className="fill-white" />
                        <span>{post.like_count}</span>
                    </div>
                )}
                {post.comments_count !== undefined && (
                    <div className="flex items-center gap-1 font-bold">
                        <MessageCircle size={20} className="fill-white" />
                        <span>{post.comments_count}</span>
                    </div>
                )}
                {!post.like_count && !post.comments_count && (
                    <span className="font-medium flex items-center gap-2">
                        <Instagram size={20} /> Ver Post
                    </span>
                )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
