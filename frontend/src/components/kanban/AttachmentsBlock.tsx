import React, { useState } from 'react';
import { Paperclip, Trash2, File as FileIcon, Image as ImageIcon, Download, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAttachments, uploadAttachment, deleteAttachment, type Attachment } from '../../api/attachmentService';
interface AttachmentsBlockProps {
    cardId: number;
    isViewer?: boolean;
}

const AttachmentsBlock: React.FC<AttachmentsBlockProps> = ({ cardId, isViewer = false }) => {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);

    const { data: attachments = [], isLoading } = useQuery({
        queryKey: ['attachments', cardId],
        queryFn: () => getAttachments(cardId)
    });

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadAttachment(cardId, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attachments', cardId] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        },
        onSettled: () => setIsUploading(false)
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAttachment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attachments', cardId] });
            queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsUploading(true);
            uploadMutation.mutate(e.target.files[0]);
        }
        e.target.value = '';
    };

    const handleDownload = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    const isImage = (type?: string) => type ? type.startsWith('image/') : false;

    return (
        <div className="mb-8">
            <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 relative mb-4">
                <div className="flex items-center space-x-3 w-40 shrink-0">
                    <Paperclip className="w-5 h-5 text-slate-700 shrink-0" />
                    <h3 className="text-lg font-bold text-slate-800 truncate">Attachments</h3>
                </div>
                {!isViewer && (
                    <div className="flex-1">
                        <label className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center space-x-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
                            <span>Add</span>
                            <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading || isViewer} />
                        </label>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="text-slate-500 text-sm">Loading attachments...</div>
            ) : attachments.length === 0 ? (
                <div className="text-slate-500 text-sm">No attachments yet.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {attachments.map(attachment => (
                        <div key={attachment.id} className="flex border border-slate-200 rounded-lg overflow-hidden group hover:border-emerald-300 transition-colors bg-white shadow-sm">
                            <div className="w-24 h-20 flex-shrink-0 bg-slate-100 flex items-center justify-center border-r border-slate-200 overflow-hidden">
                                {isImage(attachment.fileType) ? (
                                    <img src={attachment.fileUrl} alt={attachment.fileName} className="w-full h-full object-cover" />
                                ) : (
                                    <FileIcon className="w-8 h-8 text-slate-400" />
                                )}
                            </div>
                            <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 truncate" title={attachment.fileName}>
                                        {attachment.fileName}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Added {new Date(attachment.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
                                        className="text-xs font-medium text-slate-600 hover:text-emerald-600 flex items-center space-x-1 underline decoration-transparent hover:decoration-emerald-600 transition-all"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                    </button>
                                    {!isViewer && (
                                        <button 
                                            onClick={() => deleteMutation.mutate(attachment.id)}
                                            className="text-xs font-medium text-slate-600 hover:text-rose-600 flex items-center space-x-1 underline decoration-transparent hover:decoration-rose-600 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentsBlock;
