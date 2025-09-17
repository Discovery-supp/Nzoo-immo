import React, { useEffect, useState } from 'react';

type AdminAuditLogProps = {
  actorRoleFilter?: 'all' | 'admin' | 'client' | 'manager';
};

type AuditEntry = {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details?: string;
};

const AdminAuditLog: React.FC<AdminAuditLogProps> = ({ actorRoleFilter = 'all' }) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    // Minimal placeholder: show empty state to unblock build.
    setEntries([]);
    setLoading(false);
  }, [actorRoleFilter]);

  if (loading) {
    return <div className="text-sm text-nzoo-dark/70">Chargement du journal d'audit…</div>;
  }

  if (!entries.length) {
    return (
      <div className="text-sm text-nzoo-dark/70 border border-nzoo-gray/30 rounded-xl p-4 bg-white">
        Aucun événement d'audit à afficher.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-nzoo-gray/30 rounded-xl bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-nzoo-gray/10 text-nzoo-dark">
          <tr>
            <th className="text-left px-4 py-2">Date</th>
            <th className="text-left px-4 py-2">Acteur</th>
            <th className="text-left px-4 py-2">Rôle</th>
            <th className="text-left px-4 py-2">Action</th>
            <th className="text-left px-4 py-2">Détails</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-t border-nzoo-gray/20">
              <td className="px-4 py-2 whitespace-nowrap">{new Date(e.timestamp).toLocaleString()}</td>
              <td className="px-4 py-2">{e.actor}</td>
              <td className="px-4 py-2">{e.role}</td>
              <td className="px-4 py-2">{e.action}</td>
              <td className="px-4 py-2">{e.details || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAuditLog;


