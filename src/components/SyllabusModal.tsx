'use client';

import React, { useState, useMemo } from 'react';
import { ABES_SYLLABUS } from '@/lib/syllabus-data';
import { SyllabusSubject } from '@/lib/types';
import { getSubjectShortform } from '@/lib/data-service';
import { 
  X, 
  BookOpen, 
  Search, 
  CheckCircle2, 
  GraduationCap, 
  Layers, 
  Bookmark, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface SyllabusModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSemester?: number;
  initialSubjectId?: string;
  branchCode?: string;
}

export const SyllabusModal: React.FC<SyllabusModalProps> = ({
  isOpen,
  onClose,
  initialSemester = 3,
  initialSubjectId,
  branchCode = 'CSE',
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(initialSemester);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // All 2nd year subjects for selected semester
  const semesterSubjects = useMemo(() => {
    return ABES_SYLLABUS.filter((s) => s.semester === selectedSemester);
  }, [selectedSemester]);

  const [selectedSubId, setSelectedSubId] = useState<string>(() => {
    if (initialSubjectId) {
      const found = ABES_SYLLABUS.find(
        (s) => s.id === initialSubjectId || s.code === initialSubjectId || getSubjectShortform(s) === getSubjectShortform(initialSubjectId)
      );
      if (found) return found.id;
    }
    return semesterSubjects[0]?.id || 's-25cs301';
  });

  // Sync when semester changes
  React.useEffect(() => {
    if (semesterSubjects.length > 0 && !semesterSubjects.some((s) => s.id === selectedSubId)) {
      setSelectedSubId(semesterSubjects[0].id);
    }
  }, [semesterSubjects, selectedSubId]);

  const currentSubject: SyllabusSubject = useMemo(() => {
    return ABES_SYLLABUS.find((s) => s.id === selectedSubId) || semesterSubjects[0] || ABES_SYLLABUS[0];
  }, [selectedSubId, semesterSubjects]);

  // Filter topics in current subject if search query present
  const filteredUnits = useMemo(() => {
    if (!currentSubject?.units) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return currentSubject.units;

    return currentSubject.units.map((unit) => {
      const matchName = unit.unitName.toLowerCase().includes(q);
      const matchingTopics = unit.topics.filter((t) => t.toLowerCase().includes(q));
      if (matchName || matchingTopics.length > 0) {
        return {
          ...unit,
          topics: matchName ? unit.topics : matchingTopics,
        };
      }
      return null;
    }).filter(Boolean) as typeof currentSubject.units;
  }, [currentSubject, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-5 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-[28px] bg-white shadow-2xl overflow-hidden border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="apple-eyebrow text-emerald-700">Official Curriculum</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  2nd Year (B.Tech)
                </span>
              </div>
              <h2 className="text-lg font-bold text-zinc-950">
                2nd Year Academic Syllabus · {branchCode}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="apple-icon-button"
            title="Close syllabus"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Top Controls: Semester Picker & Search */}
        <div className="border-b border-zinc-100 bg-white px-6 py-3.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Semester Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedSemester(3)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedSemester === 3
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                Semester 3 (3rd Sem)
              </button>
              <button
                onClick={() => setSelectedSemester(4)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedSemester === 4
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                Semester 4 (4th Sem)
              </button>
            </div>

            {/* Quick Search in Syllabus */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics / units..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Subject Pills Slider */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {semesterSubjects.map((sub) => {
              const short = getSubjectShortform(sub);
              const isSelected = sub.id === currentSubject?.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <span>{short}</span>
                  {sub.credits && (
                    <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                      {sub.credits}C
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Syllabus Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {currentSubject && (
            <div>
              {/* Subject Title Banner */}
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        {getSubjectShortform(currentSubject)}
                      </span>
                      {currentSubject.credits && (
                        <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">
                          {currentSubject.credits} Credits · 5 Units
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-zinc-950">
                      {currentSubject.name}
                    </h3>
                  </div>

                  <Link
                    href="/planner"
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-sm transition hover:bg-emerald-50 self-start sm:self-auto"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    Open in Study Planner
                  </Link>
                </div>
              </div>

              {/* 5 Units List */}
              <div className="mt-5 space-y-4">
                {filteredUnits.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-zinc-200 py-12 text-center text-zinc-400">
                    <BookOpen className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
                    <p className="text-sm font-semibold text-zinc-600">No matching topics found in this subject</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Try clearing your search query</p>
                  </div>
                ) : (
                  filteredUnits.map((unit) => (
                    <div 
                      key={unit.unitNumber}
                      className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-center gap-3 border-b border-zinc-100 pb-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 font-bold text-emerald-700 text-xs shrink-0">
                          U{unit.unitNumber}
                        </div>
                        <h4 className="text-sm font-bold text-zinc-900">
                          Unit {unit.unitNumber}: {unit.unitName}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {unit.topics.map((topic, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2 rounded-xl bg-zinc-50/70 p-2.5 border border-zinc-100 text-xs text-zinc-700"
                          >
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Practical Experiments / Lab Modules if applicable */}
              {currentSubject.experiments && currentSubject.experiments.length > 0 && (
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center gap-1.5">
                    <Bookmark className="h-3.5 w-3.5 text-emerald-600" /> Lab Experiments & Practical Modules
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-600 pl-4 list-disc">
                    {currentSubject.experiments.map((exp, idx) => (
                      <li key={idx} className="leading-relaxed">{exp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes / Special Notice */}
              {currentSubject.notesNotice && (
                <div className="mt-6 rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    💡 {currentSubject.notesNotice}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/80 px-6 py-3">
          <p className="text-xs text-zinc-400">
            AKTU / ABES Engineering College 2nd Year Curriculum
          </p>
          <button
            onClick={onClose}
            className="apple-secondary-button text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
