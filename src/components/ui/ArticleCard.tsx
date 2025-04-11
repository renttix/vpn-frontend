import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface ArticleProps {
  id: string;
  title: string;
  slug: string;
  category?: string;
  categorySlug?: string;
  tag?: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  author?: string;
  authorSlug?: string;
  authorImageUrl?: string;
  isFeature?: boolean;
  isOpinion?: boolean;
  isExclusive?: boolean;
}

export default function ArticleCard({
  title,
  slug,
  category,
  categorySlug,
  tag,
  excerpt,
  imageUrl,
  imageAlt = "Article Image",
  author,
  authorSlug,
  isFeature = false,
  isOpinion = false,
  isExclusive = false,
}: ArticleProps) {
  return (
    <article className={`group relative ${isFeature ? 'h-full' : ''}`}>
      {/* Image Container */}
      {imageUrl && (
        <Link href={`/${slug}`} className="block overflow-hidden">
          <div className={`relative ${isFeature ? 'aspect-[1200/630]' : 'aspect-[1200/630]'} overflow-hidden`}>
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-105"
              priority={isFeature}
            />
          </div>
          {tag && (
            <span className="absolute top-0 left-0 bg-vpn-red text-white text-xs px-2 py-1 uppercase font-bold font-body">
              {tag}
            </span>
          )}
        </Link>
      )}

      {/* Text Content */}
      <div className={`mt-3 ${isFeature ? 'px-1' : ''}`}>
        {category && (
          <Link
            href={`/${categorySlug}`}
            className="uppercase text-xs font-bold font-body text-vpn-blue dark:text-blue-400 mb-1 block"
          >
            {category}
          </Link>
        )}

        <Link href={`/${slug}`} className="group">
          <h2
            className={`font-heading font-bold text-vpn-gray dark:text-gray-100 ${
              isFeature
                ? 'text-xl md:text-2xl lg:text-3xl leading-tight'
                : 'text-base md:text-lg leading-tight'
            } group-hover:text-vpn-blue dark:group-hover:text-yellow-500 mb-2 transition-colors duration-200`}
          >
            {title}
          </h2>
        </Link>

        {excerpt && (
          <p className="font-body text-vpn-gray dark:text-gray-300 text-sm my-2">{excerpt}</p>
        )}

        {/* Author display removed and replaced with category tag if available */}
        {category && !categorySlug && (
          <span className="font-body text-xs text-vpn-gray dark:text-gray-400 mt-2 inline-block">
            {category}
          </span>
        )}
      </div>
    </article>
  );
}
