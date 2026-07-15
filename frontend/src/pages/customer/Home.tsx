import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Award, ShieldAlert, Sparkles, BookOpen, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useStorefront } from '../../context/TenantContext';
import { useSettings } from '../../context/SettingsContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { path } = useStorefront();
  const { settings } = useSettings();

  const highlights = (settings?.platformHighlights || 'Organic Beans, Artisanal Brewing, Cozy Atmosphere, Fresh Pastries')
    .split(',')
    .map((s: string) => s.trim());

  return (
    <div className="bg-[#0a1316] text-left">
      {/* Premium Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center overflow-hidden border-b border-tastyc-copper/10"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 19, 22, 0.75), rgba(10, 19, 22, 0.95)), url('${
            settings?.homeBannerImage || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1600'
          }')`
        }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <p className="text-tastyc-copper font-medium tracking-[0.25em] uppercase text-xs sm:text-sm">
            {settings?.coffeeHouseCaption || 'Beyond POS. Complete Restaurant Operations.'}
          </p>
          <h1 className="font-title text-5xl sm:text-7xl lg:text-8xl tracking-wider text-white leading-tight uppercase">
            {settings?.homeBannerTitle || 'Tastyc Coffee House'}
          </h1>
          <p className="text-[#a9b8c3] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {settings?.homeBannerSubtitle || 'Welcome to Tastyc, where barista craft meets luxury dining.'}
          </p>
          <div className="pt-6 flex justify-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(path('/menu'))}
              className="btn-premium px-8 text-xs uppercase tracking-widest font-bold font-body"
            >
              Explore Menu
            </button>
            <button
              onClick={() => navigate(path('/reservations'))}
              className="px-8 py-3 border border-tastyc-copper/40 text-tastyc-copper text-xs uppercase tracking-widest font-bold hover:bg-tastyc-copper/10"
            >
              Book a Table
            </button>
          </div>
        </div>

        {/* Ambient Decorative Accents */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a1316] to-transparent pointer-events-none" />
      </section>

      {/* Story & Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <span className="h-[1px] w-8 bg-tastyc-copper" />
              <span className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Our Story</span>
            </div>
            <h2 className="font-title text-4xl sm:text-5xl uppercase tracking-wider text-white leading-tight">
              {settings?.ourStoryTitle || 'Crafting Premium Moments, One Shot At A Time'}
            </h2>
            <p className="text-[#a9b8c3] text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {settings?.ourStoryContent || 'At Tastyc, we combine classical Italian traditions with modern digital operations.'}
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate(path('/menu'))}
                className="flex items-center space-x-2 text-tastyc-copper hover:text-tastyc-copperLight transition-colors font-medium text-sm tracking-wider uppercase"
              >
                <BookOpen className="h-4 w-4" />
                <span>Open Digital Menu</span>
              </button>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-tastyc-copper/30 to-amber-600/30 rounded-lg blur opacity-30" />
            <img
              src={settings?.ourStoryImage || 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800'}
              alt="Barista making coffee"
              className="relative rounded-lg shadow-2xl border border-tastyc-copper/10 w-full object-cover h-[450px]"
            />
          </div>
        </div>
      </section>

      {/* Features Showcase Grid */}
      <section className="bg-[#121e22] border-y border-tastyc-copper/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          <div className="space-y-4">
            <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">
              {settings?.highlightsDescription || 'Platform Highlights'}
            </p>
            <h2 className="font-title text-3xl sm:text-5xl uppercase text-white tracking-widest">
              {settings?.highlightsTitle || 'Engineered For Excellence'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {highlights.map((hl: string, index: number) => {
              const icons = [Coffee, Sparkles, Award, ShieldAlert];
              const Icon = icons[index % icons.length];
              return (
                <div key={index} className="bg-[#0a1316] border border-tastyc-copper/10 p-8 rounded-lg hover:border-tastyc-copper/40 transition-all duration-300 group">
                  <div className="h-12 w-12 bg-tastyc-copper/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-tastyc-copper/20 transition-all">
                    <Icon className="h-5 w-5 text-tastyc-copper" />
                  </div>
                  <h3 className="font-title text-lg uppercase tracking-wider text-white mb-2">
                    {hl}
                  </h3>
                  <p className="text-[#a9b8c3] text-xs leading-relaxed">
                    Premium restaurant offering customized to deliver absolute freshness and satisfaction.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hours & Location Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="h-[1px] w-8 bg-tastyc-copper" />
                <span className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Visit Us</span>
              </div>
              <h2 className="font-title text-4xl uppercase tracking-wider text-white leading-tight">
                Hours & Location
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-tastyc-copper">
                  <Clock className="h-4 w-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Hours of Service</span>
                </div>
                <p className="text-[#a9b8c3] text-sm leading-relaxed whitespace-pre-line pl-6">
                  {settings?.hoursOfService || 'Monday - Friday: 7:00 AM - 9:00 PM\nSaturday - Sunday: 8:00 AM - 10:00 PM'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-tastyc-copper">
                  <MapPin className="h-4 w-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Address</span>
                </div>
                <p className="text-[#a9b8c3] text-sm leading-relaxed pl-6">
                  {settings?.findUsAddress || '123 Luxury Lounge Blvd, CA 90210'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-tastyc-copper">
                  <Phone className="h-4 w-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Phone</span>
                </div>
                <p className="text-[#a9b8c3] text-sm pl-6">
                  {settings?.findUsPhone || '+1 (555) 123-4567'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-tastyc-copper">
                  <Mail className="h-4 w-4" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Email</span>
                </div>
                <p className="text-[#a9b8c3] text-sm pl-6">
                  {settings?.findUsEmail || 'hello@tastyc.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Google Map Embedding */}
          <div className="relative h-[320px] border border-tastyc-copper/10 rounded-lg overflow-hidden bg-tastyc-dark/20">
            {settings?.findUsMapUrl ? (
              <iframe
                src={settings.findUsMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                title="Google Maps Location"
                className="grayscale invert opacity-80"
              ></iframe>
            ) : (
              <div className="h-full flex items-center justify-center text-[#a9b8c3]/40 text-xs uppercase tracking-widest font-semibold">
                Google Map Not Integrated
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
