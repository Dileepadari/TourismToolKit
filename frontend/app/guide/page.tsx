'use client';

import type { CultureTipsData, EmergencyContactsData } from '@/graphql/types';
import { useQuery } from '@apollo/client/react';
import { motion } from 'motion/react';
import { 
  AlertCircle, 
  Phone, 
  Users, 
  Lightbulb, 
  Utensils, 
  Camera, 
  Train, 
  Heart,
  Shield,
  Info,
  Calendar,
  MessageCircle,
  Siren,
  Cross,
  Flame,
  HelpCircle,
  User,
  Baby,
  AlertTriangle,
  Plane,
  Navigation
} from 'lucide-react';
import { useState } from 'react';
import PageWrapper from '@/components/PageWrapper';
import { GET_EMERGENCY_CONTACTS, GET_CULTURE_TIPS } from '@/graphql/queries';
import { LucideIcon } from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  greeting: Users,
  food: Utensils,
  clothing: Heart,
  etiquette: Shield,
  customs: Info,
  photography: Camera,
  transportation: Train,
  health: AlertCircle,
  festivals: Calendar,
  language: MessageCircle,
};

// Flat category tints drawn from the palette rather than a rainbow of
// saturated hues. Written out in full so Tailwind's scanner can see them.
const categoryColors: Record<string, string> = {
  greeting: 'bg-indigo-ink-600',
  food: 'bg-clay-600',
  clothing: 'bg-clay-500',
  etiquette: 'bg-verdigris-600',
  customs: 'bg-ochre-600',
  photography: 'bg-indigo-ink-500',
  transportation: 'bg-verdigris-500',
  health: 'bg-clay-700',
  festivals: 'bg-ochre-500',
  language: 'bg-verdigris-700',
};

const serviceTypeIcons: Record<string, LucideIcon> = {
  police: Siren,
  medical: Cross,
  fire: Flame,
  tourist_helpline: HelpCircle,
  women_helpline: User,
  child_helpline: Baby,
  disaster: AlertTriangle,
  railway: Train,
  airport: Plane,
};

interface EmergencyContact {
  id: number;
  serviceType: string;
  number: string;
  description?: string | null;
}

interface CultureTip {
  id: number;
  tipCategory: string;
  tipText: string;
}

export default function GuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: emergencyData, loading: emergencyLoading } = useQuery<EmergencyContactsData>(GET_EMERGENCY_CONTACTS, {
    variables: { country: 'India' },
  });

  const { data: cultureData, loading: cultureLoading } = useQuery<CultureTipsData>(GET_CULTURE_TIPS, {
    variables: {
      country: 'India',
      language: 'en',
      category: selectedCategory,
      limit: selectedCategory ? 10 : 50,
    },
  });

  const emergencyContacts: EmergencyContact[] = emergencyData?.getEmergencyContacts ?? [];
  const cultureTips: CultureTip[] = cultureData?.getCultureTips ?? [];

  // Group culture tips by category
  const groupedTips = cultureTips.reduce<Record<string, CultureTip[]>>((acc, tip) => {
    (acc[tip.tipCategory] ??= []).push(tip);
    return acc;
  }, {});

  // Get unique categories
  const categories = Object.keys(groupedTips).sort();

  // Group emergency contacts by service type
  const groupedEmergency = emergencyContacts.reduce<Record<string, EmergencyContact[]>>((acc, contact) => {
    (acc[contact.serviceType] ??= []).push(contact);
    return acc;
  }, {});

  return (
    <PageWrapper tinted={false}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Travel Guide for India
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Essential cultural insights, safety tips, and emergency contacts for exploring India
          </p>
        </motion.div>

          {/* Emergency Contacts Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Emergency Contacts</h2>
                <p className="text-muted-foreground">Important numbers for emergencies and assistance</p>
              </div>
            </div>

            {emergencyLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-32 bg-card rounded-xl animate-pulse border border-border" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedEmergency).map(([serviceType, contacts]) => {
                  const IconComponent = serviceTypeIcons[serviceType] || Phone;
                  return (
                    <motion.div
                      key={serviceType}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg capitalize text-card-foreground">
                            {serviceType.replace(/_/g, ' ')}
                          </h3>
                          <div className="space-y-2 mt-2">
                            {contacts.map((contact) => (
                              <div key={contact.id} className="text-sm">
                                <a
                                  href={`tel:${contact.number}`}
                                  className="font-mono text-primary hover:underline font-bold text-base">
                                  {contact.number}
                                </a>
                                {contact.description && (
                                  <p className="text-muted-foreground text-xs mt-1">
                                    {contact.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Cultural Tips Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Cultural Tips & Etiquette</h2>
                <p className="text-muted-foreground">Learn about Indian customs and traditions</p>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  !selectedCategory
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card text-card-foreground border border-border hover:border-primary'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => {
                const Icon = categoryIcons[category] || Info;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-card text-card-foreground border border-border hover:border-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                );
              })}
            </div>

            {cultureLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-40 bg-card rounded-xl animate-pulse border border-border" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedTips).map(([category, tips]) => {
                  const Icon = categoryIcons[category] || Info;
                  const categoryTint = categoryColors[category] ?? 'bg-muted-foreground';

                  return (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      <div className={`${categoryTint} p-4 text-white`}>
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6" />
                          <h3 className="text-xl font-bold capitalize">
                            {category.replace(/_/g, ' ')}
                          </h3>
                        </div>
                      </div>
                      <div className="p-5 space-y-4 bg-card">
                        {tips.map((tip) => (
                          <div key={tip.id} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <p className="text-sm leading-relaxed text-card-foreground">{tip.tipText}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Quick Tips */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16 bg-muted rounded-2xl p-8 border border-primary/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-foreground">
              <Navigation className="w-6 h-6 text-primary" />
              Quick Travel Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p><strong>Best Time to Visit:</strong> October to March for pleasant weather</p>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p><strong>Currency:</strong> Indian Rupee (₹). Cards widely accepted in cities</p>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p><strong>Visa:</strong> E-visa available for most countries. Check eligibility</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p><strong>Connectivity:</strong> SIM cards available at airports. Jio & Airtel recommended</p>
              </div>
            </div>
          </motion.section>
        </div>
    </PageWrapper>
  );
}
