'use client';

import { Settings as SettingsIcon, Store, Bell, Shield, Palette, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
  const sections = [
    { icon: Store, label: 'Shop Information', desc: 'Manage your shop name, address, and contact details.' },
    { icon: Bell, label: 'Notifications', desc: 'Configure stock alerts and daily sales reports.' },
    { icon: Shield, label: 'Security', desc: 'Manage staff accounts and permissions.' },
    { icon: Palette, label: 'Appearance', desc: 'Customize the look and feel of your POS interface.' },
    { icon: HelpCircle, label: 'Help & Support', desc: 'Access documentation and contact support.' },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure your POS system preferences</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        {sections.map((section, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors text-left group"
          >
            <div className="bg-slate-100 text-slate-600 p-3 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
              <section.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">{section.label}</h3>
              <p className="text-sm text-slate-500">{section.desc}</p>
            </div>
            <div className="text-slate-300 group-hover:text-slate-500">
              <SettingsIcon size={20} />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-blue-900">System Version</h4>
          <p className="text-sm text-blue-700">VoguePOS v2.4.0 (Latest)</p>
        </div>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors">
          Check for Updates
        </button>
      </div>
    </div>
  );
}
