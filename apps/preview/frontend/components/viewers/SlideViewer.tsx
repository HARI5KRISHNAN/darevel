import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Layout } from 'lucide-react';
import { SlideData } from '../../types';

interface SlideViewerProps {
  slides?: SlideData[];
  isLoading: boolean;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ slides, isLoading }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides?.length]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        <Layout className="animate-pulse mr-2" /> Fetching slides...
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400">
        No slide preview available yet.
      </div>
    );
  }

  const currentSlide = slides[activeIndex];

  return (
    <div className="h-full flex">
      <aside className="w-64 border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar p-4 space-y-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => setActiveIndex(index)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              index === activeIndex ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">Slide {slide.id}</p>
            <p className="text-sm font-semibold text-slate-700 truncate">{slide.title}</p>
          </button>
        ))}
      </aside>

      <div className="flex-1 flex flex-col bg-slate-100">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl aspect-video overflow-hidden">
            <div className="h-full w-full flex">
              <div className="flex-1 p-10">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-4">Slide {currentSlide.id}</p>
                <h2 className="text-3xl font-bold text-slate-800 mb-6">{currentSlide.title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed">{currentSlide.content}</p>
              </div>
              <div className="w-1/2 bg-slate-900/5 flex items-center justify-center">
                <img src={currentSlide.imageUrl} alt={currentSlide.title} className="max-w-full max-h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-20 border-t border-slate-200 bg-white px-8 flex items-center justify-between">
          <button
            onClick={() => setActiveIndex(prev => Math.max(prev - 1, 0))}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
            disabled={activeIndex === 0}
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          <p className="text-sm text-slate-500">
            Slide {activeIndex + 1} of {slides.length}
          </p>
          <button
            onClick={() => setActiveIndex(prev => Math.min(prev + 1, slides.length - 1))}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-200 disabled:opacity-50"
            disabled={activeIndex === slides.length - 1}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideViewer;
