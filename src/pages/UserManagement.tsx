import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { backendEngine } from '../lib/backendEngine';
import { Users, UserCheck, ShieldAlert, Check, X, Shield, Lock, AlertTriangle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { UserRole } from '../types';

export const UserManagement: React.FC = () => {
  const { state, currentFarm, currentRole, showToast } = useApp();
  const farmId = currentFarm?.id;

  const members = state.farmMembers.filter(m => m.farm_id === farmId);
  const joinRequests = state.joinRequests.filter(r => r.farm_id === farmId);

  const [assignedRoleForAccept, setAssignedRoleForAccept] = useState<Record<string, UserRole>>({});

  const isAdmin = currentRole === 'admin';

  const handleReview = (requestId: string, action: 'accept' | 'reject') => {
    try {
      const assignedRole = assignedRoleForAccept[requestId] || 'viewer';
      backendEngine.reviewJoinRequest(requestId, action, assignedRole);
      showToast(
        action === 'accept'
          ? `So'rov qabul qilindi. A'zoga '${assignedRole}' roli berildi.`
          : `So'rov rad etildi.`,
        action === 'accept' ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRoleChange = (memberId: string, newRole: UserRole) => {
    try {
      backendEngine.updateUserRole(memberId, newRole);
      showToast(`Foydalanuvchi roli '${newRole}' ga o'zgartirildi`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const roleLabels: Record<UserRole, { label: string; desc: string; variant: 'forest' | 'emerald' | 'amber' | 'slate' }> = {
    admin: {
      label: 'Administrator',
      desc: 'To\'liq huquq: a\'zolarni qabul qilish, rollar, audit jurnali, chorva va barcha modullar.',
      variant: 'forest',
    },
    manager: {
      label: 'Menejer',
      desc: 'Chorva hisobi, yem-xashak, moliya va bozor e\'lonlari. Rollarni o\'zgartira olmaydi.',
      variant: 'emerald',
    },
    veterinarian: {
      label: 'Veterinar',
      desc: 'Sog\'liq, emlash va davolash jurnali. Moliyaga va a\'zolar boshqaruviga ruxsati yo\'q.',
      variant: 'amber',
    },
    viewer: {
      label: 'Kuzatuvchi',
      desc: 'Faqat o\'qish huquqi. Hech qanday ma\'lumotni kiritish yoki o\'chirishga ruxsati yo\'q.',
      variant: 'slate',
    },
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Foydalanuvchilar &amp; RBAC Huquqlari</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-Based Access Control: {currentFarm?.display_title || currentFarm?.name} fermasi a'zolari va rollari
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs">
              Sizning rolingiz: <strong className="capitalize">{roleLabels[currentRole]?.label || currentRole}</strong>. A'zolik so'rovlarini qabul qilish va rollarni o'zgartirish faqat <strong>Administrator</strong> tomonidan amalga oshiriladi.
            </p>
          </div>
          <button
            onClick={() => {
              backendEngine.restoreAdminRole();
              showToast("Administratorlik roli muvaffaqiyatli qayta tiklandi!", 'success');
            }}
            className="px-3.5 py-1.5 bg-forest-800 hover:bg-forest-900 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            Administratorlikni tiklash
          </button>
        </div>
      )}

      {/* Pending Join Requests */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Fermaga Qo'shilish So'rovlari</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ferma nomini kiritib so'rov yuborgan foydalanuvchilar (Avtomatik kirish huquqi berilmaydi)
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-forest-950/60 text-slate-700 dark:text-slate-300">
            {joinRequests.filter(r => r.status === 'pending').length} ta kutilmoqda
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-950/60 border-b border-slate-200 dark:border-forest-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Foydalanuvchi</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">So'rov Sanasi</th>
                <th className="py-2.5 px-3">Holat</th>
                {isAdmin && <th className="py-2.5 px-3">Tayinlanadigan Rol</th>}
                {isAdmin && <th className="py-2.5 px-3 text-right">Amallar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {joinRequests.map(req => {
                const isPending = req.status === 'pending';
                const roleChoice = assignedRoleForAccept[req.id] || 'viewer';

                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{req.user_name}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono">{req.user_email}</td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono">
                      {req.requested_at.split('T')[0]}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        size="sm"
                        variant={
                          req.status === 'accepted'
                            ? 'emerald'
                            : req.status === 'rejected'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {req.status === 'pending'
                          ? 'Kutilmoqda'
                          : req.status === 'accepted'
                          ? 'Qabul qilingan'
                          : 'Rad etilgan'}
                      </Badge>
                    </td>

                    {isAdmin && (
                      <td className="py-2.5 px-3">
                        {isPending ? (
                          <select
                            value={roleChoice}
                            onChange={e =>
                              setAssignedRoleForAccept(prev => ({
                                ...prev,
                                [req.id]: e.target.value as UserRole,
                              }))
                            }
                            className="px-2 py-1 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white border border-slate-300 dark:border-forest-800/70 rounded-lg text-xs font-semibold focus:outline-none"
                          >
                            <option value="viewer">Kuzatuvchi</option>
                            <option value="veterinarian">Veterinar</option>
                            <option value="manager">Menejer</option>
                            <option value="admin">Administrator</option>
                          </select>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 capitalize">{req.assigned_role || '-'}</span>
                        )}
                      </td>
                    )}

                    {isAdmin && (
                      <td className="py-2.5 px-3 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReview(req.id, 'accept')}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Qabul qilish
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'reject')}
                              className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold transition flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              Rad etish
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Ko'rib chiqilgan</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {joinRequests.length === 0 && (
            <p className="text-center py-6 text-slate-400 dark:text-slate-500">Hech qanday qo'shilish so'rovi mavjud emas</p>
          )}
        </div>
      </div>

      {/* Active Farm Members */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Ferma A'zolari &amp; Amaldagi Rollar</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-forest-950/60 border-b border-slate-200 dark:border-forest-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Foydalanuvchi</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Qo'shilgan sana</th>
                <th className="py-3 px-4">Amaldagi Rol</th>
                {isAdmin && <th className="py-3 px-4 text-right">Rolni O'zgartirish</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-forest-900/60">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-forest-950/40 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-emerald-300 flex items-center justify-center text-xs font-black">
                      {member.user_name.charAt(0)}
                    </div>
                    <span>{member.user_name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono">{member.user_email}</td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono">{member.joined_at.split('T')[0]}</td>
                  <td className="py-3 px-4">
                    <Badge variant={roleLabels[member.role]?.variant || 'slate'}>
                      {roleLabels[member.role]?.label || member.role}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      {member.user_id === state.currentUser.id ? (
                        <span className="text-[11px] text-forest-700 dark:text-emerald-400 font-semibold italic bg-forest-50 dark:bg-forest-950/60 px-2.5 py-1 rounded-lg border border-forest-200 dark:border-forest-800 select-none">
                          Sizning hisobingiz (O'zgarmas)
                        </span>
                      ) : (
                        <select
                          value={member.role}
                          onChange={e => handleRoleChange(member.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 bg-white dark:bg-[#0B1713] text-slate-900 dark:text-white border border-slate-300 dark:border-forest-800/70 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-forest-600"
                        >
                          <option value="admin">Administrator</option>
                          <option value="manager">Menejer</option>
                          <option value="veterinarian">Veterinar</option>
                          <option value="viewer">Kuzatuvchi</option>
                        </select>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Reference Permissions Matrix Table */}
      <div className="bg-white dark:bg-[#0E1A16] rounded-2xl border border-slate-200/90 dark:border-forest-800/40 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-forest-700 dark:text-emerald-400" />
          Ruxsatlar Matritsasi (RBAC Modeli)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Qat'iy ruxsatlar nazorati va server darajasidagi xavfsizlik tekshiruvlari
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['admin', 'manager', 'veterinarian', 'viewer'] as UserRole[]).map(roleKey => {
            const info = roleLabels[roleKey];
            return (
              <div key={roleKey} className="p-4 rounded-xl border border-slate-200 dark:border-forest-900/60 bg-slate-50/50 dark:bg-[#0A1411]">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={info.variant}>{info.label}</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{info.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
