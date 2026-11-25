"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '../../actions';
import {
  Plus,
  Layout,
  AlignLeft,
  BarChart3,
  Loader2,
  Flag,
  Monitor,
  Tag,
  X,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const TAG_COLORS = [
  "bg-violet-100 text-violet-700 border-violet-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-sky-100 text-sky-700 border-sky-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-emerald-100 text-emerald-700 border-emerald-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-amber-100 text-amber-700 border-amber-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-rose-100 text-rose-700 border-rose-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-indigo-100 text-indigo-700 border-indigo-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-teal-100 text-teal-700 border-teal-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
  "bg-orange-100 text-orange-700 border-orange-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80",
];
function tagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}
import { BackButton } from '@/components/ui/back-button';

import toast from 'react-hot-toast';

type Priority = 'Low' | 'Medium' | 'High';
type HelpFieldKey = 'title' | 'description' | 'priority' | 'platform' | 'tags';

const FIELD_HELP_DATA: Record<
  HelpFieldKey,
  {
    title: string;
    purpose: string;
    examplesText: string;
    examples: string[];
    badgeLabel: string;
  }
> = {
  title: {
    title: 'Proje Adı Rehberi',
    purpose:
      'Projenin ana ekran, proje panosu ve tüm proje kartlarında en üstte görünen ana başlığıdır. Projenin ne olduğunu ilk bakışta anlatacak net ve akılda kalıcı bir isim seçmelisin.',
    examplesText: 'Kısa, anlaşılır ve projenin odak noktasını belirten başlıklar:',
    examples: ['"Yapay Zeka Destekli Ders Asistanı"', '"Akıllı Kampüs Haritası"'],
    badgeLabel: 'Kart Başlığı',
  },
  description: {
    title: 'Açıklama Rehberi',
    purpose:
      'Projenin hedefi, çözdüğü problem ve kapsamını özetleyen tanıtım metnidir. Ekip arkadaşları ve danışman öğretmenler projeyi ilk burada tanır.',
    examplesText: 'Projenin ne yaptığını ve kime hitap ettiğini 1-2 cümleyle açıkla:',
    examples: [
      '"Öğrencilerin ders notlarını özetleyen ve sınav soruları üreten web uygulaması."',
    ],
    badgeLabel: 'Özet Açıklama',
  },
  priority: {
    title: 'Proje Önceliği Rehberi',
    purpose:
      'Projenin aciliyet ve önem derecesini belirler (Düşük, Orta, Yüksek). Proje kartının sağ üst köşesinde renkli öncelik rozeti olarak görünür ve panoda sıralamada kolaylık sağlar.',
    examplesText: 'Teslim tarihine ve önem sırasına göre seçim yapabilirsin:',
    examples: ['Düşük (Yeşil)', 'Orta (Turuncu)', 'Yüksek (Kırmızı)'],
    badgeLabel: 'Öncelik Rozeti',
  },
  platform: {
    title: 'Proje Tipi Rehberi',
    purpose:
      'Projenin ana kategorisini veya kullanılan temel teknoloji/araştırma alanını gösterir. Proje kartında kategori etiketi olarak yer alır.',
    examplesText: 'Geliştirdiğin platformu veya proje türünü yazabilirsin:',
    examples: [
      '"Web Uygulaması"',
      '"Mobil Uygulama (React Native)"',
      '"TÜBİTAK 2209-A Araştırma"',
    ],
    badgeLabel: 'Kategori / Teknoloji',
  },
  tags: {
    title: 'Etiketler Rehberi',
    purpose:
      'Projenin keşfedilmesini, kategorize edilmesini ve aramalarda kolayca filtrelenmesini sağlayan anahtar kelimelerdir (virgül, boşluk veya Enter ile eklenir).',
    examplesText: 'Kullandığın teknolojileri veya konuyu etiket olarak ekle:',
    examples: ['#yapay-zeka', '#nextjs', '#mobil', '#donem-projesi'],
    badgeLabel: 'Etiket Rozetleri',
  },
};

function FieldHelpTrigger({
  field,
  activeField,
  onToggle,
}: {
  field: HelpFieldKey;
  activeField: HelpFieldKey | null;
  onToggle: (field: HelpFieldKey) => void;
}) {
  const isOpen = activeField === field;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(field);
      }}
      title="Bu alan hakkında bilgi ve kart önizlemesi"
      aria-expanded={isOpen}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer select-none ${
        isOpen
          ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-500/30'
          : 'bg-slate-100 hover:bg-violet-50 text-slate-500 hover:text-violet-600 border-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-violet-950/60 dark:text-slate-300 dark:hover:text-violet-300 dark:border-slate-700'
      }`}
    >
      <HelpCircle className="w-3.5 h-3.5" />
      <span>Rehber</span>
    </button>
  );
}

function FieldHelpPopover({
  field,
  onClose,
}: {
  field: HelpFieldKey;
  onClose: () => void;
}) {
  const info = FIELD_HELP_DATA[field];

  const highlightCls =
    'ring-2 ring-violet-500 bg-violet-500/15 dark:bg-violet-500/20 border-violet-400/80 shadow-[0_0_18px_rgba(139,92,246,0.35)]';
  const dimCls = 'opacity-65 border-transparent';

  return (
    <div className="mt-2 rounded-2xl bg-slate-50/95 dark:bg-[#0b1120] border border-violet-200 dark:border-violet-500/40 p-4 sm:p-5 shadow-xl animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between gap-2 pb-3 mb-3.5 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-violet-600/15 text-violet-600 dark:text-violet-400 border border-violet-500/25">
            <Sparkles className="w-4 h-4" />
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {info.title}
          </h4>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Rehberi kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Sol / Üst Bölüm: Metin Rehberi (Amacı + Ne Yazmalısın & Örnekler) */}
        <div className="md:col-span-6 space-y-3 text-xs leading-relaxed">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
              Amacı
            </p>
            <p className="text-slate-700 dark:text-slate-300">{info.purpose}</p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
              Ne Yazmalısın & Örnekler
            </p>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {info.examplesText}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {info.examples.map((ex, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-violet-200 font-medium text-[11px]"
                >
                  {ex}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ / Alt Bölüm: Görsel Mini Proje Kartı Taslağı (Mockup) */}
        <div className="md:col-span-6">
          <div className="rounded-xl bg-[#0f172a] border border-slate-700/80 p-3.5 text-slate-100 shadow-lg space-y-2.5 relative">
            <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-slate-800">
              <span className="font-semibold uppercase tracking-wider text-violet-300">
                Proje Kartı Önizlemesi
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/40 font-bold text-[9px]">
                ● {info.badgeLabel}
              </span>
            </div>

            {/* Üst Satır: Proje Tipi & Öncelik Rozeti */}
            <div className="flex items-center justify-between gap-2">
              <div
                className={`relative px-2 py-1 rounded-lg border transition-all ${
                  field === 'platform' ? highlightCls : dimCls
                }`}
              >
                {field === 'platform' && (
                  <span className="absolute -top-2 -left-1 px-1.5 py-0.2 rounded bg-violet-600 text-[8px] font-bold text-white shadow">
                    Proje Tipi
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-300">
                  <Monitor className="w-3 h-3 text-indigo-400" />
                  Web Uygulaması
                </span>
              </div>

              <div
                className={`relative px-2 py-1 rounded-lg border transition-all ${
                  field === 'priority' ? highlightCls : dimCls
                }`}
              >
                {field === 'priority' && (
                  <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded bg-violet-600 text-[8px] font-bold text-white shadow">
                    Öncelik
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-400/40">
                  Orta Öncelik
                </span>
              </div>
            </div>

            {/* Proje Adı */}
            <div
              className={`relative p-2 rounded-lg border transition-all ${
                field === 'title' ? highlightCls : dimCls
              }`}
            >
              {field === 'title' && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-violet-600 text-[8px] font-bold text-white shadow">
                  Proje Adı Buraya Gelir
                </span>
              )}
              <p className="text-xs font-extrabold text-white leading-snug">
                Yapay Zeka Destekli Ders Asistanı
              </p>
            </div>

            {/* Açıklama */}
            <div
              className={`relative p-2 rounded-lg border transition-all ${
                field === 'description' ? highlightCls : dimCls
              }`}
            >
              {field === 'description' && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-violet-600 text-[8px] font-bold text-white shadow">
                  Açıklama Alanı
                </span>
              )}
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                Öğrencilerin ders notlarını özetleyen ve sınav soruları üreten web uygulaması.
              </p>
            </div>

            {/* Etiketler */}
            <div
              className={`relative p-2 rounded-lg border transition-all ${
                field === 'tags' ? highlightCls : dimCls
              }`}
            >
              {field === 'tags' && (
                <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-violet-600 text-[8px] font-bold text-white shadow">
                  Etiketler
                </span>
              )}
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-violet-300 border border-slate-700">
                  #yapay-zeka
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-sky-300 border border-slate-700">
                  #nextjs
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-emerald-300 border border-slate-700">
                  #donem-projesi
                </span>
              </div>
            </div>

            {/* Alt İlerleme Çubuğu (Sabit Görsel) */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>İlerleme Durumu</span>
              <span className="font-bold text-violet-400">%0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRIORITIES: { value: Priority; activeClass: string }[] = [
  { value: 'Low',    activeClass: 'bg-emerald-500 border-emerald-500 text-white shadow-[0_4px_12px_-2px_rgba(16,185,129,0.4)]' },
  { value: 'Medium', activeClass: 'bg-orange-500  border-orange-500  text-white shadow-[0_4px_12px_-2px_rgba(249,115,22,0.4)]'  },
  { value: 'High',   activeClass: 'bg-red-500     border-red-500     text-white shadow-[0_4px_12px_-2px_rgba(239,68,68,0.4)]'   },
];

export default function NewProjectPage() {
  const [isPending, setIsPending] = useState(false);
  const [priority, setPriority] = useState<Priority>('Medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [activeHelpField, setActiveHelpField] = useState<HelpFieldKey | null>(null);
  const router = useRouter();

  const toggleHelpField = (field: HelpFieldKey) => {
    setActiveHelpField((prev) => (prev === field ? null : field));
  };

  function commitTag(raw: string) {
    const val = raw.trim().toLowerCase().slice(0, 32);
    if (val && !tags.includes(val) && tags.length < 10) setTags(t => [...t, val]);
    setTagInput('');
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      commitTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(t => t.slice(0, -1));
    }
  }

  const handleSubmit = async (formData: FormData) => {
    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      toast.error('Proje adı zorunludur.');
      return;
    }

    // Ensure client-controlled fields are always present — use exact state value, no override
    formData.set('priority', priority);
    if (!formData.get('platform')) {
      formData.set('platform', 'General');
    }
    formData.set('progress_percentage', '0');
    formData.set('tags', JSON.stringify(tags));

    setIsPending(true);
    try {
      const result = await createProject(formData);
      if (!result.success) {
        toast.error(result.error || 'Bir hata oluştu');
        return;
      }
      toast.success('Proje başarıyla oluşturuldu!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Bir hata oluştu');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-transparent p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header — doğrudan temiz sayfa arka planı üzerinde */}
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard" variant="light" />
          <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
            <Plus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Yeni Proje Başlat</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hedeflerinize doğru ilk adımı şimdi atın.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2234] border border-slate-200/80 dark:border-slate-800 shadow-xl text-slate-900 dark:text-slate-100 rounded-[2rem] p-5 sm:p-8 md:p-10 w-full relative z-10">
          <form action={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  <Layout className="w-4 h-4 text-indigo-500" /> Proje Adı
                </label>
                <FieldHelpTrigger
                  field="title"
                  activeField={activeHelpField}
                  onToggle={toggleHelpField}
                />
              </div>
              {activeHelpField === 'title' && (
                <FieldHelpPopover
                  field="title"
                  onClose={() => setActiveHelpField(null)}
                />
              )}
              <input
                name="title"
                type="text"
                placeholder="Örn: Mobil Uygulama Geliştirme"
                required
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 dark:focus:border-purple-500 transition-all shadow-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  <AlignLeft className="w-4 h-4 text-indigo-500" /> Açıklama
                </label>
                <FieldHelpTrigger
                  field="description"
                  activeField={activeHelpField}
                  onToggle={toggleHelpField}
                />
              </div>
              {activeHelpField === 'description' && (
                <FieldHelpPopover
                  field="description"
                  onClose={() => setActiveHelpField(null)}
                />
              )}
              <textarea
                name="description"
                placeholder="Projenin amacını ve hedeflerini kısaca açıklayın..."
                rows={4}
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 dark:focus:border-purple-500 transition-all shadow-sm resize-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  <Flag className="w-4 h-4 text-indigo-500" /> Proje Önceliği
                </label>
                <FieldHelpTrigger
                  field="priority"
                  activeField={activeHelpField}
                  onToggle={toggleHelpField}
                />
              </div>
              {activeHelpField === 'priority' && (
                <FieldHelpPopover
                  field="priority"
                  onClose={() => setActiveHelpField(null)}
                />
              )}
              <div className="flex gap-2">
                {PRIORITIES.map(({ value, activeClass }) => (
                  <button
                    key={value === "Low" ? "Düşük" : value === "Medium" ? "Orta" : "Yüksek"}
                    type="button"
                    onClick={() => setPriority(value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      priority === value
                        ? activeClass
                        : 'bg-white border-slate-200 text-slate-500 dark:text-slate-200 dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200 dark:text-slate-300 dark:text-slate-400 hover:border-slate-300 hover:text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {value === "Low" ? "Düşük" : value === "Medium" ? "Orta" : "Yüksek"}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform (free text) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  <Monitor className="w-4 h-4 text-indigo-500" /> Proje Tipi
                </label>
                <FieldHelpTrigger
                  field="platform"
                  activeField={activeHelpField}
                  onToggle={toggleHelpField}
                />
              </div>
              {activeHelpField === 'platform' && (
                <FieldHelpPopover
                  field="platform"
                  onClose={() => setActiveHelpField(null)}
                />
              )}
              <input
                name="platform"
                type="text"
                placeholder="Örn: React Native, Next.js, REST API..."
                className="w-full  px-5 py-4 rounded-2xl bg-white dark:bg-[#0f172a] dark:bg-[#0f172a] dark:bg-[#0f172a] dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 border border-slate-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  <Tag className="w-4 h-4 text-indigo-500" /> Etiketler <span className="text-slate-400 font-normal">(isteğe bağlı)</span>
                </label>
                <FieldHelpTrigger
                  field="tags"
                  activeField={activeHelpField}
                  onToggle={toggleHelpField}
                />
              </div>
              {activeHelpField === 'tags' && (
                <FieldHelpPopover
                  field="tags"
                  onClose={() => setActiveHelpField(null)}
                />
              )}
              <div
                className="w-full  min-h-[52px] px-3 py-2.5 rounded-2xl bg-white dark:bg-[#0f172a] dark:bg-[#0f172a] dark:bg-[#0f172a] dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl dark:text-slate-100 dark:border-slate-800 border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-300 transition-all flex flex-wrap gap-1.5 items-center shadow-sm cursor-text dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
                onClick={() => document.getElementById('tag-input')?.focus()}
              >
                {tags.map(tag => (
                  <span key={tag} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tagColor(tag)}`}>
                    #{tag}
                    <button type="button" onClick={() => setTags(t => t.filter(x => x !== tag))} className="opacity-60 hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length < 10 && (
                  <input
                    id="tag-input"
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value.slice(0, 32))}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => { if (tagInput) commitTag(tagInput); }}
                    placeholder={tags.length === 0 ? "nextjs, react, api… (virgül veya Enter ile ekle)" : ""}
                    className="flex-1 min-w-[140px] outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 bg-transparent py-0.5"
                  />
                )}
              </div>
              <p className="text-xs text-slate-400 ml-1">Virgül, boşluk veya Enter ile ayırın. Maksimum 10 etiket.</p>
            </div>

            {/* Progress — auto-calculated */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/70">
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-600 dark:text-slate-300 leading-snug">
                <span className="font-semibold">İlerleme otomatik olarak hesaplanır</span>; tamamlanan aşamalara göre güncellenir. Projeyi oluşturduktan sonra aşamalar ekleyebilirsiniz.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full  flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 dark:text-slate-200 dark:text-slate-300 dark:text-slate-400 text-white font-bold rounded-2xl transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] active:scale-95 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Hazırlanıyor...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Proje Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
