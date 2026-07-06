import React, { useState } from 'react';
import { DepartmentUser } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Phone, X, CheckSquare, Square, UserCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface GroupCallModalProps {
  contacts: DepartmentUser[];
  onCall: (selectedContacts: DepartmentUser[]) => void;
  onCancel: () => void;
}

export default function GroupCallModal({ contacts, onCall, onCancel }: GroupCallModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleContact = (email: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelected(newSelected);
  };

  const handleCall = () => {
    const selectedContacts = contacts.filter(c => selected.has(c.email));
    if (selectedContacts.length > 0) {
      onCall(selectedContacts);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="bg-[#18181b] border-white/10 w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-sky-400" />
            Start Group Call
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2 custom-scrollbar">
          {contacts.map(contact => {
            const isSelected = selected.has(contact.email);
            return (
              <div 
                key={contact.email} 
                onClick={() => toggleContact(contact.email)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-sky-500/10 border border-sky-500/30' : 'bg-white/5 border border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {contact.avatarUrl ? (
                      <img src={contact.avatarUrl} alt={contact.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="w-6 h-6 text-white/50" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{contact.displayName}</div>
                    <div className="text-xs text-white/50">{contact.roleId.replace('_', ' ').toUpperCase()}</div>
                  </div>
                </div>
                <div>
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-sky-400" />
                  ) : (
                    <Square className="w-5 h-5 text-white/30" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 bg-[#09090b]/50 flex justify-between items-center">
          <span className="text-sm text-white/50">{selected.size} selected</span>
          <Button 
            onClick={handleCall}
            disabled={selected.size === 0}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl gap-2"
          >
            <Phone className="w-4 h-4 fill-current" />
            Call Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
