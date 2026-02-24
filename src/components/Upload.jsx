import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Package,
    Video,
    Tag,
    Info,
    Link as LinkIcon,
    Upload as UploadIcon,
    CheckCircle,
    AlertTriangle,
    FileText,
    DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Upload = () => {
    const [type, setType] = useState('app');
    const [dragging, setDragging] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 2000)),
            {
                loading: 'Uploading product...',
                success: 'Product submitted for review!',
                error: 'Error uploading. Please try again.',
            },
            {
                style: {
                    background: 'var(--text-1)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                }
            }
        );
    };

    return (
        <motion.div
            className="upload main"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
        >
            <div className="upload-container glass shadow-lg">
                <div className="section-header">
                    <div>
                        <h2 className="title"><Plus size={24} style={{ display: 'inline', marginRight: 8, verticalAlign: 'bottom' }} /> Submit a Product</h2>
                        <p className="subtitle">Products are reviewed within 24–48 hrs before going live</p>
                    </div>
                </div>

                <div className="upload-types">
                    <button
                        className={`type-btn ${type === 'app' ? 'active' : ''}`}
                        onClick={() => setType('app')}
                    >
                        <Package size={20} />
                        <div>
                            <strong>Digital App / Service</strong>
                            <span>Subscription-based or one-time tool</span>
                        </div>
                    </button>
                    <button
                        className={`type-btn ${type === 'presentation' ? 'active' : ''}`}
                        onClick={() => setType('presentation')}
                    >
                        <Video size={20} />
                        <div>
                            <strong>Yazam Presentation</strong>
                            <span>Live or recorded sales presentation</span>
                        </div>
                    </button>
                </div>

                <form className="upload-form" onSubmit={handleSubmit}>
                    <div className="grid grid--cols-2">
                        <div className="form-group">
                            <label><Tag size={12} /> {type === 'app' ? 'App Name' : 'Presentation Title'} *</label>
                            <input type="text" placeholder={`e.g. My ${type === 'app' ? 'Awesome Tool' : 'Business Plan'}`} required />
                        </div>
                        <div className="form-group">
                            <label><Tag size={12} /> Category *</label>
                            <select required>
                                <option value="">Select category</option>
                                {type === 'app' ? (
                                    <>
                                        <option value="writing">Writing AI</option>
                                        <option value="tools">Tools</option>
                                        <option value="finance">Finance</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="business">Business</option>
                                        <option value="academic">Academic</option>
                                        <option value="tech">Tech</option>
                                    </>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label><Info size={12} /> Description *</label>
                        <textarea rows="4" placeholder="What does your product do?" required></textarea>
                    </div>

                    <div className="grid grid--cols-2">
                        <div className="form-group">
                            <label><LinkIcon size={12} /> {type === 'app' ? 'External URL *' : 'Price (MK) *'}</label>
                            <div className="input-with-icon">
                                {type === 'presentation' && <DollarSign size={14} className="input-icon" />}
                                <input type={type === 'app' ? 'url' : 'number'} placeholder={type === 'app' ? 'https://...' : '0 for free'} required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label><UploadIcon size={12} /> File / Icon</label>
                            <div
                                className={`file-drop ${dragging ? 'dragging' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={(e) => { e.preventDefault(); setDragging(false); }}
                            >
                                <UploadIcon size={24} />
                                <span>Drop or <u>browse</u></span>
                            </div>
                        </div>
                    </div>

                    <div className="form-footer">
                        <p className="note"><AlertTriangle size={14} style={{ marginRight: 6 }} /> By submitting you agree to our <span className="link">Terms of Service</span>.</p>
                        <button type="submit" className="btn btn--primary btn--lg">
                            <CheckCircle size={18} /> Submit for Review
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default Upload;
