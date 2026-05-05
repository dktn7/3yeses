
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BadgeCheck,
  Search,
  Filter,
  Check,
  X,
  Eye,
  FileText,
  User,
  ShieldAlert,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { formatAdminDate } from "@/lib/admin/formatters";
import SmartSearch from "@/components/admin/SmartSearch";
import AdminModal from "@/components/admin/AdminModal";

interface VerificationRequest {
  id: string;
  talentProfileId: string;
  talentProfile: {
    user: {
      name: string;
      email: string;
    };
    verified: boolean;
  };
  type: string;
  status: string;
  documents: string[];
  notes: string | null;
  createdAt: string;
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

    const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/verification/requests?status=${filter}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRequests(data.requests);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setIsLoading(false);
    }
    }, [filter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if(!selectedRequest) return;
    if(action === 'REJECT' && !rejectReason) return toast.error("Please provide a rejection reason");

    try {
        const res = await fetch(`/api/admin/verification/requests/${selectedRequest.id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                action, 
                rejectionReason: action === 'REJECT' ? rejectReason : undefined 
            })
        });

        if(res.ok) {
            toast.success(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
            setSelectedRequest(null);
            setRejectReason("");
            fetchRequests();
        } else {
            toast.error("Failed to update verification status");
        }
    } catch (e) {
        toast.error("Error processing request");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--admin-text)] tracking-tight">Verification Queue</h1>
          <p className="text-[var(--admin-muted)] mt-1 font-medium">Review identity verification requests</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/20 flex items-center gap-2">
                <Clock size={12} />
                <span>Avg Wait: 4.2 hrs</span>
             </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--admin-surface)] p-4 rounded-xl border border-[var(--admin-border)]">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
             {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                 <button 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === status ? 'bg-[var(--admin-primary)] text-white shadow-md' : 'bg-[var(--admin-bg)] text-[var(--admin-muted)] hover:text-[var(--admin-text)]'}`}
                 >
                    {status}
                 </button>
             ))}
        </div>
        
        <div className="w-full md:w-64">
           <SmartSearch 
             placeholder="Search requests..." 
             onSearch={(q) => console.log(q)} 
           />
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
             <div className="col-span-full py-12 text-center text-[var(--admin-muted)] flex flex-col items-center gap-3">
                 <Clock className="animate-spin text-[var(--admin-primary)]" size={32} />
                 <span className="font-medium animate-pulse">Loading queue...</span>
             </div>
          ) : requests.length === 0 ? (
             <div className="col-span-full py-12 text-center text-[var(--admin-muted)] bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] border-dashed">
                 <BadgeCheck size={48} className="mx-auto mb-4 opacity-20" />
                 <p className="font-bold">No requests found</p>
                 <p className="text-sm opacity-60">Try changing the filter</p>
             </div>
          ) : (
             requests.map((req) => (
                 <div key={req.id} className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-5 hover:border-[var(--admin-primary)]/50 transition-colors group relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <FileText size={80} />
                     </div>
                     
                     <div className="flex items-start justify-between mb-4 relative z-10">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-[var(--admin-bg)] flex items-center justify-center border border-[var(--admin-border)] text-[var(--admin-muted)]">
                                 <User size={18} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-[var(--admin-text)]">{req.talentProfile.user.name}</h3>
                                 <p className="text-xs text-[var(--admin-muted)]">{req.talentProfile.user.email}</p>
                             </div>
                         </div>
                         <span className={`
                             px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                             ${req.status === 'PENDING' ? 'bg-blue-500/10 text-blue-500' :
                               req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-500' :
                               'bg-rose-500/10 text-rose-500'}
                         `}>
                             {req.status}
                         </span>
                     </div>

                     <div className="space-y-3 mb-5 relative z-10">
                         <div className="flex items-center justify-between text-xs text-[var(--admin-muted)]">
                             <span>Request Type</span>
                             <span className="font-bold text-[var(--admin-text)]">{req.type}</span>
                         </div>
                         <div className="flex items-center justify-between text-xs text-[var(--admin-muted)]">
                             <span>Submitted</span>
                             <span className="font-bold text-[var(--admin-text)]">{formatAdminDate(new Date(req.createdAt), { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                         </div>
                         <div className="flex items-center justify-between text-xs text-[var(--admin-muted)]">
                             <span>Documents</span>
                             <span className="font-bold text-[var(--admin-text)]">{req.documents.length} Files</span>
                         </div>
                     </div>

                     <button 
                        onClick={() => setSelectedRequest(req)}
                        className="w-full py-2 bg-[var(--admin-bg)] hover:bg-[var(--admin-primary)] hover:text-white border border-[var(--admin-border)] hover:border-[var(--admin-primary)] rounded-lg text-sm font-bold text-[var(--admin-text)] transition-all relative z-10"
                     >
                         Review Details
                     </button>
                 </div>
             ))
          )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <AdminModal 
            isOpen={!!selectedRequest} 
            onClose={() => setSelectedRequest(null)}
            title="Verification Review"
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-[var(--admin-bg)] rounded-lg border border-[var(--admin-border)]">
                     <div className="w-12 h-12 rounded-full bg-[var(--admin-surface)] flex items-center justify-center border border-[var(--admin-border)]">
                         <User size={24} className="text-[var(--admin-muted)]" />
                     </div>
                     <div>
                         <h3 className="font-bold text-lg text-[var(--admin-text)]">{selectedRequest.talentProfile.user.name}</h3>
                         <p className="text-sm text-[var(--admin-muted)]">Request ID: {selectedRequest.id}</p>
                     </div>
                </div>

                <div>
                    <h4 className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider mb-3">Submitted Documents</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {selectedRequest.documents.map((doc, idx) => (
                            <a 
                                key={idx} 
                                href={doc} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-3 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg flex items-center gap-3 hover:border-[var(--admin-primary)] transition-colors group"
                            >
                                <FileText size={20} className="text-[var(--admin-muted)] group-hover:text-[var(--admin-primary)]" />
                                <span className="text-sm font-medium text-[var(--admin-text)]">Document {idx + 1}</span>
                                <Eye size={14} className="ml-auto text-[var(--admin-muted)] opacity-0 group-hover:opacity-100" />
                            </a>
                        ))}
                        {selectedRequest.documents.length === 0 && (
                            <div className="col-span-2 p-4 text-center text-sm text-[var(--admin-muted)] italic bg-[var(--admin-bg)] rounded-lg">
                                No documents attached
                            </div>
                        )}
                    </div>
                </div>

                {selectedRequest.notes && (
                     <div>
                        <h4 className="text-xs font-bold text-[var(--admin-muted)] uppercase tracking-wider mb-2">User Notes</h4>
                        <p className="text-sm text-[var(--admin-text)] bg-[var(--admin-bg)] p-3 rounded-lg border border-[var(--admin-border)]">
                            {selectedRequest.notes}
                        </p>
                    </div>
                )}

                {selectedRequest.status === 'PENDING' && (
                    <div className="pt-4 border-t border-[var(--admin-border)]">
                        <div className="flex gap-3 mb-4">
                             <button 
                                onClick={() => handleAction('APPROVE')}
                                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                             >
                                 <Check size={18} />
                                 Approve
                             </button>
                             <button 
                                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                                onClick={() => {
                                    if(rejectReason) handleAction('REJECT');
                                    else document.getElementById('reject-input')?.focus();
                                }}
                             >
                                 <X size={18} />
                                 Reject
                             </button>
                        </div>
                        <input 
                            id="reject-input"
                            type="text" 
                            placeholder="Reason for rejection (required if rejecting)..."
                            className="w-full bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg px-4 py-2 text-sm text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:border-rose-500 focus:outline-none transition-colors"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </AdminModal>
      )}
    </div>
  );
}
