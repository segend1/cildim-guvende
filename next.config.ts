import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Sebamed
      {
        protocol: 'https',
        hostname: 'www.sebamed.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'sebamed.com.tr',
      },
      // Nivea
      {
        protocol: 'https',
        hostname: 'www.nivea.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'nivea.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'img.nivea.com',
      },
      // La Roche Posay
      {
        protocol: 'https',
        hostname: 'laroche-posay.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'www.laroche-posay.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'media-pierre-fabre.wedia-group.com',
      },
      // CeraVe
      {
        protocol: 'https',
        hostname: 'www.cerave.com.tr',
      },
      // Vichy
      {
        protocol: 'https',
        hostname: 'www.vichy.com.tr',
      },
      // Eucerin
      {
        protocol: 'https',
        hostname: 'www.eucerin.com.tr',
      },
      // Avene
      {
        protocol: 'https',
        hostname: 'www.avene.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'avene.com.tr',
      },
      // Neutrogena
      {
        protocol: 'https',
        hostname: 'www.neutrogena.com.tr',
      },
      // Duaderm
      {
        protocol: 'https',
        hostname: 'www.duaderm.com.tr',
      },
      // Dermokil
      {
        protocol: 'https',
        hostname: 'dermokil.com',
      },
      // Haruharu Wonder
      {
        protocol: 'https',
        hostname: 'haruharuwonder.com',
      },
      // OH K! Life
      {
        protocol: 'https',
        hostname: 'ohklife.com',
      },
      // SNP Beauty
      {
        protocol: 'https',
        hostname: 'snpbeauty.com',
      },
      // The Purest Solutions
      {
        protocol: 'https',
        hostname: 'thepurestsolutions.com',
      },
      // Contentful CDN
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
  },
};

export default nextConfig;
